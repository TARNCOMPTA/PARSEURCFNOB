import React from 'react';
import { Banknote, Shield, Download, Zap, FileText, Lock, Cpu, Globe } from 'lucide-react';
import { appConfig } from '../config/app.config';

interface HomePageProps {
  onLoadDemo: () => void;
  onShowUpload: () => void;
}

export function HomePage({ onLoadDemo, onShowUpload }: HomePageProps) {
  const features = [
    {
      icon: Shield,
      title: "100% Local & Sécurisé",
      description: "Vos données restent sur votre ordinateur. Aucun envoi vers des serveurs externes.",
      color: "text-blue-600"
    },
    {
      icon: Zap,
      title: "Traitement Instantané",
      description: "Analyse ultra-rapide de vos fichiers CFONB avec résultats immédiats.",
      color: "text-green-600"
    },
    {
      icon: FileText,
      title: "Format CFONB 120/121",
      description: "Compatible avec tous les fichiers de relevés bancaires EBICS français.",
      color: "text-blue-600"
    },
    {
      icon: Download,
      title: "Export CSV Gratuit",
      description: "Exportez vos données analysées au format CSV pour Excel ou autres outils.",
      color: "text-green-600"
    }
  ];

  const stats = [
    { label: "Gratuit", value: "100%", icon: Lock },
    { label: "Local", value: "0%", sublabel: "données envoyées", icon: Cpu },
    { label: "Formats", value: "CFONB", sublabel: "120/121 chars", icon: FileText },
    { label: "Export", value: "CSV", sublabel: "Excel ready", icon: Download }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-green-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="flex justify-center items-center space-x-4 mb-8">
              <div className="p-4 bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl shadow-lg">
                <Banknote className="h-12 w-12 text-white" />
              </div>
              <div className="p-4 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl shadow-lg">
                <FileText className="h-12 w-12 text-white" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Analyseur CFONB
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">
                100% Gratuit & Local
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Analysez vos relevés bancaires CFONB en toute sécurité. 
              Vos données restent sur votre ordinateur, aucun serveur externe.
              Traitement instantané et export CSV inclus.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button
                onClick={onShowUpload}
                className="group bg-gradient-to-r from-blue-600 to-green-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
              >
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Analyser mon fichier</span>
                </div>
              </button>

              <button
                onClick={onLoadDemo}
                className="group bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
              >
                <div className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>Voir la démo</span>
                </div>
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-blue-100">
                  <div className="flex items-center justify-center mb-3">
                    <stat.icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm font-medium text-blue-600 mb-1">{stat.label}</div>
                  {stat.sublabel && (
                    <div className="text-xs text-gray-500">{stat.sublabel}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Pourquoi choisir notre analyseur ?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Un outil professionnel, gratuit et sécurisé pour tous vos besoins d'analyse bancaire
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-100 hover:border-blue-200">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="p-3 bg-gradient-to-r from-blue-100 to-green-100 rounded-xl">
                      <feature.icon className={`h-8 w-8 ${feature.color}`} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Technical Details */}
      <div className="py-20 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <h2 className="text-4xl font-bold mb-8">
              Technologie de pointe
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <Globe className="h-12 w-12 text-white mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Dans le navigateur</h3>
                <p className="text-blue-100">
                  Fonctionne entièrement dans votre navigateur web, aucune installation requise
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <Cpu className="h-12 w-12 text-white mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Traitement local</h3>
                <p className="text-blue-100">
                  Toutes les données sont traitées sur votre machine, zéro transfert réseau
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <Shield className="h-12 w-12 text-white mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Sécurité maximale</h3>
                <p className="text-blue-100">
                  Vos données bancaires ne quittent jamais votre ordinateur
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Prêt à analyser vos relevés ?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Commencez dès maintenant avec notre outil gratuit et sécurisé
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onShowUpload}
              className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
            >
              Commencer maintenant
            </button>
            <button
              onClick={onLoadDemo}
              className="bg-blue-100 text-blue-700 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-200 transition-all duration-200"
            >
              Voir un exemple
            </button>
          </div>
        </div>
      </div>

      {/* Footer avec informations auteur */}
      <footer className="bg-gradient-to-r from-slate-800 to-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white bg-opacity-20 rounded-full mb-4">
                <Banknote className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2">
                Développé par un professionnel
              </h3>
              <p className="text-blue-200 text-lg mb-4">
                Cet outil a été créé par <strong className="text-white">{appConfig.author.name}</strong>
              </p>
              <p className="text-blue-200">
                {appConfig.author.title} du <strong className="text-white">{appConfig.author.company}</strong>
              </p>
            </div>

            <div className="border-t border-slate-700 pt-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div>
                  <h4 className="font-semibold text-white mb-2">Expertise comptable</h4>
                  <p className="text-blue-200">
                    Solution développée avec l'expertise d'un professionnel de la comptabilité
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">Norme CFONB</h4>
                  <p className="text-blue-200">
                    Respect strict des standards bancaires français EBICS
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">Sécurité</h4>
                  <p className="text-blue-200">
                    Traitement 100% local, vos données restent confidentielles
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-700 text-center">
              <p className="text-slate-300 text-sm">
                © {appConfig.copyright.year} {appConfig.copyright.holder} - Outil gratuit pour l'analyse des relevés bancaires CFONB
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}