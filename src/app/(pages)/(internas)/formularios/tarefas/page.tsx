"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle2,
  AlertTriangle,
  Calendar,
  User,
  Filter,
  Search,
  X,
  Plus,
  BarChart3,
  Clock,
  Target,
  ListChecks,
  FileText,
  MessageSquare
} from "lucide-react";
import { useTheme } from "next-themes";

import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import DefaultLayout from '@/components/Layouts/DefaultLayout';
import { tarefaService } from '@/services/tarefaService';
import { Tarefa, StatusTarefa, PrioridadeTarefa } from '@/types';
import useAuth from '@/hooks/useAuth';

export default function TarefasPage() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string>('');
  const [filtroStatus, setFiltroStatus] = useState<StatusTarefa | 'TODAS'>('TODAS');
  const [showVisualizarModal, setShowVisualizarModal] = useState(false);
  const [tarefaSelecionada, setTarefaSelecionada] = useState<Tarefa | null>(null);
  
  // Estados para filtros
  const [filtros, setFiltros] = useState({
    prioridade: "",
    search: ""
  });
  
  // Estados para paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 9;

  // Cores dinâmicas baseadas no tema
  const colors = {
    background: theme === 'dark' 
      ? 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black'
      : 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-50 via-blue-50 to-indigo-100',
    
    text: {
      primary: theme === 'dark' ? 'text-slate-100' : 'text-slate-900',
      secondary: theme === 'dark' ? 'text-slate-400' : 'text-slate-600',
      muted: theme === 'dark' ? 'text-slate-500' : 'text-slate-400',
    },
    
    card: {
      background: theme === 'dark' ? 'bg-slate-900/40' : 'bg-white/80',
      border: theme === 'dark' ? 'border-slate-800/60' : 'border-slate-200/60',
      hover: theme === 'dark' ? 'hover:bg-slate-900/70' : 'hover:bg-white/90',
    },
    
    input: {
      background: theme === 'dark' ? 'bg-slate-800/50' : 'bg-white/50',
      border: theme === 'dark' ? 'border-slate-700' : 'border-slate-300',
      text: theme === 'dark' ? 'text-slate-100' : 'text-slate-900',
      placeholder: theme === 'dark' ? 'placeholder-slate-400' : 'placeholder-slate-500',
    }
  };

  const carregarTarefas = useCallback(async () => {
    if (!user?.email) return;
    
    try {
      setLoading(true);
      setErro('');
      let dados: Tarefa[];
      
      if (filtroStatus === 'TODAS') {
        dados = await tarefaService.buscarPorUsuario(user?.email || '');
      } else {
        dados = await tarefaService.buscarPorStatus(user?.email || '', filtroStatus);
      }
      
      setTarefas(dados.sort((a, b) => new Date(b.dataCriacao || 0).getTime() - new Date(a.dataCriacao || 0).getTime()));
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
      setErro('Erro ao carregar tarefas. Verifique se o backend está rodando.');
    } finally {
      setLoading(false);
    }
  }, [user?.email, filtroStatus]);

  useEffect(() => {
    setMounted(true);
    carregarTarefas();
  }, [carregarTarefas]);

  const abrirVisualizarModal = (tarefa: Tarefa) => {
    setTarefaSelecionada(tarefa);
    setShowVisualizarModal(true);
  };

  const fecharVisualizarModal = () => {
    setShowVisualizarModal(false);
    setTarefaSelecionada(null);
  };

  const toggleSubtarefa = async (tarefaId: number, subtarefaId: number, concluida: boolean) => {
    try {
      if (concluida) {
        await tarefaService.desmarcarSubtarefa(tarefaId, subtarefaId);
      } else {
        await tarefaService.marcarSubtarefa(tarefaId, subtarefaId, user?.email || '');
      }
      
      // Se estamos no modal, recarregar apenas a tarefa selecionada
      if (showVisualizarModal && tarefaSelecionada?.id === tarefaId) {
        const tarefaAtualizada = await tarefaService.buscarPorId(tarefaId);
        setTarefaSelecionada(tarefaAtualizada);
      }
      
      carregarTarefas();
    } catch (error) {
      console.error('Erro ao atualizar subtarefa:', error);
    }
  };

  const concluirTarefa = async (tarefaId: number) => {
    if (!confirm('Deseja marcar esta tarefa como concluída?')) return;
    
    try {
      await tarefaService.atualizarStatus(tarefaId, StatusTarefa.CONCLUIDA);
      alert('Tarefa concluída com sucesso!');
      fecharVisualizarModal();
      carregarTarefas();
    } catch (error) {
      console.error('Erro ao concluir tarefa:', error);
      alert('Erro ao concluir tarefa');
    }
  };

  const getPrioridadeBadge = (prioridade: PrioridadeTarefa) => {
    const cores = {
      BAIXA: theme === 'dark' 
        ? 'bg-gray-500/20 text-gray-400 border-gray-500/30' 
        : 'bg-gray-100 text-gray-800 border-gray-200',
      MEDIA: theme === 'dark' 
        ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' 
        : 'bg-blue-100 text-blue-800 border-blue-200',
      ALTA: theme === 'dark' 
        ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' 
        : 'bg-orange-100 text-orange-800 border-orange-200',
      URGENTE: theme === 'dark' 
        ? 'bg-red-500/20 text-red-400 border-red-500/30' 
        : 'bg-red-100 text-red-800 border-red-200'
    };
    return `px-3 py-1 rounded-full text-xs font-medium border ${cores[prioridade] || cores.MEDIA}`;
  };

  const getStatusBadge = (status: StatusTarefa) => {
    const cores = {
      PENDENTE: theme === 'dark' 
        ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' 
        : 'bg-yellow-100 text-yellow-800 border-yellow-200',
      EM_ANDAMENTO: theme === 'dark' 
        ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' 
        : 'bg-blue-100 text-blue-800 border-blue-200',
      CONCLUIDA: theme === 'dark' 
        ? 'bg-green-500/20 text-green-400 border-green-500/30' 
        : 'bg-green-100 text-green-800 border-green-200',
      CANCELADA: theme === 'dark' 
        ? 'bg-red-500/20 text-red-400 border-red-500/30' 
        : 'bg-red-100 text-red-800 border-red-200'
    };
    return `px-3 py-1 rounded-full text-xs font-medium border ${cores[status] || cores.PENDENTE}`;
  };

  const estaVencida = (tarefa: Tarefa) => {
    if (tarefa.status === 'CONCLUIDA' || tarefa.status === 'CANCELADA') return false;
    if (!tarefa.dataPrazo) return false;
    return new Date(tarefa.dataPrazo) < new Date();
  };

  const handleFiltroChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  // Filtrar tarefas
  const tarefasFiltradas = tarefas.filter(tarefa => {
    if (filtroStatus !== 'TODAS' && tarefa.status !== filtroStatus) {
      return false;
    }
    
    if (filtros.prioridade && tarefa.prioridade !== filtros.prioridade) {
      return false;
    }
    
    if (filtros.search && !tarefa.titulo.toLowerCase().includes(filtros.search.toLowerCase()) && 
        !tarefa.descricao?.toLowerCase().includes(filtros.search.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // Paginação
  const totalPaginas = Math.ceil(tarefasFiltradas.length / itensPorPagina);
  const indiceInicial = (paginaAtual - 1) * itensPorPagina;
  const indiceFinal = indiceInicial + itensPorPagina;
  const tarefasPaginadas = tarefasFiltradas.slice(indiceInicial, indiceFinal);

  // Resetar página ao mudar filtros
  useEffect(() => {
    setPaginaAtual(1);
  }, [filtroStatus, filtros]);

  // Estatísticas
  const estatisticas = {
    pendentes: tarefas.filter(t => t.status === StatusTarefa.PENDENTE).length,
    andamento: tarefas.filter(t => t.status === StatusTarefa.EM_ANDAMENTO).length,
    concluidas: tarefas.filter(t => t.status === StatusTarefa.CONCLUIDA).length,
    total: tarefas.length,
    vencidas: tarefas.filter(t => estaVencida(t)).length
  };

  if (!mounted || loading) {
    return (
      <DefaultLayout>
        <div className={`min-h-dvh w-full ${colors.background} flex items-center justify-center`}>
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`animate-spin rounded-full h-12 w-12 border-b-2 ${
                theme === 'dark' ? 'border-blue-500' : 'border-blue-600'
              } mx-auto mb-4`}
            />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={colors.text.secondary}
            >
              {loading ? 'Carregando tarefas...' : 'Iniciando aplicação...'}
            </motion.p>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className={`relative min-h-dvh w-full overflow-hidden ${colors.background} ${colors.text.primary}`}>
        {/* Background effects */}
        {theme === 'dark' && (
          <>
            <div className="pointer-events-none absolute inset-0 opacity-50 [background:repeating-linear-gradient(0deg,rgba(255,255,255,.03)_0px,rgba(255,255,255,.03)_1px,transparent_1px,transparent_3px)]" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1000px_300px_at_50%_-20%,rgba(59,130,246,.25),transparent)]" />
          </>
        )}
        {theme === 'light' && (
          <>
            <div className="pointer-events-none absolute inset-0 opacity-30 [background:repeating-linear-gradient(0deg,rgba(0,0,0,.02)_0px,rgba(0,0,0,.02)_1px,transparent_1px,transparent_3px)]" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1000px_300px_at_50%_-20%,rgba(59,130,246,.15),transparent)]" />
          </>
        )}

        {/* Header simplificado */}
        <div className="relative z-10 flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${
              theme === 'dark' 
                ? 'bg-blue-500/20 ring-1 ring-blue-400/30' 
                : 'bg-blue-500/15 ring-1 ring-blue-400/20'
            }`}>
              <Target className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <p className={`text-xs/4 ${colors.text.secondary}`}>Sistema</p>
              <h1 className="font-semibold tracking-wide">Minhas Tarefas</h1>
            </div>
          </div>
        </div>

        {/* Conteúdo principal */}
        <main className="relative z-10 mx-auto max-w-7xl px-6 pb-24">
          {/* Hero */}
          <section className="mx-auto max-w-6xl pt-6">
            <motion.h2
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-3 text-3xl font-semibold md:text-4xl text-center"
            >
              Gestão de Tarefas
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.6 }}
              className={`mx-auto max-w-2xl text-sm md:text-base text-center ${colors.text.secondary}`}
            >
              Organize e acompanhe todas as suas tarefas e atividades
            </motion.p>
          </section>

          {/* Estatísticas */}
          <section className="mt-8 mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-5 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`rounded-2xl border ${
                theme === 'dark' 
                  ? 'border-blue-500/30 bg-blue-500/10 hover:border-blue-400/50' 
                  : 'border-blue-400/30 bg-blue-50/80 hover:border-blue-300/50'
              } p-6 backdrop-blur group transition-colors`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm mb-2 ${
                    theme === 'dark' ? 'text-blue-300' : 'text-blue-600'
                  }`}>Total</p>
                  <p className="text-3xl font-bold">{estatisticas.total}</p>
                </div>
                <div className={`p-3 rounded-xl ${
                  theme === 'dark' 
                    ? 'bg-blue-500/20 ring-1 ring-blue-400/30' 
                    : 'bg-blue-500/15 ring-1 ring-blue-400/20'
                }`}>
                  <BarChart3 className={`h-6 w-6 ${
                    theme === 'dark' ? 'text-blue-400' : 'text-blue-500'
                  }`} />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`rounded-2xl border ${
                theme === 'dark' 
                  ? 'border-yellow-500/30 bg-yellow-500/10 hover:border-yellow-400/50' 
                  : 'border-yellow-400/30 bg-yellow-50/80 hover:border-yellow-300/50'
              } p-6 backdrop-blur group transition-colors`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm mb-2 ${
                    theme === 'dark' ? 'text-yellow-300' : 'text-yellow-600'
                  }`}>Pendentes</p>
                  <p className="text-3xl font-bold">{estatisticas.pendentes}</p>
                </div>
                <div className={`p-3 rounded-xl ${
                  theme === 'dark' 
                    ? 'bg-yellow-500/20 ring-1 ring-yellow-400/30' 
                    : 'bg-yellow-500/15 ring-1 ring-yellow-400/20'
                }`}>
                  <AlertTriangle className={`h-6 w-6 ${
                    theme === 'dark' ? 'text-yellow-400' : 'text-yellow-500'
                  }`} />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className={`rounded-2xl border ${
                theme === 'dark' 
                  ? 'border-blue-500/30 bg-blue-500/10 hover:border-blue-400/50' 
                  : 'border-blue-400/30 bg-blue-50/80 hover:border-blue-300/50'
              } p-6 backdrop-blur group transition-colors`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm mb-2 ${
                    theme === 'dark' ? 'text-blue-300' : 'text-blue-600'
                  }`}>Em Andamento</p>
                  <p className="text-3xl font-bold">{estatisticas.andamento}</p>
                </div>
                <div className={`p-3 rounded-xl ${
                  theme === 'dark' 
                    ? 'bg-blue-500/20 ring-1 ring-blue-400/30' 
                    : 'bg-blue-500/15 ring-1 ring-blue-400/20'
                }`}>
                  <Clock className={`h-6 w-6 ${
                    theme === 'dark' ? 'text-blue-400' : 'text-blue-500'
                  }`} />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className={`rounded-2xl border ${
                theme === 'dark' 
                  ? 'border-green-500/30 bg-green-500/10 hover:border-green-400/50' 
                  : 'border-green-400/30 bg-green-50/80 hover:border-green-300/50'
              } p-6 backdrop-blur group transition-colors`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm mb-2 ${
                    theme === 'dark' ? 'text-green-300' : 'text-green-600'
                  }`}>Concluídas</p>
                  <p className="text-3xl font-bold">{estatisticas.concluidas}</p>
                </div>
                <div className={`p-3 rounded-xl ${
                  theme === 'dark' 
                    ? 'bg-green-500/20 ring-1 ring-green-400/30' 
                    : 'bg-green-500/15 ring-1 ring-green-400/20'
                }`}>
                  <CheckCircle2 className={`h-6 w-6 ${
                    theme === 'dark' ? 'text-green-400' : 'text-green-500'
                  }`} />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className={`rounded-2xl border ${
                theme === 'dark' 
                  ? 'border-red-500/30 bg-red-500/10 hover:border-red-400/50' 
                  : 'border-red-400/30 bg-red-50/80 hover:border-red-300/50'
              } p-6 backdrop-blur group transition-colors`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm mb-2 ${
                    theme === 'dark' ? 'text-red-300' : 'text-red-600'
                  }`}>Vencidas</p>
                  <p className="text-3xl font-bold">{estatisticas.vencidas}</p>
                </div>
                <div className={`p-3 rounded-xl ${
                  theme === 'dark' 
                    ? 'bg-red-500/20 ring-1 ring-red-400/30' 
                    : 'bg-red-500/15 ring-1 ring-red-400/20'
                }`}>
                  <Clock className={`h-6 w-6 ${
                    theme === 'dark' ? 'text-red-400' : 'text-red-500'
                  }`} />
                </div>
              </div>
            </motion.div>
          </section>

          {/* Abas de Status */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-8 mx-auto max-w-6xl"
          >
            <div className={`rounded-2xl border ${
              theme === 'dark' 
                ? 'border-slate-800/60 bg-slate-900/40' 
                : 'border-slate-200/60 bg-white/80'
            } p-1 backdrop-blur`}>
              <div className="flex">
                {[
                  { key: 'TODAS' as const, label: 'Todas', count: estatisticas.total, color: 'blue' },
                  { key: StatusTarefa.PENDENTE, label: 'Pendentes', count: estatisticas.pendentes, color: 'yellow' },
                  { key: StatusTarefa.EM_ANDAMENTO, label: 'Em Andamento', count: estatisticas.andamento, color: 'blue' },
                  { key: StatusTarefa.CONCLUIDA, label: 'Concluídas', count: estatisticas.concluidas, color: 'green' }
                ].map((aba) => (
                  <button
                    key={aba.key}
                    onClick={() => setFiltroStatus(aba.key)}
                    className={`flex-1 py-4 px-6 text-center font-medium transition-all rounded-xl ${
                      filtroStatus === aba.key
                        ? theme === 'dark'
                          ? `bg-${aba.color}-500 text-white shadow-lg`
                          : `bg-${aba.color}-500 text-white shadow-lg`
                        : `${colors.text.secondary} hover:${theme === 'dark' ? 'bg-slate-800/60' : 'bg-slate-100/80'}`
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span>{aba.label}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        filtroStatus === aba.key ? 'bg-white/20' : theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'
                      }`}>
                        {aba.count}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.section>

          {/* Filtros */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-6 mx-auto max-w-6xl"
          >
            <div className={`rounded-2xl border ${
              theme === 'dark' 
                ? 'border-slate-800/60 bg-slate-900/40 shadow-[0_0_0_1px_rgba(59,130,246,.2)]' 
                : 'border-slate-200/60 bg-white/80 shadow-[0_0_0_1px_rgba(59,130,246,.1)]'
            } p-6 backdrop-blur`}>
              <div className="flex items-center gap-3 mb-4">
                <Filter className={`h-5 w-5 ${
                  theme === 'dark' ? 'text-blue-400' : 'text-blue-500'
                }`} />
                <h3 className="text-lg font-semibold">Filtros</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${colors.text.primary}`}>Prioridade</label>
                  <select
                    name="prioridade"
                    className={`w-full pl-3 pr-4 py-2 rounded-xl border ${
                      colors.input.border
                    } ${
                      colors.input.background
                    } ${
                      colors.input.text
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all backdrop-blur`}
                    value={filtros.prioridade}
                    onChange={handleFiltroChange}
                  >
                    <option value="">Todas</option>
                    {Object.values(PrioridadeTarefa).map(prioridade => (
                      <option key={prioridade} value={prioridade}>{prioridade}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-2 ${colors.text.primary}`}>Buscar Tarefas</label>
                  <div className="relative">
                    <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${colors.text.muted}`} />
                    <input
                      type="text"
                      name="search"
                      className={`w-full pl-10 pr-4 py-2 rounded-xl border ${
                        colors.input.border
                      } ${
                        colors.input.background
                      } ${
                        colors.input.text
                      } ${
                        colors.input.placeholder
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all backdrop-blur`}
                      value={filtros.search}
                      onChange={handleFiltroChange}
                      placeholder="Buscar por título ou descrição..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Lista de Tarefas */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="mt-6 mx-auto max-w-6xl"
          >
            <div className={`rounded-2xl border ${
              theme === 'dark' 
                ? 'border-slate-800/60 bg-slate-900/40 shadow-[0_0_0_1px_rgba(59,130,246,.2)]' 
                : 'border-slate-200/60 bg-white/80 shadow-[0_0_0_1px_rgba(59,130,246,.1)]'
            } overflow-hidden backdrop-blur`}>
              
              {/* Header da Lista */}
              <div className="bg-gradient-to-r from-blue-800 to-blue-600 p-6 text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold">Minhas Tarefas</h2>
                    <p>{tarefasFiltradas.length} tarefas encontradas</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-white text-blue-600 px-4 py-2 rounded-xl font-medium hover:bg-blue-50 transition-all flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Nova Tarefa
                  </motion.button>
                </div>
              </div>

              {/* Grid de Tarefas */}
              <div className="p-6">
                {tarefasPaginadas.length === 0 ? (
                  <div className="text-center py-12">
                    <Target className={`h-16 w-16 ${
                      theme === 'dark' ? 'text-slate-600' : 'text-slate-400'
                    } mx-auto mb-4`} />
                    <h3 className={`text-lg font-semibold mb-2 ${
                      theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      Nenhuma tarefa encontrada
                    </h3>
                    <p className={colors.text.muted}>
                      {Object.values(filtros).some(f => f !== "") || filtroStatus !== 'TODAS'
                        ? "Tente ajustar os filtros aplicados" 
                        : "Não há tarefas para exibir"
                      }
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {tarefasPaginadas.map((tarefa, index) => (
                        <motion.div
                          key={tarefa.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          onClick={() => abrirVisualizarModal(tarefa)}
                          className={`rounded-2xl border ${
                            theme === 'dark' 
                              ? 'border-slate-700 hover:border-slate-600' 
                              : 'border-slate-200 hover:border-slate-300'
                          } ${
                            colors.card.background
                          } p-6 cursor-pointer transition-all duration-300 hover:shadow-lg backdrop-blur ${
                            estaVencida(tarefa) ? 'border-l-4 border-l-red-500' : ''
                          }`}
                        >
                          {/* Header da Tarefa */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                                {tarefa.titulo}
                              </h3>
                              <div className="flex flex-wrap gap-2">
                                <span className={getPrioridadeBadge(tarefa.prioridade)}>
                                  {tarefa.prioridade}
                                </span>
                                <span className={getStatusBadge(tarefa.status)}>
                                  {tarefa.status.replace('_', ' ')}
                                </span>
                                {estaVencida(tarefa) && (
                                  <span className="px-3 py-1 rounded-full text-xs font-medium border bg-red-500/20 text-red-400 border-red-500/30">
                                    VENCIDA
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Descrição */}
                          {tarefa.descricao && (
                            <p className={`text-sm mb-4 line-clamp-2 ${colors.text.secondary}`}>
                              {tarefa.descricao}
                            </p>
                          )}

                          {/* Progresso */}
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">Progresso</span>
                              <span className="text-sm font-bold text-blue-500">{tarefa.progresso}%</span>
                            </div>
                            <div className="h-2 w-full bg-gray-200 rounded-full dark:bg-gray-700">
                              <div
                                className="h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300"
                                style={{ width: `${tarefa.progresso}%` }}
                              />
                            </div>
                          </div>

                          {/* Informações */}
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-slate-400" />
                              <span className={colors.text.secondary}>
                                {tarefa.dataPrazo 
                                  ? new Date(tarefa.dataPrazo).toLocaleDateString('pt-BR')
                                  : 'Sem prazo'
                                }
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <ListChecks className="h-4 w-4 text-slate-400" />
                              <span className={colors.text.secondary}>
                                {tarefa.subtarefas.filter(s => s.concluida).length}/{tarefa.subtarefas.length} concluídas
                              </span>
                            </div>
                            {tarefa.atribuidoParaNome && (
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-slate-400" />
                                <span className={colors.text.secondary}>{tarefa.atribuidoParaNome}</span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Paginação */}
                    {tarefasFiltradas.length > itensPorPagina && (
                      <div className="flex items-center justify-between mt-6">
                        <div className={`text-sm ${colors.text.secondary}`}>
                          Mostrando {indiceInicial + 1} a {Math.min(indiceFinal, tarefasFiltradas.length)} de {tarefasFiltradas.length} tarefas
                        </div>
                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setPaginaAtual(prev => Math.max(1, prev - 1))}
                            disabled={paginaAtual === 1}
                            className={`px-4 py-2 rounded-xl transition-all ${
                              paginaAtual === 1
                                ? theme === 'dark' 
                                  ? 'bg-slate-800/30 text-slate-600 cursor-not-allowed' 
                                  : 'bg-slate-100/50 text-slate-400 cursor-not-allowed'
                                : theme === 'dark' 
                                  ? 'bg-slate-700 hover:bg-slate-600 text-slate-200' 
                                  : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                            }`}
                          >
                            Anterior
                          </motion.button>
                          
                          <div className="flex gap-1">
                            {Array.from({ length: totalPaginas }, (_, i) => i + 1)
                              .filter(pagina => {
                                return pagina === 1 || 
                                       pagina === totalPaginas || 
                                       (pagina >= paginaAtual - 1 && pagina <= paginaAtual + 1);
                              })
                              .map((pagina, idx, array) => {
                                const showEllipsis = idx > 0 && pagina - array[idx - 1] > 1;
                                return (
                                  <div key={pagina} className="flex items-center gap-1">
                                    {showEllipsis && (
                                      <span className={`px-2 ${colors.text.muted}`}>...</span>
                                    )}
                                    <motion.button
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={() => setPaginaAtual(pagina)}
                                      className={`px-4 py-2 rounded-xl transition-all ${
                                        paginaAtual === pagina
                                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                                          : theme === 'dark' 
                                            ? 'bg-slate-700 hover:bg-slate-600 text-slate-200' 
                                            : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                                      }`}
                                    >
                                      {pagina}
                                    </motion.button>
                                  </div>
                                );
                              })
                            }
                          </div>

                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setPaginaAtual(prev => Math.min(totalPaginas, prev + 1))}
                            disabled={paginaAtual === totalPaginas}
                            className={`px-4 py-2 rounded-xl transition-all ${
                              paginaAtual === totalPaginas
                                ? theme === 'dark' 
                                  ? 'bg-slate-800/30 text-slate-600 cursor-not-allowed' 
                                  : 'bg-slate-100/50 text-slate-400 cursor-not-allowed'
                                : theme === 'dark' 
                                  ? 'bg-slate-700 hover:bg-slate-600 text-slate-200' 
                                  : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                            }`}
                          >
                            Próxima
                          </motion.button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </motion.section>
        </main>

        {/* Modal de Visualização de Tarefa */}
        <AnimatePresence>
          {showVisualizarModal && tarefaSelecionada && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className={`w-full max-w-2xl rounded-2xl border ${
                  theme === 'dark' 
                    ? 'border-blue-500/30 bg-slate-900/80' 
                    : 'border-blue-400/30 bg-white/95'
                } backdrop-blur shadow-2xl max-h-[85vh] flex flex-col`}
              >
                {/* Header do Modal */}
                <div className="bg-gradient-to-r from-blue-800 to-blue-600 p-6 text-white">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-xl bg-white/20">
                          <Target className="h-6 w-6" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold">{tarefaSelecionada.titulo}</h2>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className={getPrioridadeBadge(tarefaSelecionada.prioridade)}>
                              {tarefaSelecionada.prioridade}
                            </span>
                            <span className={getStatusBadge(tarefaSelecionada.status)}>
                              {tarefaSelecionada.status.replace('_', ' ')}
                            </span>
                            {estaVencida(tarefaSelecionada) && (
                              <span className="px-3 py-1 rounded-full text-xs font-medium border bg-red-500/20 text-red-400 border-red-500/30">
                                VENCIDA
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={fecharVisualizarModal}
                      className="text-white hover:text-gray-200 transition-colors ml-4"
                    >
                      <X className="h-6 w-6" />
                    </motion.button>
                  </div>
                </div>

                {/* Conteúdo do Modal - Sem scroll interno, apenas no modal inteiro se necessário */}
                <div className="flex-1 overflow-y-auto">
                  <div className="p-6 space-y-6">
                    {/* Informações Básicas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-3">
                        <User className="h-4 w-4 text-slate-400" />
                        <div>
                          <p className={colors.text.secondary}>Criado por</p>
                          <p className={colors.text.primary}>
                            {tarefaSelecionada.criadoPorNome || tarefaSelecionada.criadoPor}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <User className="h-4 w-4 text-slate-400" />
                        <div>
                          <p className={colors.text.secondary}>Responsável</p>
                          <p className={colors.text.primary}>
                            {tarefaSelecionada.atribuidoParaNome || tarefaSelecionada.atribuidoPara}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <div>
                          <p className={colors.text.secondary}>Data Criação</p>
                          <p className={colors.text.primary}>
                            {tarefaSelecionada.dataCriacao 
                              ? new Date(tarefaSelecionada.dataCriacao).toLocaleString('pt-BR')
                              : 'N/A'
                            }
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-slate-400" />
                        <div>
                          <p className={colors.text.secondary}>Prazo</p>
                          <p className={`${estaVencida(tarefaSelecionada) ? 'text-red-500' : colors.text.primary}`}>
                            {tarefaSelecionada.dataPrazo 
                              ? new Date(tarefaSelecionada.dataPrazo).toLocaleString('pt-BR')
                              : 'Não definido'
                            }
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Descrição */}
                    {tarefaSelecionada.descricao && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <FileText className="h-4 w-4 text-slate-400" />
                          <h3 className="font-semibold">Descrição</h3>
                        </div>
                        <p className={`bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl ${colors.text.primary} whitespace-pre-wrap`}>
                          {tarefaSelecionada.descricao}
                        </p>
                      </div>
                    )}

                    {/* Observações */}
                    {tarefaSelecionada.observacoes && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <MessageSquare className="h-4 w-4 text-yellow-500" />
                          <h3 className="font-semibold">Observações</h3>
                        </div>
                        <p className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl text-yellow-800 dark:text-yellow-300 whitespace-pre-wrap">
                          {tarefaSelecionada.observacoes}
                        </p>
                      </div>
                    )}

                    {/* Progresso */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-blue-500" />
                          Progresso Geral
                        </h3>
                        <span className="text-lg font-bold text-blue-500">{tarefaSelecionada.progresso}%</span>
                      </div>
                      <div className="h-3 w-full bg-gray-200 rounded-full dark:bg-gray-700">
                        <div
                          className="h-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300"
                          style={{ width: `${tarefaSelecionada.progresso}%` }}
                        />
                      </div>
                    </div>

                    {/* Subtarefas */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold flex items-center gap-2">
                          <ListChecks className="h-4 w-4 text-green-500" />
                          Subtarefas
                        </h3>
                        <span className={`text-sm ${colors.text.secondary}`}>
                          {tarefaSelecionada.subtarefas.filter(s => s.concluida).length}/{tarefaSelecionada.subtarefas.length} concluídas
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        {tarefaSelecionada.subtarefas.map((subtarefa) => (
                          <motion.label
                            key={subtarefa.id}
                            whileHover={{ scale: 1.01 }}
                            className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                              subtarefa.concluida
                                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/80'
                            }`}
                          >
                            <div className="relative mt-1">
                              <input
                                type="checkbox"
                                checked={subtarefa.concluida}
                                onChange={() => toggleSubtarefa(tarefaSelecionada.id!, subtarefa.id!, subtarefa.concluida)}
                                className="peer h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                disabled={tarefaSelecionada.status === 'CONCLUIDA' || tarefaSelecionada.status === 'CANCELADA'}
                              />
                              {subtarefa.concluida && (
                                <svg
                                  className="absolute top-0.5 left-0.5 h-4 w-4 text-white pointer-events-none"
                                  fill="currentColor"
                                  viewBox="0 0 12 12"
                                >
                                  <path d="M10 3L4.5 8.5 2 6" stroke="currentColor" strokeWidth={2} fill="none" />
                                </svg>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className={`font-medium ${subtarefa.concluida ? 'line-through text-gray-500 dark:text-gray-400' : 'text-black dark:text-white'}`}>
                                {subtarefa.titulo}
                              </div>
                              {subtarefa.descricao && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  {subtarefa.descricao}
                                </p>
                              )}
                              {subtarefa.concluida && subtarefa.dataConclusao && (
                                <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                                  ✓ Concluída em {new Date(subtarefa.dataConclusao).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                  {subtarefa.concluidaPor && ` por ${subtarefa.concluidaPor}`}
                                </p>
                              )}
                            </div>
                          </motion.label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer do Modal */}
                <div className="border-t border-slate-200 dark:border-slate-700 p-6">
                  {tarefaSelecionada.progresso === 100 && tarefaSelecionada.status !== 'CONCLUIDA' && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => concluirTarefa(tarefaSelecionada.id!)}
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="h-5 w-5" />
                      Concluir Tarefa
                    </motion.button>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Rodapé */}
        <footer className={`relative z-10 mx-auto max-w-7xl px-6 pb-8 pt-6 text-center text-xs ${
          theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
        }`}>
          © {new Date().getFullYear()} – Sistema de Gestão de Tarefas. Desenvolvido com Next.js e Tailwind.
        </footer>
      </div>
    </DefaultLayout>
  );
}