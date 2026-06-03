// src/app/instrucoes-offline/page.tsx

import React from 'react';
import { Fuel, Smartphone, Wifi, QrCode, Download, CheckCircle } from 'lucide-react';

const InstrucoesOfflinePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Cabeçalho */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Fuel className="w-12 h-12 text-orange-600" />
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
              Abastecimento Offline
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Como usar o sistema de abastecimento sem internet
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Seção 1: QR Code */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <QrCode className="w-8 h-8 text-orange-600" />
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                1. Acesso Rápido via QR Code
              </h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-300">
                  <CheckCircle className="w-5 h-5 inline text-green-600 mr-2" />
                  Não precisa fazer login
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  <CheckCircle className="w-5 h-5 inline text-green-600 mr-2" />
                  Funciona mesmo sem internet
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  <CheckCircle className="w-5 h-5 inline text-green-600 mr-2" />
                  Dados salvos localmente
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  <CheckCircle className="w-5 h-5 inline text-green-600 mr-2" />
                  Sincronização automática
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 inline-block">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${typeof window !== 'undefined' ? window.location.origin : ''}/abastecimento-offline`)}`}
                    alt="QR Code para Abastecimento Offline"
                    className="w-48 h-48 mx-auto"
                    loading="lazy"
                  />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Escaneie para acesso direto
                </p>
              </div>
            </div>
          </div>

          {/* Seção 2: Como instalar como App */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Smartphone className="w-8 h-8 text-orange-600" />
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                2. Instalar como App no Celular
              </h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {/* Android Chrome */}
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 dark:text-green-200 mb-3">
                  📱 Android (Chrome)
                </h3>
                <ol className="space-y-2 text-sm text-green-700 dark:text-green-300">
                  <li>1. Acesse o link pelo Chrome</li>
                  <li>2. Toque no menu (⋮)</li>
                  <li>3. &quot;Adicionar à tela inicial&quot;</li>
                  <li>4. Confirme &quot;Adicionar&quot;</li>
                </ol>
              </div>

              {/* iPhone Safari */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">
                  🍎 iPhone (Safari)
                </h3>
                <ol className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                  <li>1. Acesse o link pelo Safari</li>
                  <li>2. Toque no botão de &quot;Compartilhar&quot; (□↗)</li>
                  <li>3. &quot;Adicionar à Tela Inicial&quot;</li>
                  <li>4. Confirme &quot;Adicionar&quot;</li>
                </ol>
              </div>

              {/* Computador */}
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-3">
                  💻 Computador (Chrome/Edge)
                </h3>
                <ol className="space-y-2 text-sm text-purple-700 dark:text-purple-300">
                  <li>1. Acesse o link</li>
                  <li>2. Clique no ícone de &quot;Instalar&quot; na barra de endereço</li>
                  <li>3. Confirme &quot;Instalar&quot;</li>
                  <li>4. App aparece na área de trabalho</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Seção 3: Como funciona offline */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Wifi className="w-8 h-8 text-orange-600" />
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                3. Como Funciona Offline
              </h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  Quando sem internet:
                </h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">📱</span>
                    Os dados são salvos no próprio dispositivo
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">💾</span>
                    Pode registrar quantos abastecimentos precisar
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">⚡</span>
                    Interface funciona normalmente
                  </li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  Quando volta a internet:
                </h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">🔄</span>
                    Sincronização automática
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">✅</span>
                    Dados enviados para o servidor
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">🗑️</span>
                    Cache local limpo automaticamente
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Seção 4: Links úteis */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Download className="w-8 h-8 text-orange-600" />
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                4. Links Úteis
              </h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <a 
                href="/abastecimento-offline"
                className="block bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Fuel className="w-6 h-6 text-orange-600" />
                  <div>
                    <div className="font-semibold text-orange-800 dark:text-orange-200">
                      Registrar Abastecimento
                    </div>
                    <div className="text-sm text-orange-600 dark:text-orange-300">
                      Acesso direto ao formulário
                    </div>
                  </div>
                </div>
              </a>
              
              <a 
                href="/dashboard"
                className="block bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <QrCode className="w-6 h-6 text-blue-600" />
                  <div>
                    <div className="font-semibold text-blue-800 dark:text-blue-200">
                      Dashboard (QR Code)
                    </div>
                    <div className="text-sm text-blue-600 dark:text-blue-300">
                      Ver QR Code para compartilhar
                    </div>
                  </div>
                </div>
              </a>
            </div>
          </div>

        </div>

        {/* Rodapé */}
        <div className="text-center mt-8 text-gray-600 dark:text-gray-400">
          <p>Sistema de Abastecimento - Prefeitura de Vitória</p>
          <p className="text-sm">Desenvolvido para funcionar em qualquer situação</p>
        </div>
      </div>
    </div>
  );
};

export default InstrucoesOfflinePage;
