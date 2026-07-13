// Auto-ported from bn-agent-console/assets/connectors-data.js (static preview data,
// Agent Card Standaard v2.1). Single source for the /connectors catalog. No live
// backend yet — data is bundled. Regenerate from the console dataset if it changes.

export type Connector = {
  connectorId: string;
  name: string;
  provider: string;
  category: string;
  version: string;
  description: string;
  authType: string;
  scopes: string[];
  dataCategories: string[];
  dataResidency: string;
  zeroDataRetention: boolean;
  riskContribution: number;
  status: string;
  integrity?: { manifestHash: string; signedAt: string } | null;
  docsUrl?: string;
};

export const BN_CONNECTORS: Connector[] = [
  {
    "connectorId": "bnc:connector:kvk-handelsregister",
    "name": "KVK Handelsregister API",
    "provider": "Kamer van Koophandel",
    "category": "Registers",
    "version": "1.4.0",
    "description": "Zoeken en basisprofielen uit het Handelsregister: inschrijvingen, vestigingen en functionarissen. Alleen-lezen.",
    "authType": "apiKey",
    "scopes": [
      "hr.search",
      "hr.basisprofiel"
    ],
    "dataCategories": [
      "bedrijfsgegevens"
    ],
    "dataResidency": "NL_only",
    "zeroDataRetention": true,
    "riskContribution": 35,
    "status": "actief",
    "integrity": {
      "manifestHash": "39fa280d0f194f39444987565808a1d55e0c77b05cb710163c6812113db885c7",
      "signedAt": "2026-07-11T08:00:00Z"
    },
    "docsUrl": "bn-agent-docs.html#connectors"
  },
  {
    "connectorId": "bnc:connector:bkr-toetsing",
    "name": "BKR-toetsing",
    "provider": "Stichting BKR",
    "category": "Krediet & identiteit",
    "version": "2.1.0",
    "description": "Kredietregistratietoetsing voor vergunninghoudende kredietverstrekkers. Elke toets wordt gelogd en is zichtbaar voor de betrokkene.",
    "authType": "mtls",
    "scopes": [
      "toetsing.uitvoeren"
    ],
    "dataCategories": [
      "kredietregistratie",
      "persoonsgegevens"
    ],
    "dataResidency": "NL_only",
    "zeroDataRetention": true,
    "riskContribution": 60,
    "status": "actief",
    "integrity": {
      "manifestHash": "cee47d380968399c7501ba75a424f97ffa264ea697c6f136907d3aa165499da3",
      "signedAt": "2026-07-11T08:00:00Z"
    },
    "docsUrl": "bn-agent-docs.html#connectors"
  },
  {
    "connectorId": "bnc:connector:idin",
    "name": "iDIN",
    "provider": "Currence / Nederlandse banken",
    "category": "Krediet & identiteit",
    "version": "1.2.0",
    "description": "Identiteitsverificatie via de bankomgeving van de gebruiker: naam-, leeftijds- en adresattributen met expliciete toestemming per attribuutset.",
    "authType": "oauth2",
    "scopes": [
      "identify",
      "attributes.name",
      "attributes.address"
    ],
    "dataCategories": [
      "identiteit",
      "persoonsgegevens"
    ],
    "dataResidency": "NL_only",
    "zeroDataRetention": true,
    "riskContribution": 50,
    "status": "actief",
    "integrity": {
      "manifestHash": "a467121f887c40a55c82ccfdc668fb62c851f19e88e131ad2f3679f034e4371a",
      "signedAt": "2026-07-11T08:00:00Z"
    },
    "docsUrl": "bn-agent-docs.html#connectors"
  },
  {
    "connectorId": "bnc:connector:ideal",
    "name": "iDEAL 2.0 betaalinitiatie",
    "provider": "Currence",
    "category": "Betalen",
    "version": "0.9.0",
    "description": "Betaalverzoeken en statusnotificaties. In validatie: agents mogen betalingen voorbereiden, initiatie vereist de HITL-gate van de afnemer.",
    "authType": "oauth2",
    "scopes": [
      "payment.create",
      "payment.status"
    ],
    "dataCategories": [
      "betaalgegevens",
      "persoonsgegevens"
    ],
    "dataResidency": "EU_only",
    "zeroDataRetention": true,
    "riskContribution": 65,
    "status": "in validatie",
    "docsUrl": "bn-agent-docs.html#connectors"
  },
  {
    "connectorId": "bnc:connector:digid",
    "name": "DigiD",
    "provider": "Logius",
    "category": "Krediet & identiteit",
    "version": "3.0.0",
    "description": "Authenticatie van burgers voor (semi-)publieke dienstverlening. BSN komt de agentomgeving nooit ongemaskeerd binnen; alleen het betrouwbaarheidsniveau en een pseudoniem worden doorgegeven.",
    "authType": "mtls",
    "scopes": [
      "authenticate.basis",
      "authenticate.midden",
      "authenticate.substantieel"
    ],
    "dataCategories": [
      "bsn",
      "identiteit"
    ],
    "dataResidency": "NL_only",
    "zeroDataRetention": true,
    "riskContribution": 60,
    "status": "actief",
    "integrity": {
      "manifestHash": "acf935c2dfc8c4685beb07a3ba7769bbb439985c0a1fd6c2c0b308d1a0c38751",
      "signedAt": "2026-07-11T08:00:00Z"
    },
    "docsUrl": "bn-agent-docs.html#connectors"
  },
  {
    "connectorId": "bnc:connector:eherkenning",
    "name": "eHerkenning",
    "provider": "Afsprakenstelsel eHerkenning",
    "category": "Krediet & identiteit",
    "version": "1.13.0",
    "description": "Authenticatie en machtigingen voor zakelijke gebruikers richting overheidsdiensten, inclusief betrouwbaarheidsniveau EH3/EH4.",
    "authType": "mtls",
    "scopes": [
      "authenticate",
      "machtiging.check"
    ],
    "dataCategories": [
      "identiteit",
      "bedrijfsgegevens"
    ],
    "dataResidency": "NL_only",
    "zeroDataRetention": true,
    "riskContribution": 55,
    "status": "actief",
    "integrity": {
      "manifestHash": "5925b06fb2f3bfd630c5ed36f8167022bb5fd12595b153fcb341698af170c358",
      "signedAt": "2026-07-11T08:00:00Z"
    },
    "docsUrl": "bn-agent-docs.html#connectors"
  },
  {
    "connectorId": "bnc:connector:ms-graph",
    "name": "Microsoft Graph",
    "provider": "Microsoft",
    "category": "Productiviteit & CRM",
    "version": "1.0.0",
    "description": "Documentontsluiting uit Microsoft 365 (SharePoint/OneDrive/Exchange) binnen de tenant van de afnemer. Standaard alleen-lezen; schrijfscopes vereisen aparte certificering.",
    "authType": "oauth2",
    "scopes": [
      "Files.Read.All",
      "Sites.Read.All"
    ],
    "dataCategories": [
      "documenten",
      "e-mail",
      "agenda"
    ],
    "dataResidency": "EU_only",
    "zeroDataRetention": false,
    "riskContribution": 45,
    "status": "actief",
    "integrity": {
      "manifestHash": "7fcabc1b5a873a9502f46902fcbac55aa00066826b1b73ac37ba054813e3fc1d",
      "signedAt": "2026-07-11T08:00:00Z"
    },
    "docsUrl": "bn-agent-docs.html#connectors"
  },
  {
    "connectorId": "bnc:connector:salesforce",
    "name": "Salesforce REST API",
    "provider": "Salesforce",
    "category": "Productiviteit & CRM",
    "version": "2.0.0",
    "description": "Klant- en poliscontext uit de CRM-omgeving van de afnemer (EU-instance). Veldniveau-autorisatie volgt het Salesforce-profiel van de gekoppelde integratiegebruiker.",
    "authType": "oauth2",
    "scopes": [
      "api",
      "refresh_token"
    ],
    "dataCategories": [
      "crm",
      "klantgegevens"
    ],
    "dataResidency": "EU_only",
    "zeroDataRetention": false,
    "riskContribution": 50,
    "status": "actief",
    "integrity": {
      "manifestHash": "c09dde2c68798c9632c4d75db5485f450e5143a5d0b4f43a3750f4c0c428b4c6",
      "signedAt": "2026-07-11T08:00:00Z"
    },
    "docsUrl": "bn-agent-docs.html#connectors"
  },
  {
    "connectorId": "bnc:connector:exact-online",
    "name": "Exact Online",
    "provider": "Exact",
    "category": "Boekhouding",
    "version": "1.7.0",
    "description": "Boekhoudkoppeling: openstaande posten en factuurstatus lezen, notities schrijven. Geen betaal- of boekingsmutaties via deze connector.",
    "authType": "oauth2",
    "scopes": [
      "financial.read",
      "notes.write"
    ],
    "dataCategories": [
      "boekhouding",
      "facturen"
    ],
    "dataResidency": "EU_only",
    "zeroDataRetention": true,
    "riskContribution": 20,
    "status": "actief",
    "integrity": {
      "manifestHash": "68fd394a1592b8c595b07217b045cd72798cf8a3ee4d5be3670ac8a244d094d5",
      "signedAt": "2026-07-11T08:00:00Z"
    },
    "docsUrl": "bn-agent-docs.html#connectors"
  },
  {
    "connectorId": "bnc:connector:ocpi-laadinfra",
    "name": "OCPI-laadinfrastructuur",
    "provider": "Open Charge Alliance-partijen",
    "category": "Mobiliteit & IoT",
    "version": "2.2.1",
    "description": "Laadsessies en laadpuntstatus via het OCPI-protocol. Locatiedata wordt geaggregeerd vóór levering aan agents.",
    "authType": "apiKey",
    "scopes": [
      "sessions.read",
      "locations.read"
    ],
    "dataCategories": [
      "telemetrie",
      "locatie_geaggregeerd"
    ],
    "dataResidency": "EER",
    "zeroDataRetention": true,
    "riskContribution": 30,
    "status": "actief",
    "integrity": {
      "manifestHash": "0d9a7a526edf2b4e17b486b1439245c605d4b76522797c59ca87b6c14f4d0ced",
      "signedAt": "2026-07-11T08:00:00Z"
    },
    "docsUrl": "bn-agent-docs.html#connectors"
  },
  {
    "connectorId": "bnc:connector:generic-rest",
    "name": "Generieke REST/webhook-connector",
    "provider": "BN Agent",
    "category": "Generiek",
    "version": "1.0.0",
    "description": "Configureerbare REST- en webhookkoppeling voor bronnen zonder eigen gecertificeerde connector. Endpoint-allowlist, schemavalidatie en response-hashing per aanroep zijn verplicht.",
    "authType": "apiKey",
    "scopes": [
      "endpoint.call",
      "webhook.receive"
    ],
    "dataCategories": [
      "configureerbaar"
    ],
    "dataResidency": "EER",
    "zeroDataRetention": true,
    "riskContribution": 40,
    "status": "actief",
    "integrity": {
      "manifestHash": "7411f69bb4f0e0218bc483fec9054d08c976c249dbc8553a5fdbed51d729cfc3",
      "signedAt": "2026-07-11T08:00:00Z"
    },
    "docsUrl": "bn-agent-docs.html#connectors"
  },
  {
    "connectorId": "bnc:connector:kadaster-bag",
    "name": "Kadaster BAG API",
    "provider": "Kadaster",
    "category": "Vastgoed & kadaster",
    "version": "2.1.0",
    "description": "Basisregistratie Adressen en Gebouwen: adressen, panden en verblijfsobjecten. Openbare registerdata, alleen-lezen.",
    "authType": "apiKey",
    "scopes": [
      "bag.adressen.read",
      "bag.panden.read"
    ],
    "dataCategories": [
      "adresgegevens"
    ],
    "dataResidency": "NL_only",
    "zeroDataRetention": true,
    "riskContribution": 15,
    "status": "actief",
    "integrity": {
      "manifestHash": "cb0b45eeef11b831745b73c5c577c7c07286669dac8da12cb007046875e0ea5e",
      "signedAt": "2026-07-11T08:00:00Z"
    },
    "docsUrl": "bn-agent-docs.html#connectors"
  },
  {
    "connectorId": "bnc:connector:kadaster-kik",
    "name": "Kadaster KIK-inzage",
    "provider": "Kadaster",
    "category": "Vastgoed & kadaster",
    "version": "1.6.0",
    "description": "Kadastrale percelen, eigendomsinformatie en hypotheekgegevens. Bevraging wordt per perceel gelogd; alleen voor gerechtvaardigde doelen.",
    "authType": "mtls",
    "scopes": [
      "percelen.read",
      "eigendom.read",
      "hypotheken.read"
    ],
    "dataCategories": [
      "vastgoed",
      "persoonsgegevens"
    ],
    "dataResidency": "NL_only",
    "zeroDataRetention": true,
    "riskContribution": 45,
    "status": "actief",
    "integrity": {
      "manifestHash": "b11580a9a154666d99a70f9310514e03e11ec78cb7d2a3cf3901457ad5602af2",
      "signedAt": "2026-07-11T08:00:00Z"
    },
    "docsUrl": "bn-agent-docs.html#connectors"
  },
  {
    "connectorId": "bnc:connector:woz-waardeloket",
    "name": "WOZ-waardeloket",
    "provider": "Waarderingskamer",
    "category": "Vastgoed & kadaster",
    "version": "1.2.0",
    "description": "Openbare WOZ-waarden per adres. Alleen-lezen; geen persoonsgegevens in de respons.",
    "authType": "apiKey",
    "scopes": [
      "woz.waarde.read"
    ],
    "dataCategories": [
      "vastgoed"
    ],
    "dataResidency": "NL_only",
    "zeroDataRetention": true,
    "riskContribution": 10,
    "status": "actief",
    "integrity": {
      "manifestHash": "599406e9e8d9349591609108dd6b2d0a8b27af0abf4f53e4b251a7431c0e75f7",
      "signedAt": "2026-07-11T08:00:00Z"
    },
    "docsUrl": "bn-agent-docs.html#connectors"
  },
  {
    "connectorId": "bnc:connector:rdw-voertuigen",
    "name": "RDW Voertuiggegevens",
    "provider": "RDW",
    "category": "Registers",
    "version": "3.0.0",
    "description": "Kenteken- en APK-gegevens uit het open datakanaal van de RDW. Geen tenaamstellingsgegevens via deze connector.",
    "authType": "apiKey",
    "scopes": [
      "kenteken.read",
      "apk.read"
    ],
    "dataCategories": [
      "voertuiggegevens"
    ],
    "dataResidency": "NL_only",
    "zeroDataRetention": true,
    "riskContribution": 10,
    "status": "actief",
    "integrity": {
      "manifestHash": "0ca7abae0bdec92f87a3a0b92b913ab9081c9f7b13342e634d4340c591ff2def",
      "signedAt": "2026-07-11T08:00:00Z"
    },
    "docsUrl": "bn-agent-docs.html#connectors"
  },
  {
    "connectorId": "bnc:connector:kbo-public-search",
    "name": "KBO Public Search (België)",
    "provider": "FOD Economie",
    "category": "Registers",
    "version": "1.3.0",
    "description": "Belgische ondernemings- en vestigingsgegevens uit de Kruispuntbank van Ondernemingen. Alleen-lezen.",
    "authType": "apiKey",
    "scopes": [
      "onderneming.read",
      "vestiging.read"
    ],
    "dataCategories": [
      "bedrijfsgegevens"
    ],
    "dataResidency": "EU_only",
    "zeroDataRetention": true,
    "riskContribution": 15,
    "status": "actief",
    "integrity": {
      "manifestHash": "78123e4b20be1fca27e64c20dd7e9eece44bcb8795e5aa7ca27b814b0a07f541",
      "signedAt": "2026-07-11T08:00:00Z"
    },
    "docsUrl": "bn-agent-docs.html#connectors"
  },
  {
    "connectorId": "bnc:connector:ubo-register",
    "name": "UBO-register inzage",
    "provider": "Kamer van Koophandel",
    "category": "Registers",
    "version": "1.1.0",
    "description": "Uiteindelijk-belanghebbendeninformatie voor Wwft-instellingen met terugmeldplicht. Elke raadpleging wordt gelogd en is herleidbaar tot de raadplegende partij.",
    "authType": "mtls",
    "scopes": [
      "ubo.read"
    ],
    "dataCategories": [
      "ubo",
      "persoonsgegevens"
    ],
    "dataResidency": "NL_only",
    "zeroDataRetention": true,
    "riskContribution": 55,
    "status": "actief",
    "integrity": {
      "manifestHash": "5dc38242d8595f13a803eabcb39dc7a7dd84e44fdb0c1bb68a35729b3c421db3",
      "signedAt": "2026-07-11T08:00:00Z"
    },
    "docsUrl": "bn-agent-docs.html#connectors"
  },
  {
    "connectorId": "bnc:connector:vies-btw-validatie",
    "name": "VIES btw-nummervalidatie",
    "provider": "Europese Commissie",
    "category": "Registers",
    "version": "1.0.0",
    "description": "Validatie van EU-btw-nummers voor intracommunautaire facturatie. Alleen-lezen, geen persoonsgegevens.",
    "authType": "apiKey",
    "scopes": [
      "vat.validate"
    ],
    "dataCategories": [
      "bedrijfsgegevens"
    ],
    "dataResidency": "EU_only",
    "zeroDataRetention": true,
    "riskContribution": 10,
    "status": "actief",
    "integrity": {
      "manifestHash": "939012778a1f32e942f598d86abc0b3d9411bb9f7ad219b521cb48411abd7421",
      "signedAt": "2026-07-11T08:00:00Z"
    },
    "docsUrl": "bn-agent-docs.html#connectors"
  },
  {
    "connectorId": "bnc:connector:brp-haal-centraal",
    "name": "BRP Haal Centraal",
    "provider": "RvIG",
    "category": "Overheid & justitie",
    "version": "2.0.0",
    "description": "Bevraging van de Basisregistratie Personen via Haal Centraal. Alleen doelgebonden attribuutsets; BSN wordt gemaskeerd in agentlogs. Autorisatiebesluit per afnemer vereist.",
    "authType": "mtls",
    "scopes": [
      "personen.raadplegen.beperkt"
    ],
    "dataCategories": [
      "bsn",
      "persoonsgegevens"
    ],
    "dataResidency": "NL_only",
    "zeroDataRetention": true,
    "riskContribution": 75,
    "status": "in validatie",
    "docsUrl": "bn-agent-docs.html#connectors"
  },
  {
    "connectorId": "bnc:connector:justis-vog",
    "name": "Justis VOG-statuscheck",
    "provider": "Justis (Ministerie van J&V)",
    "category": "Overheid & justitie",
    "version": "1.4.0",
    "description": "Statuscheck van VOG-aanvragen voor werkgevers. Alleen de status en het screeningsprofiel; nooit justitiële documentatie zelf.",
    "authType": "mtls",
    "scopes": [
      "vog.status.read"
    ],
    "dataCategories": [
      "justitieel",
      "persoonsgegevens"
    ],
    "dataResidency": "NL_only",
    "zeroDataRetention": true,
    "riskContribution": 60,
    "status": "actief",
    "integrity": {
      "manifestHash": "f9c5ab04f51c2e3b455d8833f6b124e2ccf3349ba45d9970da8c454f54801a01",
      "signedAt": "2026-07-11T08:00:00Z"
    },
    "docsUrl": "bn-agent-docs.html#connectors"
  },
  {
    "connectorId": "bnc:connector:duo-diplomaregister",
    "name": "DUO Diplomaregister",
    "provider": "DUO",
    "category": "Overheid & justitie",
    "version": "1.8.0",
    "description": "Verificatie van Nederlandse diploma's met toestemming van de betrokkene. Respons is een ja/nee-bevestiging plus diplomagegevens.",
    "authType": "mtls",
    "scopes": [
      "diploma.verify"
    ],
    "dataCategories": [
      "opleidingsgegevens",
      "persoonsgegevens"
    ],
    "dataResidency": "NL_only",
    "zeroDataRetention": true,
    "riskContribution": 40,
    "status": "actief",
    "integrity": {
      "manifestHash": "16c3de5aba654deeea240495d1e23f066db5b376129b6c2e5905f2fee034a86c",
      "signedAt": "2026-07-11T08:00:00Z"
    },
    "docsUrl": "bn-agent-docs.html#connectors"
  },
  {
    "connectorId": "bnc:connector:rechtspraak-open-data",
    "name": "Rechtspraak Open Data (ECLI)",
    "provider": "de Rechtspraak",
    "category": "Overheid & justitie",
    "version": "2.2.0",
    "description": "Gepubliceerde, geanonimiseerde uitspraken via de ECLI-index. Open data, alleen-lezen.",
    "authType": "apiKey",
    "scopes": [
      "uitspraken.read"
    ],
    "dataCategories": [
      "openbare_uitspraken"
    ],
    "dataResidency": "NL_only",
    "zeroDataRetention": true,
    "riskContribution": 5,
    "status": "actief",
    "integrity": {
      "manifestHash": "b5150c30cd03900a40fd12b955a9113d92bc5e7f8ce2f75e6db6fd06b625ecc7",
      "signedAt": "2026-07-11T08:00:00Z"
    },
    "docsUrl": "bn-agent-docs.html#connectors"
  },
  {
    "connectorId": "bnc:connector:berichtenbox-bedrijven",
    "name": "Berichtenbox voor bedrijven",
    "provider": "Logius",
    "category": "Overheid & justitie",
    "version": "1.0.0",
    "description": "Beveiligd berichtenverkeer tussen ondernemingen en overheidsorganisaties. In validatie: verzenden vereist de HITL-gate van de afnemer.",
    "authType": "mtls",
    "scopes": [
      "berichten.send",
      "berichten.read"
    ],
    "dataCategories": [
      "correspondentie",
      "bedrijfsgegevens"
    ],
    "dataResidency": "NL_only",
    "zeroDataRetention": true,
    "riskContribution": 35,
    "status": "in validatie",
    "docsUrl": "bn-agent-docs.html#connectors"
  },
  {
    "connectorId": "bnc:connector:itsme",
    "name": "itsme (België)",
    "provider": "Belgian Mobile ID",
    "category": "Krediet & identiteit",
    "version": "2.4.0",
    "description": "Belgische identiteitsverificatie en bevestiging via de itsme-app: naam-, adres- en rijksregisterattributen met expliciete toestemming per attribuutset.",
    "authType": "oauth2",
    "scopes": [
      "identify",
      "attributes.nrn",
      "attributes.address"
    ],
    "dataCategories": [
      "identiteit",
      "persoonsgegevens"
    ],
    "dataResidency": "EU_only",
    "zeroDataRetention": true,
    "riskContribution": 50,
    "status": "actief",
    "integrity": {
      "manifestHash": "3a324ac20e7bf9ac6c54e74fc1478b92a21f3d8226462b0fb51fb61c896276b3",
      "signedAt": "2026-07-11T08:00:00Z"
    },
    "docsUrl": "bn-agent-docs.html#connectors"
  },
  {
    "connectorId": "bnc:connector:eudi-wallet",
    "name": "EUDI Wallet (eIDAS 2.0)",
    "provider": "EU-lidstaten / erkende wallets",
    "category": "Krediet & identiteit",
    "version": "0.9.0",
    "description": "Presentatie van attestaties uit de Europese digitale identiteitswallet met selectieve disclosure. In validatie tot de nationale implementaties live zijn.",
    "authType": "oauth2",
    "scopes": [
      "credential.present",
      "attributes.selective_disclosure"
    ],
    "dataCategories": [
      "identiteit"
    ],
    "dataResidency": "EU_only",
    "zeroDataRetention": true,
    "riskContribution": 45,
    "status": "in validatie",
    "docsUrl": "bn-agent-docs.html#connectors"
  },
  {
    "connectorId": "bnc:connector:creditsafe-bedrijfskrediet",
    "name": "Creditsafe bedrijfskrediet",
    "provider": "Creditsafe Nederland",
    "category": "Krediet & identiteit",
    "version": "3.2.0",
    "description": "Kredietrapporten en monitoring van ondernemingen. Retentie voor monitoringsdoeleinden; retentieparagraaf in de verwerkersovereenkomst verplicht.",
    "authType": "oauth2",
    "scopes": [
      "company.credit.read",
      "company.monitoring"
    ],
    "dataCategories": [
      "kredietinformatie",
      "bedrijfsgegevens"
    ],
    "dataResidency": "EER",
    "zeroDataRetention": false,
    "riskContribution": 40,
    "status": "actief",
    "integrity": {
      "manifestHash": "660f80e31e6cd171ff764180fff3c9ec484722f0f6a3eccae6f5da0b470caa00",
      "signedAt": "2026-07-11T08:00:00Z"
    },
    "docsUrl": "bn-agent-docs.html#connectors"
  },
  {
    "connectorId": "bnc:connector:signicat-identity-hub",
    "name": "Signicat Identity Hub",
    "provider": "Signicat",
    "category": "Krediet & identiteit",
    "version": "4.1.0",
    "description": "Gecombineerde identiteitsverificatie: documentcontrole, biometrische matching en AML-screening via één hub. Biometrie verlaat de EU nooit.",
    "authType": "oauth2",
    "scopes": [
      "identify",
      "document.verify",
      "aml.screen"
    ],
    "dataCategories": [
      "identiteit",
      "biometrie"
    ],
    "dataResidency": "EU_only",
    "zeroDataRetention": true,
    "riskContribution": 55,
    "status": "actief",
    "integrity": {
      "manifestHash": "f7d50b29d2de3e8236a0299e1a753d9d0ed72b4a78c954b42a116a3433f6ba4a",
      "signedAt": "2026-07-11T08:00:00Z"
    },
    "docsUrl": "bn-agent-docs.html#connectors"
  },
  {
    "connectorId": "bnc:connector:psd2-rekeninginformatie",
    "name": "PSD2 rekeninginformatie (AIS)",
    "provider": "Nederlandse & Belgische banken",
    "category": "Betalen",
    "version": "1.5.0",
    "description": "Rekeningsaldi en transactiehistorie met expliciete toestemming van de rekeninghouder (90 dagen, hernieuwbaar). Vereist AISP-vergunning van de afnemer.",
    "authType": "oauth2",
    "scopes": [
      "accounts.read",
      "balances.read",
      "transactions.read"
    ],
    "dataCategories": [
      "betaalgegevens",
      "persoonsgegevens"
    ],
    "dataResidency": "EU_only",
    "zeroDataRetention": true,
    "riskContribution": 70,
    "status": "actief",
    "integrity": {
      "manifestHash": "888221ebcfcbc45fbbc18fc752f41c56ccd71c21aad090026642f17870e0b0d8",
      "signedAt": "2026-07-11T08:00:00Z"
    },
    "docsUrl": "bn-agent-docs.html#connectors"
  },
  {
    "connectorId": "bnc:connector:psd2-betaalinitiatie",
    "name": "PSD2 betaalinitiatie (PIS)",
    "provider": "Nederlandse & Belgische banken",
    "category": "Betalen",
    "version": "0.8.0",
    "description": "Initiatie van betalingen namens de rekeninghouder. In validatie: elke initiatie vereist de HITL-gate van de afnemer plus PISP-vergunning.",
    "authType": "oauth2",
    "scopes": [
      "payments.initiate",
      "payments.status"
    ],
    "dataCategories": [
      "betaalgegevens"
    ],
    "dataResidency": "EU_only",
    "zeroDataRetention": true,
    "riskContribution": 80,
    "status": "in validatie",
    "docsUrl": "bn-agent-docs.html#connectors"
  },
  {
    "connectorId": "bnc:connector:mollie-payments",
    "name": "Mollie Payments",
    "provider": "Mollie",
    "category": "Betalen",
    "version": "2.6.0",
    "description": "Betalingen, terugbetalingen en betaalstatussen voor webshops en facturatie. Transactiedata blijft bij Mollie; retentieparagraaf verplicht.",
    "authType": "apiKey",
    "scopes": [
      "payments.read",
      "payments.write",
      "refunds.write"
    ],
    "dataCategories": [
      "betaalgegevens",
      "klantgegevens"
    ],
    "dataResidency": "EU_only",
    "zeroDataRetention": false,
    "riskContribution": 55,
    "status": "actief",
    "integrity": {
      "manifestHash": "a1c6a51cf864205b0f1997d12852977ebb2bb6cb59601bd631456912ba6d1127",
      "signedAt": "2026-07-11T08:00:00Z"
    },
    "docsUrl": "bn-agent-docs.html#connectors"
  },
  {
    "connectorId": "bnc:connector:sepa-incassobatch",
    "name": "SEPA-incassobatch",
    "provider": "Betaaldienstverleners (EPC-schema)",
    "category": "Betalen",
    "version": "1.9.0",
    "description": "Aanlevering en statusopvolging van SEPA-incassobatches. Batches worden pas uitgevoerd na de HITL-gate van de afnemer.",
    "authType": "mtls",
    "scopes": [
      "incasso.submit",
      "incasso.status"
    ],
    "dataCategories": [
      "betaalgegevens",
      "persoonsgegevens"
    ],
    "dataResidency": "EU_only",
    "zeroDataRetention": true,
    "riskContribution": 65,
    "status": "actief",
    "integrity": {
      "manifestHash": "3522ed1af82cb2a40b5263accadcd93cca1dd802378b2dbe141ca31f783419ef",
      "signedAt": "2026-07-11T08:00:00Z"
    },
    "docsUrl": "bn-agent-docs.html#connectors"
  },
  {
    "connectorId": "bnc:connector:screen-scraping-legacy",
    "name": "Rekeninginformatie via screen-scraping (legacy)",
    "provider": "BN Agent",
    "category": "Betalen",
    "version": "1.0.0",
    "description": "Legacy-koppeling van vóór de PSD2-RTS. Gedeprecieerd: vervangen door de PSD2 AIS-connector; nieuwe koppelingen zijn geblokkeerd.",
    "authType": "apiKey",
    "scopes": [
      "accounts.scrape"
    ],
    "dataCategories": [
      "betaalgegevens",
      "inloggegevens"
    ],
    "dataResidency": "EER",
    "zeroDataRetention": false,
    "riskContribution": 90,
    "status": "gedeprecieerd",
    "integrity": {
      "manifestHash": "9a0dfa7ea6540d6e40450b365800116d951d3f3cf779550607997f8a4e47eaea",
      "signedAt": "2026-07-11T08:00:00Z"
    },
    "docsUrl": "bn-agent-docs.html#connectors"
  },
  {
    "connectorId": "bnc:connector:sivi-afs-polisdata",
    "name": "SIVI AFS-polisdata",
    "provider": "SIVI-ketenpartijen",
    "category": "Verzekeren",
    "version": "2.0.0",
    "description": "Polis- en claimgegevens volgens het SIVI All Finance Standaard-datamodel, uitgewisseld binnen de verzekeringsketen van de afnemer.",
    "authType": "mtls",
    "scopes": [
      "polis.read",
      "claim.read"
    ],
    "dataCategories": [
      "polisgegevens",
      "persoonsgegevens"
    ],
    "dataResidency": "NL_only",
    "zeroDataRetention": true,
    "riskContribution": 45,
    "status": "actief",
    "integrity": {
      "manifestHash": "03ca55939bfd998508e9a22ace4876f1ad13dc3887de204e5f330d471126bcdf",
      "signedAt": "2026-07-11T08:00:00Z"
    },
    "docsUrl": "bn-agent-docs.html#connectors"
  },
  {
    "connectorId": "bnc:connector:cis-databank",
    "name": "CIS-databank (claims & fraude)",
    "provider": "Stichting CIS",
    "category": "Verzekeren",
    "version": "1.7.0",
    "description": "Claimhistorie en fraude-indicatoren voor verzekeraars en gevolmachtigden. Elke raadpleging wordt gelogd conform het CIS-protocol en is inzichtelijk voor de betrokkene.",
    "authType": "mtls",
    "scopes": [
      "cis.check"
    ],
    "dataCategories": [
      "claimhistorie",
      "persoonsgegevens"
    ],
    "dataResidency": "NL_only",
    "zeroDataRetention": true,
    "riskContribution": 65,
    "status": "actief",
    "integrity": {
      "manifestHash": "7a6750504de682d4b670bae3a6c33cc6a97b5b610c12c936eed5bc0841eda3a4",
      "signedAt": "2026-07-11T08:00:00Z"
    },
    "docsUrl": "bn-agent-docs.html#connectors"
  },
  {
    "connectorId": "bnc:connector:afas-profit",
    "name": "AFAS Profit",
    "provider": "AFAS Software",
    "category": "Boekhouding",
    "version": "1.12.0",
    "description": "Financiële en HR-basisdata via GetConnectors; schrijven uitsluitend via expliciet vrijgegeven UpdateConnectors van de afnemer.",
    "authType": "apiKey",
    "scopes": [
      "getconnector.read",
      "updateconnector.write"
    ],
    "dataCategories": [
      "boekhouding",
      "hr_basis"
    ],
    "dataResidency": "NL_only",
    "zeroDataRetention": false,
    "riskContribution": 30,
    "status": "actief",
    "integrity": {
      "manifestHash": "c0d9d46d47b558837061745ed2875bf3d7db90f5a732539b04d3f0b5437f645b",
      "signedAt": "2026-07-11T08:00:00Z"
    },
    "docsUrl": "bn-agent-docs.html#connectors"
  },
  {
    "connectorId": "bnc:connector:twinfield",
    "name": "Twinfield Boekhouden",
    "provider": "Wolters Kluwer",
    "category": "Boekhouding",
    "version": "2.3.0",
    "description": "Grootboek, debiteuren en factuurstatussen. Schrijfscopes beperkt tot conceptboekingen; definitief boeken blijft bij de afnemer.",
    "authType": "oauth2",
    "scopes": [
      "accounting.read",
      "accounting.write"
    ],
    "dataCategories": [
      "boekhouding",
      "facturen"
    ],
    "dataResidency": "EU_only",
    "zeroDataRetention": false,
    "riskContribution": 30,
    "status": "actief",
    "integrity": {
      "manifestHash": "df58d63d119d1279b556a554ef4c90839811241c26781cd1f5e355df35ad592d",
      "signedAt": "2026-07-11T08:00:00Z"
    },
    "docsUrl": "bn-agent-docs.html#connectors"
  },
  {
    "connectorId": "bnc:connector:moneybird",
    "name": "Moneybird",
    "provider": "Moneybird",
    "category": "Boekhouding",
    "version": "1.4.0",
    "description": "Verkoopfacturen en documenten voor ZZP en MKB. Alleen-lezen; facturen versturen blijft een handeling van de afnemer.",
    "authType": "oauth2",
    "scopes": [
      "sales_invoices.read",
      "documents.read"
    ],
    "dataCategories": [
      "facturen",
      "boekhouding"
    ],
    "dataResidency": "EU_only",
    "zeroDataRetention": true,
    "riskContribution": 20,
    "status": "actief",
    "integrity": {
      "manifestHash": "ec1beef61a8f3527add3ae627c680dcf25aee5003d7cb4035fffb096ac86df2f",
      "signedAt": "2026-07-11T08:00:00Z"
    },
    "docsUrl": "bn-agent-docs.html#connectors"
  },
  {
    "connectorId": "bnc:connector:sap-s4hana-odata",
    "name": "SAP S/4HANA OData",
    "provider": "SAP",
    "category": "Boekhouding",
    "version": "1.0.0",
    "description": "ERP-ontsluiting (business partners, orders) binnen de SAP-tenant van de afnemer. Veldautorisatie volgt de SAP-rol van de integratiegebruiker.",
    "authType": "oauth2",
    "scopes": [
      "business_partner.read",
      "sales_order.read"
    ],
    "dataCategories": [
      "erp",
      "klantgegevens"
    ],
    "dataResidency": "EU_only",
    "zeroDataRetention": false,
    "riskContribution": 50,
    "status": "actief",
    "integrity": {
      "manifestHash": "2531aaaa9bfa56bd052e416ec8f9eff03fd1039368574e2125532d720a0a0aba",
      "signedAt": "2026-07-11T08:00:00Z"
    },
    "docsUrl": "bn-agent-docs.html#connectors"
  },
  {
    "connectorId": "bnc:connector:nmbrs-payroll",
    "name": "Nmbrs Payroll",
    "provider": "Visma Nmbrs",
    "category": "HR & payroll",
    "version": "2.1.0",
    "description": "Werknemers- en salarisgegevens voor verzuim- en HR-analyses. Salarisdata wordt gepseudonimiseerd vóór levering aan agents.",
    "authType": "oauth2",
    "scopes": [
      "employees.read",
      "payroll.read"
    ],
    "dataCategories": [
      "salarisgegevens",
      "persoonsgegevens"
    ],
    "dataResidency": "EU_only",
    "zeroDataRetention": true,
    "riskContribution": 55,
    "status": "actief",
    "integrity": {
      "manifestHash": "861c62cabad0a0c96cf08eff3660aca7096409316df4bc09fe10b3af4db26b0e",
      "signedAt": "2026-07-11T08:00:00Z"
    },
    "docsUrl": "bn-agent-docs.html#connectors"
  },
  {
    "connectorId": "bnc:connector:visma-raet-hr",
    "name": "Visma Raet HR Core",
    "provider": "Visma Raet",
    "category": "HR & payroll",
    "version": "1.9.0",
    "description": "HR-stamgegevens en contractdata uit HR Core Beaufort/Youforce-omgevingen van de afnemer. Alleen-lezen.",
    "authType": "oauth2",
    "scopes": [
      "hr.employees.read",
      "hr.contracts.read"
    ],
    "dataCategories": [
      "hr",
      "persoonsgegevens"
    ],
    "dataResidency": "EU_only",
    "zeroDataRetention": true,
    "riskContribution": 50,
    "status": "actief",
    "integrity": {
      "manifestHash": "73e29ec637547e3fa44983ce0dac0ec668741b44c691c1c9a5668a4dfc128952",
      "signedAt": "2026-07-11T08:00:00Z"
    },
    "docsUrl": "bn-agent-docs.html#connectors"
  },
  {
    "connectorId": "bnc:connector:validsign",
    "name": "ValidSign e-handtekening",
    "provider": "ValidSign",
    "category": "Documenten & ondertekenen",
    "version": "3.0.0",
    "description": "Aanmaken en opvolgen van ondertekenrondes (eIDAS-conform). Agents bereiden enveloppen voor; verzenden vereist de HITL-gate van de afnemer.",
    "authType": "oauth2",
    "scopes": [
      "envelope.create",
      "envelope.status"
    ],
    "dataCategories": [
      "documenten",
      "persoonsgegevens"
    ],
    "dataResidency": "EU_only",
    "zeroDataRetention": true,
    "riskContribution": 35,
    "status": "actief",
    "integrity": {
      "manifestHash": "4afb042a9376685f33bf0555178881953d658633be21ecb9665dfaba7f0493af",
      "signedAt": "2026-07-11T08:00:00Z"
    },
    "docsUrl": "bn-agent-docs.html#connectors"
  },
  {
    "connectorId": "bnc:connector:peppol-access-point",
    "name": "Peppol Access Point",
    "provider": "OpenPeppol-serviceproviders",
    "category": "Documenten & ondertekenen",
    "version": "1.2.0",
    "description": "Versturen en ontvangen van e-facturen (UBL) via het Peppol-netwerk. Documenten worden na doorlevering direct gewist.",
    "authType": "mtls",
    "scopes": [
      "invoice.send",
      "invoice.receive"
    ],
    "dataCategories": [
      "facturen",
      "bedrijfsgegevens"
    ],
    "dataResidency": "EU_only",
    "zeroDataRetention": true,
    "riskContribution": 25,
    "status": "actief",
    "integrity": {
      "manifestHash": "d7bf0dde5d9536726c003c847430a1e14987369d78e15c35616df94174d9b478",
      "signedAt": "2026-07-11T08:00:00Z"
    },
    "docsUrl": "bn-agent-docs.html#connectors"
  },
  {
    "connectorId": "bnc:connector:bird-messaging",
    "name": "Bird berichten (SMS/WhatsApp)",
    "provider": "Bird",
    "category": "Communicatie & berichten",
    "version": "2.0.0",
    "description": "Transactionele berichten via SMS en WhatsApp Business. Uitsluitend opt-in-ontvangers; afleverstatussen worden 30 dagen bewaard.",
    "authType": "apiKey",
    "scopes": [
      "sms.send",
      "whatsapp.send"
    ],
    "dataCategories": [
      "contactgegevens",
      "berichten"
    ],
    "dataResidency": "EU_only",
    "zeroDataRetention": false,
    "riskContribution": 35,
    "status": "actief",
    "integrity": {
      "manifestHash": "2fe6aaebb02e4662367a0ca89495f0a7c74cbad2db51bc21c0bc3a990108d500",
      "signedAt": "2026-07-11T08:00:00Z"
    },
    "docsUrl": "bn-agent-docs.html#connectors"
  },
  {
    "connectorId": "bnc:connector:postnl-verzendservice",
    "name": "PostNL verzendservice",
    "provider": "PostNL",
    "category": "Logistiek & e-commerce",
    "version": "1.5.0",
    "description": "Zendingen aanmaken en volgen; adresvalidatie inbegrepen. Adresgegevens worden na labelgeneratie direct gewist.",
    "authType": "apiKey",
    "scopes": [
      "shipment.create",
      "track.read"
    ],
    "dataCategories": [
      "adresgegevens",
      "contactgegevens"
    ],
    "dataResidency": "NL_only",
    "zeroDataRetention": true,
    "riskContribution": 20,
    "status": "actief",
    "integrity": {
      "manifestHash": "6c95e76947ae38a9ebfcc09c70bebcc2f8811f7e70bb4044fdacaa3d77c318ac",
      "signedAt": "2026-07-11T08:00:00Z"
    },
    "docsUrl": "bn-agent-docs.html#connectors"
  },
  {
    "connectorId": "bnc:connector:medmij-fhir-gateway",
    "name": "MedMij FHIR-gateway",
    "provider": "MedMij-deelnemers",
    "category": "Zorg",
    "version": "0.9.0",
    "description": "Uitwisseling van gezondheidsgegevens (FHIR) binnen het MedMij-afsprakenstelsel. In validatie: vereist MedMij-label van de afnemer en aparte Boek VI-toetsing per agent.",
    "authType": "mtls",
    "scopes": [
      "fhir.patient.read",
      "fhir.observation.read"
    ],
    "dataCategories": [
      "medische_gegevens",
      "bsn"
    ],
    "dataResidency": "NL_only",
    "zeroDataRetention": true,
    "riskContribution": 85,
    "status": "in validatie",
    "docsUrl": "bn-agent-docs.html#connectors"
  },
  {
    "connectorId": "bnc:connector:vecozo-declaraties",
    "name": "VECOZO declaratieservice",
    "provider": "VECOZO",
    "category": "Zorg",
    "version": "2.4.0",
    "description": "Indienen en opvolgen van zorgdeclaraties plus verzekeringsrechtcontrole (COV). Toegang uitsluitend met VECOZO-certificaat van de zorgaanbieder.",
    "authType": "mtls",
    "scopes": [
      "declaratie.submit",
      "declaratie.status",
      "cov.check"
    ],
    "dataCategories": [
      "declaraties",
      "persoonsgegevens"
    ],
    "dataResidency": "NL_only",
    "zeroDataRetention": true,
    "riskContribution": 50,
    "status": "actief",
    "integrity": {
      "manifestHash": "d0312ae36318266c276db34e6ead5d60c05c03d4bb53fa873f9f6aecc06b5422",
      "signedAt": "2026-07-11T08:00:00Z"
    },
    "docsUrl": "bn-agent-docs.html#connectors"
  },
  {
    "connectorId": "bnc:connector:cbs-statline",
    "name": "CBS StatLine OData",
    "provider": "CBS",
    "category": "Data & statistiek",
    "version": "4.0.0",
    "description": "Openbare statistieken (o.a. CPI voor huurindexatie, arbeidsmarkt, demografie) via de StatLine OData-feed. Open data, alleen-lezen.",
    "authType": "apiKey",
    "scopes": [
      "statline.read"
    ],
    "dataCategories": [
      "open_statistiek"
    ],
    "dataResidency": "NL_only",
    "zeroDataRetention": true,
    "riskContribution": 5,
    "status": "actief",
    "integrity": {
      "manifestHash": "bb5703202640bef6f673f97c8665440c7cca286f820832029cede412ad2bd9ab",
      "signedAt": "2026-07-11T08:00:00Z"
    },
    "docsUrl": "bn-agent-docs.html#connectors"
  },
  {
    "connectorId": "bnc:connector:eu-sanctielijsten",
    "name": "EU Consolidated Sanctions List",
    "provider": "Europese Commissie (FSF)",
    "category": "Compliance & sanctielijsten",
    "version": "1.6.0",
    "description": "Doorzoekbare geconsolideerde EU-sanctielijst voor Wwft-screening. Dagelijkse synchronisatie; elke hit wordt gelogd met lijstversie en tijdstip.",
    "authType": "apiKey",
    "scopes": [
      "sanctions.search",
      "sanctions.bulk.read"
    ],
    "dataCategories": [
      "sanctiedata"
    ],
    "dataResidency": "EU_only",
    "zeroDataRetention": true,
    "riskContribution": 20,
    "status": "actief",
    "integrity": {
      "manifestHash": "147dde41af8b9a6139e53e9c2b5d8ac6131d31dcebe1628c02f8c6f94e2b67e7",
      "signedAt": "2026-07-11T08:00:00Z"
    },
    "docsUrl": "bn-agent-docs.html#connectors"
  },
  {
    "connectorId": "bnc:connector:euronext-marktdata",
    "name": "Euronext Market Data",
    "provider": "Euronext",
    "category": "Data & statistiek",
    "version": "2.1.0",
    "description": "Koersen en referentiedata van Euronext-beurzen. Licentie- en redistributievoorwaarden van de afnemer bepalen de toegestane scope.",
    "authType": "mtls",
    "scopes": [
      "quotes.read",
      "referencedata.read"
    ],
    "dataCategories": [
      "marktdata"
    ],
    "dataResidency": "EU_only",
    "zeroDataRetention": false,
    "riskContribution": 25,
    "status": "actief",
    "integrity": {
      "manifestHash": "19f040ba3e3fc5554aa91aa3a488642c30c8a93605f82ff8d7976f24124a1db9",
      "signedAt": "2026-07-11T08:00:00Z"
    },
    "docsUrl": "bn-agent-docs.html#connectors"
  },
  {
    "connectorId": "bnc:connector:edsn-meetdata",
    "name": "EDSN meetdata (P4)",
    "provider": "EDSN",
    "category": "Energie & duurzaamheid",
    "version": "1.3.0",
    "description": "Slimme-metermeetdata via het centrale marktfacilieringssysteem. Uitsluitend met machtiging van de aansluitinghouder; data wordt geaggregeerd geleverd.",
    "authType": "mtls",
    "scopes": [
      "meetdata.read"
    ],
    "dataCategories": [
      "energiedata",
      "persoonsgegevens"
    ],
    "dataResidency": "NL_only",
    "zeroDataRetention": true,
    "riskContribution": 50,
    "status": "actief",
    "integrity": {
      "manifestHash": "f0dd2edbff4a57d5c1480654b4cca4591099db9917260f519dc13182598cd294",
      "signedAt": "2026-07-11T08:00:00Z"
    },
    "docsUrl": "bn-agent-docs.html#connectors"
  },
  {
    "connectorId": "bnc:connector:ns-reisinformatie",
    "name": "NS Reisinformatie",
    "provider": "Nederlandse Spoorwegen",
    "category": "Mobiliteit & IoT",
    "version": "3.1.0",
    "description": "Reisadviezen, actuele vertrektijden en storingsinformatie. Open data, alleen-lezen, geen persoonsgegevens.",
    "authType": "apiKey",
    "scopes": [
      "reisadvies.read",
      "storingen.read"
    ],
    "dataCategories": [
      "reisinformatie"
    ],
    "dataResidency": "NL_only",
    "zeroDataRetention": true,
    "riskContribution": 5,
    "status": "actief",
    "integrity": {
      "manifestHash": "213e554227cdc08f67e88bb5f078e4108adddaf4d7356cbf961f6877372f8d95",
      "signedAt": "2026-07-11T08:00:00Z"
    },
    "docsUrl": "bn-agent-docs.html#connectors"
  }
];

export const CONNECTOR_STATUS_LABELS: Record<string, string> = {
  "actief": "Actief — gecertificeerd en inzetbaar",
  "in validatie": "In validatie — nog niet vrijgegeven",
  "gedeprecieerd": "Gedeprecieerd — uitfasering loopt"
};

export const CONNECTOR_AUTH_LABELS: Record<string, string> = {
  "oauth2": "OAuth 2.1",
  "apiKey": "API-sleutel",
  "mtls": "mTLS-certificaat"
};
