"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Ticket,
  Building, 
  DoorOpen, 
  Laptop,
  Filter,
  Search,
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
  Check,
  Loader2
} from "lucide-react";

import { getUserLocalStorage } from "@/store/userLocalStorage";
import axiosInstance from "@/services/axiosInstance";
import { Unidade, Setor, Material, StatusChamado, TipoMaterial, StatusMaterial } from "@/types";
import { useTheme } from "next-themes";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

export default function AbrirChamadoGamificado() {
  const router = useRouter();
  const { theme } = useTheme();
  const user = getUserLocalStorage() || {};
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [setores, setSetores] = useState<Setor[]>([]);
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [materiaisFiltrados, setMateriaisFiltrados] = useState<Material[]>([]);
  const [filtros, setFiltros] = useState({
    tombamento: "",
    tipo: ""
  });

  const [formData, setFormData] = useState({
    unidadeId: "",
    setorId: "",
    materialId: "",
    descricaoProblema: "",
  });

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

  useEffect(() => {
    setMounted(true);
    carregarUnidades();
  }, []);

  useEffect(() => {
    filtrarMateriais();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [materiais, filtros]);

  const filtrarMateriais = () => {
    let filtered = materiais.filter(material => material.status === StatusMaterial.FUNCIONANDO);

    if (filtros.tipo) {
      filtered = filtered.filter(material => material.tipo === filtros.tipo);
    }

    if (filtros.tombamento) {
      filtered = filtered.filter(material =>
        material.tombamento.toLowerCase().includes(filtros.tombamento.toLowerCase()) ||
        material.marca.toLowerCase().includes(filtros.tombamento.toLowerCase())
      );
    }

    setMateriaisFiltrados(filtered);
  };

  const carregarUnidades = async () => {
    try {
      const response = await axiosInstance.get("/api/unidades/listar-unidades");
      setUnidades(response.data);
    } catch (error) {
      console.error("Erro ao carregar unidades:", error);
    }
  };

  const carregarSetores = async (unidadeId: number) => {
    try {
      const response = await axiosInstance.get(`/api/setores/unidade/${unidadeId}`);
      setSetores(response.data);
    } catch (error) {
      console.error("Erro ao carregar setores:", error);
    }
  };

  const carregarMateriais = async (unidadeId: string, setorId: string) => {
    try {
      const response = await axiosInstance.get(`/api/materiais/unidade/${unidadeId}/setor/${setorId}`);
      setMateriais(response.data);
    } catch (error) {
      console.error("Erro ao carregar materiais:", error);
      setMateriais([]);
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === "unidadeId") {
      setFormData(prev => ({
        ...prev,
        unidadeId: value,
        setorId: "",
        materialId: ""
      }));
      setMateriais([]);
      setMateriaisFiltrados([]);
      setFiltros({ tombamento: "", tipo: "" });
      if (value) {
        await carregarSetores(Number(value));
      }
    } else if (name === "setorId") {
      setFormData(prev => ({
        ...prev,
        setorId: value,
        materialId: ""
      }));
      setFiltros({ tombamento: "", tipo: "" });
      if (value && formData.unidadeId) {
        await carregarMateriais(formData.unidadeId, value);
      } else {
        setMateriais([]);
        setMateriaisFiltrados([]);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const gerarProtocolo = () => {
    const agora = new Date();
    const dia = String(agora.getDate()).padStart(2, "0");
    const mes = String(agora.getMonth() + 1).padStart(2, "0");
    const ano = agora.getFullYear();
    const hora = String(agora.getHours()).padStart(2, "0");
    const minuto = String(agora.getMinutes()).padStart(2, "0");
    const segundo = String(agora.getSeconds()).padStart(2, "0");

    return `CH${dia}${mes}${ano}${hora}${minuto}${segundo}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmationModal(true);
  };

  const confirmSubmit = async () => {
    setIsLoading(true);
    setShowConfirmationModal(false);

    const protocolo = gerarProtocolo();
    const payload = {
      ...formData,
      usuarioAbertura: user.nomeCompleto || "Usuário",
      dataAbertura: new Date().toISOString(),
      protocolo: protocolo,
      status: StatusChamado.ABERTO
    };

    try {
      await axiosInstance.post("/api/chamados", payload, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
      });

      await axiosInstance.patch(`/api/materiais/${formData.materialId}/status`, {
        statusMaterial: StatusMaterial.DEFEITO
      }, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
      });

      alert("Chamado aberto com sucesso!");
      router.push("/formularios/chamados/listar-chamados");
    } catch (error) {
      console.error("Erro ao abrir chamado:", error);
      alert("Erro ao abrir chamado. Tente novamente.");
    } finally {
      setIsLoading(false);
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

  if (!mounted) {
    return (
      <div className={`min-h-dvh w-full ${colors.background} flex items-center justify-center`}>
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`animate-spin rounded-full h-12 w-12 border-b-2 ${
              theme === 'dark' ? 'border-orange-500' : 'border-orange-600'
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
    );
  }

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
              <Ticket className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <p className={`text-xs/4 ${colors.text.secondary}`}>Sistema</p>
              <h1 className="font-semibold tracking-wide">Abertura de Chamado</h1>
            </div>
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
            Abertura de Chamado de TI
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className={`mx-auto max-w-2xl text-sm md:text-base text-center ${colors.text.secondary}`}
          >
            Registre um novo chamado técnico para suporte de TI
          </motion.p>
        </section>

        {/* Formulário Principal */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mx-auto mt-8 max-w-4xl"
        >
          <div className={`rounded-2xl border ${
            theme === 'dark' 
              ? 'border-slate-800/60 bg-slate-900/40 shadow-[0_0_0_1px_rgba(249,115,22,.2)]' 
              : 'border-slate-200/60 bg-white/80 shadow-[0_0_0_1px_rgba(249,115,22,.1)]'
          } p-6 backdrop-blur`}>
            
            {/* Header do Card */}
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-3 rounded-xl ${
                theme === 'dark' 
                  ? 'bg-orange-500/15 ring-1 ring-orange-400/30' 
                  : 'bg-orange-500/10 ring-1 ring-orange-400/20'
              }`}>
                <Ticket className={`h-6 w-6 ${
                  theme === 'dark' ? 'text-orange-400' : 'text-orange-500'
                }`} />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Novo Chamado</h3>
                <p className={`text-sm ${colors.text.secondary}`}>
                  Preencha os dados para abrir um novo chamado
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Unidade e Setor */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Unidade */}
                <div>
                  <label className={`block text-sm font-medium mb-3 ${colors.text.primary}`}>
                    Unidade *
                  </label>
                  <div className="relative">
                    <Building className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 ${colors.text.muted}`} />
                    <select
                      name="unidadeId"
                      required
                      className={`w-full pl-12 pr-4 py-3 rounded-xl border ${
                        colors.input.border
                      } ${
                        colors.input.background
                      } ${
                        colors.input.text
                      } focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all backdrop-blur`}
                      value={formData.unidadeId}
                      onChange={handleChange}
                    >
                      <option value="">Selecione a unidade</option>
                      {unidades.map(unidade => (
                        <option key={unidade.id} value={unidade.id}>{unidade.nome}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Setor */}
                <div>
                  <label className={`block text-sm font-medium mb-3 ${colors.text.primary}`}>
                    Setor *
                  </label>
                  <div className="relative">
                    <DoorOpen className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 ${colors.text.muted}`} />
                    <select
                      name="setorId"
                      required
                      disabled={!formData.unidadeId}
                      className={`w-full pl-12 pr-4 py-3 rounded-xl border ${
                        colors.input.border
                      } ${
                        colors.input.background
                      } ${
                        colors.input.text
                      } focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all backdrop-blur disabled:opacity-50`}
                      value={formData.setorId}
                      onChange={handleChange}
                    >
                      <option value="">Selecione o setor</option>
                      {setores.map(setor => (
                        <option key={setor.id} value={setor.id}>{setor.nome}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Filtros para Materiais */}
              {formData.setorId && materiais.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mb-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Filter className={`h-5 w-5 ${
                      theme === 'dark' ? 'text-orange-400' : 'text-orange-500'
                    }`} />
                    <h4 className={`text-lg font-semibold ${colors.text.primary}`}>
                      Filtros para Materiais
                    </h4>
                  </div>
                  
                  {/* Aviso sobre filtro de status */}
                  <div className={`mb-4 rounded-xl border ${
                    theme === 'dark' 
                      ? 'border-green-500/30 bg-green-500/10' 
                      : 'border-green-400/30 bg-green-50/80'
                  } p-4 backdrop-blur`}>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className={`h-5 w-5 ${
                        theme === 'dark' ? 'text-green-400' : 'text-green-500'
                      }`} />
                      <span className={`text-sm ${
                        theme === 'dark' ? 'text-green-300' : 'text-green-700'
                      }`}>
                        <strong>Importante:</strong> Apenas materiais com status <span className={`font-mono px-2 py-1 rounded ${
                          theme === 'dark' ? 'bg-green-500/20' : 'bg-green-100'
                        }`}>FUNCIONANDO</span> são exibidos na lista.
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Filtro por Tipo */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${colors.text.primary}`}>
                        Filtrar por Tipo
                      </label>
                      <div className="relative">
                        <Laptop className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 ${colors.text.muted}`} />
                        <select
                          className={`w-full pl-12 pr-4 py-3 rounded-xl border ${
                            colors.input.border
                          } ${
                            colors.input.background
                          } ${
                            colors.input.text
                          } focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all backdrop-blur`}
                          value={filtros.tipo}
                          onChange={(e) => setFiltros(prev => ({ ...prev, tipo: e.target.value as TipoMaterial }))}
                        >
                          <option value="">Todos os tipos</option>
                          {Object.values(TipoMaterial).map(tipo => (
                            <option key={tipo} value={tipo}>{tipo}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Filtro por Tombamento/Marca */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${colors.text.primary}`}>
                        Buscar por Tombamento ou Marca
                      </label>
                      <div className="relative">
                        <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 ${colors.text.muted}`} />
                        <input
                          type="text"
                          placeholder="Digite para buscar..."
                          className={`w-full pl-12 pr-4 py-3 rounded-xl border ${
                            colors.input.border
                          } ${
                            colors.input.background
                          } ${
                            colors.input.text
                          } ${
                            colors.input.placeholder
                          } focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all backdrop-blur`}
                          value={filtros.tombamento}
                          onChange={(e) => setFiltros(prev => ({ ...prev, tombamento: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Lista de Materiais */}
              <div className="mb-6">
                <label className={`block text-sm font-medium mb-3 ${colors.text.primary}`}>
                  <Laptop className="inline h-4 w-4 mr-2" />
                  Selecionar Material com Problema *
                </label>
                
                {!formData.setorId ? (
                  <div className={`rounded-xl border-2 border-dashed ${
                    theme === 'dark' 
                      ? 'border-slate-700 bg-slate-800/30' 
                      : 'border-slate-300 bg-slate-50/50'
                  } p-8 text-center backdrop-blur`}>
                    <Info className={`h-12 w-12 ${
                      theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
                    } mx-auto mb-4`} />
                    <h3 className={`text-lg font-medium mb-2 ${
                      theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      Selecione uma Unidade e Setor
                    </h3>
                    <p className={colors.text.muted}>
                      Para visualizar os materiais disponíveis, primeiro selecione a unidade e o setor.
                    </p>
                  </div>
                ) : materiais.filter(m => m.status === StatusMaterial.FUNCIONANDO).length === 0 ? (
                  <div className={`rounded-xl border-2 border-dashed ${
                    theme === 'dark' 
                      ? 'border-amber-500/30 bg-amber-500/10' 
                      : 'border-amber-300 bg-amber-50/80'
                  } p-8 text-center backdrop-blur`}>
                    <AlertTriangle className={`h-12 w-12 ${
                      theme === 'dark' ? 'text-amber-400' : 'text-amber-500'
                    } mx-auto mb-4`} />
                    <h3 className={`text-lg font-medium mb-2 ${
                      theme === 'dark' ? 'text-amber-300' : 'text-amber-700'
                    }`}>
                      Nenhum Material Funcionando
                    </h3>
                    <p className={`mb-2 ${
                      theme === 'dark' ? 'text-amber-400' : 'text-amber-600'
                    }`}>
                      Não há materiais com status &quot;FUNCIONANDO&quot; neste setor.
                    </p>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-amber-400' : 'text-amber-600'
                    }`}>
                      Apenas materiais funcionando podem ter chamados abertos.
                    </p>
                  </div>
                ) : materiaisFiltrados.length === 0 ? (
                  <div className={`rounded-xl border-2 border-dashed ${
                    theme === 'dark' 
                      ? 'border-blue-500/30 bg-blue-500/10' 
                      : 'border-blue-300 bg-blue-50/80'
                  } p-8 text-center backdrop-blur`}>
                    <Search className={`h-12 w-12 ${
                      theme === 'dark' ? 'text-blue-400' : 'text-blue-500'
                    } mx-auto mb-4`} />
                    <h3 className={`text-lg font-medium mb-2 ${
                      theme === 'dark' ? 'text-blue-300' : 'text-blue-700'
                    }`}>
                      Nenhum Material Encontrado
                    </h3>
                    <p className={`mb-2 ${
                      theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                    }`}>
                      Ajuste os filtros para encontrar o material desejado.
                    </p>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                    }`}>
                      Lembre-se: apenas materiais com status &quot;FUNCIONANDO&quot; são exibidos.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className={`text-sm ${colors.text.secondary}`}>
                          {materiaisFiltrados.length} material(is) disponível(is)
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          theme === 'dark' 
                            ? 'text-green-400 bg-green-500/20' 
                            : 'text-green-600 bg-green-100'
                        }`}>
                          <CheckCircle2 className="inline h-3 w-3 mr-1" />
                          Apenas FUNCIONANDO
                        </span>
                      </div>
                      {filtros.tipo || filtros.tombamento ? (
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setFiltros({ tombamento: "", tipo: "" })}
                          className={`text-sm font-medium ${
                            theme === 'dark' 
                              ? 'text-orange-400 hover:text-orange-300' 
                              : 'text-orange-600 hover:text-orange-700'
                          }`}
                        >
                          <X className="inline h-3 w-3 mr-1" />
                          Limpar Filtros
                        </motion.button>
                      ) : null}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                      {materiaisFiltrados.map(material => (
                        <motion.div
                          key={material.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`relative rounded-xl border-2 p-4 cursor-pointer transition-all duration-200 backdrop-blur ${
                            formData.materialId === material.id.toString()
                              ? theme === 'dark'
                                ? 'border-orange-500 bg-orange-500/20 shadow-lg'
                                : 'border-orange-500 bg-orange-50 shadow-lg'
                              : theme === 'dark'
                                ? 'border-slate-700 bg-slate-800/30 hover:border-orange-400/50'
                                : 'border-slate-200 bg-white hover:border-orange-300'
                          }`}
                          onClick={() => setFormData(prev => ({ ...prev, materialId: material.id.toString() }))}
                        >
                          {formData.materialId === material.id.toString() && (
                            <div className={`absolute -top-2 -right-2 rounded-full w-6 h-6 flex items-center justify-center ${
                              theme === 'dark' 
                                ? 'bg-orange-500 text-white' 
                                : 'bg-orange-500 text-white'
                            }`}>
                              <Check className="h-3 w-3" />
                            </div>
                          )}
                          
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center">
                              <div className={`rounded-lg p-2 mr-3 ${
                                theme === 'dark' 
                                  ? 'bg-orange-500/20' 
                                  : 'bg-orange-100'
                              }`}>
                                <Laptop className={`h-4 w-4 ${
                                  theme === 'dark' ? 'text-orange-400' : 'text-orange-600'
                                }`} />
                              </div>
                              <div>
                                <h4 className="font-mono text-sm font-bold">
                                  {material.tombamento}
                                </h4>
                                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(material.status)}`}>
                                  {material.status}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center text-sm">
                              <span className="w-4 text-center">
                                🏷️
                              </span>
                              <span className="ml-2 text-slate-600 dark:text-slate-400">Tipo:</span>
                              <span className="ml-1 font-medium">{material.tipo}</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <span className="w-4 text-center">
                                🏭
                              </span>
                              <span className="ml-2 text-slate-600 dark:text-slate-400">Marca:</span>
                              <span className="ml-1 font-medium">{material.marca}</span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Descrição do Problema */}
              <div className="mb-6">
                <label className={`block text-sm font-medium mb-3 ${colors.text.primary}`}>
                  Descrição do Problema *
                </label>
                <div className="relative">
                  <textarea
                    rows={4}
                    name="descricaoProblema"
                    required
                    placeholder="Descreva detalhadamente o problema encontrado..."
                    className={`w-full px-4 py-3 rounded-xl border ${
                      colors.input.border
                    } ${
                      colors.input.background
                    } ${
                      colors.input.text
                    } ${
                      colors.input.placeholder
                    } focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all backdrop-blur resize-none`}
                    value={formData.descricaoProblema}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
                className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white py-4 px-6 rounded-xl font-bold text-lg transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Abrindo Chamado...
                  </>
                ) : (
                  <>
                    <Ticket className="h-5 w-5 mr-2" />
                    Abrir Chamado
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
                  ? 'border-orange-500/30 bg-slate-900/80' 
                  : 'border-orange-400/30 bg-white/95'
              } backdrop-blur shadow-2xl`}
            >
              <div className="bg-gradient-to-r from-orange-800 to-orange-600 p-6 text-white rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white/20">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Confirmar Abertura de Chamado</h2>
                    <p className="opacity-90">Revise os dados antes de abrir o chamado</p>
                  </div>
                </div>
              </div>

              <div className="p-6 max-h-96 overflow-y-auto">
                <h3 className="text-lg font-semibold mb-4">Dados do Chamado:</h3>
                <div className="space-y-3">
                  <div className="flex">
                    <span className="font-medium w-32">Unidade:</span>
                    <span>{unidades.find(u => u.id === Number(formData.unidadeId))?.nome}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium w-32">Setor:</span>
                    <span>{setores.find(s => s.id === Number(formData.setorId))?.nome}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium w-32">Material:</span>
                    <span>{materiais.find(m => m.id === Number(formData.materialId))?.tombamento}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium w-32">Problema:</span>
                    <span>{formData.descricaoProblema}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 p-6 border-t border-slate-700/30">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowConfirmationModal(false)}
                  className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all ${
                    theme === 'dark' 
                      ? 'bg-slate-700 hover:bg-slate-600 text-slate-200' 
                      : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                  }`}
                >
                  Voltar para Editar
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={confirmSubmit}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 px-6 rounded-xl font-medium transition-all"
                >
                  Confirmar Abertura
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
        © {new Date().getFullYear()} – Sistema de Suporte TI. Desenvolvido com Next.js e Tailwind.
      </footer>
    </div>
    </DefaultLayout>
  );
}