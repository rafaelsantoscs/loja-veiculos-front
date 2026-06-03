// hooks/usePushNotifications.ts
import { useState, useEffect } from 'react';
import axiosInstance from '@/services/axiosInstance';
import { getUserLocalStorage } from '@/store/userLocalStorage';
import { VAPID_PUBLIC_KEY } from '@/config/config';

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export const usePushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [vapidPublicKey, setVapidPublicKey] = useState<string>('BEDENAz3fGhIJE53o3iHk1okSh6Rzzc8tVKqAuoDesDJCaL8iEWpHWnxHWp4_A5bKvxYOe5OVvNQLLJ9595hXbM');

  // Função para diagnóstico específico de dispositivos móveis
  const diagnoseMobileNotifications = () => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/i.test(navigator.userAgent);
    
    console.log('🔍 ========== DIAGNÓSTICO MOBILE ==========');
    console.log('📱 Tipo de dispositivo:', {
      isMobile,
      isIOS,
      isAndroid,
      userAgent: navigator.userAgent
    });
    
    // Verificar configurações específicas do dispositivo
    if (isIOS) {
      console.log('📱 DIAGNÓSTICO iOS:');
      console.log('   - iOS tem limitações para PWAs. Certifique-se de que:');
      console.log('   - 1. O site foi adicionado à tela inicial');
      console.log('   - 2. Está sendo acessado através do ícone na tela inicial');
      console.log('   - 3. As configurações de notificação do Safari estão habilitadas');
      console.log('   - 4. Modo "Não Perturbe" está desabilitado');
    }
    
    if (isAndroid) {
      console.log('📱 DIAGNÓSTICO Android:');
      console.log('   - Verificar se as notificações estão habilitadas para o site');
      console.log('   - Verificar configurações de economia de bateria');
      console.log('   - Verificar se o Chrome tem permissão para notificações');
      console.log('   - Verificar se o site não está em modo "Silencioso"');
    }
    
    // Verificar permissões detalhadas
    if (typeof Notification !== 'undefined') {
      console.log('🔔 Estado atual das notificações:', Notification.permission);
      
      if (Notification.permission === 'denied') {
        console.log('❌ PROBLEMA: Notificações foram negadas pelo usuário');
        console.log('   - Em mobile, isso pode ter sido feito acidentalmente');
        console.log('   - Instruir o usuário a verificar configurações do navegador');
        console.log('   - Pode ser necessário limpar dados do site e tentar novamente');
      }
      
      if (Notification.permission === 'default') {
        console.log('⚠️ Notificações ainda não foram solicitadas');
      }
      
      if (Notification.permission === 'granted') {
        console.log('✅ Permissão concedida - problema pode estar no service worker ou configurações do sistema');
      }
    }
    
    // Verificar service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        console.log('🔧 Service Workers registrados:', registrations.length);
        registrations.forEach((reg, index) => {
          console.log(`   SW ${index + 1}:`, {
            scope: reg.scope,
            state: reg.active?.state,
            scriptURL: reg.active?.scriptURL
          });
        });
      });
    }
    
    console.log('🔍 ========== FIM DIAGNÓSTICO MOBILE ==========');
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('🔥 ========== VERIFICANDO SUPORTE A PUSH NOTIFICATIONS ==========');
      
      // Detectar tipo de dispositivo
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isAndroid = /Android/i.test(navigator.userAgent);
      
      console.log('🔍 Ambiente:', {
        protocol: location.protocol,
        hostname: location.hostname,
        href: location.href,
        isMobile,
        isIOS,
        isAndroid,
        userAgent: navigator.userAgent
      });
      
      // Verificar se o navegador suporta push notifications
      const hasFeatureSupport = 'serviceWorker' in navigator && 
                               'PushManager' in window && 
                               'Notification' in window;
      
      console.log('🔍 Suporte a recursos:', {
        serviceWorker: 'serviceWorker' in navigator,
        pushManager: 'PushManager' in window,
        notification: 'Notification' in window,
        hasFeatureSupport
      });
      
      // Verificar se está em ambiente seguro (HTTPS ou localhost)
      const isHTTPS = location.protocol === 'https:';
      const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
      const isSecureContext = isHTTPS || isLocalhost;
      
      console.log('🔍 Contexto seguro:', {
        isHTTPS,
        isLocalhost,
        isSecureContext
      });
      
      const isSupported = hasFeatureSupport && isSecureContext;
      
      console.log('✅ Push notifications suportadas:', isSupported);
      setIsSupported(isSupported);
      
      if (typeof Notification !== 'undefined') {
        const currentPermission = Notification.permission;
        console.log('🔍 Permissão atual de notificação:', currentPermission);
        setPermission(currentPermission);
      }
      
      console.log('🔥 ========== FIM VERIFICAÇÃO SUPORTE ==========');
      
      if (isSupported) {
        loadVapidPublicKey();
        checkSubscription();
      }
      
      // Executar diagnóstico automático em dispositivos móveis
      if (isMobile) {
        setTimeout(() => {
          diagnoseMobileNotifications();
        }, 2000); // Aguardar 2 segundos para que outros logs sejam processados primeiro
      }
    }
    setIsLoading(false);
  }, []);

  const loadVapidPublicKey = async () => {
    try {
      console.log('🔑 ========== CARREGANDO CHAVE VAPID PÚBLICA ==========');
      console.log('🔍 Chave VAPID atual no estado:', vapidPublicKey);
      console.log('🔍 Chave VAPID do config:', VAPID_PUBLIC_KEY);
      
      // Usar a chave VAPID configurada localmente primeiro
      if (!vapidPublicKey && VAPID_PUBLIC_KEY) {
        console.log('✅ Usando chave VAPID do config local');
        setVapidPublicKey(VAPID_PUBLIC_KEY);
        return;
      }

      const user = getUserLocalStorage();
      console.log('🔍 Usuário logado:', !!user);
      console.log('🔍 Token disponível:', !!user?.token);
      
      if (!user?.token) {
        console.warn('⚠️ Token não disponível para carregar chave VAPID');
        return;
      }

      console.log('🔄 Fazendo requisição para buscar chave VAPID do servidor...');
      const response = await axiosInstance.get('/api/push-notifications/vapid-public-key', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      console.log('✅ Chave VAPID recebida do servidor:', response.data.publicKey);
      setVapidPublicKey(response.data.publicKey);
      console.log('🔑 ========== CHAVE VAPID CARREGADA ==========');
    } catch (error) {
      console.error('❌ Erro ao carregar chave VAPID pública:', error);
      // Usar a chave padrão configurada como fallback
      if (VAPID_PUBLIC_KEY && !vapidPublicKey) {
        console.log('🔄 Usando chave VAPID de fallback do config');
        setVapidPublicKey(VAPID_PUBLIC_KEY);
      }
    }
  };

  const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const buffer = new ArrayBuffer(rawData.length);
    const outputArray = new Uint8Array(buffer);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const checkSubscription = async () => {
    console.log('🔍 ========== VERIFICANDO SUBSCRIPTION EXISTENTE ==========');
    console.log('🔍 Push notifications suportadas:', isSupported);
    
    if (!isSupported) {
      console.log('❌ Push notifications não suportadas, cancelando verificação');
      return;
    }

    try {
      console.log('🔄 Aguardando service worker estar pronto...');
      const registration = await navigator.serviceWorker.ready;
      console.log('✅ Service worker pronto');
      
      console.log('🔄 Buscando subscription existente...');
      const pushSubscription = await registration.pushManager.getSubscription();
      
      if (pushSubscription) {
        console.log('✅ Subscription existente encontrada:', pushSubscription.endpoint);
        const subscriptionData = {
          endpoint: pushSubscription.endpoint,
          keys: {
            p256dh: btoa(String.fromCharCode(...new Uint8Array(pushSubscription.getKey('p256dh')!))),
            auth: btoa(String.fromCharCode(...new Uint8Array(pushSubscription.getKey('auth')!)))
          }
        };
        console.log('📤 Dados da subscription:', subscriptionData);
        setSubscription(subscriptionData);
      } else {
        console.log('ℹ️ Nenhuma subscription existente encontrada');
      }
      console.log('🔍 ========== FIM VERIFICAÇÃO SUBSCRIPTION ==========');
    } catch (error) {
      console.error('❌ Erro ao verificar subscription:', error);
    }
  };

  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) {
      console.error('Push notifications não suportadas');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);
      
      if (permission === 'granted') {
        return true;
      } else {
        console.log('Permissão negada para notificações');
        return false;
      }
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);
      return false;
    }
  };

  const subscribe = async (): Promise<PushSubscription | null> => {
    console.log('🚀 ========== INICIANDO PROCESSO DE SUBSCRIPTION ==========');
    console.log('🔍 Push notifications suportadas:', isSupported);
    console.log('🔍 Permissão atual:', permission);
    
    if (!isSupported || permission !== 'granted') {
      console.log('🔄 Solicitando permissão...');
      const granted = await requestPermission();
      if (!granted) {
        console.log('❌ Permissão não concedida, cancelando subscription');
        return null;
      }
    }

    console.log('🔍 Chave VAPID disponível:', !!vapidPublicKey);
    console.log('🔍 Chave VAPID completa:', vapidPublicKey);

    if (!vapidPublicKey) {
      console.error('❌ Chave VAPID pública não disponível');
      return null;
    }

    try {
      console.log('🔄 Aguardando service worker estar pronto...');
      const registration = await navigator.serviceWorker.ready;
      console.log('✅ Service worker pronto');
      
      // Verificar se já existe uma subscription e remover se necessário
      console.log('🔄 Verificando subscription existente...');
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        console.log('🧹 Removendo subscription antiga para evitar conflitos...');
        await existingSubscription.unsubscribe();
        console.log('✅ Subscription antiga removida');
      } else {
        console.log('ℹ️ Nenhuma subscription antiga encontrada');
      }
      
      console.log('🔄 Convertendo chave VAPID para Uint8Array...');
      const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
      console.log('✅ Chave VAPID convertida, tamanho:', applicationServerKey.length);
      
      console.log('🔄 Criando nova subscription...');
      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey as BufferSource
      });
      console.log('✅ Nova subscription criada:', pushSubscription.endpoint);

      console.log('🔄 Convertendo dados da subscription...');
      const subscriptionData = {
        endpoint: pushSubscription.endpoint,
        keys: {
          p256dh: btoa(String.fromCharCode(...new Uint8Array(pushSubscription.getKey('p256dh')!))),
          auth: btoa(String.fromCharCode(...new Uint8Array(pushSubscription.getKey('auth')!)))
        }
      };
      console.log('✅ Dados da subscription convertidos:', subscriptionData);

      console.log('🔄 Salvando subscription no estado...');
      setSubscription(subscriptionData);
      console.log('✅ Subscription salva no estado');
      
      // Enviar subscription para o servidor
      console.log('� Enviando subscription para o servidor...');
      const serverResult = await saveSubscriptionToServer(subscriptionData);
      if (serverResult.success) {
        console.log('✅ Subscription salva no servidor!');
      } else {
        console.warn('⚠️ Erro ao salvar no servidor:', serverResult.error);
      }
      
      console.log('�🚀 ========== SUBSCRIPTION CRIADA COM SUCESSO ==========');
      return subscriptionData;
    } catch (error) {
      console.error('❌ ========== ERRO AO CRIAR SUBSCRIPTION ==========');
      console.error('❌ Erro detalhado:', error);
      console.error('❌ ========== FIM ERRO SUBSCRIPTION ==========');
      return null;
    }
  };

  // Função para salvar a subscription no servidor
  const saveSubscriptionToServer = async (subscriptionData: PushSubscription): Promise<{success: boolean, error?: string}> => {
    try {
      const user = getUserLocalStorage();
      if (!user?.token) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      console.log('📤 Enviando subscription para /api/push-subscriptions...');
      const response = await axiosInstance.post('/api/push-subscriptions', subscriptionData, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      console.log('✅ Resposta do servidor:', response.data);
      return { success: true };
    } catch (error) {
      console.error('❌ Erro ao salvar subscription no servidor:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  };

  const unsubscribe = async (): Promise<boolean> => {
    if (!subscription) return true;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        const successful = await subscription.unsubscribe();
        if (successful) {
          setSubscription(null);
        }
        return successful;
      }
      return true;
    } catch (error) {
      console.error('Erro ao cancelar inscrição:', error);
      return false;
    }
  };

  const sendTestNotification = async () => {
    console.log('🧪 ========== ENVIANDO NOTIFICAÇÃO DE TESTE ==========');
    
    if (!subscription) {
      console.log('❌ Nenhuma subscription ativa para teste');
      return;
    }

    try {
      // Detectar se é mobile
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      console.log('📱 Dispositivo móvel detectado:', isMobile);

      const registration = await navigator.serviceWorker.ready;
      console.log('✅ Service Worker pronto para teste');

      // Configurações diferentes para mobile e desktop
      const testOptions = {
        body: `Esta é uma notificação de teste para ${isMobile ? 'mobile' : 'desktop'}!`,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png',
        tag: 'test-notification-' + Date.now(),
        timestamp: Date.now(),
        silent: false
      };

      if (isMobile) {
        console.log('📱 Aplicando configurações de teste para mobile');
        Object.assign(testOptions, {
          vibrate: [300, 200, 300],
          requireInteraction: false,
          renotify: true
        });
      } else {
        console.log('💻 Aplicando configurações de teste para desktop');
        Object.assign(testOptions, {
          vibrate: [200, 100, 200],
          requireInteraction: true,
          actions: [
            { action: 'test', title: 'Teste OK' }
          ]
        });
      }

      console.log('📋 Opções do teste:', testOptions);

      await registration.showNotification('🧪 Teste - Frota VSA', testOptions);
      console.log('✅ Notificação de teste enviada com sucesso!');
      console.log('🧪 ========== FIM TESTE NOTIFICAÇÃO ==========');
      
    } catch (error) {
      console.error('❌ Erro ao enviar notificação de teste:', error);
    }
  };

  return {
    isSupported,
    subscription,
    permission,
    isLoading,
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification,
    saveSubscriptionToServer,
    diagnoseMobileNotifications // Adicionar função de diagnóstico
  };
};
