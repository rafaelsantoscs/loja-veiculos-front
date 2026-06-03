import axiosInstance from './axiosInstance';
import { getUserLocalStorage } from '@/store/userLocalStorage';
import { DefinicaoPorte, ApiResponseDefinicaoPorte } from '@/types/types';

class DefinicaoPorteService {
  
  // Método auxiliar para obter headers com token
  private getAuthHeaders() {
    const user = getUserLocalStorage();
    return {
      'Authorization': `Bearer ${user?.token}`,
      'Content-Type': 'application/json'
    };
  }
  
  // Criar definição de porte
  async criar(dados: DefinicaoPorte): Promise<ApiResponseDefinicaoPorte<DefinicaoPorte>> {
    try {
      const response = await axiosInstance.post('/api/definicao-porte', dados, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: ApiResponseDefinicaoPorte<DefinicaoPorte> } };
        if (axiosError.response?.data) {
          return axiosError.response.data;
        }
      }
      return {
        success: false,
        message: 'Erro de conexão com o servidor'
      };
    }
  }

  // Listar definições de porte
  async listar(): Promise<ApiResponseDefinicaoPorte<DefinicaoPorte[]>> {
    try {
      const response = await axiosInstance.get('/api/definicao-porte', {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: ApiResponseDefinicaoPorte<DefinicaoPorte[]> } };
        if (axiosError.response?.data) {
          return axiosError.response.data;
        }
      }
      return {
        success: false,
        message: 'Erro de conexão com o servidor'
      };
    }
  }

  // Buscar por ID
  async buscarPorId(id: number): Promise<ApiResponseDefinicaoPorte<DefinicaoPorte>> {
    try {
      const response = await axiosInstance.get(`/api/definicao-porte/${id}`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: ApiResponseDefinicaoPorte<DefinicaoPorte> } };
        if (axiosError.response?.data) {
          return axiosError.response.data;
        }
      }
      return {
        success: false,
        message: 'Erro de conexão com o servidor'
      };
    }
  }

  // Atualizar definição de porte
  async atualizar(id: number, dados: DefinicaoPorte): Promise<ApiResponseDefinicaoPorte<DefinicaoPorte>> {
    try {
      const response = await axiosInstance.put(`/api/definicao-porte/${id}`, dados, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: ApiResponseDefinicaoPorte<DefinicaoPorte> } };
        if (axiosError.response?.data) {
          return axiosError.response.data;
        }
      }
      return {
        success: false,
        message: 'Erro de conexão com o servidor'
      };
    }
  }

  // Deletar definição de porte
  async deletar(id: number): Promise<ApiResponseDefinicaoPorte<void>> {
    try {
      const response = await axiosInstance.delete(`/api/definicao-porte/${id}`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: ApiResponseDefinicaoPorte<void> } };
        if (axiosError.response?.data) {
          return axiosError.response.data;
        }
      }
      return {
        success: false,
        message: 'Erro de conexão com o servidor'
      };
    }
  }

  // Buscar por CNPJ/CPF
  async buscarPorCnpjCpf(cnpjCpf: string): Promise<ApiResponseDefinicaoPorte<DefinicaoPorte[]>> {
    try {
      const response = await axiosInstance.get(`/api/definicao-porte/buscar/${cnpjCpf}`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: ApiResponseDefinicaoPorte<DefinicaoPorte[]> } };
        if (axiosError.response?.data) {
          return axiosError.response.data;
        }
      }
      return {
        success: false,
        message: 'Erro de conexão com o servidor'
      };
    }
  }

  // Buscar por empresa ID
  async buscarPorEmpresaId(empresaId: number): Promise<ApiResponseDefinicaoPorte<DefinicaoPorte[]>> {
    try {
      const response = await axiosInstance.get(`/api/definicao-porte/empresa/${empresaId}`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: ApiResponseDefinicaoPorte<DefinicaoPorte[]> } };
        if (axiosError.response?.data) {
          return axiosError.response.data;
        }
      }
      return {
        success: false,
        message: 'Erro de conexão com o servidor'
      };
    }
  }

  // Buscar última definição por empresa
  async buscarUltimaPorEmpresa(empresaId: number): Promise<ApiResponseDefinicaoPorte<DefinicaoPorte>> {
    try {
      const response = await axiosInstance.get(`/api/definicao-porte/ultima/${empresaId}`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: ApiResponseDefinicaoPorte<DefinicaoPorte> } };
        if (axiosError.response?.data) {
          return axiosError.response.data;
        }
      }
      return {
        success: false,
        message: 'Erro de conexão com o servidor'
      };
    }
  }

  // Método utilitário para calcular porte baseado na quantidade
  calcularPorte(quantidadeGerada: number): string {
    if (quantidadeGerada <= 50) {
      return 'PEQUENO';
    } else if (quantidadeGerada <= 500) {
      return 'MÉDIO';
    } else {
      return 'GRANDE';
    }
  }

  // Método utilitário para obter faixas de porte
  getFaixasPorte() {
    return [
      {
        faixa: 'Até 50',
        descricao: 'Até 50 Kg/mês',
        porte: 'PEQUENO',
        minimo: 0,
        maximo: 50
      },
      {
        faixa: '51 a 500',
        descricao: '51 a 500 Kg/mês',
        porte: 'MÉDIO',
        minimo: 51,
        maximo: 500
      },
      {
        faixa: 'Acima de 500',
        descricao: 'Acima de 500 Kg/mês',
        porte: 'GRANDE',
        minimo: 501,
        maximo: null
      }
    ];
  }
}

// Exportar uma instância única
const definicaoPorteService = new DefinicaoPorteService();
export default definicaoPorteService;
