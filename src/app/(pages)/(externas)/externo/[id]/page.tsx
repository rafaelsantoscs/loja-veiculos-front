"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  X,
  Zap,
  CheckCircle2,
  Share2,
  Heart,
  Palette,
  DoorOpen
} from "lucide-react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
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

// ─── HELPERS ──────────────────────────────────────────────────────────────────

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

// ─── COMPONENTES MENORES ──────────────────────────────────────────────────────

function SpecCard({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value?: string | number | null }) {
  if (!value) return null;
  return (
    <div className="flex flex-col bg-gray-50 p-4 rounded-xl border border-gray-100/50 hover:bg-gray-100/80 transition-colors">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4 text-black" />
        <span className="text-[11px] font-bold text-black uppercase tracking-wider">{label}</span>
      </div>
      <span className="text-sm font-semibold text-black truncate">{value}</span>
    </div>
  );
}

// ─── GALERIA PREMIUM ─────────────────────────────────────────────────────────

function Galeria({ fotos, titulo }: { fotos: FotoVeiculo[]; titulo: string }) {
  const [idx, setIdx] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const ir = useCallback((dir: number) => {
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
      <div className="aspect-[16/9] lg:aspect-[21/9] rounded-2xl bg-gray-50 flex flex-col items-center justify-center gap-3 border border-gray-200">
        <Car className="h-16 w-16 text-gray-300" />
        <p className="text-sm text-black font-medium">Imagens indisponíveis</p>
      </div>
    );
  }

  const fotoAtual = fotos[idx];

  return (
    <>
      <div className="space-y-4">
        {/* Foto Principal */}
        <div
          className="relative aspect-[16/9] lg:aspect-[21/9] rounded-2xl overflow-hidden bg-gray-100 cursor-zoom-in group shadow-sm border border-gray-100"
          onClick={() => setLightbox(true)}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={fotoAtual.url}
              src={fotoAtual.url}
              alt={titulo}
              className="h-full w-full object-cover"
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          </AnimatePresence>

          {/* Gradientes e Controles */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {fotos.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); ir(-1); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md transition-all z-10 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); ir(1); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md transition-all z-10 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          {/* Badges Flutuantes */}
          <div className="absolute bottom-4 left-4 flex items-center gap-2 z-10">
            <span className="flex items-center gap-1.5 rounded-lg bg-black/40 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md border border-white/10">
              <Camera className="h-3.5 w-3.5" />
              {idx + 1} / {fotos.length}
            </span>
          </div>
        </div>

        {/* Thumbnails */}
        {fotos.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-2 pt-1 scrollbar-hide snap-x">
            {fotos.map((f, i) => (
              <button
                key={f.id || i}
                onClick={() => setIdx(i)}
                className={`relative flex-shrink-0 w-24 h-16 sm:w-32 sm:h-20 rounded-xl overflow-hidden snap-start transition-all duration-300 ${
                  i === idx ? "ring-2 ring-blue-600 ring-offset-2 opacity-100" : "opacity-60 hover:opacity-100"
                }`}
              >
                <img src={f.url} alt={`Foto ${i + 1}`} className="h-full w-full object-cover" />
                {f.principal && (
                  <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-blue-500 border border-white" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Premium */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/98 backdrop-blur-xl flex items-center justify-center"
            onClick={() => setLightbox(false)}
          >
            <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-black/80 to-transparent pointer-events-none" />
            
            <button
              onClick={() => setLightbox(false)}
              className="absolute top-6 right-6 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors backdrop-blur-md"
            >
              <X className="h-6 w-6" />
            </button>

            <span className="absolute top-8 left-1/2 -translate-x-1/2 text-white font-medium tracking-widest text-sm z-20">
              {idx + 1} / {fotos.length}
            </span>

            {fotos.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); ir(-1); }}
                  className="absolute left-6 top-1/2 -translate-y-1/2 flex h-14 w-14 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white backdrop-blur-md transition-all z-20"
                >
                  <ChevronLeft className="h-8 w-8" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); ir(1); }}
                  className="absolute right-6 top-1/2 -translate-y-1/2 flex h-14 w-14 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white backdrop-blur-md transition-all z-20"
                >
                  <ChevronRight className="h-8 w-8" />
                </button>
              </>
            )}

            <AnimatePresence mode="wait">
              <motion.img
                key={fotoAtual.url}
                src={fotoAtual.url}
                alt={titulo}
                className="max-h-[90vh] max-w-[90vw] object-contain select-none"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => e.stopPropagation()}
              />
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── NAVBAR ──────────────────────────────────────────────────────────────────

function Navbar() {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <button
            onClick={() => router.push("/externo")}
            className="flex items-center gap-2 text-black hover:text-black transition-colors group font-medium text-sm"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="hidden sm:inline">Voltar ao catálogo</span>
          </button>

          <a href="/externo" className="flex items-center gap-2">
            <img
              src="/logo-232motors.png"
              alt="232 Motors"
              className="w-11 h-11 object-contain mix-blend-multiply"
            />
            <span className="text-xl font-extrabold text-black tracking-tight hidden sm:block">
              232<span className="text-blue-600">MOTORS</span>
            </span>
          </a>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/login")}
            className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all"
          >
            <LogIn className="w-4 h-4" />
            <span className="hidden sm:inline">Entrar</span>
          </motion.button>
        </div>
      </div>
    </header>
  );
}

// ─── SKELETON ──────────────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-4">
            <div className="aspect-[21/9] bg-gray-200 rounded-2xl" />
            <div className="flex gap-3"><div className="w-32 h-20 bg-gray-200 rounded-xl" /><div className="w-32 h-20 bg-gray-200 rounded-xl" /></div>
          </div>
          <div className="lg:col-span-4 space-y-6">
            <div className="h-40 bg-gray-200 rounded-2xl" />
            <div className="h-60 bg-gray-200 rounded-2xl" />
          </div>
        </div>
      </main>
    </div>
  );
}

// ─── PÁGINA PRINCIPAL ────────────────────────────────────────────────────────

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

  if (loading) {
    return <PageSkeleton />;
  }

  if (erro || !veiculo) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-5 py-20 text-center px-4">
          <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
            <ImageOff className="w-10 h-10 text-black" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-black mb-2">{erro || "Veículo não encontrado"}</h2>
            <p className="text-black max-w-sm mx-auto">O veículo solicitado pode ter sido removido ou está indisponível.</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/externo")}
            className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-semibold mt-4 hover:bg-black transition"
          >
            <ArrowLeft className="w-5 h-5" />
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

  const opcionaisAtivos = opcionais.filter((o) => (veiculo as unknown as Record<string, unknown>)[o.key]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans text-black">
      <Navbar />

      {/* ── Banner Hero com capa da loja — limpo, sem texto ── */}
      <div className="relative h-56 sm:h-72 overflow-hidden">
        <img
          src="/loja-capa.png"
          alt="Fachada 232 Motors"
          className="absolute inset-0 w-full h-full object-cover object-[75%_12%]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30" />
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8">

        {/* Breadcrumb + título + ações — abaixo da capa, no fundo claro */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
          <div>
            <nav className="flex items-center gap-2 text-sm text-black font-medium mb-2">
              <a href="/externo" className="hover:text-black transition-colors">Catálogo</a>
              <span>/</span>
              <span className="hover:text-black transition-colors">{veiculo.marca}</span>
              <span>/</span>
              <span className="text-black truncate">{veiculo.modelo}</span>
            </nav>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-black tracking-tight">
                {titulo}
              </h1>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${badge.cls}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                {badge.label}
              </span>
              {veiculo.destaque && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 border border-amber-200">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  Destaque
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-black hover:bg-gray-50 transition-colors shadow-sm">
              <Share2 className="w-4 h-4" /> Compartilhar
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-black hover:bg-gray-50 transition-colors shadow-sm">
              <Heart className="w-4 h-4" /> Salvar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          
          {/* ── COLUNA ESQUERDA: FOTOS E INFORMAÇÕES ────────── */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* Galeria */}
            <section>
              <Galeria fotos={fotos} titulo={titulo} />
            </section>

            {/* Resumo Rápido (Features Principais) */}
            <div className="flex flex-wrap gap-4 py-6 border-y border-gray-200/60">
               {[
                 { icon: Calendar, label: "Ano", val: `${veiculo.anoFabricacao}/${veiculo.anoModelo}` },
                 { icon: Gauge, label: "Quilometragem", val: veiculo.quilometragem > 0 ? formatKm(veiculo.quilometragem) : null },
                 { icon: Settings2, label: "Câmbio", val: veiculo.cambio ? cambioLabel(veiculo.cambio as string) : null },
                 { icon: Fuel, label: "Combustível", val: veiculo.combustivel ? combustivelLabel(veiculo.combustivel as string) : null },
               ].map((item, i) => item.val && (
                 <div key={i} className="flex items-center gap-3 pr-6 border-r border-gray-200/60 last:border-0 last:pr-0">
                    <div className="p-2.5 bg-white rounded-xl shadow-sm border border-gray-100 text-black">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-black uppercase tracking-wider">{item.label}</p>
                      <p className="text-sm font-bold text-black">{item.val}</p>
                    </div>
                 </div>
               ))}
            </div>

            {/* Descrição do Veículo */}
            {veiculo.descricao && (
              <section className="space-y-4">
                <h3 className="text-xl font-bold text-black flex items-center gap-2">
                  Sobre o Veículo
                </h3>
                <div className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-100 shadow-sm">
                  <p className="text-base text-black leading-relaxed whitespace-pre-line">
                    {veiculo.descricao}
                  </p>
                </div>
              </section>
            )}

            {/* Especificações Técnicas (Grid Moderno) */}
            <section className="space-y-4">
              <h3 className="text-xl font-bold text-black">Especificações</h3>
              <div className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-100 shadow-sm grid grid-cols-2 md:grid-cols-3 gap-4">
                <SpecCard icon={Tag} label="Marca" value={veiculo.marca} />
                <SpecCard icon={Car} label="Modelo" value={veiculo.modelo} />
                <SpecCard icon={Info} label="Versão" value={veiculo.versao} />
                <SpecCard icon={Palette} label="Cor" value={veiculo.cor} />
                <SpecCard icon={Zap} label="Motor" value={veiculo.motor} />
                <SpecCard icon={Settings2} label="Potência" value={veiculo.potencia} />
                <SpecCard icon={DoorOpen} label="Portas" value={veiculo.portas} />
                <SpecCard icon={MapPin} label="Localização" value={[veiculo.cidade, veiculo.estado].filter(Boolean).join(" - ")} />
              </div>
            </section>

            {/* Opcionais e Destaques */}
            {opcionaisAtivos.length > 0 && (
              <section className="space-y-4">
                <h3 className="text-xl font-bold text-black">Destaques e Opcionais</h3>
                <div className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-100 shadow-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-6">
                    {opcionaisAtivos.map((o) => (
                      <div key={o.key} className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        <span className="text-sm font-medium text-black">{o.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* ── COLUNA DIREITA: PREÇO E AÇÕES (Sticky) ────────── */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 space-y-6">
              
              {/* Card Principal de Preço */}
              <div className="bg-white rounded-3xl p-6 lg:p-8 border border-gray-200 shadow-xl shadow-gray-200/40">

                {veiculo.versao && (
                  <div className="mb-4">
                    <p className="text-sm text-black font-medium">{veiculo.versao}</p>
                  </div>
                )}

                <div className="bg-gray-50 rounded-2xl p-5 mb-6 border border-gray-100">
                  {veiculo.valor > 0 ? (
                    <>
                      <p className="text-sm font-bold text-black uppercase tracking-wider mb-1">Preço à vista</p>
                      <p className="text-4xl font-black text-blue-600 tracking-tight">{formatBRL(veiculo.valor)}</p>
                      {veiculo.valorFipe && (
                        <p className="text-xs text-black mt-2 flex items-center gap-1 font-medium">
                          <Info className="w-3.5 h-3.5" /> Ref. FIPE: {formatBRL(veiculo.valorFipe)}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-xl font-bold text-black">Consulte o valor</p>
                  )}
                </div>

                <div className="space-y-3">
                  {isDisponivel ? (
                    <>
                      <motion.a
                        href="#contato-footer"
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-blue-600/20 transition-all text-base"
                      >
                        <Phone className="w-5 h-5" />
                        Tenho Interesse
                      </motion.a>
                      <motion.button
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => router.push("/login")}
                        className="w-full flex items-center justify-center gap-2 bg-white border-2 border-gray-200 hover:border-gray-900 hover:bg-gray-900 hover:text-white text-black font-bold py-3.5 px-6 rounded-xl transition-all text-sm"
                      >
                        <LogIn className="w-4 h-4" />
                        Entrar para negociar
                      </motion.button>
                    </>
                  ) : (
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-center">
                      <p className="text-sm font-bold text-black mb-1">Veículo Indisponível</p>
                      <p className="text-xs text-black">Status atual: {STATUS_LABELS[veiculo.status]}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Card de Contato Footer */}
              <div id="contato-footer" className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-lg">
                <h4 className="font-bold mb-4 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-blue-400" />
                  Fale Conosco
                </h4>
                <ul className="space-y-3 text-sm text-slate-300 font-medium">
                  <li className="flex items-center gap-3">
                    <div className="bg-white/10 p-2 rounded-lg"><Phone className="w-4 h-4 text-white" /></div>
                    (XX) XXXXX-XXXX
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="bg-white/10 p-2 rounded-lg"><MapPin className="w-4 h-4 text-white" /></div>
                    Sua cidade, Brasil
                  </li>
                </ul>
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* Footer Minimalista */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo-232motors.png" alt="232 Motors" className="w-10 h-10 object-contain mix-blend-multiply" />
            <span className="text-xl font-extrabold text-black tracking-tight">
              232<span className="text-blue-600">MOTORS</span>
            </span>
          </div>
          <p className="text-sm text-black font-medium">
            © {new Date().getFullYear()} 232 Motors. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}