"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Check, 
  AlertTriangle, 
  Sun, 
  Moon,
  Wrench,
  History,
  Filter
} from "lucide-react";
import { useTheme } from "next-themes";

import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { getUserLocalStorage } from "@/store/userLocalStorage";
import axiosInstance from "@/services/axiosInstance";
import { Material, Manutencao, TipoMaterial, StatusMaterial, Unidade, Setor } from "@/types";

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

const ManutencaoPage = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const user = getUserLocalStorage() || {};
  const [mounted, setMounted] = useState(false);
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [setores, setSetores] = useState<Setor[]>([]);
  const [manutencoes, setManutencoes] = useState<Manutencao[]>([]);
  const [loading, setLoading] = useState(true);
  const [materialSelecionado, setMaterialSelecionado] = useState<Material | null>(null);
  const [descricaoProblema, setDescricaoProblema] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showHistoricoModal, setShowHistoricoModal] = useState(false);
  const [materialHistorico, setMaterialHistorico] = useState<Material | null>(null);
  const [filtros, setFiltros] = useState({
    unidadeId: "",
    setorId: "",
    tombamento: "",
    marca: "",
    tipo: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
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
    carregarMateriais();
    carregarUnidades();
    carregarSetores();
    carregarManutencoes();
  }, []);

  const carregarMateriais = async () => {
    try {
      const response = await axiosInstance.get("/api/materiais");
      setMateriais(response.data);
    } catch (error) {
      console.error("Erro ao carregar materiais:", error);
      setError("Erro ao carregar materiais");
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

  const carregarManutencoes = async () => {
    try {
      const response = await axiosInstance.get("/api/manutencoes");
      setManutencoes(response.data);
    } catch (error) {
      console.error("Erro ao carregar manutenções:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  // Filtrar e ordenar materiais por ID DESC (mais recentes primeiro)
  const materiaisFiltrados = materiais
    .filter(material => {
      return (
        (filtros.unidadeId === "" || material.unidadeId.toString() === filtros.unidadeId) &&
        (filtros.setorId === "" || material.setorId.toString() === filtros.setorId) &&
        (filtros.tombamento === "" || material.tombamento.toLowerCase().includes(filtros.tombamento.toLowerCase())) &&
        (filtros.marca === "" || material.marca.toLowerCase().includes(filtros.marca.toLowerCase())) &&
        (filtros.tipo === "" || material.tipo === filtros.tipo)
      );
    })
    .sort((a, b) => b.id - a.id); // Ordenar por ID DESC (mais recentes primeiro)

  // Paginação
  const totalPaginas = Math.ceil(materiaisFiltrados.length / itensPorPagina);
  const indiceInicial = (paginaAtual - 1) * itensPorPagina;
  const indiceFinal = indiceInicial + itensPorPagina;
  const materiaisPaginados = materiaisFiltrados.slice(indiceInicial, indiceFinal);

  // Resetar página ao mudar filtros
  useEffect(() => {
    setPaginaAtual(1);
  }, [filtros]);

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

  // Controlar scroll do body quando modal estiver aberto
  useEffect(() => {
    if (showModal || showHistoricoModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup ao desmontar
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showModal, showHistoricoModal]);

  const abrirModalManutencao = (material: Material) => {
    setMaterialSelecionado(material);
    setShowModal(true);
  };

  const abrirModalHistorico = (material: Material) => {
    setMaterialHistorico(material);
    setShowHistoricoModal(true);
  };

  const fecharModal = () => {
    setShowModal(false);
    setShowHistoricoModal(false);
    setMaterialSelecionado(null);
    setMaterialHistorico(null);
    setDescricaoProblema("");
    setError("");
  };

  const abrirManutencao = async () => {
    if (!materialSelecionado || !descricaoProblema) {
      setError("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      await axiosInstance.post("/api/manutencoes/abrir", {
        materialId: materialSelecionado.id,
        descricaoProblema: descricaoProblema,
        tecnico: user.nomeCompleto || "Técnico"
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      fecharModal();
      carregarMateriais();
      carregarManutencoes();
      setSuccess("Manutenção aberta com sucesso!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Erro ao abrir manutenção:", error);
      setError("Erro ao abrir manutenção.");
    }
  };

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
                mounted && theme === 'dark' ? 'border-indigo-500' : 'border-blue-600'
              } mx-auto mb-4`}
            />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={mounted ? colors.text.secondary : 'text-slate-600'}
            >
              {loading ? 'Carregando manutenções...' : 'Iniciando aplicação...'}
            </motion.p>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  // Estatísticas
  const materiaisEmDefeito = materiais.filter(m => m.status === StatusMaterial.DEFEITO).length;
  const materiaisEmReparo = materiais.filter(m => m.status === StatusMaterial.EM_REPARO).length;
  const manutencoesAbertas = manutencoes.filter(m => m.status === 'ABERTA').length;

  return (
    <DefaultLayout>
      <div className={`relative min-h-dvh w-full overflow-hidden ${colors.background} ${colors.text.primary}`}>
        {/* Background effects condicionais */}
        {theme === 'dark' && (
          <>
            <div className="pointer-events-none absolute inset-0 opacity-50 [background:repeating-linear-gradient(0deg,rgba(255,255,255,.03)_0px,rgba(255,255,255,.03)_1px,transparent_1px,transparent_3px)]" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1000px_300px_at_50%_-20%,rgba(99,102,241,.25),transparent)]" />
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
                ? 'bg-purple-500/20 ring-1 ring-purple-400/30' 
                : 'bg-purple-500/15 ring-1 ring-purple-400/20'
            }`}>
              <Wrench className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <p className={`text-xs/4 ${colors.text.secondary}`}>Sistema</p>
              <h1 className="font-semibold tracking-wide">Controle de Manutenção</h1>
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
              Controle de Manutenção
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.6 }}
              className={`mx-auto max-w-2xl text-sm md:text-base text-center ${colors.text.secondary}`}
            >
              Gerencie e acompanhe todas as manutenções dos materiais da organização
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

          {/* Filtros */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mx-auto mt-8 max-w-6xl"
          >
            <div className={`rounded-2xl border ${
              theme === 'dark' 
                ? 'border-slate-800/60 bg-slate-900/40 shadow-[0_0_0_1px_rgba(59,130,246,.2)]' 
                : 'border-slate-200/60 bg-white/80 shadow-[0_0_0_1px_rgba(59,130,246,.1)]'
            } p-6 backdrop-blur`}>
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-3 rounded-xl ${
                  theme === 'dark' 
                    ? 'bg-purple-500/15 ring-1 ring-purple-400/30' 
                    : 'bg-purple-500/10 ring-1 ring-purple-400/20'
                }`}>
                  <Filter className={`h-6 w-6 ${
                    theme === 'dark' ? 'text-purple-400' : 'text-purple-500'
                  }`} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Filtros de Busca</h3>
                  <p className={`text-sm ${colors.text.secondary}`}>
                    Encontre materiais específicos para manutenção
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${colors.text.secondary}`}>Unidade</label>
                  <select
                    name="unidadeId"
                    className={`w-full p-3 rounded-xl border ${
                      colors.input.border
                    } ${
                      colors.input.background
                    } ${
                      colors.input.text
                    } focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all backdrop-blur`}
                    value={filtros.unidadeId}
                    onChange={handleFiltroChange}
                  >
                    <option value="">Todas as unidades</option>
                    {unidades.map(unidade => (
                      <option key={unidade.id} value={unidade.id}>{unidade.nome}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${colors.text.secondary}`}>Setor</label>
                  <select
                    name="setorId"
                    className={`w-full p-3 rounded-xl border ${
                      colors.input.border
                    } ${
                      colors.input.background
                    } ${
                      colors.input.text
                    } focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all backdrop-blur`}
                    value={filtros.setorId}
                    onChange={handleFiltroChange}
                  >
                    <option value="">Todos os setores</option>
                    {setores
                      .filter(setor => !filtros.unidadeId || setor.unidadeId.toString() === filtros.unidadeId)
                      .map(setor => (
                        <option key={setor.id} value={setor.id}>{setor.nome}</option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${colors.text.secondary}`}>Tombamento</label>
                  <input
                    type="text"
                    name="tombamento"
                    className={`w-full p-3 rounded-xl border ${
                      colors.input.border
                    } ${
                      colors.input.background
                    } ${
                      colors.input.text
                    } ${
                      colors.input.placeholder
                    } focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all backdrop-blur`}
                    value={filtros.tombamento}
                    onChange={handleFiltroChange}
                    placeholder="Buscar por tombamento"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${colors.text.secondary}`}>Marca</label>
                  <input
                    type="text"
                    name="marca"
                    className={`w-full p-3 rounded-xl border ${
                      colors.input.border
                    } ${
                      colors.input.background
                    } ${
                      colors.input.text
                    } ${
                      colors.input.placeholder
                    } focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all backdrop-blur`}
                    value={filtros.marca}
                    onChange={handleFiltroChange}
                    placeholder="Buscar por marca"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${colors.text.secondary}`}>Tipo</label>
                  <select
                    name="tipo"
                    className={`w-full p-3 rounded-xl border ${
                      colors.input.border
                    } ${
                      colors.input.background
                    } ${
                      colors.input.text
                    } focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all backdrop-blur`}
                    value={filtros.tipo}
                    onChange={handleFiltroChange}
                  >
                    <option value="">Todos os tipos</option>
                    {Object.values(TipoMaterial).map(tipo => (
                      <option key={tipo} value={tipo}>{tipo}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Estatísticas */}
          <section className="mt-6 mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Card Total Materiais */}
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
                  }`}>Total de Materiais</p>
                  <p className="text-3xl font-bold">{materiais.length}</p>
                </div>
                <div className={`p-3 rounded-xl ${
                  theme === 'dark' 
                    ? 'bg-blue-500/20 ring-1 ring-blue-400/30' 
                    : 'bg-blue-500/15 ring-1 ring-blue-400/20'
                }`}>
                  <Wrench className={`h-6 w-6 ${
                    theme === 'dark' ? 'text-blue-400' : 'text-blue-500'
                  }`} />
                </div>
              </div>
            </motion.div>

            {/* Card Em Defeito */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
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
                  }`}>Materiais com Defeito</p>
                  <p className="text-3xl font-bold">{materiaisEmDefeito}</p>
                </div>
                <div className={`p-3 rounded-xl ${
                  theme === 'dark' 
                    ? 'bg-red-500/20 ring-1 ring-red-400/30' 
                    : 'bg-red-500/15 ring-1 ring-red-400/20'
                }`}>
                  <AlertTriangle className={`h-6 w-6 ${
                    theme === 'dark' ? 'text-red-400' : 'text-red-500'
                  }`} />
                </div>
              </div>
            </motion.div>

            {/* Card Em Reparo */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
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
                  }`}>Em Reparo</p>
                  <p className="text-3xl font-bold">{materiaisEmReparo}</p>
                </div>
                <div className={`p-3 rounded-xl ${
                  theme === 'dark' 
                    ? 'bg-yellow-500/20 ring-1 ring-yellow-400/30' 
                    : 'bg-yellow-500/15 ring-1 ring-yellow-400/20'
                }`}>
                  <Wrench className={`h-6 w-6 ${
                    theme === 'dark' ? 'text-yellow-400' : 'text-yellow-500'
                  }`} />
                </div>
              </div>
            </motion.div>

            {/* Card Manutenções Abertas */}
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
                  }`}>Manutenções Abertas</p>
                  <p className="text-3xl font-bold">{manutencoesAbertas}</p>
                </div>
                <div className={`p-3 rounded-xl ${
                  theme === 'dark' 
                    ? 'bg-purple-500/20 ring-1 ring-purple-400/30' 
                    : 'bg-purple-500/15 ring-1 ring-purple-400/20'
                }`}>
                  <History className={`h-6 w-6 ${
                    theme === 'dark' ? 'text-purple-400' : 'text-purple-500'
                  }`} />
                </div>
              </div>
            </motion.div>
          </section>

          {/* Lista de Materiais */}
          <section className="mt-8 mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className={`rounded-2xl border ${
                theme === 'dark' 
                  ? 'border-slate-800/60 bg-slate-900/40 shadow-[0_0_0_1px_rgba(59,130,246,.2)]' 
                  : 'border-slate-200/60 bg-white/80 shadow-[0_0_0_1px_rgba(59,130,246,.1)]'
              } p-6 backdrop-blur`}
            >
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${
                    theme === 'dark' 
                      ? 'bg-purple-500/15 ring-1 ring-purple-400/30' 
                      : 'bg-purple-500/10 ring-1 ring-purple-400/20'
                  }`}>
                    <Wrench className={`h-6 w-6 ${
                      theme === 'dark' ? 'text-purple-400' : 'text-purple-500'
                    }`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Materiais para Manutenção</h3>
                    <p className={`text-sm ${colors.text.secondary}`}>
                      {materiaisFiltrados.length} de {materiais.length} materiais encontrados
                    </p>
                  </div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push("/formularios/manutencao/abertas")}
                  className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-3 px-6 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                >
                  <History className="h-5 w-5 mr-2" />
                  Ver Manutenções Abertas
                </motion.button>
              </div>

              {materiaisFiltrados.length === 0 ? (
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
                    {Object.values(filtros).some(f => f !== "") ? "Nenhum material encontrado" : "Nenhum material cadastrado"}
                  </h3>
                  <p className={`mb-6 ${
                    theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
                  }`}>
                    {Object.values(filtros).some(f => f !== "") ? "Tente ajustar os filtros de busca" : "Todos os materiais estão em perfeito estado"}
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
                        <th className="p-4 text-left font-medium">Tipo</th>
                        <th className="p-4 text-left font-medium">Marca</th>
                        <th className="p-4 text-left font-medium">Status</th>
                        <th className="p-4 text-left font-medium">Unidade</th>
                        <th className="p-4 text-left font-medium">Setor</th>
                        <th className="p-4 text-left font-medium">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {materiaisPaginados.map((material, idx) => (
                        <motion.tr 
                          key={material.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.05 * idx }}
                          className={`border-b ${
                            theme === 'dark' 
                              ? 'border-slate-800/60 hover:bg-slate-800/30' 
                              : 'border-slate-200/60 hover:bg-slate-50/50'
                          } transition-colors cursor-pointer`}
                          onClick={() => abrirModalManutencao(material)}
                        >
                          <td className="p-4 font-mono text-sm">{material.tombamento}</td>
                          <td className="p-4">{material.tipo}</td>
                          <td className="p-4">{material.marca}</td>
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(material.status)}`}>
                              {material.status}
                            </span>
                          </td>
                          <td className="p-4">
                            {unidades.find(u => u.id === material.unidadeId)?.nome || 'N/A'}
                          </td>
                          <td className="p-4">
                            {setores.find(s => s.id === material.setorId)?.nome || 'N/A'}
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  abrirModalManutencao(material);
                                }}
                                className={`p-2 rounded-lg transition-colors ${
                                  theme === 'dark' 
                                    ? 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-400' 
                                    : 'bg-purple-500/15 hover:bg-purple-500/25 text-purple-500'
                                }`}
                                title="Abrir Manutenção"
                              >
                                <Wrench className="h-4 w-4" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  abrirModalHistorico(material);
                                }}
                                className={`p-2 rounded-lg transition-colors ${
                                  theme === 'dark' 
                                    ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400' 
                                    : 'bg-blue-500/15 hover:bg-blue-500/25 text-blue-500'
                                }`}
                                title="Ver Histórico"
                              >
                                <History className="h-4 w-4" />
                              </motion.button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Paginação */}
              {materiaisFiltrados.length > itensPorPagina && (
                <div className="flex items-center justify-between mt-6 px-4">
                  <div className={`text-sm ${colors.text.secondary}`}>
                    Mostrando {indiceInicial + 1} a {Math.min(indiceFinal, materiaisFiltrados.length)} de {materiaisFiltrados.length} materiais
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
                                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
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
            </motion.div>
          </section>
        </main>

        {/* Modal de Manutenção */}
        <AnimatePresence>
          {showModal && materialSelecionado && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
              onClick={fecharModal}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className={`w-full max-w-md rounded-2xl border ${
                  theme === 'dark' 
                    ? 'border-purple-500/30 bg-slate-900/95' 
                    : 'border-purple-400/30 bg-white/95'
                } backdrop-blur shadow-2xl my-8`}
              >
                <div className="bg-gradient-to-r from-purple-800 to-purple-600 p-6 text-white rounded-t-2xl">
                  <h2 className="text-xl font-bold">Abrir Manutenção</h2>
                  <p className="text-purple-200 text-sm mt-1">
                    {materialSelecionado.tombamento} - {materialSelecionado.tipo}
                  </p>
                </div>

                <div className="p-6 space-y-4">
                  {/* Informações do Material */}
                  <div className={`rounded-xl border ${
                    theme === 'dark' 
                      ? 'border-slate-700 bg-slate-800/50' 
                      : 'border-slate-200 bg-slate-50/80'
                  } p-4 backdrop-blur`}>
                    <h3 className="font-semibold mb-2 text-sm">Informações do Material:</h3>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><span className="font-medium">Tipo:</span> {materialSelecionado.tipo}</div>
                      <div><span className="font-medium">Marca:</span> {materialSelecionado.marca}</div>
                      <div><span className="font-medium">Status:</span> 
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs border ${getStatusColor(materialSelecionado.status)}`}>
                          {materialSelecionado.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Campo para Problema */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${colors.text.secondary}`}>
                      Descrição do Problema *
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
                      } focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all backdrop-blur resize-none`}
                      placeholder="Descreva detalhadamente o problema encontrado..."
                      value={descricaoProblema}
                      onChange={(e) => setDescricaoProblema(e.target.value)}
                    />
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
                      onClick={abrirManutencao}
                      disabled={!descricaoProblema.trim()}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed text-white py-3 px-4 rounded-xl transition-all"
                    >
                      <Wrench className="h-4 w-4 mr-2 inline" />
                      Abrir Manutenção
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal de Histórico */}
        <AnimatePresence>
          {showHistoricoModal && materialHistorico && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
              onClick={fecharModal}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className={`w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border ${
                  theme === 'dark' 
                    ? 'border-blue-500/30 bg-slate-900/95' 
                    : 'border-blue-400/30 bg-white/95'
                } backdrop-blur shadow-2xl my-8`}
              >
                <div className="bg-gradient-to-r from-blue-800 to-blue-600 p-6 text-white rounded-t-2xl flex-shrink-0">
                  <h2 className="text-xl font-bold">Histórico de Manutenções</h2>
                  <p className="text-blue-200 text-sm mt-1">
                    {materialHistorico.tombamento} - {materialHistorico.tipo} - {materialHistorico.marca}
                  </p>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                  <div className="space-y-4">
                    {manutencoes
                      .filter(m => m.materialId === materialHistorico.id)
                      .sort((a, b) => new Date(b.dataAbertura).getTime() - new Date(a.dataAbertura).getTime())
                      .map(manutencao => (
                        <motion.div 
                          key={manutencao.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`border rounded-xl p-4 mb-4 backdrop-blur ${
                            theme === 'dark' 
                              ? 'border-slate-700 bg-slate-800/30' 
                              : 'border-slate-200 bg-white/50'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-semibold text-lg">Manutenção #{manutencao.id}</h3>
                              <p className={`text-sm ${
                                theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                              }`}>
                                Técnico: {manutencao.tecnico}
                              </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
                              manutencao.status === 'ABERTA' ? 
                              (theme === 'dark' 
                                ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' 
                                : 'bg-yellow-100 text-yellow-800 border-yellow-200') : 
                              (theme === 'dark' 
                                ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                                : 'bg-green-100 text-green-800 border-green-200')
                            }`}>
                              {manutencao.status}
                            </span>
                          </div>
                          
                          <div className="space-y-2">
                            <div>
                              <strong className={`text-sm ${
                                theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                              }`}>Problema:</strong>
                              <p className={`text-sm ${
                                theme === 'dark' ? 'text-slate-400' : 'text-slate-700'
                              } mt-1`}>
                                {manutencao.descricaoProblema}
                              </p>
                            </div>
                            
                            {manutencao.descricaoSolucao && (
                              <div>
                                <strong className={`text-sm ${
                                  theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                                }`}>Solução:</strong>
                                <p className={`text-sm ${
                                  theme === 'dark' ? 'text-slate-400' : 'text-slate-700'
                                } mt-1`}>
                                  {manutencao.descricaoSolucao}
                                </p>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex justify-between text-xs mt-3 pt-3 border-t border-slate-700/30">
                            <span className={theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}>
                              Abertura: {new Date(manutencao.dataAbertura).toLocaleDateString('pt-BR')} às {new Date(manutencao.dataAbertura).toLocaleTimeString('pt-BR')}
                            </span>
                            {manutencao.dataFechamento && (
                              <span className={theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}>
                                Fechamento: {new Date(manutencao.dataFechamento).toLocaleDateString('pt-BR')} às {new Date(manutencao.dataFechamento).toLocaleTimeString('pt-BR')}
                              </span>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    
                    {manutencoes.filter(m => m.materialId === materialHistorico.id).length === 0 && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-8"
                      >
                        <Wrench className={`h-16 w-16 ${
                          theme === 'dark' ? 'text-slate-600' : 'text-slate-400'
                        } mx-auto mb-4`} />
                        <p className={`text-lg ${
                          theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                        } mb-2`}>Nenhuma manutenção registrada</p>
                        <p className={`${
                          theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
                        }`}>Este material ainda não passou por manutenções.</p>
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Botão de Fechar */}
                <div className="p-6 pt-0 border-t border-slate-700/30 flex-shrink-0">
                  <div className="flex justify-end">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={fecharModal}
                      className={`py-2 px-6 rounded-xl transition-all ${
                        theme === 'dark' 
                          ? 'bg-slate-700 hover:bg-slate-600 text-slate-200' 
                          : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                      }`}
                    >
                      Fechar
                    </motion.button>
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
          © {new Date().getFullYear()} – Sistema de Gestão. Desenvolvido com Next.js e Tailwind.
        </footer>
      </div>
    </DefaultLayout>
  );
};

export default ManutencaoPage;