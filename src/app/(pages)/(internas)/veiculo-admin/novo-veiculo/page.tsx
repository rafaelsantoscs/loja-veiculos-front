"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Car, 
  Save, 
  X, 
  AlertTriangle, 
  Check,
  Sun,
  Moon,
  ArrowLeft
} from "lucide-react";
import { useTheme } from "next-themes";

import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { getUserLocalStorage } from "@/store/userLocalStorage";
import axiosInstance from "@/services/axiosInstance";

interface VeiculoRequestDTO {
  marca: string;
  modelo: string;
  versao: string;
  anoFabricacao: number;
  anoModelo: number;
  placa: string;
  cor: string;
  combustivel: string;
  cambio: string;
  quilometragem: number;
  precoCompra: number | null;
  precoVenda: number;
  descricao: string;
  destaque: boolean;
  aceitaTroca: boolean;
  unicoDono: boolean;
  blindado: boolean;
}

interface VeiculoResponseDTO extends VeiculoRequestDTO {
  id: number;
  status: string;
  visualizacoes: number;
  dataEntrada: string;
  dataCadastro: string;
  cadastradoPor: string;
}

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

const CadastroVeiculo = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const user = getUserLocalStorage() || {};
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [veiculoEditando, setVeiculoEditando] = useState<VeiculoResponseDTO | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const [formData, setFormData] = useState<VeiculoRequestDTO>({
    marca: "",
    modelo: "",
    versao: "",
    anoFabricacao: new Date().getFullYear(),
    anoModelo: new Date().getFullYear(),
    placa: "",
    cor: "",
    combustivel: "",
    cambio: "",
    quilometragem: 0,
    precoCompra: null,
    precoVenda: 0,
    descricao: "",
    destaque: false,
    aceitaTroca: true,
    unicoDono: false,
    blindado: false,
  });

  const colors = {
    background: theme === 'dark' 
      ? 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black'
      : 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-50 via-blue-50 to-indigo-100',
    
    text: {
      primary: theme === 'dark' ? 'text-slate-100' : 'text-slate-900',
      secondary: theme === 'dark' ? 'text-slate-400' : 'text-slate-600',
      muted: theme === 'dark' ? 'text-slate-500' : 'text-slate-400',
    },
    
    input: {
      background: theme === 'dark' ? 'bg-slate-800/50' : 'bg-white/50',
      border: theme === 'dark' ? 'border-slate-700' : 'border-slate-300',
      text: theme === 'dark' ? 'text-slate-100' : 'text-slate-900',
      placeholder: theme === 'dark' ? 'placeholder-slate-400' : 'placeholder-slate-500',
    }
  };

  const inputClass = `w-full p-3 rounded-xl border ${
    colors.input.border
  } ${
    colors.input.background
  } ${
    colors.input.text
  } ${
    colors.input.placeholder
  } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all backdrop-blur`;

  const selectClass = `w-full p-3 rounded-xl border ${
    colors.input.border
  } ${
    colors.input.background
  } ${
    colors.input.text
  } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all backdrop-blur`;

  useEffect(() => {
    setMounted(true);
    
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    
    if (id) {
      carregarVeiculo(parseInt(id));
      setIsEditMode(true);
    }
  }, []);

  const carregarVeiculo = async (id: number) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/veiculos/${id}`);
      const veiculo = response.data;
      setVeiculoEditando(veiculo);
      setFormData({
        marca: veiculo.marca || "",
        modelo: veiculo.modelo || "",
        versao: veiculo.versao || "",
        anoFabricacao: veiculo.anoFabricacao || new Date().getFullYear(),
        anoModelo: veiculo.anoModelo || new Date().getFullYear(),
        placa: veiculo.placa || "",
        cor: veiculo.cor || "",
        combustivel: veiculo.combustivel || "",
        cambio: veiculo.cambio || "",
        quilometragem: veiculo.quilometragem || 0,
        precoCompra: veiculo.precoCompra ?? null,
        precoVenda: veiculo.precoVenda || 0,
        descricao: veiculo.descricao || "",
        destaque: veiculo.destaque || false,
        aceitaTroca: veiculo.aceitaTroca ?? true,
        unicoDono: veiculo.unicoDono || false,
        blindado: veiculo.blindado || false,
      });
    } catch (err) {
      console.error("Erro ao carregar veículo:", err);
      setError("Erro ao carregar dados do veículo.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value ? Number(value) : 0) : value
    }));
    setError("");
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!formData.modelo || !formData.marca) {
      setError("Marca e modelo são obrigatórios.");
      setLoading(false);
      return;
    }

    if (!formData.combustivel) {
      setError("Selecione o tipo de combustível.");
      setLoading(false);
      return;
    }

    if (!formData.cambio) {
      setError("Selecione o tipo de câmbio.");
      setLoading(false);
      return;
    }

    if (!formData.precoVenda || formData.precoVenda <= 0) {
      setError("Informe o preço de venda.");
      setLoading(false);
      return;
    }

    try {
      if (isEditMode && veiculoEditando) {
        await axiosInstance.put(`/veiculos/${veiculoEditando.id}`, formData, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setSuccess("Veículo atualizado com sucesso!");
      } else {
        await axiosInstance.post("/veiculos", formData, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setSuccess("Veículo cadastrado com sucesso!");
        setFormData({
          marca: "",
          modelo: "",
          versao: "",
          anoFabricacao: new Date().getFullYear(),
          anoModelo: new Date().getFullYear(),
          placa: "",
          cor: "",
          combustivel: "",
          cambio: "",
          quilometragem: 0,
          precoCompra: null,
          precoVenda: 0,
          descricao: "",
          destaque: false,
          aceitaTroca: true,
          unicoDono: false,
          blindado: false,
        });
      }

      setTimeout(() => {
        setSuccess("");
        if (isEditMode) {
          router.push("/lista-veiculos");
        }
      }, 2000);

    } catch (err: any) {
      console.error("Erro ao salvar veículo:", err);
      setError(err.response?.data?.message || "Erro ao salvar veículo. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (isEditMode) {
      router.push("/lista-veiculos");
    } else {
      router.push("/");
    }
  };

  if (!mounted || loading) {
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
              {loading ? 'Carregando veículo...' : 'Iniciando aplicação...'}
            </motion.p>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className={`relative min-h-dvh w-full overflow-hidden ${colors.background} ${colors.text.primary}`}>
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
              <h1 className="font-semibold tracking-wide">
                {isEditMode ? 'Editar Veículo' : 'Novo Veículo'}
              </h1>
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

        <main className="relative z-10 mx-auto max-w-4xl px-6 pb-24">
          <section className="mx-auto pt-6">
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-4 mb-3"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCancel}
                className={`p-2 rounded-xl transition-colors ${
                  theme === 'dark' 
                    ? 'hover:bg-slate-800/60 text-slate-400' 
                    : 'hover:bg-slate-200/60 text-slate-600'
                }`}
              >
                <ArrowLeft className="h-5 w-5" />
              </motion.button>
              <div>
                <h2 className="text-3xl font-semibold md:text-4xl">
                  {isEditMode ? 'Editar Veículo' : 'Cadastrar Veículo'}
                </h2>
                <p className={`text-sm md:text-base ${colors.text.secondary}`}>
                  {isEditMode 
                    ? 'Atualize os dados do veículo no sistema'
                    : 'Preencha os dados para cadastrar um novo veículo'
                  }
                </p>
              </div>
            </motion.div>
          </section>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto mt-6"
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

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto mt-6"
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

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mx-auto mt-8"
          >
            <form onSubmit={handleSubmit}>
              <div className={`rounded-2xl border ${
                theme === 'dark' 
                  ? 'border-slate-800/60 bg-slate-900/40 shadow-[0_0_0_1px_rgba(59,130,246,.2)]' 
                  : 'border-slate-200/60 bg-white/80 shadow-[0_0_0_1px_rgba(59,130,246,.1)]'
              } p-6 backdrop-blur`}>
                
                {/* Dados de Identificação */}
                <div className="mb-8">
                  <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2`}>
                    <div className={`p-2 rounded-lg ${
                      theme === 'dark' 
                        ? 'bg-blue-500/15 ring-1 ring-blue-400/30' 
                        : 'bg-blue-500/10 ring-1 ring-blue-400/20'
                    }`}>
                      <Car className={`h-4 w-4 ${
                        theme === 'dark' ? 'text-blue-400' : 'text-blue-500'
                      }`} />
                    </div>
                    Dados de Identificação
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${colors.text.secondary}`}>
                        Marca *
                      </label>
                      <input
                        type="text"
                        name="marca"
                        value={formData.marca}
                        onChange={handleInputChange}
                        className={inputClass}
                        placeholder="Ex: Toyota, Honda, Fiat..."
                        required
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${colors.text.secondary}`}>
                        Modelo *
                      </label>
                      <input
                        type="text"
                        name="modelo"
                        value={formData.modelo}
                        onChange={handleInputChange}
                        className={inputClass}
                        placeholder="Ex: Corolla, Civic, Argo..."
                        required
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${colors.text.secondary}`}>
                        Versão *
                      </label>
                      <input
                        type="text"
                        name="versao"
                        value={formData.versao}
                        onChange={handleInputChange}
                        className={inputClass}
                        placeholder="Ex: XEi, EXL, Limited..."
                        required
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${colors.text.secondary}`}>
                        Placa
                      </label>
                      <input
                        type="text"
                        name="placa"
                        value={formData.placa}
                        onChange={handleInputChange}
                        className={`${inputClass} uppercase`}
                        placeholder="AAA-0000"
                        maxLength={10}
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${colors.text.secondary}`}>
                        Cor
                      </label>
                      <input
                        type="text"
                        name="cor"
                        value={formData.cor}
                        onChange={handleInputChange}
                        className={inputClass}
                        placeholder="Cor do veículo"
                      />
                    </div>
                  </div>
                </div>

                {/* Dados Técnicos */}
                <div className="mb-8">
                  <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2`}>
                    <div className={`p-2 rounded-lg ${
                      theme === 'dark' 
                        ? 'bg-blue-500/15 ring-1 ring-blue-400/30' 
                        : 'bg-blue-500/10 ring-1 ring-blue-400/20'
                    }`}>
                      <Car className={`h-4 w-4 ${
                        theme === 'dark' ? 'text-blue-400' : 'text-blue-500'
                      }`} />
                    </div>
                    Dados Técnicos
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${colors.text.secondary}`}>
                        Ano de Fabricação *
                      </label>
                      <input
                        type="number"
                        name="anoFabricacao"
                        value={formData.anoFabricacao}
                        onChange={handleInputChange}
                        className={inputClass}
                        min={1900}
                        max={new Date().getFullYear() + 1}
                        required
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${colors.text.secondary}`}>
                        Ano Modelo *
                      </label>
                      <input
                        type="number"
                        name="anoModelo"
                        value={formData.anoModelo}
                        onChange={handleInputChange}
                        className={inputClass}
                        min={1900}
                        max={new Date().getFullYear() + 1}
                        required
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${colors.text.secondary}`}>
                        Combustível *
                      </label>
                      <select
                        name="combustivel"
                        value={formData.combustivel}
                        onChange={handleInputChange}
                        className={selectClass}
                        required
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
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${colors.text.secondary}`}>
                        Câmbio *
                      </label>
                      <select
                        name="cambio"
                        value={formData.cambio}
                        onChange={handleInputChange}
                        className={selectClass}
                        required
                      >
                        <option value="">Selecione</option>
                        <option value="MANUAL">Manual</option>
                        <option value="AUTOMATICO">Automático</option>
                        <option value="CVT">CVT</option>
                        <option value="DCT">DCT (Dupla Embreagem)</option>
                        <option value="AUTOMATIZADO">Automatizado</option>
                      </select>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${colors.text.secondary}`}>
                        Quilometragem *
                      </label>
                      <input
                        type="number"
                        name="quilometragem"
                        value={formData.quilometragem}
                        onChange={handleInputChange}
                        className={inputClass}
                        placeholder="Km atual"
                        min={0}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Dados Financeiros */}
                <div className="mb-8">
                  <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2`}>
                    <div className={`p-2 rounded-lg ${
                      theme === 'dark' 
                        ? 'bg-blue-500/15 ring-1 ring-blue-400/30' 
                        : 'bg-blue-500/10 ring-1 ring-blue-400/20'
                    }`}>
                      <Car className={`h-4 w-4 ${
                        theme === 'dark' ? 'text-blue-400' : 'text-blue-500'
                      }`} />
                    </div>
                    Dados Financeiros
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${colors.text.secondary}`}>
                        Preço de Compra
                      </label>
                      <input
                        type="number"
                        name="precoCompra"
                        value={formData.precoCompra ?? ''}
                        onChange={handleInputChange}
                        className={inputClass}
                        placeholder="R$ 0,00"
                        min={0}
                        step={0.01}
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${colors.text.secondary}`}>
                        Preço de Venda *
                      </label>
                      <input
                        type="number"
                        name="precoVenda"
                        value={formData.precoVenda}
                        onChange={handleInputChange}
                        className={inputClass}
                        placeholder="R$ 0,00"
                        min={0}
                        step={0.01}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Opções e Características */}
                <div className="mb-8">
                  <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2`}>
                    <div className={`p-2 rounded-lg ${
                      theme === 'dark' 
                        ? 'bg-blue-500/15 ring-1 ring-blue-400/30' 
                        : 'bg-blue-500/10 ring-1 ring-blue-400/20'
                    }`}>
                      <Car className={`h-4 w-4 ${
                        theme === 'dark' ? 'text-blue-400' : 'text-blue-500'
                      }`} />
                    </div>
                    Opções e Características
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      formData.blindado
                        ? theme === 'dark' 
                          ? 'border-blue-500/50 bg-blue-500/10' 
                          : 'border-blue-400/50 bg-blue-50'
                        : `${colors.input.border} ${colors.input.background}`
                    }`}>
                      <input
                        type="checkbox"
                        name="blindado"
                        checked={formData.blindado}
                        onChange={handleCheckboxChange}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className={`text-sm font-medium ${colors.text.primary}`}>Blindado</span>
                    </label>

                    <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      formData.destaque
                        ? theme === 'dark' 
                          ? 'border-blue-500/50 bg-blue-500/10' 
                          : 'border-blue-400/50 bg-blue-50'
                        : `${colors.input.border} ${colors.input.background}`
                    }`}>
                      <input
                        type="checkbox"
                        name="destaque"
                        checked={formData.destaque}
                        onChange={handleCheckboxChange}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className={`text-sm font-medium ${colors.text.primary}`}>Destaque</span>
                    </label>

                    <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      formData.aceitaTroca
                        ? theme === 'dark' 
                          ? 'border-blue-500/50 bg-blue-500/10' 
                          : 'border-blue-400/50 bg-blue-50'
                        : `${colors.input.border} ${colors.input.background}`
                    }`}>
                      <input
                        type="checkbox"
                        name="aceitaTroca"
                        checked={formData.aceitaTroca}
                        onChange={handleCheckboxChange}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className={`text-sm font-medium ${colors.text.primary}`}>Aceita Troca</span>
                    </label>

                    <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      formData.unicoDono
                        ? theme === 'dark' 
                          ? 'border-blue-500/50 bg-blue-500/10' 
                          : 'border-blue-400/50 bg-blue-50'
                        : `${colors.input.border} ${colors.input.background}`
                    }`}>
                      <input
                        type="checkbox"
                        name="unicoDono"
                        checked={formData.unicoDono}
                        onChange={handleCheckboxChange}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className={`text-sm font-medium ${colors.text.primary}`}>Único Dono</span>
                    </label>
                  </div>
                </div>

                {/* Descrição */}
                <div className="mb-8">
                  <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2`}>
                    <div className={`p-2 rounded-lg ${
                      theme === 'dark' 
                        ? 'bg-blue-500/15 ring-1 ring-blue-400/30' 
                        : 'bg-blue-500/10 ring-1 ring-blue-400/20'
                    }`}>
                      <Car className={`h-4 w-4 ${
                        theme === 'dark' ? 'text-blue-400' : 'text-blue-500'
                      }`} />
                    </div>
                    Descrição
                  </h3>
                  <div>
                    <textarea
                      name="descricao"
                      value={formData.descricao}
                      onChange={handleInputChange}
                      rows={4}
                      className={`${inputClass} resize-none`}
                      placeholder="Descrição detalhada do veículo..."
                    />
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-700/30">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={handleCancel}
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
                    type="submit"
                    disabled={loading}
                    className={`flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-6 rounded-xl transition-all flex items-center justify-center ${
                      loading ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {isEditMode ? 'Atualizar Veículo' : 'Cadastrar Veículo'}
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </form>
          </motion.section>
        </main>

        <footer className={`relative z-10 mx-auto max-w-7xl px-6 pb-8 pt-6 text-center text-xs ${
          theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
        }`}>
          © {new Date().getFullYear()} – Sistema de Gestão de Veículos. Desenvolvido com Next.js e Tailwind.
        </footer>
      </div>
    </DefaultLayout>
  );
};

export default CadastroVeiculo;
