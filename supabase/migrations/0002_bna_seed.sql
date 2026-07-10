-- BN Agent — referentiedata (gewichten conform Handboek Boek VIII, Art. 8.4)
-- plus voorbeeldagents voor de registry-preview (demo-data, fictieve vendors).

insert into public.bna_sectors (code, name_nl, name_en, risk_weight, regulations) values
  ('financial_services', 'Financiële dienstverlening', 'Financial services', 25, '["Wwft","DORA","EU AI Act"]'),
  ('healthcare',         'Zorg',                        'Healthcare',         25, '["AVG art. 9","MDR","EU AI Act"]'),
  ('insurance',          'Verzekeringen',               'Insurance',          18, '["Solvency II","EU AI Act"]'),
  ('hr',                 'HR & werving',                'HR & recruitment',   18, '["AVG","EU AI Act bijlage III"]'),
  ('legal',              'Juridisch',                   'Legal',              18, '["AVG","Advocatenwet"]'),
  ('compliance',         'Compliance',                  'Compliance',         18, '["Wwft","DORA"]'),
  ('real_estate',        'Vastgoed',                    'Real estate',        10, '["Wwft (poortwachters)"]'),
  ('logistics',          'Logistiek',                   'Logistics',          10, '[]'),
  ('public_sector',      'Publieke sector',             'Public sector',      10, '["EU AI Act bijlage III","Awb"]'),
  ('general',            'Algemeen',                    'General',             0, '[]')
on conflict (code) do update set
  name_nl = excluded.name_nl, name_en = excluded.name_en,
  risk_weight = excluded.risk_weight, regulations = excluded.regulations;

insert into public.bna_capability_categories (code, name_nl, name_en, risk_weight) values
  ('identity_verification', 'Identiteitsverificatie',  'Identity verification', 20),
  ('aml_compliance',        'AML/PEP-screening',        'AML compliance',        20),
  ('risk_assessment',       'Risicobeoordeling',        'Risk assessment',       20),
  ('legal_review',          'Juridische review',        'Legal review',          14),
  ('financial_analysis',    'Financiële analyse',       'Financial analysis',    14),
  ('contract_processing',   'Contractverwerking',       'Contract processing',   14),
  ('document_analysis',     'Documentanalyse',          'Document analysis',      8),
  ('data_validation',       'Datavalidatie',            'Data validation',        8),
  ('classification',        'Classificatie',            'Classification',         8),
  ('extraction',            'Extractie',                'Extraction',             8),
  ('summarization',         'Samenvatting',             'Summarization',          3),
  ('translation',           'Vertaling',                'Translation',            3),
  ('scheduling',            'Planning',                 'Scheduling',             3),
  ('customer_support',      'Klantenservice',           'Customer support',       3)
on conflict (code) do update set
  name_nl = excluded.name_nl, name_en = excluded.name_en, risk_weight = excluded.risk_weight;

-- === demo-vendors (fictief) ===

insert into public.bna_vendors (id, name, kvk_number, country, website, contact_email) values
  ('a0000000-0000-4000-8000-000000000001', 'Fides Compliance Tech B.V. (demo)', '00000001', 'NL', 'https://example.com/fides', 'demo@bnagent.nl'),
  ('a0000000-0000-4000-8000-000000000002', 'LexiFlow Legal AI (demo)',          '00000002', 'NL', 'https://example.com/lexiflow', 'demo@bnagent.nl'),
  ('a0000000-0000-4000-8000-000000000003', 'Datastroom Solutions (demo)',       '00000003', 'NL', 'https://example.com/datastroom', 'demo@bnagent.nl')
on conflict (id) do nothing;

-- === demo-agents ===
-- Risicofactoren handmatig berekend conform Art. 8.4/8.5; de applicatielaag
-- herberekent deze identiek (lib/risk.ts) bij elke publicatie.

insert into public.bna_agents
  (id, slug, vendor_id, name, description, version, status, distribution_model, sector_code,
   endpoint_url, well_known_url, eu_ai_act_class, certified, escrow_supported,
   risk_factor_score, risk_factor_class, risk_factor_components,
   trust_score, inhuur_tier, required_consent_level, applicable_articles)
values
  -- 1. KYC-verificatieagent — het voorbeeld uit Boek VIII (RF 90, TS 50, Tier C)
  ('b0000000-0000-4000-8000-000000000001', 'kyc-verificatieagent',
   'a0000000-0000-4000-8000-000000000001',
   'KYC-verificatieagent',
   'Verifieert identiteit van nieuwe cliënten aan de hand van identiteitsdocumenten en biometrische matching. Adviseert; een mens beslist bij afwijzing.',
   '1.2.0', 'published', 'lease', 'financial_services',
   'https://agents.example.com/kyc/v1', 'https://agents.example.com/.well-known/agent.json',
   'high', true, true,
   90, 'hoog', '{"sector":25,"euAiActClass":30,"capabilityCategory":20,"dataSensitivity":15,"autonomyLevel":0}',
   50, 'C', 'drempelgebonden',
   array['Art. 8.12 lid 3','Art. 8.15 lid 2','Art. 8.17','Art. 8.18','Art. 8.20']),

  -- 2. AML/PEP-screeningsagent (RF 88, TS 50, Tier C)
  ('b0000000-0000-4000-8000-000000000002', 'aml-pep-screeningsagent',
   'a0000000-0000-4000-8000-000000000001',
   'AML/PEP-screeningsagent',
   'Screent cliënten en transacties tegen sanctielijsten en PEP-registers conform Wwft. Markeert hits voor menselijke beoordeling; kan voorlopige blokkering omkeerbaar doorvoeren.',
   '2.0.1', 'published', 'lease', 'financial_services',
   'https://agents.example.com/aml/v1', 'https://agents.example.com/.well-known/agent.json',
   'high', true, true,
   88, 'hoog', '{"sector":25,"euAiActClass":30,"capabilityCategory":20,"dataSensitivity":8,"autonomyLevel":5}',
   50, 'C', 'drempelgebonden',
   array['Art. 8.12 lid 3','Art. 8.15 lid 2','Art. 8.17','Art. 8.18','Art. 8.20']),

  -- 3. Contractanalyse-agent (RF 55, TS 72 → Tier A)
  ('b0000000-0000-4000-8000-000000000003', 'contractanalyse-agent',
   'a0000000-0000-4000-8000-000000000002',
   'Contractanalyse-agent',
   'Analyseert commerciële contracten op risicoclausules, afwijkingen van standaardposities en ontbrekende bepalingen. Levert een gestructureerd reviewrapport.',
   '3.1.0', 'published', 'lease', 'legal',
   'https://agents.example.com/contract/v1', 'https://agents.example.com/.well-known/agent.json',
   'limited', true, true,
   55, 'midden', '{"sector":18,"euAiActClass":15,"capabilityCategory":14,"dataSensitivity":8,"autonomyLevel":0}',
   72, 'A', 'geen',
   array['Art. 8.12 lid 1','Art. 8.14','Art. 8.17']),

  -- 4. Juridische review-agent (RF 55, TS 50, Tier B)
  ('b0000000-0000-4000-8000-000000000004', 'juridische-review-agent',
   'a0000000-0000-4000-8000-000000000002',
   'Juridische review-agent',
   'Voert eerstelijns juridische review uit op processtukken en adviesmemo''s; signaleert jurisprudentie-afwijkingen. Adviseert uitsluitend.',
   '1.0.0', 'published', 'lease', 'legal',
   'https://agents.example.com/legalreview/v1', 'https://agents.example.com/.well-known/agent.json',
   'limited', true, false,
   55, 'midden', '{"sector":18,"euAiActClass":15,"capabilityCategory":14,"dataSensitivity":8,"autonomyLevel":0}',
   50, 'B', 'eenmalig',
   array['Art. 8.12 lid 2','Art. 8.15 lid 1','Art. 8.17']),

  -- 5. Document-extractie-agent (RF 13, TS 78, Tier A, Koop)
  ('b0000000-0000-4000-8000-000000000005', 'document-extractie-agent',
   'a0000000-0000-4000-8000-000000000003',
   'Document-extractie-agent',
   'Extraheert gestructureerde velden uit facturen, orders en vrachtbrieven. Draait on-premise (Koop-distributie), verwerkt geen persoonsgegevens.',
   '4.2.3', 'published', 'koop', 'general',
   null, null,
   'minimal', true, false,
   13, 'laag', '{"sector":0,"euAiActClass":0,"capabilityCategory":8,"dataSensitivity":0,"autonomyLevel":5}',
   78, 'A', 'geen',
   array['Art. 8.12 lid 1','Art. 8.14','Art. 8.17']),

  -- 6. HR-screeningsagent (RF 76, TS 38 → Tier D; certificering nog in behandeling)
  ('b0000000-0000-4000-8000-000000000006', 'hr-screeningsagent',
   'a0000000-0000-4000-8000-000000000003',
   'HR-screeningsagent',
   'Beoordeelt sollicitaties en stelt een shortlist voor. EU AI Act bijlage III-toepassing (werving); vereist per transactie menselijke goedkeuring.',
   '0.9.0', 'published', 'lease', 'hr',
   'https://agents.example.com/hr/v1', 'https://agents.example.com/.well-known/agent.json',
   'high', false, false,
   76, 'hoog', '{"sector":18,"euAiActClass":30,"capabilityCategory":20,"dataSensitivity":8,"autonomyLevel":0}',
   38, 'D', 'per_transactie',
   array['Art. 8.12 lid 4','Art. 8.16 lid 1','Art. 8.17','Art. 8.18','Art. 8.19','Art. 8.20'])
on conflict (id) do nothing;

-- === capabilities per agent ===

insert into public.bna_agent_capabilities
  (agent_id, category_code, name, description, data_categories, data_sensitivity, autonomy_level)
values
  ('b0000000-0000-4000-8000-000000000001', 'identity_verification', 'Identiteitsdocumentverificatie',
   'Controleert echtheid van identiteitsdocumenten en voert biometrische gezichtsmatch uit.',
   array['identificatiegegevens','biometrische gegevens'], 'special_or_biometric', 'advisory'),
  ('b0000000-0000-4000-8000-000000000002', 'aml_compliance', 'Sanctie- en PEP-screening',
   'Doorzoekt sanctielijsten en PEP-registers; markeert hits met bronvermelding.',
   array['identificatiegegevens','financiële gegevens'], 'personal', 'autonomous_reversible'),
  ('b0000000-0000-4000-8000-000000000003', 'contract_processing', 'Contractrisico-analyse',
   'Detecteert risicoclausules en afwijkingen van vastgestelde standaardposities.',
   array['contactgegevens','contractdata'], 'personal', 'advisory'),
  ('b0000000-0000-4000-8000-000000000004', 'legal_review', 'Eerstelijns juridische review',
   'Reviewt processtukken op consistentie, verwijzingen en jurisprudentie.',
   array['contactgegevens','dossiergegevens'], 'personal', 'advisory'),
  ('b0000000-0000-4000-8000-000000000005', 'extraction', 'Veldextractie logistieke documenten',
   'Extraheert factuurnummers, bedragen en regelitems uit PDF en scans.',
   array[]::text[], 'none', 'autonomous_reversible'),
  ('b0000000-0000-4000-8000-000000000006', 'risk_assessment', 'Kandidaatbeoordeling',
   'Scoort sollicitaties tegen functieprofiel en stelt shortlist voor.',
   array['identificatiegegevens','arbeidsverleden'], 'personal', 'advisory')
on conflict do nothing;

-- === certificeringen ===

insert into public.bna_certifications
  (agent_id, status, certified_by, notified_body_name, eu_ai_act_class, avg_checklist, issued_at, expires_at)
values
  ('b0000000-0000-4000-8000-000000000001', 'certified', 'notified_body', 'Aangemelde instantie NB-0000 (demo)', 'high',
   '{"grondslag":true,"doelbinding":true,"dataminimalisatie":true,"bewaartermijn":true,"beveiliging":true,"rechten_betrokkenen":true,"verwerkersovereenkomst":true}',
   now() - interval '30 days', now() + interval '335 days'),
  ('b0000000-0000-4000-8000-000000000002', 'certified', 'notified_body', 'Aangemelde instantie NB-0000 (demo)', 'high',
   '{"grondslag":true,"doelbinding":true,"dataminimalisatie":true,"bewaartermijn":true,"beveiliging":true,"rechten_betrokkenen":true,"verwerkersovereenkomst":true}',
   now() - interval '60 days', now() + interval '305 days'),
  ('b0000000-0000-4000-8000-000000000003', 'certified', 'bn_agent', null, 'limited',
   '{"grondslag":true,"doelbinding":true,"dataminimalisatie":true,"bewaartermijn":true,"beveiliging":true,"rechten_betrokkenen":true,"verwerkersovereenkomst":true}',
   now() - interval '120 days', now() + interval '245 days'),
  ('b0000000-0000-4000-8000-000000000004', 'certified', 'bn_agent', null, 'limited',
   '{"grondslag":true,"doelbinding":true,"dataminimalisatie":true,"bewaartermijn":true,"beveiliging":true,"rechten_betrokkenen":true,"verwerkersovereenkomst":true}',
   now() - interval '14 days', now() + interval '351 days'),
  ('b0000000-0000-4000-8000-000000000005', 'certified', 'bn_agent', null, 'minimal',
   '{"grondslag":true,"doelbinding":true,"dataminimalisatie":true,"bewaartermijn":true,"beveiliging":true,"rechten_betrokkenen":true,"verwerkersovereenkomst":true}',
   now() - interval '200 days', now() + interval '165 days'),
  ('b0000000-0000-4000-8000-000000000006', 'pending', 'bn_agent', null, 'high',
   '{"grondslag":true,"doelbinding":true,"dataminimalisatie":false,"bewaartermijn":true,"beveiliging":true,"rechten_betrokkenen":false,"verwerkersovereenkomst":true}',
   null, null)
on conflict do nothing;

-- === vertrouwensscore-events (onderbouwing van afwijkende scores) ===

insert into public.bna_trust_events (agent_id, component, delta, reason) values
  ('b0000000-0000-4000-8000-000000000003', 'certification_history', 8,  'Twee opeenvolgende hercertificeringen zonder bevindingen'),
  ('b0000000-0000-4000-8000-000000000003', 'operational_reliability', 6, 'SLA-uptime 99,97% over 12 maanden'),
  ('b0000000-0000-4000-8000-000000000003', 'escrow_history', 8, '400+ escrow-transacties, geschillenratio 0'),
  ('b0000000-0000-4000-8000-000000000005', 'certification_history', 10, 'Drie hercertificeringen zonder bevindingen'),
  ('b0000000-0000-4000-8000-000000000005', 'operational_reliability', 8, 'SLA-uptime 99,99% over 24 maanden'),
  ('b0000000-0000-4000-8000-000000000005', 'escrow_history', 10, '1.200+ transacties zonder incident'),
  ('b0000000-0000-4000-8000-000000000006', 'incident_history', -12, 'Gemeld datalek in testomgeving (Q1), afgehandeld')
on conflict do nothing;
