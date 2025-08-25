import React, { useState, useMemo } from 'react';
import { CFONBRecord } from '../types/cfonb';
import { AlertTriangle, CheckCircle, Eye, EyeOff, Download } from 'lucide-react';

interface DuplicatesDetectionProps {
  records: CFONBRecord[];
  onExport: () => void;
}

interface DuplicateGroup {
  key: string;
  records: CFONBRecord[];
  criteria: string[];
}

type DetectionCriteria = {
  date: boolean;
  amount: boolean;
  libelle: boolean;
  compte: boolean;
  codeOperation: boolean;
};

export function DuplicatesDetection({ records, onExport }: DuplicatesDetectionProps) {
  const [criteria, setCriteria] = useState<DetectionCriteria>({
    date: true,
    amount: true,
    libelle: true,
    compte: true,
    codeOperation: false
  });
  
  const [showOnlyDuplicates, setShowOnlyDuplicates] = useState(true);
  const [selectedDuplicates, setSelectedDuplicates] = useState<Set<number>>(new Set());

  // Fonction pour générer une clé de comparaison basée sur les critères sélectionnés
  const generateComparisonKey = (record: CFONBRecord): string => {
    const parts: string[] = [];
    
    if (criteria.date && record.date_comptable) {
      parts.push(`date:${record.date_comptable}`);
    }
    if (criteria.amount) {
      parts.push(`amount:${record.montant.toFixed(2)}`);
    }
    if (criteria.libelle) {
      parts.push(`libelle:${record.libelle.toLowerCase().trim()}`);
    }
    if (criteria.compte) {
      parts.push(`compte:${record.banque}-${record.guichet}-${record.compte}`);
    }
    if (criteria.codeOperation && record.code_operation) {
      parts.push(`code:${record.code_operation}`);
    }
    
    return parts.join('|');
  };

  // Détection des doublons
  const duplicateGroups = useMemo(() => {
    // Ne traiter que les mouvements (type 04)
    const movements = records.filter(r => r.type_enregistrement === '04');
    
    // Grouper par clé de comparaison
    const groups = new Map<string, CFONBRecord[]>();
    
    movements.forEach(record => {
      const key = generateComparisonKey(record);
      if (key) { // Ignorer les enregistrements sans critères valides
        if (!groups.has(key)) {
          groups.set(key, []);
        }
        groups.get(key)!.push(record);
      }
    });
    
    // Ne garder que les groupes avec plus d'un élément (doublons)
    const duplicates: DuplicateGroup[] = [];
    groups.forEach((records, key) => {
      if (records.length > 1) {
        const activeCriteria: string[] = [];
        if (criteria.date) activeCriteria.push('Date');
        if (criteria.amount) activeCriteria.push('Montant');
        if (criteria.libelle) activeCriteria.push('Libellé');
        if (criteria.compte) activeCriteria.push('Compte');
        if (criteria.codeOperation) activeCriteria.push('Code op.');
        
        duplicates.push({
          key,
          records: records.sort((a, b) => a.line_number - b.line_number),
          criteria: activeCriteria
        });
      }
    });
    
    return duplicates.sort((a, b) => a.records[0].line_number - b.records[0].line_number);
  }, [records, criteria]);

  // Statistiques
  const stats = useMemo(() => {
    const totalMovements = records.filter(r => r.type_enregistrement === '04').length;
    const duplicateRecords = duplicateGroups.reduce((sum, group) => sum + group.records.length, 0);
    const uniqueDuplicates = duplicateGroups.length;
    
    return {
      totalMovements,
      duplicateRecords,
      uniqueDuplicates,
      cleanRecords: totalMovements - duplicateRecords
    };
  }, [records, duplicateGroups]);

  const handleCriteriaChange = (key: keyof DetectionCriteria) => {
    setCriteria(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleDuplicateSelection = (lineNumber: number) => {
    setSelectedDuplicates(prev => {
      const newSet = new Set(prev);
      if (newSet.has(lineNumber)) {
        newSet.delete(lineNumber);
      } else {
        newSet.add(lineNumber);
      }
      return newSet;
    });
  };

  const selectAllInGroup = (group: DuplicateGroup) => {
    setSelectedDuplicates(prev => {
      const newSet = new Set(prev);
      group.records.forEach(record => {
        newSet.add(record.line_number);
      });
      return newSet;
    });
  };

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

  return (
    <div className="w-full space-y-6">
      {/* En-tête avec statistiques */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              Détection des doublons
            </h2>
            <p className="text-orange-100">
              Analysez et identifiez les transactions en double
            </p>
          </div>
          <div className="mt-4 md:mt-0 grid grid-cols-2 gap-4 text-center">
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <div className="text-2xl font-bold">{stats.uniqueDuplicates}</div>
              <div className="text-sm text-orange-100">Groupes de doublons</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <div className="text-2xl font-bold">{stats.duplicateRecords}</div>
              <div className="text-sm text-orange-100">Enregistrements</div>
            </div>
          </div>
        </div>
      </div>

      {/* Critères de détection */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Critères de détection
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={criteria.date}
              onChange={() => handleCriteriaChange('date')}
              className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
            />
            <span className="text-sm font-medium text-gray-700">Date</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={criteria.amount}
              onChange={() => handleCriteriaChange('amount')}
              className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
            />
            <span className="text-sm font-medium text-gray-700">Montant</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={criteria.libelle}
              onChange={() => handleCriteriaChange('libelle')}
              className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
            />
            <span className="text-sm font-medium text-gray-700">Libellé</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={criteria.compte}
              onChange={() => handleCriteriaChange('compte')}
              className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
            />
            <span className="text-sm font-medium text-gray-700">Compte</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={criteria.codeOperation}
              onChange={() => handleCriteriaChange('codeOperation')}
              className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
            />
            <span className="text-sm font-medium text-gray-700">Code op.</span>
          </label>
        </div>
      </div>

      {/* Contrôles */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowOnlyDuplicates(!showOnlyDuplicates)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              showOnlyDuplicates
                ? 'bg-orange-100 text-orange-700 border border-orange-300'
                : 'bg-gray-100 text-gray-700 border border-gray-300'
            }`}
          >
            {showOnlyDuplicates ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            <span>{showOnlyDuplicates ? 'Doublons uniquement' : 'Tous les mouvements'}</span>
          </button>
          
          {selectedDuplicates.size > 0 && (
            <div className="text-sm text-gray-600">
              {selectedDuplicates.size} enregistrement(s) sélectionné(s)
            </div>
          )}
        </div>
        
        <button
          onClick={onExport}
          className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="h-4 w-4" />
          <span>Exporter les doublons</span>
        </button>
      </div>

      {/* Résultats */}
      {duplicateGroups.length === 0 ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
          <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-green-900 mb-2">
            Aucun doublon détecté !
          </h3>
          <p className="text-green-700">
            Avec les critères sélectionnés, aucune transaction en double n'a été trouvée.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {duplicateGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="bg-white rounded-lg shadow border-l-4 border-orange-500">
              <div className="p-4 bg-orange-50 border-b border-orange-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-orange-900">
                      Groupe {groupIndex + 1} - {group.records.length} doublons
                    </h4>
                    <p className="text-sm text-orange-700">
                      Critères: {group.criteria.join(', ')}
                    </p>
                  </div>
                  <button
                    onClick={() => selectAllInGroup(group)}
                    className="text-sm bg-orange-600 text-white px-3 py-1 rounded hover:bg-orange-700 transition-colors"
                  >
                    Sélectionner tout
                  </button>
                </div>
              </div>
              
              <div className="divide-y divide-gray-200">
                {group.records.map((record, recordIndex) => (
                  <div
                    key={recordIndex}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      selectedDuplicates.has(record.line_number) ? 'bg-orange-50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <input
                        type="checkbox"
                        checked={selectedDuplicates.has(record.line_number)}
                        onChange={() => toggleDuplicateSelection(record.line_number)}
                        className="mt-1 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                      
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            Ligne {record.line_number}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDate(record.date_comptable || '')}
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {record.libelle}
                          </div>
                          <div className="text-sm text-gray-500 font-mono">
                            {record.banque}-{record.guichet}
                          </div>
                        </div>
                        
                        <div>
                          <div className={`text-sm font-bold ${
                            record.montant >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatAmount(record.montant)}
                          </div>
                          <div className="text-sm text-gray-500">
                            Code: {record.code_operation || '-'}
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          {recordIndex === 0 && (
                            <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                              Original
                            </span>
                          )}
                          {recordIndex > 0 && (
                            <span className="inline-flex px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                              Doublon {recordIndex}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Résumé final */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalMovements}</div>
            <div className="text-sm text-gray-600">Total mouvements</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">{stats.duplicateRecords}</div>
            <div className="text-sm text-gray-600">Doublons détectés</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{stats.cleanRecords}</div>
            <div className="text-sm text-gray-600">Enregistrements uniques</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {stats.totalMovements > 0 ? Math.round((stats.cleanRecords / stats.totalMovements) * 100) : 0}%
            </div>
            <div className="text-sm text-gray-600">Taux de propreté</div>
          </div>
        </div>
      </div>
    </div>
  );
}