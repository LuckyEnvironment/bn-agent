-- BN Agent — kernschema (Discovery Registry, certificering, escrow, audit)
-- Alle tabellen dragen het bna_-prefix: dit Supabase-project wordt gedeeld met het
-- AgentMarkt-prototype; het prefix voorkomt naamconflicten (certifications, leads,
-- audit_logs bestaan daar al) en houdt latere fysieke scheiding een datamigratie.

-- === referentietabellen (horizontale groei: sector/capability als data, niet als code) ===

create table if not exists public.bna_sectors (
  code text primary key,
  name_nl text not null,
  name_en text not null,
  risk_weight smallint not null default 0 check (risk_weight between 0 and 25),
  regulations jsonb not null default '[]'::jsonb, -- bijv. ["Wwft","DORA"]
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.bna_capability_categories (
  code text primary key,
  name_nl text not null,
  name_en text not null,
  risk_weight smallint not null default 3 check (risk_weight between 0 and 20),
  created_at timestamptz not null default now()
);

-- === vendors & agents ===

create table if not exists public.bna_vendors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  kvk_number text,
  country text not null default 'NL',
  website text,
  contact_email text,
  auth_user_id uuid references auth.users(id) on delete set null,
  portfolio_reputation smallint not null default 0 check (portfolio_reputation between -10 and 10),
  created_at timestamptz not null default now()
);

create table if not exists public.bna_agents (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  vendor_id uuid not null references public.bna_vendors(id) on delete restrict,
  name text not null,
  description text not null default '',
  version text not null default '1.0.0',
  status text not null default 'draft'
    check (status in ('draft','published','suspended','revoked')),
  distribution_model text not null
    check (distribution_model in ('koop','lease')),
  sector_code text not null references public.bna_sectors(code),
  endpoint_url text,
  well_known_url text, -- /.well-known/agent.json van de lease-agent
  card jsonb not null default '{}'::jsonb,      -- canonieke Agent Card v1.0
  card_hash text,                                -- sha256 over canonieke JSON
  card_signature text,                           -- Ed25519 (JWS compact) over card_hash
  card_signed_at timestamptz,
  eu_ai_act_class text not null default 'minimal'
    check (eu_ai_act_class in ('minimal','limited','high','unacceptable')),
  certified boolean not null default false,
  escrow_supported boolean not null default false,
  -- riskScoring (Boek VIII) — door platform berekend, nooit door vendor gezet
  risk_factor_score smallint check (risk_factor_score between 0 and 100),
  risk_factor_class text check (risk_factor_class in ('laag','midden','hoog')),
  risk_factor_components jsonb,
  trust_score smallint not null default 50 check (trust_score between 0 and 100),
  trust_score_last_calculated timestamptz not null default now(),
  inhuur_tier text check (inhuur_tier in ('A','B','C','D')),
  required_consent_level text not null default 'eenmalig'
    check (required_consent_level in ('geen','eenmalig','drempelgebonden','per_transactie')),
  applicable_articles text[] not null default '{}',
  suspended boolean not null default false,
  suspension_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists bna_agents_sector_idx on public.bna_agents (sector_code);
create index if not exists bna_agents_status_idx on public.bna_agents (status);
create index if not exists bna_agents_filter_idx
  on public.bna_agents (distribution_model, certified, eu_ai_act_class, escrow_supported);
create index if not exists bna_agents_tier_idx on public.bna_agents (inhuur_tier);

create table if not exists public.bna_agent_capabilities (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.bna_agents(id) on delete cascade,
  category_code text not null references public.bna_capability_categories(code),
  name text not null,
  description text not null default '',
  data_categories text[] not null default '{}', -- AVG-datacategorieën
  data_sensitivity text not null default 'none'
    check (data_sensitivity in ('none','personal','special_or_biometric')),
  autonomy_level text not null default 'advisory'
    check (autonomy_level in ('advisory','autonomous_reversible','autonomous_irreversible')),
  created_at timestamptz not null default now()
);

create index if not exists bna_agent_capabilities_agent_idx on public.bna_agent_capabilities (agent_id);
create index if not exists bna_agent_capabilities_cat_idx on public.bna_agent_capabilities (category_code);

-- === certificering (Boek IV/VI) ===

create table if not exists public.bna_certifications (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.bna_agents(id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending','certified','expired','revoked','suspended')),
  certified_by text not null default 'bn_agent', -- bn_agent | notified_body
  notified_body_name text,
  eu_ai_act_class text not null
    check (eu_ai_act_class in ('minimal','limited','high','unacceptable')),
  avg_checklist jsonb not null default '{}'::jsonb, -- AVG 7-puntstoetsing
  issued_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists bna_certifications_agent_idx on public.bna_certifications (agent_id, status);

-- === API-clients (OAuth 2.1 client credentials + RFC 7591 DCR) ===

create table if not exists public.bna_api_clients (
  id uuid primary key default gen_random_uuid(),
  client_id text not null unique,
  client_secret_hash text not null, -- sha256(secret)
  client_name text not null,
  vendor_id uuid references public.bna_vendors(id) on delete set null,
  scopes text[] not null default '{registry:read}',
  access_tier text not null default 'authenticated'
    check (access_tier in ('authenticated','paying')),
  registration_access_token_hash text,
  disabled boolean not null default false,
  created_at timestamptz not null default now()
);

-- === escrow-laag (logisch gescheiden service; live verwerking achter feature flag) ===

create table if not exists public.bna_escrow_transactions (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.bna_agents(id) on delete restrict,
  client_id uuid references public.bna_api_clients(id) on delete set null,
  status text not null default 'received'
    check (status in ('received','blocked_awaiting_consent','accepted_not_processed','processed','rejected','failed')),
  live_processing boolean not null default false, -- alleen true als ESCROW_LIVE_PROCESSING aan staat
  request_meta jsonb not null default '{}'::jsonb, -- metadata, nooit de payload zelf
  payload_ref text, -- verwijzing naar Storage; alleen gevuld bij live verwerking
  consent_approval_id uuid,
  tier_at_submission text check (tier_at_submission in ('A','B','C','D')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists bna_escrow_agent_idx on public.bna_escrow_transactions (agent_id, created_at desc);

-- === toestemmingen (Art. 8.20 — vorm en registratie van toestemming) ===

create table if not exists public.bna_approvals (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.bna_agents(id) on delete restrict,
  client_id uuid references public.bna_api_clients(id) on delete set null,
  escrow_transaction_id uuid references public.bna_escrow_transactions(id) on delete set null,
  approved_by_name text not null,
  approved_by_role text not null,
  approval_scope text not null, -- 'eerste_inhuur' | 'transactie' | 'drempel'
  tier_at_approval text not null check (tier_at_approval in ('A','B','C','D')),
  risk_factor_at_approval smallint,
  trust_score_at_approval smallint,
  created_at timestamptz not null default now()
);

alter table public.bna_escrow_transactions
  add constraint bna_escrow_consent_fk
  foreign key (consent_approval_id) references public.bna_approvals(id) on delete set null;

-- === vertrouwensscore-events (Boek VIII Titel 3) ===

create table if not exists public.bna_trust_events (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.bna_agents(id) on delete cascade,
  component text not null check (component in
    ('certification_history','operational_reliability','escrow_history',
     'vendor_portfolio','incident_history','registry_reviews')),
  delta smallint not null,
  reason text not null,
  created_at timestamptz not null default now()
);

create index if not exists bna_trust_events_agent_idx on public.bna_trust_events (agent_id, created_at desc);

-- === leads ===

create table if not exists public.bna_leads (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  email text not null,
  sector_code text references public.bna_sectors(code),
  message text,
  source text not null default 'website',
  created_at timestamptz not null default now()
);

-- === append-only auditlog (Art. 8.20 lid 2) ===

create table if not exists public.bna_audit_log (
  id bigint generated always as identity primary key,
  occurred_at timestamptz not null default now(),
  actor_type text not null check (actor_type in ('system','api_client','vendor','admin','anonymous')),
  actor_id text,
  action text not null,
  subject_type text not null,
  subject_id text,
  payload jsonb not null default '{}'::jsonb
);

create index if not exists bna_audit_log_subject_idx on public.bna_audit_log (subject_type, subject_id, occurred_at desc);

create or replace function public.bna_audit_log_block_mutation()
returns trigger language plpgsql as $$
begin
  raise exception 'bna_audit_log is append-only (Handboek Art. 8.20 lid 2)';
end;
$$;

drop trigger if exists bna_audit_log_no_update on public.bna_audit_log;
create trigger bna_audit_log_no_update
  before update or delete on public.bna_audit_log
  for each row execute function public.bna_audit_log_block_mutation();

-- === updated_at triggers ===

create or replace function public.bna_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists bna_agents_touch on public.bna_agents;
create trigger bna_agents_touch before update on public.bna_agents
  for each row execute function public.bna_touch_updated_at();

drop trigger if exists bna_escrow_touch on public.bna_escrow_transactions;
create trigger bna_escrow_touch before update on public.bna_escrow_transactions
  for each row execute function public.bna_touch_updated_at();

-- === Row Level Security ===
-- Uitgangspunt: default deny. Publiek (anon) leest uitsluitend gepubliceerde
-- registry-data; schrijven loopt via de API-laag met service role.

alter table public.bna_sectors enable row level security;
alter table public.bna_capability_categories enable row level security;
alter table public.bna_vendors enable row level security;
alter table public.bna_agents enable row level security;
alter table public.bna_agent_capabilities enable row level security;
alter table public.bna_certifications enable row level security;
alter table public.bna_api_clients enable row level security;
alter table public.bna_escrow_transactions enable row level security;
alter table public.bna_approvals enable row level security;
alter table public.bna_trust_events enable row level security;
alter table public.bna_leads enable row level security;
alter table public.bna_audit_log enable row level security;

-- referentiedata: publiek leesbaar
drop policy if exists bna_sectors_public_read on public.bna_sectors;
create policy bna_sectors_public_read on public.bna_sectors
  for select using (active = true);

drop policy if exists bna_capability_categories_public_read on public.bna_capability_categories;
create policy bna_capability_categories_public_read on public.bna_capability_categories
  for select using (true);

-- gepubliceerde agents: publiek leesbaar (veldfiltering gebeurt in de API-laag)
drop policy if exists bna_agents_public_read on public.bna_agents;
create policy bna_agents_public_read on public.bna_agents
  for select using (status = 'published');

drop policy if exists bna_agent_capabilities_public_read on public.bna_agent_capabilities;
create policy bna_agent_capabilities_public_read on public.bna_agent_capabilities
  for select using (
    exists (
      select 1 from public.bna_agents a
      where a.id = agent_id and a.status = 'published'
    )
  );

drop policy if exists bna_certifications_public_read on public.bna_certifications;
create policy bna_certifications_public_read on public.bna_certifications
  for select using (
    exists (
      select 1 from public.bna_agents a
      where a.id = agent_id and a.status = 'published'
    )
  );

-- vendors: alleen naam/land publiek relevant; rijen van gepubliceerde agents leesbaar
drop policy if exists bna_vendors_public_read on public.bna_vendors;
create policy bna_vendors_public_read on public.bna_vendors
  for select using (
    exists (
      select 1 from public.bna_agents a
      where a.vendor_id = bna_vendors.id and a.status = 'published'
    )
  );

-- leads: anon mag alleen invoegen, nooit lezen
drop policy if exists bna_leads_public_insert on public.bna_leads;
create policy bna_leads_public_insert on public.bna_leads
  for insert with check (true);

-- bna_api_clients, bna_escrow_transactions, bna_approvals, bna_trust_events,
-- bna_audit_log: geen policies voor anon/authenticated = alleen service role.
