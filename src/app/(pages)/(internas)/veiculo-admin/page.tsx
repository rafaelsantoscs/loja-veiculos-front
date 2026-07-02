"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Car,
  Check,
  ChevronDown,
  Moon,
  PlusCircle,
  Search,
  Sun,
  X,
} from "lucide-react";

import DefaultLayout from "@/components/Layouts/DefaultLayout";
import axiosInstance from "@/services/axiosInstance";
import { getUserLocalStorage } from "@/store/userLocalStorage";
import type {
  FotoVeiculo,
  Ordenacao,
  OrdenacaoCampo,
  Veiculo,
  VeiculoFiltros,
} from "@/types/veiculo";

import { useVeiculoTheme } from "./_components/useVeiculoTheme";
import { mapVeiculo } from "./_components/veiculo.utils";
import DashboardCards from "./_components/DashboardCards";
import VeiculoFilters from "./_components/VeiculoFilters";
import VeiculoCard from "./_components/VeiculoCard";
import LoadingCards from "./_components/LoadingCards";
import Pagination from "./_components/Pagination";
import EmptyState from "./_components/EmptyState";
import ConfirmDeleteModal from "./_components/ConfirmDeleteModal";
import FotoUploadModal from "./_components/FotoUploadModal";

/* ── Ordenação ─────────────────────────────────────────────────── */
const ORDENACAO_OPTIONS: { label: string; campo: OrdenacaoCampo; dir: "asc" | "desc" }[] = [
  { label: "Mais recentes", campo: "dataCadastro", dir: "desc" },
  { label: "Mais antigos", campo: "dataCadastro", dir: "asc" },
  { label: "Menor preço", campo: "valor", dir: "asc" },
  { label: "Maior preço", campo: "valor", dir: "desc" },
  { label: "Marca A-Z", campo: "marca", dir: "asc" },
  { label: "Modelo A-Z", campo: "modelo", dir: "asc" },
  { label: "Menor KM", campo: "quilometragem", dir: "asc" },
  { label: "Maior KM", campo: "quilometragem", dir: "desc" },
  { label: "Ano ↑", campo: "anoModelo", dir: "asc" },
  { label: "Ano ↓", campo: "anoModelo", dir: "desc" },
];

const FILTROS_INICIAIS: VeiculoFiltros = {
  busca: "",
  marca: "",
  modelo: "",
  ano: "",
  categoria: "",
  combustivel: "",
  cambio: "",
  cidade: "",
  status: "",
  destaque: "",
  precoInicial: "",
  precoFinal: "",
};

/* ── ThemeToggle (mesmo padrão das demais páginas) ──────────────── */
function ThemeToggle() {
  const { theme, setTheme, mounted } = useVeiculoTheme();
  if (!mounted) return <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-200/60" />;
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 ${
        theme === "dark"
          ? "bg-slate-800/60 text-yellow-400 ring-1 ring-slate-700/30 hover:bg-slate-700/60"
          : "bg-slate-200/60 text-orange-500 ring-1 ring-slate-300/30 hover:bg-slate-300/60"
      }`}
    >
      <motion.div
        initial={false}
        animate={{ rotate: theme === "dark" ? 0 : 180, scale: theme === "dark" ? 1 : 0.8 }}
        transition={{ duration: 0.3 }}
      >
        {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </motion.div>
    </motion.button>
  );
}

/* ══════════════════════════════════════════════════════════════════
   Página principal
══════════════════════════════════════════════════════════════════ */
export default function VeiculosAdminPage() {
  const router = useRouter();
  const { isDark, mounted, colors, inputClass, selectClass } = useVeiculoTheme();
  const user = getUserLocalStorage() || {};

  /* ── Dados ─────────────────────────────────────────────────────── */
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* ── Busca / filtros ────────────────────────────────────────────── */
  const [busca, setBusca] = useState("");
  const [filtros, setFiltros] = useState<VeiculoFiltros>(FILTROS_INICIAIS);
  const [filtrosDraft, setFiltrosDraft] = useState<VeiculoFiltros>(FILTROS_INICIAIS);
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);

  /* ── Ordenação (select) ─────────────────────────────────────────── */
  const [ordenacaoIdx, setOrdenacaoIdx] = useState(0);
  const ordenacaoAtual = ORDENACAO_OPTIONS[ordenacaoIdx];
  const ordenacao: Ordenacao = {
    campo: ordenacaoAtual.campo,
    direcao: ordenacaoAtual.dir,
  };

  /* ── Paginação ──────────────────────────────────────────────────── */
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itensPorPagina, setItensPorPagina] = useState(12); // grid de cards fica melhor em múltiplos de 4

  /* ── Modais ─────────────────────────────────────────────────────── */
  const [excluirAlvo, setExcluirAlvo] = useState<Veiculo | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const [fotoModalVeiculo, setFotoModalVeiculo] = useState<Veiculo | null>(null);

  /**
   * refreshKeys — mapa veiculoId → número que, quando incrementado,
   * faz o VeiculoCard re-buscar as fotos daquele veículo.
   */
  const [refreshKeys, setRefreshKeys] = useState<Record<number, number>>({});

  /* ── Helpers ────────────────────────────────────────────────────── */
  const notificar = (tipo: "success" | "error", msg: string) => {
    if (tipo === "success") setSuccess(msg);
    else setError(msg);
    setTimeout(() => (tipo === "success" ? setSuccess("") : setError("")), 3500);
  };

  const carregarVeiculos = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get("/veiculos");
      setVeiculos((data ?? []).map(mapVeiculo));
    } catch {
      setError("Não foi possível carregar os veículos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregarVeiculos(); }, []);
  useEffect(() => { setPaginaAtual(1); }, [busca, filtros, itensPorPagina]);

  /* ── Opções de filtro derivadas ─────────────────────────────────── */
  const marcas = useMemo(
    () => Array.from(new Set(veiculos.map((v) => v.marca).filter(Boolean))).sort(),
    [veiculos],
  );
  const cidades = useMemo(
    () => Array.from(new Set(veiculos.map((v) => v.cidade).filter(Boolean) as string[])).sort(),
    [veiculos],
  );

  /* ── Filtragem + ordenação ──────────────────────────────────────── */
  const veiculosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const precoMin = filtros.precoInicial ? Number(filtros.precoInicial) : null;
    const precoMax = filtros.precoFinal ? Number(filtros.precoFinal) : null;

    const filtrada = veiculos.filter((v) => {
      const alvo = `${v.marca} ${v.modelo} ${v.versao} ${v.placa}`.toLowerCase();
      if (termo && !alvo.includes(termo)) return false;
      if (filtros.marca && v.marca !== filtros.marca) return false;
      if (filtros.modelo && !v.modelo.toLowerCase().includes(filtros.modelo.toLowerCase())) return false;
      if (filtros.ano && String(v.anoModelo) !== filtros.ano && String(v.anoFabricacao) !== filtros.ano) return false;
      if (filtros.categoria && v.categoria !== filtros.categoria) return false;
      if (filtros.combustivel && v.combustivel !== filtros.combustivel) return false;
      if (filtros.cambio && v.cambio !== filtros.cambio) return false;
      if (filtros.cidade && v.cidade !== filtros.cidade) return false;
      if (filtros.status && v.status !== filtros.status) return false;
      if (filtros.destaque === "true" && !v.destaque) return false;
      if (filtros.destaque === "false" && v.destaque) return false;
      if (precoMin !== null && v.valor < precoMin) return false;
      if (precoMax !== null && v.valor > precoMax) return false;
      return true;
    });

    const dir = ordenacao.direcao === "asc" ? 1 : -1;
    return [...filtrada].sort((a, b) => {
      const campo = ordenacao.campo;
      if (campo === "marca" || campo === "modelo") {
        const av = (a[campo] || "").toLowerCase();
        const bv = (b[campo] || "").toLowerCase();
        return av < bv ? -dir : av > bv ? dir : 0;
      }
      if (campo === "dataCadastro") {
        const av = a.dataCadastro ? new Date(a.dataCadastro).getTime() : 0;
        const bv = b.dataCadastro ? new Date(b.dataCadastro).getTime() : 0;
        return (av - bv) * dir;
      }
      return (((a[campo] as number) ?? 0) - ((b[campo] as number) ?? 0)) * dir;
    });
  }, [veiculos, busca, filtros, ordenacao]);

  /* ── Paginação ──────────────────────────────────────────────────── */
  const totalPaginas = Math.max(1, Math.ceil(veiculosFiltrados.length / itensPorPagina));
  const paginaSegura = Math.min(paginaAtual, totalPaginas);
  const indiceInicial = (paginaSegura - 1) * itensPorPagina;
  const indiceFinal = indiceInicial + itensPorPagina;
  const veiculosPaginados = veiculosFiltrados.slice(indiceInicial, indiceFinal);

  /* ── Estatísticas ───────────────────────────────────────────────── */
  const stats = useMemo(() => ({
    total: veiculos.length,
    disponiveis: veiculos.filter((v) => v.status === "DISPONIVEL").length,
    reservados: veiculos.filter((v) => v.status === "RESERVADO").length,
    vendidos: veiculos.filter((v) => v.status === "VENDIDO").length,
    valorEstoque: veiculos
      .filter((v) => v.status !== "VENDIDO")
      .reduce((acc, v) => acc + (v.valor || 0), 0),
  }), [veiculos]);

  const temFiltroAtivo = busca.trim() !== "" || Object.values(filtros).some((v) => v !== "");

  /* ── Navegação ──────────────────────────────────────────────────── */
  const irParaNovo = () => router.push("/veiculo-admin/novo-veiculo");
  const irParaFinanceiro = (v: Veiculo) => router.push(`/veiculo-admin/${v.id}/financeiro`);

  /* ── Ações ──────────────────────────────────────────────────────── */
  const aplicarFiltros = () => {
    setFiltros((prev) => ({ ...filtrosDraft, busca: prev.busca }));
    setFiltrosAbertos(false);
  };
  const limparFiltros = () => {
    setFiltrosDraft(FILTROS_INICIAIS);
    setFiltros(FILTROS_INICIAIS);
    setBusca("");
  };

  const confirmarExclusao = async () => {
    if (!excluirAlvo) return;
    setExcluindo(true);
    try {
      await axiosInstance.delete(`/veiculos/${excluirAlvo.id}`);
      notificar("success", "Veículo excluído com sucesso.");
      setVeiculos((prev) => prev.filter((v) => v.id !== excluirAlvo.id));
      setExcluirAlvo(null);
    } catch {
      notificar("error", "Não foi possível excluir o veículo.");
    } finally {
      setExcluindo(false);
    }
  };

  /* Quando o FotoUploadModal fecha, incrementa o refreshKey do card */
  const handleFotoModalFechar = (fotosAtualizadas: FotoVeiculo[]) => {
    if (fotoModalVeiculo) {
      setRefreshKeys((prev) => ({
        ...prev,
        [fotoModalVeiculo.id]: (prev[fotoModalVeiculo.id] ?? 0) + 1,
      }));
    }
    setFotoModalVeiculo(null);
  };

  /* ──────────────────────────────────────────────────────────────── */
  return (
    <DefaultLayout>
      <div
        className={`relative min-h-dvh w-full overflow-hidden ${
          mounted ? colors.background : "bg-slate-50"
        } ${colors.text.primary}`}
      >
        {/* Efeitos de fundo */}
        {mounted && isDark && (
          <>
            <div className="pointer-events-none absolute inset-0 opacity-50 [background:repeating-linear-gradient(0deg,rgba(255,255,255,.03)_0px,rgba(255,255,255,.03)_1px,transparent_1px,transparent_3px)]" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1000px_300px_at_50%_-20%,rgba(59,130,246,.25),transparent)]" />
          </>
        )}
        {mounted && !isDark && (
          <>
            <div className="pointer-events-none absolute inset-0 opacity-30 [background:repeating-linear-gradient(0deg,rgba(0,0,0,.02)_0px,rgba(0,0,0,.02)_1px,transparent_1px,transparent_3px)]" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1000px_300px_at_50%_-20%,rgba(59,130,246,.15),transparent)]" />
          </>
        )}

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${
              isDark ? "bg-blue-500/20 ring-1 ring-blue-400/30" : "bg-blue-500/15 ring-1 ring-blue-400/20"
            }`}>
              <Car className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <p className={`text-xs/4 ${colors.text.secondary}`}>Estoque</p>
              <h1 className="font-semibold tracking-wide">Gestão de Veículos</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <span className={`hidden text-xs sm:block ${colors.text.secondary}`}>
              {user.nomeCompleto || "Administrador"}
            </span>
          </div>
        </div>

        <main className="relative z-10 mx-auto max-w-[1400px] px-4 pb-24 sm:px-6">
          {/* Título */}
          <section className="pt-4">
            <motion.h2
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-semibold md:text-3xl"
            >
              Estoque de Veículos
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className={`mt-1 text-sm ${colors.text.secondary}`}
            >
              Gerencie o estoque, adicione fotos e publique os veículos.
            </motion.p>
          </section>

          {/* Alertas */}
          <AnimatePresence>
            {(error || success) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4"
              >
                <div className={`flex items-center gap-3 rounded-2xl border p-4 backdrop-blur ${
                  error
                    ? isDark ? "border-red-500/30 bg-red-500/10 text-red-300" : "border-red-400/30 bg-red-100/80 text-red-700"
                    : isDark ? "border-green-500/30 bg-green-500/10 text-green-300" : "border-green-400/30 bg-green-100/80 text-green-700"
                }`}>
                  {error ? <AlertTriangle className="h-5 w-5 flex-shrink-0" /> : <Check className="h-5 w-5 flex-shrink-0" />}
                  <span className="text-sm">{error || success}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dashboard cards */}
          <div className="mt-6">
            <DashboardCards
              total={stats.total}
              disponiveis={stats.disponiveis}
              reservados={stats.reservados}
              vendidos={stats.vendidos}
              valorEstoque={stats.valorEstoque}
            />
          </div>

          {/* Barra: busca + ordenação + novo veículo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center"
          >
            {/* Busca */}
            <div className="relative flex-1">
              <Search className={`pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 ${colors.text.muted}`} />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Pesquisar por marca, modelo, versão ou placa..."
                className={`${inputClass} !pl-12 !pr-11`}
              />
              {busca && (
                <button
                  onClick={() => setBusca("")}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 transition-colors ${
                    isDark ? "text-slate-400 hover:bg-slate-700/60" : "text-slate-500 hover:bg-slate-200/60"
                  }`}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Ordenação */}
            <div className="relative">
              <select
                value={ordenacaoIdx}
                onChange={(e) => setOrdenacaoIdx(Number(e.target.value))}
                className={`${selectClass} !py-3 !pr-10 appearance-none min-w-[180px]`}
              >
                {ORDENACAO_OPTIONS.map((o, i) => (
                  <option key={i} value={i}>{o.label}</option>
                ))}
              </select>
              <ChevronDown className={`pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 ${colors.text.muted}`} />
            </div>

            {/* Botão novo */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={irParaNovo}
              className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 font-medium text-white transition-all hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              Novo Veículo
            </motion.button>
          </motion.div>

          {/* Filtros avançados */}
          <div className="mt-4">
            <VeiculoFilters
              filtros={filtrosDraft}
              marcas={marcas}
              cidades={cidades}
              aberto={filtrosAbertos}
              onToggle={() => setFiltrosAbertos((v) => !v)}
              onChange={(name, value) => setFiltrosDraft((prev) => ({ ...prev, [name]: value }))}
              onAplicar={aplicarFiltros}
              onLimpar={limparFiltros}
            />
          </div>

          {/* Contagem + resultados */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="mt-6 flex items-center gap-2"
          >
            <p className={`text-sm ${colors.text.secondary}`}>
              <span className="font-semibold">{veiculosFiltrados.length}</span> de{" "}
              <span className="font-semibold">{veiculos.length}</span> veículos
            </p>
            {temFiltroAtivo && (
              <button
                onClick={limparFiltros}
                className={`text-xs underline underline-offset-2 ${isDark ? "text-blue-400" : "text-blue-600"}`}
              >
                Limpar filtros
              </button>
            )}
          </motion.div>

          {/* Grade de cards */}
          <section className="mt-4">
            {loading ? (
              <LoadingCards count={8} />
            ) : veiculosFiltrados.length === 0 ? (
              <EmptyState
                filtrado={temFiltroAtivo}
                onCadastrar={irParaNovo}
                onLimparFiltros={limparFiltros}
              />
            ) : (
              <>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {veiculosPaginados.map((veiculo) => (
                    <VeiculoCard
                      key={veiculo.id}
                      veiculo={veiculo}
                      refreshKey={refreshKeys[veiculo.id] ?? 0}
                      onFotos={setFotoModalVeiculo}
                      onFinanceiro={irParaFinanceiro}
                      onExcluir={setExcluirAlvo}
                    />
                  ))}
                </div>

                {/* Paginação */}
                <div className={`mt-8 rounded-2xl border p-4 backdrop-blur ${colors.card.border} ${colors.card.background}`}>
                  <Pagination
                    paginaAtual={paginaSegura}
                    totalPaginas={totalPaginas}
                    totalItens={veiculosFiltrados.length}
                    itensPorPagina={itensPorPagina}
                    indiceInicial={indiceInicial}
                    indiceFinal={indiceFinal}
                    onPaginaChange={setPaginaAtual}
                    onItensPorPaginaChange={(qtd) => {
                      setItensPorPagina(qtd);
                      setPaginaAtual(1);
                    }}
                  />
                </div>
              </>
            )}
          </section>
        </main>

        <footer className={`relative z-10 mx-auto max-w-[1400px] px-6 pb-8 pt-6 text-center text-xs ${colors.text.muted}`}>
          © {new Date().getFullYear()} – Sistema de Gestão de Veículos. Desenvolvido com Next.js e Tailwind.
        </footer>
      </div>

      {/* Modais */}
      <ConfirmDeleteModal
        aberto={!!excluirAlvo}
        veiculo={excluirAlvo}
        carregando={excluindo}
        onCancelar={() => setExcluirAlvo(null)}
        onConfirmar={confirmarExclusao}
      />

      <FotoUploadModal
        aberto={!!fotoModalVeiculo}
        veiculo={fotoModalVeiculo}
        onFechar={handleFotoModalFechar}
      />
    </DefaultLayout>
  );
}
