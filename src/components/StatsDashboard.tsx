import React from 'react';
import { ParseResult } from '../types/cfonb';
import { FileText, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { exportToLimpeedCSV } from '../utils/limpeedExport';

interface StatsDashboardProps {
  result: ParseResult;
  filename: string;
}

export function StatsDashboard({ result, filename }: StatsDashboardProps) {
  const { stats, errors } = result;
  
  const totalAmount = result.records
    .filter(r => r.type_enregistrement === '04')
    .reduce((sum, r) => sum + r.montant, 0);

  const handleLimpeedExport = () => {
    exportToLimpeedCSV(result.records, 'export_limpeed.csv');
  };
  const StatCard = ({
    title,
    value,
    icon: Icon,
    color = 'blue',
    description
  }: {
    title: string;
    value: string | number;
    icon: React.ComponentType<{ className?: string }>;
    color?: 'blue' | 'green' | 'yellow' | 'red';
    description?: string;
  }) => {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-700 border-blue-200',
      green: 'bg-green-50 text-green-700 border-green-200',
      yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      red: 'bg-red-50 text-red-700 border-red-200'
    };

    return (
      <div className={`p-6 rounded-lg border ${colorClasses[color]}`}>
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className="h-8 w-8" />
          </div>
          <div className="ml-4">
            <dt className="text-sm font-medium">{title}</dt>
            <dd className="text-2xl font-bold">{value}</dd>
            {description && (
              <p className="text-sm mt-1 opacity-75">{description}</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full space-y-6">
      {/* En-tête */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Analyse du fichier CFONB
        </h2>
        <p className="text-gray-600">
          Fichier: <span className="font-medium">{filename}</span>
        </p>
        <div className="mt-4">
          <button
            onClick={handleLimpeedExport}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <CheckCircle className="h-4 w-4" />
            <span>Export LIMPEED</span>
          </button>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total lignes"
          value={stats.total_lines}
          icon={FileText}
          color="blue"
          description="Lignes traitées"
        />
        
        <StatCard
          title="Mouvements"
          value={stats.mouvements}
          icon={TrendingUp}
          color="green"
          description="Écritures bancaires"
        />
        
        <StatCard
          title="Compléments"
          value={stats.complements}
          icon={CheckCircle}
          color="blue"
          description="Informations additionnelles"
        />
        
        <StatCard
          title="Erreurs"
          value={stats.errors}
          icon={AlertTriangle}
          color={stats.errors > 0 ? 'red' : 'green'}
          description={stats.errors > 0 ? 'Lignes en erreur' : 'Aucune erreur'}
        />
      </div>

      {/* Détail des types d'enregistrements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Répartition des enregistrements
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Anciens soldes (01)</span>
              <span className="font-medium">{stats.ancien_solde}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Mouvements (04)</span>
              <span className="font-medium">{stats.mouvements}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Compléments (05)</span>
              <span className="font-medium">{stats.complements}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Nouveaux soldes (07)</span>
              <span className="font-medium">{stats.nouveau_solde}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Montants
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total mouvements</span>
              <span className={`font-medium ${totalAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalAmount.toFixed(2)} €
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Nombre d'opérations</span>
              <span className="font-medium">{stats.mouvements}</span>
            </div>
            {stats.mouvements > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Montant moyen</span>
                <span className="font-medium">
                  {(totalAmount / stats.mouvements).toFixed(2)} €
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Erreurs */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Erreurs de traitement ({errors.length})
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {errors.map((error, index) => (
              <div key={index} className="bg-white p-3 rounded border border-red-200">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-red-900">
                      Ligne {error.line_number}: {error.error}
                    </p>
                    <p className="text-xs text-red-700 font-mono mt-1 truncate">
                      {error.line}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}