"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Save, 
  Check, 
  AlertTriangle, 
  Sun, 
  Moon,
  Building,
  DoorOpen,
  Barcode,
  Tag,
  Info,
  Factory,
  FileText,
  ChevronDown,
  Laptop,
  CheckCircle,
  Edit
} from "lucide-react";
import { useTheme } from "next-themes";

import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { getUserLocalStorage } from "@/store/userLocalStorage";
import axiosInstance from "@/services/axiosInstance";
import { TipoMaterial, StatusMaterial, Unidade, Setor } from "@/types";

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

const CadastroMaterial = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const user = getUserLocalStorage() || {};
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [setores, setSetores] = useState<Setor[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    tipo: "" as TipoMaterial,
    tombamento: "",
    status: StatusMaterial.FUNCIONANDO,
    unidadeId: "",
    setorId: "",
    marca: "",
    especificacoes: "",
  });

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
    carregarUnidades();
    if (formData.unidadeId) {
      carregarSetores(Number(formData.unidadeId));
    }
  }, []);

  const carregarUnidades = async () => {
    try {
      const response = await axiosInstance.get("/api/unidades/listar-unidades");
      setUnidades(response.data);
    } catch (error) {
      console.error("Erro ao carregar unidades:", error);
      setError("Erro ao carregar unidades");
    }
  };

  const carregarSetores = async (unidadeId: number) => {
    try {
      const response = await axiosInstance.get(`/api/setores/unidade/${unidadeId}`);
      setSetores(response.data);
    } catch (error) {
      console.error("Erro ao carregar setores:", error);
      setError("Erro ao carregar setores");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === "unidadeId") {
      setFormData(prev => ({
        ...prev,
        unidadeId: value,
        setorId: "" // Reseta o setor quando muda a unidade
      }));
      if (value) {
        carregarSetores(Number(value));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmationModal(true);
  };

  const confirmSubmit = async () => {
    setIsLoading(true);
    setShowConfirmationModal(false);

    const payload = {
      ...formData,
      cadastradoPor: user.nomeCompleto || "Sistema",
      dataCadastro: new Date().toISOString()
    };

    try {
      await axiosInstance.post("/api/materiais", payload, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
      });

      setSuccess("Material cadastrado com sucesso!");
      setTimeout(() => {
        router.push("/formularios/materiais/listar-materiais");
      }, 1500);
    } catch (error) {
      console.error("Erro ao cadastrar material:", error);
      setError("Erro ao cadastrar material. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const cancelSubmit = () => {
    setShowConfirmationModal(false);
  };

  // Loading state ou aguardando hydratação
  if (!mounted) {
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
              Iniciando aplicação...
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
              <h1 className="font-semibold tracking-wide">Cadastro de Material</h1>
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
        <main className="relative z-10 mx-auto max-w-6xl px-6 pb-24">
          {/* Hero */}
          <section className="mx-auto max-w-4xl pt-6">
            <motion.h2
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-3 text-3xl font-semibold md:text-4xl text-center"
            >
              Cadastro de Material de TI
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.6 }}
              className={`mx-auto max-w-2xl text-sm md:text-base text-center ${colors.text.secondary}`}
            >
              Preencha todos os campos abaixo para cadastrar um novo material no sistema
            </motion.p>
          </section>

          {/* Alertas */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mx-auto mt-6 max-w-4xl"
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
                className="mx-auto mt-6 max-w-4xl"
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

          {/* Formulário */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mx-auto mt-8 max-w-4xl"
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
                  <Laptop className={`h-6 w-6 ${
                    theme === 'dark' ? 'text-blue-400' : 'text-blue-500'
                  }`} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Informações do Material</h3>
                  <p className={`text-sm ${colors.text.secondary}`}>
                    Preencha todos os campos obrigatórios (*)
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Tipo do Material */}
                  <div>
                    <label className={`block text-sm font-medium mb-3 ${colors.text.secondary}`}>
                      Tipo do Material *
                    </label>
                    <div className="relative">
                      <Tag className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
                        colors.text.muted
                      }`} />
                      <select
                        name="tipo"
                        required
                        className={`w-full pl-12 pr-10 py-3 rounded-xl border ${
                          colors.input.border
                        } ${
                          colors.input.background
                        } ${
                          colors.input.text
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all backdrop-blur appearance-none`}
                        value={formData.tipo}
                        onChange={handleChange}
                      >
                        <option value="">Selecione o tipo</option>
                        {Object.values(TipoMaterial).map(tipo => (
                          <option key={tipo} value={tipo}>{tipo}</option>
                        ))}
                      </select>
                      <ChevronDown className={`absolute right-4 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
                        colors.text.muted
                      }`} />
                    </div>
                  </div>

                  {/* Tombamento */}
                  <div>
                    <label className={`block text-sm font-medium mb-3 ${colors.text.secondary}`}>
                      Número de Tombamento *
                    </label>
                    <div className="relative">
                      <Barcode className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
                        colors.text.muted
                      }`} />
                      <input
                        type="text"
                        name="tombamento"
                        required
                        placeholder="Número do tombamento"
                        className={`w-full pl-12 pr-4 py-3 rounded-xl border ${
                          colors.input.border
                        } ${
                          colors.input.background
                        } ${
                          colors.input.text
                        } ${
                          colors.input.placeholder
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all backdrop-blur`}
                        value={formData.tombamento}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Status */}
                  <div>
                    <label className={`block text-sm font-medium mb-3 ${colors.text.secondary}`}>
                      Status do Material *
                    </label>
                    <div className="relative">
                      <Info className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
                        colors.text.muted
                      }`} />
                      <select
                        name="status"
                        required
                        className={`w-full pl-12 pr-10 py-3 rounded-xl border ${
                          colors.input.border
                        } ${
                          colors.input.background
                        } ${
                          colors.input.text
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all backdrop-blur appearance-none`}
                        value={formData.status}
                        onChange={handleChange}
                      >
                        {Object.values(StatusMaterial).map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                      <ChevronDown className={`absolute right-4 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
                        colors.text.muted
                      }`} />
                    </div>
                  </div>

                  {/* Unidade */}
                  <div>
                    <label className={`block text-sm font-medium mb-3 ${colors.text.secondary}`}>
                      Unidade *
                    </label>
                    <div className="relative">
                      <Building className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
                        colors.text.muted
                      }`} />
                      <select
                        name="unidadeId"
                        required
                        className={`w-full pl-12 pr-10 py-3 rounded-xl border ${
                          colors.input.border
                        } ${
                          colors.input.background
                        } ${
                          colors.input.text
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all backdrop-blur appearance-none`}
                        value={formData.unidadeId}
                        onChange={handleChange}
                      >
                        <option value="">Selecione a unidade</option>
                        {unidades.map(unidade => (
                          <option key={unidade.id} value={unidade.id}>{unidade.nome}</option>
                        ))}
                      </select>
                      <ChevronDown className={`absolute right-4 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
                        colors.text.muted
                      }`} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Setor */}
                  <div>
                    <label className={`block text-sm font-medium mb-3 ${colors.text.secondary}`}>
                      Setor *
                    </label>
                    <div className="relative">
                      <DoorOpen className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
                        colors.text.muted
                      }`} />
                      <select
                        name="setorId"
                        required
                        disabled={!formData.unidadeId}
                        className={`w-full pl-12 pr-10 py-3 rounded-xl border ${
                          colors.input.border
                        } ${
                          colors.input.background
                        } ${
                          colors.input.text
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all backdrop-blur appearance-none disabled:opacity-50`}
                        value={formData.setorId}
                        onChange={handleChange}
                      >
                        <option value="">Selecione o setor</option>
                        {setores.map(setor => (
                          <option key={setor.id} value={setor.id}>{setor.nome}</option>
                        ))}
                      </select>
                      <ChevronDown className={`absolute right-4 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
                        colors.text.muted
                      }`} />
                    </div>
                  </div>

                  {/* Marca */}
                  <div>
                    <label className={`block text-sm font-medium mb-3 ${colors.text.secondary}`}>
                      Marca *
                    </label>
                    <div className="relative">
                      <Factory className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
                        colors.text.muted
                      }`} />
                      <input
                        type="text"
                        name="marca"
                        required
                        placeholder="Marca do equipamento"
                        className={`w-full pl-12 pr-4 py-3 rounded-xl border ${
                          colors.input.border
                        } ${
                          colors.input.background
                        } ${
                          colors.input.text
                        } ${
                          colors.input.placeholder
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all backdrop-blur`}
                        value={formData.marca}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                {/* Especificações */}
                <div className="mb-6">
                  <label className={`block text-sm font-medium mb-3 ${colors.text.secondary}`}>
                    Especificações Técnicas
                  </label>
                  <div className="relative">
                    <FileText className={`absolute left-4 top-4 h-4 w-4 ${
                      colors.text.muted
                    }`} />
                    <textarea
                      rows={4}
                      name="especificacoes"
                      placeholder="Descreva as especificações técnicas do material..."
                      className={`w-full pl-12 pr-4 py-3 rounded-xl border ${
                        colors.input.border
                      } ${
                        colors.input.background
                      } ${
                        colors.input.text
                      } ${
                        colors.input.placeholder
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all backdrop-blur resize-none`}
                      value={formData.especificacoes}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: isLoading ? 1 : 1.02 }}
                  whileTap={{ scale: isLoading ? 1 : 0.98 }}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed text-white py-4 px-6 rounded-xl font-bold text-lg transition-all duration-200 flex items-center justify-center backdrop-blur"
                >
                  {isLoading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="rounded-full h-5 w-5 border-b-2 border-white mr-2"
                      />
                      Cadastrando...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5 mr-2" />
                      Cadastrar Material
                    </>
                  )}
                </motion.button>
              </form>
            </div>
          </motion.section>
        </main>

        {/* Modal de Confirmação */}
        <AnimatePresence>
          {showConfirmationModal && (
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
                    ? 'border-blue-500/30 bg-slate-900/80' 
                    : 'border-blue-400/30 bg-white/95'
                } backdrop-blur shadow-2xl`}
              >
                <div className="bg-gradient-to-r from-blue-800 to-blue-600 p-6 text-white rounded-t-2xl">
                  <div className="flex items-center">
                    <div className={`p-3 rounded-xl ${
                      theme === 'dark' 
                        ? 'bg-white/20' 
                        : 'bg-white/30'
                    } mr-4`}>
                      <CheckCircle className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Confirmar Cadastro</h2>
                      <p className="text-blue-200 text-sm mt-1">Revise os dados antes de cadastrar</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 max-h-96 overflow-y-auto">
                  <h3 className={`text-lg font-semibold mb-4 ${colors.text.primary}`}>
                    Confirme os dados do material:
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <span className={`font-medium w-32 ${colors.text.secondary}`}>Tipo:</span>
                      <span className={colors.text.primary}>{formData.tipo}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`font-medium w-32 ${colors.text.secondary}`}>Tombamento:</span>
                      <span className={`font-mono ${colors.text.primary}`}>{formData.tombamento}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`font-medium w-32 ${colors.text.secondary}`}>Status:</span>
                      <span className={colors.text.primary}>{formData.status}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`font-medium w-32 ${colors.text.secondary}`}>Marca:</span>
                      <span className={colors.text.primary}>{formData.marca}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`font-medium w-32 ${colors.text.secondary}`}>Unidade:</span>
                      <span className={colors.text.primary}>
                        {unidades.find(u => u.id === Number(formData.unidadeId))?.nome || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`font-medium w-32 ${colors.text.secondary}`}>Setor:</span>
                      <span className={colors.text.primary}>
                        {setores.find(s => s.id === Number(formData.setorId))?.nome || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 p-6 border-t border-slate-700/30">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={cancelSubmit}
                    className={`flex-1 py-3 px-6 rounded-xl transition-all ${
                      theme === 'dark' 
                        ? 'bg-slate-700 hover:bg-slate-600 text-slate-200' 
                        : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                    } flex items-center justify-center`}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Voltar para Editar
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={confirmSubmit}
                    className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-3 px-6 rounded-xl transition-all flex items-center justify-center"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Confirmar Cadastro
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

export default CadastroMaterial;