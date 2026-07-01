"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Car, 
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
  Eye,
  Search,
  Fuel,
  Users,
  Calendar,
  Hash,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useTheme } from "next-themes";

import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { getUserLocalStorage } from "@/store/userLocalStorage";
import axiosInstance from "@/services/axiosInstance";

// Types baseados no controller
interface VeiculoResponseDTO {
  id: number;
  placa: string;
  renavam: string;
  chassi: string;
  modelo: string;
  marca: string;
  anoFabricacao: number;
  anoModelo: number;
  cor: string;
  tipoCombustivel: string;
  capacidadePassageiros: number;
  observacoes?: string;
  status: string;
  dataCadastro: string;
  cadastradoPor: string;
}

interface VeiculoStatusDTO {
  status: string;
}

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

const ListaVeiculos = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const user = getUserLocalStorage() || {};
  const [mounted, setMounted] = useState(false);
  const [veiculos, setVeiculos] = useState<VeiculoResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    placa: "",
    modelo: "",
    marca: "",
    status: "",
    tipoCombustivel: ""
  });
  
  // Estados para paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10;
  
  // Estados para o modal
  const [veiculoSelecionado, setVeiculoSelecionado] = useState<VeiculoResponseDTO | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [veiculoEditado, setVeiculoEditado] = useState<VeiculoResponseDTO | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Estado para o modal de status
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [novoStatus, setNovoStatus] = useState("");

  // Status disponíveis para veículos
  const statusOptions = [
    "DISPONIVEL",
    "EM_USO",
    "EM_MANUTENCAO",
    "INDISPONIVEL",
    "DESATIVADO"
  ];

  const statusColors: Record<string, string> = {
    DISPONIVEL: theme === 'dark' 
      ? 'bg-green-500/20 text-green-400 border-green-500/30' 
      : 'bg-green-100 text-green-800 border-green-200',
    EM_USO: theme === 'dark' 
      ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' 
      : 'bg-blue-100 text-blue-800 border-blue-200',
    EM_MANUTENCAO: theme === 'dark' 
      ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' 
      : 'bg-yellow-100 text-yellow-800 border-yellow-200',
    INDISPONIVEL: theme === 'dark' 
      ? 'bg-red-500/20 text-red-400 border-red-500/30' 
      : 'bg-red-100 text-red-800 border-red-200',
    DESATIVADO: theme === 'dark' 
      ? 'bg-gray-500/20 text-gray-400 border-gray-500/30' 
      : 'bg-gray-100 text-gray-800 border-gray-200',
  };

  const statusLabels: Record<string, string> = {
    DISPONIVEL: 'Disponível',
    EM_USO: 'Em Uso',
    EM_MANUTENCAO: 'Em Manutenção',
    INDISPONIVEL: 'Indisponível',
    DESATIVADO: 'Desativado'
  };

  const combustivelLabels: Record<string, string> = {
    GASOLINA: 'Gasolina',
    ETANOL: 'Etanol',
    FLEX: 'Flex',
    DIESEL: 'Diesel',
    GNV: 'GNV',
    ELETRICO: 'Elétrico',
    HIBRIDO: 'Híbrido'
  };

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
    carregarVeiculos();
  }, []);

  const carregarVeiculos = async () => {
    try {
      const response = await axiosInstance.get("/veiculos");
      setVeiculos(response.data);
    } catch (error) {
      console.error("Erro ao carregar veículos:", error);
      setError("Erro ao carregar veículos");
    } finally {
      setLoading(false);
    }
  };

  const abrirModal = (veiculo: VeiculoResponseDTO) => {
    setVeiculoSelecionado(veiculo);
    setVeiculoEditado({ ...veiculo });
    setModoEdicao(false);
    setShowModal(true);
    setError("");
  };

  const fecharModal = () => {
    setShowModal(false);
    setVeiculoSelecionado(null);
    setVeiculoEditado(null);
    setModoEdicao(false);
    setError("");
  };

  const ativarEdicao = () => {
    setModoEdicao(true);
  };

  const cancelarEdicao = () => {
    setModoEdicao(false);
    if (veiculoSelecionado) {
      setVeiculoEditado({ ...veiculoSelecionado });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (veiculoEditado) {
      setVeiculoEditado({
        ...veiculoEditado,
        [name]: type === 'number' ? (value ? Number(value) : '') : value
      });
    }
    setError("");
  };

  const salvarEdicao = async () => {
    if (!veiculoEditado) return;

    try {
      await axiosInstance.put(`/veiculos/${veiculoEditado.id}`, veiculoEditado, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      setSuccess("Veículo atualizado com sucesso!");
      setTimeout(() => setSuccess(""), 3000);
      carregarVeiculos();
      fecharModal();
    } catch (error) {
      console.error("Erro ao atualizar veículo:", error);
      setError("Erro ao atualizar veículo.");
    }
  };

  const excluirVeiculo = async () => {
    if (!veiculoSelecionado) return;

    const confirmacao = window.confirm(`Tem certeza que deseja excluir o veículo ${veiculoSelecionado.placa}?`);
    if (!confirmacao) return;

    try {
      await axiosInstance.delete(`/veiculos/${veiculoSelecionado.id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      setSuccess("Veículo excluído com sucesso!");
      setTimeout(() => setSuccess(""), 3000);
      carregarVeiculos();
      fecharModal();
    } catch (error) {
      console.error("Erro ao excluir veículo:", error);
      setError("Erro ao excluir veículo.");
    }
  };

  const abrirStatusModal = (veiculo: VeiculoResponseDTO) => {
    setVeiculoSelecionado(veiculo);
    setNovoStatus(veiculo.status);
    setShowStatusModal(true);
  };

  const fecharStatusModal = () => {
    setShowStatusModal(false);
    setVeiculoSelecionado(null);
    setNovoStatus("");
  };

  const atualizarStatus = async () => {
    if (!veiculoSelecionado || !novoStatus) return;

    try {
      const statusDTO: VeiculoStatusDTO = { status: novoStatus };
      await axiosInstance.patch(`/veiculos/${veiculoSelecionado.id}/status`, statusDTO, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      setSuccess("Status atualizado com sucesso!");
      setTimeout(() => setSuccess(""), 3000);
      carregarVeiculos();
      fecharStatusModal();
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      setError("Erro ao atualizar status do veículo.");
    }
  };

  const handleFiltroChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  // Filtrar veículos e ordenar por ID DESC (mais recentes primeiro)
  const veiculosFiltrados = veiculos
    .filter(veiculo => {
      return (
        (filtros.placa === "" || veiculo.placa.toLowerCase().includes(filtros.placa.toLowerCase())) &&
        (filtros.modelo === "" || veiculo.modelo.toLowerCase().includes(filtros.modelo.toLowerCase())) &&
        (filtros.marca === "" || veiculo.marca.toLowerCase().includes(filtros.marca.toLowerCase())) &&
        (filtros.status === "" || veiculo.status === filtros.status) &&
        (filtros.tipoCombustivel === "" || veiculo.tipoCombustivel === filtros.tipoCombustivel)
      );
    })
    .sort((a, b) => b.id - a.id); // Ordenar por ID DESC (mais recentes primeiro)

  // Paginação
  const totalPaginas = Math.ceil(veiculosFiltrados.length / itensPorPagina);
  const indiceInicial = (paginaAtual - 1) * itensPorPagina;
  const indiceFinal = indiceInicial + itensPorPagina;
  const veiculosPaginados = veiculosFiltrados.slice(indiceInicial, indiceFinal);

  // Resetar página ao mudar filtros
  useEffect(() => {
    setPaginaAtual(1);
  }, [filtros]);

  // Estatísticas
  const totalVeiculos = veiculos.length;
  const veiculosDisponiveis = veiculos.filter(v => v.status === "DISPONIVEL").length;
  const veiculosEmUso = veiculos.filter(v => v.status === "EM_USO").length;
  const veiculosManutencao = veiculos.filter(v => v.status === "EM_MANUTENCAO").length;

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
              {loading ? 'Carregando veículos...' : 'Iniciando aplicação...'}
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
              <Car className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <p className={`text-xs/4 ${colors.text.secondary}`}>Sistema</p>
              <h1 className="font-semibold tracking-wide">Lista de Veículos</h1>
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
              Gestão de Veículos • {user.nomeCompleto || 'Usuário'}
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
              Veículos Cadastrados
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.6 }}
              className={`mx-auto max-w-2xl text-sm md:text-base text-center ${colors.text.secondary}`}
            >
              Gerencie e visualize todos os veículos da frota
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
            {/* Card Total Veículos */}
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
                  }`}>Total de Veículos</p>
                  <p className="text-3xl font-bold">{totalVeiculos}</p>
                </div>
                <div className={`p-3 rounded-xl ${
                  theme === 'dark' 
                    ? 'bg-blue-500/20 ring-1 ring-blue-400/30' 
                    : 'bg-blue-500/15 ring-1 ring-blue-400/20'
                }`}>
                  <Car className={`h-6 w-6 ${
                    theme === 'dark' ? 'text-blue-400' : 'text-blue-500'
                  }`} />
                </div>
              </div>
            </motion.div>

            {/* Card Disponíveis */}
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
                  }`}>Disponíveis</p>
                  <p className="text-3xl font-bold">{veiculosDisponiveis}</p>
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

            {/* Card Em Uso */}
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
                  }`}>Em Uso</p>
                  <p className="text-3xl font-bold">{veiculosEmUso}</p>
                </div>
                <div className={`p-3 rounded-xl ${
                  theme === 'dark' 
                    ? 'bg-blue-500/20 ring-1 ring-blue-400/30' 
                    : 'bg-blue-500/15 ring-1 ring-blue-400/20'
                }`}>
                  <Car className={`h-6 w-6 ${
                    theme === 'dark' ? 'text-blue-400' : 'text-blue-500'
                  }`} />
                </div>
              </div>
            </motion.div>

            {/* Card Em Manutenção */}
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
                  }`}>Em Manutenção</p>
                  <p className="text-3xl font-bold">{veiculosManutencao}</p>
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
                    Encontre veículos específicos
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${colors.text.secondary}`}>Placa</label>
                  <input
                    type="text"
                    name="placa"
                    className={`w-full p-3 rounded-xl border ${
                      colors.input.border
                    } ${
                      colors.input.background
                    } ${
                      colors.input.text
                    } ${
                      colors.input.placeholder
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all backdrop-blur uppercase`}
                    value={filtros.placa}
                    onChange={handleFiltroChange}
                    placeholder="Buscar por placa"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${colors.text.secondary}`}>Modelo</label>
                  <input
                    type="text"
                    name="modelo"
                    className={`w-full p-3 rounded-xl border ${
                      colors.input.border
                    } ${
                      colors.input.background
                    } ${
                      colors.input.text
                    } ${
                      colors.input.placeholder
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all backdrop-blur`}
                    value={filtros.modelo}
                    onChange={handleFiltroChange}
                    placeholder="Buscar por modelo"
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
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all backdrop-blur`}
                    value={filtros.marca}
                    onChange={handleFiltroChange}
                    placeholder="Buscar por marca"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${colors.text.secondary}`}>Status</label>
                  <select
                    name="status"
                    className={`w-full p-3 rounded-xl border ${
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
                    {statusOptions.map(status => (
                      <option key={status} value={status}>{statusLabels[status]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${colors.text.secondary}`}>Combustível</label>
                  <select
                    name="tipoCombustivel"
                    className={`w-full p-3 rounded-xl border ${
                      colors.input.border
                    } ${
                      colors.input.background
                    } ${
                      colors.input.text
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all backdrop-blur`}
                    value={filtros.tipoCombustivel}
                    onChange={handleFiltroChange}
                  >
                    <option value="">Todos</option>
                    {Object.entries(combustivelLabels).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Tabela de Veículos */}
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
                    <Car className={`h-6 w-6 ${
                      theme === 'dark' ? 'text-blue-400' : 'text-blue-500'
                    }`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Veículos Cadastrados</h3>
                    <p className={`text-sm ${colors.text.secondary}`}>
                      {veiculosFiltrados.length} de {veiculos.length} veículos encontrados
                    </p>
                  </div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push("/formularios/veiculos")}
                  className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-6 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <PlusCircle className="h-5 w-5 mr-2" />
                  Novo Veículo
                </motion.button>
              </div>

              {veiculosFiltrados.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <Car className={`h-16 w-16 ${
                    theme === 'dark' ? 'text-slate-600' : 'text-slate-400'
                  } mx-auto mb-4`} />
                  <h3 className={`text-lg font-semibold mb-2 ${
                    theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    {Object.values(filtros).some(f => f !== "") ? "Nenhum veículo encontrado" : "Nenhum veículo cadastrado"}
                  </h3>
                  <p className={`mb-6 ${
                    theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
                  }`}>
                    {Object.values(filtros).some(f => f !== "") ? "Tente ajustar os filtros de busca" : "Comece cadastrando o primeiro veículo"}
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push("/formularios/veiculos")}
                    className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-6 font-medium transition-all"
                  >
                    <PlusCircle className="h-5 w-5 mr-2" />
                    Cadastrar Veículo
                  </motion.button>
                </motion.div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className={`${
                      theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-50/80'
                    } backdrop-blur`}>
                      <tr>
                        <th className="p-4 text-left font-medium">Placa</th>
                        <th className="p-4 text-left font-medium">Modelo/Marca</th>
                        <th className="p-4 text-left font-medium">Ano</th>
                        <th className="p-4 text-left font-medium">Cor</th>
                        <th className="p-4 text-left font-medium">Combustível</th>
                        <th className="p-4 text-left font-medium">Status</th>
                        <th className="p-4 text-left font-medium">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {veiculosPaginados.map((veiculo, idx) => (
                        <motion.tr 
                          key={veiculo.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.05 * idx }}
                          className={`border-b ${
                            theme === 'dark' 
                              ? 'border-slate-800/60 hover:bg-slate-800/30' 
                              : 'border-slate-200/60 hover:bg-slate-50/50'
                          } transition-colors cursor-pointer`}
                          onClick={() => abrirModal(veiculo)}
                        >
                          <td className="p-4 font-mono text-sm font-semibold">
                            {veiculo.placa}
                          </td>
                          <td className="p-4">
                            <div>
                              <div className="font-medium">{veiculo.modelo}</div>
                              <div className={`text-xs ${colors.text.secondary}`}>{veiculo.marca}</div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{veiculo.anoFabricacao}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-4 h-4 rounded-full border border-slate-300/50" 
                                style={{ backgroundColor: veiculo.cor.toLowerCase() }}
                              />
                              <span>{veiculo.cor}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1">
                              <Fuel className="h-3 w-3" />
                              <span className="text-sm">{combustivelLabels[veiculo.tipoCombustivel] || veiculo.tipoCombustivel}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[veiculo.status]}`}>
                              {statusLabels[veiculo.status] || veiculo.status}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  abrirModal(veiculo);
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
                                  abrirStatusModal(veiculo);
                                }}
                                className={`p-2 rounded-lg transition-colors ${
                                  theme === 'dark' 
                                    ? 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400' 
                                    : 'bg-yellow-500/15 hover:bg-yellow-500/25 text-yellow-500'
                                }`}
                                title="Alterar Status"
                              >
                                <AlertTriangle className="h-4 w-4" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/formularios/veiculos?id=${veiculo.id}`);
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
              {veiculosFiltrados.length > itensPorPagina && (
                <div className="flex items-center justify-between mt-6 px-4">
                  <div className={`text-sm ${colors.text.secondary}`}>
                    Mostrando {indiceInicial + 1} a {Math.min(indiceFinal, veiculosFiltrados.length)} de {veiculosFiltrados.length} veículos
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
                      <ChevronLeft className="h-4 w-4" />
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
                      <ChevronRight className="h-4 w-4" />
                    </motion.button>
                  </div>
                </div>
              )}
            </motion.div>
          </section>
        </main>

        {/* Modal de Detalhes/Edição do Veículo */}
        <AnimatePresence>
          {showModal && veiculoSelecionado && veiculoEditado && (
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
                        {modoEdicao ? 'Editar Veículo' : 'Detalhes do Veículo'}
                      </h2>
                      <p className="text-blue-200 text-sm mt-1">
                        Placa: {veiculoSelecionado.placa}
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
                        <label className={`block text-sm font-medium mb-2 ${colors.text.secondary}`}>Placa</label>
                        {modoEdicao ? (
                          <input
                            type="text"
                            name="placa"
                            value={veiculoEditado.placa}
                            onChange={handleInputChange}
                            className={`w-full p-3 rounded-xl border ${
                              colors.input.border
                            } ${
                              colors.input.background
                            } ${
                              colors.input.text
                            } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all backdrop-blur font-mono uppercase`}
                            placeholder="AAA-0000"
                          />
                        ) : (
                          <p className={`font-mono p-3 rounded-xl ${
                            theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-50/80'
                          } backdrop-blur`}>{veiculoSelecionado.placa}</p>
                        )}
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${colors.text.secondary}`}>Modelo</label>
                        {modoEdicao ? (
                          <input
                            type="text"
                            name="modelo"
                            value={veiculoEditado.modelo}
                            onChange={handleInputChange}
                            className={`w-full p-3 rounded-xl border ${
                              colors.input.border
                            } ${
                              colors.input.background
                            } ${
                              colors.input.text
                            } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all backdrop-blur`}
                            placeholder="Modelo do veículo"
                          />
                        ) : (
                          <p className={`p-3 rounded-xl ${
                            theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-50/80'
                          } backdrop-blur`}>{veiculoSelecionado.modelo}</p>
                        )}
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${colors.text.secondary}`}>Marca</label>
                        {modoEdicao ? (
                          <input
                            type="text"
                            name="marca"
                            value={veiculoEditado.marca}
                            onChange={handleInputChange}
                            className={`w-full p-3 rounded-xl border ${
                              colors.input.border
                            } ${
                              colors.input.background
                            } ${
                              colors.input.text
                            } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all backdrop-blur`}
                            placeholder="Marca do veículo"
                          />
                        ) : (
                          <p className={`p-3 rounded-xl ${
                            theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-50/80'
                          } backdrop-blur`}>{veiculoSelecionado.marca}</p>
                        )}
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${colors.text.secondary}`}>Cor</label>
                        {modoEdicao ? (
                          <div className="flex gap-3">
                            <input
                              type="text"
                              name="cor"
                              value={veiculoEditado.cor}
                              onChange={handleInputChange}
                              className={`flex-1 p-3 rounded-xl border ${
                                colors.input.border
                              } ${
                                colors.input.background
                              } ${
                                colors.input.text
                              } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all backdrop-blur`}
                              placeholder="Cor do veículo"
                            />
                            <div 
                              className="w-12 h-12 rounded-xl border border-slate-300/50 flex-shrink-0" 
                              style={{ backgroundColor: veiculoEditado.cor.toLowerCase() }}
                            />
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50">
                            <div 
                              className="w-8 h-8 rounded-full border border-slate-300/50" 
                              style={{ backgroundColor: veiculoSelecionado.cor.toLowerCase() }}
                            />
                            <span>{veiculoSelecionado.cor}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Coluna Direita */}
                    <div className="space-y-4">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${colors.text.secondary}`}>Ano de Fabricação</label>
                        {modoEdicao ? (
                          <input
                            type="number"
                            name="anoFabricacao"
                            value={veiculoEditado.anoFabricacao}
                            onChange={handleInputChange}
                            className={`w-full p-3 rounded-xl border ${
                              colors.input.border
                            } ${
                              colors.input.background
                            } ${
                              colors.input.text
                            } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all backdrop-blur`}
                            min={1900}
                            max={new Date().getFullYear() + 1}
                          />
                        ) : (
                          <p className={`p-3 rounded-xl ${
                            theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-50/80'
                          } backdrop-blur`}>{veiculoSelecionado.anoFabricacao}</p>
                        )}
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${colors.text.secondary}`}>Ano Modelo</label>
                        {modoEdicao ? (
                          <input
                            type="number"
                            name="anoModelo"
                            value={veiculoEditado.anoModelo}
                            onChange={handleInputChange}
                            className={`w-full p-3 rounded-xl border ${
                              colors.input.border
                            } ${
                              colors.input.background
                            } ${
                              colors.input.text
                            } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all backdrop-blur`}
                            min={1900}
                            max={new Date().getFullYear() + 1}
                          />
                        ) : (
                          <p className={`p-3 rounded-xl ${
                            theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-50/80'
                          } backdrop-blur`}>{veiculoSelecionado.anoModelo}</p>
                        )}
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${colors.text.secondary}`}>Combustível</label>
                        {modoEdicao ? (
                          <select
                            name="tipoCombustivel"
                            value={veiculoEditado.tipoCombustivel}
                            onChange={handleInputChange}
                            className={`w-full p-3 rounded-xl border ${
                              colors.input.border
                            } ${
                              colors.input.background
                            } ${
                              colors.input.text
                            } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all backdrop-blur`}
                          >
                            <option value="">Selecione</option>
                            <option value="GASOLINA">Gasolina</option>
                            <option value="ETANOL">Etanol</option>
                            <option value="FLEX">Flex</option>
                            <option value="DIESEL">Diesel</option>
                            <option value="GNV">GNV</option>
                            <option value="ELETRICO">Elétrico</option>
                            <option value="HIBRIDO">Híbrido</option>
                          </select>
                        ) : (
                          <p className={`p-3 rounded-xl ${
                            theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-50/80'
                          } backdrop-blur`}>
                            {combustivelLabels[veiculoSelecionado.tipoCombustivel] || veiculoSelecionado.tipoCombustivel}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${colors.text.secondary}`}>Capacidade de Passageiros</label>
                        {modoEdicao ? (
                          <input
                            type="number"
                            name="capacidadePassageiros"
                            value={veiculoEditado.capacidadePassageiros}
                            onChange={handleInputChange}
                            className={`w-full p-3 rounded-xl border ${
                              colors.input.border
                            } ${
                              colors.input.background
                            } ${
                              colors.input.text
                            } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all backdrop-blur`}
                            min={1}
                            max={100}
                          />
                        ) : (
                          <p className={`p-3 rounded-xl ${
                            theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-50/80'
                          } backdrop-blur flex items-center gap-2`}>
                            <Users className="h-4 w-4" />
                            {veiculoSelecionado.capacidadePassageiros} passageiros
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Renavam e Chassi - Largura total */}
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${colors.text.secondary}`}>Renavam</label>
                        {modoEdicao ? (
                          <input
                            type="text"
                            name="renavam"
                            value={veiculoEditado.renavam}
                            onChange={handleInputChange}
                            className={`w-full p-3 rounded-xl border ${
                              colors.input.border
                            } ${
                              colors.input.background
                            } ${
                              colors.input.text
                            } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all backdrop-blur`}
                            placeholder="Número do Renavam"
                          />
                        ) : (
                          <p className={`font-mono p-3 rounded-xl ${
                            theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-50/80'
                          } backdrop-blur`}>
                            {veiculoSelecionado.renavam || 'Não informado'}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${colors.text.secondary}`}>Chassi</label>
                        {modoEdicao ? (
                          <input
                            type="text"
                            name="chassi"
                            value={veiculoEditado.chassi}
                            onChange={handleInputChange}
                            className={`w-full p-3 rounded-xl border ${
                              colors.input.border
                            } ${
                              colors.input.background
                            } ${
                              colors.input.text
                            } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all backdrop-blur uppercase`}
                            placeholder="Número do Chassi"
                          />
                        ) : (
                          <p className={`font-mono p-3 rounded-xl ${
                            theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-50/80'
                          } backdrop-blur`}>
                            {veiculoSelecionado.chassi || 'Não informado'}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Status e Observações */}
                    <div className="md:col-span-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${colors.text.secondary}`}>Status</label>
                          {modoEdicao ? (
                            <select
                              name="status"
                              value={veiculoEditado.status}
                              onChange={handleInputChange}
                              className={`w-full p-3 rounded-xl border ${
                                colors.input.border
                              } ${
                                colors.input.background
                              } ${
                                colors.input.text
                              } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all backdrop-blur`}
                            >
                              {statusOptions.map(status => (
                                <option key={status} value={status}>{statusLabels[status]}</option>
                              ))}
                            </select>
                          ) : (
                            <span className={`inline-block px-3 py-2 rounded-lg text-sm font-medium border ${statusColors[veiculoSelecionado.status]}`}>
                              {statusLabels[veiculoSelecionado.status] || veiculoSelecionado.status}
                            </span>
                          )}
                        </div>

                        <div>
                          <label className={`block text-sm font-medium mb-2 ${colors.text.secondary}`}>Cadastrado Por</label>
                          <p className={`p-3 rounded-xl ${
                            theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-50/80'
                          } backdrop-blur`}>{veiculoSelecionado.cadastradoPor}</p>
                        </div>
                      </div>
                    </div>

                    {/* Observações */}
                    <div className="md:col-span-2">
                      <label className={`block text-sm font-medium mb-2 ${colors.text.secondary}`}>Observações</label>
                      {modoEdicao ? (
                        <textarea
                          name="observacoes"
                          value={veiculoEditado.observacoes || ''}
                          onChange={handleInputChange}
                          rows={3}
                          className={`w-full p-3 rounded-xl border ${
                            colors.input.border
                          } ${
                            colors.input.background
                          } ${
                            colors.input.text
                          } ${
                            colors.input.placeholder
                          } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all backdrop-blur resize-none`}
                          placeholder="Observações adicionais sobre o veículo..."
                        />
                      ) : (
                        <p className={`p-3 rounded-xl min-h-[80px] ${
                          theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-50/80'
                        } backdrop-blur`}>
                          {veiculoSelecionado.observacoes || 'Nenhuma observação cadastrada'}
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
                          onClick={excluirVeiculo}
                          className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 px-6 rounded-xl transition-all flex items-center justify-center"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir Veículo
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={ativarEdicao}
                          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-6 rounded-xl transition-all flex items-center justify-center"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Editar Veículo
                        </motion.button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal de Alteração de Status */}
        <AnimatePresence>
          {showStatusModal && veiculoSelecionado && (
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
                className={`w-full max-w-md rounded-2xl border ${
                  theme === 'dark' 
                    ? 'border-yellow-500/30 bg-slate-900/80' 
                    : 'border-yellow-400/30 bg-white/95'
                } backdrop-blur shadow-2xl`}
              >
                <div className="bg-gradient-to-r from-yellow-600 to-yellow-500 p-6 text-white">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-bold">Alterar Status</h2>
                      <p className="text-yellow-100 text-sm mt-1">
                        Veículo: {veiculoSelecionado.placa}
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={fecharStatusModal}
                      className="text-white hover:text-gray-200 transition-colors"
                    >
                      <X className="h-6 w-6" />
                    </motion.button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-6">
                    <label className={`block text-sm font-medium mb-2 ${colors.text.secondary}`}>
                      Status Atual
                    </label>
                    <span className={`inline-block px-3 py-2 rounded-lg text-sm font-medium border ${statusColors[veiculoSelecionado.status]}`}>
                      {statusLabels[veiculoSelecionado.status] || veiculoSelecionado.status}
                    </span>
                  </div>

                  <div className="mb-6">
                    <label className={`block text-sm font-medium mb-2 ${colors.text.secondary}`}>
                      Novo Status
                    </label>
                    <select
                      value={novoStatus}
                      onChange={(e) => setNovoStatus(e.target.value)}
                      className={`w-full p-3 rounded-xl border ${
                        colors.input.border
                      } ${
                        colors.input.background
                      } ${
                        colors.input.text
                      } focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all backdrop-blur`}
                    >
                      {statusOptions.map(status => (
                        <option key={status} value={status}>{statusLabels[status]}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={fecharStatusModal}
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
                      onClick={atualizarStatus}
                      className="flex-1 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white py-3 px-6 rounded-xl transition-all flex items-center justify-center"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Atualizar Status
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
          © {new Date().getFullYear()} – Sistema de Gestão de Veículos. Desenvolvido com Next.js e Tailwind.
        </footer>
      </div>
    </DefaultLayout>
  );
};

export default ListaVeiculos;