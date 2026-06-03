import axios from 'axios';
import {BASE_URL} from '@/config/config';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // Aumentado para 30 segundos
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});


// Interceptor para adicionar o token de autenticação
axiosInstance.interceptors.request.use(
  (config) => {
    // Verificar se estamos no lado do cliente
    if (typeof window !== 'undefined') {
      // Buscar token do objeto user no localStorage
      const userString = localStorage.getItem('user');
      if (userString) {
        try {
          const user = JSON.parse(userString);
          const token = user.token;
          if (token) {
            if (config.headers) {
              config.headers['Authorization'] = `Bearer ${token}`;
              config.headers['Content-Type'] = 'application/json';
              config.headers['Accept'] = 'application/json';
              config.headers['Access-Control-Allow-Credentials'] = 'true';
            }
          }
        } catch (error) {
          console.error('Erro ao parsear user do localStorage:', error);
          // Só redireciona se não estiver em uma rota pública e não for rota de auth
          const isPublicRoute = config.url?.includes('/publicas') || 
                               config.url?.includes('/faq') || 
                               window.location.pathname.includes('/externo') ||
                               window.location.pathname.includes('/institucional') ||
                               window.location.pathname.includes('/noticias') ||
                               window.location.pathname.includes('/faq');
          
          if (!config.url?.includes('/auth') && !isPublicRoute) {
            window.location.href = '/externo';
          }
        }
      } else {
        // Só redireciona se não estiver em uma rota pública e não for rota de auth
        const isPublicRoute = config.url?.includes('/publicas') || 
                             config.url?.includes('/faq') || 
                             window.location.pathname.includes('/externo') ||
                             window.location.pathname.includes('/institucional') ||
                             window.location.pathname.includes('/noticias') ||
                             window.location.pathname.includes('/faq');
        
        if (!config.url?.includes('/auth') && !isPublicRoute) {
          window.location.href = '/externo';
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para lidar com respostas de erro
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Log detalhado do erro
    console.error('Erro na requisição:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      headers: error.config?.headers
    });

    // Tratamento específico por status
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Unauthorized - Limpar dados e redirecionar para login apenas se não for rota pública
          if (typeof window !== 'undefined') {
            localStorage.removeItem('user');
            sessionStorage.removeItem('user');
            
            const isPublicRoute = error.config.url?.includes('/publicas') || 
                                 error.config.url?.includes('/faq') || 
                                 window.location.pathname.includes('/externo') ||
                                 window.location.pathname.includes('/institucional') ||
                                 window.location.pathname.includes('/noticias') ||
                                 window.location.pathname.includes('/faq');
            
            if (!error.config.url?.includes('/auth') && !isPublicRoute) {
              window.location.href = '/externo';
            }
          }
          break;
        case 403:
          // Forbidden - Acesso negado
          console.error('Acesso negado. Verifique suas permissões.');
          break;
        case 404:
          // Not Found
          console.error('Recurso não encontrado:', error.config?.url);
          break;
        case 422:
          // Validation Error
          console.error('Erro de validação:', error.response.data);
          break;
        case 500:
          // Server Error
          console.error('Erro interno do servidor');
          break;
      }
    } else if (error.request) {
      // Erro de rede ou CORS
      console.error('Erro de rede ou CORS:', error.message);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
