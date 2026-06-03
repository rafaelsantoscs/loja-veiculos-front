import axiosInstance from './axiosInstance';
import { getUserLocalStorage } from '@/store/userLocalStorage';

export interface EstabelecimentoCompleto {
  id?: number;
  razaoSocial?: string;
  nomeFantasia?: string;
  cnpjCpf?: string;
  documentoTipo?: string;
  porte?: string;
  areaAtuacao?: string;
  outroArea?: string;
  tipoEstabelecimento?: string;
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
  responsaveisLegais?: ResponsavelLegal[];
  responsaveisTecnicos?: ResponsavelTecnico[];
}

export interface ResponsavelLegal {
  id?: number;
  nome?: string;
  cpf?: string;
  telefone1?: string;
  telefone2?: string;
  email?: string;
  cnpjCpfEmpresa?: string;
  empresaId?: number;
  registradoPor?: string;
  dataRegistro?: string;
}

export interface ResponsavelTecnico {
  id?: number;
  nome?: string;
  telefone?: string;
  conselhoProfissional?: string;
  registroConselho?: string;
  email?: string;
  cnpjCpfEmpresa?: string;
  empresaId?: number;
  registradoPor?: string;
  dataRegistro?: string;
  status?: 'Dados Em Análise' | 'Ativo' | 'Baixa Solicitada' | 'Baixa Confirmada';
}

export interface ApiResponseEstabelecimentoCompleto<T> {
  success: boolean;
  message: string;
  data?: T;
}

class EstabelecimentoCompletoService {
  
  // Método auxiliar para obter headers com token
  private getAuthHeaders() {
    const user = getUserLocalStorage();
    return {
      'Authorization': `Bearer ${user?.token}`,
      'Content-Type': 'application/json'
    };
  }
  
  // Listar todos os estabelecimentos completos
  async listarCompletos(): Promise<ApiResponseEstabelecimentoCompleto<EstabelecimentoCompleto[]>> {
    try {
      const response = await axiosInstance.get('/api/estabelecimentos/completos', {
        headers: this.getAuthHeaders()
      });
      
      return {
        success: true,
        message: response.data.message || 'Estabelecimentos completos listados com sucesso',
        data: response.data.data || response.data
      };
    } catch (error: unknown) {
      console.error('Erro ao listar estabelecimentos completos:', error);
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        if (axiosError.response?.data?.message) {
          return {
            success: false,
            message: axiosError.response.data.message
          };
        }
      }
      
      return {
        success: false,
        message: 'Erro ao listar estabelecimentos completos'
      };
    }
  }

  // Buscar estabelecimento completo por ID
  async buscarCompletoPorId(id: number): Promise<ApiResponseEstabelecimentoCompleto<EstabelecimentoCompleto>> {
    try {
      const response = await axiosInstance.get(`/api/estabelecimentos/completo/${id}`, {
        headers: this.getAuthHeaders()
      });
      
      return {
        success: true,
        message: response.data.message || 'Estabelecimento completo encontrado com sucesso',
        data: response.data.data || response.data
      };
    } catch (error: unknown) {
      console.error('Erro ao buscar estabelecimento completo:', error);
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        if (axiosError.response?.data?.message) {
          return {
            success: false,
            message: axiosError.response.data.message
          };
        }
      }
      
      return {
        success: false,
        message: 'Erro ao buscar estabelecimento completo'
      };
    }
  }
}

const estabelecimentoCompletoService = new EstabelecimentoCompletoService();
export default estabelecimentoCompletoService;
