export interface CFONBRecord {
  type_enregistrement: string;
  banque: string;
  guichet: string;
  compte: string;
  devise: string;
  date_comptable?: string;
  date_valeur?: string;
  date_solde?: string;
  libelle: string;
  montant: number;
  code_operation?: string;
  numero_ecriture?: string;
  qualifiant?: string;
  complement?: string;
  solde?: number;
  raw_line: string;
  line_number: number;
}

export interface ParseResult {
  records: CFONBRecord[];
  stats: {
    total_lines: number;
    ancien_solde: number;
    mouvements: number;
    complements: number;
    nouveau_solde: number;
    errors: number;
  };
  errors: Array<{
    line_number: number;
    line: string;
    error: string;
  }>;
}