import { CFONBRecord } from '../types/cfonb';

export function exportToCSV(records: CFONBRecord[], filename: string = 'export_cfonb.csv') {
  // En-têtes CSV
  const headers = [
    'ligne',
    'type_enregistrement',
    'banque',
    'guichet',
    'compte',
    'devise',
    'date_comptable',
    'date_valeur',
    'date_solde',
    'libelle',
    'montant',
    'solde',
    'code_operation',
    'numero_ecriture',
    'qualifiant',
    'complement'
  ];

  // Conversion des données
  const csvData = records.map(record => [
    record.line_number,
    record.type_enregistrement,
    record.banque,
    record.guichet,
    record.compte,
    record.devise,
    record.date_comptable || '',
    record.date_valeur || '',
    record.date_solde || '',
    `"${record.libelle}"`, // Échapper les guillemets pour le CSV
    record.montant,
    record.solde || '',
    record.code_operation || '',
    record.numero_ecriture || '',
    record.qualifiant || '',
    record.complement ? `"${record.complement}"` : ''
  ]);

  // Construction du contenu CSV
  const csvContent = [
    headers.join(','),
    ...csvData.map(row => row.join(','))
  ].join('\n');

  // Ajout du BOM UTF-8 pour Excel
  const BOM = '\uFEFF';
  const finalContent = BOM + csvContent;

  // Création et téléchargement du fichier
  const blob = new Blob([finalContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}