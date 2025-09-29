import { CFONBRecord } from '../types/cfonb';

export function exportToLimpeedCSV(records: CFONBRecord[], filename: string = 'export_limpeed.csv') {
  // Filtrer uniquement les mouvements (type 04), exclure soldes et compléments
  const movements = records.filter(record => record.type_enregistrement === '04');

  // En-têtes CSV avec séparateur point-virgule
  const headers = ['Date', 'Libellé', 'Débit', 'Crédit'];

  // Fonction pour formater la date au format jj/mm/AAAA
  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  // Conversion des données
  const csvData = movements.map(record => {
    const date = formatDate(record.date_comptable || '');
    const libelle = `"${record.libelle.replace(/"/g, '""')}"`;  // Échapper les guillemets
    const debit = record.montant < 0 ? Math.abs(record.montant).toFixed(2).replace('.', ',') : '';
    const credit = record.montant > 0 ? record.montant.toFixed(2).replace('.', ',') : '';
    
    return [date, libelle, debit, credit];
  });

  // Construction du contenu CSV avec séparateur point-virgule
  const csvContent = [
    headers.join(';'),
    ...csvData.map(row => row.join(';'))
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