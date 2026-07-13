// Auto-ported from bn-agent-console/assets/audit-data.js (sample WORM audit trail).
// Demo data — no live audit backend yet. The hash chain is verified client-side
// against: entry_hash = SHA-256(transaction_id | timestamp | prev_entry_hash||'genesis').

export type AuditEntry = {
  log_header: { timestamp: string; transaction_id: string; session_id: string; environment: string };
  identities: { organization_id: string; user_id: string; user_role: string; agent: { agent_id: string; version: string; code_hash: string } };
  compliance_integrity: { ai_act_risk_category: string; pii_masking_applied: boolean; pii_masked_fields: string[]; dora_incident_status: string };
  system_integrity: { response_time_ms: number; token_anomaly_detected: boolean; error_count: number };
  human_in_the_loop: { hitl_gate_triggered: boolean };
  integrity_chain: { entry_hash: string; prev_entry_hash: string | null };
};

export const BN_AUDIT_LOG = ([
  {
    "log_header": {
      "timestamp": "2026-07-08T09:12:04.310Z",
      "transaction_id": "tx-baa-2026-8838711",
      "session_id": "sess-2201-cd11-aa07",
      "environment": "production"
    },
    "identities": {
      "organization_id": "afm-licence-11902",
      "user_id": "dealteam-m.devries@amstelcapital.nl",
      "user_role": "Investment Analyst",
      "agent": {
        "agent_id": "bna:agent:marketdata-031",
        "version": "1.4.0",
        "code_hash": "e2b7f98f635c8fd438b456a0250ff9bb823bbaa7338438104cdf86e5e60155ff"
      }
    },
    "data_lineage": {
      "input_sources": [
        {
          "source_type": "api",
          "provider": "Euronext-marktdatafeed",
          "connector_id": "bnc:connector:generic-rest",
          "connector_manifest_hash": "7411f69bb4f0e0218bc483fec9054d08c976c249dbc8553a5fdbed51d729cfc3",
          "endpoint": "/md/v2/series/AEX/close",
          "request_timestamp": "2026-07-08T09:12:03.180Z",
          "response_hash": "4c1e9a2277d05b1f"
        }
      ],
      "ai_reasoning": {
        "base_model": "n.v.t. — regelgebaseerde datalevering (geen LLM in het leveringspad)",
        "prompt_tokens": 0,
        "completion_tokens": 0,
        "confidence_score": 1,
        "chain_of_thought": "Escrow-levering aan bna:agent:trade-recap-011: koersreeks AEX (30 dagen slotkoersen) opgehaald bij Euronext, genormaliseerd naar ISO-8601, response-hash berekend en bronattributie toegevoegd. Gebruikslimiet escrow-contract gecontroleerd: 214/1000 leveringen deze maand."
      }
    },
    "human_in_the_loop": {
      "hitl_gate_triggered": false
    },
    "compliance_integrity": {
      "ai_act_risk_category": "minimal_risk",
      "pii_masking_applied": false,
      "pii_masked_fields": [],
      "dora_incident_status": "nominal"
    },
    "system_integrity": {
      "response_time_ms": 412,
      "token_anomaly_detected": false,
      "error_count": 0,
      "errors": []
    },
    "integrity_chain": {
      "entry_hash": "5fb65b6a2f6a280d4875237a49c8f972c024edc7e6446353c2d6ed1f6700ea83",
      "prev_entry_hash": null
    }
  },
  {
    "log_header": {
      "timestamp": "2026-07-08T14:31:22.940Z",
      "transaction_id": "tx-baa-2026-8838902",
      "session_id": "sess-2214-ef42-bb19",
      "environment": "production"
    },
    "identities": {
      "organization_id": "afm-licence-11902",
      "user_id": "dealteam-m.devries@amstelcapital.nl",
      "user_role": "Investment Analyst",
      "agent": {
        "agent_id": "bna:agent:trade-recap-011",
        "version": "3.1.4",
        "code_hash": "58ffc34d89be9671e582b81ad6eac6b0092309140eaaffad6bbf678620bae1b6"
      }
    },
    "data_lineage": {
      "input_sources": [
        {
          "source_type": "document",
          "file_name": "SPA_Project_Delta_execution_version.pdf",
          "storage_location": "secure-enclave://tenant-11902/deal-3341",
          "file_hash": "9b2f11ac40d3e8c1"
        },
        {
          "source_type": "escrow",
          "provider": "bna:agent:marketdata-031",
          "request_timestamp": "2026-07-08T09:12:04.310Z",
          "response_hash": "4c1e9a2277d05b1f"
        }
      ],
      "ai_reasoning": {
        "base_model": "anthropic.claude-sonnet-4-6 (AWS Bedrock, eu-central-1)",
        "prompt_tokens": 21440,
        "completion_tokens": 1290,
        "confidence_score": 0.91,
        "chain_of_thought": "Stap 1: dealstructuur geëxtraheerd uit SPA art. 2.1 (koopprijs €48.5M, locked box per 31-12-2025). Stap 2: tegenpartijveld 'Delta Holding Coöperatief U.A.' herkend op p.1 en p.84 met afwijkende spelling — confidence 0.91, onder de drempel van 0.95. Stap 3: HITL-gate geactiveerd voor het tegenpartijveld; overige 22 velden boven drempel."
      }
    },
    "human_in_the_loop": {
      "hitl_gate_triggered": true,
      "gate_type": "low-confidence-field-review",
      "frozen_timestamp": "2026-07-08T14:31:24.000Z",
      "action_timestamp": "2026-07-08T14:33:41.000Z",
      "review_duration_seconds": 137,
      "decision": "APPROVED",
      "digital_signature_hash": "sig-3fa8c1d90e7b6254-devries"
    },
    "compliance_integrity": {
      "ai_act_risk_category": "limited_risk",
      "pii_masking_applied": true,
      "pii_masked_fields": [
        "namen_natuurlijke_personen",
        "contactgegevens"
      ],
      "dora_incident_status": "nominal"
    },
    "system_integrity": {
      "response_time_ms": 8720,
      "token_anomaly_detected": false,
      "error_count": 0,
      "errors": []
    },
    "integrity_chain": {
      "entry_hash": "09a443ae957f7b1399538346d3c35da997546975f74dab07e8908a30a1677748",
      "prev_entry_hash": "5fb65b6a2f6a280d4875237a49c8f972c024edc7e6446353c2d6ed1f6700ea83"
    }
  },
  {
    "log_header": {
      "timestamp": "2026-07-09T10:05:11.020Z",
      "transaction_id": "tx-baa-2026-8839017",
      "session_id": "sess-2290-aa17-cc44",
      "environment": "production"
    },
    "identities": {
      "organization_id": "afm-licence-208871",
      "user_id": "compliance-s.bakker@kantoor-noord.nl",
      "user_role": "Wwft Compliance Officer",
      "agent": {
        "agent_id": "bna:agent:kyc-screen-004",
        "version": "2.3.1",
        "code_hash": "f9e10e3b13461f97adbb5186fe9808944e6b48febcf955c42ad4d4b6718d2d44"
      }
    },
    "data_lineage": {
      "input_sources": [
        {
          "source_type": "api",
          "provider": "KVK API",
          "connector_id": "bnc:connector:kvk-handelsregister",
          "connector_manifest_hash": "39fa280d0f194f39444987565808a1d55e0c77b05cb710163c6812113db885c7",
          "endpoint": "/v2/companies/93412208",
          "request_timestamp": "2026-07-09T10:05:08.400Z",
          "response_hash": "e77120bc53aa90d4"
        },
        {
          "source_type": "api",
          "provider": "Dow Jones sanctielijsten (EU/UN/OFAC)",
          "endpoint": "/screening/v3/match",
          "request_timestamp": "2026-07-09T10:05:09.910Z",
          "response_hash": "10ff3e8b6c22d9a5"
        }
      ],
      "ai_reasoning": {
        "base_model": "anthropic.claude-sonnet-4-6 (AWS Bedrock, eu-central-1)",
        "prompt_tokens": 9310,
        "completion_tokens": 640,
        "confidence_score": 0.88,
        "chain_of_thought": "Stap 1: KVK-uittreksel opgehaald; bestuurder [GEMASKEERD-1] geïdentificeerd. Stap 2: screening tegen EU/UN/OFAC-lijsten leverde één naamsmatch (fuzzy score 0.83) op de EU-lijst, lijstversie 2026-07-07. Stap 3: geboortejaar en nationaliteit wijken af van de lijstvermelding — waarschijnlijk vals-positief, maar sanctiehit dus verplichte HITL-gate. Stap 4: dossier bevroren en ter beoordeling aangeboden."
      }
    },
    "human_in_the_loop": {
      "hitl_gate_triggered": true,
      "gate_type": "sanctions-hit-release",
      "frozen_timestamp": "2026-07-09T10:05:12.000Z",
      "action_timestamp": "2026-07-09T10:19:47.000Z",
      "review_duration_seconds": 875,
      "decision": "APPROVED",
      "digital_signature_hash": "sig-8d21f4a7c3e09b16-bakker"
    },
    "compliance_integrity": {
      "ai_act_risk_category": "high_risk",
      "pii_masking_applied": true,
      "pii_masked_fields": [
        "bsn",
        "namen_natuurlijke_personen",
        "geboortedatum"
      ],
      "dora_incident_status": "nominal"
    },
    "system_integrity": {
      "response_time_ms": 5230,
      "token_anomaly_detected": false,
      "error_count": 0,
      "errors": []
    },
    "integrity_chain": {
      "entry_hash": "5059d9982be5b50d05453f14db65dee82eb85798e0c88e3b3582f18e3ee391ee",
      "prev_entry_hash": "09a443ae957f7b1399538346d3c35da997546975f74dab07e8908a30a1677748"
    }
  },
  {
    "log_header": {
      "timestamp": "2026-07-09T11:47:53.780Z",
      "transaction_id": "tx-baa-2026-8839120",
      "session_id": "sess-2301-bd77-dd82",
      "environment": "production"
    },
    "identities": {
      "organization_id": "afm-licence-334409",
      "user_id": "krediet-p.vandijk@noordbank.nl",
      "user_role": "Senior Kredietacceptant",
      "agent": {
        "agent_id": "bna:agent:credit-assess-007",
        "version": "1.8.0",
        "code_hash": "0a96fef77476a3e8e4fdfec683afcd2b871c7c07ca6c8c1155beb937087e2d8e"
      }
    },
    "data_lineage": {
      "input_sources": [
        {
          "source_type": "document",
          "file_name": "Jaarrekening_2025_Bakkerij_De_Molen.xbrl",
          "storage_location": "secure-enclave://tenant-334409/aanvraag-7719",
          "file_hash": "c4d09e17ab55f230"
        },
        {
          "source_type": "api",
          "provider": "PSD2-rekeninginformatie (AISP)",
          "endpoint": "/ais/v1/accounts/transactions",
          "request_timestamp": "2026-07-09T11:47:20.150Z",
          "response_hash": "77b1c94d02e6f8a3"
        }
      ],
      "ai_reasoning": {
        "base_model": "anthropic.claude-sonnet-4-6 (AWS Bedrock, eu-central-1) + XGBoost-scoringsmodel v4.2",
        "prompt_tokens": 17820,
        "completion_tokens": 950,
        "confidence_score": 0.86,
        "chain_of_thought": "Stap 1: kasstroomdekking berekend uit CAMT-transacties (DSCR 1.31). Stap 2: XGBoost-score 61/100 (bandbreedte 57-65). Stap 3: seizoenspatroon gedetecteerd in omzet (Q4-piek), niet volledig verdisconteerd in het model. Stap 4: advies 'toewijzen onder voorwaarden' met verhoogde monitoringsfrequentie."
      }
    },
    "human_in_the_loop": {
      "hitl_gate_triggered": true,
      "gate_type": "pre-decision-release",
      "frozen_timestamp": "2026-07-09T11:47:55.000Z",
      "action_timestamp": "2026-07-09T11:58:30.000Z",
      "review_duration_seconds": 635,
      "decision": "OVERRIDE",
      "human_override_details": {
        "field_modified": "credit_score_output",
        "original_ai_value": "61",
        "new_human_value": "58",
        "mandatory_justification": "Score handmatig verlaagd: het model verdisconteert de aangekondigde huurverhoging per Q4-2026 niet (huurcontract in dossier). Conservatievere score conform vierogenbeleid kredietcommissie."
      },
      "digital_signature_hash": "sig-b6e02a91d47c53f8-vandijk"
    },
    "compliance_integrity": {
      "ai_act_risk_category": "high_risk",
      "pii_masking_applied": true,
      "pii_masked_fields": [
        "bsn",
        "namen_natuurlijke_personen",
        "iban"
      ],
      "dora_incident_status": "nominal"
    },
    "system_integrity": {
      "response_time_ms": 11040,
      "token_anomaly_detected": false,
      "error_count": 0,
      "errors": []
    },
    "integrity_chain": {
      "entry_hash": "da12e0802fc3e2f5f8971da11c287a34ac17734c0730b4a8214a3cd9dfb26ac3",
      "prev_entry_hash": "5059d9982be5b50d05453f14db65dee82eb85798e0c88e3b3582f18e3ee391ee"
    }
  },
  {
    "log_header": {
      "timestamp": "2026-07-09T16:20:38.410Z",
      "transaction_id": "tx-baa-2026-8839344",
      "session_id": "sess-2317-fe09-ee31",
      "environment": "production"
    },
    "identities": {
      "organization_id": "afm-licence-334409",
      "user_id": "ciso-r.willems@noordbank.nl",
      "user_role": "Compliance Officer ICT-risico",
      "agent": {
        "agent_id": "bna:agent:dora-report-034",
        "version": "1.1.3",
        "code_hash": "67821448c00f4448d3336eb79cc122c1c3bacf1b4720690bad687d2ee5da5b17"
      }
    },
    "data_lineage": {
      "input_sources": [
        {
          "source_type": "database",
          "provider": "SIEM-export (Sentinel)",
          "endpoint": "siem://tenant-334409/incidents/INC-2026-0712",
          "request_timestamp": "2026-07-09T16:18:02.000Z",
          "response_hash": "f02c6d1e89a4b573"
        }
      ],
      "ai_reasoning": {
        "base_model": "anthropic.claude-sonnet-4-6 (AWS Bedrock, eu-central-1)",
        "prompt_tokens": 26100,
        "completion_tokens": 2140,
        "confidence_score": 0.93,
        "chain_of_thought": "Stap 1: 1.412 logregels van incident INC-2026-0712 chronologisch gereconstrueerd. Stap 2: incident geclassificeerd als 'major' conform DORA RTS art. 8 (uitval betaalverwerking > 2 uur). Stap 3: meldtermijn bepaald: initiële melding binnen 4 uur na classificatie, deadline 2026-07-09T19:40Z. Stap 4: concept-rapport opgesteld conform ITS-template, ter goedkeuring aangeboden."
      }
    },
    "human_in_the_loop": {
      "hitl_gate_triggered": true,
      "gate_type": "pre-submission-approval",
      "frozen_timestamp": "2026-07-09T16:20:40.000Z",
      "action_timestamp": "2026-07-09T16:41:15.000Z",
      "review_duration_seconds": 1235,
      "decision": "APPROVED",
      "digital_signature_hash": "sig-4e83a0f6d2b1c975-willems"
    },
    "compliance_integrity": {
      "ai_act_risk_category": "limited_risk",
      "pii_masking_applied": true,
      "pii_masked_fields": [
        "namen_natuurlijke_personen",
        "ip_adressen",
        "e-mailadressen"
      ],
      "dora_incident_status": "degraded"
    },
    "system_integrity": {
      "response_time_ms": 42350,
      "token_anomaly_detected": false,
      "error_count": 1,
      "errors": [
        {
          "code": "SIEM_TIMEOUT",
          "message": "SIEM-endpoint reageerde niet binnen 30s bij eerste poging",
          "recovery": "Automatische retry met exponentiële backoff; tweede poging geslaagd na 12s. Vertraging gelogd, geen dataverlies."
        }
      ]
    },
    "integrity_chain": {
      "entry_hash": "eba69612b61c401631f292482f9afb23b49af5b1991f27ddbda9ed81add37196",
      "prev_entry_hash": "da12e0802fc3e2f5f8971da11c287a34ac17734c0730b4a8214a3cd9dfb26ac3"
    }
  },
  {
    "log_header": {
      "timestamp": "2026-07-10T08:30:15.660Z",
      "transaction_id": "tx-baa-2026-8839671",
      "session_id": "sess-2388-cb56-ff02",
      "environment": "production"
    },
    "identities": {
      "organization_id": "kvk-88213307",
      "user_id": "administratie-k.jansen@vloerenhuis.nl",
      "user_role": "Hoofd Administratie",
      "agent": {
        "agent_id": "bna:agent:pay-remind-015",
        "version": "4.2.0",
        "code_hash": "5c7274ff5a4e19153a0e05a5d4a32f66b92752a076749cb0aa918a0cb8cd4878"
      }
    },
    "data_lineage": {
      "input_sources": [
        {
          "source_type": "api",
          "provider": "Boekhoudkoppeling (Twinfield)",
          "endpoint": "/api/v3/openstaande-posten",
          "request_timestamp": "2026-07-10T08:30:12.100Z",
          "response_hash": "3a9d5c7f01e2b846"
        }
      ],
      "ai_reasoning": {
        "base_model": "anthropic.claude-haiku-4-5 (AWS Bedrock, eu-central-1)",
        "prompt_tokens": 2210,
        "completion_tokens": 380,
        "confidence_score": 0.97,
        "chain_of_thought": "Stap 1: factuur F-2026-0441 (€8.470, 62 dagen open) bereikt escalatiestap 3 volgens protocol. Stap 2: concept-aanmaning met incasso-aankondiging opgesteld, toonregel 'zakelijk-formeel'. Stap 3: escalatiestap 3 vereist expliciete goedkeuring per debiteur — gate geactiveerd."
      }
    },
    "human_in_the_loop": {
      "hitl_gate_triggered": true,
      "gate_type": "escalation-step-3-approval",
      "frozen_timestamp": "2026-07-10T08:30:16.000Z",
      "action_timestamp": "2026-07-10T08:34:02.000Z",
      "review_duration_seconds": 226,
      "decision": "REJECTED",
      "digital_signature_hash": "sig-c19f7e34b8a2d650-jansen"
    },
    "compliance_integrity": {
      "ai_act_risk_category": "minimal_risk",
      "pii_masking_applied": true,
      "pii_masked_fields": [
        "iban",
        "contactgegevens_prive"
      ],
      "dora_incident_status": "nominal"
    },
    "system_integrity": {
      "response_time_ms": 1830,
      "token_anomaly_detected": false,
      "error_count": 0,
      "errors": []
    },
    "integrity_chain": {
      "entry_hash": "708830ab54cacb257dfb43b4bb92939fe8b8b9313f9bda4738b92cac45bfb6db",
      "prev_entry_hash": "eba69612b61c401631f292482f9afb23b49af5b1991f27ddbda9ed81add37196"
    }
  },
  {
    "log_header": {
      "timestamp": "2026-07-10T09:15:44.230Z",
      "transaction_id": "tx-baa-2026-8839702",
      "session_id": "sess-2390-da31-ab55",
      "environment": "production"
    },
    "identities": {
      "organization_id": "afm-licence-208871",
      "user_id": "compliance-s.bakker@kantoor-noord.nl",
      "user_role": "Wwft Compliance Officer",
      "agent": {
        "agent_id": "bna:agent:kyc-screen-004",
        "version": "2.3.1",
        "code_hash": "f9e10e3b13461f97adbb5186fe9808944e6b48febcf955c42ad4d4b6718d2d44"
      }
    },
    "data_lineage": {
      "input_sources": [
        {
          "source_type": "api",
          "provider": "KVK API",
          "endpoint": "/v2/companies/81002419",
          "request_timestamp": "2026-07-10T09:15:41.020Z",
          "response_hash": "b83e2f90a1c74d65"
        },
        {
          "source_type": "api",
          "provider": "UBO-register",
          "endpoint": "/ubo/v1/lookup",
          "request_timestamp": "2026-07-10T09:15:42.550Z",
          "response_hash": "6d40ac92e7f1b385"
        }
      ],
      "ai_reasoning": {
        "base_model": "anthropic.claude-sonnet-4-6 (AWS Bedrock, eu-central-1)",
        "prompt_tokens": 8140,
        "completion_tokens": 520,
        "confidence_score": 0.99,
        "chain_of_thought": "Stap 1: KVK- en UBO-gegevens opgehaald en geconsolideerd. Stap 2: screening tegen sanctie- en PEP-lijsten (lijstversie 2026-07-09): geen matches. Stap 3: UBO-structuur eenduidig (twee natuurlijke personen, elk 50%). Stap 4: relatie geclassificeerd als regulier risico; geen HITL-gate vereist, dossier automatisch aangevuld."
      }
    },
    "human_in_the_loop": {
      "hitl_gate_triggered": false
    },
    "compliance_integrity": {
      "ai_act_risk_category": "high_risk",
      "pii_masking_applied": true,
      "pii_masked_fields": [
        "bsn",
        "namen_natuurlijke_personen",
        "geboortedatum"
      ],
      "dora_incident_status": "nominal"
    },
    "system_integrity": {
      "response_time_ms": 4110,
      "token_anomaly_detected": false,
      "error_count": 0,
      "errors": []
    },
    "integrity_chain": {
      "entry_hash": "6f9e373e9a489b024414a20a43b63e91b4921d4752cfe65f6b2a38a017447129",
      "prev_entry_hash": "708830ab54cacb257dfb43b4bb92939fe8b8b9313f9bda4738b92cac45bfb6db"
    }
  },
  {
    "log_header": {
      "timestamp": "2026-07-10T14:02:09.870Z",
      "transaction_id": "tx-baa-2026-8839866",
      "session_id": "sess-2405-ee72-cd18",
      "environment": "production"
    },
    "identities": {
      "organization_id": "kvk-59110342",
      "user_id": "wagenpark-b.smit@mobilease.nl",
      "user_role": "Wagenparkbeheerder",
      "agent": {
        "agent_id": "bna:agent:fleet-link-019",
        "version": "2.5.1",
        "code_hash": "2fe0d8f435f248a9dc89aa561c96384f08da74d564e8475a86435a291a8299c9"
      }
    },
    "data_lineage": {
      "input_sources": [
        {
          "source_type": "api",
          "provider": "OEM-telematica (VW Group)",
          "endpoint": "/fleet/v4/odometer",
          "request_timestamp": "2026-07-10T14:02:07.310Z",
          "response_hash": "91c5f3ea08d2b647"
        }
      ],
      "ai_reasoning": {
        "base_model": "n.v.t. — regelgebaseerde normalisatie (geen LLM in het leveringspad)",
        "prompt_tokens": 0,
        "completion_tokens": 0,
        "confidence_score": 1,
        "chain_of_thought": "Escrow-levering aan bna:agent:pay-remind-015 (facturatiecontrole leasekilometers): kilometerstanden van 212 voertuigen opgehaald, kentekens gepseudonimiseerd, reeks geaggregeerd per contract en voorzien van bronattributie. Doelbinding gecontroleerd tegen eerder verleende goedkeuring d.d. 2026-04-28."
      }
    },
    "human_in_the_loop": {
      "hitl_gate_triggered": false
    },
    "compliance_integrity": {
      "ai_act_risk_category": "limited_risk",
      "pii_masking_applied": true,
      "pii_masked_fields": [
        "kenteken_pseudonimisering",
        "locatiedata_aggregatie"
      ],
      "dora_incident_status": "nominal"
    },
    "system_integrity": {
      "response_time_ms": 2960,
      "token_anomaly_detected": false,
      "error_count": 0,
      "errors": []
    },
    "integrity_chain": {
      "entry_hash": "0d38e04568a419dd96b63e51bb60149a92e0478add14c8612c0a2d8db12ddaf3",
      "prev_entry_hash": "6f9e373e9a489b024414a20a43b63e91b4921d4752cfe65f6b2a38a017447129"
    }
  }
]) as unknown as AuditEntry[];
