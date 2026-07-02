"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Car,
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Fuel,
  Users,
  Calendar,
  LogIn,
  Menu,
  ChevronDown,
  Phone,
  MapPin,
  Shield,
  Zap,
  Star,
  Camera,
  Gauge,
  Settings2,
  Tag,
  ArrowRight,
  Heart,
  Share2,
} from "lucide-react";
import axios from "axios";
import { BASE_URL } from "@/config/config";
import type { FotoVeiculo, Veiculo } from "@/types/veiculo";
import {
  combustivelLabel,
  cambioLabel,
  formatBRL,
  formatKm,
  mapVeiculo,
  STATUS_LABELS,
} from "@/app/(pages)/(internas)/veiculo-admin/_components/veiculo.utils";

// ─── Helpers ────────────────────────────────────────────────────────────────────

async function fetchPublic<T>(url: string): Promise<T> {
  const { data } = await axios.get<T>(`${BASE_URL}${url}`);
  return data;
}

const STATUS_BADGE: Record<string, { label: string; cls: string; dot: string }> = {
  DISPONIVEL: { label: "Disponível", cls: "bg-emerald-100 text-emerald-800 border-emerald-200", dot: "bg-emerald-500" },
  RESERVADO: { label: "Reservado", cls: "bg-amber-100 text-amber-800 border-amber-200", dot: "bg-amber-500" },
  EM_NEGOCIACAO: { label: "Em negociação", cls: "bg-blue-100 text-blue-800 border-blue-200", dot: "bg-blue-500" },
  EM_PREPARACAO: { label: "Em preparação", cls: "bg-purple-100 text-purple-800 border-purple-200", dot: "bg-purple-500" },
  VENDIDO: { label: "Vendido", cls: "bg-gray-100 text-black border-gray-200", dot: "bg-gray-500" },
  INATIVO: { label: "Inativo", cls: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-500" },
};

// ─── Navbar ──────────────────────────────────────────────────────────────────────

function Navbar() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <a href="/externo" className="flex items-center gap-2">
            <img
              src="/logo-232motors.png"
              alt="232 Motors"
              className="w-12 h-12 object-contain mix-blend-multiply"
            />
            <div className="leading-tight">
              <span className="block text-xl font-extrabold text-black tracking-tight">
                232<span className="text-blue-600">MOTORS</span>
              </span>
              <span className="block text-[10px] text-black -mt-0.5 font-medium tracking-wide uppercase">
                Loja de Veículos
              </span>
            </div>
          </a>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-black">
            <a href="#catalogo" className="hover:text-black transition-colors">Catálogo</a>
            <a href="#sobre" className="hover:text-black transition-colors">Sobre Nós</a>
            <a href="#contato" className="hover:text-black transition-colors">Contato</a>
          </nav>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/login")}
              className="hidden sm:flex items-center gap-2 bg-gray-900 hover:bg-black text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all"
            >
              <LogIn className="w-4 h-4" />
              Entrar
            </motion.button>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg text-black hover:bg-gray-100 transition-colors"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden border-t border-gray-100"
            >
              <nav className="py-3 flex flex-col gap-1 text-sm font-medium text-black">
                <a href="#catalogo" onClick={() => setMenuOpen(false)} className="px-2 py-2 rounded-lg hover:bg-gray-50">Catálogo</a>
                <a href="#sobre" onClick={() => setMenuOpen(false)} className="px-2 py-2 rounded-lg hover:bg-gray-50">Sobre Nós</a>
                <a href="#contato" onClick={() => setMenuOpen(false)} className="px-2 py-2 rounded-lg hover:bg-gray-50">Contato</a>
                <button
                  onClick={() => router.push("/login")}
                  className="flex items-center gap-2 mt-2 bg-gray-900 text-white font-semibold px-4 py-2 rounded-xl hover:bg-black transition"
                >
                  <LogIn className="w-4 h-4" /> Entrar na conta
                </button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

// ─── Hero ────────────────────────────────────────────────────────────────────────

function Hero({ busca, setBusca }: { busca: string; setBusca: (v: string) => void }) {
  return (
    <section className="relative overflow-hidden text-white min-h-[560px] flex items-center px-4">
      {/* Imagem de capa da loja — img direta para preservar qualidade original */}
      <img
        src="/loja-capa.png"
        alt="Fachada da loja"
        className="absolute inset-0 w-full h-full object-cover object-[75%_5%]"
      />
      {/* Overlay escuro para legibilidade */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 via-gray-900/65 to-gray-900/85" />
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-3xl mx-auto text-center py-16">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight mb-3 drop-shadow">
            Encontre o carro <span className="text-blue-400">ideal</span>
          </h1>
          <p className="text-gray-300 text-base sm:text-lg mb-8">
            Explore nosso catálogo completo com as melhores opções disponíveis
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="relative flex items-center bg-white rounded-2xl shadow-2xl overflow-hidden max-w-2xl mx-auto"
        >
          <Search className="absolute left-4 w-5 h-5 text-black pointer-events-none" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Busque por marca, modelo ou cor..."
            className="flex-1 pl-12 pr-4 py-4 text-black text-sm sm:text-base placeholder-gray-400 outline-none bg-transparent"
          />
          {busca && (
            <button onClick={() => setBusca("")} className="pr-4 text-black hover:text-black transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="flex items-center justify-center gap-6 mt-8 text-gray-300 text-xs sm:text-sm"
        >
          <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-blue-400" /> Veículos verificados</span>
          <span className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5 text-blue-400" /> Qualidade garantida</span>
          <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-blue-400" /> Consulta rápida</span>
        </motion.div>
      </div>
    </section>
  );
}

// ─── FilterBar ──────────────────────────────────────────────────────────────────

interface Filtros {
  busca: string;
  marca: string;
  combustivel: string;
  status: string;
}

function FilterBar({
  filtros,
  setFiltros,
  marcasDisponiveis,
  totalResultados,
}: {
  filtros: Filtros;
  setFiltros: React.Dispatch<React.SetStateAction<Filtros>>;
  marcasDisponiveis: string[];
  totalResultados: number;
}) {
  const temFiltroAtivo = filtros.marca !== "" || filtros.combustivel !== "" || filtros.status !== "";

  return (
    <div id="catalogo" className="bg-white border-b border-gray-200/50 shadow-sm sticky top-20 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-black text-sm font-medium">
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filtrar:</span>
          </div>

          <div className="relative">
            <select
              value={filtros.marca}
              onChange={(e) => setFiltros((f) => ({ ...f, marca: e.target.value }))}
              className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-xl bg-white text-gray-900 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300 cursor-pointer transition"
            >
              <option value="">Todas as Marcas</option>
              {marcasDisponiveis.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-black pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={filtros.combustivel}
              onChange={(e) => setFiltros((f) => ({ ...f, combustivel: e.target.value }))}
              className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-xl bg-white text-gray-900 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300 cursor-pointer transition"
            >
              <option value="">Combustível</option>
              {["GASOLINA","ETANOL","FLEX","DIESEL","GNV","ELETRICO","HIBRIDO"].map((c) => (
                <option key={c} value={c}>{combustivelLabel(c)}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-black pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={filtros.status}
              onChange={(e) => setFiltros((f) => ({ ...f, status: e.target.value }))}
              className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-xl bg-white text-gray-900 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300 cursor-pointer transition"
            >
              <option value="">Todos os Status</option>
              {Object.entries(STATUS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-black pointer-events-none" />
          </div>

          {temFiltroAtivo && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => setFiltros((f) => ({ ...f, marca: "", combustivel: "", status: "" }))}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition"
            >
              <X className="w-3.5 h-3.5" />
              Limpar filtros
            </motion.button>
          )}

          <div className="ml-auto text-sm text-black font-medium">
            {totalResultados} {totalResultados === 1 ? "veículo" : "veículos"} encontrado{totalResultados !== 1 ? "s" : ""}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── VeiculoCard Público ─────────────────────────────────────────────────────────

function VeiculoCardPublico({ veiculo, index }: { veiculo: Veiculo; index: number }) {
  const router = useRouter();

  const inicial: FotoVeiculo[] = veiculo.fotoPrincipal
    ? [{ id: 0, url: veiculo.fotoPrincipal, ordem: 0, principal: true }]
    : [];

  const [fotos, setFotos] = useState<FotoVeiculo[]>(inicial);
  const [fotosCarregadas, setFotosCarregadas] = useState(false);
  const [fotoIdx, setFotoIdx] = useState(0);
  const [fotoErro, setFotoErro] = useState(false);

  useEffect(() => {
    let ativo = true;
    fetchPublic<FotoVeiculo[]>(`/veiculos/${veiculo.id}/fotos`)
      .then((data) => {
        if (!ativo) return;
        const ordenadas = [...(data ?? [])].sort((a, b) => {
          if (a.principal && !b.principal) return -1;
          if (!a.principal && b.principal) return 1;
          return (a.ordem ?? 0) - (b.ordem ?? 0);
        });
        if (ordenadas.length > 0) {
          setFotos(ordenadas);
          setFotoIdx(0);
        }
        setFotosCarregadas(true);
      })
      .catch(() => { if (ativo) setFotosCarregadas(true); });
    return () => { ativo = false; };
  }, [veiculo.id]);

  const temFotos = fotos.length > 0 && !fotoErro;
  const fotoAtual = fotos[fotoIdx];
  const badge = STATUS_BADGE[veiculo.status] ?? STATUS_BADGE["INATIVO"];
  const isDisponivel = veiculo.status === "DISPONIVEL";
  const temMultiplasFotos = fotosCarregadas && fotos.length > 1;

  const irFoto = (dir: 1 | -1, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setFotoErro(false);
    setFotoIdx((p) => (p + dir + fotos.length) % fotos.length);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.04 * (index % 12) }}
      className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col cursor-pointer"
    >
      {/* ── Foto ────────────────────────────────────────────────────── */}
      <div
        className="relative aspect-[4/3] w-full overflow-hidden bg-gray-900"
        onClick={() => router.push(`/externo/${veiculo.id}`)}
      >
        {temFotos ? (
          <>
            <AnimatePresence mode="wait">
              <motion.img
                key={fotoAtual?.url}
                src={fotoAtual?.url}
                alt={`${veiculo.marca} ${veiculo.modelo}`}
                className="h-full w-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onError={() => setFotoErro(true)}
              />
            </AnimatePresence>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />

            {temMultiplasFotos && (
              <>
                <button
                  onClick={(e) => irFoto(-1, e)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 hover:bg-black/75 text-white backdrop-blur-sm transition-colors z-10 opacity-0 group-hover:opacity-100"
                  aria-label="Foto anterior"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={(e) => irFoto(1, e)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 hover:bg-black/75 text-white backdrop-blur-sm transition-colors z-10 opacity-0 group-hover:opacity-100"
                  aria-label="Próxima foto"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>

                <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 z-10">
                  {fotos.slice(0, 8).map((_, i) => (
                    <button
                      key={i}
                      onClick={(e) => { e.stopPropagation(); e.preventDefault(); setFotoErro(false); setFotoIdx(i); }}
                      className={`h-1.5 rounded-full transition-all ${i === fotoIdx ? "w-4 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80"}`}
                      aria-label={`Foto ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}

            {fotosCarregadas && fotos.length > 1 && (
              <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm pointer-events-none">
                <Camera className="h-3.5 w-3.5" />
                {fotoIdx + 1}/{fotos.length}
              </span>
            )}
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2">
            <Car className="h-12 w-12 text-black" />
            <p className="text-xs text-black">Sem fotos</p>
          </div>
        )}

        {veiculo.destaque && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-amber-500/90 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm pointer-events-none">
            <Star className="h-3.5 w-3.5 fill-current" />
            Destaque
          </span>
        )}
      </div>

      {/* ── Info ────────────────────────────────────────────────────── */}
      <div
        className="p-4 flex flex-col gap-3 flex-1"
        onClick={() => router.push(`/externo/${veiculo.id}`)}
      >
        <div className="flex items-start justify-between gap-2">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.cls}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
            {badge.label}
          </span>
          <button 
            onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors text-black hover:text-black"
          >
            <Heart className="w-4 h-4" />
          </button>
        </div>

        <div>
          <h3 className="text-base font-bold text-black leading-tight truncate">
            {veiculo.marca} {veiculo.modelo}
          </h3>
          <p className="text-sm text-black mt-0.5 truncate">
            {veiculo.versao ? `${veiculo.versao} · ` : ""}{veiculo.anoFabricacao}/{veiculo.anoModelo}
            {veiculo.cor ? ` · ${veiculo.cor}` : ""}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {veiculo.combustivel && (
            <Chip icon={Fuel} label={combustivelLabel(veiculo.combustivel as string)} />
          )}
          {veiculo.cambio && (
            <Chip icon={Settings2} label={cambioLabel(veiculo.cambio as string)} />
          )}
          {veiculo.quilometragem > 0 && (
            <Chip icon={Gauge} label={formatKm(veiculo.quilometragem)} />
          )}
          {(veiculo.cidade || veiculo.estado) && (
            <Chip icon={MapPin} label={[veiculo.cidade, veiculo.estado].filter(Boolean).join(" - ")} />
          )}
        </div>

        <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
          <div>
            {veiculo.valor > 0 ? (
              <p className="text-xl font-bold text-blue-600">{formatBRL(veiculo.valor)}</p>
            ) : (
              <p className="text-sm font-medium text-black">Consulte o valor</p>
            )}
            {veiculo.valorFipe && (
              <p className="text-xs text-black">FIPE {formatBRL(veiculo.valorFipe)}</p>
            )}
          </div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
              isDisponivel
                ? "bg-gray-900 hover:bg-black text-white shadow-sm"
                : "bg-gray-100 text-black"
            }`}
          >
            Ver mais
            <ArrowRight className="w-3.5 h-3.5" />
          </motion.div>
        </div>
      </div>
    </motion.article>
  );
}

function Chip({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs bg-gray-100 text-black">
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────────

function VeiculoSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden animate-pulse">
      <div className="aspect-[4/3] bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-gray-200 rounded-full w-3/4" />
        <div className="h-3 bg-gray-100 rounded-full w-1/2" />
        <div className="flex gap-2">
          <div className="h-5 w-16 bg-gray-100 rounded-full" />
          <div className="h-5 w-20 bg-gray-100 rounded-full" />
        </div>
        <div className="flex justify-between pt-2 border-t border-gray-100">
          <div className="h-6 bg-gray-200 rounded-full w-24" />
          <div className="h-8 bg-gray-200 rounded-xl w-20" />
        </div>
      </div>
    </div>
  );
}

function EmptyState({ temFiltro }: { temFiltro: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="col-span-full flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <Car className="w-10 h-10 text-black" />
      </div>
      <h3 className="text-lg font-bold text-black mb-1">
        {temFiltro ? "Nenhum veículo encontrado" : "Nenhum veículo disponível"}
      </h3>
      <p className="text-sm text-black max-w-xs">
        {temFiltro ? "Tente ajustar os filtros ou limpar a busca." : "Nosso catálogo está sendo atualizado. Volte em breve!"}
      </p>
    </motion.div>
  );
}

// ─── Pagination ──────────────────────────────────────────────────────────────────

function Pagination({ paginaAtual, totalPaginas, onChange }: { paginaAtual: number; totalPaginas: number; onChange: (p: number) => void }) {
  if (totalPaginas <= 1) return null;

  const paginas = Array.from({ length: totalPaginas }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPaginas || (p >= paginaAtual - 1 && p <= paginaAtual + 1)
  );

  return (
    <div className="flex items-center justify-center gap-2 mt-10">
      <motion.button
        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
        onClick={() => onChange(Math.max(1, paginaAtual - 1))}
        disabled={paginaAtual === 1}
        className="p-2 rounded-xl border border-gray-200 text-black hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        <ChevronLeft className="w-4 h-4" />
      </motion.button>

      {paginas.map((p, idx) => {
        const prev = paginas[idx - 1];
        const ellipsis = prev && p - prev > 1;
        return (
          <span key={p} className="flex items-center gap-2">
            {ellipsis && <span className="text-black text-sm px-1">…</span>}
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => onChange(p)}
              className={`w-10 h-10 rounded-xl text-sm font-semibold border transition ${
                p === paginaAtual
                  ? "bg-gray-900 text-white border-transparent shadow-sm"
                  : "border-gray-200 text-black hover:bg-gray-50"
              }`}
            >
              {p}
            </motion.button>
          </span>
        );
      })}

      <motion.button
        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
        onClick={() => onChange(Math.min(totalPaginas, paginaAtual + 1))}
        disabled={paginaAtual === totalPaginas}
        className="p-2 rounded-xl border border-gray-200 text-black hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        <ChevronRight className="w-4 h-4" />
      </motion.button>
    </div>
  );
}

// ─── Footer ──────────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer id="contato" className="bg-white border-t border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <img
                src="/logo-232motors.png"
                alt="232 Motors"
                className="w-12 h-12 object-contain mix-blend-multiply"
              />
              <span className="text-xl font-extrabold text-black tracking-tight">
                232<span className="text-blue-600">MOTORS</span>
              </span>
            </div>
            <p className="text-sm text-black leading-relaxed">
              Sua loja de veículos com as melhores opções do mercado.
            </p>
          </div>

          <div id="sobre">
            <h4 className="text-black font-semibold mb-3 text-sm uppercase tracking-wide">Sobre Nós</h4>
            <ul className="space-y-2 text-sm text-black">
              <li><a href="#catalogo" className="hover:text-black transition-colors">Catálogo de Veículos</a></li>
              <li><a href="#" className="hover:text-black transition-colors">Quem Somos</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-black font-semibold mb-3 text-sm uppercase tracking-wide">Contato</h4>
            <ul className="space-y-2 text-sm text-black">
              <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-black flex-shrink-0" /><span>(XX) XXXXX-XXXX</span></li>
              <li className="flex items-center gap-2"><MapPin className="w-4 h-4 text-black flex-shrink-0" /><span>Sua cidade, Brasil</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-black">
          <span>© {new Date().getFullYear()} 232 Motors. Todos os direitos reservados.</span>
          <span>Desenvolvido com ♥</span>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────────

const ITENS_POR_PAGINA = 12;

export default function ExternoPage() {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const [filtros, setFiltros] = useState<Filtros>({ busca: "", marca: "", combustivel: "", status: "" });
  const [paginaAtual, setPaginaAtual] = useState(1);

  useEffect(() => {
    fetchPublic<unknown[]>("/veiculos")
      .then((data) => setVeiculos((data ?? []).map(mapVeiculo)))
      .catch((err: unknown) => {
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status === 401 || status === 403) {
          setErro("O catálogo público ainda não está habilitado no servidor. Reinicie o backend para ativar a nova configuração.");
        } else {
          setErro("Não foi possível carregar o catálogo. Verifique sua conexão e tente novamente.");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const marcasDisponiveis = Array.from(new Set(veiculos.map((v) => v.marca).filter(Boolean))).sort();

  const veiculosFiltrados = veiculos.filter((v) => {
    const q = filtros.busca.toLowerCase();
    return (
      (q === "" || v.modelo.toLowerCase().includes(q) || v.marca.toLowerCase().includes(q) || (v.cor ?? "").toLowerCase().includes(q)) &&
      (filtros.marca === "" || v.marca === filtros.marca) &&
      (filtros.combustivel === "" || v.combustivel === filtros.combustivel) &&
      (filtros.status === "" || v.status === filtros.status)
    );
  });

  const totalPaginas = Math.ceil(veiculosFiltrados.length / ITENS_POR_PAGINA);
  const veiculosPaginados = veiculosFiltrados.slice(
    (paginaAtual - 1) * ITENS_POR_PAGINA,
    paginaAtual * ITENS_POR_PAGINA
  );

  const handleBusca = useCallback((v: string) => { setFiltros((f) => ({ ...f, busca: v })); setPaginaAtual(1); }, []);
  const handleFiltros = useCallback((fn: React.SetStateAction<Filtros>) => { setFiltros(fn); setPaginaAtual(1); }, []);
  const temFiltroAtivo = filtros.busca !== "" || filtros.marca !== "" || filtros.combustivel !== "" || filtros.status !== "";

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
      <Navbar />
      <Hero busca={filtros.busca} setBusca={handleBusca} />
      <FilterBar filtros={filtros} setFiltros={handleFiltros} marcasDisponiveis={marcasDisponiveis} totalResultados={veiculosFiltrados.length} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {erro && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm flex items-center gap-2"
          >
            <X className="w-4 h-4 flex-shrink-0" />
            {erro}
          </motion.div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {loading
            ? [...Array(8)].map((_, i) => <VeiculoSkeleton key={i} />)
            : veiculosPaginados.length === 0
            ? <EmptyState temFiltro={temFiltroAtivo} />
            : veiculosPaginados.map((v, i) => <VeiculoCardPublico key={v.id} veiculo={v} index={i} />)
          }
        </div>

        <Pagination paginaAtual={paginaAtual} totalPaginas={totalPaginas} onChange={setPaginaAtual} />
      </main>

      <Footer />
    </div>
  );
}