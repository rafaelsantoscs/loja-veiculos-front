// public/sw.js

const CACHE_NAME = 'abastecimento-vitoria-v1';
const CACHE_URLS = [
  '/abastecimento-offline',
  '/offline',
  '/favicon.ico',
  '/manifest.json',
  // CSS e JS serão cacheados dinamicamente
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[ServiceWorker] Caching app shell');
        return cache.addAll(CACHE_URLS);
      })
      .catch((error) => {
        console.error('[ServiceWorker] Cache install error:', error);
      })
  );
  // Força o Service Worker a se tornar ativo imediatamente
  self.skipWaiting();
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Força o Service Worker a controlar todas as páginas
      return self.clients.claim();
    })
  );
});

// Interceptação de requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignora requests de extensões do browser e non-http
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Ignora requests de APIs (deixa para serem tratados offline pelo app)
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // Estratégia: Network First com Cache Fallback
  if (url.pathname === '/abastecimento-offline') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Se conseguiu buscar online, salva no cache
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseToCache);
              });
          }
          return response;
        })
        .catch(() => {
          // Se falhou, busca do cache
          return caches.match(request)
            .then((response) => {
              if (response) {
                return response;
              }
              // Se não tem no cache, retorna página offline básica
              return new Response(
                generateOfflinePage(),
                {
                  status: 200,
                  statusText: 'OK',
                  headers: { 'Content-Type': 'text/html' }
                }
              );
            });
        })
    );
    return;
  }

  // Para outros recursos (CSS, JS, imagens), usa Cache First
  event.respondWith(
    caches.match(request)
      .then((response) => {
        if (response) {
          return response;
        }
        
        return fetch(request)
          .then((response) => {
            // Cacheia apenas responses válidas
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseToCache);
              });

            return response;
          });
      })
  );
});

// Geração de página offline básica
function generateOfflinePage() {
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Abastecimento Offline - Vitória</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .container {
          background: white;
          padding: 2rem;
          border-radius: 10px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          text-align: center;
          max-width: 400px;
          width: 100%;
        }
        .icon { font-size: 3rem; margin-bottom: 1rem; }
        h1 { color: #333; margin-bottom: 1rem; }
        p { color: #666; margin-bottom: 1.5rem; }
        .offline-badge {
          background: #f59e0b;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.9rem;
          margin-bottom: 1rem;
          display: inline-block;
        }
        .retry-btn {
          background: #ea580c;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 1rem;
        }
        .retry-btn:hover { background: #dc2626; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="icon">⛽</div>
        <div class="offline-badge">MODO OFFLINE</div>
        <h1>Abastecimento Vitória</h1>
        <p>Sistema funcionando offline. Os registros serão sincronizados quando a conexão for reestabelecida.</p>
        <button class="retry-btn" onclick="window.location.reload()">
          🔄 Tentar Novamente
        </button>
        <div style="margin-top: 1rem; font-size: 0.8rem; color: #888;">
          Prefeitura Municipal de Vitória
        </div>
      </div>
    </body>
    </html>
  `;
}

// Event listener para notificações push
self.addEventListener('push', (event) => {
  console.log('🔥 [ServiceWorker] Push message received:', event);
  console.log('📱 User Agent:', self.navigator.userAgent);
  
  // Detectar se é mobile
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(self.navigator.userAgent);
  console.log('📱 É dispositivo móvel:', isMobile);

  let notificationData = {};
  
  if (event.data) {
    try {
      notificationData = event.data.json();
      console.log('📋 Dados da notificação recebidos:', notificationData);
    } catch (e) {
      console.warn('⚠️ Erro ao fazer parse dos dados, usando texto simples:', e);
      notificationData = {
        title: 'Nova Notificação - Frota VSA',
        body: event.data.text() || 'Você tem uma nova mensagem',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png'
      };
    }
  } else {
    console.log('ℹ️ Nenhum dado na notificação, usando valores padrão');
    notificationData = {
      title: 'Nova Notificação - Frota VSA',
      body: 'Você tem uma nova mensagem',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png'
    };
  }

  // Configurações otimizadas para mobile e desktop
  const baseOptions = {
    body: notificationData.body || notificationData.mensagem || 'Você tem uma nova mensagem',
    icon: notificationData.icon || '/icons/icon-192x192.png',
    badge: notificationData.badge || '/icons/icon-192x192.png',
    data: notificationData,
    tag: notificationData.tag || 'visa-notification-' + Date.now(), // Tag única para evitar agrupamento
    timestamp: Date.now(),
    silent: false
  };

  // Configurações específicas para dispositivos móveis
  if (isMobile) {
    console.log('📱 Aplicando configurações para mobile');
    Object.assign(baseOptions, {
      vibrate: [300, 200, 300, 200, 300], // Vibração mais perceptível
      requireInteraction: false, // Para mobile, false funciona melhor
      renotify: true, // Força renotificação mesmo com a mesma tag
      actions: [], // Remover ações em mobile para maior compatibilidade
      dir: 'auto', // Direção do texto
      lang: 'pt-BR' // Idioma
    });
  } else {
    console.log('💻 Aplicando configurações para desktop');
    Object.assign(baseOptions, {
      vibrate: [200, 100, 200],
      requireInteraction: true,
      actions: [
        {
          action: 'view',
          title: 'Visualizar'
        },
        {
          action: 'close',
          title: 'Fechar'
        }
      ],
      dir: 'auto',
      lang: 'pt-BR'
    });
  }

  console.log('📋 Opções finais da notificação:', baseOptions);
  const title = notificationData.title || 'VISA - Nova Notificação';
  console.log('📋 Título da notificação:', title);

  event.waitUntil(
    self.registration.showNotification(title, baseOptions)
      .then(() => {
        console.log('✅ Notificação exibida com sucesso!');
      })
      .catch((error) => {
        console.error('❌ Erro ao exibir notificação:', error);
      })
  );
});

// Event listener para cliques em notificações
self.addEventListener('notificationclick', (event) => {
  console.log('[ServiceWorker] Notification clicked:', event);

  event.notification.close();

  if (event.action === 'view' || !event.action) {
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        // Se já existe uma janela aberta, foca nela
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        // Caso contrário, abre uma nova janela
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
});

// Event listener para fechar notificação
self.addEventListener('notificationclose', (event) => {
  console.log('[ServiceWorker] Notification was closed:', event);
});
