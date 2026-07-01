"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  Camera,
  Car,
  ChevronLeft,
  ChevronRight,
  Fuel,
  Gauge,
  ImageOff,
  Info,
  LogIn,
  MapPin,
  Phone,
  Settings2,
  Shield,
  Star,
  Tag,
  Users,
  X,
  Zap,
} from "lucide-react";
import axios from "axios";
import { BASE_URL } from "@/config/config";
import type { FotoVeiculo, Veiculo } from "@/types/veiculo";
import {
  cambioLabel,
  combustivelLabel,
  formatBRL,
  formatKm,
  mapVeiculo,
  STATUS_LABELS,
} from "@/app/(pages)/(internas)/veiculo-admin/_components/veiculo.utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function fetchPublic<T>(url: string): Promise<T> {
  const { data } = await axios.get<T>(`${BASE_URL}${url}`);
  return data;
}

const STATUS_BADGE: Record<string, { label: string; cls: string; dot: string }> = {
  DISPONIVEL: { label: "Disponível", cls: "bg-green-100 text-green-800 border-green-200", dot: "bg-green-500" },
  RESERVADO: { label: "Reservado", cls: "bg-amber-100 text-amber-800 border-amber-200", dot: "bg-amber-500" },
  EM_NEGOCIACAO: { label: "Em negociação", cls: "bg-blue-100 text-blue-800 border-blue-200", dot: "bg-blue-500" },
  EM_PREPARACAO: { label: "Em preparação", cls: "bg-purple-100 text-purple-800 border-purple-200", dot: "bg-purple-500" },
  VENDIDO: { label: "Vendido", cls: "bg-red-100 text-red-800 border-red-200", dot: "bg-red-500" },
  INATIVO: { label: "Inativo", cls: "bg-gray-100 text-gray-600 border-gray-200", dot: "bg-gray-400" },
};

function InfoRow({ label, value }: { label: string; value?: string | number | boolean | null }) {
  if (value === undefined || value === null || value === "" || value === 0) return null;
  const display = typeof value === "boolean" ? (value ? "Sim" : "Não") : String(value);
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500 min-w-[140px]">{label}</span>
      <span className="text-sm font-semibold text-gray-800 text-right">{display}</span>
    </div>
  );
}

function SectionCard({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="rounded-lg p-1.5 bg-orange-500/15 text-orange-600">
          <Icon className="h-4 w-4" />
        </div>
        <h3 className="font-bold text-gray-900 text-sm">{title}</h3>
      </div>
      {children}
    </div>
  );
}

// ─── Galeria de Fotos ──────────────────────────────────────────────────────────

function Galeria({ fotos, titulo }: { fotos: FotoVeiculo[]; titulo: string }) {
  const [idx, setIdx] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const ir = useCallback((dir: 1 | -1) => {
    setIdx((p) => (p + dir + fotos.length) % fotos.length);
  }, [fotos.length]);

  useEffect(() => {
    if (!lightbox) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") ir(1);
      if (e.key === "ArrowLeft") ir(-1);
      if (e.key === "Escape") setLightbox(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightbox, ir]);

  if (fotos.length === 0) {
    return (
      <div className="aspect-[16/9] rounded-2xl bg-slate-900 flex flex-col items-center justify-center gap-3">
        <Car className="h-16 w-16 text-slate-600" />
        <p className="text-sm text-slate-500">Sem fotos disponíveis</p>
      </div>
    );
  }

  const fotoAtual = fotos[idx];

  return (
    <>
      <div className="space-y-3">
        {/* Foto principal */}
        <div
          className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-slate-900 cursor-zoom-in group"
          onClick={() => setLightbox(true)}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={fotoAtual.url}
              src={fotoAtual.url}
              alt={titulo}
              className="h-full w-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
          </AnimatePresence>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />

          {fotos.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); ir(-1); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 backdrop-blur-sm transition-all hover:bg-black/70"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); ir(1); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 backdrop-blur-sm transition-all hover:bg-black/70"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Contador e hint */}
          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
              <Camera className="h-3.5 w-3.5" />
              {idx + 1} / {fotos.length}
            </span>
          </div>
          <span className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs text-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
            <Zap className="h-3 w-3" /> Clique para ampliar
          </span>
        </div>

        {/* Thumbnails */}
        {fotos.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {fotos.map((f, i) => (
              <button
                key={f.id}
                onClick={() => setIdx(i)}
                className={`relative flex-shrink-0 w-20 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                  i === idx ? "border-orange-500 shadow-md shadow-orange-200" : "border-transparent hover:border-orange-300"
                }`}
              >
                <img src={f.url} alt={`Foto ${i + 1}`} className="h-full w-full object-cover" />
                {f.principal && (
                  <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-orange-500 border border-white" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
            onClick={() => setLightbox(false)}
          >
            <button
              onClick={() => setLightbox(false)}
              className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition"
            >
              <X className="h-5 w-5" />
            </button>

            <span className="absolute top-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
              {idx + 1} / {fotos.length}
            </span>

            {fotos.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); ir(-1); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); ir(1); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            <AnimatePresence mode="wait">
              <motion.img
                key={fotoAtual.url}
                src={fotoAtual.url}
                alt={titulo}
                className="max-h-[85vh] max-w-[90vw] object-contain rounded-xl select-none"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => e.stopPropagation()}
              />
            </AnimatePresence>

            {/* Thumbnails no lightbox */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 max-w-[90vw] overflow-x-auto px-2 pb-1">
              {fotos.map((f, i) => (
                <button
                  key={f.id}
                  onClick={(e) => { e.stopPropagation(); setIdx(i); }}
                  className={`flex-shrink-0 w-12 h-8 rounded-lg overflow-hidden border-2 transition-all ${
                    i === idx ? "border-orange-500" : "border-white/20 hover:border-white/50"
                  }`}
                >
                  <img src={f.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Navbar simples ────────────────────────────────────────────────────────────

function Navbar() {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button
            onClick={() => router.push("/externo")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Voltar ao catálogo</span>
          </button>

          <a href="/externo" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 shadow-md">
              <Car className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold text-gray-900 hidden sm:block">AutoStore</span>
          </a>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/login")}
            className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow transition-all"
          >
            <LogIn className="w-4 h-4" />
            <span className="hidden sm:inline">Entrar</span>
          </motion.button>
        </div>
      </div>
    </header>
  );
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="aspect-[16/9] bg-gray-200 rounded-2xl animate-pulse" />
            <div className="flex gap-2">
              {[...Array(4)].map((_, i) => <div key={i} className="w-20 h-14 bg-gray-200 rounded-xl animate-pulse" />)}
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded-full animate-pulse w-3/4" />
            <div className="h-4 bg-gray-100 rounded-full animate-pulse w-1/2" />
            <div className="h-32 bg-gray-200 rounded-2xl animate-pulse" />
            <div className="h-32 bg-gray-200 rounded-2xl animate-pulse" />
          </div>
        </div>
      </main>
    </div>
  );
}

// ─── Página de Detalhe ─────────────────────────────────────────────────────────

export default function VeiculoDetalhePublico() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [veiculo, setVeiculo] = useState<Veiculo | null>(null);
  const [fotos, setFotos] = useState<FotoVeiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!id) return;

    Promise.all([
      fetchPublic<unknown>(`/veiculos/${id}`),
      fetchPublic<FotoVeiculo[]>(`/veiculos/${id}/fotos`).catch(() => [] as FotoVeiculo[]),
    ])
      .then(([veiculoRaw, fotosData]) => {
        setVeiculo(mapVeiculo(veiculoRaw));
        const ordenadas = [...(fotosData ?? [])].sort((a, b) => {
          if (a.principal && !b.principal) return -1;
          if (!a.principal && b.principal) return 1;
          return (a.ordem ?? 0) - (b.ordem ?? 0);
        });
        setFotos(ordenadas);
      })
      .catch(() => setErro("Veículo não encontrado ou indisponível."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageSkeleton />;

  if (erro || !veiculo) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20 text-center px-4">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
            <ImageOff className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">{erro || "Veículo não encontrado"}</h2>
          <p className="text-sm text-gray-500 max-w-xs">O veículo solicitado pode ter sido removido ou está indisponível.</p>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/externo")}
            className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao catálogo
          </motion.button>
        </div>
      </div>
    );
  }

  const badge = STATUS_BADGE[veiculo.status] ?? STATUS_BADGE["INATIVO"];
  const titulo = `${veiculo.marca} ${veiculo.modelo}`;
  const isDisponivel = veiculo.status === "DISPONIVEL" || veiculo.status === "RESERVADO";

  const opcionais = [
    { key: "aceitaTroca", label: "Aceita troca" },
    { key: "blindado", label: "Blindado" },
    { key: "unicoDono", label: "Único dono" },
    { key: "ipvaPago", label: "IPVA pago" },
    { key: "licenciado", label: "Licenciado" },
    { key: "garantia", label: "Garantia" },
    { key: "revisado", label: "Revisado" },
  ] as const;

  const opcionaisAtivos = opcionais.filter((o) => (veiculo as Record<string, unknown>)[o.key]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <a href="/externo" className="hover:text-orange-600 transition-colors">Catálogo</a>
          <span>/</span>
          <span className="text-gray-800 font-medium truncate">{titulo}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Coluna esquerda: Galeria + Detalhes técnicos ────────── */}
          <div className="lg:col-span-2 space-y-6">
            <Galeria fotos={fotos} titulo={titulo} />

            {/* Descrição */}
            {veiculo.descricao && (
              <SectionCard icon={Info} title="Descrição">
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{veiculo.descricao}</p>
              </SectionCard>
            )}

            {/* Ficha técnica */}
            <SectionCard icon={Tag} title="Ficha Técnica">
              <InfoRow label="Marca" value={veiculo.marca} />
              <InfoRow label="Modelo" value={veiculo.modelo} />
              {veiculo.versao && <InfoRow label="Versão" value={veiculo.versao} />}
              <InfoRow label="Ano Fabricação" value={veiculo.anoFabricacao} />
              <InfoRow label="Ano Modelo" value={veiculo.anoModelo} />
              <InfoRow label="Cor" value={veiculo.cor} />
              {veiculo.categoria && <InfoRow label="Categoria" value={veiculo.categoria} />}
              {veiculo.portas && <InfoRow label="Portas" value={veiculo.portas} />}
            </SectionCard>

            {/* Motor e desempenho */}
            {(veiculo.combustivel || veiculo.cambio || veiculo.motor || veiculo.potencia) && (
              <SectionCard icon={Fuel} title="Motor e Desempenho">
                {veiculo.combustivel && <InfoRow label="Combustível" value={combustivelLabel(veiculo.combustivel as string)} />}
                {veiculo.cambio && <InfoRow label="Câmbio" value={cambioLabel(veiculo.cambio as string)} />}
                {veiculo.motor && <InfoRow label="Motor" value={veiculo.motor} />}
                {veiculo.potencia && <InfoRow label="Potência" value={veiculo.potencia} />}
                {veiculo.quilometragem > 0 && <InfoRow label="Quilometragem" value={formatKm(veiculo.quilometragem)} />}
              </SectionCard>
            )}

            {/* Opcionais */}
            {opcionaisAtivos.length > 0 && (
              <SectionCard icon={Shield} title="Opcionais e Diferenciais">
                <div className="flex flex-wrap gap-2">
                  {opcionaisAtivos.map((o) => (
                    <span key={o.key} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-50 border border-green-200 text-sm font-medium text-green-800">
                      <Zap className="w-3.5 h-3.5 text-green-600" />
                      {o.label}
                    </span>
                  ))}
                </div>
              </SectionCard>
            )}
          </div>

          {/* ── Coluna direita: Preço + Contato ─────────────────────── */}
          <div className="space-y-4">
            {/* Card principal */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sticky top-24">
              {/* Status + Destaque */}
              <div className="flex items-center gap-2 mb-3">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.cls}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                  {badge.label}
                </span>
                {veiculo.destaque && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                    <Star className="w-3 h-3 fill-current" />
                    Destaque
                  </span>
                )}
              </div>

              {/* Título */}
              <h1 className="text-2xl font-extrabold text-gray-900 leading-tight">{titulo}</h1>
              {veiculo.versao && (
                <p className="text-sm text-gray-500 mt-0.5">{veiculo.versao}</p>
              )}

              {/* Ano/Km */}
              <div className="flex flex-wrap gap-3 mt-3">
                <span className="flex items-center gap-1.5 text-sm text-gray-600">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {veiculo.anoFabricacao}/{veiculo.anoModelo}
                </span>
                {veiculo.quilometragem > 0 && (
                  <span className="flex items-center gap-1.5 text-sm text-gray-600">
                    <Gauge className="w-4 h-4 text-gray-400" />
                    {formatKm(veiculo.quilometragem)}
                  </span>
                )}
                {veiculo.combustivel && (
                  <span className="flex items-center gap-1.5 text-sm text-gray-600">
                    <Fuel className="w-4 h-4 text-gray-400" />
                    {combustivelLabel(veiculo.combustivel as string)}
                  </span>
                )}
                {veiculo.cambio && (
                  <span className="flex items-center gap-1.5 text-sm text-gray-600">
                    <Settings2 className="w-4 h-4 text-gray-400" />
                    {cambioLabel(veiculo.cambio as string)}
                  </span>
                )}
                {(veiculo.cidade || veiculo.estado) && (
                  <span className="flex items-center gap-1.5 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {[veiculo.cidade, veiculo.estado].filter(Boolean).join(" - ")}
                  </span>
                )}
              </div>

              {/* Preço */}
              <div className="mt-5 pt-4 border-t border-gray-100">
                {veiculo.valor > 0 ? (
                  <>
                    <p className="text-3xl font-extrabold text-orange-600">{formatBRL(veiculo.valor)}</p>
                    {veiculo.valorFipe && (
                      <p className="text-xs text-gray-400 mt-0.5">Tabela FIPE: {formatBRL(veiculo.valorFipe)}</p>
                    )}
                  </>
                ) : (
                  <p className="text-lg font-semibold text-gray-500">Consulte o valor</p>
                )}
              </div>

              {/* Botões de ação */}
              <div className="mt-4 space-y-3">
                {isDisponivel ? (
                  <>
                    <motion.a
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      href="#contato-footer"
                      className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-md hover:shadow-orange-200 transition-all"
                    >
                      <Phone className="w-4 h-4" />
                      Tenho Interesse
                    </motion.a>
                    <motion.button
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => router.push("/login")}
                      className="flex items-center justify-center gap-2 w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all text-sm"
                    >
                      <LogIn className="w-4 h-4" />
                      Entrar para negociar
                    </motion.button>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-xl border border-gray-200 text-center">
                    <p className="text-sm font-semibold text-gray-700">Este veículo não está disponível</p>
                    <p className="text-xs text-gray-500">Status: {STATUS_LABELS[veiculo.status] ?? veiculo.status}</p>
                    <motion.button
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => router.push("/externo")}
                      className="mt-1 text-sm font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Ver outros veículos
                    </motion.button>
                  </div>
                )}
              </div>

              {/* Fotos info */}
              {fotos.length > 0 && (
                <p className="mt-3 flex items-center gap-1.5 text-xs text-gray-400 justify-center">
                  <Camera className="w-3.5 h-3.5" />
                  {fotos.length} foto{fotos.length !== 1 ? "s" : ""} disponíve{fotos.length !== 1 ? "is" : "l"}
                </p>
              )}
            </div>

            {/* Contato */}
            <div id="contato-footer" className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl border border-orange-200 p-5">
              <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
                <Phone className="w-4 h-4 text-orange-600" />
                Entre em Contato
              </h3>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-orange-500 flex-shrink-0" />
                  <span>(XX) XXXXX-XXXX</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-orange-500 flex-shrink-0" />
                  <span>Sua cidade, Brasil</span>
                </div>
              </div>
            </div>

            {/* Cor */}
            {veiculo.cor && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl border border-gray-200 shadow-inner flex-shrink-0"
                  style={{ backgroundColor: veiculo.cor.toLowerCase() }}
                />
                <div>
                  <p className="text-xs text-gray-500">Cor</p>
                  <p className="text-sm font-semibold text-gray-800 capitalize">{veiculo.cor}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Fotos count - mobile footer */}
        {fotos.length > 0 && (
          <div className="lg:hidden mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
            <Camera className="w-4 h-4" />
            <span>{fotos.length} fotos disponíveis — role para ver a galeria</span>
          </div>
        )}
      </main>

      {/* Mini footer */}
      <footer className="bg-gray-900 text-gray-400 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <span>© {new Date().getFullYear()} AutoStore. Todos os direitos reservados.</span>
          <a href="/externo" className="hover:text-orange-400 transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3 h-3" /> Voltar ao catálogo
          </a>
        </div>
      </footer>
    </div>
  );
}
