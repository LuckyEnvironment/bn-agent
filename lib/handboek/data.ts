import type { Boek } from "./types";

/**
 * BN Agent — Handboek Agent Communicatieprotocol, Boeken I t/m VIII.
 *
 * Integratiebeslissing Boek VIII (Risicoscoring & Inhuurprotocol):
 * Boek VIII blijft een zelfstandig boek — het is reeds volledig uitgewerkt en
 * wordt niet opnieuw opgebouwd. De verankering in de I–VI-structuur gebeurt op
 * drie punten: Boek II Titel 3 verankert de Risicofactor en Vertrouwensscore
 * als kwantificering van het risicoprofiel (Art. 2.7–2.8), Boek IV Titel 2
 * maakt de Tiermatrix onderdeel van het toetsingskader (Art. 4.4–4.5), en
 * Boek V operationaliseert de Tier-gevolgen als afdwingbare toezichtmomenten
 * (Art. 5.2–5.7, gekoppeld aan het veld humanOversightMeasures).
 */

export const BOEKEN: Boek[] = [
  {
    nr: "I",
    slug: "boek-i",
    naam: "Definities en toepassingsgebied",
    status: "vastgesteld",
    considerans:
      "Dit Boek bepaalt wat onder de kernbegrippen van het Handboek wordt verstaan en op wie en wat het Handboek van toepassing is. Het legt de gelaagdheid vast tussen het kernhandboek, sectorbijlagen en het certificeringsdossier per agent.",
    titels: [
      {
        nr: 1,
        naam: "Definities",
        artikelen: [
          {
            nr: "1.1",
            titel: "Begripsbepalingen",
            leden: [
              "Agent: een geautomatiseerd systeem dat op basis van kunstmatige intelligentie zelfstandig of onder menselijk toezicht taken uitvoert, en dat via een Agent Card in de Discovery Registry is beschreven.",
              "Agent Card: de gestandaardiseerde, machine-leesbare beschrijving van een agent conform de Agent Card Standaard v1.0, met inbegrip van identiteit, capabilities, certificering, toezichtmaatregelen en risicoscoring.",
              "Connector: de technische koppeling waarmee een agent aan het platform of aan een andere agent is verbonden.",
              "Agentverkeer: elke geautomatiseerde uitwisseling van berichten of data tussen agents onderling of tussen een agent en het platform.",
              "Verificerende instantie: BN Agent dan wel een onafhankelijke aangemelde instantie die de juistheid van een Agent Card en de daaraan ten grondslag liggende certificering vaststelt (Boek VI).",
              "Vendor: de onderneming die een agent aanbiedt via de Discovery Registry.",
              "Afnemende onderneming: de partij die een agent inhuurt via Koop of Lease.",
              "Principaal: de natuurlijke of rechtspersoon voor wiens rekening en onder wiens verantwoordelijkheid een agent handelt (Boek II).",
              "Discovery Registry: het door BN Agent gehouden openbare register van Agent Cards.",
              "Escrow-laag: de logisch gescheiden dienst waarlangs agentverkeer met cliëntgevoelige of gereguleerde data auditeerbaar wordt afgewikkeld.",
            ],
            machineFields: ["bna.schemaVersion", "bna.agentId"],
          },
        ],
      },
      {
        nr: 2,
        naam: "Toepassingsgebied en gelaagdheid",
        artikelen: [
          {
            nr: "1.2",
            titel: "Toepassingsgebied",
            leden: [
              "Dit Handboek is van toepassing op elke agent die in de Discovery Registry is opgenomen, op elke vendor die een agent aanbiedt en op elke afnemende onderneming die een agent inhuurt, ongeacht sector, land of distributiemodel.",
              "Het Handboek is tevens van toepassing op agentverkeer dat via de escrow-laag loopt, ook wanneer een der partijen niet in de registry is opgenomen.",
            ],
          },
          {
            nr: "1.3",
            titel: "Gelaagdheid van het normenkader",
            leden: [
              "Het normenkader kent drie lagen: het kernhandboek (Boeken I t/m VIII), dat geldt voor alle agents en alle sectoren; sectorbijlagen, die generieke artikelen sectorspecifiek invullen (Boek III); en het certificeringsdossier per agent, waarin Risicofactor, Vertrouwensscore, Inhuurtier en de toepasselijke artikelen per agent zijn vastgelegd.",
              "Bij strijd tussen lagen geldt de strengste norm (Art. 3.2).",
            ],
            machineFields: ["bna.riskScoring.applicableArticles"],
            verwijzingen: ["Art. 3.2"],
          },
          {
            nr: "1.4",
            titel: "Verhouding tot dwingend recht",
            leden: [
              "Dit Handboek laat dwingendrechtelijke verplichtingen uit onder meer de EU AI Act, de AVG, de Wwft en DORA onverlet; bij strijd prevaleert het dwingend recht.",
              "Certificering door BN Agent houdt geen juridisch advies of vrijwaring in en ontslaat de vendor noch de afnemende onderneming van eigen wettelijke verantwoordelijkheden.",
            ],
          },
        ],
      },
    ],
  },
  {
    nr: "II",
    slug: "boek-ii",
    naam: "Risicoprofiel en identiteit",
    status: "vastgesteld",
    considerans:
      "Dit Boek regelt de identiteitskoppeling van een agent aan een principaal — analoog aan lastgeving en volmacht in Boek 3 van het Burgerlijk Wetboek — en de samenstelling van het risicoprofiel dat door Boek VIII wordt gekwantificeerd.",
    titels: [
      {
        nr: 1,
        naam: "Identiteit en vertegenwoordiging",
        artikelen: [
          {
            nr: "2.1",
            titel: "Identiteitsplicht",
            leden: [
              "Elke agent in de Discovery Registry is herleidbaar tot een geïdentificeerde vendor met inschrijving in een handelsregister of gelijkwaardig register.",
              "De identiteit wordt vastgelegd in het provider-blok van de Agent Card en maakt deel uit van de ondertekende, gehashte card.",
            ],
            machineFields: ["provider.organization", "provider.kvkNumber", "bna.cardHash"],
          },
          {
            nr: "2.2",
            titel: "De agent als vertegenwoordiger",
            leden: [
              "Een agent handelt als vertegenwoordiger van een principaal. Handelingen die de agent binnen de gecertificeerde reikwijdte verricht, worden toegerekend aan de principaal, analoog aan de regeling van lastgeving en volmacht (BW Boek 3, Titel 3).",
              "Handelingen buiten de gecertificeerde reikwijdte binden de principaal niet jegens BN Agent, maar kunnen leiden tot schorsing conform Boek VIII Titel 9.",
              "De reikwijdte van de vertegenwoordiging is de reikwijdte van de gecertificeerde capabilities zoals opgenomen in de Agent Card.",
            ],
            machineFields: ["bna.capabilities"],
            verwijzingen: ["Art. 8.27"],
          },
          {
            nr: "2.3",
            titel: "Geen toelating zonder principaal",
            leden: [
              "Een agent zonder identificeerbare principaal wordt niet tot de Discovery Registry toegelaten.",
              "Overdracht van een agent aan een andere principaal vereist hercertificering conform Boek VI.",
            ],
          },
          {
            nr: "2.4",
            titel: "Cryptografische identiteitskoppeling",
            leden: [
              "De koppeling tussen agent en principaal wordt cryptografisch bevestigd door de ondertekening van de Agent Card door BN Agent (Art. 6.4) na verificatie van de identiteit van de vendor.",
              "Bij lease-distributie publiceert de vendor de Agent Card tevens op de eigen infrastructuur via de /.well-known/agent.json-conventie (Art. 6.5).",
            ],
            machineFields: ["bna.wellKnownUrl"],
            verwijzingen: ["Art. 6.4", "Art. 6.5"],
          },
        ],
      },
      {
        nr: 2,
        naam: "Risicoprofiel",
        artikelen: [
          {
            nr: "2.5",
            titel: "Samenstelling van het risicoprofiel",
            leden: [
              "Het risicoprofiel van een agent bestaat uit: de sector waarin de agent opereert, de EU AI Act-risicoklasse, de capability-categorie(ën), de datagevoeligheid van de verwerkte gegevens en het autonomieniveau.",
              "Elk element van het risicoprofiel is als machine-leesbaar veld in de Agent Card opgenomen en is niet door de vendor eenzijdig wijzigbaar na certificering.",
            ],
            machineFields: [
              "bna.sector",
              "bna.certification.euAiAct.riskClass",
              "bna.capabilities[].category",
              "bna.capabilities[].dataSensitivity",
              "bna.capabilities[].autonomyLevel",
            ],
          },
          {
            nr: "2.6",
            titel: "Meldplicht bij wijziging",
            leden: [
              "De vendor meldt elke wijziging in capability, sector, doeleinde of dataverwerking onverwijld aan BN Agent.",
              "Een gemelde wijziging leidt tot herberekening van de Risicofactor (Art. 8.24) en kan leiden tot herverificatie conform Boek VI.",
            ],
            verwijzingen: ["Art. 8.24", "Art. 6.6"],
          },
        ],
      },
      {
        nr: 3,
        naam: "Kwantificering: Risicofactor en Vertrouwensscore",
        artikelen: [
          {
            nr: "2.7",
            titel: "Risicofactor",
            leden: [
              "Het risicoprofiel van Art. 2.5 wordt gekwantificeerd in de Risicofactor overeenkomstig Boek VIII, Artikelen 8.3 t/m 8.6 (componenten, gewichten, berekeningswijze en drempelwaarden).",
              "De Risicofactor wordt door BN Agent berekend en in het riskScoring-blok van de Agent Card vastgelegd; door de vendor aangeleverde waarden zijn zonder rechtsgevolg.",
            ],
            machineFields: [
              "bna.riskScoring.riskFactorScore",
              "bna.riskScoring.riskFactorClass",
              "bna.riskScoring.riskFactorComponents",
            ],
            verwijzingen: ["Art. 8.3", "Art. 8.4", "Art. 8.5", "Art. 8.6"],
          },
          {
            nr: "2.8",
            titel: "Vertrouwensscore",
            leden: [
              "De dynamische betrouwbaarheid van een agent wordt uitgedrukt in de Vertrouwensscore overeenkomstig Boek VIII, Artikelen 8.7 t/m 8.10.",
              "De Vertrouwensscore maakt deel uit van de identiteitsreputatie van de agent en diens vendor en werkt door in de Inhuurtier (Art. 4.5).",
            ],
            machineFields: [
              "bna.riskScoring.trustScore",
              "bna.riskScoring.trustScoreLastCalculated",
            ],
            verwijzingen: ["Art. 8.7", "Art. 8.8", "Art. 8.9", "Art. 8.10", "Art. 4.5"],
          },
        ],
      },
    ],
  },
  {
    nr: "III",
    slug: "boek-iii",
    naam: "Sectorale reglementen",
    status: "vastgesteld",
    considerans:
      "Dit Boek regelt hoe sectorbijlagen de generieke artikelen van het kernhandboek sectorspecifiek invullen. Sectoren zijn data, geen code: een nieuwe sector wordt toegevoegd via de registry (code, risicogewicht, regelgeving) zonder wijziging van dit Handboek.",
    titels: [
      {
        nr: 1,
        naam: "Algemeen systeem",
        artikelen: [
          {
            nr: "3.1",
            titel: "Werking van sectorbijlagen",
            leden: [
              "De sectorcode in de Agent Card bepaalt welke sectorbijlage van toepassing is.",
              "Een sectorbijlage kan uitsluitend aanvullen of aanscherpen; zij kan geen verplichting uit het kernhandboek verlichten.",
            ],
            machineFields: ["bna.sector"],
          },
          {
            nr: "3.2",
            titel: "Cumulatie en strengste norm",
            leden: [
              "Indien op een agent meerdere normen van toepassing zijn, geldt de strengste norm.",
              "Bij sectoroverschrijdende verwerking gelden de bijlagen van alle betrokken sectoren cumulatief; verwerking buiten de gecertificeerde sector is verscherpte toetsing in de zin van Art. 8.18.",
            ],
            verwijzingen: ["Art. 8.18"],
          },
        ],
      },
      {
        nr: 2,
        naam: "Financiële dienstverlening",
        artikelen: [
          {
            nr: "3.3",
            titel: "Wwft-agents",
            leden: [
              "Agents die cliëntenonderzoek, transactiemonitoring of sanctie-screening verrichten kwalificeren als ondersteuning van Wwft-processen; de afnemende instelling blijft zelf normadressaat van de Wwft.",
              "Voor deze agents geldt te allen tijde verscherpte toetsing bij eerste inhuur en is Inhuurtier A uitgesloten zolang de Vertrouwensscore op de basiswaarde staat.",
              "De uitkomst van een screening die tot afwijzing of blokkering kan leiden, is een onomkeerbare uitkomst in de zin van Art. 8.19 en vereist menselijke goedkeuring per transactie.",
            ],
            verwijzingen: ["Art. 8.18", "Art. 8.19", "Art. 5.7"],
          },
          {
            nr: "3.4",
            titel: "DORA-uitlijning",
            leden: [
              "Een via Lease ingehuurde agent kwalificeert voor financiële instellingen als ICT-dienst van een derde aanbieder; de instelling neemt de agent op in haar register van ICT-derden.",
              "De vendor ondersteunt de exitstrategie van de instelling: bij beëindiging worden alle via de escrow-laag verwerkte gegevens aantoonbaar verwijderd of overgedragen.",
              "Ernstige incidenten in de dienstverlening worden binnen 24 uur aan BN Agent en aan de afnemende instelling gemeld en verwerkt in de Vertrouwensscore (Art. 8.8).",
            ],
            verwijzingen: ["Art. 8.8"],
          },
        ],
      },
      {
        nr: 3,
        naam: "Juridische sector",
        artikelen: [
          {
            nr: "3.5",
            titel: "Beroepsgeheim en verschoningsrecht",
            leden: [
              "Agents die dossiers verwerken waarop beroepsgeheim of verschoningsrecht rust, verwerken data uitsluitend federated (bij de bron) of in een afgeschermde sandbox; centrale opslag op het platform is uitgesloten.",
              "De Agent Card vermeldt de verwerkingslocatie per capability in de datacategorieën.",
            ],
            machineFields: ["bna.capabilities[].dataCategories"],
          },
        ],
      },
      {
        nr: 4,
        naam: "HR en werving",
        artikelen: [
          {
            nr: "3.6",
            titel: "Wervings- en selectie-agents",
            leden: [
              "Agents voor werving, selectie of beoordeling van natuurlijke personen vallen onder EU AI Act bijlage III en worden ten minste als hoog risico geclassificeerd.",
              "Een afwijzingsbeslissing is steeds een onomkeerbare, voor betrokkene nadelige uitkomst; Art. 5.7 en Art. 8.19 zijn onverkort van toepassing.",
            ],
            verwijzingen: ["Art. 5.7", "Art. 8.19"],
          },
        ],
      },
      {
        nr: 5,
        naam: "Zorg",
        artikelen: [
          {
            nr: "3.7",
            titel: "Gezondheidsgegevens",
            leden: [
              "Agents die gezondheidsgegevens verwerken, verwerken bijzondere persoonsgegevens in de zin van AVG artikel 9; de datagevoeligheidscomponent van de Risicofactor bedraagt steeds het maximum (Art. 8.4 lid 5).",
              "Indien de agent kwalificeert als medisch hulpmiddel, is toelating tot de registry pas mogelijk na CE-markering onder de MDR.",
            ],
            verwijzingen: ["Art. 8.4 lid 5"],
          },
        ],
      },
      {
        nr: 6,
        naam: "Uitbreiding",
        artikelen: [
          {
            nr: "3.8",
            titel: "Toevoeging van sectoren",
            leden: [
              "Een nieuwe sector wordt toegevoegd door vaststelling van sectorcode, Nederlandse en Engelse naam, risicogewicht (Art. 8.4 lid 2) en toepasselijke regelgeving in de registry.",
              "Zolang voor een sector geen bijlage is vastgesteld, gelden uitsluitend het kernhandboek en het risicogewicht van de sector.",
            ],
            verwijzingen: ["Art. 8.4 lid 2"],
          },
        ],
      },
    ],
  },
  {
    nr: "IV",
    slug: "boek-iv",
    naam: "Risiconormen",
    status: "vastgesteld",
    considerans:
      "Dit Boek bevat het toetsingskader per risicoklasse: welke bewijslast en testdekking bij certificering geldt, wanneer een aangemelde instantie vereist is, en hoe de kwantificering van Boek VIII doorwerkt in de operationele voorwaarden.",
    titels: [
      {
        nr: 1,
        naam: "Toetsingskader",
        artikelen: [
          {
            nr: "4.1",
            titel: "Toetsing per risicoklasse",
            leden: [
              "Risicoklasse Laag: zelfdeclaratie door de vendor met documentcontrole en steekproefsgewijze functionele verificatie door BN Agent.",
              "Risicoklasse Midden: volledige documentbeoordeling, functionele test van elke gecertificeerde capability en beoordeling van de dataverwerkingsketen.",
              "Risicoklasse Hoog: volledige audit met inbegrip van adversariële tests, beoordeling van het kwaliteitsmanagementsysteem van de vendor en, waar Art. 4.7 dat vereist, conformiteitsbeoordeling door een aangemelde instantie.",
            ],
            verwijzingen: ["Art. 8.6", "Art. 4.7"],
          },
          {
            nr: "4.2",
            titel: "Bewijslast",
            leden: [
              "De bewijslast dat een agent aan de toepasselijke normen voldoet, rust op de vendor.",
              "Bij gerede twijfel kan de verificerende instantie aanvullend bewijs verlangen; het uitblijven daarvan leidt tot weigering of schorsing van de certificering.",
            ],
          },
          {
            nr: "4.3",
            titel: "Testdekking",
            leden: [
              "De aantoonbare testdekking van de gecertificeerde capabilities bedraagt ten minste: 70 procent bij risicoklasse Laag, 85 procent bij Midden en 95 procent bij Hoog.",
              "Bij risicoklasse Hoog omvat de testset tevens adversariële scenario's en randgevallen die representatief zijn voor de sector van inzet.",
            ],
          },
        ],
      },
      {
        nr: 2,
        naam: "Kwantificering en operationele voorwaarden",
        artikelen: [
          {
            nr: "4.4",
            titel: "Risicoklasse volgt Risicofactor",
            leden: [
              "De risicoklasse van een agent volgt uit de Risicofactor overeenkomstig Boek VIII Art. 8.6 (0–33 Laag, 34–66 Midden, 67–100 Hoog).",
              "Een agent met EU AI Act-klasse 'unacceptable' ontvangt geen Risicofactor, wordt niet gecertificeerd en wordt niet in de registry opgenomen (Art. 8.16 lid 2).",
            ],
            machineFields: ["bna.riskScoring.riskFactorClass"],
            verwijzingen: ["Art. 8.6", "Art. 8.16 lid 2"],
          },
          {
            nr: "4.5",
            titel: "Inhuurtier als operationele voorwaarde",
            leden: [
              "De combinatie van Risicoklasse en Vertrouwensscore bepaalt de Inhuurtier overeenkomstig de matrix van Art. 8.11.",
              "De Inhuurtier bepaalt de verplichte toezichtmomenten van Boek V; het platform dwingt deze af via het veld requiredConsentLevel in de Agent Card.",
            ],
            machineFields: [
              "bna.riskScoring.inhuurTier",
              "bna.riskScoring.requiredConsentLevel",
            ],
            verwijzingen: ["Art. 8.11", "Art. 8.12", "Art. 5.2"],
          },
        ],
      },
      {
        nr: 3,
        naam: "AVG-toetsing",
        artikelen: [
          {
            nr: "4.6",
            titel: "Zevenpuntstoetsing",
            leden: [
              "Elke certificering omvat een AVG-toetsing op zeven punten: verwerkingsgrondslag, doelbinding, dataminimalisatie, bewaartermijnen, beveiliging van de verwerking, borging van rechten van betrokkenen en de aanwezigheid van een verwerkersovereenkomst.",
              "De uitkomst per punt wordt machine-leesbaar vastgelegd in het certificeringsblok van de Agent Card.",
            ],
            machineFields: ["bna.certification.avgChecklist"],
          },
        ],
      },
      {
        nr: 4,
        naam: "Aangemelde instantie",
        artikelen: [
          {
            nr: "4.7",
            titel: "Vereiste van een aangemelde instantie",
            leden: [
              "Voor agents met EU AI Act-klasse 'high' waarvoor de EU AI Act (artikel 43) een conformiteitsbeoordeling door een aangemelde instantie voorschrijft, verricht BN Agent de certificering niet zelfstandig maar op basis van de beoordeling van die instantie.",
              "De identiteit van de aangemelde instantie wordt in de Agent Card vermeld.",
            ],
            machineFields: [
              "bna.certification.certifiedBy",
              "bna.certification.notifiedBodyName",
            ],
          },
        ],
      },
    ],
  },
  {
    nr: "V",
    slug: "boek-v",
    naam: "Menselijk toezicht",
    status: "vastgesteld",
    considerans:
      "Dit Boek bepaalt de verplichte human-in-the-loop-momenten. Elk toezichtmoment is gekoppeld aan het veld humanOversightMeasures in de Agent Card en wordt door het platform afgedwongen: een aanroep die een vereist toezichtmoment mist, wordt geblokkeerd.",
    titels: [
      {
        nr: 1,
        naam: "Algemene beginselen",
        artikelen: [
          {
            nr: "5.1",
            titel: "Doel en afdwingbaarheid",
            leden: [
              "Menselijk toezicht dient ertoe dat beslissingen met betekenisvolle gevolgen voor ondernemingen of betrokkenen herleidbaar zijn tot een bevoegd persoon.",
              "De toezichtmomenten van dit Boek zijn machine-leesbaar vastgelegd in het veld humanOversightMeasures; elke maatregel verwijst naar het artikelnummer waarop zij berust.",
              "Het platform weigert agentverkeer dat met de vastgelegde toezichtmaatregelen strijdt.",
            ],
            machineFields: ["bna.humanOversightMeasures"],
          },
        ],
      },
      {
        nr: 2,
        naam: "Verplichte toetsingsmomenten",
        artikelen: [
          {
            nr: "5.2",
            titel: "Beoordeling bij eerste inhuur",
            leden: [
              "Voor elke agent zonder inhuurgeschiedenis bij de betreffende afnemende onderneming is, ongeacht Inhuurtier, een eenmalige beoordeling door een bevoegd persoon vereist (Art. 8.17).",
            ],
            verwijzingen: ["Art. 8.17"],
          },
          {
            nr: "5.3",
            titel: "Verscherpte toetsing",
            leden: [
              "Verscherpte toetsing is verplicht in de gevallen van Art. 8.18, waaronder een agent zonder trackrecord, drempeloverschrijding, sectoroverschrijdende verwerking, een monitoringsignaal of een gedaalde Vertrouwensscore.",
            ],
            verwijzingen: ["Art. 8.18"],
          },
          {
            nr: "5.4",
            titel: "Steekproefcontrole",
            leden: [
              "Bij autonome werking (Tier A, en Tier B na goedgekeurde eerste inhuur) beoordeelt een bevoegd persoon periodiek een steekproef van ten minste vijf procent van de transacties (Art. 8.14 lid 2).",
              "De steekproefresultaten worden bewaard en zijn opvraagbaar bij hercertificering.",
            ],
            verwijzingen: ["Art. 8.14 lid 2"],
          },
          {
            nr: "5.5",
            titel: "Drempelgebonden goedkeuring",
            leden: [
              "Bij Tier C is voorafgaande goedkeuring door een bevoegd persoon vereist voor elke transactie boven de door de afnemende onderneming vastgestelde waarde- of volumedrempel (Art. 8.15 lid 2).",
              "De drempel mag worden verlaagd, maar niet worden verhoogd boven het door BN Agent vastgestelde maximum.",
            ],
            verwijzingen: ["Art. 8.15 lid 2"],
          },
          {
            nr: "5.6",
            titel: "Goedkeuring per transactie",
            leden: [
              "Bij Tier D is voorafgaande, uitdrukkelijke goedkeuring van een bevoegd persoon per individuele transactie vereist, zonder uitzondering (Art. 8.16 lid 1).",
            ],
            verwijzingen: ["Art. 8.16 lid 1"],
          },
          {
            nr: "5.7",
            titel: "Onomkeerbare uitkomsten",
            leden: [
              "Onverminderd de Inhuurtier is menselijke goedkeuring per transactie vereist wanneer de uitkomst van de agent onomkeerbaar is en een betrokkene nadelig kan raken, zoals afwijzing van een aanvraag, blokkering van een rekening of beëindiging van een overeenkomst (Art. 8.19).",
            ],
            verwijzingen: ["Art. 8.19"],
          },
        ],
      },
      {
        nr: 3,
        naam: "Vorm, registratie en afdwinging",
        artikelen: [
          {
            nr: "5.8",
            titel: "Registratie van toestemming",
            leden: [
              "Elke krachtens dit Boek vereiste toestemming wordt vastgelegd overeenkomstig Art. 8.20: identiteit en rol van de bevoegde persoon, tijdstip, Inhuurtier en scores ten tijde van goedkeuring, en de reikwijdte van de toestemming.",
              "De vastlegging geschiedt in het append-only auditlog van de escrow-laag en is niet achteraf wijzigbaar.",
            ],
            verwijzingen: ["Art. 8.20"],
          },
          {
            nr: "5.9",
            titel: "Machinale afdwinging",
            leden: [
              "Het veld requiredConsentLevel in de Agent Card bepaalt of een aanroep via de escrow-laag of de MCP-tools wordt geblokkeerd in afwachting van een geregistreerde toestemming (Art. 8.30 lid 3).",
              "Een geblokkeerde aanroep wordt hervat door verwijzing naar de geregistreerde toestemming.",
            ],
            machineFields: ["bna.riskScoring.requiredConsentLevel"],
            verwijzingen: ["Art. 8.30 lid 3"],
          },
        ],
      },
    ],
  },
  {
    nr: "VI",
    slug: "boek-vi",
    naam: "Verificatie",
    status: "vastgesteld",
    considerans:
      "Dit Boek regelt wie verifieert, hoe de integriteit van Agent Cards cryptografisch wordt geborgd, wanneer herverificatie plaatsvindt en welke velden van een Agent Card voor welke aanroeper zichtbaar zijn.",
    titels: [
      {
        nr: 1,
        naam: "Verificerende instanties",
        artikelen: [
          {
            nr: "6.1",
            titel: "Bevoegdheidsverdeling",
            leden: [
              "BN Agent treedt op als certificerende instantie voor agents in risicoklasse Laag en Midden.",
              "Voor risicoklasse Hoog geschiedt certificering op basis van de conformiteitsbeoordeling van een onafhankelijke aangemelde instantie waar Art. 4.7 dat vereist.",
            ],
            verwijzingen: ["Art. 4.7"],
          },
          {
            nr: "6.2",
            titel: "Onafhankelijkheid",
            leden: [
              "De verificerende instantie heeft geen financieel belang bij de uitkomst van een individuele certificering anders dan de vaste certificeringsvergoeding.",
              "Medewerkers die een certificering beoordelen, zijn niet betrokken bij de commerciële relatie met de betreffende vendor.",
            ],
          },
        ],
      },
      {
        nr: 2,
        naam: "Verificatieproces",
        artikelen: [
          {
            nr: "6.3",
            titel: "cardHash",
            leden: [
              "Van elke Agent Card wordt een cardHash berekend: de sha256-digest over de canonieke JSON-vorm van de card, met recursief gesorteerde sleutels en zonder witruimte, exclusief het signatures-blok en de cardHash zelf.",
              "Elke wijziging van de card leidt tot een nieuwe cardHash en daarmee tot een nieuw ondertekeningsmoment.",
            ],
            machineFields: ["bna.cardHash"],
          },
          {
            nr: "6.4",
            titel: "Ondertekening en attestatie",
            leden: [
              "BN Agent ondertekent de cardHash met een Ed25519-sleutel (EdDSA, JWS), uitgelijnd met de AgentCardSignature-structuur van A2A v1.0; de publieke sleutel is opvraagbaar via /.well-known/jwks.json.",
              "Het verify-endpoint retourneert een ondertekende attestatie die ten minste bevat: cardHashValid, certificationValid, de vervaldatum van de certificering en het tijdstip van de laatste controle.",
              "Een attestatie is 24 uur geldig; afnemers verifiëren de handtekening onafhankelijk met de gepubliceerde sleutel.",
            ],
            machineFields: ["signatures"],
          },
          {
            nr: "6.5",
            titel: "Well-known-conventie",
            leden: [
              "Elke lease-agent publiceert de eigen Agent Card op het adres /.well-known/agent.json van het domein waarop de agent wordt aangeboden.",
              "Afwijking tussen de aldaar gepubliceerde card en de in de registry ondertekende card is een herverificatie-trigger (Art. 6.6).",
            ],
            machineFields: ["bna.wellKnownUrl"],
            verwijzingen: ["Art. 6.6"],
          },
        ],
      },
      {
        nr: 3,
        naam: "Herverificatie en geldigheid",
        artikelen: [
          {
            nr: "6.6",
            titel: "Herverificatie-triggers",
            leden: [
              "Herverificatie vindt plaats bij: wijziging van capability, sector, doeleinde of dataverwerking (Art. 8.24); een gemeld incident of datalek; afwijking tussen registry-card en well-known-card; en ten minste jaarlijks, gelijktijdig met de integrale herbeoordeling van Art. 8.25.",
            ],
            verwijzingen: ["Art. 8.24", "Art. 8.25"],
          },
          {
            nr: "6.7",
            titel: "Geldigheidstermijnen",
            leden: [
              "Een certificering is ten hoogste twaalf maanden geldig.",
              "Na het verstrijken van de geldigheid wordt de certificeringsstatus van rechtswege 'expired' en is de agent niet inhuurbaar totdat hercertificering heeft plaatsgevonden (Art. 8.13 lid 1 sub a).",
            ],
            machineFields: ["bna.certification.expiresAt"],
            verwijzingen: ["Art. 8.13"],
          },
        ],
      },
      {
        nr: 4,
        naam: "Toegangsniveaus",
        artikelen: [
          {
            nr: "6.8",
            titel: "Veldzichtbaarheid per aanroeper",
            leden: [
              "Publieke aanroepers zien de discovery-kern van een Agent Card: identiteit, sector, capabilities op categorieniveau, certificeringsstatus, risicoklasse, Inhuurtier en toestemmingsniveau.",
              "Geauthenticeerde aanroepers zien aanvullend endpoints, skills, volledige capability-beschrijvingen en toezichtmaatregelen.",
              "Betalende accounts zien aanvullend de volledige componentopbouw van de Risicofactor en de datacategorieën per capability.",
              "De toegangscontrole wordt uitgevoerd in de API-laag en geldt gelijkelijk voor REST- en MCP-toegang.",
            ],
          },
        ],
      },
    ],
  },
  {
    nr: "VII",
    slug: "boek-vii",
    naam: "Escrow en dataverkeer",
    status: "gereserveerd",
    considerans:
      "Gereserveerd. Dit Boek zal het escrow-protocol normeren: hostingmodellen (federated, sandbox, hybride), bewaartermijnen, verwijderplichten en de voorwaarden waaronder live verwerking van cliëntgevoelige data wordt geactiveerd. Tot vaststelling geldt: live verwerking staat achter de feature flag ESCROW_LIVE_PROCESSING en is uitgeschakeld.",
    titels: [],
  },
  {
    nr: "VIII",
    slug: "boek-viii",
    naam: "Risicoscoring en Inhuurprotocol",
    status: "vastgesteld",
    considerans:
      "Dit Boek regelt onder welke voorwaarden een agent door een onderneming mag worden ingehuurd, welke mate van menselijke betrokkenheid daarbij verplicht is, en hoe dit doorlopend wordt herzien. Het combineert twee onafhankelijke beoordelingsassen — de Risicofactor (statisch, classificatiegebonden) en de Vertrouwensscore (dynamisch, gedragsgebonden) — tot een bindend Inhuurprotocol. De systematiek is ontleend aan de KYC/AML-praktijk en aan de EU AI Act-risicoklassen.",
    titels: [
      {
        nr: 1,
        naam: "Definities en toepassingsgebied",
        artikelen: [
          {
            nr: "8.1",
            titel: "Definities",
            leden: [
              "Risicofactor (RF): een score van 0 tot 100 die het structurele, classificatiegebonden risico van een agent uitdrukt, onafhankelijk van diens gedrag of geschiedenis.",
              "Vertrouwensscore (TS): een score van 0 tot 100 die het dynamische, op gedrag en geschiedenis gebaseerde risico van een agent uitdrukt.",
              "Inhuurtier: de classificatie die volgt uit de combinatie van Risicofactor en Vertrouwensscore, en die bepaalt onder welke voorwaarden een agent mag worden ingehuurd.",
              "Afnemende onderneming: de partij die een agent inhuurt via Koop of Lease.",
              "Bevoegd persoon: een natuurlijk persoon bij de afnemende onderneming die krachtens diens interne bevoegdheidsregeling toestemming mag verlenen voor inhuur van een agent binnen een gegeven Inhuurtier.",
              "Verscherpte toetsing: het geheel van aanvullende verificatie- en toestemmingsvereisten dat van toepassing is bij een hoge Risicofactor, analoog aan Enhanced Due Diligence in de KYC-praktijk.",
            ],
          },
          {
            nr: "8.2",
            titel: "Toepassingsgebied",
            leden: [
              "Dit Boek is van toepassing op elke agent die is opgenomen in de BN Agent Discovery Registry, ongeacht distributiemodel (Koop of Lease).",
              "Dit Boek is aanvullend op, en doet niet af aan, de certificeringsvereisten van Boek IV en Boek VI.",
              "Waar dit Boek spreekt van 'onderneming' wordt zowel de vendor als de afnemende onderneming bedoeld, tenzij uit de context anders blijkt.",
            ],
          },
        ],
      },
      {
        nr: 2,
        naam: "De Risicofactor (statische score)",
        artikelen: [
          {
            nr: "8.3",
            titel: "Grondslag en doel",
            leden: [
              "De Risicofactor drukt uit hoe risicovol een agent structureel is, op basis van sector, doeleinde, capability-categorie, datagevoeligheid en autonomieniveau.",
              "De Risicofactor wordt vastgesteld bij certificering en herzien bij elke wijziging in capability, sector of doeleinde overeenkomstig Artikel 8.24.",
              "De Risicofactor is onafhankelijk van de geschiedenis of prestaties van de individuele agent of vendor.",
            ],
          },
          {
            nr: "8.4",
            titel: "Componenten en gewichten",
            leden: [
              "De Risicofactor is de som van vijf componenten, met een maximum van 100 punten: sectorgewicht (max 25), EU AI Act-risicoklasse (max 30), capability-categorie (max 20), datagevoeligheid (max 15) en autonomieniveau (max 10).",
              "Sectorgewicht: financial_services en healthcare 25; insurance, hr, legal en compliance 18; real_estate, logistics en public_sector 10; general 0.",
              "EU AI Act-risicoklasse: high 30; limited 15; minimal 0; unacceptable is niet van toepassing (zie Artikel 8.16).",
              "Capability-categorie: identity_verification, aml_compliance en risk_assessment 20; legal_review, financial_analysis en contract_processing 14; document_analysis, data_validation, classification en extraction 8; overige categorieën 3.",
              "Datagevoeligheid: verwerking van biometrische of bijzondere persoonsgegevens 15; overige persoonsgegevens 8; geen persoonsgegevens 0.",
              "Autonomieniveau: handelen zonder bevestiging en zonder omkeerbaarheid 10; handelen zonder bevestiging maar omkeerbaar 5; agent adviseert enkel en een mens beslist 0.",
            ],
            machineFields: ["bna.riskScoring.riskFactorComponents"],
          },
          {
            nr: "8.5",
            titel: "Berekeningswijze",
            leden: [
              "Bij een agent met meerdere capabilities wordt de Risicofactor berekend op basis van de zwaarst wegende capability, tenzij de afnemende onderneming uitdrukkelijk een specifieke capability inhuurt, in welk geval de Risicofactor van die capability geldt.",
              "De uitkomst wordt afgerond op een geheel getal tussen 0 en 100.",
            ],
          },
          {
            nr: "8.6",
            titel: "Risicoklassen (drempelwaarden)",
            leden: [
              "Risicofactor 0 t/m 33: Laag.",
              "Risicofactor 34 t/m 66: Midden.",
              "Risicofactor 67 t/m 100: Hoog.",
              "Een agent met EU AI Act-klasse 'unacceptable' ontvangt geen Risicofactor en is niet inhuurbaar (Artikel 8.16).",
            ],
            machineFields: ["bna.riskScoring.riskFactorClass"],
          },
        ],
      },
      {
        nr: 3,
        naam: "De Vertrouwensscore (dynamische score)",
        artikelen: [
          {
            nr: "8.7",
            titel: "Grondslag en doel",
            leden: [
              "De Vertrouwensscore drukt uit in hoeverre een specifieke agent, op basis van diens eigen geschiedenis en die van de vendor, betrouwbaar is gebleken.",
              "De Vertrouwensscore wordt bij elke escrow-transactie, elk incident en ten minste ieder kwartaal herberekend.",
            ],
          },
          {
            nr: "8.8",
            titel: "Componenten en gewichten",
            leden: [
              "De Vertrouwensscore start op een neutrale basiswaarde van 50 punten en wordt bijgesteld binnen bandbreedtes: certificeringsgeschiedenis +15/−20; operationele betrouwbaarheid +10/−15; escrow-transactiegeschiedenis +15/−20; vendor-portfolioreputatie +10/−10; incident- en datalekgeschiedenis 0/−25; registrybeoordelingen +5/−5.",
              "De resulterende score wordt begrensd tussen 0 en 100.",
              "Een negatieve bijstelling uit hoofde van incident- en datalekgeschiedenis kan niet door positieve bijstellingen uit andere componenten binnen dezelfde herberekeningsperiode worden gecompenseerd tot boven de basiswaarde van 50.",
            ],
            machineFields: ["bna.riskScoring.trustScore"],
          },
          {
            nr: "8.9",
            titel: "Initiële score voor nieuwe agents",
            leden: [
              "Een agent zonder enige transactie-, certificerings- of operationele geschiedenis ontvangt de basiswaarde van 50 punten en geen enkele bijstelling.",
              "Een agent van een vendor die reeds andere, langer actieve agents in de registry heeft, kan de component vendor-portfolioreputatie laten meewegen, ook indien de betreffende agent zelf nog geen geschiedenis heeft.",
            ],
          },
          {
            nr: "8.10",
            titel: "Herberekening en verval",
            leden: [
              "De Vertrouwensscore wordt herberekend: (a) na elke honderd escrow-transacties, (b) onmiddellijk na een gemeld incident, (c) bij hercertificering, en (d) ten minste elk kwartaal.",
              "Indien een agent langer dan twaalf maanden geen enkele transactie heeft verwerkt, vervalt de opgebouwde Vertrouwensscore naar de basiswaarde van 50.",
            ],
            machineFields: ["bna.riskScoring.trustScoreLastCalculated"],
          },
        ],
      },
      {
        nr: 4,
        naam: "Combinatie: de Inhuurtier",
        artikelen: [
          {
            nr: "8.11",
            titel: "Tiermatrix",
            leden: [
              "De Inhuurtier volgt uit de combinatie van Risicoklasse en Vertrouwensscore: bij Risicofactor Laag geldt Tier A bij Vertrouwensscore hoog (>70) of midden (40–70) en Tier B bij laag (<40); bij Risicofactor Midden geldt Tier A bij hoog, Tier B bij midden en Tier C bij laag; bij Risicofactor Hoog geldt Tier B bij hoog, Tier C bij midden en Tier D bij laag.",
            ],
            machineFields: ["bna.riskScoring.inhuurTier"],
          },
          {
            nr: "8.12",
            titel: "Gevolgen per tier",
            leden: [
              "Tier A: autonome inhuur toegestaan; uitsluitend achteraf steekproefcontrole vereist (Artikel 8.14).",
              "Tier B: menselijke goedkeuring vereist bij eerste inhuur; nadien autonome werking met periodieke steekproefcontrole (Artikel 8.15 lid 1).",
              "Tier C: menselijke goedkeuring vereist bij eerste inhuur én bij elke transactie boven een door de afnemende onderneming vast te stellen drempel (Artikel 8.15 lid 2).",
              "Tier D: menselijke goedkeuring vereist per individuele transactie, zonder uitzondering (Artikel 8.15 lid 3).",
            ],
            machineFields: ["bna.riskScoring.requiredConsentLevel"],
          },
        ],
      },
      {
        nr: 5,
        naam: "Inhuurprotocol: wanneer mag een agent worden ingehuurd",
        artikelen: [
          {
            nr: "8.13",
            titel: "Algemene toelaatbaarheidsvoorwaarden",
            leden: [
              "Een agent mag uitsluitend worden ingehuurd indien cumulatief is voldaan aan: (a) een geldige certificering conform Boek IV en Boek VI; (b) een berekende Risicofactor en Vertrouwensscore die niet ouder zijn dan de in Artikel 8.10 genoemde termijnen; (c) een EU AI Act-risicoklasse die niet 'unacceptable' is; (d) afwezigheid van een lopende schorsing conform Titel 9.",
            ],
          },
          {
            nr: "8.14",
            titel: "Automatische inhuur (Tier A)",
            leden: [
              "Inhuur vindt plaats zonder voorafgaande menselijke goedkeuring per transactie.",
              "De afnemende onderneming is niettemin verplicht een steekproef van ten minste vijf procent van de transacties periodiek door een bevoegd persoon te laten beoordelen.",
            ],
          },
          {
            nr: "8.15",
            titel: "Voorwaardelijke inhuur (Tier B en C)",
            leden: [
              "Bij Tier B is goedkeuring door een bevoegd persoon vereist voorafgaand aan de eerste inhuur van de betreffende agent door de betreffende onderneming. Nadien is autonome werking toegestaan, onder dezelfde steekproefverplichting als Tier A.",
              "Bij Tier C is, naast de goedkeuring bij eerste inhuur, per transactie boven een door de afnemende onderneming vastgestelde waarde- of volumedrempel voorafgaande goedkeuring door een bevoegd persoon vereist. Deze drempel mag worden verlaagd, maar niet worden verhoogd boven het door BN Agent vastgestelde maximum.",
            ],
          },
          {
            nr: "8.16",
            titel: "Uitgesloten inhuur (Tier D en unacceptable-klasse)",
            leden: [
              "Een agent in Tier D mag uitsluitend worden ingehuurd indien voor iedere afzonderlijke transactie voorafgaande, uitdrukkelijke goedkeuring van een bevoegd persoon is verkregen en vastgelegd conform Artikel 8.20.",
              "Een agent met EU AI Act-risicoklasse 'unacceptable' mag in geen geval worden ingehuurd en wordt niet in de registry opgenomen.",
            ],
          },
        ],
      },
      {
        nr: 6,
        naam: "Menselijke toestemming (verplichte toetsingsmomenten)",
        artikelen: [
          {
            nr: "8.17",
            titel: "Standaardgoedkeuring bij eerste inhuur",
            leden: [
              "Voor elke agent zonder voorafgaande inhuurgeschiedenis bij de betreffende afnemende onderneming is, ongeacht Tier, ten minste een eenmalige beoordeling door een bevoegd persoon vereist bij de eerste inhuur.",
            ],
          },
          {
            nr: "8.18",
            titel: "Verscherpte toetsing",
            leden: [
              "Verscherpte toetsing is verplicht wanneer: (a) de agent een nieuwe of onbewezen agent is zonder trackrecord; (b) de transactie een vastgestelde waarde- of datavolumedrempel overschrijdt; (c) sprake is van sector- of ondernemingsoverschrijdende verwerking die afwijkt van de gecertificeerde reikwijdte; (d) het monitoringsysteem een afwijking signaleert overeenkomstig Artikel 8.24; (e) de Vertrouwensscore is gedaald onder de voor de huidige Tier geldende ondergrens sinds de laatste goedkeuring.",
            ],
          },
          {
            nr: "8.19",
            titel: "Toestemming per transactie",
            leden: [
              "Toestemming per transactie is, onverminderd Artikel 8.15 en 8.16, in ieder geval vereist wanneer de uitkomst van de agent onomkeerbaar is en de betrokkene nadelig kan raken (bijvoorbeeld afwijzing van een aanvraag, blokkering van een rekening, beëindiging van een overeenkomst).",
            ],
          },
          {
            nr: "8.20",
            titel: "Vorm en registratie van toestemming",
            leden: [
              "Elke krachtens dit Boek vereiste toestemming wordt vastgelegd met: identiteit van de bevoegde persoon, tijdstip, gegeven Tier en Risicofactor/Vertrouwensscore ten tijde van goedkeuring, en de reikwijdte van de toestemming.",
              "Deze vastlegging wordt opgenomen in het append-only auditlog van de escrow-laag en is niet achteraf wijzigbaar.",
            ],
          },
        ],
      },
      {
        nr: 7,
        naam: "Permissies van de afnemende onderneming",
        artikelen: [
          {
            nr: "8.21",
            titel: "Aanscherpingsbevoegdheid",
            leden: [
              "De afnemende onderneming mag te allen tijde eigen, strengere drempels, goedkeuringsvereisten of Tier-toewijzingen hanteren dan door BN Agent vastgesteld.",
            ],
          },
          {
            nr: "8.22",
            titel: "Verbod op versoepeling",
            leden: [
              "De afnemende onderneming mag de door BN Agent vastgestelde minimumvereisten per Tier niet verlagen, verruimen of omzeilen, ongeacht interne bevoegdheidsregelingen.",
              "Een instelling die in strijd met lid 1 handelt, verliest voor de betreffende agent en transactie het beroep op de certificering van BN Agent.",
            ],
          },
          {
            nr: "8.23",
            titel: "Vastlegging bedrijfsbeleid",
            leden: [
              "Iedere afnemende onderneming legt haar eigen aanvullende drempels en goedkeuringsregels vast in een permissieprofiel, gekoppeld aan haar account bij BN Agent.",
            ],
          },
        ],
      },
      {
        nr: 8,
        naam: "Doorlopende monitoring en herbeoordeling",
        artikelen: [
          {
            nr: "8.24",
            titel: "Triggers voor herberekening",
            leden: [
              "De Risicofactor wordt herberekend bij elke wijziging van capability, sector, doeleinde of dataverwerking van de agent.",
              "De Vertrouwensscore wordt herberekend conform Artikel 8.10.",
            ],
          },
          {
            nr: "8.25",
            titel: "Periodieke herbeoordeling",
            leden: [
              "Onafhankelijk van tussentijdse triggers wordt elke agent ten minste jaarlijks integraal herbeoordeeld op Risicofactor en Vertrouwensscore, gelijktijdig met de hercertificeringscyclus.",
            ],
          },
          {
            nr: "8.26",
            titel: "Downgrade-procedure",
            leden: [
              "Indien de Vertrouwensscore van een agent binnen een periode van dertig dagen met vijftien punten of meer daalt, wordt de agent automatisch teruggezet naar het toestemmingsregime van de eerstvolgende hogere Tier, totdat een bevoegd persoon de agent opnieuw beoordeelt.",
              "Een dergelijke downgrade wordt onverwijld gemeld aan alle ondernemingen die de agent op het moment van downgrade actief hebben ingehuurd.",
            ],
          },
        ],
      },
      {
        nr: 9,
        naam: "Schorsing, intrekking en handhaving",
        artikelen: [
          {
            nr: "8.27",
            titel: "Gronden voor schorsing",
            leden: [
              "Schorsing van inhuurbaarheid vindt plaats bij: verlopen certificering, een Vertrouwensscore onder de 20 punten, een vastgesteld ernstig incident, of indiening van een klacht die gegronde twijfel oplevert aan de juistheid van de certificering.",
            ],
            machineFields: ["bna.riskScoring.suspended", "bna.riskScoring.suspensionReason"],
          },
          {
            nr: "8.28",
            titel: "Gevolgen van schorsing",
            leden: [
              "Een geschorste agent kan niet worden ingehuurd, ongeacht Tier, totdat de schorsing is opgeheven.",
              "Reeds lopende overeenkomsten worden door de schorsing niet automatisch beëindigd, maar de afnemende onderneming wordt onverwijld geïnformeerd en beoordeelt zelf of voortzetting verantwoord is.",
            ],
          },
          {
            nr: "8.29",
            titel: "Herstel",
            leden: [
              "Herstel van inhuurbaarheid vereist hercertificering conform Boek VI en een hernieuwde vaststelling van Risicofactor en Vertrouwensscore.",
            ],
          },
        ],
      },
      {
        nr: 10,
        naam: "Machine-leesbare implementatie",
        artikelen: [
          {
            nr: "8.30",
            titel: "Verplichte velden in de Agent Card",
            leden: [
              "Elke Agent Card bevat, aanvullend op het schema van de Agent Card Standaard v1.0, het riskScoring-blok met: riskFactorScore, riskFactorClass, riskFactorComponents, trustScore, trustScoreLastCalculated, inhuurTier, applicableArticles, requiredConsentLevel, suspended en optioneel suspensionReason.",
              "Het veld applicableArticles wordt door BN Agent automatisch gevuld op basis van de berekende Tier en is niet door de vendor of afnemende onderneming wijzigbaar.",
              "Het veld requiredConsentLevel wordt door de MCP-tools find_agents en call_lease_agent uitgelezen en bepaalt of de aanroep wordt geblokkeerd in afwachting van goedkeuring door een bevoegd persoon.",
            ],
            machineFields: ["bna.riskScoring"],
          },
        ],
      },
    ],
  },
];

export function getBoek(slug: string): Boek | undefined {
  return BOEKEN.find((b) => b.slug === slug);
}

/** Alle artikelen als platte lijst, voor kruisverwijzingen en validatie. */
export function alleArtikelen() {
  return BOEKEN.flatMap((boek) =>
    boek.titels.flatMap((titel) =>
      titel.artikelen.map((artikel) => ({ ...artikel, boek: boek.nr, titelNaam: titel.naam })),
    ),
  );
}
