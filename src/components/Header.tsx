import React from 'react';
import { Banknote, FileText } from 'lucide-react';

interface HeaderProps {
  onLoadDemo?: () => void;
  onBackToHome?: () => void;
  showDemoButton?: boolean;
  showBackButton?: boolean;
}

export function Header({ onLoadDemo, onBackToHome, showDemoButton = true, showBackButton = false }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Banknote className="h-8 w-8 text-blue-600" />
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Parseur CFONB 120/121
              </h1>
              <p className="text-sm text-gray-500">
                Analyseur de relevés bancaires EBICS
              </p>
            </div>
          </div>

          <div className="text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <span>Norme CFONB • Format 120/121 caractères</span>
              {showDemoButton && onLoadDemo && (
                <button
                  onClick={onLoadDemo}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
                >
                  Voir la démo
                </button>
              )}
              {showBackButton && onBackToHome && (
                <button
                  onClick={onBackToHome}
                  className="bg-gray-600 text-white px-3 py-1 rounded text-xs hover:bg-gray-700 transition-colors"
                >
                  ← Accueil
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
