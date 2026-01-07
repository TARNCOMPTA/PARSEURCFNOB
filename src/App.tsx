import React, { useState } from 'react';
import { HomePage } from './components/HomePage';
import { FileUpload } from './components/FileUpload';
import { Header } from './components/Header';
import { StatsDashboard } from './components/StatsDashboard';
import { RecordTable } from './components/RecordTable';
import { SimpleMovementsTable } from './components/SimpleMovementsTable';
import { DuplicatesDetection } from './components/DuplicatesDetection';
import { ToastContainer } from './components/Toast';
import { ConfirmDialog } from './components/ConfirmDialog';
import { parseCFONB } from './utils/cfonbParser';
import { exportToCSV } from './utils/csvExport';
import { ParseResult, CFONBRecord } from './types/cfonb';
import { demoParseResult } from './data/demoData';
import { useToast } from './hooks/useToast';
import { BarChart3, AlertTriangle, FileText } from 'lucide-react';

function App() {
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [filename, setFilename] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('stats');
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [showUpload, setShowUpload] = useState<boolean>(false);
  const [showConfirmReset, setShowConfirmReset] = useState<boolean>(false);
  const { toasts, removeToast, error } = useToast();

  const handleResetConfirm = () => {
    setParseResult(null);
    setFilename('');
    setSelectedAccount('');
    setActiveTab('stats');
    setShowConfirmReset(false);
  };

  const handleFileLoad = (content: string, filename: string) => {
    try {
      const result = parseCFONB(content);
      setParseResult(result);
      setFilename(filename);
      setActiveTab('stats');
      setSelectedAccount('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';

      let title = 'Erreur de format';
      let message = errorMessage;

      if (errorMessage.includes('XML détecté')) {
        title = 'Format non supporté';
        message = 'Vous tentez d\'importer un fichier XML (probablement SEPA).\nCette application traite uniquement les fichiers CFONB 120/121 caractères.\n\nConseil: Demandez à votre banque un export au format CFONB via EBICS.';
      } else if (errorMessage.includes('JSON détecté')) {
        title = 'Format non supporté';
        message = 'Vous tentez d\'importer un fichier JSON.\nCette application traite uniquement les fichiers CFONB 120/121 caractères.';
      } else if (errorMessage.includes('CSV détecté')) {
        title = 'Format non supporté';
        message = 'Vous tentez d\'importer un fichier CSV.\nCette application traite uniquement les fichiers CFONB 120/121 caractères.';
      } else if (errorMessage.includes('Longueur incorrecte')) {
        title = 'Format CFONB invalide';
        message = 'Le fichier ne respecte pas le format CFONB 120/121 caractères.\nChaque ligne doit faire exactement 120 ou 121 caractères.\n\nVérifiez que c\'est bien un fichier de relevé bancaire CFONB.';
      }

      error(title, message, 10000);
    }
  };

  // Extraire les comptes uniques
  const getUniqueAccounts = (records: CFONBRecord[]) => {
    const accounts = new Set<string>();
    records.forEach(record => {
      if (record.banque && record.guichet && record.compte) {
        const accountKey = `${record.banque}-${record.guichet}-${record.compte}`;
        accounts.add(accountKey);
      }
    });
    return Array.from(accounts).sort();
  };

  // Filtrer les enregistrements par compte
  const getRecordsForAccount = (records: CFONBRecord[], accountKey: string) => {
    const [banque, guichet, compte] = accountKey.split('-');
    return records.filter(record => 
      record.banque === banque && 
      record.guichet === guichet && 
      record.compte === compte
    );
  };

  // Formater le nom d'affichage du compte
  const formatAccountName = (accountKey: string) => {
    const [banque, guichet, compte] = accountKey.split('-');
    return `${banque}-${guichet} • ${compte}`;
  };

  const handleExport = () => {
    if (parseResult) {
      let recordsToExport = parseResult.records;
      let exportFilename = filename.replace(/\.[^/.]+$/, '') + '_export.csv';
      
      // Si un compte spécifique est sélectionné, exporter seulement ses données
      if (selectedAccount) {
        recordsToExport = getRecordsForAccount(parseResult.records, selectedAccount);
        const accountName = selectedAccount.split('-').join('_');
        exportFilename = filename.replace(/\.[^/.]+$/, '') + `_${accountName}_export.csv`;
      }
      
      exportToCSV(recordsToExport, exportFilename);
    }
  };

  const loadDemoData = () => {
    setParseResult(demoParseResult);
    setFilename('demo_releve_bancaire.txt');
    setActiveTab('movements');
    setSelectedAccount('');
    setShowUpload(false);
  };

  const handleShowUpload = () => {
    setShowUpload(true);
  };

  const uniqueAccounts = parseResult ? getUniqueAccounts(parseResult.records) : [];
  const currentRecords = selectedAccount && parseResult 
    ? getRecordsForAccount(parseResult.records, selectedAccount)
    : parseResult?.records || [];

  return (
    <div className="min-h-screen bg-gray-100">
      <ToastContainer toasts={toasts} onClose={removeToast} />
      <ConfirmDialog
        isOpen={showConfirmReset}
        title="Analyser un nouveau fichier ?"
        message="Vous allez perdre toutes les données actuellement chargées. Cette action est irréversible.\n\nÊtes-vous sûr de vouloir continuer ?"
        confirmText="Oui, analyser un nouveau fichier"
        cancelText="Non, annuler"
        variant="warning"
        onConfirm={handleResetConfirm}
        onCancel={() => setShowConfirmReset(false)}
      />
      {!parseResult && !showUpload ? (
        <HomePage onLoadDemo={loadDemoData} onShowUpload={handleShowUpload} />
      ) : !parseResult ? (
        <div>
          <Header
            onLoadDemo={loadDemoData}
            onBackToHome={() => setShowUpload(false)}
            showDemoButton={true}
            showBackButton={true}
          />

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Importez votre fichier de relevé bancaire
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Cet outil analyse les fichiers CFONB 120/121 caractères reçus via EBICS. 
                Il extrait automatiquement les mouvements, soldes et informations complémentaires 
                selon la norme française.
              </p>
            </div>
            
            <FileUpload onFileLoad={handleFileLoad} onError={(title, message) => error(title, message, 8000)} />
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Formats supportés
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Types d'enregistrements</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• <strong>01</strong> - Ancien solde</li>
                    <li>• <strong>04</strong> - Mouvement bancaire</li>
                    <li>• <strong>05</strong> - Complément d'information</li>
                    <li>• <strong>07</strong> - Nouveau solde</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Fonctionnalités</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Décodage des montants signés</li>
                    <li>• Formatage des dates (JJMMAA → ISO)</li>
                    <li>• Extraction des codes opération</li>
                    <li>• Export CSV pour analyse</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          </main>
        </div>
      ) : (
        <div>
          <Header onLoadDemo={loadDemoData} showDemoButton={true} />

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {/* Navigation des onglets */}
            <div className="bg-white rounded-lg shadow">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8 px-6">
                  <button
                    onClick={() => setActiveTab('stats')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'stats'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="h-4 w-4" />
                      <span>Statistiques</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('records')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'records'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4" />
                      <span>Enregistrements ({parseResult.records.length})</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('movements')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'movements'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4" />
                      <span>Mouvements simplifiés</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('duplicates')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'duplicates'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Contrôle doublons</span>
                    </div>
                  </button>
                </nav>
              </div>
            </div>

            {/* Onglets par compte - visible pour toutes les vues */}
            {uniqueAccounts.length > 1 && (
              <div className="bg-white rounded-lg shadow">
                <div className="border-b border-gray-200">
                  <div className="px-6 py-3">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Comptes bancaires</h3>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setSelectedAccount('')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          selectedAccount === ''
                            ? 'bg-blue-100 text-blue-700 border border-blue-300'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                        }`}
                      >
                        Tous les comptes
                        <span className="ml-2 px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                          {parseResult.records.filter(r => r.type_enregistrement === '04').length}
                        </span>
                      </button>
                      {uniqueAccounts.map(account => {
                        const accountRecords = getRecordsForAccount(parseResult.records, account);
                        const movementCount = accountRecords.filter(r => r.type_enregistrement === '04').length;
                        return (
                          <button
                            key={account}
                            onClick={() => setSelectedAccount(account)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              selectedAccount === account
                                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                            }`}
                          >
                            {formatAccountName(account)}
                            <span className="ml-2 px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                              {movementCount}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Contenu des onglets */}
            {activeTab === 'stats' ? (
              <StatsDashboard result={{...parseResult, records: currentRecords}} filename={filename} />
            ) : activeTab === 'duplicates' ? (
              <DuplicatesDetection records={currentRecords} onExport={handleExport} />
            ) : activeTab === 'movements' ? (
              <SimpleMovementsTable records={currentRecords} onExport={handleExport} selectedAccount={selectedAccount} />
            ) : (
              <RecordTable records={currentRecords} onExport={handleExport} />
            )}

            {/* Actions */}
            <div className="flex justify-center">
              <button
                onClick={() => setShowConfirmReset(true)}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                ← Analyser un autre fichier
              </button>
            </div>
          </div>
          </main>
        </div>
      )}
    </div>
  );
}

export default App;
