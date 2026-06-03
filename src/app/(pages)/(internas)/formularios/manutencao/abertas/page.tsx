"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Check, 
  AlertTriangle, 
  Sun, 
  Moon,
  ArrowLeft,
  ExternalLink,
  Save,
  Wrench,
  Clock,
  User,
  MapPin,
  Calendar,
  CheckCircle2,
  Package,
  Phone
} from "lucide-react";
import { useTheme } from "next-themes";

import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { getUserLocalStorage } from "@/store/userLocalStorage";
import axiosInstance from "@/services/axiosInstance";
import { Material, Manutencao, StatusMaterial, Unidade, Setor, Chamado } from "@/types";

// Componente do Botão de Tema
function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-xl bg-slate-200/60 animate-pulse" />
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      className={`
        relative flex items-center justify-center w-10 h-10 rounded-xl
        transition-all duration-300
        ${theme === 'dark' 
          ? 'bg-slate-800/60 ring-1 ring-slate-700/30 hover:bg-slate-700/60 text-yellow-400' 
          : 'bg-slate-200/60 ring-1 ring-slate-300/30 hover:bg-slate-300/60 text-orange-500'
        }
      `}
      title={theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
    >
      <motion.div
        initial={false}
        animate={{ 
          rotate: theme === 'dark' ? 0 : 180,
          scale: theme === 'dark' ? 1 : 0.8 
        }}
        transition={{ duration: 0.3 }}
      >
        {theme === 'dark' ? (
          <Sun className="w-5 h-5" />
        ) : (
          <Moon className="w-5 h-5" />
        )}
      </motion.div>
    </motion.button>
  );
}

const ManutencaoAbertasPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme } = useTheme();
  const user = getUserLocalStorage() || {};
  const [mounted, setMounted] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState<'abertas' | 'fechadas'>('abertas');
  const [manutencoes, setManutencoes] = useState<Manutencao[]>([]);
  const [manutencoesFechadas, setManutencoesFechadas] = useState<Manutencao[]>([]);
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [setores, setSetores] = useState<Setor[]>([]);
  const [loading, setLoading] = useState(true);
  const [manutencaoSelecionada, setManutencaoSelecionada] = useState<Manutencao | null>(null);
  const [descricaoSolucao, setDescricaoSolucao] = useState("");
  const [showModal, setShowModal] = useState(false);
  
  // Novos estados para o modal de gerenciamento
  const [showModalGerenciamento, setShowModalGerenciamento] = useState(false);
  const [statusMaterialSelecionado, setStatusMaterialSelecionado] = useState<StatusMaterial>(StatusMaterial.EM_REPARO);
  const [observacoes, setObservacoes] = useState("");
  
  // Estado para o chamado vinculado
  const [chamadoVinculado, setChamadoVinculado] = useState<Chamado | null>(null);
  
  // Novos estados para o modal de visualização de manutenções fechadas
  const [showModalVisualizacao, setShowModalVisualizacao] = useState(false);
  const [manutencaoVisualizacao, setManutencaoVisualizacao] = useState<Manutencao | null>(null);
  const [materialVisualizacao, setMaterialVisualizacao] = useState<Material | null>(null);
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Estados para paginação
  const [paginaAtualAbertas, setPaginaAtualAbertas] = useState(1);
  const [paginaAtualFechadas, setPaginaAtualFechadas] = useState(1);
  const itensPorPagina = 10;

  // Cores dinâmicas baseadas no tema
  const colors = {
    background: theme === 'dark' 
      ? 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black'
      : 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-50 via-orange-50 to-amber-100',
    
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

  const getStatusColor = (status: StatusMaterial) => {
    switch (status) {
      case StatusMaterial.FUNCIONANDO: 
        return theme === 'dark' 
          ? 'bg-green-500/20 text-green-400 border-green-500/30' 
          : 'bg-green-100 text-green-800 border-green-200';
      case StatusMaterial.DEFEITO: 
        return theme === 'dark' 
          ? 'bg-red-500/20 text-red-400 border-red-500/30' 
          : 'bg-red-100 text-red-800 border-red-200';
      case StatusMaterial.EM_REPARO: 
        return theme === 'dark' 
          ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' 
          : 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case StatusMaterial.SEM_CONSERTO: 
        return theme === 'dark' 
          ? 'bg-gray-500/20 text-gray-400 border-gray-500/30' 
          : 'bg-gray-100 text-gray-800 border-gray-200';
      case StatusMaterial.EM_ESTOQUE: 
        return theme === 'dark' 
          ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' 
          : 'bg-blue-100 text-blue-800 border-blue-200';
      default: 
        return theme === 'dark' 
          ? 'bg-gray-500/20 text-gray-400 border-gray-500/30' 
          : 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  useEffect(() => {
    setMounted(true);
    carregarManutencoes();
    carregarMateriais();
    carregarUnidades();
    carregarSetores();
  }, []);

  // Efeito para abrir automaticamente uma manutenção específica via URL
  useEffect(() => {
    const openManutencaoId = searchParams.get('openManutencao');
    if (openManutencaoId && manutencoes.length > 0) {
      const manutencao = manutencoes.find(m => m.id === parseInt(openManutencaoId));
      if (manutencao) {
        abrirModalGerenciamento(manutencao);
      }
    }
  }, [manutencoes, searchParams]);

  const carregarManutencoes = async () => {
    try {
      const [abertasResponse, fechadasResponse] = await Promise.all([
        axiosInstance.get("/api/manutencoes/abertas"),
        axiosInstance.get("/api/manutencoes") // Buscar todas e filtrar fechadas
      ]);
      
      setManutencoes(abertasResponse.data);
      
      // Filtrar apenas as fechadas
      const todasManutencoes = fechadasResponse.data;
      const fechadas = todasManutencoes.filter((m: Manutencao) => m.status === 'FECHADA');
      setManutencoesFechadas(fechadas);
    } catch (error) {
      console.error("Erro ao carregar manutenções:", error);
      setError("Erro ao carregar manutenções");
    } finally {
      setLoading(false);
    }
  };

  const carregarMateriais = async () => {
    try {
      const response = await axiosInstance.get("/api/materiais");
      setMateriais(response.data);
    } catch (error) {
      console.error("Erro ao carregar materiais:", error);
    }
  };

  const carregarUnidades = async () => {
    try {
      const response = await axiosInstance.get("/api/unidades/listar-unidades");
      setUnidades(response.data);
    } catch (error) {
      console.error("Erro ao carregar unidades:", error);
    }
  };

  const carregarSetores = async () => {
    try {
      const response = await axiosInstance.get("/api/setores");
      setSetores(response.data);
    } catch (error) {
      console.error("Erro ao carregar setores:", error);
    }
  };

  const getMaterial = (materialId: number) => {
    return materiais.find(m => m.id === materialId);
  };

  const getUnidade = (unidadeId: number) => {
    return unidades.find(u => u.id === unidadeId);
  };

  const getSetor = (setorId: number) => {
    return setores.find(s => s.id === setorId);
  };

  const carregarChamadoVinculado = async (chamadoId: number) => {
    try {
      const response = await axiosInstance.get(`/api/chamados/${chamadoId}`);
      setChamadoVinculado(response.data);
    } catch (error) {
      console.error("Erro ao carregar chamado vinculado:", error);
      setChamadoVinculado(null);
    }
  };

  // Controlar scroll do body quando modal estiver aberto
  useEffect(() => {
    if (showModalGerenciamento || showModal || showModalVisualizacao) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup ao desmontar
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showModalGerenciamento, showModal, showModalVisualizacao]);

  const abrirModalGerenciamento = async (manutencao: Manutencao) => {
    const material = getMaterial(manutencao.materialId);
    setManutencaoSelecionada(manutencao);
    setStatusMaterialSelecionado(material?.status || StatusMaterial.EM_REPARO);
    setObservacoes("");
    
    // Carregar chamado vinculado se existir
    if (manutencao.chamadoId) {
      await carregarChamadoVinculado(manutencao.chamadoId);
    } else {
      setChamadoVinculado(null);
    }
    
    setShowModalGerenciamento(true);
  };

  const navegarParaChamado = () => {
    if (chamadoVinculado) {
      router.push(`/formularios/chamados/listar-chamados?openChamado=${chamadoVinculado.id}`);
    }
  };

  const fecharModalGerenciamento = () => {
    setShowModalGerenciamento(false);
    setManutencaoSelecionada(null);
    setObservacoes("");
    setStatusMaterialSelecionado(StatusMaterial.EM_REPARO);
    setError("");
  };

  const atualizarStatusMaterial = async () => {
    if (!manutencaoSelecionada) return;

    try {
      // Verificar se o material existe nos dados carregados
      const material = getMaterial(manutencaoSelecionada.materialId);
      
      if (!material) {
        setError('Material não encontrado nos dados carregados. Tente recarregar a página.');
        return;
      }

      // Verificar se o material tem unidade e setor válidos
      if (!material.unidadeId || !material.setorId) {
        setError('Material com dados incompletos (unidade/setor). Não é possível alterar o status.');
        return;
      }

      const dadosParaEnvio = {
        statusMaterial: statusMaterialSelecionado,
        statusChamado: null,
        parecerSuporte: observacoes.trim() || null
      };

      await axiosInstance.patch(`/api/materiais/${manutencaoSelecionada.materialId}/status`, dadosParaEnvio, {
        headers: { 
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json"
        }
      });

      setSuccess("Status do material atualizado com sucesso! A manutenção permanece aberta.");
      setTimeout(() => setSuccess(""), 3000);
      carregarMateriais();
      carregarManutencoes();
      fecharModalGerenciamento();
    } catch (error: unknown) {
      console.error("Erro ao atualizar status:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      setError(`Erro ao atualizar status do material: ${errorMessage}`);
    }
  };

  const finalizarManutencaoCompleta = async () => {
    if (!manutencaoSelecionada || !observacoes.trim()) {
      setError("Para finalizar a manutenção, é obrigatório adicionar observações sobre a solução aplicada.");
      return;
    }

    try {
      await axiosInstance.patch(`/api/manutencoes/${manutencaoSelecionada.id}/fechar`, {
        descricaoSolucao: observacoes
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      // Atualizar status do material
      await axiosInstance.patch(`/api/materiais/${manutencaoSelecionada.materialId}/status`, {
        statusMaterial: statusMaterialSelecionado
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      setSuccess("Manutenção finalizada com sucesso!");
      setTimeout(() => setSuccess(""), 3000);
      carregarMateriais();
      carregarManutencoes();
      fecharModalGerenciamento();
    } catch (error: unknown) {
      console.error("Erro ao finalizar manutenção:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      setError(`Erro ao finalizar manutenção: ${errorMessage}`);
    }
  };

  const fecharModal = () => {
    setShowModal(false);
    setManutencaoSelecionada(null);
    setDescricaoSolucao("");
    setError("");
  };

  const finalizarManutencao = async () => {
    if (!manutencaoSelecionada || !descricaoSolucao.trim()) {
      setError("Descreva a solução aplicada");
      return;
    }

    try {
      await axiosInstance.patch(`/api/manutencoes/${manutencaoSelecionada.id}/fechar`, {
        descricaoSolucao: descricaoSolucao
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      // Atualizar status do material baseado na solução
      const novoStatus = descricaoSolucao.toLowerCase().includes('consert') ? 
        StatusMaterial.FUNCIONANDO : StatusMaterial.SEM_CONSERTO;

      await axiosInstance.patch(`/api/materiais/${manutencaoSelecionada.materialId}/status`, {
        statusMaterial: novoStatus
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      fecharModal();
      carregarManutencoes();
      carregarMateriais();
      setSuccess("Manutenção finalizada com sucesso!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Erro ao finalizar manutenção:", error);
      setError("Erro ao finalizar manutenção.");
    }
  };

  // Funções para o modal de visualização
  const abrirModalVisualizacao = async (manutencao: Manutencao) => {
    setManutencaoVisualizacao(manutencao);
    const material = getMaterial(manutencao.materialId);
    setMaterialVisualizacao(material || null);
    
    // Buscar chamado vinculado se existir
    if (manutencao.chamadoId) {
      try {
        const response = await axiosInstance.get(`/api/chamados/${manutencao.chamadoId}`);
        setChamadoVinculado(response.data);
      } catch (error) {
        console.error("Erro ao carregar chamado vinculado:", error);
        setChamadoVinculado(null);
      }
    } else {
      setChamadoVinculado(null);
    }
    
    setShowModalVisualizacao(true);
  };

  const fecharModalVisualizacao = () => {
    setShowModalVisualizacao(false);
    setManutencaoVisualizacao(null);
    setMaterialVisualizacao(null);
    setChamadoVinculado(null);
  };

  const irParaChamado = () => {
    if (chamadoVinculado) {
      router.push(`/formularios/chamados/listar-chamados?openChamado=${chamadoVinculado.id}`);
    }
  };

  // Ordenar manutenções por data de abertura DESC (mais recentes primeiro)
  const manutencoesOrdenadas = [...manutencoes].sort((a, b) => 
    new Date(b.dataAbertura).getTime() - new Date(a.dataAbertura).getTime()
  );
  const manutencoesOrdenadasFechadas = [...manutencoesFechadas].sort((a, b) => 
    new Date(b.dataAbertura).getTime() - new Date(a.dataAbertura).getTime()
  );

  // Paginação para manutenções abertas
  const totalPaginasAbertas = Math.ceil(manutencoesOrdenadas.length / itensPorPagina);
  const indiceInicialAbertas = (paginaAtualAbertas - 1) * itensPorPagina;
  const indiceFinalAbertas = indiceInicialAbertas + itensPorPagina;
  const manutencoesPaginadasAbertas = manutencoesOrdenadas.slice(indiceInicialAbertas, indiceFinalAbertas);

  // Paginação para manutenções fechadas
  const totalPaginasFechadas = Math.ceil(manutencoesOrdenadasFechadas.length / itensPorPagina);
  const indiceInicialFechadas = (paginaAtualFechadas - 1) * itensPorPagina;
  const indiceFinalFechadas = indiceInicialFechadas + itensPorPagina;
  const manutencoesPaginadasFechadas = manutencoesOrdenadasFechadas.slice(indiceInicialFechadas, indiceFinalFechadas);

  // Resetar página ao trocar de aba
  useEffect(() => {
    setPaginaAtualAbertas(1);
    setPaginaAtualFechadas(1);
  }, [abaAtiva]);

  // Loading state ou aguardando hydratação
  if (loading || !mounted) {
    return (
      <DefaultLayout>
        <div className={`min-h-dvh w-full ${mounted ? colors.background : 'bg-slate-50'} flex items-center justify-center`}>
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`animate-spin rounded-full h-12 w-12 border-b-2 ${
                mounted && theme === 'dark' ? 'border-orange-500' : 'border-orange-600'
              } mx-auto mb-4`}
            />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={mounted ? colors.text.secondary : 'text-slate-600'}
            >
              {loading ? 'Carregando manutenções abertas...' : 'Iniciando aplicação...'}
            </motion.p>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  // Estatísticas
  const manutencoesComChamado = manutencoes.filter(m => m.chamadoId).length;
  const manutencoesSemChamado = manutencoes.filter(m => !m.chamadoId).length;

  return (
    <DefaultLayout>
      <div className={`relative min-h-dvh w-full overflow-hidden ${colors.background} ${colors.text.primary}`}>
        {/* Background effects condicionais */}
        {theme === 'dark' && (
          <>
            <div className="pointer-events-none absolute inset-0 opacity-50 [background:repeating-linear-gradient(0deg,rgba(255,255,255,.03)_0px,rgba(255,255,255,.03)_1px,transparent_1px,transparent_3px)]" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1000px_300px_at_50%_-20%,rgba(249,115,22,.25),transparent)]" />
          </>
        )}
        {theme === 'light' && (
          <>
            <div className="pointer-events-none absolute inset-0 opacity-30 [background:repeating-linear-gradient(0deg,rgba(0,0,0,.02)_0px,rgba(0,0,0,.02)_1px,transparent_1px,transparent_3px)]" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1000px_300px_at_50%_-20%,rgba(249,115,22,.15),transparent)]" />
          </>
        )}

        {/* Header simplificado */}
        <div className="relative z-10 flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${
              theme === 'dark' 
                ? 'bg-orange-500/20 ring-1 ring-orange-400/30' 
                : 'bg-orange-500/15 ring-1 ring-orange-400/20'
            }`}>
              <Wrench className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <p className={`text-xs/4 ${colors.text.secondary}`}>Sistema</p>
              <h1 className="font-semibold tracking-wide">Manutenções Abertas</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className={`hidden text-xs ${colors.text.secondary} sm:block`}
            >
              Gestão de Manutenção • {user.nomeCompleto || 'Usuário'}
            </motion.div>
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
              Manutenções em Andamento
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.6 }}
              className={`mx-auto max-w-2xl text-sm md:text-base text-center ${colors.text.secondary}`}
            >
              Gerencie e acompanhe todas as manutenções em andamento da organização
            </motion.p>
          </section>

          {/* Alertas */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mx-auto mt-6 max-w-6xl"
              >
                <div className={`rounded-2xl border ${
                  theme === 'dark' 
                    ? 'border-red-500/30 bg-red-500/10' 
                    : 'border-red-400/30 bg-red-100/80'
                } p-4 backdrop-blur`}>
                  <div className="flex items-center gap-3">
                    <AlertTriangle className={`h-5 w-5 ${
                      theme === 'dark' ? 'text-red-400' : 'text-red-500'
                    }`} />
                    <span className={`text-sm ${
                      theme === 'dark' ? 'text-red-300' : 'text-red-700'
                    }`}>{error}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mx-auto mt-6 max-w-6xl"
              >
                <div className={`rounded-2xl border ${
                  theme === 'dark' 
                    ? 'border-green-500/30 bg-green-500/10' 
                    : 'border-green-400/30 bg-green-100/80'
                } p-4 backdrop-blur`}>
                  <div className="flex items-center gap-3">
                    <Check className={`h-5 w-5 ${
                      theme === 'dark' ? 'text-green-400' : 'text-green-500'
                    }`} />
                    <span className={`text-sm ${
                      theme === 'dark' ? 'text-green-300' : 'text-green-700'
                    }`}>{success}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Estatísticas */}
          <section className="mt-6 mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Card Total Manutenções */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`rounded-2xl border ${
                theme === 'dark' 
                  ? 'border-orange-500/30 bg-orange-500/10 hover:border-orange-400/50' 
                  : 'border-orange-400/30 bg-orange-50/80 hover:border-orange-300/50'
              } p-6 backdrop-blur group transition-colors`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm mb-2 ${
                    theme === 'dark' ? 'text-orange-300' : 'text-orange-600'
                  }`}>Total de Manutenções</p>
                  <p className="text-3xl font-bold">{manutencoes.length}</p>
                </div>
                <div className={`p-3 rounded-xl ${
                  theme === 'dark' 
                    ? 'bg-orange-500/20 ring-1 ring-orange-400/30' 
                    : 'bg-orange-500/15 ring-1 ring-orange-400/20'
                }`}>
                  <Wrench className={`h-6 w-6 ${
                    theme === 'dark' ? 'text-orange-400' : 'text-orange-500'
                  }`} />
                </div>
              </div>
            </motion.div>

            {/* Card Com Chamado */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
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
                  }`}>Vinculadas a Chamados</p>
                  <p className="text-3xl font-bold">{manutencoesComChamado}</p>
                </div>
                <div className={`p-3 rounded-xl ${
                  theme === 'dark' 
                    ? 'bg-blue-500/20 ring-1 ring-blue-400/30' 
                    : 'bg-blue-500/15 ring-1 ring-blue-400/20'
                }`}>
                  <ExternalLink className={`h-6 w-6 ${
                    theme === 'dark' ? 'text-blue-400' : 'text-blue-500'
                  }`} />
                </div>
              </div>
            </motion.div>

            {/* Card Sem Chamado */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className={`rounded-2xl border ${
                theme === 'dark' 
                  ? 'border-gray-500/30 bg-gray-500/10 hover:border-gray-400/50' 
                  : 'border-gray-400/30 bg-gray-50/80 hover:border-gray-300/50'
              } p-6 backdrop-blur group transition-colors`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>Sem Chamado Vinculado</p>
                  <p className="text-3xl font-bold">{manutencoesSemChamado}</p>
                </div>
                <div className={`p-3 rounded-xl ${
                  theme === 'dark' 
                    ? 'bg-gray-500/20 ring-1 ring-gray-400/30' 
                    : 'bg-gray-500/15 ring-1 ring-gray-400/20'
                }`}>
                  <Wrench className={`h-6 w-6 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                </div>
              </div>
            </motion.div>

            {/* Card Técnicos Ativos */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className={`rounded-2xl border ${
                theme === 'dark' 
                  ? 'border-purple-500/30 bg-purple-500/10 hover:border-purple-400/50' 
                  : 'border-purple-400/30 bg-purple-50/80 hover:border-purple-300/50'
              } p-6 backdrop-blur group transition-colors`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm mb-2 ${
                    theme === 'dark' ? 'text-purple-300' : 'text-purple-600'
                  }`}>Técnicos Ativos</p>
                  <p className="text-3xl font-bold">
                    {new Set(manutencoes.map(m => m.tecnico)).size}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${
                  theme === 'dark' 
                    ? 'bg-purple-500/20 ring-1 ring-purple-400/30' 
                    : 'bg-purple-500/15 ring-1 ring-purple-400/20'
                }`}>
                  <User className={`h-6 w-6 ${
                    theme === 'dark' ? 'text-purple-400' : 'text-purple-500'
                  }`} />
                </div>
              </div>
            </motion.div>
          </section>

          {/* Lista de Manutenções Abertas */}
          <section className="mt-8 mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className={`rounded-2xl border ${
                theme === 'dark' 
                  ? 'border-slate-800/60 bg-slate-900/40 shadow-[0_0_0_1px_rgba(249,115,22,.2)]' 
                  : 'border-slate-200/60 bg-white/80 shadow-[0_0_0_1px_rgba(249,115,22,.1)]'
              } p-6 backdrop-blur`}
            >
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${
                    theme === 'dark' 
                      ? 'bg-orange-500/15 ring-1 ring-orange-400/30' 
                      : 'bg-orange-500/10 ring-1 ring-orange-400/20'
                  }`}>
                    <Wrench className={`h-6 w-6 ${
                      theme === 'dark' ? 'text-orange-400' : 'text-orange-500'
                    }`} />
                  </div>
                <div>
                  <h3 className="text-xl font-semibold">Manutenções em Andamento</h3>
                  <p className={`text-sm ${colors.text.secondary}`}>
                    {abaAtiva === 'abertas' ? manutencoes.length : manutencoesFechadas.length} manutenções {abaAtiva === 'abertas' ? 'abertas' : 'fechadas'}
                  </p>
                </div>
              </div>

              {/* Abas para alternar entre abertas e fechadas */}
              <div className="flex mb-6 border-b border-slate-200/20">
                <button
                  onClick={() => setAbaAtiva('abertas')}
                  className={`px-6 py-3 text-sm font-medium transition-all ${
                    abaAtiva === 'abertas'
                      ? theme === 'dark'
                        ? 'text-orange-400 border-b-2 border-orange-400'
                        : 'text-orange-600 border-b-2 border-orange-600'
                      : colors.text.secondary + ' hover:' + colors.text.primary
                  }`}
                >
                  Abertas ({manutencoes.length})
                </button>
                <button
                  onClick={() => setAbaAtiva('fechadas')}
                  className={`px-6 py-3 text-sm font-medium transition-all ${
                    abaAtiva === 'fechadas'
                      ? theme === 'dark'
                        ? 'text-green-400 border-b-2 border-green-400'
                        : 'text-green-600 border-b-2 border-green-600'
                      : colors.text.secondary + ' hover:' + colors.text.primary
                  }`}
                >
                  Fechadas ({manutencoesFechadas.length})
                </button>
              </div>                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push("/formularios/manutencao")}
                  className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white py-3 px-6 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Voltar para Manutenção
                </motion.button>
              </div>

              {/* Dica de interação */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`mb-6 rounded-xl border ${
                  theme === 'dark' 
                    ? 'border-blue-500/30 bg-blue-500/10' 
                    : 'border-blue-400/30 bg-blue-50/80'
                } p-4 backdrop-blur`}
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className={`h-5 w-5 ${
                    theme === 'dark' ? 'text-blue-400' : 'text-blue-500'
                  }`} />
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-blue-300' : 'text-blue-700'
                  }`}>
                    {abaAtiva === 'abertas' 
                      ? 'Clique em qualquer linha para gerenciar a manutenção (alterar status, adicionar observações ou finalizar)'
                      : 'Clique em qualquer linha para visualizar os detalhes completos da manutenção finalizada'
                    }
                  </p>
                </div>
              </motion.div>

              {(abaAtiva === 'abertas' ? manutencoes : manutencoesFechadas).length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <Wrench className={`h-16 w-16 ${
                    theme === 'dark' ? 'text-slate-600' : 'text-slate-400'
                  } mx-auto mb-4`} />
                  <h3 className={`text-lg font-semibold mb-2 ${
                    theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    {abaAtiva === 'abertas' 
                      ? 'Nenhuma manutenção aberta no momento' 
                      : 'Nenhuma manutenção fechada encontrada'
                    }
                  </h3>
                  <p className={`mb-6 ${
                    theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
                  }`}>
                    {abaAtiva === 'abertas'
                      ? 'Todas as manutenções foram finalizadas ou não há equipamentos em reparo.'
                      : 'Não há manutenções finalizadas ainda.'
                    }
                  </p>
                </motion.div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className={`${
                      theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-50/80'
                    } backdrop-blur`}>
                      <tr>
                        <th className="p-4 text-left font-medium">Tombamento</th>
                        <th className="p-4 text-left font-medium">Tipo/Marca</th>
                        <th className="p-4 text-left font-medium">Localização</th>
                        <th className="p-4 text-left font-medium">Problema</th>
                        <th className="p-4 text-left font-medium">Técnico</th>
                        <th className="p-4 text-left font-medium">Data Abertura</th>
                        {abaAtiva === 'fechadas' && <th className="p-4 text-left font-medium">Data Fechamento</th>}
                        {abaAtiva === 'fechadas' && <th className="p-4 text-left font-medium">Solução</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {(abaAtiva === 'abertas' ? manutencoesPaginadasAbertas : manutencoesPaginadasFechadas).map((manutencao, idx) => {
                        const material = getMaterial(manutencao.materialId);
                        const unidade = material ? getUnidade(material.unidadeId) : null;
                        const setor = material ? getSetor(material.setorId) : null;

                        return (
                          <motion.tr 
                            key={manutencao.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.05 * idx }}
                            className={`border-b ${
                              theme === 'dark' 
                                ? 'border-slate-800/60 hover:bg-slate-800/30' 
                                : 'border-slate-200/60 hover:bg-slate-50/50'
                            } transition-colors cursor-pointer`}
                            onClick={() => 
                              abaAtiva === 'abertas' 
                                ? abrirModalGerenciamento(manutencao)
                                : abrirModalVisualizacao(manutencao)
                            }
                          >
                            <td className="p-4">
                              <div className="font-mono font-semibold text-sm">{material?.tombamento}</div>
                              <div className={`text-xs ${colors.text.muted}`}>ID: {material?.id}</div>
                            </td>
                            <td className="p-4">
                              <div className="font-medium">{material?.tipo}</div>
                              <div className={`text-sm ${colors.text.muted}`}>{material?.marca}</div>
                            </td>
                            <td className="p-4">
                              <div className="font-medium">{unidade?.nome}</div>
                              <div className={`text-sm ${colors.text.muted}`}>{setor?.nome}</div>
                            </td>
                            <td className="p-4">
                              <div className="max-w-xs truncate" title={manutencao.descricaoProblema}>
                                {manutencao.chamadoId && (
                                  <ExternalLink className={`h-3 w-3 inline mr-2 ${
                                    theme === 'dark' ? 'text-blue-400' : 'text-blue-500'
                                  }`} />
                                )}
                                {manutencao.descricaoProblema}
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="font-medium">{manutencao.tecnico}</div>
                            </td>
                            <td className="p-4">
                              <div className="text-sm">
                                {new Date(manutencao.dataAbertura).toLocaleDateString('pt-BR')}
                              </div>
                              <div className={`text-xs ${colors.text.muted}`}>
                                {new Date(manutencao.dataAbertura).toLocaleTimeString('pt-BR')}
                              </div>
                            </td>
                            {abaAtiva === 'fechadas' && (
                              <>
                                <td className="p-4">
                                  <div className="text-sm">
                                    {manutencao.dataFechamento 
                                      ? new Date(manutencao.dataFechamento).toLocaleDateString('pt-BR')
                                      : '-'
                                    }
                                  </div>
                                  {manutencao.dataFechamento && (
                                    <div className={`text-xs ${colors.text.muted}`}>
                                      {new Date(manutencao.dataFechamento).toLocaleTimeString('pt-BR')}
                                    </div>
                                  )}
                                </td>
                                <td className="p-4">
                                  <div className="max-w-xs truncate" title={manutencao.descricaoSolucao || 'Sem descrição'}>
                                    {manutencao.descricaoSolucao || '-'}
                                  </div>
                                </td>
                              </>
                            )}
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Paginação */}
              {((abaAtiva === 'abertas' && manutencoesOrdenadas.length > itensPorPagina) || 
                (abaAtiva === 'fechadas' && manutencoesOrdenadasFechadas.length > itensPorPagina)) && (
                <div className="flex items-center justify-between mt-6 px-4">
                  <div className={`text-sm ${colors.text.secondary}`}>
                    {abaAtiva === 'abertas' ? (
                      <>Mostrando {indiceInicialAbertas + 1} a {Math.min(indiceFinalAbertas, manutencoesOrdenadas.length)} de {manutencoesOrdenadas.length} manutenções</>
                    ) : (
                      <>Mostrando {indiceInicialFechadas + 1} a {Math.min(indiceFinalFechadas, manutencoesOrdenadasFechadas.length)} de {manutencoesOrdenadasFechadas.length} manutenções</>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => abaAtiva === 'abertas' 
                        ? setPaginaAtualAbertas(prev => Math.max(1, prev - 1))
                        : setPaginaAtualFechadas(prev => Math.max(1, prev - 1))
                      }
                      disabled={abaAtiva === 'abertas' ? paginaAtualAbertas === 1 : paginaAtualFechadas === 1}
                      className={`px-4 py-2 rounded-xl transition-all ${
                        (abaAtiva === 'abertas' ? paginaAtualAbertas === 1 : paginaAtualFechadas === 1)
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
                      {Array.from({ 
                        length: abaAtiva === 'abertas' ? totalPaginasAbertas : totalPaginasFechadas 
                      }, (_, i) => i + 1)
                        .filter(pagina => {
                          const atual = abaAtiva === 'abertas' ? paginaAtualAbertas : paginaAtualFechadas;
                          const total = abaAtiva === 'abertas' ? totalPaginasAbertas : totalPaginasFechadas;
                          return pagina === 1 || 
                                 pagina === total || 
                                 (pagina >= atual - 1 && pagina <= atual + 1);
                        })
                        .map((pagina, idx, array) => {
                          const showEllipsis = idx > 0 && pagina - array[idx - 1] > 1;
                          const atual = abaAtiva === 'abertas' ? paginaAtualAbertas : paginaAtualFechadas;
                          return (
                            <div key={pagina} className="flex items-center gap-1">
                              {showEllipsis && (
                                <span className={`px-2 ${colors.text.muted}`}>...</span>
                              )}
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => abaAtiva === 'abertas' 
                                  ? setPaginaAtualAbertas(pagina)
                                  : setPaginaAtualFechadas(pagina)
                                }
                                className={`px-4 py-2 rounded-xl transition-all ${
                                  atual === pagina
                                    ? 'bg-gradient-to-r from-orange-600 to-orange-700 text-white'
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
                      onClick={() => abaAtiva === 'abertas'
                        ? setPaginaAtualAbertas(prev => Math.min(totalPaginasAbertas, prev + 1))
                        : setPaginaAtualFechadas(prev => Math.min(totalPaginasFechadas, prev + 1))
                      }
                      disabled={abaAtiva === 'abertas' 
                        ? paginaAtualAbertas === totalPaginasAbertas 
                        : paginaAtualFechadas === totalPaginasFechadas
                      }
                      className={`px-4 py-2 rounded-xl transition-all ${
                        (abaAtiva === 'abertas' 
                          ? paginaAtualAbertas === totalPaginasAbertas 
                          : paginaAtualFechadas === totalPaginasFechadas)
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
            </motion.div>
          </section>
        </main>

        {/* Modal de Gerenciamento da Manutenção */}
        <AnimatePresence>
          {showModalGerenciamento && manutencaoSelecionada && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
              onClick={fecharModalGerenciamento}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className={`w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl border ${
                  theme === 'dark' 
                    ? 'border-blue-500/30 bg-slate-900/95' 
                    : 'border-blue-400/30 bg-white/95'
                } backdrop-blur shadow-2xl my-8`}
              >
                <div className="bg-gradient-to-r from-blue-800 to-blue-600 p-6 text-white rounded-t-2xl flex-shrink-0">
                  <h2 className="text-xl font-bold">Gerenciar Manutenção</h2>
                  <p className="text-blue-200 text-sm mt-1">
                    {getMaterial(manutencaoSelecionada.materialId)?.tombamento} - {getMaterial(manutencaoSelecionada.materialId)?.tipo}
                  </p>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto flex-1">
                  {/* Informações da Manutenção */}
                  <div className={`rounded-xl border ${
                    theme === 'dark' 
                      ? 'border-slate-700 bg-slate-800/50' 
                      : 'border-slate-200 bg-slate-50/80'
                  } p-4 backdrop-blur`}>
                    <h3 className="font-semibold mb-2 text-sm">Informações da Manutenção:</h3>
                    <p className={`mb-3 ${
                      theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                    }`}>{manutencaoSelecionada.descricaoProblema}</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-slate-400" />
                        <span><span className="font-medium">Técnico:</span> {manutencaoSelecionada.tecnico}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span><span className="font-medium">Data Abertura:</span> {new Date(manutencaoSelecionada.dataAbertura).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        <span><span className="font-medium">Localização:</span> {getUnidade(getMaterial(manutencaoSelecionada.materialId)?.unidadeId || 0)?.nome} - {getSetor(getMaterial(manutencaoSelecionada.materialId)?.setorId || 0)?.nome}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Wrench className="h-4 w-4 text-slate-400" />
                        <span><span className="font-medium">Status Atual:</span> 
                          <span className={`ml-2 px-2 py-1 rounded-full text-xs border ${getStatusColor(getMaterial(manutencaoSelecionada.materialId)?.status || StatusMaterial.EM_REPARO)}`}>
                            {getMaterial(manutencaoSelecionada.materialId)?.status}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Chamado Vinculado */}
                  {manutencaoSelecionada?.chamadoId ? (
                    chamadoVinculado ? (
                      <div className={`rounded-xl border ${
                        theme === 'dark' 
                          ? 'border-blue-500/30 bg-blue-500/10' 
                          : 'border-blue-400/30 bg-blue-50/80'
                      } p-4 backdrop-blur`}>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-sm flex items-center gap-2">
                            <ExternalLink className={`h-4 w-4 ${
                              theme === 'dark' ? 'text-blue-400' : 'text-blue-500'
                            }`} />
                            <span className={theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}>
                              Chamado Vinculado
                            </span>
                          </h3>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={navegarParaChamado}
                            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                              theme === 'dark' 
                                ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400' 
                                : 'bg-blue-500/15 hover:bg-blue-500/25 text-blue-500'
                            }`}
                          >
                            <ExternalLink className="h-3 w-3 mr-1 inline" />
                            Ver Chamado
                          </motion.button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Protocolo:</span> {chamadoVinculado?.protocolo}
                          </div>
                          <div>
                            <span className="font-medium">Status:</span>{" "}
                            <span className={`px-2 py-1 rounded-full text-xs border ${
                              chamadoVinculado?.status === 'ABERTO' ? 
                                (theme === 'dark' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 'bg-yellow-100 text-yellow-800 border-yellow-200') :
                              chamadoVinculado?.status === 'EM_ATENDIMENTO' ? 
                                (theme === 'dark' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-blue-100 text-blue-800 border-blue-200') :
                                (theme === 'dark' ? 'bg-gray-500/20 text-gray-400 border-gray-500/30' : 'bg-gray-100 text-gray-800 border-gray-200')
                            }`}>
                              {chamadoVinculado?.status}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">Usuário:</span> {chamadoVinculado?.usuarioAbertura}
                          </div>
                          <div>
                            <span className="font-medium">Data:</span> {new Date(chamadoVinculado?.dataAbertura || '').toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className={`rounded-xl border ${
                        theme === 'dark' 
                          ? 'border-yellow-500/30 bg-yellow-500/10' 
                          : 'border-yellow-400/30 bg-yellow-50/80'
                      } p-4 backdrop-blur`}>
                        <div className="flex items-center gap-2">
                          <Clock className={`h-4 w-4 ${
                            theme === 'dark' ? 'text-yellow-400' : 'text-yellow-500'
                          }`} />
                          <span className={theme === 'dark' ? 'text-yellow-300' : 'text-yellow-700'}>
                            Carregando informações do chamado vinculado...
                          </span>
                        </div>
                      </div>
                    )
                  ) : null}

                  {/* Alterar Status do Material */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${colors.text.secondary}`}>
                      Novo Status do Material
                    </label>
                    <select
                      className={`w-full p-3 rounded-xl border ${
                        colors.input.border
                      } ${
                        colors.input.background
                      } ${
                        colors.input.text
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all backdrop-blur`}
                      value={statusMaterialSelecionado}
                      onChange={(e) => setStatusMaterialSelecionado(e.target.value as StatusMaterial)}
                    >
                      {Object.values(StatusMaterial).map(status => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    <p className={`text-xs ${colors.text.muted} mt-1`}>
                      💡 Altere o status conforme o progresso da manutenção
                    </p>
                  </div>

                  {/* Campo para Observações */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${colors.text.secondary}`}>
                      Observações (Para Finalização)
                    </label>
                    <textarea
                      rows={4}
                      className={`w-full p-3 rounded-xl border ${
                        colors.input.border
                      } ${
                        colors.input.background
                      } ${
                        colors.input.text
                      } ${
                        colors.input.placeholder
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all backdrop-blur resize-none`}
                      placeholder="Estas observações serão usadas apenas se você finalizar a manutenção..."
                      value={observacoes}
                      onChange={(e) => setObservacoes(e.target.value)}
                    />
                    <p className={`text-xs ${colors.text.muted} mt-1`}>
                      📝 As observações são necessárias apenas para finalizar a manutenção. Para atualizar apenas o status, deixe em branco.
                    </p>
                  </div>

                </div>
                
                {/* Botões de Ação */}
                <div className="p-6 pt-0 border-t border-slate-700/30 flex-shrink-0">
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={fecharModalGerenciamento}
                      className={`flex-1 py-3 px-4 rounded-xl transition-all ${
                        theme === 'dark' 
                          ? 'bg-slate-700 hover:bg-slate-600 text-slate-200' 
                          : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                      }`}
                    >
                      Cancelar
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={atualizarStatusMaterial}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-4 rounded-xl transition-all flex items-center justify-center"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Apenas Atualizar Status
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={finalizarManutencaoCompleta}
                      disabled={!observacoes.trim()}
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed text-white py-3 px-4 rounded-xl transition-all flex items-center justify-center"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Finalizar Manutenção
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal de Finalização */}
        <AnimatePresence>
          {showModal && manutencaoSelecionada && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className={`w-full max-w-2xl rounded-2xl border ${
                  theme === 'dark' 
                    ? 'border-green-500/30 bg-slate-900/80' 
                    : 'border-green-400/30 bg-white/95'
                } backdrop-blur shadow-2xl`}
              >
                <div className="bg-gradient-to-r from-green-800 to-green-600 p-6 text-white rounded-t-2xl">
                  <h2 className="text-xl font-bold">Finalizar Manutenção</h2>
                  <p className="text-green-200 text-sm mt-1">
                    {getMaterial(manutencaoSelecionada.materialId)?.tombamento} - {getMaterial(manutencaoSelecionada.materialId)?.tipo}
                  </p>
                </div>

                <div className="p-6 space-y-4">
                  {/* Informações da Manutenção */}
                  <div className={`rounded-xl border ${
                    theme === 'dark' 
                      ? 'border-slate-700 bg-slate-800/50' 
                      : 'border-slate-200 bg-slate-50/80'
                  } p-4 backdrop-blur`}>
                    <h3 className="font-semibold mb-2 text-sm">Problema Relatado:</h3>
                    <p className={`${
                      theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                    }`}>{manutencaoSelecionada.descricaoProblema}</p>
                    
                    <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-slate-400" />
                        <span><span className="font-medium">Técnico:</span> {manutencaoSelecionada.tecnico}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span><span className="font-medium">Data Abertura:</span> {new Date(manutencaoSelecionada.dataAbertura).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Chamado Vinculado */}
                  {manutencaoSelecionada?.chamadoId ? (
                    chamadoVinculado ? (
                      <div className={`rounded-xl border ${
                        theme === 'dark' 
                          ? 'border-blue-500/30 bg-blue-500/10' 
                          : 'border-blue-400/30 bg-blue-50/80'
                      } p-4 backdrop-blur`}>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-sm flex items-center gap-2">
                            <ExternalLink className={`h-4 w-4 ${
                              theme === 'dark' ? 'text-blue-400' : 'text-blue-500'
                            }`} />
                            <span className={theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}>
                              Chamado Vinculado
                            </span>
                          </h3>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={navegarParaChamado}
                            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                              theme === 'dark' 
                                ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400' 
                                : 'bg-blue-500/15 hover:bg-blue-500/25 text-blue-500'
                            }`}
                          >
                            <ExternalLink className="h-3 w-3 mr-1 inline" />
                            Ver Chamado
                          </motion.button>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="font-medium">Protocolo:</span> {chamadoVinculado?.protocolo}
                            </div>
                            <div>
                              <span className="font-medium">Status:</span>{" "}
                              <span className={`px-2 py-1 rounded-full text-xs border ${
                                chamadoVinculado?.status === 'ABERTO' ? 
                                  (theme === 'dark' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 'bg-yellow-100 text-yellow-800 border-yellow-200') :
                                chamadoVinculado?.status === 'EM_ATENDIMENTO' ? 
                                  (theme === 'dark' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-blue-100 text-blue-800 border-blue-200') :
                                  (theme === 'dark' ? 'bg-gray-500/20 text-gray-400 border-gray-500/30' : 'bg-gray-100 text-gray-800 border-gray-200')
                              }`}>
                                {chamadoVinculado?.status}
                              </span>
                            </div>
                          </div>
                          
                          <div>
                            <span className="font-medium">Usuário:</span> {chamadoVinculado.usuarioAbertura}
                          </div>
                          
                          <div>
                            <span className="font-medium">Problema Relatado:</span>
                            <p className={`mt-1 ${
                              theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                            } bg-white dark:bg-slate-800 p-2 rounded text-xs`}>
                              {chamadoVinculado.descricaoProblema}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className={`rounded-xl border ${
                        theme === 'dark' 
                          ? 'border-yellow-500/30 bg-yellow-500/10' 
                          : 'border-yellow-400/30 bg-yellow-50/80'
                      } p-4 backdrop-blur`}>
                        <div className="flex items-center gap-2">
                          <Clock className={`h-4 w-4 ${
                            theme === 'dark' ? 'text-yellow-400' : 'text-yellow-500'
                          }`} />
                          <span className={theme === 'dark' ? 'text-yellow-300' : 'text-yellow-700'}>
                            Carregando informações do chamado vinculado...
                          </span>
                        </div>
                      </div>
                    )
                  ) : null}

                  {/* Campo para Solução */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${colors.text.secondary}`}>
                      Descrição da Solução Aplicada *
                    </label>
                    <textarea
                      rows={5}
                      className={`w-full p-3 rounded-xl border ${
                        colors.input.border
                      } ${
                        colors.input.background
                      } ${
                        colors.input.text
                      } ${
                        colors.input.placeholder
                      } focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all backdrop-blur resize-none`}
                      placeholder="Descreva detalhadamente qual foi a solução aplicada, peças trocadas, procedimentos realizados, etc..."
                      value={descricaoSolucao}
                      onChange={(e) => setDescricaoSolucao(e.target.value)}
                    />
                    <p className={`text-xs ${colors.text.muted} mt-1`}>
                      💡 Dica: Se a palavra &quot;consert&quot; estiver na descrição, o status será alterado para &quot;FUNCIONANDO&quot;, caso contrário para &quot;SEM_CONSERTO&quot;
                    </p>
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex gap-3 pt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={fecharModal}
                      className={`flex-1 py-3 px-4 rounded-xl transition-all ${
                        theme === 'dark' 
                          ? 'bg-slate-700 hover:bg-slate-600 text-slate-200' 
                          : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                      }`}
                    >
                      Cancelar
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={finalizarManutencao}
                      disabled={!descricaoSolucao.trim()}
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed text-white py-3 px-4 rounded-xl transition-all flex items-center justify-center"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Finalizar Manutenção
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal de Visualização da Manutenção Fechada */}
        <AnimatePresence>
          {showModalVisualizacao && manutencaoVisualizacao && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
              onClick={fecharModalVisualizacao}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", duration: 0.3 }}
                className={`relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border ${
                  theme === 'dark' 
                    ? 'border-slate-800/60 bg-slate-900/95' 
                    : 'border-slate-200/60 bg-white/95'
                } p-6 backdrop-blur shadow-xl`}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header do Modal */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl ${
                      theme === 'dark' 
                        ? 'bg-green-500/15 ring-1 ring-green-400/30' 
                        : 'bg-green-500/10 ring-1 ring-green-400/20'
                    }`}>
                      <CheckCircle2 className={`h-6 w-6 ${
                        theme === 'dark' ? 'text-green-400' : 'text-green-500'
                      }`} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">Detalhes da Manutenção Finalizada</h3>
                      <p className={`text-sm ${colors.text.secondary}`}>
                        Visualização completa da manutenção
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={fecharModalVisualizacao}
                    className={`p-2 rounded-lg ${
                      theme === 'dark' 
                        ? 'hover:bg-slate-800' 
                        : 'hover:bg-slate-100'
                    } transition-colors`}
                  >
                    <span className="text-xl">&times;</span>
                  </button>
                </div>

                {/* Grid de Informações */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* Informações do Material */}
                  <div className={`rounded-xl border ${
                    theme === 'dark' 
                      ? 'border-slate-800/60 bg-slate-800/30' 
                      : 'border-slate-200/60 bg-slate-50/80'
                  } p-4`}>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Package className="w-4 h-4 text-blue-400" />
                      Material
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className={colors.text.secondary}>Tombamento:</span>
                        <span className="font-mono font-medium">{materialVisualizacao?.tombamento}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={colors.text.secondary}>Tipo:</span>
                        <span>{materialVisualizacao?.tipo}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={colors.text.secondary}>Marca:</span>
                        <span>{materialVisualizacao?.marca}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={colors.text.secondary}>Unidade:</span>
                        <span>{getUnidade(materialVisualizacao?.unidadeId || 0)?.nome}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={colors.text.secondary}>Setor:</span>
                        <span>{getSetor(materialVisualizacao?.setorId || 0)?.nome}</span>
                      </div>
                    </div>
                  </div>

                  {/* Informações da Manutenção */}
                  <div className={`rounded-xl border ${
                    theme === 'dark' 
                      ? 'border-slate-800/60 bg-slate-800/30' 
                      : 'border-slate-200/60 bg-slate-50/80'
                  } p-4`}>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-orange-400" />
                      Manutenção
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className={colors.text.secondary}>Técnico:</span>
                        <span>{manutencaoVisualizacao.tecnico}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={colors.text.secondary}>Status:</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          theme === 'dark'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          FECHADA
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={colors.text.secondary}>Data Abertura:</span>
                        <span>{new Date(manutencaoVisualizacao.dataAbertura).toLocaleDateString('pt-BR')}</span>
                      </div>
                      {manutencaoVisualizacao.dataFechamento && (
                        <div className="flex justify-between">
                          <span className={colors.text.secondary}>Data Fechamento:</span>
                          <span>{new Date(manutencaoVisualizacao.dataFechamento).toLocaleDateString('pt-BR')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Descrição do Problema */}
                <div className={`rounded-xl border ${
                  theme === 'dark' 
                    ? 'border-slate-800/60 bg-slate-800/30' 
                    : 'border-slate-200/60 bg-slate-50/80'
                } p-4 mb-6`}>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    Problema Relatado
                  </h4>
                  <p className={`text-sm ${colors.text.primary}`}>
                    {manutencaoVisualizacao.descricaoProblema}
                  </p>
                </div>

                {/* Solução Aplicada */}
                {manutencaoVisualizacao.descricaoSolucao && (
                  <div className={`rounded-xl border ${
                    theme === 'dark' 
                      ? 'border-slate-800/60 bg-slate-800/30' 
                      : 'border-slate-200/60 bg-slate-50/80'
                  } p-4 mb-6`}>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      Solução Aplicada
                    </h4>
                    <p className={`text-sm ${colors.text.primary}`}>
                      {manutencaoVisualizacao.descricaoSolucao}
                    </p>
                  </div>
                )}

                {/* Chamado Vinculado */}
                {chamadoVinculado && (
                  <div className={`rounded-xl border ${
                    theme === 'dark' 
                      ? 'border-blue-500/30 bg-blue-500/10' 
                      : 'border-blue-400/30 bg-blue-50/80'
                  } p-4 mb-6`}>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-blue-400" />
                      Chamado Vinculado
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className={colors.text.secondary}>Protocolo:</span>
                        <span className="font-mono font-medium">{chamadoVinculado.protocolo}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={colors.text.secondary}>Usuário:</span>
                        <span>{chamadoVinculado.usuarioAbertura}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={colors.text.secondary}>Data Abertura:</span>
                        <span>{new Date(chamadoVinculado.dataAbertura).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div className="mt-3">
                        <span className={`${colors.text.secondary} block mb-1`}>Descrição:</span>
                        <p className={`text-sm ${colors.text.primary}`}>
                          {chamadoVinculado.descricaoProblema}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Botões de Ação */}
                <div className="flex flex-col sm:flex-row gap-3 justify-end">
                  {chamadoVinculado && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={irParaChamado}
                      className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-6 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Ver Chamado
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={fecharModalVisualizacao}
                    className={`inline-flex items-center justify-center rounded-xl border py-3 px-6 font-medium transition-all focus:outline-none focus:ring-2 ${
                      theme === 'dark'
                        ? 'border-slate-600 text-slate-300 hover:bg-slate-800 focus:ring-slate-500/50'
                        : 'border-slate-300 text-slate-700 hover:bg-slate-50 focus:ring-slate-500/50'
                    }`}
                  >
                    Fechar
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Rodapé */}
        <footer className={`relative z-10 mx-auto max-w-7xl px-6 pb-8 pt-6 text-center text-xs ${
          theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
        }`}>
          © {new Date().getFullYear()} – Sistema de Gestão. Desenvolvido com Next.js e Tailwind.
        </footer>
      </div>
    </DefaultLayout>
  );
};

export default ManutencaoAbertasPage;