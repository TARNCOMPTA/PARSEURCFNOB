import React, { useState, useMemo } from 'react';
import { CFONBRecord } from '../types/cfonb';
import { ChevronUp, ChevronDown, Download } from 'lucide-react';

interface RecordTableProps {
  records: CFONBRecord[];
  onExport: () => void;
}

type SortField = keyof CFONBRecord;
type SortOrder = 'asc' | 'desc';

export function RecordTable({ records, onExport }: RecordTableProps) {
  const [sortField, setSortField] = useState<SortField>('line_number');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [filter, setFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const sortedAndFilteredRecords = useMemo(() => {
    let filtered = records;
    
    // Filtre par type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(record => record.type_enregistrement === typeFilter);
    }
    
    // Filtre par recherche textuelle
    if (filter) {
      filtered = filtered.filter(record =>
        record.libelle.toLowerCase().includes(filter.toLowerCase()) ||
        record.compte.toLowerCase().includes(filter.toLowerCase()) ||
        (record.complement && record.complement.toLowerCase().includes(filter.toLowerCase()))
      );
    }
    
    // Tri
    return filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (aValue === undefined || aValue === null) return 1;
      if (bValue === undefined || bValue === null) return -1;
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      const aStr = String(aValue);
      const bStr = String(bValue);
      const comparison = aStr.localeCompare(bStr);
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [records, sortField, sortOrder, filter, typeFilter]);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case '01': return 'Ancien solde';
      case '04': return 'Mouvement';
      case '05': return 'Complément';
      case '07': return 'Nouveau solde';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case '01': return 'bg-blue-100 text-blue-800';
      case '04': return 'bg-green-100 text-green-800';
      case '05': return 'bg-yellow-100 text-yellow-800';
      case '07': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
    >
      <span>{children}</span>
      {sortField === field && (
        sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
      )}
    </button>
  );

  return (
    <div className="w-full">
      {/* Contrôles */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Rechercher dans les libellés, comptes..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tous les types</option>
            <option value="01">Ancien solde</option>
            <option value="04">Mouvements</option>
            <option value="05">Compléments</option>
            <option value="07">Nouveau solde</option>
          </select>
        </div>
        
        <button
          onClick={onExport}
          className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="h-4 w-4" />
          <span>Exporter CSV</span>
        </button>
      </div>

      {/* Résumé */}
      <div className="mb-4 text-sm text-gray-600">
        Affichage de {sortedAndFilteredRecords.length} enregistrements sur {records.length} au total
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton field="line_number">Ligne</SortButton>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton field="type_enregistrement">Type</SortButton>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton field="date_comptable">Date</SortButton>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton field="compte">Compte</SortButton>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton field="libelle">Libellé</SortButton>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton field="montant">Montant</SortButton>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code Op.
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedAndFilteredRecords.map((record, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.line_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(record.type_enregistrement)}`}>
                      {getTypeLabel(record.type_enregistrement)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.date_comptable || record.date_solde || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                    {record.banque}-{record.guichet}<br />
                    <span className="text-xs text-gray-500">{record.compte}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                    <div className="truncate">{record.libelle}</div>
                    {record.complement && (
                      <div className="text-xs text-gray-500 truncate">{record.complement}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-mono">
                    {record.montant !== 0 && (
                      <span className={record.montant > 0 ? 'text-green-600' : 'text-red-600'}>
                        {record.montant.toFixed(2)} €
                      </span>
                    )}
                    {record.solde !== undefined && (
                      <span className={record.solde > 0 ? 'text-green-600' : 'text-red-600'}>
                        {record.solde.toFixed(2)} €
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                    {record.code_operation || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}