"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Edit, 
  Trash2, 
  Check, 
  AlertTriangle, 
  Sun, 
  Moon,
  Filter,
  PlusCircle,
  Save,
  X,
  Laptop,
  Eye
} from "lucide-react";
import { useTheme } from "next-themes";

import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { getUserLocalStorage } from "@/store/userLocalStorage";
import axiosInstance from "@/services/axiosInstance";
import { Material, TipoMaterial, StatusMaterial, Unidade, Setor } from "@/types";

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
          <Sun className="w-5 w-5" />
        ) : (
          <Moon className="w-5 w-5" />
        )}
      </motion.div>
    </motion.button>
  );
}

const ListaMateriais = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const user = getUserLocalStorage() || {};
  const [mounted, setMounted] = useState(false);
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [setores, setSetores] = useState<Setor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    tipo: "",
    unidadeId: "",
    setorId: "",
    tombamento: "",
    cadastradoPor: ""
  });
  
  // Estados para paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10;
  
  // Estados para o modal
  const [materialSelecionado, setMaterialSelecionado] = useState<Material | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [materialEditado, setMaterialEditado] = useState<Material | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
    carregarMateriais();
    carregarUnidades();
    carregarSetores();
  }, []);

  const carregarMateriais = async () => {
    try {
      const response = await axiosInstance.get("/api/materiais");
      setMateriais(response.data);
    } catch (error) {
      console.error("Erro ao carregar materiais:", error);
      setError("Erro ao carregar materiais");
    } finally {
      setLoading(false);
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

  const abrirModal = (material: Material) => {
    setMaterialSelecionado(material);
    setMaterialEditado({ ...material });
    setModoEdicao(false);
    setShowModal(true);
    setError("");
  };

  const fecharModal = () => {
    setShowModal(false);
    setMaterialSelecionado(null);
    setMaterialEditado(null);
    setModoEdicao(false);
    setError("");
  };

  const ativarEdicao = () => {
    setModoEdicao(true);
  };

  const cancelarEdicao = () => {
    setModoEdicao(false);
    if (materialSelecionado) {
      setMaterialEditado({ ...materialSelecionado });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (materialEditado) {
      const updatedMaterial = {
        ...materialEditado,
        [name]: name === 'unidadeId' || name === 'setorId' ? Number(value) : value
      };

      // Se a unidade mudou, resetar o setor
      if (name === 'unidadeId') {
        updatedMaterial.setorId = 0;
      }

      setMaterialEditado(updatedMaterial);
    }
    setError("");
  };

  const salvarEdicao = async () => {
    if (!materialEditado) return;

    try {
      await axiosInstance.put(`/api/materiais/${materialEditado.id}`, materialEditado, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      setSuccess("Material atualizado com sucesso!");
      setTimeout(() => setSuccess(""), 3000);
      carregarMateriais();
      fecharModal();
    } catch (error) {
      console.error("Erro ao atualizar material:", error);
      setError("Erro ao atualizar material.");
    }
  };

  const excluirMaterial = async () => {
    if (!materialSelecionado) return;

    const confirmacao = window.confirm(`Tem certeza que deseja excluir o material ${materialSelecionado.tombamento}?`);
    if (!confirmacao) return;

    try {
      await axiosInstance.delete(`/api/materiais/${materialSelecionado.id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      setSuccess("Material excluído com sucesso!");
      setTimeout(() => setSuccess(""), 3000);
      carregarMateriais();
      fecharModal();
    } catch (error) {
      console.error("Erro ao excluir material:", error);
      setError("Erro ao excluir material.");
    }
  };

  const handleFiltroChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'unidadeId') {
      setFiltros(prev => ({ 
        ...prev, 
        [name]: value,
        setorId: ""
      }));
    } else {
      setFiltros(prev => ({ ...prev, [name]: value }));
    }
  };

  // Filtrar materiais e ordenar por ID DESC (mais recentes primeiro)
  const materiaisFiltrados = materiais
    .filter(material => {
      return (
        (filtros.tipo === "" || material.tipo === filtros.tipo) &&
        (filtros.unidadeId === "" || material.unidadeId.toString() === filtros.unidadeId) &&
        (filtros.setorId === "" || material.setorId?.toString() === filtros.setorId) &&
        (filtros.tombamento === "" || material.tombamento.toLowerCase().includes(filtros.tombamento.toLowerCase())) &&
        (filtros.cadastradoPor === "" || material.cadastradoPor.toLowerCase().includes(filtros.cadastradoPor.toLowerCase()))
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

  // Estatísticas
  const totalMateriais = materiais.length;
  const materiaisFuncionando = materiais.filter(m => m.status === StatusMaterial.FUNCIONANDO).length;
  const materiaisDefeito = materiais.filter(m => m.status === StatusMaterial.DEFEITO).length;
  const materiaisReparo = materiais.filter(m => m.status === StatusMaterial.EM_REPARO).length;

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
                mounted && theme === 'dark' ? 'border-blue-500' : 'border-blue-600'
              } mx-auto mb-4`}
            />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={mounted ? colors.text.secondary : 'text-slate-600'}
            >
              {loading ? 'Carregando materiais...' : 'Iniciando aplicação...'}
            </motion.p>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className={`relative min-h-dvh w-full overflow-hidden ${colors.background} ${colors.text.primary}`}>
        {/* Background effects condicionais */}
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
              <Laptop className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <p className={`text-xs/4 ${colors.text.secondary}`}>Sistema</p>
              <h1 className="font-semibold tracking-wide">Lista de Materiais</h1>
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
              Gestão de Materiais • {user.nomeCompleto || 'Usuário'}
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
              Materiais Cadastrados
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.6 }}
              className={`mx-auto max-w-2xl text-sm md:text-base text-center ${colors.text.secondary}`}
            >
              Gerencie e visualize todos os materiais de TI da organização
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
                  <p className="text-3xl font-bold">{totalMateriais}</p>
                </div>
                <div className={`p-3 rounded-xl ${
                  theme === 'dark' 
                    ? 'bg-blue-500/20 ring-1 ring-blue-400/30' 
                    : 'bg-blue-500/15 ring-1 ring-blue-400/20'
                }`}>
                  <Laptop className={`h-6 w-6 ${
                    theme === 'dark' ? 'text-blue-400' : 'text-blue-500'
                  }`} />
                </div>
              </div>
            </motion.div>

            {/* Card Funcionando */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
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
                  }`}>Funcionando</p>
                  <p className="text-3xl font-bold">{materiaisFuncionando}</p>
                </div>
                <div className={`p-3 rounded-xl ${
                  theme === 'dark' 
                    ? 'bg-green-500/20 ring-1 ring-green-400/30' 
                    : 'bg-green-500/15 ring-1 ring-green-400/20'
                }`}>
                  <Check className={`h-6 w-6 ${
                    theme === 'dark' ? 'text-green-400' : 'text-green-500'
                  }`} />
                </div>
              </div>
            </motion.div>

            {/* Card Com Defeito */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
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
                  }`}>Com Defeito</p>
                  <p className="text-3xl font-bold">{materiaisDefeito}</p>
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
              transition={{ delay: 0.5 }}
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
                  <p className="text-3xl font-bold">{materiaisReparo}</p>
                </div>
                <div className={`p-3 rounded-xl ${
                  theme === 'dark' 
                    ? 'bg-yellow-500/20 ring-1 ring-yellow-400/30' 
                    : 'bg-yellow-500/15 ring-1 ring-yellow-400/20'
                }`}>
                  <Laptop className={`h-6 w-6 ${
                    theme === 'dark' ? 'text-yellow-400' : 'text-yellow-500'
                  }`} />
                </div>
              </div>
            </motion.div>
          </section>

          {/* Filtros */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
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
                    ? 'bg-blue-500/15 ring-1 ring-blue-400/30' 
                    : 'bg-blue-500/10 ring-1 ring-blue-400/20'
                }`}>
                  <Filter className={`h-6 w-6 ${
                    theme === 'dark' ? 'text-blue-400' : 'text-blue-500'
                  }`} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Filtros de Busca</h3>
                  <p className={`text-sm ${colors.text.secondary}`}>
                    Encontre materiais específicos
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all backdrop-blur`}
                    value={filtros.tipo}
                    onChange={handleFiltroChange}
                  >
                    <option value="">Todos</option>
                    {Object.values(TipoMaterial).map(tipo => (
                      <option key={tipo} value={tipo}>{tipo}</option>
                    ))}
                  </select>
                </div>
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
                  <label className={`block text-sm font-medium mb-2 ${colors.text.secondary}`}>Setor</label>
                  <select
                    name="setorId"
                    className={`w-full p-3 rounded-xl border ${
                      colors.input.border
                    } ${
                      colors.input.background
                    } ${
                      colors.input.text
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all backdrop-blur disabled:opacity-50`}
                    value={filtros.setorId}
                    onChange={handleFiltroChange}
                    disabled={!filtros.unidadeId}
                  >
                    <option value="">Todos os setores</option>
                    {filtros.unidadeId && setores
                      .filter(setor => setor.unidadeId === Number(filtros.unidadeId))
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
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all backdrop-blur`}
                    value={filtros.tombamento}
                    onChange={handleFiltroChange}
                    placeholder="Buscar por tombamento"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${colors.text.secondary}`}>Cadastrado por</label>
                  <input
                    type="text"
                    name="cadastradoPor"
                    className={`w-full p-3 rounded-xl border ${
                      colors.input.border
                    } ${
                      colors.input.background
                    } ${
                      colors.input.text
                    } ${
                      colors.input.placeholder
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all backdrop-blur`}
                    value={filtros.cadastradoPor}
                    onChange={handleFiltroChange}
                    placeholder="Buscar por usuário"
                  />
                </div>
              </div>
            </div>
          </motion.section>

          {/* Tabela de Materiais */}
          <section className="mt-8 mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
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
                      ? 'bg-blue-500/15 ring-1 ring-blue-400/30' 
                      : 'bg-blue-500/10 ring-1 ring-blue-400/20'
                  }`}>
                    <Laptop className={`h-6 w-6 ${
                      theme === 'dark' ? 'text-blue-400' : 'text-blue-500'
                    }`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Materiais Cadastrados</h3>
                    <p className={`text-sm ${colors.text.secondary}`}>
                      {materiaisFiltrados.length} de {materiais.length} materiais encontrados
                    </p>
                  </div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push("/formularios/materiais")}
                  className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-6 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <PlusCircle className="h-5 w-5 mr-2" />
                  Novo Material
                </motion.button>
              </div>

              {materiaisFiltrados.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <Laptop className={`h-16 w-16 ${
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
                    {Object.values(filtros).some(f => f !== "") ? "Tente ajustar os filtros de busca" : "Comece cadastrando o primeiro material"}
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push("/formularios/materiais")}
                    className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-6 font-medium transition-all"
                  >
                    <PlusCircle className="h-5 w-5 mr-2" />
                    Cadastrar Material
                  </motion.button>
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
                        <th className="p-4 text-left font-medium">Cadastrado por</th>
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
                          onClick={() => abrirModal(material)}
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
                            {material.setorId ? setores.find(s => s.id === material.setorId)?.nome || 'N/A' : 'N/A'}
                          </td>
                          <td className="p-4">{material.cadastradoPor}</td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  abrirModal(material);
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
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  abrirModal(material);
                                  ativarEdicao();
                                }}
                                className={`p-2 rounded-lg transition-colors ${
                                  theme === 'dark' 
                                    ? 'bg-green-500/20 hover:bg-green-500/30 text-green-400' 
                                    : 'bg-green-500/15 hover:bg-green-500/25 text-green-500'
                                }`}
                                title="Editar"
                              >
                                <Edit className="h-4 w-4" />
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
                          // Mostrar sempre primeira, última e páginas próximas da atual
                          return pagina === 1 || 
                                 pagina === totalPaginas || 
                                 (pagina >= paginaAtual - 1 && pagina <= paginaAtual + 1);
                        })
                        .map((pagina, idx, array) => {
                          // Adicionar "..." se houver gap
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
            </motion.div>
          </section>
        </main>

        {/* Modal de Detalhes/Edição do Material */}
        <AnimatePresence>
          {showModal && materialSelecionado && materialEditado && (
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
                <div className="bg-gradient-to-r from-blue-800 to-blue-600 p-6 text-white">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-bold">
                        {modoEdicao ? 'Editar Material' : 'Detalhes do Material'}
                      </h2>
                      <p className="text-blue-200 text-sm mt-1">
                        Tombamento: {materialSelecionado.tombamento}
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={fecharModal}
                      className="text-white hover:text-gray-200 transition-colors"
                    >
                      <X className="h-6 w-6" />
                    </motion.button>
                  </div>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Coluna Esquerda */}
                    <div className="space-y-4">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${colors.text.secondary}`}>Tombamento</label>
                        {modoEdicao ? (
                          <input
                            type="text"
                            name="tombamento"
                            value={materialEditado.tombamento}
                            onChange={handleInputChange}
                            className={`w-full p-3 rounded-xl border ${
                              colors.input.border
                            } ${
                              colors.input.background
                            } ${
                              colors.input.text
                            } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all backdrop-blur font-mono`}
                            placeholder="Número do tombamento"
                          />
                        ) : (
                          <p className={`font-mono p-3 rounded-xl ${
                            theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-50/80'
                          } backdrop-blur`}>{materialSelecionado.tombamento}</p>
                        )}
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${colors.text.secondary}`}>Tipo do Material</label>
                        {modoEdicao ? (
                          <select
                            name="tipo"
                            value={materialEditado.tipo}
                            onChange={handleInputChange}
                            className={`w-full p-3 rounded-xl border ${
                              colors.input.border
                            } ${
                              colors.input.background
                            } ${
                              colors.input.text
                            } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all backdrop-blur`}
                          >
                            {Object.values(TipoMaterial).map(tipo => (
                              <option key={tipo} value={tipo}>{tipo}</option>
                            ))}
                          </select>
                        ) : (
                          <p className={`p-3 rounded-xl ${
                            theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-50/80'
                          } backdrop-blur`}>{materialSelecionado.tipo}</p>
                        )}
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${colors.text.secondary}`}>Marca</label>
                        {modoEdicao ? (
                          <input
                            type="text"
                            name="marca"
                            value={materialEditado.marca}
                            onChange={handleInputChange}
                            className={`w-full p-3 rounded-xl border ${
                              colors.input.border
                            } ${
                              colors.input.background
                            } ${
                              colors.input.text
                            } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all backdrop-blur`}
                            placeholder="Marca do material"
                          />
                        ) : (
                          <p className={`p-3 rounded-xl ${
                            theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-50/80'
                          } backdrop-blur`}>{materialSelecionado.marca}</p>
                        )}
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${colors.text.secondary}`}>Status</label>
                        {modoEdicao ? (
                          <select
                            name="status"
                            value={materialEditado.status}
                            onChange={handleInputChange}
                            className={`w-full p-3 rounded-xl border ${
                              colors.input.border
                            } ${
                              colors.input.background
                            } ${
                              colors.input.text
                            } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all backdrop-blur`}
                          >
                            {Object.values(StatusMaterial).map(status => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                        ) : (
                          <span className={`inline-block px-3 py-2 rounded-lg text-sm font-medium border ${getStatusColor(materialSelecionado.status)}`}>
                            {materialSelecionado.status}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Coluna Direita */}
                    <div className="space-y-4">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${colors.text.secondary}`}>Unidade</label>
                        {modoEdicao ? (
                          <select
                            name="unidadeId"
                            value={materialEditado.unidadeId}
                            onChange={handleInputChange}
                            className={`w-full p-3 rounded-xl border ${
                              colors.input.border
                            } ${
                              colors.input.background
                            } ${
                              colors.input.text
                            } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all backdrop-blur`}
                          >
                            <option value="">Selecione uma unidade</option>
                            {unidades.map(unidade => (
                              <option key={unidade.id} value={unidade.id}>{unidade.nome}</option>
                            ))}
                          </select>
                        ) : (
                          <p className={`p-3 rounded-xl ${
                            theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-50/80'
                          } backdrop-blur`}>
                            {unidades.find(u => u.id === materialSelecionado.unidadeId)?.nome || 'N/A'}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${colors.text.secondary}`}>Setor</label>
                        {modoEdicao ? (
                          <select
                            name="setorId"
                            value={materialEditado.setorId || ''}
                            onChange={handleInputChange}
                            className={`w-full p-3 rounded-xl border ${
                              colors.input.border
                            } ${
                              colors.input.background
                            } ${
                              colors.input.text
                            } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all backdrop-blur`}
                          >
                            <option value="">Selecione um setor</option>
                            {setores
                              .filter(setor => setor.unidadeId === Number(materialEditado.unidadeId))
                              .map(setor => (
                                <option key={setor.id} value={setor.id}>{setor.nome}</option>
                              ))}
                          </select>
                        ) : (
                          <p className={`p-3 rounded-xl ${
                            theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-50/80'
                          } backdrop-blur`}>
                            {setores.find(s => s.id === materialSelecionado.setorId)?.nome || 'N/A'}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${colors.text.secondary}`}>Cadastrado Por</label>
                        <p className={`p-3 rounded-xl ${
                          theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-50/80'
                        } backdrop-blur`}>{materialSelecionado.cadastradoPor}</p>
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${colors.text.secondary}`}>Data de Cadastro</label>
                        <p className={`p-3 rounded-xl ${
                          theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-50/80'
                        } backdrop-blur`}>
                          {new Date(materialSelecionado.dataCadastro).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>

                    {/* Especificações - Largura total */}
                    <div className="md:col-span-2">
                      <label className={`block text-sm font-medium mb-2 ${colors.text.secondary}`}>Especificações</label>
                      {modoEdicao ? (
                        <textarea
                          name="especificacoes"
                          value={materialEditado.especificacoes}
                          onChange={handleInputChange}
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
                          placeholder="Descreva as especificações técnicas do material..."
                        />
                      ) : (
                        <p className={`p-3 rounded-xl h-24 overflow-y-auto ${
                          theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-50/80'
                        } backdrop-blur`}>
                          {materialSelecionado.especificacoes || 'Nenhuma especificação cadastrada'}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex gap-4 mt-8 pt-6 border-t border-slate-700/30">
                    {modoEdicao ? (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={cancelarEdicao}
                          className={`flex-1 py-3 px-6 rounded-xl transition-all ${
                            theme === 'dark' 
                              ? 'bg-slate-700 hover:bg-slate-600 text-slate-200' 
                              : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                          } flex items-center justify-center`}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancelar
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={salvarEdicao}
                          className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 px-6 rounded-xl transition-all flex items-center justify-center"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Salvar Alterações
                        </motion.button>
                      </>
                    ) : (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={fecharModal}
                          className={`flex-1 py-3 px-6 rounded-xl transition-all ${
                            theme === 'dark' 
                              ? 'bg-slate-700 hover:bg-slate-600 text-slate-200' 
                              : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                          } flex items-center justify-center`}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Fechar
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={excluirMaterial}
                          className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 px-6 rounded-xl transition-all flex items-center justify-center"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir Material
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={ativarEdicao}
                          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-6 rounded-xl transition-all flex items-center justify-center"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Editar Material
                        </motion.button>
                      </>
                    )}
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

export default ListaMateriais;