import { CFONBRecord, ParseResult } from '../types/cfonb';

/**
 * Décode un montant CFONB avec signe codé en ASCII
 * Le dernier caractère encode le signe et le dernier chiffre
 */
function decodeAmount(amountStr: string): number {
  if (!amountStr || amountStr.trim() === '') return 0;
  
  const lastChar = amountStr.slice(-1);
  const baseAmount = amountStr.slice(0, -1);
  
  // Table de correspondance pour les signes codés
  const signMap: { [key: string]: { sign: number; digit: string } } = {
    '{': { sign: 1, digit: '0' },
    'A': { sign: 1, digit: '1' },
    'B': { sign: 1, digit: '2' },
    'C': { sign: 1, digit: '3' },
    'D': { sign: 1, digit: '4' },
    'E': { sign: 1, digit: '5' },
    'F': { sign: 1, digit: '6' },
    'G': { sign: 1, digit: '7' },
    'H': { sign: 1, digit: '8' },
    'I': { sign: 1, digit: '9' },
    '}': { sign: -1, digit: '0' },
    'J': { sign: -1, digit: '1' },
    'K': { sign: -1, digit: '2' },
    'L': { sign: -1, digit: '3' },
    'M': { sign: -1, digit: '4' },
    'N': { sign: -1, digit: '5' },
    'O': { sign: -1, digit: '6' },
    'P': { sign: -1, digit: '7' },
    'Q': { sign: -1, digit: '8' },
    'R': { sign: -1, digit: '9' }
  };

  let sign = 1;
  let lastDigit = lastChar;

  if (signMap[lastChar]) {
    sign = signMap[lastChar].sign;
    lastDigit = signMap[lastChar].digit;
  }

  const fullAmountStr = baseAmount + lastDigit;
  const amount = parseInt(fullAmountStr) / 100; // Montant en centimes vers euros
  
  return amount * sign;
}

/**
 * Formate une date CFONB (JJMMAA) vers format ISO
 */
function formatDate(dateStr: string): string {
  if (!dateStr || dateStr.length !== 6) return '';
  
  const day = dateStr.substring(0, 2);
  const month = dateStr.substring(2, 4);
  const year = '20' + dateStr.substring(4, 6);
  
  return `${year}-${month}-${day}`;
}

/**
 * Parse une ligne d'enregistrement type 01 (Ancien solde)
 */
function parseType01(line: string, lineNumber: number): CFONBRecord {
  return {
    type_enregistrement: '01',
    banque: line.substring(2, 7),
    guichet: line.substring(11, 16),
    devise: line.substring(16, 19),
    compte: line.substring(21, 32).trim(),
    date_solde: line.substring(34, 40),
    libelle: 'ANCIEN SOLDE',
    solde: decodeAmount(line.substring(90, 104)),
    montant: 0,
    raw_line: line,
    line_number: lineNumber
  };
}

/**
 * Parse une ligne d'enregistrement type 04 (Mouvement)
 */
function parseType04(line: string, lineNumber: number): CFONBRecord {
  return {
    type_enregistrement: '04',
    banque: line.substring(2, 7),
    guichet: line.substring(11, 16),
    devise: line.substring(16, 19),
    compte: line.substring(21, 32).trim(),
    code_operation: line.substring(32, 34),
    date_comptable: line.substring(34, 40),
    date_valeur: line.substring(42, 48),
    libelle: line.substring(48, 79).trim(),
    numero_ecriture: line.substring(81, 88),
    montant: decodeAmount(line.substring(90, 104)),
    raw_line: line,
    line_number: lineNumber
  };
}

/**
 * Parse une ligne d'enregistrement type 05 (Complément)
 */
function parseType05(line: string, lineNumber: number): CFONBRecord {
  return {
    type_enregistrement: '05',
    banque: line.substring(2, 7),
    guichet: line.substring(11, 16),
    devise: line.substring(16, 19),
    compte: line.substring(21, 32).trim(),
    qualifiant: line.substring(45, 48),
    complement: line.substring(48, 118).trim(),
    libelle: 'COMPLEMENT',
    montant: 0,
    raw_line: line,
    line_number: lineNumber
  };
}

/**
 * Parse une ligne d'enregistrement type 07 (Nouveau solde)
 */
function parseType07(line: string, lineNumber: number): CFONBRecord {
  return {
    type_enregistrement: '07',
    banque: line.substring(2, 7),
    guichet: line.substring(11, 16),
    devise: line.substring(16, 19),
    compte: line.substring(21, 32).trim(),
    date_solde: line.substring(34, 40),
    libelle: 'NOUVEAU SOLDE',
    solde: decodeAmount(line.substring(90, 104)),
    montant: 0,
    raw_line: line,
    line_number: lineNumber
  };
}

/**
 * Parseur principal pour fichier CFONB 120 caractères
 */
export function parseCFONB(fileContent: string): ParseResult {
  const lines = fileContent.split('\n').filter(line => line.trim() !== '');
  const records: CFONBRecord[] = [];
  const errors: Array<{ line_number: number; line: string; error: string }> = [];
  
  const stats = {
    total_lines: lines.length,
    ancien_solde: 0,
    mouvements: 0,
    complements: 0,
    nouveau_solde: 0,
    errors: 0
  };

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    
    try {
      // Vérification de la longueur (120 ou 121 caractères acceptés)
      if (line.length !== 120 && line.length !== 121) {
        throw new Error(`Longueur incorrecte: ${line.length} caractères au lieu de 120`);
      }
      
      const recordType = line.substring(0, 2);
      let record: CFONBRecord;
      
      switch (recordType) {
        case '01':
          record = parseType01(line, lineNumber);
          stats.ancien_solde++;
          break;
        case '01':
          record = parseType01(line, lineNumber);
          stats.ancien_solde++;
          break;
        case '04':
          record = parseType04(line, lineNumber);
          stats.mouvements++;
          break;
        case '05':
          record = parseType05(line, lineNumber);
          stats.complements++;
          break;
        case '07':
          record = parseType07(line, lineNumber);
          stats.nouveau_solde++;
          break;
        case '07':
          record = parseType07(line, lineNumber);
          stats.nouveau_solde++;
          break;
        default:
          throw new Error(`Type d'enregistrement inconnu: ${recordType}`);
      }
      
      // Formatage des dates
      if (record.date_comptable) {
        record.date_comptable = formatDate(record.date_comptable);
      }
      if (record.date_valeur) {
        record.date_valeur = formatDate(record.date_valeur);
      }
      if (record.date_solde) {
        record.date_solde = formatDate(record.date_solde);
      }
      
      records.push(record);
      
    } catch (error) {
      errors.push({
        line_number: lineNumber,
        line: line,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      });
      stats.errors++;
    }
  });

  return { records, stats, errors };
}