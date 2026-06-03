// components/SimplePushNotificationTest.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const SimplePushNotificationTest: React.FC = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Em desenvolvimento (HTTP), as notificações podem não funcionar
      // Em produção (HTTPS), elas funcionarão normalmente
      const supported = 'serviceWorker' in navigator && 
                       'PushManager' in window && 
                       'Notification' in window;
      
      const isHTTPS = location.protocol === 'https:';
      const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
      
      // Suporte real: HTTPS ou localhost
      setIsSupported(supported && (isHTTPS || isLocalhost));
      
      if (typeof Notification !== 'undefined') {
        setPermission(Notification.permission);
      }
    }
  }, []);

  const requestPermission = async () => {
    if (!isSupported) {
      toast.error('Notificações não suportadas neste navegador');
      return;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        toast.success('Permissão concedida!');
      } else {
        toast.error('Permissão negada');
      }
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);
      toast.error('Erro ao solicitar permissão');
    }
  };

  const sendTestNotification = async () => {
    if (permission === 'granted') {
      try {
        // Usar Service Worker (método seguro e obrigatório)
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.getRegistration();
          if (registration && registration.active) {
            await registration.showNotification('Teste - Frota VSA', {
              body: 'Esta é uma notificação de teste via Service Worker!',
              icon: '/icons/icon-192x192.png',
              tag: 'test-notification'
            });
            toast.success('Notificação enviada via Service Worker!');
          } else {
            toast.error('Service Worker não está ativo. Registre primeiro.');
          }
        } else {
          toast.error('Service Worker não suportado neste navegador');
        }
      } catch (error) {
        console.error('Erro ao enviar notificação:', error);
        toast.error('Erro ao enviar notificação');
      }
    } else {
      toast.warning('Permissão necessária para enviar notificações');
    }
  };

  const testServiceWorkerNotification = async () => {
    if (permission !== 'granted') {
      toast.warning('Solicite permissão primeiro');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification('Teste Service Worker - Frota VSA', {
        body: 'Esta notificação foi enviada pelo Service Worker!',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png',
        tag: 'sw-test-notification'
      });
      toast.info('Notificação do Service Worker enviada!');
    } catch (error) {
      console.error('Erro ao enviar notificação SW:', error);
      toast.error('Erro ao enviar notificação pelo Service Worker');
    }
  };

  if (!isSupported) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.707 7.293a1 1 0 010 1.414L5.414 12l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              ⚠️ Notificações Push Requerem HTTPS
            </h3>
            <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
              As notificações push funcionam apenas em:
              <br />✅ <strong>Produção com HTTPS</strong> (https://frotavsa.iamtec.org)
              <br />✅ <strong>Localhost para desenvolvimento</strong>
              <br />❌ HTTP em outros domínios (atual)
              <br /><br />
              <strong>👉 Deploy em produção para testar as notificações!</strong>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          🧪 Teste de Notificações Push
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Use estes botões para testar as notificações passo a passo
        </p>
      </div>

      <div className="space-y-4">
        {/* Status das permissões */}
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Status das Permissões
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {permission === 'granted' && '✅ Permissões concedidas'}
              {permission === 'denied' && '❌ Permissões negadas'}
              {permission === 'default' && '⏳ Permissões não solicitadas'}
            </p>
          </div>
          <div className={`w-3 h-3 rounded-full ${
            permission === 'granted' ? 'bg-green-500' : 
            permission === 'denied' ? 'bg-red-500' : 'bg-yellow-500'
          }`}></div>
        </div>

        {/* Botões de teste */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={requestPermission}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            🔔 Solicitar Permissão
          </button>

          <button
            onClick={sendTestNotification}
            disabled={permission !== 'granted'}
            className="flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
          >
            📱 Notificação Simples
          </button>

          <button
            onClick={testServiceWorkerNotification}
            disabled={permission !== 'granted'}
            className="flex items-center justify-center px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
          >
            ⚙️ Service Worker
          </button>
        </div>

        {permission === 'denied' && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <p className="text-sm text-red-700 dark:text-red-300">
              <strong>Permissões bloqueadas!</strong> Para ativar:
              <br />1. Clique no ícone de cadeado/informação na barra de endereços
              <br />2. Altere &ldquo;Notificações&rdquo; para &ldquo;Permitir&rdquo;
              <br />3. Recarregue a página
            </p>
          </div>
        )}

        {permission === 'granted' && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
            <p className="text-sm text-green-700 dark:text-green-300">
              <strong>✅ Tudo funcionando!</strong> As notificações estão ativas. 
              Teste os botões acima para ver diferentes tipos de notificações.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimplePushNotificationTest;
