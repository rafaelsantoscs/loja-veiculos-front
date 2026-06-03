import axiosInstance from './axiosInstance';
import { getUserLocalStorage } from '@/store/userLocalStorage';
import { Unidade, Setor } from '@/types';

export interface CriarUnidadeDto {
  nome: string;
}

export interface CriarSetorDto {
  nome: string;
  unidadeId: number;
}

export interface AtualizarUnidadeDto {
  nome: string;
}

export interface AtualizarSetorDto {
  nome: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

// Classe de erro personalizada para melhor tratamento
export class UnidadeServiceError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'UnidadeServiceError';
  }
}

class UnidadeService {
  
  // Método auxiliar para tratar erros da API
  private handleApiError(error: unknown, operation: string): never {
    if (error instanceof Error) {
      // Erro de rede ou timeout
      if (error.message.includes('Network Error')) {
        throw new UnidadeServiceError(
          'Erro de conexão. Verifique sua internet e tente novamente.',
          0,
          error
        );
      }
      
      // Erro de timeout
      if (error.message.includes('timeout')) {
        throw new UnidadeServiceError(
          'Tempo limite excedido. Tente novamente.',
          408,
          error
        );
      }
    }

    // Erro de resposta HTTP
    if (typeof error === 'object' && error !== null && 'response' in error) {
      const httpError = error as { response: { status: number; data?: { message?: string } } };
      const status = httpError.response.status;
      const message = httpError.response.data?.message;

      switch (status) {
        case 400:
          throw new UnidadeServiceError(
            message || 'Dados inválidos. Verifique as informações e tente novamente.',
            400,
            error
          );
        case 401:
          throw new UnidadeServiceError(
            'Sessão expirada. Faça login novamente.',
            401,
            error
          );
        case 403:
          throw new UnidadeServiceError(
            'Você não tem permissão para realizar esta operação.',
            403,
            error
          );
        case 404:
          throw new UnidadeServiceError(
            'Recurso não encontrado.',
            404,
            error
          );
        case 409:
          throw new UnidadeServiceError(
            message || 'Conflito: Esta operação não pode ser realizada.',
            409,
            error
          );
        case 422:
          throw new UnidadeServiceError(
            message || 'Dados inválidos. Verifique os campos obrigatórios.',
            422,
            error
          );
        case 500:
          throw new UnidadeServiceError(
            'Erro interno do servidor. Tente novamente em alguns minutos.',
            500,
            error
          );
        default:
          throw new UnidadeServiceError(
            message || `Erro inesperado ao ${operation}.`,
            status,
            error
          );
      }
    }

    // Erro desconhecido
    throw new UnidadeServiceError(
      `Erro desconhecido ao ${operation}. Tente novamente.`,
      undefined,
      error
    );
  }
  
  // Método auxiliar para obter headers com token
  private getAuthHeaders() {
    const user = getUserLocalStorage();
    if (!user?.token) {
      throw new UnidadeServiceError('Token de autenticação não encontrado', 401);
    }
    return {
      'Authorization': `Bearer ${user.token}`,
      'Content-Type': 'application/json'
    };
  }
  
  // ============= MÉTODOS DE UNIDADES =============
  
  // Listar todas as unidades
  async listarUnidades(): Promise<Unidade[]> {
    try {
      const response = await axiosInstance.get('/api/unidades/listar-unidades', {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      this.handleApiError(error, 'carregar unidades');
    }
  }

  // Obter unidade por ID
  async obterUnidadePorId(id: number): Promise<Unidade> {
    try {
      if (!id || id <= 0) {
        throw new UnidadeServiceError('ID da unidade é obrigatório', 400);
      }
      
      const response = await axiosInstance.get(`/api/unidades/${id}`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      this.handleApiError(error, 'obter unidade');
    }
  }

  // Criar nova unidade
  async criarUnidade(dados: CriarUnidadeDto): Promise<ApiResponse<Unidade>> {
    try {
      // Validação básica
      if (!dados.nome?.trim()) {
        throw new UnidadeServiceError('Nome da unidade é obrigatório', 400);
      }

      const response = await axiosInstance.post('/api/unidades', dados, {
        headers: this.getAuthHeaders()
      });
      return {
        success: true,
        message: 'Unidade criada com sucesso',
        data: response.data
      };
    } catch (error) {
      this.handleApiError(error, 'criar unidade');
    }
  }

  // Atualizar unidade
  async atualizarUnidade(id: number, dados: AtualizarUnidadeDto): Promise<ApiResponse<Unidade>> {
    try {
      if (!id || id <= 0) {
        throw new UnidadeServiceError('ID da unidade é obrigatório', 400);
      }

      if (!dados.nome?.trim()) {
        throw new UnidadeServiceError('Nome da unidade é obrigatório', 400);
      }

      const response = await axiosInstance.put(`/api/unidades/${id}`, dados, {
        headers: this.getAuthHeaders()
      });
      return {
        success: true,
        message: 'Unidade atualizada com sucesso',
        data: response.data
      };
    } catch (error) {
      this.handleApiError(error, 'atualizar unidade');
    }
  }

  // Excluir unidade
  async excluirUnidade(id: number): Promise<ApiResponse<null>> {
    try {
      if (!id || id <= 0) {
        throw new UnidadeServiceError('ID da unidade é obrigatório', 400);
      }

      await axiosInstance.delete(`/api/unidades/${id}`, {
        headers: this.getAuthHeaders()
      });
      return {
        success: true,
        message: 'Unidade excluída com sucesso'
      };
    } catch (error) {
      this.handleApiError(error, 'excluir unidade');
    }
  }

  // ============= MÉTODOS DE SETORES =============
  
  // Listar todos os setores
  async listarSetores(): Promise<Setor[]> {
    try {
      const response = await axiosInstance.get('/api/setores', {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      this.handleApiError(error, 'carregar setores');
    }
  }

  // Listar setores por unidade
  async listarSetoresPorUnidade(unidadeId: number): Promise<Setor[]> {
    try {
      if (!unidadeId || unidadeId <= 0) {
        throw new UnidadeServiceError('ID da unidade é obrigatório', 400);
      }

      const response = await axiosInstance.get(`/api/setores/unidade/${unidadeId}`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      this.handleApiError(error, 'carregar setores da unidade');
    }
  }

  // Obter setor por ID
  async obterSetorPorId(id: number): Promise<Setor> {
    try {
      if (!id || id <= 0) {
        throw new UnidadeServiceError('ID do setor é obrigatório', 400);
      }

      const response = await axiosInstance.get(`/api/setores/${id}`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      this.handleApiError(error, 'obter setor');
    }
  }

  // Criar novo setor
  async criarSetor(dados: CriarSetorDto): Promise<ApiResponse<Setor>> {
    try {
      // Validação básica
      if (!dados.nome?.trim()) {
        throw new UnidadeServiceError('Nome do setor é obrigatório', 400);
      }
      
      if (!dados.unidadeId || dados.unidadeId <= 0) {
        throw new UnidadeServiceError('Unidade deve ser selecionada', 400);
      }

      const response = await axiosInstance.post('/api/setores', dados, {
        headers: this.getAuthHeaders()
      });
      return {
        success: true,
        message: 'Setor criado com sucesso',
        data: response.data
      };
    } catch (error) {
      this.handleApiError(error, 'criar setor');
    }
  }

  // Atualizar setor
  async atualizarSetor(id: number, dados: AtualizarSetorDto): Promise<ApiResponse<Setor>> {
    try {
      if (!id || id <= 0) {
        throw new UnidadeServiceError('ID do setor é obrigatório', 400);
      }

      if (!dados.nome?.trim()) {
        throw new UnidadeServiceError('Nome do setor é obrigatório', 400);
      }

      const response = await axiosInstance.put(`/api/setores/${id}`, dados, {
        headers: this.getAuthHeaders()
      });
      return {
        success: true,
        message: 'Setor atualizado com sucesso',
        data: response.data
      };
    } catch (error) {
      this.handleApiError(error, 'atualizar setor');
    }
  }

  // Excluir setor
  async excluirSetor(id: number): Promise<ApiResponse<null>> {
    try {
      if (!id || id <= 0) {
        throw new UnidadeServiceError('ID do setor é obrigatório', 400);
      }

      await axiosInstance.delete(`/api/setores/${id}`, {
        headers: this.getAuthHeaders()
      });
      return {
        success: true,
        message: 'Setor excluído com sucesso'
      };
    } catch (error) {
      this.handleApiError(error, 'excluir setor');
    }
  }

  // ============= MÉTODOS AUXILIARES =============
  
  // Verificar se unidade pode ser excluída (não tem materiais/chamados)
  async podeExcluirUnidade(id: number): Promise<boolean> {
    try {
      const response = await axiosInstance.get(`/api/unidades/${id}/pode-excluir`, {
        headers: this.getAuthHeaders()
      });
      return response.data.podeExcluir;
    } catch (error) {
      console.error('Erro ao verificar se unidade pode ser excluída:', error);
      return false;
    }
  }

  // Verificar se setor pode ser excluído (não tem materiais/chamados)
  async podeExcluirSetor(id: number): Promise<boolean> {
    try {
      const response = await axiosInstance.get(`/api/setores/${id}/pode-excluir`, {
        headers: this.getAuthHeaders()
      });
      return response.data.podeExcluir;
    } catch (error) {
      console.error('Erro ao verificar se setor pode ser excluído:', error);
      return false;
    }
  }

  // Obter estatísticas da unidade (quantos materiais, chamados, etc.)
  async obterEstatisticasUnidade(id: number): Promise<{
    totalMateriais: number;
    totalChamados: number;
    totalSetores: number;
  }> {
    try {
      const response = await axiosInstance.get(`/api/unidades/${id}/estatisticas`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao obter estatísticas da unidade:', error);
      throw error;
    }
  }

  // Obter estatísticas do setor
  async obterEstatisticasSetor(id: number): Promise<{
    totalMateriais: number;
    totalChamados: number;
  }> {
    try {
      const response = await axiosInstance.get(`/api/setores/${id}/estatisticas`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao obter estatísticas do setor:', error);
      throw error;
    }
  }
}

// Exportar instância única do serviço (singleton)
const unidadeService = new UnidadeService();
export default unidadeService;