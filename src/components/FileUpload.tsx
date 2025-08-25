import React, { useCallback, useState } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  onFileLoad: (content: string, filename: string) => void;
}

export function FileUpload({ onFileLoad }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleFile = useCallback((file: File) => {
    if (!file.name.toLowerCase().includes('.txt') && !file.name.toLowerCase().includes('.cfonb')) {
      // Accepter tous les fichiers texte
      return;
    }

    setIsLoading(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onFileLoad(content, file.name);
      setIsLoading(false);
    };
    
    reader.onerror = () => {
      alert('Erreur lors de la lecture du fichier');
      setIsLoading(false);
    };
    
    reader.readAsText(file, 'latin1'); // Encodage commun pour les fichiers CFONB
  }, [onFileLoad]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
          ${isDragOver 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${isLoading ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="flex flex-col items-center space-y-4">
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-lg text-gray-600">Chargement du fichier...</p>
            </>
          ) : (
            <>
              <div className="flex items-center space-x-2">
                <Upload className="h-8 w-8 text-blue-600" />
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Importer un fichier CFONB 120/121 caractères
                </h3>
                <p className="text-gray-600 mb-4">
                  Glissez-déposez votre fichier de relevé bancaire ou cliquez pour le sélectionner
                </p>
              </div>

              <input
                type="file"
                id="file-input"
                className="hidden"
                accept=".txt,.cfonb"
                onChange={handleInputChange}
              />
              
              <label
                htmlFor="file-input"
                className="cursor-pointer bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
              >
                Sélectionner un fichier
              </label>

              <div className="flex items-start space-x-2 text-sm text-gray-500 max-w-md">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p>
                  Formats acceptés: tous fichiers texte<br />
                  Le fichier doit contenir des lignes de 120 ou 121 caractères selon la norme CFONB
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}