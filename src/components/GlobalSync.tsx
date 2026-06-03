// src/components/GlobalSync.tsx

'use client';

import { useEffect } from 'react';
import axiosInstance from '@/services/axiosInstance';
import { getUserLocalStorage } from '@/store/userLocalStorage';

let isGlobalSyncRunning = false;
let globalSyncInterval: NodeJS.Timeout | null = null;
let hasInitialized = false;

interface AbastecimentoOffline {
  status?: string;
  id?: string;
  veiculo?: {
    placa?: string;
    modelo?: string;
    motorista?: string;
    lotacao?: string;
  };
  dadosAbastecimento?: {
    kmAtual?: string;
    tipoCombustivel?: string;
    litros?: string;
    valor?: string;
    observacoes?: string;
  };
  combustivel?: string;
  litros?: number;
  kmAtual?: number;
  valor?: number;
  posto?: string;
  observacoes?: string;
  data?: string;
  hora?: string;
  dataHora?: string;
}

const GlobalSync: React.FC = () => {
  
  // Função principal de sincronização global
  const sincronizarGlobal = async (silencioso = true): Promise<boolean> => {
    if (isGlobalSyncRunning) {
      console.log('🔄 [GLOBAL SYNC] Sincronização já em andamento...');
      return false;
    }

    if (!navigator.onLine) {
      console.log('📵 [GLOBAL SYNC] Sem conexão - sincronização cancelada');
      return false;
    }

    isGlobalSyncRunning = true;

    try {
      const user = getUserLocalStorage();
      if (!user?.token) {
        console.error('❌ [GLOBAL SYNC] Token do usuário não encontrado');
        return false;
      }

      const abastecimentosOfflineSalvos = JSON.parse(
        localStorage.getItem('abastecimentos_offline') || '[]'
      ) as AbastecimentoOffline[];

      const registrosPendentes = abastecimentosOfflineSalvos.filter(
        (item: AbastecimentoOffline) => item.status === 'pendente_sincronizacao'
      );

      if (registrosPendentes.length === 0) {
        console.log('✅ [GLOBAL SYNC] Nenhum registro pendente para sincronizar');
        return true;
      }

      console.log(`🔄 [GLOBAL SYNC] Sincronizando ${registrosPendentes.length} registros pendentes...`);

      let registrosSincronizados = 0;
      const idsParaRemover: string[] = [];

      for (const registro of registrosPendentes) {
        try {
          // Validações de segurança
          if (!registro.veiculo?.placa || !registro.dadosAbastecimento) {
            console.error('❌ [GLOBAL SYNC] Registro inválido - dados obrigatórios faltando:', registro.id);
            continue;
          }

          const payload = {
            placa: registro.veiculo.placa,
            modelo: registro.veiculo.modelo || '',
            data: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
            hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            km: parseFloat(registro.dadosAbastecimento.kmAtual || '0'),
            combustivel: registro.dadosAbastecimento.tipoCombustivel || '',
            litros: parseFloat(registro.dadosAbastecimento.litros || '0'),
            valor: parseFloat(registro.dadosAbastecimento.valor || '0'),
            observacoes: registro.dadosAbastecimento.observacoes || '',
            motorista: registro.veiculo.motorista || '',
            cpfMotorista: user.cpf,
            acessadoPor: "ROLE_MOTORISTA",
            lotacao: registro.veiculo.lotacao || ''
          };

          console.log('📤 [GLOBAL SYNC] Enviando registro para API:', payload);

          const response = await axiosInstance.post('/abastecimento-veiculos', payload, {
            headers: {
              Authorization: `Bearer ${user.token}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.status === 201) {
            console.log('✅ [GLOBAL SYNC] Registro sincronizado com sucesso:', registro.id);
            registrosSincronizados++;
            if (registro.id) {
              idsParaRemover.push(registro.id);
            }
          } else {
            console.error('❌ [GLOBAL SYNC] Erro ao sincronizar registro:', registro.id, response.status);
          }
        } catch (error) {
          console.error('❌ [GLOBAL SYNC] Erro ao sincronizar registro individual:', registro.id, error);
        }
      }

        // Remover registros sincronizados
        if (idsParaRemover.length > 0) {
          const registrosRestantes = (abastecimentosOfflineSalvos as AbastecimentoOffline[]).filter(
            (registro: AbastecimentoOffline) => !idsParaRemover.includes(registro.id || '')
          );        localStorage.setItem('abastecimentos_offline', JSON.stringify(registrosRestantes));
        console.log(`🗑️ [GLOBAL SYNC] ${idsParaRemover.length} registro(s) removido(s) da lista de pendências`);
      }

      // Mostrar notificação se registros foram sincronizados
      if (registrosSincronizados > 0) {
        console.log(`✅ [GLOBAL SYNC] ${registrosSincronizados} registros sincronizados com sucesso!`);
        
        // Mostrar notificação no navegador se permitido
        if (!silencioso && 'Notification' in window && Notification.permission === 'granted') {
          try {
            // Usar Service Worker se disponível (método seguro)
            if ('serviceWorker' in navigator) {
              const registration = await navigator.serviceWorker.getRegistration();
              if (registration && registration.active) {
                await registration.showNotification('Sincronização Automática', {
                  body: `${registrosSincronizados} abastecimento(s) sincronizado(s) automaticamente!`,
                  icon: '/favicon.ico',
                  tag: 'sync-notification' // Para evitar múltiplas notificações
                });
              }
            }
          } catch (error) {
            console.warn('Erro ao mostrar notificação de sincronização:', error);
          }
        }
      }

      return registrosSincronizados > 0;

    } catch (error) {
      console.error('❌ [GLOBAL SYNC] Erro durante sincronização:', error);
      return false;
    } finally {
      isGlobalSyncRunning = false;
    }
  };

  // Verificar se há registros pendentes
  const hasPendingRecords = (): boolean => {
    try {
      const abastecimentosOfflineSalvos = JSON.parse(
        localStorage.getItem('abastecimentos_offline') || '[]'
      ) as AbastecimentoOffline[];

      const registrosPendentes = abastecimentosOfflineSalvos.filter(
        (item: AbastecimentoOffline) => item.status === 'pendente_sincronizacao'
      );

      return registrosPendentes.length > 0;
    } catch (error) {
      console.error('❌ [GLOBAL SYNC] Erro ao verificar registros pendentes:', error);
      return false;
    }
  };

  // Inicializar sincronização automática global
  useEffect(() => {
    if (hasInitialized) {
      console.log('🔄 [GLOBAL SYNC] Componente já foi inicializado');
      return;
    }

    hasInitialized = true;
    console.log('🚀 [GLOBAL SYNC] Iniciando sincronização automática global...');

    // Solicitar permissão para notificações
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then((permission) => {
        console.log('🔔 [GLOBAL SYNC] Permissão de notificação:', permission);
      });
    }

    // Sincronizar imediatamente se online e há registros pendentes
    if (navigator.onLine && hasPendingRecords()) {
      setTimeout(() => {
        console.log('🔄 [GLOBAL SYNC] Sincronização inicial...');
        sincronizarGlobal(false); // Não silencioso na primeira vez
      }, 3000);
    }

    // Configurar eventos de conexão
    const handleOnline = () => {
      console.log('🌐 [GLOBAL SYNC] Conexão restaurada - sincronizando automaticamente...');
      setTimeout(() => sincronizarGlobal(false), 3000); // Não silencioso ao restaurar conexão
    };

    const handleOffline = () => {
      console.log('📵 [GLOBAL SYNC] Conexão perdida');
    };

    const handleVisibilityChange = () => {
      // Sincronizar quando a aba volta a ficar visível
      if (document.visibilityState === 'visible' && navigator.onLine && hasPendingRecords()) {
        console.log('👁️ [GLOBAL SYNC] Aba voltou a ficar visível - verificando sincronização...');
        setTimeout(() => sincronizarGlobal(true), 2000);
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Configurar verificação periódica (a cada 5 minutos quando online)
    globalSyncInterval = setInterval(() => {
      if (navigator.onLine && hasPendingRecords()) {
        console.log('⏰ [GLOBAL SYNC] Verificação periódica - sincronizando registros pendentes...');
        sincronizarGlobal(true); // Silencioso nas verificações periódicas
      }
    }, 300000); // 5 minutos

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      if (globalSyncInterval) {
        clearInterval(globalSyncInterval);
        globalSyncInterval = null;
      }
      
      hasInitialized = false;
      console.log('🛑 [GLOBAL SYNC] Sincronização automática parada');
    };
  }, []);

  // Este componente não renderiza nada visível
  return null;
};

export default GlobalSync;
