'use client'
import { useState, useEffect, useCallback } from 'react';
import { useNotifications } from '../hooks/useNotifications';

const MobileNotificationDiagnostic: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  
  // Usar o hook de notificações
  const {
    isSupported,
    permission,
    hasServiceWorker,
    isReady,
    requestPermission,
    registerServiceWorker,
    showNotification,
  } = useNotifications();

  const addResult = (message: string) => {
    // Função mantida para uso futuro quando o componente for reativado
    console.log(`${new Date().toLocaleTimeString()}: ${message}`);
  };

  const runMobileDiagnostic = useCallback(async () => {
    const results = [];
    
    // Detectar plataforma específica
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/i.test(navigator.userAgent);
    
    if (isIOS) {
      results.push('📱 iOS detectado');
    } else if (isAndroid) {
      results.push('🤖 Android detectado');
    }
    
    // Usar dados do hook
    results.push(`🔔 Notification API: ${isSupported ? '✅ Suportada' : '❌ Não suportada'}`);
    results.push(`🔓 Permissão: ${permission === 'granted' ? '✅' : permission === 'denied' ? '❌' : '⚠️'} ${permission}`);
    
    // Verificar contexto seguro (HTTPS)
    const isSecure = window.isSecureContext;
    results.push(`🔒 Contexto seguro: ${isSecure ? '✅ Sim' : '❌ Não'}`);
    
    // Service Worker do hook
    results.push(`⚙️ Service Worker: ${hasServiceWorker ? '✅ Ativo' : '❌ Inativo'}`);
    results.push(`🚀 Pronto para notificações: ${isReady ? '✅ Sim' : '❌ Não'}`);
    
    // Verificações adicionais específicas para mobile
    if (isAndroid) {
      results.push('📱 Android: Chrome Mobile suporta vibração');
      results.push('� Certifique-se que "Sites importantes" não está ativo');
    }
    
    if (isIOS) {
      results.push('📱 iOS: Melhor experiência em Safari');
      results.push('💡 Adicione à tela inicial para funcionalidade completa');
    }
    
    // Status do browser
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    results.push(`📱 Modo PWA: ${isStandalone ? '✅ Sim' : '⚠️ Não'}`);
    
    // Log dos resultados para debug quando necessário
    console.log('Mobile Diagnostic Results:', results);
  }, [isSupported, permission, hasServiceWorker, isReady]);

  useEffect(() => {
    const mobileCheck = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setIsVisible(mobileCheck);
    
    if (mobileCheck) {
      runMobileDiagnostic();
    }
  }, [runMobileDiagnostic]);

  // Atualizar diagnóstico quando houver mudanças
  useEffect(() => {
    if (isVisible) {
      runMobileDiagnostic();
    }
  }, [isVisible, runMobileDiagnostic]);

  const testNotification = async () => {
    addResult('🧪 Iniciando teste de notificação...');
    
    if (!('Notification' in window)) {
      addResult('❌ Notification API não suportada neste dispositivo');
      return;
    }
    
    if (Notification.permission === 'granted') {
      addResult('✅ Permissão já concedida, enviando notificação...');
      
      // Detectar plataforma
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isAndroid = /Android/i.test(navigator.userAgent);
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      
      try {
        // SEMPRE usar Service Worker se disponível (obrigatório para mobile)
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.getRegistration();
          if (registration && registration.active) {
            addResult('🔧 Usando Service Worker para notificação...');
            
            // Configurações otimizadas por plataforma
            const notificationOptions = {
              body: isMobile ? 
                '📱 TESTE MOBILE: Se você vê esta notificação, está funcionando!' :
                '💻 TESTE DESKTOP: Notificação funcionando corretamente!',
              icon: '/icons/icon-192x192.png',
              badge: '/icons/icon-192x192.png',
              tag: `test-${Date.now()}`, // Tag única para evitar conflitos
              timestamp: Date.now(),
              silent: false,
              data: { 
                type: 'diagnostic-test',
                platform: isMobile ? 'mobile' : 'desktop',
                timestamp: Date.now() 
              }
            };

            // Configurações específicas por plataforma
            if (isMobile) {
              Object.assign(notificationOptions, {
                requireInteraction: false, // Melhor para mobile
                renotify: true, // Força nova notificação
                vibrate: isAndroid ? [400, 200, 400, 200, 400] : undefined // Só Android suporta vibração via notificação
              });
              addResult(`📱 Configuração ${isAndroid ? 'Android' : isIOS ? 'iOS' : 'Mobile'} aplicada`);
            } else {
              Object.assign(notificationOptions, {
                requireInteraction: true, // Desktop pode manter
                actions: [
                  { action: 'view', title: '👁️ Visualizar' },
                  { action: 'close', title: '❌ Fechar' }
                ]
              });
              addResult('💻 Configuração Desktop aplicada');
            }
            
            // MÉTODO CORRETO: registration.showNotification
            await registration.showNotification('🧪 TESTE - Frota VSA', notificationOptions);
            
            addResult('✅ Notificação enviada via Service Worker!');
            
            // Vibração manual para dispositivos móveis (mais confiável)
            if (isMobile && 'vibrate' in navigator) {
              try {
                navigator.vibrate([300, 200, 300]);
                addResult('📳 Dispositivo vibrou!');
              } catch (vibError) {
                addResult('⚠️ Vibração não funcionou (normal em alguns dispositivos)');
              }
            }
            
          } else {
            addResult('❌ Service Worker não está ativo!');
            addResult('💡 Clique em "Registrar Service Worker" primeiro.');
            
            // Tentar registrar automaticamente
            try {
              addResult('🔄 Tentando registrar Service Worker automaticamente...');
              await forceRegisterServiceWorker();
              // Tentar novamente após o registro
              setTimeout(() => {
                addResult('🔄 Tentando notificação novamente...');
                testNotification();
              }, 2000);
            } catch (regError) {
              addResult('❌ Falha no registro automático do Service Worker');
            }
            return;
          }
        } else {
          addResult('❌ Service Worker não suportado');
          
          // Não tentar fallback - Service Worker é obrigatório em browsers modernos
          addResult('💡 Service Worker é obrigatório para notificações seguras');
          addResult('🔧 Clique em "Registrar Service Worker" para resolver');
          return;
        }
        
      } catch (error) {
        addResult(`❌ Erro ao criar notificação: ${error instanceof Error ? error.message : String(error)}`);
        addResult('💡 Dicas de troubleshooting:');
        
        if (isMobile) {
          addResult('📱 Mobile: Verifique configurações do Chrome > Sites > Notificações');
          addResult('📱 Mobile: Certifique-se que o site não está em modo "Economizar dados"');
        } else {
          addResult('💻 Desktop: Verifique se notificações não estão bloqueadas no OS');
        }
      }
    } else if (Notification.permission === 'denied') {
      addResult('❌ Permissão NEGADA pelo usuário');
      addResult('💡 Para reativar:');
      addResult('🔧 Chrome Mobile: Configurações > Sites > Notificações');
      addResult('🔧 Chrome Desktop: Ícone do cadeado na barra de endereços');
    } else {
      addResult('⚠️ Solicitando permissão...');
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          addResult('✅ Permissão concedida! Testando em 1 segundo...');
          setTimeout(() => testNotification(), 1000);
        } else {
          addResult('❌ Usuário negou a permissão');
          addResult('💡 Recarregue a página e tente novamente');
        }
      } catch (error) {
        addResult(`❌ Erro ao solicitar permissão: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  };

  const forceRegisterServiceWorker = async () => {
    addResult('🔄 Registrando Service Worker...');
    
    if ('serviceWorker' in navigator) {
      try {
        // Primeiro, verifica se já existe um registration
        const existingRegistration = await navigator.serviceWorker.getRegistration();
        if (existingRegistration) {
          addResult('ℹ️ Service Worker já registrado, atualizando...');
          await existingRegistration.update();
          addResult('🔄 Service Worker atualizado!');
        } else {
          addResult('🆕 Registrando novo Service Worker...');
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/'
          });
          addResult('✅ Service Worker registrado com sucesso!');
          
          // Aguardar que fique ativo
          if (registration.installing) {
            addResult('⏳ Aguardando Service Worker instalar...');
            await new Promise((resolve) => {
              const worker = registration.installing;
              worker!.addEventListener('statechange', () => {
                if (worker!.state === 'activated') {
                  resolve(undefined);
                }
              });
            });
          }
        }
        
        // Verificar se está ativo
        const finalRegistration = await navigator.serviceWorker.getRegistration();
        if (finalRegistration && finalRegistration.active) {
          addResult('✅ Service Worker está ATIVO e pronto para notificações!');
          
          // Auto-teste após registro bem-sucedido
          setTimeout(() => {
            addResult('🎯 Testando notificação automaticamente...');
            testNotification();
          }, 1500);
        } else {
          addResult('⚠️ Service Worker registrado mas ainda não ativo');
          addResult('💡 Aguarde alguns segundos e tente o teste novamente');
        }
        
      } catch (error) {
        addResult(`❌ Erro ao registrar Service Worker: ${error instanceof Error ? error.message : String(error)}`);
        addResult('💡 Verifique se o arquivo /sw.js existe e está acessível');
        
        // Verificar se o sw.js está acessível
        try {
          const response = await fetch('/sw.js');
          if (response.ok) {
            addResult('✅ Arquivo sw.js encontrado');
          } else {
            addResult('❌ Arquivo sw.js não encontrado ou inacessível');
          }
        } catch (fetchError) {
          addResult('❌ Não foi possível verificar o arquivo sw.js');
        }
      }
    } else {
      addResult('❌ Service Worker não suportado neste navegador');
      addResult('💡 Use Chrome, Firefox, Safari ou Edge mais recentes');
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const clearResults = () => {
    // Função mantida para uso futuro quando o componente for reativado
    console.log('Results cleared');
  };

  // Novo teste usando o hook otimizado
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const quickTest = async () => {
    addResult('⚡ TESTE RÁPIDO iniciado...');
    
    // Detectar plataforma
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    addResult(`📱 Plataforma: ${isAndroid ? 'Android' : isIOS ? 'iOS' : isMobile ? 'Mobile' : 'Desktop'}`);

    // 1. Verificar permissão
    if (permission !== 'granted') {
      addResult('🔓 Solicitando permissão...');
      const permResult = await requestPermission();
      addResult(`${permResult.success ? '✅' : '❌'} ${permResult.message}`);
      if (!permResult.success) {
        addResult('💡 DICA: Recarregue a página se a permissão foi negada por engano');
        return;
      }
    } else {
      addResult('✅ Permissão já concedida');
    }

    // 2. Verificar Service Worker
    if (!hasServiceWorker) {
      addResult('🔧 Registrando Service Worker...');
      const swResult = await registerServiceWorker();
      addResult(`${swResult.success ? '✅' : '❌'} ${swResult.message}`);
      if (!swResult.success) {
        addResult('💡 DICA: Verifique se o arquivo sw.js existe em /public/');
        return;
      }
      // Aguardar um pouco após o registro
      await new Promise(resolve => setTimeout(resolve, 500));
    } else {
      addResult('✅ Service Worker já ativo');
    }

    // 3. Enviar notificação teste
    addResult('📢 Enviando notificação de teste...');
    
    const notifResult = await showNotification('🧪 TESTE VISA', {
      body: isMobile ? 
        '📱 SUCESSO! Esta notificação apareceu no seu dispositivo móvel!' :
        '💻 SUCESSO! Notificação desktop funcionando!',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      tag: 'quick-test-' + Date.now(),
      requireInteraction: false, // Para mobile
      data: {
        test: true,
        platform: isMobile ? 'mobile' : 'desktop',
        timestamp: Date.now()
      }
    });

    addResult(`${notifResult.success ? '✅' : '❌'} ${notifResult.message}`);
    
    if (notifResult.success) {
      addResult('🎉 SUCESSO TOTAL! A notificação deve ter aparecido!');
      if (isMobile) {
        addResult('📳 Seu dispositivo deve ter vibrado também');
        addResult('👀 Verifique a área de notificações do seu celular');
      } else {
        addResult('🔔 Verifique o canto da tela ou área de notificações');
      }
      
      // Adicionar vibração manual se suportado
      if (isMobile && 'vibrate' in navigator) {
        try {
          navigator.vibrate([400, 200, 400, 200, 400]);
          addResult('📳 Vibração ativada!');
        } catch (vibError) {
          addResult('⚠️ Vibração não funcionou (normal em alguns dispositivos)');
        }
      }
    } else if (notifResult.error) {
      addResult(`❌ Erro técnico: ${notifResult.error}`);
      addResult('🔧 Dicas de solução:');
      if (isMobile) {
        addResult('📱 1. Verifique configurações do Chrome > Sites > Notificações');
        addResult('📱 2. Certifique-se que o modo "Economizar dados" está desabilitado');
        addResult('📱 3. Tente adicionar o site à tela inicial (PWA)');
      } else {
        addResult('💻 1. Verifique se as notificações do browser não estão bloqueadas');
        addResult('💻 2. Verifique configurações do sistema operacional');
      }
    }
  };

  if (!isVisible) return null;

  return (<></>
    // <div className="fixed bottom-4 right-4 z-50 bg-red-600 text-white p-4 rounded-lg shadow-lg max-w-sm">
    //   <div className="mb-4">
    //     <h3 className="text-lg font-bold mb-2">🚨 DIAGNÓSTICO MOBILE</h3>
    //     <div className="text-sm space-y-1 max-h-32 overflow-y-auto">
    //       {diagnosticResults.map((result, index) => (
    //         <div key={index} className="text-xs">{result}</div>
    //       ))}
    //     </div>
    //   </div>
      
    //   <div className="space-y-2">
    //     <button
    //       onClick={quickTest}
    //       className="w-full bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded text-sm font-bold"
    //       disabled={!isSupported}
    //     >
    //       ⚡ TESTE RÁPIDO (Recomendado)
    //     </button>
        
    //     <button
    //       onClick={testNotification}
    //       className="w-full bg-yellow-500 hover:bg-yellow-600 text-black px-3 py-2 rounded text-sm font-bold"
    //     >
    //       🧪 TESTE MANUAL
    //     </button>
        
    //     <button
    //       onClick={forceRegisterServiceWorker}
    //       className="w-full bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm"
    //       disabled={!('serviceWorker' in navigator)}
    //     >
    //       🔧 Registrar Service Worker
    //     </button>
        
    //     <div className="flex space-x-2">
    //       <button
    //         onClick={runMobileDiagnostic}
    //         className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded text-xs"
    //       >
    //         🔍 Diagnóstico
    //       </button>
    //       <button
    //         onClick={clearResults}
    //         className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded text-xs"
    //       >
    //         🗑️ Limpar
    //       </button>
    //     </div>
    //   </div>
      
    //   <div className="mt-3 text-xs text-yellow-200">
    //     🚨 <strong>TESTE IMEDIATO</strong> (deve aparecer AGORA!)
    //     <br />
    //     {/Android/i.test(navigator.userAgent) && (
    //       <>🤖 <strong>Android</strong>: Verifique se as notificações estão habilitadas nas configurações do Chrome.</>
    //     )}
    //     {/iPad|iPhone|iPod/.test(navigator.userAgent) && (
    //       <>📱 <strong>iOS</strong>: Adicione à tela inicial primeiro (PWA) ou use Safari.</>
    //     )}
    //     <br />
    //     💡 <strong>Solução de Problemas:</strong>
    //     <br />
    //     • Se erro &quot;Illegal constructor&quot;: Service Worker não ativo
    //     <br />
    //     • Clique &quot;Registrar Service Worker&quot; primeiro
    //     <br />
    //     • Mobile: Use sempre Service Worker (obrigatório)
    //     <br />
    //     • Desktop: Funciona com ou sem Service Worker
    //   </div>
    // </div>
  );
};

export default MobileNotificationDiagnostic;