'use client'
import { useEffect, useState } from 'react';

export interface NotificationResult {
  success: boolean;
  message: string;
  error?: string;
}

export const useNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [hasServiceWorker, setHasServiceWorker] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Verificar suporte básico
    const supported = 'Notification' in window;
    setIsSupported(supported);

    if (supported) {
      setPermission(Notification.permission);
    }

    // Verificar Service Worker
    const checkServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.getRegistration();
          const hasSW = !!(registration && registration.active);
          setHasServiceWorker(hasSW);
          setIsReady(supported && hasSW);
        } catch (error) {
          console.error('Erro ao verificar Service Worker:', error);
          setHasServiceWorker(false);
          setIsReady(false);
        }
      }
    };

    checkServiceWorker();

    // Escutar mudanças no Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', checkServiceWorker);
      return () => {
        navigator.serviceWorker.removeEventListener('controllerchange', checkServiceWorker);
      };
    }
  }, []);

  const requestPermission = async (): Promise<NotificationResult> => {
    if (!isSupported) {
      return {
        success: false,
        message: 'Notificações não são suportadas neste navegador',
      };
    }

    if (permission === 'granted') {
      return {
        success: true,
        message: 'Permissão já concedida',
      };
    }

    if (permission === 'denied') {
      return {
        success: false,
        message: 'Permissão negada. Reative nas configurações do navegador.',
      };
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        return {
          success: true,
          message: 'Permissão concedida com sucesso!',
        };
      } else {
        return {
          success: false,
          message: 'Usuário negou a permissão para notificações',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao solicitar permissão',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  };

  

  const registerServiceWorker = async (): Promise<NotificationResult> => {
    if (!('serviceWorker' in navigator)) {
      return {
        success: false,
        message: 'Service Worker não é suportado neste navegador',
      };
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      // Aguardar que o SW fique ativo
      if (registration.installing) {
        await new Promise((resolve) => {
          const worker = registration.installing;
          worker!.addEventListener('statechange', () => {
            if (worker!.state === 'activated') {
              resolve(undefined);
            }
          });
        });
      }

      setHasServiceWorker(true);
      setIsReady(isSupported && true);

      return {
        success: true,
        message: 'Service Worker registrado e ativo!',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao registrar Service Worker',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  };

  const showNotification = async (
    title: string,
    options?: NotificationOptions
  ): Promise<NotificationResult> => {
    // Verificações iniciais
    if (!isSupported) {
      return {
        success: false,
        message: 'Notificações não são suportadas',
      };
    }

    if (permission !== 'granted') {
      return {
        success: false,
        message: 'Permissão para notificações não foi concedida',
      };
    }

    // Detectar plataforma
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    try {
      // Para mobile, SEMPRE usar Service Worker
      if (isMobile || hasServiceWorker) {
        if (!hasServiceWorker) {
          return {
            success: false,
            message: 'Service Worker necessário para notificações móveis',
          };
        }

        const registration = await navigator.serviceWorker.getRegistration();
        if (!registration || !registration.active) {
          return {
            success: false,
            message: 'Service Worker não está ativo',
          };
        }

        // Configurações otimizadas para mobile
        const notificationOptions: NotificationOptions & { vibrate?: number[] } = {
          body: options?.body || 'Nova notificação',
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-192x192.png',
          tag: `notification-${Date.now()}`,
          requireInteraction: !isMobile, // false para mobile, true para desktop
          silent: false,
          vibrate: isMobile ? [300, 200, 300] : [200, 100, 200],
          data: {
            timestamp: Date.now(),
            platform: isMobile ? 'mobile' : 'desktop',
            ...options?.data
          },
          ...options
        };

        // Usar Service Worker para mostrar a notificação
        await registration.showNotification(title, notificationOptions);

        // Vibração adicional para mobile
        if (isMobile && 'vibrate' in navigator) {
          try {
            navigator.vibrate([300, 200, 300]);
          } catch (vibError) {
            // Ignorar erro de vibração
          }
        }

        return {
          success: true,
          message: 'Notificação enviada via Service Worker!',
        };
      } else {
        // Service Worker é obrigatório para notificações seguras
        return {
          success: false,
          message: 'Service Worker é obrigatório. Registre primeiro.',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao exibir notificação',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  };

  return {
    isSupported,
    permission,
    hasServiceWorker,
    isReady,
    requestPermission,
    registerServiceWorker,
    showNotification,
  };
};
