-- === Dynamic Autonomous Escrow (DEB) — Boek VIII Titel 11 ===
-- Realtime risicomandaat per agent: binnen het mandaat handelt de agent
-- volledig autonoom; bij uitputting wordt de transactie niet geweigerd maar
-- in de wachtrij gezet voor asynchrone menselijke validatie (Art. 8.33).
-- De token bucket leeft in Postgres en wordt atomair bijgewerkt via
-- bna_budget_debit (row lock), zodat parallelle aanroepen nooit dubbel
-- kunnen afboeken. Beleid (capaciteit, refill, alpha) leeft in de
-- applicatielaag (server/budget.ts); dit is uitsluitend het mechanisme.

create table if not exists public.bna_budget_state (
  agent_id uuid primary key references public.bna_agents(id) on delete cascade,
  financial_tokens_cents numeric not null default 0 check (financial_tokens_cents >= 0),
  data_tokens_bytes numeric not null default 0 check (data_tokens_bytes >= 0),
  updated_at timestamptz not null default now()
);

alter table public.bna_escrow_transactions
  add column if not exists amount_cents bigint not null default 0,
  add column if not exists payload_bytes bigint not null default 0,
  add column if not exists mandate_at_submission jsonb;

alter table public.bna_escrow_transactions
  drop constraint if exists bna_escrow_transactions_status_check;
alter table public.bna_escrow_transactions
  add constraint bna_escrow_transactions_status_check
  check (status in ('received','blocked_awaiting_consent','blocked_budget_exceeded',
                    'accepted_not_processed','processed','rejected','failed'));

-- Atomaire check-and-debit. Hervulling is continu (token bucket):
--   beschikbaar = least(capaciteit, tokens + verstreken_seconden × refill)
-- De capaciteit wordt per aanroep meegegeven omdat alpha (Vertrouwensscore)
-- tussen aanroepen gewijzigd kan zijn; clampen op de actuele capaciteit
-- voorkomt dat een gedaalde alpha oude, hogere saldi laat voortbestaan.
-- retry_after_seconds is null wanneer hervulling nooit zal volstaan
-- (aanvraag groter dan capaciteit) — dan rest asynchrone validatie.
create or replace function public.bna_budget_debit(
  p_agent_id uuid,
  p_amount_cents numeric,
  p_bytes numeric,
  p_fin_capacity numeric,
  p_fin_refill_per_sec numeric,
  p_data_capacity numeric,
  p_data_refill_per_sec numeric
) returns jsonb
language plpgsql
as $$
declare
  v_now timestamptz := clock_timestamp();
  v_fin numeric;
  v_data numeric;
  v_elapsed numeric;
  v_granted boolean;
  v_fin_wait numeric := 0;
  v_data_wait numeric := 0;
  v_retry numeric;
begin
  insert into public.bna_budget_state (agent_id, financial_tokens_cents, data_tokens_bytes, updated_at)
  values (p_agent_id, p_fin_capacity, p_data_capacity, v_now)
  on conflict (agent_id) do nothing;

  select financial_tokens_cents, data_tokens_bytes,
         extract(epoch from (v_now - updated_at))
    into v_fin, v_data, v_elapsed
    from public.bna_budget_state
   where agent_id = p_agent_id
     for update;

  v_fin  := least(p_fin_capacity,  v_fin  + v_elapsed * p_fin_refill_per_sec);
  v_data := least(p_data_capacity, v_data + v_elapsed * p_data_refill_per_sec);

  v_granted := (p_amount_cents <= v_fin) and (p_bytes <= v_data);

  if v_granted then
    v_fin  := v_fin  - p_amount_cents;
    v_data := v_data - p_bytes;
    v_retry := 0;
  else
    if p_amount_cents > p_fin_capacity or p_bytes > p_data_capacity then
      v_retry := null; -- hervulling volstaat nooit: asynchrone validatie vereist
    else
      if p_amount_cents > v_fin and p_fin_refill_per_sec > 0 then
        v_fin_wait := (p_amount_cents - v_fin) / p_fin_refill_per_sec;
      end if;
      if p_bytes > v_data and p_data_refill_per_sec > 0 then
        v_data_wait := (p_bytes - v_data) / p_data_refill_per_sec;
      end if;
      v_retry := ceil(greatest(v_fin_wait, v_data_wait));
    end if;
  end if;

  update public.bna_budget_state
     set financial_tokens_cents = v_fin,
         data_tokens_bytes = v_data,
         updated_at = v_now
   where agent_id = p_agent_id;

  return jsonb_build_object(
    'granted', v_granted,
    'financial_remaining_cents', floor(v_fin),
    'data_remaining_bytes', floor(v_data),
    'retry_after_seconds', v_retry
  );
end;
$$;
