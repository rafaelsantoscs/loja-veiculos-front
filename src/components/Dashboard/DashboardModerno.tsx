"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Wrench,
  Phone,
  Building2,
  AlertTriangle,
  Clock,
  Package,
  Activity,
  Eye,
  MoreVertical,
  RefreshCw
} from "lucide-react";
import { useTheme } from "next-themes";
import { getUserLocalStorage } from "@/store/userLocalStorage";
import dashboardService, { DashboardStats, DashboardServiceError } from "@/services/dashboardService";
import { useNotification } from "@/components/Notification";
import { useLoading, LoadingButton, LoadingSpinner } from "@/hooks/useLoading";
import Notification from "@/components/Notification";
import { SimpleBarChart, SimpleLineChart, SimplePieChart } from "@/components/Charts/SimpleCharts";

// Interfaces para tipagem
interface StatCard {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  trend: number;
  color: string;
  bgGradient: string;
  route?: string;
}

interface QuickAction {
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  route: string;
  color: string;
  bgColor: string;
}

const DashboardModerno: React.FC = () => {
  const { theme } = useTheme();
  const router = useRouter();
  const user = getUserLocalStorage() || {};
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Hooks para loading e notificações
  const { isLoading, executeWithLoading } = useLoading();
  const { 
    notifications, 
    removeNotification, 
    showSuccess, 
    showError, 
    showInfo 
  } = useNotification();

  // Carregar dados do dashboard
  const carregarDados = async () => {
    await executeWithLoading('carregarDados', async () => {
      try {
        const dadosStats = await dashboardService.obterEstatisticas();
        setStats(dadosStats);
        setLastUpdate(new Date());
        
        return dadosStats;
      } catch (error) {
        if (error instanceof DashboardServiceError) {
          showError('Erro ao carregar dados', error.message);
        } else {
          showError('Erro inesperado', 'Não foi possível carregar os dados do dashboard');
        }
        throw error;
      }
    });
  };

  // Atualizar dados
  const atualizarDados = async () => {
    await carregarDados();
    showSuccess('Dados atualizados', 'Dashboard atualizado com sucesso!');
  };

  useEffect(() => {
    carregarDados();
  }, []);

  // Alterar período
  const alterarPeriodo = async (novoPeriodo: typeof selectedPeriod) => {
    setSelectedPeriod(novoPeriodo);
    await carregarDados();
    showInfo('Dados atualizados', `Período alterado para ${novoPeriodo === '7d' ? '7 dias' : novoPeriodo === '30d' ? '30 dias' : novoPeriodo === '90d' ? '90 dias' : '1 ano'}`);
  };

  // Cards principais do dashboard
  const statCards: StatCard[] = stats ? [
    {
      title: "Chamados",
      value: stats.chamados.total.toLocaleString(),
      subtitle: `${stats.chamados.abertos} abertos • ${stats.chamados.finalizados} finalizados`,
      icon: Phone,
      trend: stats.chamados.crescimento,
      color: "text-blue-500",
      bgGradient: "from-blue-500/20 to-blue-600/10",
      route: "/formularios/chamados/listar-chamados"
    },
    {
      title: "Materiais",
      value: stats.materiais.total.toLocaleString(),
      subtitle: `${stats.materiais.funcionando} funcionando • ${stats.materiais.manutencao} em manutenção`,
      icon: Package,
      trend: stats.materiais.crescimento,
      color: "text-green-500",
      bgGradient: "from-green-500/20 to-green-600/10",
      route: "/formularios/materiais/listar-materiais"
    },
    {
      title: "Manutenções",
      value: stats.manutencao.total.toLocaleString(),
      subtitle: `${stats.manutencao.abertas} abertas • ${stats.manutencao.atrasadas} atrasadas`,
      icon: Wrench,
      trend: stats.manutencao.crescimento,
      color: "text-orange-500",
      bgGradient: "from-orange-500/20 to-orange-600/10",
      route: "/formularios/manutencao/abertas"
    },
    {
      title: "Unidades",
      value: stats.unidades.total.toLocaleString(),
      subtitle: `${stats.unidades.setores} setores • ${stats.unidades.ocupacao}% ocupação`,
      icon: Building2,
      trend: stats.unidades.crescimento,
      color: "text-purple-500",
      bgGradient: "from-purple-500/20 to-purple-600/10",
      route: "/formularios/unidades/listar-unidades"
    }
  ] : [];

  // Ações rápidas
  const quickActions: QuickAction[] = [
    {
      title: "Novo Chamado",
      description: "Abrir novo chamado de suporte",
      icon: Phone,
      route: "/formularios/chamados",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10 hover:bg-blue-500/20"
    },
    {
      title: "Cadastrar Material",
      description: "Adicionar novo material ao inventário",
      icon: Package,
      route: "/formularios/materiais",
      color: "text-green-500",
      bgColor: "bg-green-500/10 hover:bg-green-500/20"
    },
    {
      title: "Iniciar Manutenção",
      description: "Abrir nova ordem de manutenção",
      icon: Wrench,
      route: "/formularios/manutencao",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10 hover:bg-orange-500/20"
    },
    {
      title: "Nova Unidade",
      description: "Cadastrar unidade ou setor",
      icon: Building2,
      route: "/formularios/cadastrar-unidade",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10 hover:bg-purple-500/20"
    }
  ];

  // Loading state
  if (isLoading('carregarDados') && !stats) {
    return (
      <div className={`min-h-screen w-full flex items-center justify-center ${
        theme === 'dark' 
          ? 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black' 
          : 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-50 via-white to-slate-100'
      }`}>
        <div className="text-center">
          <LoadingSpinner size="lg" color="text-indigo-500" className="mx-auto mb-4" />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}
          >
            Carregando dashboard...
          </motion.p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen w-full ${
      theme === 'dark' 
        ? 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-white' 
        : 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-50 via-white to-slate-100 text-slate-900'
    }`}>
      {/* Header */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 pt-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
        >
          <div>
            <h1 className={`text-3xl font-bold bg-gradient-to-r ${
              theme === 'dark' 
                ? 'from-white via-slate-200 to-slate-400' 
                : 'from-slate-900 via-slate-700 to-slate-500'
            } bg-clip-text text-transparent`}>
              Dashboard
            </h1>
            <p className={`mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              Bem-vindo, {user.nomeCompleto || user.username || user.email || 'Usuário'}! Aqui está o resumo do sistema.
            </p>
          </div>
          
          {/* Seletor de período */}
          <div className="flex items-center gap-2">
            <LoadingButton
              onClick={atualizarDados}
              isLoading={isLoading('carregarDados')}
              variant="secondary"
              size="sm"
              className="mr-2"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Atualizar
            </LoadingButton>
            
            <select
              value={selectedPeriod}
              onChange={(e) => alterarPeriodo(e.target.value as typeof selectedPeriod)}
              className={`px-4 py-2 rounded-xl border focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all ${
                theme === 'dark' 
                  ? 'bg-slate-800/50 border-slate-700 text-slate-200' 
                  : 'bg-white/80 border-slate-300 text-slate-700'
              }`}
            >
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Últimos 30 dias</option>
              <option value="90d">Últimos 90 dias</option>
              <option value="1y">Último ano</option>
            </select>
          </div>
        </motion.div>

        {/* Cards de estatísticas principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          {statCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
              className={`relative overflow-hidden rounded-2xl border backdrop-blur-md p-6 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer group ${
                theme === 'dark' 
                  ? `border-slate-800/60 bg-gradient-to-br ${card.bgGradient}` 
                  : `border-slate-200/60 bg-gradient-to-br from-white/80 to-slate-50/80`
              }`}
              onClick={() => card.route && router.push(card.route)}
            >
              {/* Background pattern */}
              <div className="absolute inset-0 bg-[url('/images/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0.6))]"></div>
              
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${card.color} bg-white/10`}>
                    <card.icon className="w-6 h-6" />
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
                    card.trend >= 0 
                      ? 'text-green-400 bg-green-500/20' 
                      : 'text-red-400 bg-red-500/20'
                  }`}>
                    {card.trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {Math.abs(card.trend)}%
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{card.title}</h3>
                  <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{card.value}</p>
                  <p className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>{card.subtitle}</p>
                </div>

                {/* Hover effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Seção de ações rápidas e gráficos */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          {/* Ações Rápidas */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="xl:col-span-1"
          >
            <div className={`rounded-2xl border backdrop-blur-md p-6 ${
              theme === 'dark' 
                ? 'border-slate-800/60 bg-slate-900/40' 
                : 'border-slate-200/60 bg-white/60'
            }`}>
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-2 rounded-lg ${
                  theme === 'dark' ? 'bg-indigo-500/20' : 'bg-indigo-100'
                }`}>
                  <Activity className={`w-5 h-5 ${
                    theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'
                  }`} />
                </div>
                <h3 className={`text-lg font-semibold ${
                  theme === 'dark' ? 'text-white' : 'text-slate-900'
                }`}>Ações Rápidas</h3>
              </div>
              
              <div className="space-y-3">
                {quickActions.map((action, index) => (
                  <motion.button
                    key={action.title}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    whileHover={{ x: 4 }}
                    onClick={() => router.push(action.route)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 group ${
                      theme === 'dark'
                        ? `${action.bgColor} border-slate-700/50`
                        : 'bg-white/80 hover:bg-slate-50 border-slate-200/50'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${action.color} bg-white/10`}>
                      <action.icon className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className={`text-sm font-medium ${
                        theme === 'dark' ? 'text-white' : 'text-slate-900'
                      }`}>{action.title}</p>
                      <p className={`text-xs ${
                        theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                      }`}>{action.description}</p>
                    </div>
                    <Eye className={`w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity ${
                      theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                    }`} />
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Resumo por Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="xl:col-span-2"
          >
            <div className={`rounded-2xl border backdrop-blur-md p-6 ${
              theme === 'dark' 
                ? 'border-slate-800/60 bg-slate-900/40' 
                : 'border-slate-200/60 bg-white/60'
            }`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    theme === 'dark' ? 'bg-emerald-500/20' : 'bg-emerald-100'
                  }`}>
                    <BarChart3 className={`w-5 h-5 ${
                      theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
                    }`} />
                  </div>
                  <h3 className={`text-lg font-semibold ${
                    theme === 'dark' ? 'text-white' : 'text-slate-900'
                  }`}>Resumo por Status</h3>
                </div>
                <button className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark' ? 'hover:bg-slate-800/50' : 'hover:bg-slate-100'
                }`}>
                  <MoreVertical className={`w-4 h-4 ${
                    theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                  }`} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Chamados */}
                <div className="space-y-4">
                  <h4 className={`text-sm font-medium flex items-center gap-2 ${
                    theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    <Phone className="w-4 h-4 text-blue-400" />
                    Chamados
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Em Andamento</span>
                      <span className="text-sm font-medium text-yellow-400">{stats?.chamados.emAndamento || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Pendentes</span>
                      <span className="text-sm font-medium text-orange-400">{stats?.chamados.pendentes || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Fechados</span>
                      <span className="text-sm font-medium text-green-400">{stats?.chamados.fechados || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Finalizados</span>
                      <span className="text-sm font-medium text-blue-400">{stats?.chamados.finalizados || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Materiais */}
                <div className="space-y-4">
                  <h4 className={`text-sm font-medium flex items-center gap-2 ${
                    theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    <Package className="w-4 h-4 text-green-400" />
                    Materiais
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Funcionando</span>
                      <span className="text-sm font-medium text-green-400">{stats?.materiais.funcionando || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Manutenção</span>
                      <span className="text-sm font-medium text-yellow-400">{stats?.materiais.manutencao || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Quebrados</span>
                      <span className="text-sm font-medium text-red-400">{stats?.materiais.quebrado || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Em Estoque</span>
                      <span className="text-sm font-medium text-purple-400">{stats?.materiais.estoque || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Alertas e Notificações */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className={`rounded-2xl border backdrop-blur-md p-6 mb-8 ${
            theme === 'dark' 
              ? 'border-slate-800/60 bg-slate-900/40' 
              : 'border-slate-200/60 bg-white/60'
          }`}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-2 rounded-lg ${
              theme === 'dark' ? 'bg-red-500/20' : 'bg-red-100'
            }`}>
              <AlertTriangle className={`w-5 h-5 ${
                theme === 'dark' ? 'text-red-400' : 'text-red-600'
              }`} />
            </div>
            <h3 className={`text-lg font-semibold ${
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            }`}>Alertas e Notificações</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <div>
                <p className="text-sm font-medium text-red-400">Manutenções Atrasadas</p>
                <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{stats?.manutencao.atrasadas || 0} itens precisam de atenção</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
              <Clock className="w-5 h-5 text-yellow-400" />
              <div>
                <p className="text-sm font-medium text-yellow-400">Chamados Pendentes</p>
                <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{stats?.chamados.pendentes || 0} aguardando resposta</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
              <Package className="w-5 h-5 text-orange-400" />
              <div>
                <p className="text-sm font-medium text-orange-400">Materiais em Manutenção</p>
                <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{stats?.materiais.manutencao || 0} itens indisponíveis</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Seção de Gráficos */}
        {stats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
            {/* Gráfico de Status dos Chamados */}
            <SimplePieChart
              title="Status dos Chamados"
              data={[
                // { label: "Abertos", value: stats.chamados.abertos, color: "#3b82f6" },
                { label: "Em Andamento", value: stats.chamados.emAndamento, color: "#f59e0b" },
                { label: "Fechados", value: stats.chamados.fechados, color: "#10b981" },
                { label: "Finalizados", value: stats.chamados.finalizados, color: "#6366f1" },
                { label: "Pendentes", value: stats.chamados.pendentes, color: "#ef4444" }
              ]}
            />

            {/* Gráfico de Status dos Materiais */}
            <SimpleBarChart
              title="Status dos Materiais"
              data={[
                { label: "Funcionando", value: stats.materiais.funcionando, color: "#10b981" },
                { label: "Manutenção", value: stats.materiais.manutencao, color: "#f59e0b" },
                { label: "Quebrado", value: stats.materiais.quebrado, color: "#ef4444" },
                // { label: "Disponível", value: stats.materiais.disponivel, color: "#6366f1" },
                { label: "Em Estoque", value: stats.materiais.estoque, color: "#8b5cf6" }
              ]}
            />

            {/* Gráfico de Tendência de Manutenções */}
            <SimpleLineChart
              title="Tendência de Manutenções"
              trend={stats.manutencao.crescimento > 0 ? 'up' : stats.manutencao.crescimento < 0 ? 'down' : 'stable'}
              data={[
                { date: "Jan", value: Math.max(0, stats.manutencao.total - 200) },
                { date: "Fev", value: Math.max(0, stats.manutencao.total - 150) },
                { date: "Mar", value: Math.max(0, stats.manutencao.total - 100) },
                { date: "Abr", value: Math.max(0, stats.manutencao.total - 50) },
                { date: "Mai", value: stats.manutencao.total }
              ]}
            />
          </div>
        )}

        {/* Footer Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center py-8"
        >
          <p className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-slate-600'}`}>
            Última atualização: {lastUpdate.toLocaleString('pt-BR')} • 
            Sistema de Gestão v2.0 • 
            {stats ? (stats.chamados.total + stats.materiais.total + stats.manutencao.total) : 0} registros totais
          </p>
        </motion.div>
      </div>

      {/* Notificações */}
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          type={notification.type}
          title={notification.title}
          message={notification.message}
          isVisible={true}
          onClose={() => removeNotification(notification.id)}
          duration={notification.duration}
        />
      ))}
    </div>
  );
};

export default DashboardModerno;