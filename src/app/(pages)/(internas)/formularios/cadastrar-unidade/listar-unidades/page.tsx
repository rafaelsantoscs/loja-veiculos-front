"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building, 
  DoorOpen, 
  PlusCircle, 
  Search,
  Edit,
  Trash2,
  BarChart3,
  Check,
  AlertTriangle,
  Sun,
  Moon
} from "lucide-react";

import { getUserLocalStorage } from "@/store/userLocalStorage";
import { useTheme } from "next-themes";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import unidadeService from "@/services/unidadeService";
import { Unidade, Setor } from "@/types";

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

export default function ListaUnidadesGamificado() {
  const router = useRouter();
  const { theme } = useTheme();
  const user = getUserLocalStorage() || {};
  const [mounted, setMounted] = useState(false);
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [unidadeEditando, setUnidadeEditando] = useState<Unidade | null>(null);
  const [setorEditando, setSetorEditando] = useState<Setor | null>(null);
  const [novoSetor, setNovoSetor] = useState({ nome: "", unidadeId: "" });
  const [filtro, setFiltro] = useState("");
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

  useEffect(() => {
    setMounted(true);
    carregarUnidades();
  }, []);

  const carregarUnidades = async () => {
    try {
      setLoading(true);
      const unidades = await unidadeService.listarUnidades();
      setUnidades(unidades);
      setError("");
    } catch (error: unknown) {
      console.error("Erro ao carregar unidades:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      setError("Erro ao carregar unidades: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ... (mantenha todas as outras funções do código anterior: excluirUnidade, excluirSetor, adicionarSetor, editarUnidade, editarSetor)

  const excluirUnidade = async (unidadeId: number) => {
    if (!confirm("Tem certeza que deseja excluir esta unidade? Todos os setores serão removidos.")) {
      return;
    }

    try {
      await unidadeService.excluirUnidade(unidadeId);
      await carregarUnidades();
      setSuccess("Unidade excluída com sucesso!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error: unknown) {
      console.error("Erro ao excluir unidade:", error);
      setError("Erro ao excluir unidade. Verifique se não há materiais ou chamados vinculados.");
    }
  };

  const excluirSetor = async (setorId: number) => {
    if (!confirm("Tem certeza que deseja excluir este setor?")) {
      return;
    }

    try {
      await unidadeService.excluirSetor(setorId);
      await carregarUnidades();
      setSuccess("Setor excluído com sucesso!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error: unknown) {
      console.error("Erro ao excluir setor:", error);
      setError("Erro ao excluir setor. Verifique se não há materiais ou chamados vinculados.");
    }
  };

  const adicionarSetor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoSetor.nome || !novoSetor.unidadeId) {
      setError("Preencha todos os campos");
      return;
    }

    try {
      await unidadeService.criarSetor({
        nome: novoSetor.nome,
        unidadeId: Number(novoSetor.unidadeId)
      });
      setNovoSetor({ nome: "", unidadeId: "" });
      await carregarUnidades();
      setSuccess("Setor adicionado com sucesso!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error: unknown) {
      console.error("Erro ao adicionar setor:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      setError("Erro ao adicionar setor: " + errorMessage);
    }
  };

  const editarUnidade = async () => {
    if (!unidadeEditando?.nome.trim()) {
      setError("Nome da unidade é obrigatório");
      return;
    }

    try {
      await unidadeService.atualizarUnidade(unidadeEditando.id, {
        nome: unidadeEditando.nome
      });
      setUnidadeEditando(null);
      await carregarUnidades();
      setSuccess("Unidade atualizada com sucesso!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error: unknown) {
      console.error("Erro ao editar unidade:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      setError("Erro ao editar unidade: " + errorMessage);
    }
  };

  const editarSetor = async () => {
    if (!setorEditando?.nome.trim()) {
      setError("Nome do setor é obrigatório");
      return;
    }

    try {
      await unidadeService.atualizarSetor(setorEditando.id, {
        nome: setorEditando.nome
      });
      setSetorEditando(null);
      await carregarUnidades();
      setSuccess("Setor atualizado com sucesso!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error: unknown) {
      console.error("Erro ao editar setor:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      setError("Erro ao editar setor: " + errorMessage);
    }
  };

  const unidadesFiltradas = unidades.filter(unidade =>
    unidade.nome.toLowerCase().includes(filtro.toLowerCase()) ||
    unidade.setores?.some(setor => 
      setor.nome.toLowerCase().includes(filtro.toLowerCase())
    )
  );

  const totalSetores = unidades.reduce((total, unidade) => total + (unidade.setores?.length || 0), 0);
  const mediaSetores = unidades.length > 0 ? Math.round(totalSetores / unidades.length) : 0;

  // Loading state ou aguardando hydratação
  if (loading || !mounted) {
    return (
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
            {loading ? 'Carregando unidades...' : 'Iniciando aplicação...'}
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
              ? 'bg-blue-500/20 ring-1 ring-blue-400/30' 
              : 'bg-blue-500/15 ring-1 ring-blue-400/20'
          }`}>
            <Building className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <p className={`text-xs/4 ${colors.text.secondary}`}>Sistema</p>
            <h1 className="font-semibold tracking-wide">Lista de Unidades & Setores</h1>
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
            Gestão Corporativa • {user.nomeCompleto || 'Usuário'}
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
            Estrutura Organizacional
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className={`mx-auto max-w-2xl text-sm md:text-base text-center ${colors.text.secondary}`}
          >
            Gerencie e visualize todas as unidades e setores da organização
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

        {/* Header e Filtro */}
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
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">Unidades e Setores</h3>
                <p className={`text-sm ${colors.text.secondary}`}>
                  {unidadesFiltradas.length} de {unidades.length} unidades encontradas
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                <div className="relative flex-1 lg:flex-none min-w-[280px]">
                  <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
                    colors.text.muted
                  }`} />
                  <input
                    type="text"
                    placeholder="Buscar unidades ou setores..."
                    className={`w-full pl-12 pr-4 py-3 rounded-xl border ${
                      colors.input.border
                    } ${
                      colors.input.background
                    } ${
                      colors.input.text
                    } ${
                      colors.input.placeholder
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all backdrop-blur`}
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                  />
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push("/unidades/cadastro")}
                  className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-6 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <PlusCircle className="h-5 w-5 mr-2" />
                  Nova Unidade
                </motion.button>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Estatísticas */}
        <section className="mt-6 mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card Unidades */}
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
                }`}>Total de Unidades</p>
                <p className="text-3xl font-bold">${unidades.length}</p>
              </div>
              <div className={`p-3 rounded-xl ${
                theme === 'dark' 
                  ? 'bg-blue-500/20 ring-1 ring-blue-400/30' 
                  : 'bg-blue-500/15 ring-1 ring-blue-400/20'
              }`}>
                <Building className={`h-6 w-6 ${
                  theme === 'dark' ? 'text-blue-400' : 'text-blue-500'
                }`} />
              </div>
            </div>
          </motion.div>

          {/* Card Setores */}
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
                }`}>Total de Setores</p>
                <p className="text-3xl font-bold">{totalSetores}</p>
              </div>
              <div className={`p-3 rounded-xl ${
                theme === 'dark' 
                  ? 'bg-green-500/20 ring-1 ring-green-400/30' 
                  : 'bg-green-500/15 ring-1 ring-green-400/20'
              }`}>
                <DoorOpen className={`h-6 w-6 ${
                  theme === 'dark' ? 'text-green-400' : 'text-green-500'
                }`} />
              </div>
            </div>
          </motion.div>

          {/* Card Média */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
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
                }`}>Média por Unidade</p>
                <p className="text-3xl font-bold">{mediaSetores}</p>
              </div>
              <div className={`p-3 rounded-xl ${
                theme === 'dark' 
                  ? 'bg-purple-500/20 ring-1 ring-purple-400/30' 
                  : 'bg-purple-500/15 ring-1 ring-purple-400/20'
              }`}>
                <BarChart3 className={`h-6 w-6 ${
                  theme === 'dark' ? 'text-purple-400' : 'text-purple-500'
                }`} />
              </div>
            </div>
          </motion.div>
        </section>

        {/* Lista de Unidades */}
        <section className="mt-8 mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className={`rounded-2xl border ${
              theme === 'dark' 
                ? 'border-slate-800/60 bg-slate-900/40 shadow-[0_0_0_1px_rgba(59,130,246,.2)]' 
                : 'border-slate-200/60 bg-white/80 shadow-[0_0_0_1px_rgba(59,130,246,.1)]'
            } p-6 backdrop-blur`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-3 rounded-xl ${
                theme === 'dark' 
                  ? 'bg-blue-500/15 ring-1 ring-blue-400/30' 
                  : 'bg-blue-500/10 ring-1 ring-blue-400/20'
              }`}>
                <Building className={`h-6 w-6 ${
                  theme === 'dark' ? 'text-blue-400' : 'text-blue-500'
                }`} />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Unidades Cadastradas</h3>
                <p className={`text-sm ${colors.text.secondary}`}>
                  {unidadesFiltradas.length} unidades encontradas
                </p>
              </div>
            </div>

            {unidadesFiltradas.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <Building className={`h-16 w-16 ${
                  theme === 'dark' ? 'text-slate-600' : 'text-slate-400'
                } mx-auto mb-4`} />
                <h3 className={`text-lg font-semibold mb-2 ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  {filtro ? "Nenhuma unidade encontrada" : "Nenhuma unidade cadastrada"}
                </h3>
                <p className={`mb-6 ${
                  theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  {filtro ? "Tente ajustar os termos da busca" : "Comece cadastrando a primeira unidade"}
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push("/unidades/cadastro")}
                  className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-6 font-medium transition-all"
                >
                  <PlusCircle className="h-5 w-5 mr-2" />
                  Cadastrar Unidade
                </motion.button>
              </motion.div>
            ) : (
              <div className="space-y-6">
                {unidadesFiltradas.map((unidade, idx) => (
                  <motion.div
                    key={unidade.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * idx }}
                    className={`rounded-xl border ${
                      theme === 'dark' 
                        ? 'border-slate-800 bg-slate-800/30 hover:border-slate-700/50' 
                        : 'border-slate-200 bg-white/50 hover:border-slate-300/50'
                    } p-6 backdrop-blur group transition-colors`}
                  >
                    {/* Cabeçalho da Unidade */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <Building className={`h-5 w-5 ${
                          theme === 'dark' ? 'text-blue-400' : 'text-blue-500'
                        }`} />
                        <div>
                          <h4 className="font-semibold text-lg">{unidade.nome}</h4>
                          <p className={`text-sm ${colors.text.secondary}`}>
                            {unidade.setores?.length || 0} setores cadastrados
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setUnidadeEditando(unidade)}
                          className={`p-2 rounded-lg transition-colors ${
                            theme === 'dark' 
                              ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400' 
                              : 'bg-blue-500/15 hover:bg-blue-500/25 text-blue-500'
                          }`}
                          title="Editar Unidade"
                        >
                          <Edit className="h-4 w-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => excluirUnidade(unidade.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            theme === 'dark' 
                              ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400' 
                              : 'bg-red-500/15 hover:bg-red-500/25 text-red-500'
                          }`}
                          title="Excluir Unidade"
                        >
                          <Trash2 className="h-4 w-4" />
                        </motion.button>
                      </div>
                    </div>

                    {/* Setores da Unidade */}
                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-3">
                        <h5 className={`font-medium ${
                          theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                        }`}>Setores</h5>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setNovoSetor({ nome: "", unidadeId: unidade.id.toString() })}
                          className={`text-sm px-3 py-1 rounded-lg flex items-center transition-colors ${
                            theme === 'dark' 
                              ? 'bg-green-500/20 hover:bg-green-500/30 text-green-400' 
                              : 'bg-green-500/15 hover:bg-green-500/25 text-green-600'
                          }`}
                        >
                          <PlusCircle className="h-3 w-3 mr-1" />
                          Adicionar Setor
                        </motion.button>
                      </div>

                      {unidade.setores && unidade.setores.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {unidade.setores.map((setor) => (
                            <motion.div 
                              key={setor.id}
                              whileHover={{ scale: 1.02 }}
                              className={`flex justify-between items-center rounded-lg p-3 border transition-colors ${
                                theme === 'dark' 
                                  ? 'bg-slate-800/50 border-slate-700/50 group-hover:border-slate-600/50' 
                                  : 'bg-slate-50/50 border-slate-200/50 group-hover:border-slate-300/50'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <DoorOpen className={`h-4 w-4 ${
                                  theme === 'dark' ? 'text-purple-400' : 'text-purple-500'
                                }`} />
                                <span className={
                                  theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
                                }>{setor.nome}</span>
                              </div>
                              <div className="flex gap-1">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => setSetorEditando(setor)}
                                  className={`p-1 transition-colors ${
                                    theme === 'dark' 
                                      ? 'text-blue-400 hover:text-blue-300' 
                                      : 'text-blue-500 hover:text-blue-600'
                                  }`}
                                  title="Editar Setor"
                                >
                                  <Edit className="h-3 w-3" />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => excluirSetor(setor.id)}
                                  className={`p-1 transition-colors ${
                                    theme === 'dark' 
                                      ? 'text-red-400 hover:text-red-300' 
                                      : 'text-red-500 hover:text-red-600'
                                  }`}
                                  title="Excluir Setor"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </motion.button>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <p className={`text-sm italic ${
                          theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
                        }`}>
                          Nenhum setor cadastrado nesta unidade
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </section>
      </main>

      {/* Modal Editar Unidade */}
      <AnimatePresence>
        {unidadeEditando && (
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
                  ? 'border-blue-500/30 bg-slate-900/80' 
                  : 'border-blue-400/30 bg-white/95'
              } backdrop-blur shadow-2xl`}
            >
              <div className="bg-gradient-to-r from-blue-800 to-blue-600 p-6 text-white rounded-t-2xl">
                <h2 className="text-xl font-bold">Editar Unidade</h2>
              </div>

              <div className="p-6">
                <div className="mb-4">
                  <label className={`block text-sm font-medium mb-3 ${
                    theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                  }`}>Nome da Unidade</label>
                  <input
                    type="text"
                    className={`w-full px-4 py-3 rounded-xl border ${
                      theme === 'dark' 
                        ? 'border-slate-700 bg-slate-800/50 text-slate-100' 
                        : 'border-slate-300 bg-white text-slate-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all backdrop-blur`}
                    value={unidadeEditando.nome}
                    onChange={(e) => setUnidadeEditando({ ...unidadeEditando, nome: e.target.value })}
                  />
                </div>

                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setUnidadeEditando(null)}
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
                    onClick={editarUnidade}
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 px-4 rounded-xl transition-all"
                  >
                    Salvar
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Editar Setor */}
      <AnimatePresence>
        {setorEditando && (
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
                  ? 'border-green-500/30 bg-slate-900/80' 
                  : 'border-green-400/30 bg-white/95'
              } backdrop-blur shadow-2xl`}
            >
              <div className="bg-gradient-to-r from-green-800 to-green-600 p-6 text-white rounded-t-2xl">
                <h2 className="text-xl font-bold">Editar Setor</h2>
              </div>

              <div className="p-6">
                <div className="mb-4">
                  <label className={`block text-sm font-medium mb-3 ${
                    theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                  }`}>Nome do Setor</label>
                  <input
                    type="text"
                    className={`w-full px-4 py-3 rounded-xl border ${
                      theme === 'dark' 
                        ? 'border-slate-700 bg-slate-800/50 text-slate-100' 
                        : 'border-slate-300 bg-white text-slate-900'
                    } focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all backdrop-blur`}
                    value={setorEditando.nome}
                    onChange={(e) => setSetorEditando({ ...setorEditando, nome: e.target.value })}
                  />
                </div>

                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSetorEditando(null)}
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
                    onClick={editarSetor}
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 px-4 rounded-xl transition-all"
                  >
                    Salvar
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Adicionar Setor */}
      <AnimatePresence>
        {novoSetor.unidadeId && (
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
                  ? 'border-purple-500/30 bg-slate-900/80' 
                  : 'border-purple-400/30 bg-white/95'
              } backdrop-blur shadow-2xl`}
            >
              <div className="bg-gradient-to-r from-purple-800 to-purple-600 p-6 text-white rounded-t-2xl">
                <h2 className="text-xl font-bold">Adicionar Setor</h2>
                <p className="text-purple-200 text-sm mt-1">
                  Unidade: {unidades.find(u => u.id === Number(novoSetor.unidadeId))?.nome}
                </p>
              </div>

              <form onSubmit={adicionarSetor} className="p-6">
                <div className="mb-4">
                  <label className={`block text-sm font-medium mb-3 ${
                    theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                  }`}>Nome do Setor</label>
                  <input
                    type="text"
                    required
                    className={`w-full px-4 py-3 rounded-xl border ${
                      theme === 'dark' 
                        ? 'border-slate-700 bg-slate-800/50 text-slate-100 placeholder-slate-400' 
                        : 'border-slate-300 bg-white text-slate-900 placeholder-slate-500'
                    } focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all backdrop-blur`}
                    value={novoSetor.nome}
                    onChange={(e) => setNovoSetor({ ...novoSetor, nome: e.target.value })}
                    placeholder="Ex: TI, Administrativo, RH..."
                  />
                </div>

                <div className="flex gap-3">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setNovoSetor({ nome: "", unidadeId: "" })}
                    className={`flex-1 py-3 px-4 rounded-xl transition-all ${
                      theme === 'dark' 
                        ? 'bg-slate-700 hover:bg-slate-600 text-slate-200' 
                        : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                    }`}
                  >
                    Cancelar
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-3 px-4 rounded-xl transition-all"
                  >
                    Adicionar
                  </motion.button>
                </div>
              </form>
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
}