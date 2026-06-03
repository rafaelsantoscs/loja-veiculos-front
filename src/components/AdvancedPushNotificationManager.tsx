// components/AdvancedPushNotificationManager.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axiosInstance from '@/services/axiosInstance';
import { getUserLocalStorage } from '@/store/userLocalStorage';
import { useNotifications } from '@/hooks/useNotifications';
import { usePushNotifications } from '@/hooks/usePushNotifications';

interface UserState {
  id?: string | null;
  nomeCompleto?: string;
  username?: string;
  roles?: string[];
  cpf?: string;
  telefone?: string;
  email?: string;
  token?: string;
  imagemUrl?: string;
}

interface User {
  id: number;
  nome: string;
  username: string;
  cpf: string;
  email: string;
  roles: string[];
}

interface PushNotificationForm {
  targetType: 'user' | 'users' | 'role' | 'all';
  title: string;
  message: string;
  selectedUsers: number[];
  selectedRoles: string[];
  icon?: string;
  url?: string;
  tag?: string;
}

interface AvailableRole {
  name: string;
  userCount: number;
}

const AdvancedPushNotificationManager: React.FC = () => {
  const [user, setUser] = useState<UserState | null>(null);
  const [form, setForm] = useState<PushNotificationForm>({
    targetType: 'all',
    title: '',
    message: '',
    selectedUsers: [],
    selectedRoles: [],
    icon: '/icons/icon-192x192.png',
    url: '',
    tag: `notification-${Date.now()}`
  });

  const [users, setUsers] = useState<User[]>([]);
  const [availableRoles, setAvailableRoles] = useState<AvailableRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  
  // Hook para notificações locais
  const {
    showNotification,
    requestPermission,
    registerServiceWorker,
    hasServiceWorker,
    isReady: isNotificationReady
  } = useNotifications();

  // Hook para push notifications reais (via servidor)
  const {
    subscribe: subscribeToPush,
    subscription: pushSubscription
  } = usePushNotifications();

  // Verificar suporte e permissões
  useEffect(() => {
    const userData = getUserLocalStorage();
    if (userData?.token) {
      setUser(userData);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const supported = 'serviceWorker' in navigator && 
                       'PushManager' in window && 
                       'Notification' in window;
      
      const isHTTPS = location.protocol === 'https:';
      const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
      
      // Relaxar validação para mobile - mostrar sempre mas com avisos
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      console.log('🔍 Validação de suporte:', {
        supported,
        isHTTPS,
        isLocalhost,
        isMobile,
        protocol: location.protocol,
        hostname: location.hostname,
        userAgent: navigator.userAgent.substring(0, 50) + '...'
      });
      
      // Se for mobile, sempre permitir (mas mostrar avisos se necessário)
      setIsSupported(isMobile || (supported && (isHTTPS || isLocalhost)));
      
      if (typeof Notification !== 'undefined') {
        setPermission(Notification.permission);
      }
    }
  }, []);

  // Carregar usuários
  useEffect(() => {
    const fetchUsers = async () => {
      if (!user?.token) return;
      
      try {
        const response = await axiosInstance.get('/usuarios/listar-todos', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setUsers(response.data);
        
        // Processar roles disponíveis
        const roleMap = new Map<string, number>();
        response.data.forEach((u: User) => {
          u.roles?.forEach(role => {
            roleMap.set(role, (roleMap.get(role) || 0) + 1);
          });
        });
        
        const roles = Array.from(roleMap.entries()).map(([name, userCount]) => ({
          name,
          userCount
        }));
        
        setAvailableRoles(roles);
      } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        toast.error('Erro ao carregar usuários');
      }
    };

    fetchUsers();
  }, [user?.token]);

  const handleInputChange = (field: keyof PushNotificationForm, value: string | number[] | string[]) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleUserSelection = (userId: number) => {
    setForm(prev => ({
      ...prev,
      selectedUsers: prev.selectedUsers.includes(userId)
        ? prev.selectedUsers.filter(id => id !== userId)
        : [...prev.selectedUsers, userId]
    }));
  };

  const handleRoleSelection = (roleName: string) => {
    setForm(prev => ({
      ...prev,
      selectedRoles: prev.selectedRoles.includes(roleName)
        ? prev.selectedRoles.filter(role => role !== roleName)
        : [...prev.selectedRoles, roleName]
    }));
  };

  const sendPushNotification = async () => {
    if (!form.title || !form.message) {
      toast.error('Título e mensagem são obrigatórios');
      return;
    }

    if (form.targetType === 'user' && form.selectedUsers.length === 0) {
      toast.error('Selecione pelo menos um usuário');
      return;
    }

    if (form.targetType === 'users' && form.selectedUsers.length === 0) {
      toast.error('Selecione pelo menos um usuário');
      return;
    }

    if (form.targetType === 'role' && form.selectedRoles.length === 0) {
      toast.error('Selecione pelo menos uma role');
      return;
    }

    setLoading(true);
    
    try {
      const notificationData = {
        title: form.title,
        message: form.message,
        targetType: form.targetType,
        selectedUsers: form.selectedUsers,
        selectedRoles: form.selectedRoles,
        icon: form.icon,
        url: form.url,
        tag: form.tag
      };

      await axiosInstance.post('/api/push-subscriptions/send-targeted', notificationData, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });

      toast.success('Notificação enviada com sucesso!');
      
      // Reset form
      setForm({
        targetType: 'all',
        title: '',
        message: '',
        selectedUsers: [],
        selectedRoles: [],
        icon: '/icons/icon-192x192.png',
        url: '',
        tag: `notification-${Date.now()}`
      });

    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
      toast.error('Erro ao enviar notificação');
    } finally {
      setLoading(false);
    }
  };

  // Função para teste local da notificação
  const sendLocalTestNotification = async () => {
    if (!form.title || !form.message) {
      toast.error('Título e mensagem são obrigatórios para o teste');
      return;
    }

    try {
      // Garantir permissão
      const permResult = await requestPermission();
      if (!permResult.success) {
        toast.error('Permissão negada para notificações');
        return;
      }

      // Garantir Service Worker
      if (!hasServiceWorker) {
        toast.info('Registrando Service Worker...');
        const swResult = await registerServiceWorker();
        if (!swResult.success) {
          toast.error('Erro ao registrar Service Worker');
          return;
        }
      }

      // Detectar plataforma
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

      // Enviar notificação local de teste
      const result = await showNotification(form.title, {
        body: form.message,
        icon: form.icon || '/icons/icon-192x192.png',
        badge: form.icon || '/icons/icon-192x192.png',
        tag: form.tag || `test-${Date.now()}`,
        requireInteraction: !isMobile,
        data: {
          type: 'local-test',
          platform: isMobile ? 'mobile' : 'desktop',
          timestamp: Date.now(),
          url: form.url
        }
      });

      if (result.success) {
        toast.success('🎉 Teste local enviado! Verifique a notificação.');
        
        // Vibrar se for mobile
        if (isMobile && 'vibrate' in navigator) {
          navigator.vibrate([300, 200, 300]);
        }
      } else {
        toast.error(`Erro no teste local: ${result.message}`);
      }
    } catch (error) {
      console.error('Erro no teste local:', error);
      toast.error('Erro ao enviar teste local');
    }
  };

  // Função para registrar este dispositivo para receber push notifications
  const registerThisDevice = async () => {
    try {
      toast.info('Registrando este dispositivo...');
      
      const subscription = await subscribeToPush();
      if (subscription) {
        toast.success('🎉 Dispositivo registrado com sucesso! Agora você pode receber notificações via servidor.');
      } else {
        toast.error('Erro ao registrar dispositivo');
      }
    } catch (error) {
      console.error('Erro ao registrar dispositivo:', error);
      toast.error('Erro ao registrar dispositivo');
    }
  };

  if (!isSupported) {
    const isMobile = typeof window !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
            {isMobile ? '📱 CONFIGURAÇÃO MOBILE NECESSÁRIA' : '⚠️ PUSH NOTIFICATIONS REQUEREM HTTPS OU LOCALHOST'}
          </h3>
          <p className="mt-1 text-sm text-red-700 dark:text-red-300 mb-3">
            Seu ambiente atual: <strong>{typeof window !== 'undefined' ? location.protocol + '//' + location.hostname : 'N/A'}</strong>
          </p>
          
          {isMobile ? (
            <div className="text-sm text-red-600 dark:text-red-400">
              <p><strong>📱 Para funcionar no mobile:</strong></p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Acesse via <strong>https://</strong> (não http://)</li>
                <li>Permita notificações quando solicitado</li>
                <li>No iOS: Adicione à tela inicial primeiro</li>
                <li>No Android: Ative notificações no Chrome</li>
              </ul>
            </div>
          ) : (
            <div className="text-sm text-red-600 dark:text-red-400">
              <p><strong>✅ Para funcionar você precisa:</strong></p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Acessar via <strong>https://</strong></li>
                <li>Ou acessar via <strong>localhost</strong></li>
                <li>Service Worker suportado</li>
                <li>PushManager disponível</li>
                <li>Notificações suportadas</li>
              </ul>
            </div>
          )}
          
          {/* Botão de teste mesmo sem suporte total */}
          <button 
            onClick={() => {
              const message = isMobile 
                ? 'Mobile detectado!\n\nPara push notifications funcionarem:\n1. Acesse via HTTPS\n2. Permita notificações\n3. iOS: Adicione à tela inicial primeiro'
                : 'Push notifications não funcionam neste ambiente!\n\nNecessário HTTPS ou localhost.';
              alert(message);
            }}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            {isMobile ? '📱 Tentar Registrar Mesmo Assim' : '🚨 Botão de Teste (Não Funcionará)'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          📡 Sistema Avançado de Push Notifications
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          Envie notificações específicas por usuário, múltiplos usuários, roles ou para todos
        </p>
        
        {/* Status do sistema de notificações */}
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center">
            {hasServiceWorker ? (
              <span className="text-green-600 dark:text-green-400">✅ Service Worker Ativo</span>
            ) : (
              <span className="text-yellow-600 dark:text-yellow-400">⚠️ Service Worker Inativo</span>
            )}
          </div>
          <div className="flex items-center">
            {isNotificationReady ? (
              <span className="text-green-600 dark:text-green-400">🔔 Notificações Locais Prontas</span>
            ) : (
              <span className="text-gray-500 dark:text-gray-400">⏳ Configurando Locais...</span>
            )}
          </div>
          <div className="flex items-center">
            {pushSubscription ? (
              <span className="text-green-600 dark:text-green-400">📡 Dispositivo Registrado</span>
            ) : (
              <span className="text-red-600 dark:text-red-400">❌ Dispositivo NÃO Registrado</span>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Tipo de alvo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            🎯 Destinatário
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { value: 'user', label: '👤 Usuário Específico', desc: 'Um usuário' },
              { value: 'users', label: '👥 Múltiplos Usuários', desc: 'Vários usuários' },
              { value: 'role', label: '🏷️ Por Role', desc: 'Usuários com role específica' },
              { value: 'all', label: '📢 Todos', desc: 'Todos os usuários' }
            ].map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleInputChange('targetType', option.value)}
                className={`p-3 text-left border rounded-lg transition-all ${
                  form.targetType === option.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                <div className="text-sm font-medium">{option.label}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{option.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Seleção de usuários específicos */}
        {(form.targetType === 'user' || form.targetType === 'users') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              👤 Selecionar Usuários
            </label>
            <div className="max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg">
              {users.map(userItem => (
                <label key={userItem.id} className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-600 last:border-b-0">
                  <input
                    type="checkbox"
                    checked={form.selectedUsers.includes(userItem.id)}
                    onChange={() => handleUserSelection(userItem.id)}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 dark:border-gray-600"
                  />
                  <div className="ml-3 flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {userItem.nome}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      @{userItem.username} • {userItem.roles?.join(', ') || 'Sem roles'}
                    </div>
                  </div>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {form.selectedUsers.length} usuário(s) selecionado(s)
            </p>
          </div>
        )}

        {/* Seleção de roles */}
        {form.targetType === 'role' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              🏷️ Selecionar Roles
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availableRoles.map(role => (
                <label key={role.name} className="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.selectedRoles.includes(role.name)}
                    onChange={() => handleRoleSelection(role.name)}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 dark:border-gray-600"
                  />
                  <div className="ml-3 flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {role.name.replace('ROLE_', '').replace('_', ' ')}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {role.userCount} usuário(s)
                    </div>
                  </div>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {form.selectedRoles.length} role(s) selecionada(s)
            </p>
          </div>
        )}

        {/* Conteúdo da notificação */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              📝 Título *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Ex: Nova atualização do sistema"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              🏷️ Tag (Identificador)
            </label>
            <input
              type="text"
              value={form.tag}
              onChange={(e) => handleInputChange('tag', e.target.value)}
              placeholder="Ex: update-2024-01"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            💬 Mensagem *
          </label>
          <textarea
            value={form.message}
            onChange={(e) => handleInputChange('message', e.target.value)}
            placeholder="Digite a mensagem da notificação..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              🎨 Ícone (URL)
            </label>
            <input
              type="text"
              value={form.icon}
              onChange={(e) => handleInputChange('icon', e.target.value)}
              placeholder="/icons/icon-192x192.png"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              🔗 URL (Opcional)
            </label>
            <input
              type="url"
              value={form.url}
              onChange={(e) => handleInputChange('url', e.target.value)}
              placeholder="https://frotavsa.iamtec.org/dashboard"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        {/* Preview */}
        {form.title && form.message && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              👁️ Preview da Notificação
            </h4>
            <div className="flex items-start space-x-3 p-3 bg-white dark:bg-gray-600 rounded-lg shadow-sm">
              <img src={form.icon} alt="Icon" className="w-8 h-8 rounded" />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {form.title}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {form.message}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Destinatário: {
                    form.targetType === 'all' ? 'Todos os usuários' :
                    form.targetType === 'user' ? `${form.selectedUsers.length} usuário` :
                    form.targetType === 'users' ? `${form.selectedUsers.length} usuários` :
                    `Usuários com roles: ${form.selectedRoles.join(', ')}`
                  }
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Botões de ação */}
        <div className="space-y-3">
          {/* Status e Botão para registrar/re-registrar dispositivo */}
          <div className="space-y-2">
            {pushSubscription ? (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                <p className="text-sm text-green-700 dark:text-green-300">
                  <strong>✅ Dispositivo registrado!</strong> Agora você pode receber notificações via servidor.
                </p>
              </div>
            ) : (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  <strong>⚠️ Dispositivo não registrado!</strong> Registre para receber notificações de outros usuários.
                </p>
              </div>
            )}
            
            <button
              onClick={registerThisDevice}
              className={`w-full flex items-center justify-center px-6 py-3 font-medium rounded-lg transition-colors ${
                pushSubscription 
                  ? 'bg-purple-500 hover:bg-purple-600 text-white' 
                  : 'bg-purple-600 hover:bg-purple-700 text-white animate-pulse'
              }`}
            >
              {pushSubscription 
                ? '🔄 Re-registrar Este Dispositivo' 
                : '📡 Registrar Este Dispositivo (OBRIGATÓRIO)'
              }
            </button>
          </div>

          {/* Botão de teste local */}
          <button
            onClick={sendLocalTestNotification}
            disabled={!form.title || !form.message}
            className="w-full flex items-center justify-center px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            🧪 Teste Local (Aparecer Agora no Seu Dispositivo)
          </button>

          {/* Botão de envio via servidor */}
          <button
            onClick={sendPushNotification}
            disabled={loading || !form.title || !form.message || permission !== 'granted'}
            className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            {loading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enviando...
              </div>
            ) : (
              <>
                🚀 Enviar Push Notification (Via Servidor para Outros Usuários)
              </>
            )}
          </button>
        </div>

        {permission !== 'granted' && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              <strong>⚠️ Permissão necessária:</strong> Ative as notificações no navegador para enviar push notifications.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedPushNotificationManager;
