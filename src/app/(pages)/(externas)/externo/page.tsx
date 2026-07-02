"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Car,
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Fuel,
  LogIn,
  Menu,
  Phone,
  MapPin,
  Shield,
  Zap,
  Star,
  Camera,
  Gauge,
  Settings2,
  ArrowRight,
  Heart,
  SlidersHorizontal,
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
              className="hidden sm:flex items-center gap-2 bg-gray-900 hover:bg-black text-sm font-semibold px-5 py-2.5 rounded-xl transition-all"
              style={{ color: "#ffffff" }}
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
                  className="flex items-center gap-2 mt-2 bg-gray-900 font-semibold px-4 py-2 rounded-xl hover:bg-black transition"
                  style={{ color: "#ffffff" }}
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

// ─── Filtros ─────────────────────────────────────────────────────────────────────

const ANO_ATUAL = new Date().getFullYear();

interface Filtros {
  busca: string;
  tipoVeiculo: "CARRO" | "MOTO" | "";
  marca: string;
  modelo: string;
  precoMax: number;   // preço máximo (500000 = Qualquer)
  anoMin: number;     // ano mínimo de fabricação (2000 = Qualquer)
  kmMax: number;      // km máxima (300000 = Qualquer)
  cambio: string;
  combustivel: string;
  cor: string;
  carroceria: string;
}

const FILTROS_PADRAO: Filtros = {
  busca: "",
  tipoVeiculo: "",
  marca: "",
  modelo: "",
  precoMax: 500000,
  anoMin: 2000,
  kmMax: 300000,
  cambio: "",
  combustivel: "",
  cor: "",
  carroceria: "",
};

// ─── Sliders customizados ─────────────────────────────────────────────────────────
// Implementação via mouse/touch no window para drag suave e confiável.

const THUMB_CLS =
  "absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-blue-600 " +
  "shadow-md cursor-grab active:cursor-grabbing z-10 touch-none";

function SingleRangeSlider({
  min, max, step, value, onChange,
}: {
  min: number; max: number; step: number;
  value: number;
  onChange: (v: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const latest = useRef({ min, max, step, onChange });
  latest.current = { min, max, step, onChange };

  const fromClientX = (clientX: number) => {
    if (!trackRef.current) return min;
    const { left, width } = trackRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - left) / width));
    return Math.round((latest.current.min + ratio * (latest.current.max - latest.current.min)) / latest.current.step) * latest.current.step;
  };

  useEffect(() => {
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!dragging.current) return;
      const clientX = "touches" in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      latest.current.onChange(fromClientX(clientX));
    };
    const onUp = () => { dragging.current = false; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, []);

  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div ref={trackRef} className="relative h-5 my-1 select-none">
      <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1.5 rounded-full bg-gray-200 pointer-events-none">
        <div className="absolute h-full bg-blue-600 rounded-full left-0"
          style={{ right: `${100 - pct}%` }} />
      </div>
      <div className={THUMB_CLS} style={{ left: `calc(${pct}% - 8px)` }}
        onMouseDown={(e) => { e.preventDefault(); dragging.current = true; }}
        onTouchStart={(e) => { e.preventDefault(); dragging.current = true; }}
      />
    </div>
  );
}

// ─── FilterSidebar ────────────────────────────────────────────────────────────────

const selectCls =
  "w-full px-3 py-2 text-sm border border-gray-200 rounded-xl appearance-none bg-white " +
  "text-black focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition cursor-pointer";

const inputCls =
  "w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white text-black " +
  "focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition placeholder-gray-400";

// Conteúdo do sidebar extraído como função pura fora do componente pai para evitar
// remount a cada render (que destruiria os refs/effects dos sliders durante o drag).
function SidebarContent({
  filtros,
  setFiltros,
  coresDisponiveis,
  carroceriasDisponiveis,
  totalResultados,
  temFiltroAtivo,
  handleLimpar,
  isMobile = false,
}: {
  filtros: Filtros;
  setFiltros: React.Dispatch<React.SetStateAction<Filtros>>;
  coresDisponiveis: string[];
  carroceriasDisponiveis: string[];
  totalResultados: number;
  temFiltroAtivo: boolean;
  handleLimpar: () => void;
  isMobile?: boolean;
}) {
  const precoLabel = filtros.precoMax >= 500000 ? "Qualquer" : `Até ${formatBRL(filtros.precoMax)}`;
  const anoLabel = filtros.anoMin <= 2000 ? "Qualquer" : `A partir de ${filtros.anoMin}`;
  const kmLabel = filtros.kmMax >= 300000 ? "Qualquer" : formatKm(filtros.kmMax);

  const ChevronSvg = () => (
    <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-black pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );

  // No mobile, os campos ficam em 2 colunas para aproveitar melhor a largura
  const grid2 = isMobile ? "grid grid-cols-2 gap-x-3 gap-y-0" : "";
  const cell = isMobile ? "" : "mb-4";
  const cellFull = isMobile ? "col-span-2 mb-3" : "mb-4";
  const cellMb = isMobile ? "mb-3" : "mb-4";
  const sliderCell = isMobile ? "col-span-2 mb-4" : "mb-5";

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
      {/* Tabs Carros / Motos */}
      <div className={`flex rounded-xl border border-gray-200 overflow-hidden ${isMobile ? "mb-4" : "mb-5"}`}>
        {(["", "MOTO"] as const).map((tipo) => {
          const isCarros = tipo === "";
          const ativo = isCarros ? filtros.tipoVeiculo !== "MOTO" : filtros.tipoVeiculo === "MOTO";
          return (
            <button
              key={tipo}
              onClick={() => setFiltros((f) => ({ ...f, tipoVeiculo: isCarros ? "" : "MOTO" }))}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-semibold transition"
              style={ativo ? { backgroundColor: "#111827", color: "#ffffff" } : { backgroundColor: "#ffffff", color: "#000000" }}
            >
              {isCarros ? (
                <><Car className="w-4 h-4" /> Carros</>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="5.5" cy="17.5" r="3.5" /><circle cx="18.5" cy="17.5" r="3.5" />
                    <path d="M15 6h-3l-3 7H5.5" /><path d="M15 6l3 5.5" /><path d="M12 6V3h3" />
                  </svg>
                  Motos
                </>
              )}
            </button>
          );
        })}
      </div>

      {/* Header — só no desktop (no mobile está no botão toggle) */}
      {!isMobile && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5 text-xs font-bold text-black uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-red-500" />
            FILTROS
          </div>
          {temFiltroAtivo && (
            <button onClick={handleLimpar} className="text-xs text-blue-600 hover:underline font-medium">
              Limpar
            </button>
          )}
        </div>
      )}

      {/* Campos em grade (2 cols no mobile, 1 col no desktop) */}
      <div className={grid2}>

        {/* Marca */}
        <div className={isMobile ? "mb-3" : "mb-4"}>
          <label className="block text-xs font-semibold text-black mb-1.5">Marca</label>
          <input type="text" value={filtros.marca}
            onChange={(e) => setFiltros((f) => ({ ...f, marca: e.target.value }))}
            placeholder="Digite a marca" className={inputCls} />
        </div>

        {/* Modelo */}
        <div className={isMobile ? "mb-3" : "mb-4"}>
          <label className="block text-xs font-semibold text-black mb-1.5">Modelo</label>
          <input type="text" value={filtros.modelo}
            onChange={(e) => setFiltros((f) => ({ ...f, modelo: e.target.value }))}
            placeholder="Ex: Civic" className={inputCls} />
        </div>

        {/* Preço máximo — full width */}
        <div className={`${sliderCell} ${isMobile ? "col-span-2" : ""}`}>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-black">Faixa de Preço</label>
            <span className="text-xs text-orange-500 font-semibold">{precoLabel}</span>
          </div>
          <SingleRangeSlider min={0} max={500000} step={5000}
            value={filtros.precoMax}
            onChange={(v) => setFiltros((f) => ({ ...f, precoMax: v }))} />
          <div className="flex justify-between text-[10px] text-black mt-1.5">
            <span>R$ 0</span><span>R$ 500 mil</span>
          </div>
        </div>

        {/* Ano mínimo — full width */}
        <div className={`${sliderCell} ${isMobile ? "col-span-2" : ""}`}>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-black">Ano de Fabricação</label>
            <span className="text-xs text-orange-500 font-semibold">{anoLabel}</span>
          </div>
          <SingleRangeSlider min={2000} max={ANO_ATUAL} step={1}
            value={filtros.anoMin}
            onChange={(v) => setFiltros((f) => ({ ...f, anoMin: v }))} />
          <div className="flex justify-between text-[10px] text-black mt-1.5">
            <span>2000</span><span>{ANO_ATUAL}</span>
          </div>
        </div>

        {/* Km máxima — full width */}
        <div className={`${sliderCell} ${isMobile ? "col-span-2" : ""}`}>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-black">Quilometragem até</label>
            <span className="text-xs text-orange-500 font-semibold">{kmLabel}</span>
          </div>
          <SingleRangeSlider min={0} max={300000} step={5000}
            value={filtros.kmMax}
            onChange={(v) => setFiltros((f) => ({ ...f, kmMax: v }))} />
          <div className="flex justify-between text-[10px] text-black mt-1.5">
            <span>0 km</span><span>300 mil km</span>
          </div>
        </div>

        {/* Câmbio */}
        <div className={isMobile ? "mb-3" : "mb-4"}>
          <label className="block text-xs font-semibold text-black mb-1.5">Câmbio</label>
          <div className="relative">
            <select value={filtros.cambio} onChange={(e) => setFiltros((f) => ({ ...f, cambio: e.target.value }))} className={selectCls}>
              <option value="">Todos</option>
              {["MANUAL", "AUTOMATICO", "CVT", "DCT", "AUTOMATIZADO"].map((c) => (
                <option key={c} value={c}>{cambioLabel(c)}</option>
              ))}
            </select>
            <ChevronSvg />
          </div>
        </div>

        {/* Combustível */}
        <div className={isMobile ? "mb-3" : "mb-4"}>
          <label className="block text-xs font-semibold text-black mb-1.5">Combustível</label>
          <div className="relative">
            <select value={filtros.combustivel} onChange={(e) => setFiltros((f) => ({ ...f, combustivel: e.target.value }))} className={selectCls}>
              <option value="">Todos</option>
              {["GASOLINA", "ETANOL", "FLEX", "DIESEL", "GNV", "ELETRICO", "HIBRIDO"].map((c) => (
                <option key={c} value={c}>{combustivelLabel(c)}</option>
              ))}
            </select>
            <ChevronSvg />
          </div>
        </div>

        {/* Cor */}
        <div className={isMobile ? "mb-3" : "mb-4"}>
          <label className="block text-xs font-semibold text-black mb-1.5">Cor</label>
          <div className="relative">
            <select value={filtros.cor} onChange={(e) => setFiltros((f) => ({ ...f, cor: e.target.value }))} className={selectCls}>
              <option value="">Todas</option>
              {coresDisponiveis.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronSvg />
          </div>
        </div>

        {/* Carroceria */}
        {carroceriasDisponiveis.length > 0 && (
          <div className={isMobile ? "mb-3" : "mb-2"}>
            <label className="block text-xs font-semibold text-black mb-1.5">Carroceria</label>
            <div className="relative">
              <select value={filtros.carroceria} onChange={(e) => setFiltros((f) => ({ ...f, carroceria: e.target.value }))} className={selectCls}>
                <option value="">Todas</option>
                {carroceriasDisponiveis.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronSvg />
            </div>
          </div>
        )}
      </div>

      {/* Total */}
      <div className="mt-3 pt-3 border-t border-gray-100 text-center text-sm text-black font-medium">
        {totalResultados} {totalResultados === 1 ? "veículo encontrado" : "veículos encontrados"}
      </div>
    </div>
  );
}

function FilterSidebar({
  filtros,
  setFiltros,
  coresDisponiveis,
  carroceriasDisponiveis,
  totalResultados,
}: {
  filtros: Filtros;
  setFiltros: React.Dispatch<React.SetStateAction<Filtros>>;
  coresDisponiveis: string[];
  carroceriasDisponiveis: string[];
  totalResultados: number;
}) {
  const [mobileAberto, setMobileAberto] = useState(false);

  const temFiltroAtivo =
    filtros.tipoVeiculo !== "" ||
    filtros.marca !== "" ||
    filtros.modelo !== "" ||
    filtros.precoMax < 500000 ||
    filtros.anoMin > 2000 ||
    filtros.kmMax < 300000 ||
    filtros.cambio !== "" ||
    filtros.combustivel !== "" ||
    filtros.cor !== "" ||
    filtros.carroceria !== "";

  const activeCount = [
    filtros.tipoVeiculo !== "",
    filtros.marca !== "",
    filtros.modelo !== "",
    filtros.precoMax < 500000,
    filtros.anoMin > 2000,
    filtros.kmMax < 300000,
    filtros.cambio !== "",
    filtros.combustivel !== "",
    filtros.cor !== "",
    filtros.carroceria !== "",
  ].filter(Boolean).length;

  const handleLimpar = () => setFiltros((f) => ({ ...FILTROS_PADRAO, busca: f.busca }));

  const sharedProps = { filtros, setFiltros, coresDisponiveis, carroceriasDisponiveis, totalResultados, temFiltroAtivo, handleLimpar };

  return (
    <>
      {/* ── Mobile: botão full-width + drawer acima dos cards ── */}
      <div className="lg:hidden w-full">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setMobileAberto((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 rounded-2xl border bg-white shadow-sm transition"
          style={{ color: "#000000", borderColor: mobileAberto ? "#2563eb" : "#e5e7eb" }}
        >
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold">Filtros</span>
            {activeCount > 0 && (
              <span
                className="text-xs font-bold rounded-full px-2 py-0.5 leading-none"
                style={{ backgroundColor: "#2563eb", color: "#ffffff" }}
              >
                {activeCount} ativo{activeCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {temFiltroAtivo && (
              <button
                onClick={(e) => { e.stopPropagation(); handleLimpar(); }}
                className="text-xs text-blue-600 hover:underline font-medium"
              >
                Limpar
              </button>
            )}
            <ChevronDown
              className="w-4 h-4 transition-transform duration-200"
              style={{ transform: mobileAberto ? "rotate(180deg)" : "rotate(0deg)" }}
            />
          </div>
        </motion.button>

        <AnimatePresence>
          {mobileAberto && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden mt-2"
            >
              <SidebarContent {...sharedProps} isMobile />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Desktop: sidebar lateral esquerda ── */}
      <aside className="hidden lg:block w-64 flex-shrink-0">
        <div className="sticky top-28">
          <SidebarContent {...sharedProps} />
        </div>
      </aside>
    </>
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

const MOTO_CATEGORIAS = ["MOTO", "MOTOCICLETA", "SCOOTER", "TRICICLO", "QUADRICICLO"];

function isMoto(v: Veiculo) {
  return MOTO_CATEGORIAS.some((t) => (v.categoria ?? "").toUpperCase().includes(t));
}

export default function ExternoPage() {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const [filtros, setFiltros] = useState<Filtros>(FILTROS_PADRAO);
  const [paginaAtual, setPaginaAtual] = useState(1);

  useEffect(() => {
    fetchPublic<unknown[]>("/veiculos")
      .then((data) => setVeiculos((data ?? []).map(mapVeiculo)))
      .catch((err: unknown) => {
        const httpStatus = (err as { response?: { status?: number } })?.response?.status;
        if (httpStatus === 401 || httpStatus === 403) {
          setErro("O catálogo público ainda não está habilitado no servidor. Reinicie o backend para ativar a nova configuração.");
        } else {
          setErro("Não foi possível carregar o catálogo. Verifique sua conexão e tente novamente.");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const coresDisponiveis = Array.from(
    new Set(veiculos.map((v) => v.cor).filter(Boolean) as string[])
  ).sort();

  const carroceriasDisponiveis = Array.from(
    new Set(veiculos.map((v) => v.categoria).filter(Boolean) as string[])
  ).sort();

  const veiculosFiltrados = veiculos.filter((v) => {
    const q = filtros.busca.toLowerCase();
    const moto = isMoto(v);

    return (
      (filtros.tipoVeiculo === "" || (filtros.tipoVeiculo === "MOTO" ? moto : !moto)) &&
      (q === "" ||
        v.modelo.toLowerCase().includes(q) ||
        v.marca.toLowerCase().includes(q) ||
        (v.cor ?? "").toLowerCase().includes(q)) &&
      (filtros.marca === "" || v.marca.toLowerCase().includes(filtros.marca.toLowerCase())) &&
      (filtros.modelo === "" || v.modelo.toLowerCase().includes(filtros.modelo.toLowerCase())) &&
      (filtros.precoMax >= 500000 || v.valor <= filtros.precoMax) &&
      (filtros.anoMin <= 2000 || v.anoFabricacao >= filtros.anoMin) &&
      (filtros.kmMax >= 300000 || v.quilometragem <= filtros.kmMax) &&
      (filtros.cambio === "" || v.cambio === filtros.cambio) &&
      (filtros.combustivel === "" || v.combustivel === filtros.combustivel) &&
      (filtros.cor === "" || (v.cor ?? "").toLowerCase() === filtros.cor.toLowerCase()) &&
      (filtros.carroceria === "" ||
        (v.categoria ?? "").toLowerCase() === filtros.carroceria.toLowerCase())
    );
  });

  const totalPaginas = Math.ceil(veiculosFiltrados.length / ITENS_POR_PAGINA);
  const veiculosPaginados = veiculosFiltrados.slice(
    (paginaAtual - 1) * ITENS_POR_PAGINA,
    paginaAtual * ITENS_POR_PAGINA
  );

  const handleBusca = useCallback((v: string) => {
    setFiltros((f) => ({ ...f, busca: v }));
    setPaginaAtual(1);
  }, []);

  const handleFiltros = useCallback((fn: React.SetStateAction<Filtros>) => {
    setFiltros(fn);
    setPaginaAtual(1);
  }, []);

  const temFiltroAtivo =
    filtros.busca !== "" ||
    filtros.tipoVeiculo !== "" ||
    filtros.marca !== "" ||
    filtros.modelo !== "" ||
    filtros.precoMax < 500000 ||
    filtros.anoMin > 2000 ||
    filtros.kmMax < 300000 ||
    filtros.cambio !== "" ||
    filtros.combustivel !== "" ||
    filtros.cor !== "" ||
    filtros.carroceria !== "";

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
      <Navbar />
      <Hero busca={filtros.busca} setBusca={handleBusca} />

      <main id="catalogo" className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {erro && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm flex items-center gap-2"
          >
            <X className="w-4 h-4 flex-shrink-0" />
            {erro}
          </motion.div>
        )}

        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-start">
          {/* Sidebar de filtros */}
          <FilterSidebar
            filtros={filtros}
            setFiltros={handleFiltros}
            coresDisponiveis={coresDisponiveis}
            carroceriasDisponiveis={carroceriasDisponiveis}
            totalResultados={veiculosFiltrados.length}
          />

          {/* Grid de cards */}
          <div className="flex-1 min-w-0">
            <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-5">
              {loading
                ? [...Array(8)].map((_, i) => <VeiculoSkeleton key={i} />)
                : veiculosPaginados.length === 0
                ? <EmptyState temFiltro={temFiltroAtivo} />
                : veiculosPaginados.map((v, i) => (
                    <VeiculoCardPublico key={v.id} veiculo={v} index={i} />
                  ))}
            </div>

            <Pagination
              paginaAtual={paginaAtual}
              totalPaginas={totalPaginas}
              onChange={setPaginaAtual}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}