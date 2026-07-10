# BN Agent — platform

Gecertificeerde infrastructuur voor agent-interoperabiliteit: Discovery Registry
("DNS voor AI-agents"), verificatieprotocol, escrow-laag en het Handboek Agent
Communicatieprotocol (Boeken I–VIII).

## Stack

- Next.js (App Router, TypeScript) op Vercel; alle publieke read-endpoints dragen
  CDN-cacheheaders (`s-maxage`), schrijfpaden gaan altijd direct naar Supabase
- Supabase (eu-west-1, project `txozgrstheetzxeglicu`): Postgres + RLS
- REST API versioned onder `/v1`, OpenAPI 3.1 op `/openapi.json`, stateless
  (JWT-tokens dragen volledige context)
- MCP-server op `/v1/mcp` — zelfde businesslogica (`server/*`), geen duplicatie

## Structuur

```
app/            pagina's (landing, registry, handboek, developers) + routes
  v1/           REST API (registry, oauth, escrow, leads, handboek) + MCP
  .well-known/  agent.json (A2A-conventie) en jwks.json (attestatie-verificatie)
components/     designsysteem-componenten (patch-panel motief, nav, footer)
lib/            domeinlaag: risk-engine (Boek VIII), canonieke hash, signing,
                Agent Card-schema + validatie, handboekdata, veldzichtbaarheid
server/         businesslogica: registry, escrow, lease-calls, auth, audit
supabase/       migraties (via Supabase MCP toegepast op het project)
scripts/        rebuild-cards.ts — herbouwt/ondertekent cards met dezelfde libcode
```

## Beslissingen (vastgelegd)

1. **`bna_`-tabelprefix.** Het Supabase-project wordt gedeeld met het
   AgentMarkt-prototype (o.a. `certifications`, `leads`, `audit_logs` bestonden
   al). Het prefix voorkomt conflicten en houdt latere fysieke scheiding een
   datamigratie in plaats van een herontwerp.
2. **Boek VIII blijft zelfstandig.** Verankerd in de I–VI-structuur via
   Boek II Titel 3 (Art. 2.7–2.8), Boek IV Titel 2 (Art. 4.4–4.5) en Boek V
   (Art. 5.2–5.7, gekoppeld aan `humanOversightMeasures`).
3. **Agent Card Standaard v1.0** is gereconstrueerd uit de veldverwijzingen in
   Boek VIII plus A2A v1.0-uitlijning (de bijlage zelf zat niet in de map);
   canoniek schema: `lib/schemas/agent-card.v1.json`.
4. **riskScoring is uitsluitend platform-berekend** (Art. 8.30 lid 2): invoer
   van vendors voor dit blok wordt genegeerd en server-side herberekend.
5. **Sectoren en capability-categorieën zijn data**, geen code: nieuwe sectoren/
   categorieën (en hun risicogewichten) worden via de registry toegevoegd zonder
   schema- of handboekwijziging.

## Veiligheidsklep

`ESCROW_LIVE_PROCESSING=false` (default): escrow-verzoeken worden aangenomen,
getierd (Tier A–D) en append-only gelogd, maar payloads met cliëntgevoelige of
gereguleerde data worden categorisch geweigerd. Aanzetten is een expliciete
productiebeslissing nadat het escrow-hostingmodel (Boek VII, gereserveerd) is
vastgesteld — niet door de codebase te nemen.

## Omgeving

Kopieer `.env.example` naar `.env.local` en vul aan:

- `SUPABASE_SERVICE_ROLE_KEY` — dashboard > Settings > API. Zonder deze sleutel
  werken alle leespaden; schrijfpaden (publiceren, escrow, clientregistratie)
  antwoorden 503 met een duidelijke melding.
- `BNA_SIGNING_PRIVATE_KEY` / `BNA_SIGNING_PUBLIC_KEY` — Ed25519 (PKCS8/SPKI,
  PEM, `\n`-escaped). Dev-sleutelpaar staat lokaal; roteer voor productie.

## Draaien

```
pnpm install
pnpm build && pnpm start
```

Smoke: `GET /v1/registry/agents`, `GET /v1/registry/agents/{slug}/verify`
(attestatie onafhankelijk verifieerbaar tegen `/.well-known/jwks.json`),
MCP: `POST /v1/mcp` (tools: find_agents, get_agent_card, verify_agent,
list_capabilities, call_lease_agent, submit_escrow_request).
