/**
 * Exemplo de uso das notificações no app
 * 
 * Este arquivo mostra como integrar as notificações
 * em outros componentes da aplicação.
 */

import { useNotifications } from '../hooks/useNotifications';

// Exemplo 1: Componente simples
export function NotificationButton() {
  const { showNotification, requestPermission, isReady } = useNotifications();

  const sendNotification = async () => {
    // Sempre solicitar permissão primeiro
    const permResult = await requestPermission();
    if (!permResult.success) {
      alert('Permissão negada para notificações');
      return;
    }

    // Enviar notificação
    const result = await showNotification('Nova Mensagem!', {
      body: 'Você tem uma nova mensagem no sistema',
      tag: 'new-message'
    });

    if (!result.success) {
      console.error('Erro ao enviar notificação:', result.error);
    }
  };

  return (
    <button 
      onClick={sendNotification}
      disabled={!isReady}
      className="bg-blue-500 text-white px-4 py-2 rounded"
    >
      📢 Enviar Notificação
    </button>
  );
}

// Exemplo 2: Notificação de abastecimento
export function AbastecimentoNotification() {
  const { showNotification, isReady } = useNotifications();

  const notificarAbastecimento = async (veiculo: string, valor: number) => {
    if (!isReady) {
      console.warn('Sistema de notificações não está pronto');
      return;
    }

    await showNotification('Abastecimento Registrado!', {
      body: `Veículo ${veiculo} - R$ ${valor.toFixed(2)}`,
      icon: '/icons/icon-192x192.png',
      tag: 'abastecimento-' + Date.now(),
      data: {
        type: 'abastecimento',
        veiculo,
        valor
      }
    });
  };

  return { notificarAbastecimento };
}

// Exemplo 3: Hook para notificações automáticas
export function useAutoNotifications() {
  const { showNotification, isReady } = useNotifications();

  const notifyOfflineSync = async () => {
    if (!isReady) return;
    
    await showNotification('Dados Sincronizados!', {
      body: 'Os dados offline foram sincronizados com sucesso',
      tag: 'sync-complete'
    });
  };

  const notifyLowFuel = async (veiculo: string) => {
    if (!isReady) return;
    
    await showNotification('⚠️ Combustível Baixo', {
      body: `Veículo ${veiculo} precisa abastecer`,
      tag: 'low-fuel-' + veiculo,
      requireInteraction: true
    });
  };

  return {
    notifyOfflineSync,
    notifyLowFuel
  };
}

// Exemplo 4: Hook para integração com Service Worker (para push notifications)
export function usePushNotifications() {
  const { registerServiceWorker } = useNotifications();

  const subscribeToPush = async () => {
    // 1. Garantir que o Service Worker está registrado
    const swResult = await registerServiceWorker();
    if (!swResult.success) {
      throw new Error('Não foi possível registrar o Service Worker');
    }

    // 2. Obter o registration
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      throw new Error('Service Worker não encontrado');
    }

    // 3. Se necessário, subscribe para push notifications
    // (implementar conforme sua infraestrutura de push)
    
    return registration;
  };

  return { subscribeToPush };
}

// Exemplo de uso em um componente React
/*
export function MeuComponente() {
  const notifications = useNotifications();
  const { notifyOfflineSync } = useAutoNotifications();

  useEffect(() => {
    // Configurar notificações quando o componente montar
    if (notifications.permission !== 'granted') {
      notifications.requestPermission();
    }
  }, []);

  const handleAcaoImportante = async () => {
    // Fazer algo importante...
    
    // Notificar o usuário
    await notifications.showNotification('Ação Concluída!', {
      body: 'Sua ação foi processada com sucesso'
    });
  };

  return (
    <div>
      <button onClick={handleAcaoImportante}>
        Executar Ação
      </button>
      
      <p>Status: {notifications.isReady ? 'Pronto' : 'Configurando...'}</p>
    </div>
  );
}
*/
