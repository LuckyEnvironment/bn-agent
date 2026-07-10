export interface Artikel {
  nr: string; // bijv. "2.7"
  titel: string;
  leden: string[];
  /** Machine-leesbare Agent Card-velden waaraan dit artikel is gekoppeld. */
  machineFields?: string[];
  /** Kruisverwijzingen naar andere artikelen, bijv. "Art. 8.11". */
  verwijzingen?: string[];
}

export interface Titel {
  nr: number;
  naam: string;
  artikelen: Artikel[];
}

export interface Boek {
  nr: string; // Romeins: "I" ... "VIII"
  slug: string;
  naam: string;
  status: "vastgesteld" | "concept" | "gereserveerd";
  considerans?: string;
  titels: Titel[];
}
