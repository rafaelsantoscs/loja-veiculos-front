import axiosInstance from './axiosInstance';
import { getUserLocalStorage } from '@/store/userLocalStorage';

export interface ResponsavelTecnico {
  id?: number;
  nome?: string;
  telefone?: string;
  conselhoProfissional?: string;
  registroConselho?: string;
  email?: string;
  cpf?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  cep?: string;
  cnpj?: string;
  documentoAnexoUrl?: string;
  cnpjCpfEmpresa?: string;
  empresaId?: number;
  registradoPor?: string;
  dataRegistro?: string;
  cpfDoRegistrador?: string;
  usuarioId?: number;
  status?: 'Dados Em Análise' | 'Ativo' | 'Baixa Solicitada' | 'Baixa Confirmada' | 'Corrigir Informações';
  observacoes?: string;
  ultimaAtualizacao?: string;
  atendidoPor?: string;
  dataAtendimento?: string;
}

export interface ApiResponseResponsavelTecnico<T> {
  success: boolean;
  message: string;
  data?: T;
}

class ResponsavelTecnicoService {
  
  // Método auxiliar para obter headers com token
  private getAuthHeaders() {
    const user = getUserLocalStorage();
    return {
      'Authorization': `Bearer ${user?.token}`,
      'Content-Type': 'application/json'
    };
  }
  
  // Criar responsável técnico
  async criar(dados: ResponsavelTecnico): Promise<ApiResponseResponsavelTecnico<ResponsavelTecnico>> {
    try {
      const response = await axiosInstance.post('/api/responsavel-tecnico', dados, {
        headers: this.getAuthHeaders()
      });
      
      return {
        success: true,
        message: response.data.message || 'Responsável técnico criado com sucesso',
        data: response.data.data || response.data
      };
    } catch (error: unknown) {
      console.error('Erro ao criar responsável técnico:', error);
      
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
        message: 'Erro ao criar responsável técnico'
      };
    }
  }

  // Listar responsáveis técnicos
  async listar(): Promise<ApiResponseResponsavelTecnico<ResponsavelTecnico[]>> {
    try {
      const response = await axiosInstance.get('/api/responsavel-tecnico', {
        headers: this.getAuthHeaders()
      });
      
      return {
        success: true,
        message: response.data.message || 'Responsáveis técnicos listados com sucesso',
        data: response.data.data || response.data
      };
    } catch (error: unknown) {
      console.error('Erro ao listar responsáveis técnicos:', error);
      
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
        message: 'Erro ao listar responsáveis técnicos'
      };
    }
  }

  // Buscar responsável técnico por ID
  async buscarPorId(id: number): Promise<ApiResponseResponsavelTecnico<ResponsavelTecnico>> {
    try {
      const response = await axiosInstance.get(`/api/responsavel-tecnico/${id}`, {
        headers: this.getAuthHeaders()
      });
      
      return {
        success: true,
        message: response.data.message || 'Responsável técnico encontrado com sucesso',
        data: response.data.data || response.data
      };
    } catch (error: unknown) {
      console.error('Erro ao buscar responsável técnico:', error);
      
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
        message: 'Erro ao buscar responsável técnico'
      };
    }
  }

  // Atualizar responsável técnico
  async atualizar(id: number, dados: ResponsavelTecnico): Promise<ApiResponseResponsavelTecnico<ResponsavelTecnico>> {
    try {
      const response = await axiosInstance.put(`/api/responsavel-tecnico/${id}`, dados, {
        headers: this.getAuthHeaders()
      });
      
      return {
        success: true,
        message: response.data.message || 'Responsável técnico atualizado com sucesso',
        data: response.data.data || response.data
      };
    } catch (error: unknown) {
      console.error('Erro ao atualizar responsável técnico:', error);
      
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
        message: 'Erro ao atualizar responsável técnico'
      };
    }
  }

  // Comunicação de baixa de responsabilidade técnica
  async comunicarBaixa(id: number): Promise<ApiResponseResponsavelTecnico<null>> {
    try {
      const response = await axiosInstance.put(`/api/responsavel-tecnico/${id}/baixa`, {}, {
        headers: this.getAuthHeaders()
      });
      
      return {
        success: true,
        message: response.data.message || 'Comunicação de baixa enviada com sucesso'
      };
    } catch (error: unknown) {
      console.error('Erro ao comunicar baixa:', error);
      
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
        message: 'Erro ao comunicar baixa'
      };
    }
  }

  // Buscar responsáveis técnicos por empresa
  async buscarPorEmpresa(empresaId: number): Promise<ApiResponseResponsavelTecnico<ResponsavelTecnico[]>> {
    try {
      const response = await axiosInstance.get(`/api/responsavel-tecnico/empresa/${empresaId}`, {
        headers: this.getAuthHeaders()
      });
      
      return {
        success: true,
        message: response.data.message || 'Responsáveis técnicos da empresa encontrados com sucesso',
        data: response.data.data || response.data
      };
    } catch (error: unknown) {
      console.error('Erro ao buscar responsáveis técnicos da empresa:', error);
      
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
        message: 'Erro ao buscar responsáveis técnicos da empresa'
      };
    }
  }

  // MÉTODOS ADMINISTRATIVOS

  // Buscar responsáveis técnicos pendentes para análise administrativa
  async buscarPendentesAnalise(): Promise<ApiResponseResponsavelTecnico<ResponsavelTecnico[]>> {
    try {
      const response = await axiosInstance.get('/api/responsavel-tecnico/admin/pendentes', {
        headers: this.getAuthHeaders()
      });
      
      return {
        success: true,
        message: response.data.message || 'Responsáveis técnicos pendentes encontrados com sucesso',
        data: response.data.data || response.data
      };
    } catch (error: unknown) {
      console.error('Erro ao buscar responsáveis técnicos pendentes:', error);
      
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
        message: 'Erro ao buscar responsáveis técnicos pendentes'
      };
    }
  }

  // Aprovar dados do responsável técnico
  async aprovarDados(id: number): Promise<ApiResponseResponsavelTecnico<ResponsavelTecnico>> {
    try {
      const response = await axiosInstance.put(`/api/responsavel-tecnico/admin/${id}/aprovar`, {}, {
        headers: this.getAuthHeaders()
      });
      
      return {
        success: true,
        message: response.data.message || 'Dados aprovados com sucesso',
        data: response.data.data || response.data
      };
    } catch (error: unknown) {
      console.error('Erro ao aprovar dados:', error);
      
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
        message: 'Erro ao aprovar dados'
      };
    }
  }

  // Solicitar correção de informações
  async solicitarCorrecao(id: number, observacoes: string): Promise<ApiResponseResponsavelTecnico<ResponsavelTecnico>> {
    try {
      const response = await axiosInstance.put(`/api/responsavel-tecnico/admin/${id}/corrigir`, {
        observacoes
      }, {
        headers: this.getAuthHeaders()
      });
      
      return {
        success: true,
        message: response.data.message || 'Solicitação de correção enviada com sucesso',
        data: response.data.data || response.data
      };
    } catch (error: unknown) {
      console.error('Erro ao solicitar correção:', error);
      
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
        message: 'Erro ao solicitar correção'
      };
    }
  }

  // Buscar responsáveis técnicos com baixa solicitada
  async buscarBaixaSolicitada(): Promise<ApiResponseResponsavelTecnico<ResponsavelTecnico[]>> {
    try {
      const response = await axiosInstance.get('/api/responsavel-tecnico/admin/baixa-solicitada', {
        headers: this.getAuthHeaders()
      });
      
      return {
        success: true,
        message: response.data.message || 'Responsáveis técnicos com baixa solicitada encontrados com sucesso',
        data: response.data.data || response.data
      };
    } catch (error: unknown) {
      console.error('Erro ao buscar responsáveis técnicos com baixa solicitada:', error);
      
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
        message: 'Erro ao buscar responsáveis técnicos com baixa solicitada'
      };
    }
  }

  // Confirmar baixa do responsável técnico
  async confirmarBaixa(id: number, observacoes?: string): Promise<ApiResponseResponsavelTecnico<ResponsavelTecnico>> {
    try {
      const response = await axiosInstance.put(`/api/responsavel-tecnico/admin/${id}/confirmar-baixa`, {
        observacoes
      }, {
        headers: this.getAuthHeaders()
      });
      
      return {
        success: true,
        message: response.data.message || 'Baixa confirmada com sucesso',
        data: response.data.data || response.data
      };
    } catch (error: unknown) {
      console.error('Erro ao confirmar baixa:', error);
      
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
        message: 'Erro ao confirmar baixa'
      };
    }
  }
}

const responsavelTecnicoService = new ResponsavelTecnicoService();
export default responsavelTecnicoService;
