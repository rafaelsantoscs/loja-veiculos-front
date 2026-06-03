import axiosInstance from './axiosInstance';
import { getUserLocalStorage } from '@/store/userLocalStorage';

export interface DadosDoEstabelecimento {
  id?: number;
  areaAtuacao?: string;
  outroArea?: string;
  tipoEstabelecimento?: string;
  razaoSocial?: string;
  nomeFantasia?: string;
  documentoTipo?: string;
  cnpjCpf?: string;
  porte?: string;
  inscricaoMunicipal?: string;
  areaConstruida?: string;
  cnes?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cep?: string;
  pontoReferencia?: string;
  telefone1?: string;
  telefone2?: string;
  email?: string;
  horarioFuncionamento?: string;
  registradoPor?: string;
  dataRegistro?: string;
  cpfDoRegistrador?: string;
  usuarioId?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

class EstabelecimentoService {
  
  // Método auxiliar para obter headers com token
  private getAuthHeaders() {
    const user = getUserLocalStorage();
    return {
      'Authorization': `Bearer ${user?.token}`,
      'Content-Type': 'application/json'
    };
  }
  
  // Criar estabelecimento
  async criar(dados: DadosDoEstabelecimento): Promise<ApiResponse<DadosDoEstabelecimento>> {
    try {
      const response = await axiosInstance.post('/api/estabelecimentos', dados, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: ApiResponse<DadosDoEstabelecimento> } };
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

  // Listar estabelecimentos do usuário
  async listar(): Promise<ApiResponse<DadosDoEstabelecimento[]>> {
    try {
      const response = await axiosInstance.get('/api/estabelecimentos', {
        headers: this.getAuthHeaders()
      });
      console.log("buscando lista", response)
      return response.data;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: ApiResponse<DadosDoEstabelecimento[]> } };
        if (axiosError.response?.data) {
          return axiosError.response.data;
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
  async buscarPorId(id: number): Promise<ApiResponse<DadosDoEstabelecimento>> {
    try {
      const response = await axiosInstance.get(`/api/estabelecimentos/${id}`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: ApiResponse<DadosDoEstabelecimento> } };
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

  // Atualizar estabelecimento
  async atualizar(id: number, dados: DadosDoEstabelecimento): Promise<ApiResponse<DadosDoEstabelecimento>> {
    try {
      const response = await axiosInstance.put(`/api/estabelecimentos/${id}`, dados, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: ApiResponse<DadosDoEstabelecimento> } };
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

  // Deletar estabelecimento
  async deletar(id: number): Promise<ApiResponse<void>> {
    try {
      const response = await axiosInstance.delete(`/api/estabelecimentos/${id}`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: ApiResponse<void> } };
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
  async buscarPorCnpjCpf(cnpjCpf: string): Promise<ApiResponse<DadosDoEstabelecimento[]>> {
    try {
      const response = await axiosInstance.get(`/api/estabelecimentos/buscar/${cnpjCpf}`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: ApiResponse<DadosDoEstabelecimento[]> } };
        if (axiosError.response?.data) {
          return axiosError.response.data;
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

// Create and export a named instance
const estabelecimentoService = new EstabelecimentoService();
export default estabelecimentoService;
