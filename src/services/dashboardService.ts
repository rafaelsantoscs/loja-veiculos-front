import axiosInstance from './axiosInstance';
import { getUserLocalStorage } from '@/store/userLocalStorage';
import { dashboardDataService } from './dashboardDataService';

export interface DashboardStats {
  chamados: {
    total: number;
    abertos: number;
    fechados: number;
    finalizados: number;
    pendentes: number;
    emAndamento: number;
    crescimento: number;
  };
  materiais: {
    total: number;
    funcionando: number;
    manutencao: number;
    quebrado: number;
    disponivel: number;
    estoque: number;
    crescimento: number;
  };
  manutencao: {
    total: number;
    abertas: number;
    concluidas: number;
    atrasadas: number;
    preventivas: number;
    crescimento: number;
  };
  unidades: {
    total: number;
    ativas: number;
    setores: number;
    ocupacao: number;
    crescimento: number;
  };
}

export interface AlertasDashboard {
  manutencaoAtrasada: number;
  chamadosPendentes: number;
  materiaisQuebrados: number;
  setoresInativos: number;
}

export interface DashboardFilters {
  periodo: '7d' | '30d' | '90d' | '1y';
  unidadeId?: number;
  setorId?: number;
}

// Classe de erro personalizada para o dashboard
export class DashboardServiceError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'DashboardServiceError';
  }
}

class DashboardService {
  
  // Método auxiliar para tratar erros da API
  private handleApiError(error: unknown, operation: string): never {
    if (error instanceof Error) {
      // Erro de rede ou timeout
      if (error.message.includes('Network Error')) {
        throw new DashboardServiceError(
          'Erro de conexão. Verifique sua internet e tente novamente.',
          0,
          error
        );
      }
      
      // Erro de timeout
      if (error.message.includes('timeout')) {
        throw new DashboardServiceError(
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
        case 401:
          throw new DashboardServiceError(
            'Sessão expirada. Faça login novamente.',
            401,
            error
          );
        case 403:
          throw new DashboardServiceError(
            'Você não tem permissão para visualizar estes dados.',
            403,
            error
          );
        case 500:
          throw new DashboardServiceError(
            'Erro interno do servidor. Tente novamente em alguns minutos.',
            500,
            error
          );
        default:
          throw new DashboardServiceError(
            message || `Erro inesperado ao ${operation}.`,
            status,
            error
          );
      }
    }

    // Erro desconhecido
    throw new DashboardServiceError(
      `Erro desconhecido ao ${operation}. Tente novamente.`,
      undefined,
      error
    );
  }
  
  // Método auxiliar para obter headers com token
  private getAuthHeaders() {
    const user = getUserLocalStorage();
    if (!user?.token) {
      throw new DashboardServiceError('Token de autenticação não encontrado', 401);
    }
    return {
      'Authorization': `Bearer ${user.token}`,
      'Content-Type': 'application/json'
    };
  }

  // Método auxiliar para calcular crescimento simulado
  private calcularCrescimento(valorAtual: number, seed: number): number {
    // Simulação de crescimento baseada no valor atual e uma semente
    const base = (valorAtual + seed) % 100;
    return Math.floor((base / 10) - 5); // Retorna entre -5% e +9%
  }

  // Obter estatísticas gerais do dashboard
  async obterEstatisticas(): Promise<DashboardStats> {
    try {
      // Usar dados reais do novo serviço
      const realStats = await dashboardDataService.obterEstatisticasReais();
      
      // Converter para o formato esperado pelo dashboard
      return {
        chamados: {
          total: realStats.totalChamados,
          abertos: realStats.chamadosAbertos,
          fechados: realStats.chamadosFechados,
          finalizados: realStats.chamadosFinalizados,
          pendentes: realStats.chamadosAbertos,
          emAndamento: Math.floor(realStats.chamadosAbertos * 0.6), // Aproximação
          crescimento: this.calcularCrescimento(realStats.totalChamados, 15) // Mock do crescimento
        },
        materiais: {
          total: realStats.totalMateriais,
          funcionando: realStats.materiaisFuncionando,
          manutencao: realStats.materiaisReparo,
          quebrado: realStats.materiaisDefeito,
          disponivel: realStats.materiaisFuncionando,
          estoque: realStats.materiaisEstoque,
          crescimento: this.calcularCrescimento(realStats.totalMateriais, 8)
        },
        manutencao: {
          total: realStats.totalManutencoes,
          abertas: realStats.manutencoesAbertas,
          concluidas: realStats.manutencoesFechadas,
          atrasadas: Math.floor(realStats.manutencoesAbertas * 0.3), // Aproximação
          preventivas: Math.floor(realStats.totalManutencoes * 0.4), // Aproximação
          crescimento: this.calcularCrescimento(realStats.totalManutencoes, 12)
        },
        unidades: {
          total: realStats.totalUnidades,
          ativas: realStats.totalUnidades,
          setores: Math.floor(realStats.totalUnidades * 2.5), // Aproximação
          ocupacao: 85, // Mock
          crescimento: this.calcularCrescimento(realStats.totalUnidades, 2)
        }
      };
    } catch (error) {
      // Em caso de erro, retornar dados mock para não quebrar a interface
      console.warn('Erro ao carregar estatísticas, usando dados mock:', error);
      return this.getMockStats();
    }
  }

  // Obter alertas do dashboard
  async obterAlertas(): Promise<AlertasDashboard> {
    try {
      // Usar dados reais do novo serviço
      const realStats = await dashboardDataService.obterEstatisticasReais();
      
      return {
        manutencaoAtrasada: Math.floor(realStats.manutencoesAbertas * 0.3),
        chamadosPendentes: realStats.chamadosAbertos,
        materiaisQuebrados: realStats.materiaisDefeito,
        setoresInativos: Math.max(0, Math.floor(realStats.totalUnidades * 0.1)) // Aproximação
      };
    } catch (error) {
      console.warn('Erro ao carregar alertas, usando dados mock:', error);
      return {
        manutencaoAtrasada: 23,
        chamadosPendentes: 45,
        materiaisQuebrados: 145,
        setoresInativos: 2
      };
    }
  }

  // Obter estatísticas por período
  async obterEstatisticasPorPeriodo(periodo: string): Promise<DashboardStats> {
    try {
      const response = await axiosInstance.get(`/api/dashboard/estatisticas/periodo/${periodo}`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.warn('Erro ao carregar estatísticas por período, usando dados mock:', error);
      return this.getMockStats();
    }
  }

  // Obter resumo de atividades recentes
  async obterAtividadesRecentes(limite: number = 10): Promise<Array<{
    id: number;
    tipo: 'chamado' | 'material' | 'manutencao' | 'unidade';
    descricao: string;
    data: string;
    status: string;
    usuario: string;
  }>> {
    try {
      const response = await axiosInstance.get('/api/dashboard/atividades-recentes', {
        headers: this.getAuthHeaders(),
        params: { limite }
      });
      return response.data;
    } catch (error) {
      console.warn('Erro ao carregar atividades recentes, usando dados mock:', error);
      return [
        {
          id: 1,
          tipo: 'chamado',
          descricao: 'Novo chamado #1247 - Problema na impressora',
          data: new Date().toISOString(),
          status: 'aberto',
          usuario: 'João Silva'
        },
        {
          id: 2,
          tipo: 'manutencao',
          descricao: 'Manutenção preventiva concluída - Ar condicionado sala 12',
          data: new Date(Date.now() - 3600000).toISOString(),
          status: 'concluida',
          usuario: 'Maria Santos'
        },
        {
          id: 3,
          tipo: 'material',
          descricao: 'Novo material cadastrado - Notebook Dell Inspiron',
          data: new Date(Date.now() - 7200000).toISOString(),
          status: 'ativo',
          usuario: 'Carlos Oliveira'
        }
      ];
    }
  }

  // Método auxiliar para dados mock (desenvolvimento/fallback)
  private getMockStats(): DashboardStats {
    return {
      chamados: {
        total: 1247,
        abertos: 89,
        fechados: 650,
        finalizados: 448,
        pendentes: 45,
        emAndamento: 44,
        crescimento: 12.5
      },
      materiais: {
        total: 3420,
        funcionando: 2890,
        manutencao: 280,
        quebrado: 145,
        disponivel: 105,
        estoque: 320,
        crescimento: -2.1
      },
      manutencao: {
        total: 892,
        abertas: 156,
        concluidas: 678,
        atrasadas: 23,
        preventivas: 135,
        crescimento: 8.7
      },
      unidades: {
        total: 15,
        ativas: 14,
        setores: 48,
        ocupacao: 87,
        crescimento: 5.2
      }
    };
  }

  // Exportar dados para relatório
  async exportarRelatorio(
    tipo: 'pdf' | 'excel',
    filtros: DashboardFilters
  ): Promise<Blob> {
    try {
      const response = await axiosInstance.get(`/api/dashboard/exportar/${tipo}`, {
        headers: this.getAuthHeaders(),
        params: filtros,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      this.handleApiError(error, 'exportar relatório');
    }
  }

  // Obter comparativo de períodos
  async obterComparativo(
    periodoAtual: string,
    periodoAnterior: string
  ): Promise<{
    atual: DashboardStats;
    anterior: DashboardStats;
    variacao: Record<string, number>;
  }> {
    try {
      const response = await axiosInstance.get('/api/dashboard/comparativo', {
        headers: this.getAuthHeaders(),
        params: { periodoAtual, periodoAnterior }
      });
      return response.data;
    } catch (error) {
      this.handleApiError(error, 'obter comparativo');
    }
  }
}

// Exportar instância única do serviço (singleton)
const dashboardService = new DashboardService();
export default dashboardService;