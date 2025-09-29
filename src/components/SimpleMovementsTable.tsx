import React, { useState, useMemo } from 'react';
import { CFONBRecord } from '../types/cfonb';
import { ChevronUp, ChevronDown, Download } from 'lucide-react';
import { exportToLimpeedCSV } from '../utils/limpeedExport';

interface SimpleMovementsTableProps {
  records: CFONBRecord[];
  onExport: () => void;
  selectedAccount?: string;
}

interface MovementWithComplements {
  movement: CFONBRecord;
  complements: CFONBRecord[];
  runningBalance?: number;
}

type SortField = 'date_comptable' | 'libelle' | 'montant' | 'code_operation';
type SortOrder = 'asc' | 'desc';

export function SimpleMovementsTable({ records, onExport, selectedAccount }: SimpleMovementsTableProps) {
  const [sortField, setSortField] = useState<SortField>('date_comptable');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc'); // Chronologique par défaut
  const [filter, setFilter] = useState('');

  // Calculer le solde initial à partir des enregistrements de type 01 (ancien solde)
  const getInitialBalance = (records: CFONBRecord[]) => {
    const ancienSolde = records.find(r => r.type_enregistrement === '01');
    return ancienSolde?.solde || 0;
  };

  // Regrouper les mouvements avec leurs compléments
  const movementsWithComplements = useMemo(() => {
    const movements = records.filter(r => r.type_enregistrement === '04');
    const complements = records.filter(r => r.type_enregistrement === '05');
    
    return movements.map(movement => {
      // Trouver les compléments qui suivent ce mouvement
      const movementIndex = records.findIndex(r => r === movement);
      const nextMovementIndex = records.findIndex((r, i) => 
        i > movementIndex && r.type_enregistrement === '04'
      );
      
      const endIndex = nextMovementIndex === -1 ? records.length : nextMovementIndex;
      const relatedComplements = records
        .slice(movementIndex + 1, endIndex)
        .filter(r => r.type_enregistrement === '05');
      
      return {
        movement,
        complements: relatedComplements
      };
    });
  }, [records]);

  // Filtrage, tri et calcul du solde courant
  const sortedAndFilteredMovements = useMemo(() => {
    let filtered = movementsWithComplements;
    
    // Filtre par recherche textuelle
    if (filter) {
      filtered = filtered.filter(item => {
        const searchText = filter.toLowerCase();
        return (
          item.movement.libelle.toLowerCase().includes(searchText) ||
          item.complements.some(c => 
            c.complement?.toLowerCase().includes(searchText) ||
            c.libelle.toLowerCase().includes(searchText)
          )
        );
      });
    }
    
    // Tri des mouvements
    const sorted = filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'date_comptable':
          aValue = a.movement.date_comptable || '';
          bValue = b.movement.date_comptable || '';
          break;
        case 'libelle':
          aValue = a.movement.libelle;
          bValue = b.movement.libelle;
          break;
        case 'montant':
          aValue = a.movement.montant;
          bValue = b.movement.montant;
          break;
        case 'code_operation':
          aValue = a.movement.code_operation || '';
          bValue = b.movement.code_operation || '';
          break;
        default:
          return 0;
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      const comparison = String(aValue).localeCompare(String(bValue));
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    // Calcul du solde courant pour chaque mouvement (seulement si trié par date chronologique)
    if (sortField === 'date_comptable') {
      let runningBalance = getInitialBalance(records);
      
      return sorted.map(item => {
        runningBalance += item.movement.montant;
        return {
          ...item,
          runningBalance
        };
      });
    }
    
    return sorted;
  }, [movementsWithComplements, sortField, sortOrder, filter, records]);

  // Calculer le solde actuel
  const currentBalance = useMemo(() => {
    const initialBalance = getInitialBalance(records);
    const totalMovements = records
      .filter(r => r.type_enregistrement === '04')
      .reduce((sum, r) => sum + r.montant, 0);
    return initialBalance + totalMovements;
  }, [records]);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
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

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getAccountName = () => {
    if (!selectedAccount) return 'Tous les comptes';
    const [banque, guichet, compte] = selectedAccount.split('-');
    return `${banque}-${guichet} • ${compte}`;
  };

  const handleLimpeedExport = () => {
    let recordsToExport = records;
    let exportFilename = 'export_limpeed.csv';
    
    // Si un compte spécifique est sélectionné, exporter seulement ses données
    if (selectedAccount) {
      const [banque, guichet, compte] = selectedAccount.split('-');
      recordsToExport = records.filter(record => 
        record.banque === banque && 
        record.guichet === guichet && 
        record.compte === compte
      );
      const accountName = selectedAccount.split('-').join('_');
      exportFilename = `export_limpeed_${accountName}.csv`;
    }
    
    exportToLimpeedCSV(recordsToExport, exportFilename);
  };
  return (
    <div className="w-full">
      {/* En-tête avec solde */}
      <div className="mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              {getAccountName()}
            </h2>
            <p className="text-blue-100">
              Mouvements bancaires • Vue chronologique
            </p>
          </div>
          <div className="mt-4 md:mt-0 text-right">
            <div className="text-sm text-blue-100 mb-1">Solde actuel</div>
            <div className={`text-3xl font-bold px-4 py-2 rounded-lg ${
              currentBalance >= 0 
                ? 'bg-green-500 bg-opacity-20 border border-green-300' 
                : 'bg-red-500 bg-opacity-20 border border-red-300'
            }`}>
              {formatAmount(currentBalance)}
            </div>
          </div>
        </div>
      </div>

      {/* Contrôles */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Rechercher dans les libellés et compléments..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-80"
          />
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleLimpeedExport}
            className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export LIMPEED</span>
          </button>
          <button
            onClick={onExport}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export complet</span>
          </button>
        </div>
      </div>

      {/* Résumé */}
      <div className="mb-4 text-sm text-gray-600">
        Affichage de {sortedAndFilteredMovements.length} mouvements sur {movementsWithComplements.length} au total
        {sortField === 'date_comptable' && sortOrder === 'asc' && (
          <span className="ml-2 text-blue-600 font-medium">• Solde calculé en temps réel</span>
        )}
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton field="date_comptable">Date</SortButton>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton field="libelle">Libellé & Compléments</SortButton>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton field="montant">Montant</SortButton>
                </th>
                {sortField === 'date_comptable' && sortOrder === 'asc' && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Solde
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton field="code_operation">Code Op.</SortButton>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedAndFilteredMovements.map((item, index) => (
                <tr key={index} className="hover:bg-blue-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mr-3"></div>
                      <span className="font-medium text-blue-900">
                        {formatDate(item.movement.date_comptable || '')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm max-w-md">
                    <div className="font-semibold text-gray-900 mb-2">
                      {item.movement.libelle}
                    </div>
                    {item.complements.length > 0 && (
                      <div className="space-y-1">
                        {item.complements.map((complement, compIndex) => (
                          <div key={compIndex} className="text-xs text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
                            {complement.complement}
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-mono">
                    <span className={`font-bold text-lg px-3 py-1 rounded-lg ${
                      item.movement.montant >= 0 
                        ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' 
                        : 'text-red-700 bg-red-50 border border-red-200'
                    }`}>
                      {formatAmount(item.movement.montant)}
                    </span>
                  </td>
                  {sortField === 'date_comptable' && sortOrder === 'asc' && item.runningBalance !== undefined && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-mono">
                      <span className={`font-semibold px-2 py-1 rounded ${
                        item.runningBalance >= 0 
                          ? 'text-blue-700 bg-blue-50' 
                          : 'text-orange-700 bg-orange-50'
                      }`}>
                        {formatAmount(item.runningBalance)}
                      </span>
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                    {item.movement.code_operation || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totaux */}
      <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-lg p-6 border border-blue-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-900 mb-1">
              {sortedAndFilteredMovements.length}
            </div>
            <div className="text-sm font-medium text-blue-600">Mouvements</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-700 mb-1">
              {formatAmount(
                sortedAndFilteredMovements
                  .filter(item => item.movement.montant > 0)
                  .reduce((sum, item) => sum + item.movement.montant, 0)
              )}
            </div>
            <div className="text-sm font-medium text-emerald-600">Total crédits</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-700 mb-1">
              {formatAmount(
                sortedAndFilteredMovements
                  .filter(item => item.movement.montant < 0)
                  .reduce((sum, item) => sum + item.movement.montant, 0)
              )}
            </div>
            <div className="text-sm font-medium text-red-600">Total débits</div>
          </div>
        </div>
      </div>
    </div>
  );
}