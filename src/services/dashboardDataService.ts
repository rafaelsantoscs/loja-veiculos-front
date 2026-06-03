import axiosInstance from './axiosInstance';
import { Material, Chamado, Manutencao, Unidade, StatusChamado, StatusMaterial } from '@/types';

export interface DashboardStats {
  totalChamados: number;
  chamadosAbertos: number;
  chamadosFechados: number;
  chamadosFinalizados: number;
  totalMateriais: number;
  materiaisFuncionando: number;
  materiaisDefeito: number;
  materiaisReparo: number;
  materiaisEstoque: number;
  totalManutencoes: number;
  manutencoesAbertas: number;
  manutencoesFechadas: number;
  totalUnidades: number;
}

export interface AlertaDashboard {
  id: string;
  tipo: 'error' | 'warning' | 'info';
  titulo: string;
  descricao: string;
  timestamp: string;
}

export interface DadosGrafico {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
  }[];
}

class DashboardDataService {
  // Buscar estatísticas reais do sistema
  async obterEstatisticasReais(): Promise<DashboardStats> {
    try {
      const [chamadosRes, materiaisRes, manutencoesRes, unidadesRes] = await Promise.all([
        axiosInstance.get('/api/chamados'),
        axiosInstance.get('/api/materiais'),
        axiosInstance.get('/api/manutencoes'),
        axiosInstance.get('/api/unidades/listar-unidades')
      ]);

      const chamados: Chamado[] = chamadosRes.data;
      const materiais: Material[] = materiaisRes.data;
      const manutencoes: Manutencao[] = manutencoesRes.data;
      const unidades: Unidade[] = unidadesRes.data;

      // Contar chamados por status
      const chamadosAbertos = chamados.filter(c => 
        c.status === StatusChamado.ABERTO || c.status === StatusChamado.EM_ATENDIMENTO
      ).length;
      const chamadosFechados = chamados.filter(c => 
        c.status === StatusChamado.FECHADO
      ).length;
      const chamadosFinalizados = chamados.filter(c => 
        c.status === StatusChamado.FINALIZADO
      ).length;

      // Contar materiais por status
      const materiaisFuncionando = materiais.filter(m => 
        m.status === StatusMaterial.FUNCIONANDO
      ).length;
      const materiaisDefeito = materiais.filter(m => 
        m.status === StatusMaterial.DEFEITO
      ).length;
      const materiaisReparo = materiais.filter(m => 
        m.status === StatusMaterial.EM_REPARO
      ).length;
      const materiaisEstoque = materiais.filter(m => 
        m.status === StatusMaterial.EM_ESTOQUE
      ).length;

      // Contar manutenções por status
      const manutencoesAbertas = manutencoes.filter(m => 
        m.status === 'ABERTA'
      ).length;
      const manutencoesFechadas = manutencoes.filter(m => 
        m.status === 'FECHADA'
      ).length;

      return {
        totalChamados: chamados.length,
        chamadosAbertos,
        chamadosFechados,
        chamadosFinalizados,
        totalMateriais: materiais.length,
        materiaisFuncionando,
        materiaisDefeito,
        materiaisReparo,
        materiaisEstoque,
        totalManutencoes: manutencoes.length,
        manutencoesAbertas,
        manutencoesFechadas,
        totalUnidades: unidades.length
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw new Error('Falha ao carregar estatísticas do sistema');
    }
  }

  // Gerar alertas baseados nos dados reais
  async gerarAlertas(): Promise<AlertaDashboard[]> {
    try {
      const stats = await this.obterEstatisticasReais();
      const alertas: AlertaDashboard[] = [];

      // Alerta para muitos chamados abertos
      if (stats.chamadosAbertos > 10) {
        alertas.push({
          id: 'chamados-abertos',
          tipo: 'warning',
          titulo: 'Muitos chamados abertos',
          descricao: `Existem ${stats.chamadosAbertos} chamados aguardando atendimento`,
          timestamp: new Date().toISOString()
        });
      }

      // Alerta para materiais com defeito
      if (stats.materiaisDefeito > 5) {
        alertas.push({
          id: 'materiais-defeito',
          tipo: 'error',
          titulo: 'Materiais com defeito',
          descricao: `${stats.materiaisDefeito} materiais precisam de reparo`,
          timestamp: new Date().toISOString()
        });
      }

      // Alerta para manutenções pendentes
      if (stats.manutencoesAbertas > 8) {
        alertas.push({
          id: 'manutencoes-pendentes',
          tipo: 'warning',
          titulo: 'Manutenções pendentes',
          descricao: `${stats.manutencoesAbertas} manutenções aguardando conclusão`,
          timestamp: new Date().toISOString()
        });
      }

      // Alerta informativo se tudo estiver bem
      if (alertas.length === 0) {
        alertas.push({
          id: 'sistema-ok',
          tipo: 'info',
          titulo: 'Sistema funcionando bem',
          descricao: 'Todos os indicadores estão dentro do esperado',
          timestamp: new Date().toISOString()
        });
      }

      return alertas;
    } catch (error) {
      console.error('Erro ao gerar alertas:', error);
      return [{
        id: 'erro-sistema',
        tipo: 'error',
        titulo: 'Erro no sistema',
        descricao: 'Não foi possível carregar os dados de alertas',
        timestamp: new Date().toISOString()
      }];
    }
  }

  // Dados para gráfico de chamados por status
  async obterDadosGraficoChamados(): Promise<DadosGrafico> {
    try {
      const response = await axiosInstance.get('/api/chamados');
      const chamados: Chamado[] = response.data;

      const statusCount = {
        'Abertos': chamados.filter(c => c.status === StatusChamado.ABERTO).length,
        'Em Atendimento': chamados.filter(c => c.status === StatusChamado.EM_ATENDIMENTO).length,
        'Fechados': chamados.filter(c => c.status === StatusChamado.FECHADO).length,
        'Finalizados': chamados.filter(c => c.status === StatusChamado.FINALIZADO).length,
      };

      return {
        labels: Object.keys(statusCount),
        datasets: [{
          label: 'Chamados por Status',
          data: Object.values(statusCount),
          backgroundColor: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6']
        }]
      };
    } catch (error) {
      console.error('Erro ao buscar dados do gráfico:', error);
      return {
        labels: ['Erro'],
        datasets: [{
          label: 'Dados indisponíveis',
          data: [1],
          backgroundColor: ['#6b7280']
        }]
      };
    }
  }

  // Dados para gráfico de materiais por status
  async obterDadosGraficoMateriais(): Promise<DadosGrafico> {
    try {
      const response = await axiosInstance.get('/api/materiais');
      const materiais: Material[] = response.data;

      const statusCount = {
        'Funcionando': materiais.filter(m => m.status === StatusMaterial.FUNCIONANDO).length,
        'Defeito': materiais.filter(m => m.status === StatusMaterial.DEFEITO).length,
        'Em Reparo': materiais.filter(m => m.status === StatusMaterial.EM_REPARO).length,
        'Sem Conserto': materiais.filter(m => m.status === StatusMaterial.SEM_CONSERTO).length,
        'Em Estoque': materiais.filter(m => m.status === StatusMaterial.EM_ESTOQUE).length,
      };

      return {
        labels: Object.keys(statusCount),
        datasets: [{
          label: 'Materiais por Status',
          data: Object.values(statusCount),
          backgroundColor: ['#10b981', '#ef4444', '#f59e0b', '#6b7280', '#8b5cf6']
        }]
      };
    } catch (error) {
      console.error('Erro ao buscar dados do gráfico de materiais:', error);
      return {
        labels: ['Erro'],
        datasets: [{
          label: 'Dados indisponíveis',
          data: [1],
          backgroundColor: ['#6b7280']
        }]
      };
    }
  }

  // Dados para gráfico de manutenções no tempo
  async obterDadosGraficoManutencoes(): Promise<DadosGrafico> {
    try {
      const response = await axiosInstance.get('/api/manutencoes');
      const manutencoes: Manutencao[] = response.data;

      // Agrupar por mês
      const mesesCount: { [key: string]: number } = {};
      
      manutencoes.forEach(m => {
        const data = new Date(m.dataAbertura);
        const mes = data.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
        mesesCount[mes] = (mesesCount[mes] || 0) + 1;
      });

      // Pegar últimos 6 meses
      const meses = Object.keys(mesesCount).slice(-6);
      const valores = meses.map(mes => mesesCount[mes] || 0);

      return {
        labels: meses,
        datasets: [{
          label: 'Manutenções por Mês',
          data: valores,
          backgroundColor: ['#8b5cf6']
        }]
      };
    } catch (error) {
      console.error('Erro ao buscar dados do gráfico de manutenções:', error);
      return {
        labels: ['Erro'],
        datasets: [{
          label: 'Dados indisponíveis',
          data: [1],
          backgroundColor: ['#6b7280']
        }]
      };
    }
  }
}

export const dashboardDataService = new DashboardDataService();