// components/PushNotificationManager.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { usePushNotifications, PushSubscription as CustomPushSubscription } from '@/hooks/usePushNotifications';
import { toast } from 'react-toastify';
import axiosInstance from '@/services/axiosInstance';
import { getUserLocalStorage } from '@/store/userLocalStorage';

interface PushNotificationManagerProps {
  onSubscriptionChange?: (subscription: CustomPushSubscription | null) => void;
}

const PushNotificationManager: React.FC<PushNotificationManagerProps> = ({ 
  onSubscriptionChange 
}) => {
  const {
    isSupported,
    subscription,
    permission,
    isLoading,
    subscribe,
    unsubscribe,
    sendTestNotification
  } = usePushNotifications();

  const [isSaving, setIsSaving] = useState(false);
  const [token, setToken] = useState("");

  useEffect(() => {
    const user = getUserLocalStorage();
    if (user?.token) {
      setToken(user.token);
    }
  }, []);

  const handleEnableNotifications = async () => {
    console.log('🎯 ========== HABILITANDO NOTIFICAÇÕES ==========');
    console.log('🔍 Estado inicial:', {
      isSupported,
      permission,
      hasSubscription: !!subscription,
      token: !!token
    });
    
    setIsSaving(true);
    try {
      console.log('🔄 Chamando método subscribe...');
      const newSubscription = await subscribe();
      console.log('📤 Subscription recebida:', newSubscription);
      
      if (newSubscription) {
        // Salvar a subscription no backend
        console.log('🔄 Salvando subscription no servidor...');
        await saveSubscriptionToServer(newSubscription);
        console.log('✅ Subscription salva no servidor com sucesso');
        
        toast.success('Notificações push ativadas com sucesso!');
        onSubscriptionChange?.(newSubscription);
        console.log('🎯 ========== NOTIFICAÇÕES HABILITADAS COM SUCESSO ==========');
      } else {
        console.log('❌ Falha ao criar subscription');
        toast.error('Erro ao ativar notificações push');
      }
    } catch (error) {
      console.error('❌ ========== ERRO AO HABILITAR NOTIFICAÇÕES ==========');
      console.error('❌ Erro detalhado:', error);
      console.error('❌ ========== FIM ERRO HABILITAÇÃO ==========');
      toast.error('Erro ao ativar notificações push');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDisableNotifications = async () => {
    setIsSaving(true);
    try {
      const success = await unsubscribe();
      if (success) {
        // Remover a subscription do backend
        await removeSubscriptionFromServer();
        toast.success('Notificações push desativadas');
        onSubscriptionChange?.(null);
      } else {
        toast.error('Erro ao desativar notificações');
      }
    } catch (error) {
      console.error('Erro ao desativar notificações:', error);
      toast.error('Erro ao desativar notificações');
    } finally {
      setIsSaving(false);
    }
  };

  const saveSubscriptionToServer = async (subscription: CustomPushSubscription) => {
    console.log('💾 ========== SALVANDO SUBSCRIPTION NO SERVIDOR ==========');
    console.log('🔍 Token disponível:', !!token);
    console.log('📤 Subscription a ser enviada:', subscription);
    
    if (!token) {
      console.log('❌ Token não disponível, cancelando salvamento');
      return;
    }

    try {
      console.log('🔄 Fazendo requisição POST para /api/push-subscriptions...');
      const response = await axiosInstance.post('/api/push-subscriptions', subscription, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Resposta do servidor:', response.data);
      console.log('💾 ========== SUBSCRIPTION SALVA COM SUCESSO ==========');
    } catch (error) {
      console.error('❌ ========== ERRO AO SALVAR SUBSCRIPTION ==========');
      console.error('❌ Erro detalhado:', error);
      console.error('❌ ========== FIM ERRO SALVAMENTO ==========');
      throw error;
    }
  };

  const removeSubscriptionFromServer = async () => {
    if (!token) return;

    try {
      await axiosInstance.delete('/api/push-subscriptions', {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Erro ao remover subscription do servidor:', error);
      throw error;
    }
  };

  const handleTestNotification = async () => {
    if (subscription) {
      await sendTestNotification();
      toast.info('Notificação de teste enviada!');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
          Carregando configurações...
        </span>
      </div>
    );
  }

  if (!isSupported) {
    const isHTTPS = typeof window !== 'undefined' && location.protocol === 'https:';
    const isLocalhost = typeof window !== 'undefined' && (location.hostname === 'localhost' || location.hostname === '127.0.0.1');
    
    return (
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
              🚀 Deploy em Produção para Notificações Push
            </h3>
            <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
              As notificações push estão preparadas e funcionarão automaticamente quando você fizer o deploy para:
              <br />✅ <strong>https://frotavsa.iamtec.org</strong> (produção com HTTPS)
              <br />
              <br />No ambiente atual ({typeof window !== 'undefined' ? location.protocol + '//' + location.hostname : 'desenvolvimento'}), 
              as notificações push {!isHTTPS && !isLocalhost ? 'requerem HTTPS' : 'podem não funcionar completamente'}.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Notificações Push
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Receba notificações mesmo quando o app estiver fechado
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {subscription && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
              Ativo
            </span>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Status das Permissões
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {permission === 'granted' && 'Permissões concedidas ✓'}
              {permission === 'denied' && 'Permissões negadas ✗'}
              {permission === 'default' && 'Permissões não solicitadas'}
            </p>
          </div>
          <div className={`w-3 h-3 rounded-full ${
            permission === 'granted' ? 'bg-green-500' : 
            permission === 'denied' ? 'bg-red-500' : 'bg-yellow-500'
          }`}></div>
        </div>

        {permission === 'denied' && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <p className="text-sm text-red-700 dark:text-red-300">
              As notificações foram bloqueadas. Para ativá-las, clique no ícone de cadeado na barra de endereços 
              e permita notificações para este site.
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          {!subscription ? (
            <button
              onClick={handleEnableNotifications}
              disabled={isSaving || permission === 'denied'}
              className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Ativando...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5V3h0z" />
                  </svg>
                  Ativar Notificações Push
                </>
              )}
            </button>
          ) : (
            <>
              <button
                onClick={handleDisableNotifications}
                disabled={isSaving}
                className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Desativando...
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Desativar Notificações
                  </>
                )}
              </button>
              <button
                onClick={handleTestNotification}
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5V3h0z" />
                </svg>
                Testar Notificação
              </button>
            </>
          )}
        </div>

        {subscription && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>✓ Notificações push ativas:</strong> Agora você receberá notificações 
              mesmo quando o aplicativo estiver fechado.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PushNotificationManager;
