"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Ticket,
  Filter,
  Search,
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
  User,
  Calendar,
  Edit,
  Wrench,
  Eye,
  Plus,
  BarChart3
} from "lucide-react";

import { getUserLocalStorage } from "@/store/userLocalStorage";
import axiosInstance from "@/services/axiosInstance";
import { Chamado, StatusChamado, Unidade, Material, Setor, StatusMaterial } from "@/types";
import { useTheme } from "next-themes";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

export default function ListaChamadosGamificado() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme } = useTheme();
  const user = getUserLocalStorage() || {};
  const [mounted, setMounted] = useState(false);
  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [setores, setSetores] = useState<Setor[]>([]);
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState<'ativos' | 'fechados' | 'finalizados'>('ativos');
  const [filtros, setFiltros] = useState({
    status: "",
    unidadeId: "",
    setorId: "",
    protocolo: ""
  });
  
  // Estados para modais
  const [selectedChamado, setSelectedChamado] = useState<Chamado | null>(null);
  const [materialDoChamado, setMaterialDoChamado] = useState<Material | null>(null);
  const [editandoStatus, setEditandoStatus] = useState(false);
  const [novoStatus, setNovoStatus] = useState<StatusChamado>(StatusChamado.ABERTO);
  const [parecerSuporte, setParecerSuporte] = useState("");
  const [showModalManutencao, setShowModalManutencao] = useState(false);
  const [descricaoManutencao, setDescricaoManutencao] = useState("");
  
  // Estados para paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10;

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

  useEffect(() => {
    setMounted(true);
    carregarDados();
  }, []);

  useEffect(() => {
    const openChamadoId = searchParams.get('openChamado');
    if (openChamadoId && chamados.length > 0) {
      const chamado = chamados.find(c => c.id === parseInt(openChamadoId));
      if (chamado) {
        abrirModalChamado(chamado);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chamados, searchParams]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [chamadosRes, unidadesRes, setoresRes, materiaisRes] = await Promise.all([
        axiosInstance.get("/api/chamados"),
        axiosInstance.get("/api/unidades/listar-unidades"),
        axiosInstance.get("/api/setores"),
        axiosInstance.get("/api/materiais")
      ]);
      
      setChamados(chamadosRes.data);
      setUnidades(unidadesRes.data);
      setSetores(setoresRes.data);
      setMateriais(materiaisRes.data);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const abrirModalChamado = async (chamado: Chamado) => {
    setSelectedChamado(chamado);
    const material = materiais.find(m => m.id === chamado.materialId);
    setMaterialDoChamado(material || null);
    setDescricaoManutencao(chamado.descricaoProblema);
  };

  const closeModal = () => {
    setSelectedChamado(null);
    setMaterialDoChamado(null);
    setEditandoStatus(false);
    setParecerSuporte("");
  };

  const handleFiltroChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  const atualizarStatusChamadoModal = async () => {
    if (!selectedChamado || !parecerSuporte.trim()) {
      alert('Parecer é obrigatório para alterar o status!');
      return;
    }

    try {
      const response = await axiosInstance.patch(`/api/chamados/${selectedChamado.id}/status`, {
        statusChamado: novoStatus,
        parecerSuporte: parecerSuporte
      });

      if (response.status === 200) {
        setChamados(prevChamados => 
          prevChamados.map(chamado => 
            chamado.id === selectedChamado.id 
              ? { ...chamado, status: novoStatus }
              : chamado
          )
        );

        setSelectedChamado({ ...selectedChamado, status: novoStatus });
        setEditandoStatus(false);
        setParecerSuporte("");
        
        alert('Status do chamado atualizado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao atualizar status do chamado:', error);
      alert('Erro ao atualizar status do chamado');
    }
  };

  const iniciarEdicaoStatus = () => {
    setEditandoStatus(true);
    setNovoStatus(selectedChamado?.status || StatusChamado.ABERTO);
    setParecerSuporte("");
  };

  const cancelarEdicaoStatus = () => {
    setEditandoStatus(false);
    setNovoStatus(selectedChamado?.status || StatusChamado.ABERTO);
    setParecerSuporte("");
  };

  const abrirManutencaoDoMaterial = async () => {
    if (!materialDoChamado || !selectedChamado) {
      alert("Material ou chamado não encontrado");
      return;
    }

    try {
      const response = await axiosInstance.get("/api/manutencoes/abertas", {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      const manutencaoExistente = response.data.find((manutencao: { materialId: number; status: string; id: number; tecnico: string; dataAbertura: string }) => 
        manutencao.materialId === materialDoChamado.id && manutencao.status === 'ABERTA'
      );

      if (manutencaoExistente) {
        alert(`⚠️ MANUTENÇÃO JÁ EXISTE!\n\nJá existe uma manutenção aberta para este material:\n• Manutenção #${manutencaoExistente.id}\n• Técnico: ${manutencaoExistente.tecnico}\n• Data: ${new Date(manutencaoExistente.dataAbertura).toLocaleDateString('pt-BR')}\n\nRedirecionando para a manutenção...`);
        router.push(`/formularios/manutencao/abertas?openManutencao=${manutencaoExistente.id}`);
        closeModal();
        return;
      }

      setShowModalManutencao(true);
    } catch (error) {
      console.error("Erro ao verificar manutenções existentes:", error);
      setShowModalManutencao(true);
    }
  };

  const abrirManutencao = async () => {
    if (!materialDoChamado || !descricaoManutencao.trim()) {
      alert("Preencha a descrição da manutenção");
      return;
    }

    try {
      const dadosManutencao: {
        materialId: number;
        descricaoProblema: string;
        tecnico: string;
        chamadoId?: number;
      } = {
        materialId: materialDoChamado.id,
        descricaoProblema: descricaoManutencao,
        tecnico: user.nomeCompleto || "Técnico"
      };

      if (selectedChamado?.id) {
        dadosManutencao.chamadoId = selectedChamado.id;
      }

      const manutencaoResponse = await axiosInstance.post("/api/manutencoes/abrir", dadosManutencao, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      if (selectedChamado) {
        await axiosInstance.patch(`/api/chamados/${selectedChamado.id}/status`, {
          statusChamado: StatusChamado.EM_ATENDIMENTO
        }, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
      }

      alert("Manutenção aberta com sucesso! Redirecionando para a manutenção...");
      setShowModalManutencao(false);
      closeModal();
      router.push(`/formularios/manutencao/abertas?openManutencao=${manutencaoResponse.data.id}`);
    } catch (error: unknown) {
      console.error("Erro ao abrir manutenção:", error);
      let mensagemErro = "Erro ao abrir manutenção.";
      if (error instanceof Error) {
        mensagemErro = error.message;
      }
      alert(mensagemErro);
    }
  };

  const getStatusColor = (status: StatusChamado) => {
    switch (status) {
      case StatusChamado.ABERTO: 
        return theme === 'dark' 
          ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' 
          : 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case StatusChamado.EM_ATENDIMENTO: 
        return theme === 'dark' 
          ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' 
          : 'bg-blue-100 text-blue-800 border-blue-200';
      case StatusChamado.FECHADO: 
        return theme === 'dark' 
          ? 'bg-gray-500/20 text-gray-400 border-gray-500/30' 
          : 'bg-gray-100 text-gray-800 border-gray-200';
      case StatusChamado.FINALIZADO: 
        return theme === 'dark' 
          ? 'bg-green-500/20 text-green-400 border-green-500/30' 
          : 'bg-green-100 text-green-800 border-green-200';
      default: 
        return theme === 'dark' 
          ? 'bg-gray-500/20 text-gray-400 border-gray-500/30' 
          : 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getMaterialStatusColor = (status: StatusMaterial) => {
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

  // Filtrar e ordenar chamados por data de abertura DESC (mais recentes primeiro)
  const chamadosFiltrados = chamados.filter(chamado => {
    if (abaAtiva === 'ativos') {
      if (chamado.status !== StatusChamado.ABERTO && chamado.status !== StatusChamado.EM_ATENDIMENTO) {
        return false;
      }
    } else if (abaAtiva === 'fechados') {
      if (chamado.status !== StatusChamado.FECHADO) {
        return false;
      }
    } else if (abaAtiva === 'finalizados') {
      if (chamado.status !== StatusChamado.FINALIZADO) {
        return false;
      }
    }

    return (
      (filtros.status === "" || chamado.status === filtros.status) &&
      (filtros.unidadeId === "" || chamado.unidadeId.toString() === filtros.unidadeId) &&
      (filtros.setorId === "" || chamado.setorId.toString() === filtros.setorId) &&
      (filtros.protocolo === "" || chamado.protocolo.toLowerCase().includes(filtros.protocolo.toLowerCase()))
    );
  }).sort((a, b) => {
    return new Date(b.dataAbertura).getTime() - new Date(a.dataAbertura).getTime();
  });

  // Paginação
  const totalPaginas = Math.ceil(chamadosFiltrados.length / itensPorPagina);
  const indiceInicial = (paginaAtual - 1) * itensPorPagina;
  const indiceFinal = indiceInicial + itensPorPagina;
  const chamadosPaginados = chamadosFiltrados.slice(indiceInicial, indiceFinal);

  // Resetar página ao mudar aba ou filtros
  useEffect(() => {
    setPaginaAtual(1);
  }, [abaAtiva, filtros]);

  // Estatísticas
  const estatisticas = {
    ativos: chamados.filter(c => c.status === StatusChamado.ABERTO || c.status === StatusChamado.EM_ATENDIMENTO).length,
    fechados: chamados.filter(c => c.status === StatusChamado.FECHADO).length,
    finalizados: chamados.filter(c => c.status === StatusChamado.FINALIZADO).length,
    total: chamados.length
  };

  if (!mounted || loading) {
    return (
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
            {loading ? 'Carregando chamados...' : 'Iniciando aplicação...'}
          </motion.p>
        </div>
      </div>
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
              <Ticket className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <p className={`text-xs/4 ${colors.text.secondary}`}>Sistema</p>
              <h1 className="font-semibold tracking-wide">Lista de Chamados</h1>
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
            Gestão de Chamados
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className={`mx-auto max-w-2xl text-sm md:text-base text-center ${colors.text.secondary}`}
          >
            Gerencie e acompanhe todos os chamados de suporte técnico
          </motion.p>
        </section>

        {/* Estatísticas */}
        <section className="mt-8 mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-4 gap-6">
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
                }`}>Ativos</p>
                <p className="text-3xl font-bold">{estatisticas.ativos}</p>
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
                ? 'border-green-500/30 bg-green-500/10 hover:border-green-400/50' 
                : 'border-green-400/30 bg-green-50/80 hover:border-green-300/50'
            } p-6 backdrop-blur group transition-colors`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm mb-2 ${
                  theme === 'dark' ? 'text-green-300' : 'text-green-600'
                }`}>Finalizados</p>
                <p className="text-3xl font-bold">{estatisticas.finalizados}</p>
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
            transition={{ delay: 0.5 }}
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
                }`}>Fechados</p>
                <p className="text-3xl font-bold">{estatisticas.fechados}</p>
              </div>
              <div className={`p-3 rounded-xl ${
                theme === 'dark' 
                  ? 'bg-gray-500/20 ring-1 ring-gray-400/30' 
                  : 'bg-gray-500/15 ring-1 ring-gray-400/20'
              }`}>
                <X className={`h-6 w-6 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`} />
              </div>
            </div>
          </motion.div>
        </section>

        {/* Abas de Status */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 mx-auto max-w-6xl"
        >
          <div className={`rounded-2xl border ${
            theme === 'dark' 
              ? 'border-slate-800/60 bg-slate-900/40' 
              : 'border-slate-200/60 bg-white/80'
          } p-1 backdrop-blur`}>
            <div className="flex">
              {[
                { key: 'ativos' as const, label: 'Ativos', count: estatisticas.ativos, color: 'yellow' },
                { key: 'fechados' as const, label: 'Fechados', count: estatisticas.fechados, color: 'gray' },
                { key: 'finalizados' as const, label: 'Finalizados', count: estatisticas.finalizados, color: 'green' }
              ].map((aba) => (
                <button
                  key={aba.key}
                  onClick={() => setAbaAtiva(aba.key)}
                  className={`flex-1 py-4 px-6 text-center font-medium transition-all rounded-xl ${
                    abaAtiva === aba.key
                      ? theme === 'dark'
                        ? `bg-${aba.color}-500 text-white shadow-lg`
                        : `bg-${aba.color}-500 text-white shadow-lg`
                      : `${colors.text.secondary} hover:${theme === 'dark' ? 'bg-slate-800/60' : 'bg-slate-100/80'}`
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <span>{aba.label}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      abaAtiva === aba.key ? 'bg-white/20' : theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'
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
          transition={{ delay: 0.7 }}
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

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${colors.text.primary}`}>Status</label>
                <select
                  name="status"
                  className={`w-full pl-3 pr-4 py-2 rounded-xl border ${
                    colors.input.border
                  } ${
                    colors.input.background
                  } ${
                    colors.input.text
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all backdrop-blur`}
                  value={filtros.status}
                  onChange={handleFiltroChange}
                >
                  <option value="">Todos</option>
                  {Object.values(StatusChamado).map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${colors.text.primary}`}>Unidade</label>
                <select
                  name="unidadeId"
                  className={`w-full pl-3 pr-4 py-2 rounded-xl border ${
                    colors.input.border
                  } ${
                    colors.input.background
                  } ${
                    colors.input.text
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all backdrop-blur`}
                  value={filtros.unidadeId}
                  onChange={handleFiltroChange}
                >
                  <option value="">Todas</option>
                  {unidades.map(unidade => (
                    <option key={unidade.id} value={unidade.id}>{unidade.nome}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${colors.text.primary}`}>Setor</label>
                <select
                  name="setorId"
                  className={`w-full pl-3 pr-4 py-2 rounded-xl border ${
                    colors.input.border
                  } ${
                    colors.input.background
                  } ${
                    colors.input.text
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all backdrop-blur`}
                  value={filtros.setorId}
                  onChange={handleFiltroChange}
                >
                  <option value="">Todos</option>
                  {setores.map(setor => (
                    <option key={setor.id} value={setor.id}>{setor.nome}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${colors.text.primary}`}>Protocolo</label>
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${colors.text.muted}`} />
                  <input
                    type="text"
                    name="protocolo"
                    className={`w-full pl-10 pr-4 py-2 rounded-xl border ${
                      colors.input.border
                    } ${
                      colors.input.background
                    } ${
                      colors.input.text
                    } ${
                      colors.input.placeholder
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all backdrop-blur`}
                    value={filtros.protocolo}
                    onChange={handleFiltroChange}
                    placeholder="Buscar protocolo..."
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Lista de Chamados */}
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
          } overflow-hidden backdrop-blur`}>
            
            {/* Header da Tabela */}
            <div className="bg-gradient-to-r from-blue-800 to-blue-600 p-6 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">Chamados de TI</h2>
                  <p>{chamadosFiltrados.length} chamados encontrados</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push("/chamados/abrir")}
                  className="bg-white text-blue-600 px-4 py-2 rounded-xl font-medium hover:bg-blue-50 transition-all flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Novo Chamado
                </motion.button>
              </div>
            </div>

            {/* Tabela */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`${
                  theme === 'dark' ? 'bg-slate-800/60' : 'bg-slate-50'
                }`}>
                  <tr>
                    <th className="p-4 text-left">Protocolo</th>
                    <th className="p-4 text-left">Usuário</th>
                    <th className="p-4 text-left">Unidade/Setor</th>
                    <th className="p-4 text-left">Data Abertura</th>
                    <th className="p-4 text-left">Status</th>
                    <th className="p-4 text-left">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {chamadosPaginados.map((chamado, index) => (
                    <motion.tr 
                      key={chamado.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className={`border-b ${
                        theme === 'dark' 
                          ? 'border-slate-700 hover:bg-slate-800/30' 
                          : 'border-slate-200 hover:bg-slate-50/80'
                      } cursor-pointer transition-colors`}
                      onClick={() => abrirModalChamado(chamado)}
                    >
                      <td className="p-4 font-mono text-sm">{chamado.protocolo}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-slate-400" />
                          {chamado.usuarioAbertura}
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <div className="font-medium">
                            {unidades.find(u => u.id === chamado.unidadeId)?.nome || 'N/A'}
                          </div>
                          <div className={`text-sm ${colors.text.secondary}`}>
                            {setores.find(s => s.id === chamado.setorId)?.nome || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          {new Date(chamado.dataAbertura).toLocaleDateString('pt-BR')}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(chamado.status)}`}>
                          {chamado.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              abrirModalChamado(chamado);
                            }}
                            className={`p-2 rounded-lg transition-colors ${
                              theme === 'dark' 
                                ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400' 
                                : 'bg-blue-500/15 hover:bg-blue-500/25 text-blue-500'
                            }`}
                            title="Ver Detalhes"
                          >
                            <Eye className="h-4 w-4" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>

              {chamadosFiltrados.length === 0 && (
                <div className="text-center py-12">
                  <Ticket className={`h-16 w-16 ${
                    theme === 'dark' ? 'text-slate-600' : 'text-slate-400'
                  } mx-auto mb-4`} />
                  <h3 className={`text-lg font-semibold mb-2 ${
                    theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    Nenhum chamado encontrado
                  </h3>
                  <p className={colors.text.muted}>
                    {Object.values(filtros).some(f => f !== "") 
                      ? "Tente ajustar os filtros aplicados" 
                      : "Não há chamados para exibir"
                    }
                  </p>
                </div>
              )}

              {/* Paginação */}
              {chamadosFiltrados.length > itensPorPagina && (
                <div className="flex items-center justify-between mt-6 px-4">
                  <div className={`text-sm ${colors.text.secondary}`}>
                    Mostrando {indiceInicial + 1} a {Math.min(indiceFinal, chamadosFiltrados.length)} de {chamadosFiltrados.length} chamados
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
            </div>
          </div>
        </motion.section>
      </main>

      {/* Modal de Detalhes do Chamado */}
      <AnimatePresence>
        {selectedChamado && (
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
              className={`w-full max-w-4xl rounded-2xl border ${
                theme === 'dark' 
                  ? 'border-blue-500/30 bg-slate-900/80' 
                  : 'border-blue-400/30 bg-white/95'
              } backdrop-blur shadow-2xl max-h-[90vh] overflow-hidden`}
            >
              {/* Header do Modal */}
              <div className="bg-gradient-to-r from-blue-800 to-blue-600 p-6 text-white">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-white/20">
                      <Ticket className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Detalhes do Chamado</h2>
                      <p>Protocolo: {selectedChamado.protocolo}</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={closeModal}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </motion.button>
                </div>
              </div>

              {/* Conteúdo do Modal */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Informações do Chamado */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">Informações do Chamado</h3>
                    
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${colors.text.secondary}`}>Protocolo</label>
                          <p className="font-mono bg-slate-100 dark:bg-slate-800 p-2 rounded-xl">{selectedChamado.protocolo}</p>
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${colors.text.secondary}`}>Status</label>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedChamado.status)}`}>
                            {selectedChamado.status}
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-1 ${colors.text.secondary}`}>Usuário</label>
                        <p className="bg-slate-100 dark:bg-slate-800 p-2 rounded-xl">{selectedChamado.usuarioAbertura}</p>
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-1 ${colors.text.secondary}`}>Unidade</label>
                        <p className="bg-slate-100 dark:bg-slate-800 p-2 rounded-xl">
                          {unidades.find(u => u.id === selectedChamado.unidadeId)?.nome || 'N/A'}
                        </p>
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-1 ${colors.text.secondary}`}>Setor</label>
                        <p className="bg-slate-100 dark:bg-slate-800 p-2 rounded-xl">
                          {setores.find(s => s.id === selectedChamado.setorId)?.nome || 'N/A'}
                        </p>
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-1 ${colors.text.secondary}`}>Data Abertura</label>
                        <p className="bg-slate-100 dark:bg-slate-800 p-2 rounded-xl">
                          {new Date(selectedChamado.dataAbertura).toLocaleDateString('pt-BR')}
                        </p>
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-1 ${colors.text.secondary}`}>Descrição do Problema</label>
                        <p className="bg-slate-100 dark:bg-slate-800 p-3 rounded-xl whitespace-pre-wrap">
                          {selectedChamado.descricaoProblema}
                        </p>
                      </div>

                      {selectedChamado.parecerSuporte && (
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${colors.text.secondary}`}>Parecer do Suporte</label>
                          <p className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl">{selectedChamado.parecerSuporte}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Informações do Material e Ações */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">Material Relacionado</h3>
                    
                    {materialDoChamado ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className={`block text-sm font-medium mb-1 ${colors.text.secondary}`}>Tombamento</label>
                            <p className="font-mono bg-slate-100 dark:bg-slate-800 p-2 rounded-xl">{materialDoChamado.tombamento}</p>
                          </div>
                          <div>
                            <label className={`block text-sm font-medium mb-1 ${colors.text.secondary}`}>Tipo</label>
                            <p className="bg-slate-100 dark:bg-slate-800 p-2 rounded-xl">{materialDoChamado.tipo}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className={`block text-sm font-medium mb-1 ${colors.text.secondary}`}>Marca</label>
                            <p className="bg-slate-100 dark:bg-slate-800 p-2 rounded-xl">{materialDoChamado.marca}</p>
                          </div>
                          <div>
                            <label className={`block text-sm font-medium mb-1 ${colors.text.secondary}`}>Status</label>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getMaterialStatusColor(materialDoChamado.status)}`}>
                              {materialDoChamado.status}
                            </span>
                          </div>
                        </div>

                        {materialDoChamado.especificacoes && (
                          <div>
                            <label className={`block text-sm font-medium mb-1 ${colors.text.secondary}`}>Especificações</label>
                            <p className="bg-slate-100 dark:bg-slate-800 p-3 rounded-xl text-sm">{materialDoChamado.especificacoes}</p>
                          </div>
                        )}

                        {/* Botão para Abrir Manutenção */}
                        <div className="pt-4">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={abrirManutencaoDoMaterial}
                            className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                          >
                            <Wrench className="h-5 w-5" />
                            Abrir Manutenção
                          </motion.button>
                        </div>
                      </div>
                    ) : (
                      <div className={`rounded-xl border-2 border-dashed ${
                        theme === 'dark' 
                          ? 'border-slate-700 bg-slate-800/30' 
                          : 'border-slate-300 bg-slate-50/50'
                      } p-8 text-center backdrop-blur`}>
                        <AlertTriangle className={`h-12 w-12 ${
                          theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
                        } mx-auto mb-4`} />
                        <h3 className={`text-lg font-medium mb-2 ${
                          theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                        }`}>
                          Material Não Encontrado
                        </h3>
                        <p className={colors.text.muted}>
                          O material associado a este chamado não foi encontrado no sistema.
                        </p>
                      </div>
                    )}

                    {/* Seção de Gerenciamento de Status */}
                    <div className="pt-4 border-t">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-medium">Gerenciar Status</h4>
                        {!editandoStatus && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={iniciarEdicaoStatus}
                            className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${
                              theme === 'dark' 
                                ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400' 
                                : 'bg-blue-500/15 hover:bg-blue-500/25 text-blue-600'
                            }`}
                          >
                            <Edit className="h-4 w-4" />
                            Alterar Status
                          </motion.button>
                        )}
                      </div>

                      {editandoStatus && (
                        <div className="space-y-4">
                          <div>
                            <label className={`block text-sm font-medium mb-2 ${colors.text.primary}`}>Novo Status</label>
                            <select
                              value={novoStatus}
                              onChange={(e) => setNovoStatus(e.target.value as StatusChamado)}
                              className={`w-full p-3 rounded-xl border ${
                                colors.input.border
                              } ${
                                colors.input.background
                              } ${
                                colors.input.text
                              } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all backdrop-blur`}
                            >
                              {Object.values(StatusChamado).map(status => (
                                <option key={status} value={status}>{status}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className={`block text-sm font-medium mb-2 ${colors.text.primary}`}>Parecer do Suporte *</label>
                            <textarea
                              value={parecerSuporte}
                              onChange={(e) => setParecerSuporte(e.target.value)}
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
                              placeholder="Descreva a solução aplicada, motivo da alteração ou observações..."
                            />
                          </div>

                          <div className="flex gap-3">
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={cancelarEdicaoStatus}
                              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
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
                              onClick={atualizarStatusChamadoModal}
                              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 px-4 rounded-xl font-medium transition-all"
                            >
                              Confirmar
                            </motion.button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Abertura de Manutenção */}
      <AnimatePresence>
        {showModalManutencao && materialDoChamado && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] grid place-items-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`w-full max-w-2xl rounded-2xl border ${
                theme === 'dark' 
                  ? 'border-orange-500/30 bg-slate-900/80' 
                  : 'border-orange-400/30 bg-white/95'
              } backdrop-blur shadow-2xl`}
            >
              <div className="bg-gradient-to-r from-orange-800 to-orange-600 p-6 text-white">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-white/20">
                      <Wrench className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Abrir Manutenção</h2>
                      <p>Material: {materialDoChamado.tombamento}</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowModalManutencao(false)}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </motion.button>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${colors.text.primary}`}>Descrição do Problema</label>
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
                      } focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all backdrop-blur resize-none`}
                      placeholder="Descreva o problema encontrado no material..."
                      value={descricaoManutencao}
                      onChange={(e) => setDescricaoManutencao(e.target.value)}
                    />
                  </div>

                  <div className={`rounded-xl border ${
                    theme === 'dark' 
                      ? 'border-blue-500/30 bg-blue-500/10' 
                      : 'border-blue-400/30 bg-blue-50/80'
                  } p-4 backdrop-blur`}>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      Informações da Ação
                    </h4>
                    <ul className={`text-sm space-y-1 ${
                      theme === 'dark' ? 'text-blue-300' : 'text-blue-700'
                    }`}>
                      <li>• Uma nova manutenção será criada automaticamente</li>
                      <li>• O chamado será alterado para status &quot;EM_ATENDIMENTO&quot;</li>
                      <li>• Você será redirecionado para a página de manutenções</li>
                    </ul>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowModalManutencao(false)}
                      className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
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
                      onClick={abrirManutencao}
                      className="flex-1 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                    >
                      <Wrench className="h-5 w-5" />
                      Confirmar Manutenção
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rodapé */}
      <footer className={`relative z-10 mx-auto max-w-7xl px-6 pb-8 pt-6 text-center text-xs ${
        theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
      }`}>
        © {new Date().getFullYear()} – Sistema de Suporte TI. Desenvolvido com Next.js e Tailwind.
      </footer>
    </div>
    </DefaultLayout>
  );
}