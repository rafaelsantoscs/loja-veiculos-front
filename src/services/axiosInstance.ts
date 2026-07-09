import axios from 'axios';
import { BASE_URL } from '@/config/config';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// ─── Helpers ────────────────────────────────────────────────────────────────────

/** Páginas externas que não exigem autenticação */
const PAGINAS_PUBLICAS = [
  '/externo',
  '/login',
  '/register',
  '/confirmar-email',
  '/forgot-password',
  '/redefinir-senha',
  '/home',
  '/institucional',
  '/noticias',
  '/faq',
  '/termos',
  '/privacy',
  '/help',
  '/avaliacao',
];

/** Rotas de API acessíveis sem autenticação */
const API_PUBLICAS = [
  '/auth/',
  '/auth/google',
  '/usuarios/salvar-usuario',
  '/usuarios/confirmar-email',
  '/usuarios/validar-email',
  '/password/',
  '/publicas',
  '/faq',
  '/veiculos',
];

function isContextoPublico(apiUrl?: string): boolean {
  if (typeof window === 'undefined') return true;

  const pathname = window.location.pathname;

  // Está em uma página pública?
  if (PAGINAS_PUBLICAS.some((p) => pathname.includes(p))) return true;

  // É uma API pública?
  if (apiUrl) {
    if (API_PUBLICAS.some((p) => apiUrl.includes(p))) return true;
    // Rota de veículo individual  /veiculos/123  ou  /veiculos/123/fotos
    if (/^\/veiculos\//.test(apiUrl)) return true;
  }

  return false;
}

// ─── Interceptor de REQUEST ──────────────────────────────────────────────────────

axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window === 'undefined') return config;

    const userString = localStorage.getItem('user');

    if (userString) {
      try {
        const user = JSON.parse(userString);
        if (user?.token && config.headers) {
          config.headers['Authorization'] = `Bearer ${user.token}`;
          config.headers['Content-Type'] = 'application/json';
          config.headers['Accept'] = 'application/json';
          config.headers['Access-Control-Allow-Credentials'] = 'true';
        }
      } catch {
        console.error('Erro ao parsear user do localStorage');
        localStorage.removeItem('user');
        if (!isContextoPublico(config.url)) {
          window.location.href = '/externo';
        }
      }
    } else {
      // Sem sessão — só bloqueia rotas que exigem autenticação
      if (!isContextoPublico(config.url)) {
        window.location.href = '/externo';
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Interceptor de RESPONSE ─────────────────────────────────────────────────────

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Erro na requisição:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
    });

    if (error.response) {
      switch (error.response.status) {
        case 401:
          if (typeof window !== 'undefined') {
            localStorage.removeItem('user');
            sessionStorage.removeItem('user');
            document.cookie = 'userRoles=; path=/; max-age=0';

            if (!isContextoPublico(error.config?.url)) {
              window.location.href = '/externo';
            }
          }
          break;
        case 403:
          console.error('Acesso negado. Verifique suas permissões.');
          break;
        case 404:
          console.error('Recurso não encontrado:', error.config?.url);
          break;
        case 422:
          console.error('Erro de validação:', error.response.data);
          break;
        case 500:
          console.error('Erro interno do servidor');
          break;
      }
    } else if (error.request) {
      console.error('Erro de rede ou CORS:', error.message);
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
