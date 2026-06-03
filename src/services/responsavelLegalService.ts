import axiosInstance from './axiosInstance';
import { getUserLocalStorage } from '@/store/userLocalStorage';

export interface ResponsavelLegal {
  id?: number;
  nome?: string;
  cpf?: string;
  cnpjCpfEmpresa?: string;
  telefone1?: string;
  telefone2?: string;
  email?: string;
  registradoPor?: string;
  dataRegistro?: string;
  cpfDoRegistrador?: string;
  usuarioId?: number;
  empresaId?: number;
}

export interface ApiResponseResponsavelLegal<T> {
  success: boolean;
  message: string;
  data?: T;
}

class ResponsavelLegalService {
  
  // Método auxiliar para obter headers com token
  private getAuthHeaders() {
    const user = getUserLocalStorage();
    return {
      'Authorization': `Bearer ${user?.token}`,
      'Content-Type': 'application/json'
    };
  }
  
  // Criar estabelecimento
  async criar(dados: ResponsavelLegal): Promise<ApiResponseResponsavelLegal<ResponsavelLegal>> {
    try {
      const response = await axiosInstance.post('/api/responsavel-legal', dados, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: unknown } };
        if (axiosError.response?.data) {
          return axiosError.response.data as ApiResponseResponsavelLegal<ResponsavelLegal>;
        }
      }
      return {
        success: false,
        message: 'Erro de conexão com o servidor'
      };
    }
  }

  // Listar estabelecimentos do usuário
  async listar(): Promise<ApiResponseResponsavelLegal<ResponsavelLegal[]>> {
    try {
      const response = await axiosInstance.get('/api/responsavel-legal', {
        headers: this.getAuthHeaders()
      });
      console.log("buscando lista", response)
      return response.data;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: unknown } };
        if (axiosError.response?.data) {
          return axiosError.response.data as ApiResponseResponsavelLegal<ResponsavelLegal[]>;
        }
      }
      return {
        success: false,
        message: 'Erro de conexão com o servidor',
        data: []
      };
    }
  }

  // Buscar estabelecimento por ID
  async buscarPorId(id: number): Promise<ApiResponseResponsavelLegal<ResponsavelLegal>> {
    try {
      const response = await axiosInstance.get(`/api/responsavel-legal/${id}`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: unknown } };
        if (axiosError.response?.data) {
          return axiosError.response.data as ApiResponseResponsavelLegal<ResponsavelLegal>;
        }
      }
      return {
        success: false,
        message: 'Erro de conexão com o servidor'
      };
    }
  }

  // Atualizar estabelecimento
  async atualizar(id: number, dados: ResponsavelLegal): Promise<ApiResponseResponsavelLegal<ResponsavelLegal>> {
    try {
      const response = await axiosInstance.put(`/api/responsavel-legal/${id}`, dados, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: unknown } };
        if (axiosError.response?.data) {
          return axiosError.response.data as ApiResponseResponsavelLegal<ResponsavelLegal>;
        }
      }
      return {
        success: false,
        message: 'Erro de conexão com o servidor'
      };
    }
  }

  // Deletar estabelecimento
  async deletar(id: number): Promise<ApiResponseResponsavelLegal<void>> {
    try {
      const response = await axiosInstance.delete(`/api/responsavel-legal/${id}`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: unknown } };
        if (axiosError.response?.data) {
          return axiosError.response.data as ApiResponseResponsavelLegal<void>;
        }
      }
      return {
        success: false,
        message: 'Erro de conexão com o servidor'
      };
    }
  }

  // Buscar por CNPJ/CPF
  async buscarPorCnpjCpf(cnpjCpf: string): Promise<ApiResponseResponsavelLegal<ResponsavelLegal[]>> {
    try {
      const response = await axiosInstance.get(`/api/responsavel-legal/buscar/${cnpjCpf}`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: unknown } };
        if (axiosError.response?.data) {
          return axiosError.response.data as ApiResponseResponsavelLegal<ResponsavelLegal[]>;
        }
      }
      return {
        success: false,
        message: 'Erro de conexão com o servidor',
        data: []
      };
    }
  }
}

const responsavelLegalService = new ResponsavelLegalService();
export default responsavelLegalService;
