// src/components/QRCodeOffline.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { QrCode, Wifi, WifiOff, Smartphone, ExternalLink } from 'lucide-react';

interface QRCodeOfflineProps {
  url?: string;
}

const QRCodeOffline: React.FC<QRCodeOfflineProps> = ({ 
  url = `${typeof window !== 'undefined' ? window.location.origin : ''}/abastecimento-offline` 
}) => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Verifica status inicial
    setIsOnline(navigator.onLine);

    // Adiciona listeners para mudanças de conexão
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const generateQRCodeUrl = (text: string) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`;
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(url);
    alert('Link copiado para a área de transferência!');
  };

  const handleDirectAccess = () => {
    if (!isOnline) {
      // Se offline, vai direto para página offline
      window.location.href = '/abastecimento-offline';
    } else {
      // Se online, abre em nova aba
      window.open('/abastecimento-offline', '_blank');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
      <div className="flex items-center justify-center space-x-2 mb-4">
        <QrCode className="w-6 h-6 text-orange-600" />
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
          Abastecimento {!isOnline ? 'Offline' : 'Móvel'}
        </h3>
        {isOnline ? (
          <Wifi className="w-5 h-5 text-green-500" />
        ) : (
          <WifiOff className="w-5 h-5 text-red-500" />
        )}
      </div>
      
      <div className="mb-4">
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-3 ${
          isOnline 
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        }`}>
          {isOnline ? 'Online' : 'Offline'}
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {isOnline 
            ? 'Escaneie para acessar o sistema de abastecimento no celular:'
            : 'Sem internet. Use o abastecimento offline:'
          }
        </p>
      </div>
      
      <div className="mb-4">
        <img 
          src={generateQRCodeUrl(url)}
          alt="QR Code para Abastecimento Offline"
          className="mx-auto rounded-lg shadow-md"
          loading="lazy"
        />
      </div>
      
      <div className="space-y-3">
        <div className="bg-gray-100 dark:bg-gray-700 rounded-md p-2 text-sm text-gray-800 dark:text-gray-200 font-mono break-all">
          {url}
        </div>
        
        <div className="flex justify-center space-x-2">
          <button
            onClick={handleCopyUrl}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center space-x-2"
          >
            <span>📋 Copiar Link</span>
          </button>
          
          <button
            onClick={handleDirectAccess}
            className={`px-4 py-2 rounded-lg transition-colors text-sm flex items-center space-x-2 ${
              isOnline
                ? 'bg-orange-600 text-white hover:bg-orange-700'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            {isOnline ? (
              <>
                <ExternalLink className="w-4 h-4" />
                <span>Abrir</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4" />
                <span>Acessar Offline</span>
              </>
            )}
          </button>
        </div>
        
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-3">
          <div className="flex items-center justify-center space-x-2">
            <Smartphone className="w-4 h-4" />
            <span>Funciona offline após primeira visita</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeOffline;
