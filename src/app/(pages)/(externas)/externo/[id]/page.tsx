"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Camera,
  Car,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Heart,
  ImageOff,
  LogIn,
  MapPin,
  Maximize2,
  MessageSquare,
  Send,
  Share2,
  Star,
  X,
} from "lucide-react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { BASE_URL, LOJA_WHATSAPP } from "@/config/config";
import type { FotoVeiculo, Veiculo } from "@/types/veiculo";
import {
  cambioLabel,
  combustivelLabel,
  formatBRL,
  formatKm,
  mapVeiculo,
  opcionalLabel,
  STATUS_LABELS,
} from "@/app/(pages)/(internas)/veiculo-admin/_components/veiculo.utils";
import { criarLead, registrarVisualizacao } from "@/services/crmService";
import type { OrigemLead } from "@/types/crm";

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

// ─── GALERIA STRIP (3 fotos simultâneas) ──────────────────────────────────────

function GaleriaStrip({ fotos, titulo }: { fotos: FotoVeiculo[]; titulo: string }) {
  const [idx, setIdx] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const ir = useCallback(
    (dir: number) => setIdx((p) => (p + dir + fotos.length) % fotos.length),
    [fotos.length]
  );

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
      <div className="w-full h-[55vh] sm:h-[65vh] bg-gray-900 flex flex-col items-center justify-center gap-4">
        <Car className="h-20 w-20 text-gray-600" />
        <p className="text-sm text-gray-400 font-medium">Imagens indisponíveis</p>
      </div>
    );
  }

  const curr = fotos[idx];
  const prev = fotos[(idx - 1 + fotos.length) % fotos.length];
  const next = fotos[(idx + 1) % fotos.length];
  const showStrip = fotos.length >= 3;

  return (
    <>
      <div className="relative w-full h-[55vh] sm:h-[65vh] overflow-hidden bg-gray-900 select-none">

        {showStrip ? (
          /* ── TIRA DE 3 FOTOS ── */
          <div className="flex h-full">
            {/* Foto anterior */}
            <button
              className="relative flex-1 overflow-hidden cursor-pointer group"
              onClick={() => ir(-1)}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={`prev-${prev.url}`}
                  src={prev.url}
                  alt="anterior"
                  className="h-full w-full object-cover scale-105"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </AnimatePresence>
              <div className="absolute inset-0 bg-black/50 group-hover:bg-black/35 transition-colors" />
              <div className="absolute inset-y-0 right-0 w-px bg-white/10" />
            </button>

            {/* Foto atual (centro — maior) */}
            <button
              className="relative flex-[1.5] overflow-hidden cursor-zoom-in"
              onClick={() => setLightbox(true)}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={curr.url}
                  src={curr.url}
                  alt={titulo}
                  className="h-full w-full object-cover"
                  initial={{ opacity: 0, scale: 1.03 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/40 pointer-events-none" />
              <div className="absolute inset-y-0 left-0 w-px bg-white/10" />
              <div className="absolute inset-y-0 right-0 w-px bg-white/10" />
            </button>

            {/* Próxima foto */}
            <button
              className="relative flex-1 overflow-hidden cursor-pointer group"
              onClick={() => ir(1)}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={`next-${next.url}`}
                  src={next.url}
                  alt="próxima"
                  className="h-full w-full object-cover scale-105"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </AnimatePresence>
              <div className="absolute inset-0 bg-black/50 group-hover:bg-black/35 transition-colors" />
              <div className="absolute inset-y-0 left-0 w-px bg-white/10" />
            </button>
          </div>
        ) : (
          /* ── FOTO ÚNICA ── */
          <AnimatePresence mode="wait">
            <motion.img
              key={curr.url}
              src={curr.url}
              alt={titulo}
              className="h-full w-full object-cover cursor-zoom-in"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setLightbox(true)}
            />
          </AnimatePresence>
        )}

        {/* Gradiente inferior */}
        <div className="pointer-events-none absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Setas de navegação */}
        {fotos.length > 1 && (
          <>
            <button
              onClick={() => ir(-1)}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-sm transition-all"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={() => ir(1)}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-sm transition-all"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Contador de fotos — canto superior esquerdo */}
        <div className="absolute top-4 left-4 z-10">
          <span className="flex items-center gap-1.5 rounded-lg bg-black/50 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
            <Camera className="h-3.5 w-3.5" />
            {idx + 1}/{fotos.length}
          </span>
        </div>

        {/* Botão Ampliar — canto superior direito */}
        <button
          onClick={() => setLightbox(true)}
          className="absolute top-4 right-4 z-10 flex items-center gap-1.5 rounded-lg bg-black/50 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md hover:bg-black/70 transition-all"
        >
          <Maximize2 className="h-3.5 w-3.5" />
          Ampliar
        </button>
      </div>

      {/* ── LIGHTBOX ── */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/96 backdrop-blur-xl flex items-center justify-center"
            onClick={() => setLightbox(false)}
          >
            <button
              onClick={() => setLightbox(false)}
              className="absolute top-5 right-5 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <span className="absolute top-6 left-1/2 -translate-x-1/2 z-20 text-white/80 font-medium text-sm tracking-widest">
              {idx + 1} / {fotos.length}
            </span>

            {fotos.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); ir(-1); }}
                  className="absolute left-5 top-1/2 -translate-y-1/2 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all"
                >
                  <ChevronLeft className="h-7 w-7" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); ir(1); }}
                  className="absolute right-5 top-1/2 -translate-y-1/2 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all"
                >
                  <ChevronRight className="h-7 w-7" />
                </button>
              </>
            )}

            <AnimatePresence mode="wait">
              <motion.img
                key={curr.url}
                src={curr.url}
                alt={titulo}
                className="max-h-[88vh] max-w-[88vw] object-contain select-none rounded-xl"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
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

// ─── NAVBAR ───────────────────────────────────────────────────────────────────

function Navbar() {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-gray-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button
            onClick={() => router.push("/externo")}
            className="flex items-center gap-2 text-black hover:text-blue-600 transition-colors group font-medium text-sm"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="hidden sm:inline">Voltar ao catálogo</span>
          </button>

          <a href="/externo" className="flex items-center gap-2">
            <img
              src="/logo-232motors.png"
              alt="232 Motors"
              className="w-9 h-9 object-contain mix-blend-multiply"
            />
            <span className="text-lg font-extrabold text-black tracking-tight hidden sm:block">
              232<span className="text-blue-600">MOTORS</span>
            </span>
          </a>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/login")}
            className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all"
          >
            <LogIn className="w-4 h-4" />
            <span className="hidden sm:inline">Entrar</span>
          </motion.button>
        </div>
      </div>
    </header>
  );
}

// ─── SKELETON ─────────────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="min-h-screen bg-[#F2F4F7]">
      <Navbar />
      <div className="w-full h-[65vh] bg-gray-200 animate-pulse" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 pb-16 animate-pulse">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          <div className="p-8">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4" />
            <div className="h-8 bg-gray-200 rounded w-2/3 mb-3" />
            <div className="h-4 bg-gray-200 rounded w-1/3" />
          </div>
          <div className="flex flex-col lg:flex-row p-8 gap-8">
            <div className="flex-1 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded-xl" />
                ))}
              </div>
            </div>
            <div className="w-full lg:w-80 space-y-4">
              <div className="h-12 bg-gray-200 rounded-xl" />
              <div className="h-12 bg-gray-100 rounded-xl" />
              <div className="h-12 bg-gray-100 rounded-xl" />
              <div className="h-12 bg-gray-100 rounded-xl" />
              <div className="h-14 bg-gray-200 rounded-xl" />
              <div className="h-12 bg-gray-100 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────

export default function VeiculoDetalhePublico() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [veiculo, setVeiculo] = useState<Veiculo | null>(null);
  const [fotos, setFotos] = useState<FotoVeiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [form, setForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    mensagem: "Olá, tenho interesse neste veículo. Por favor, entre em contato.",
    receberOfertas: false,
  });
  const [enviandoLead, setEnviandoLead] = useState(false);
  const [leadFeedback, setLeadFeedback] = useState<{ tipo: "ok" | "erro"; msg: string } | null>(null);

  /** Registra o interesse como lead no CRM da loja. */
  const enviarLead = async (origem: OrigemLead) => {
    if (!veiculo) return;

    if (!form.nome.trim()) {
      setLeadFeedback({ tipo: "erro", msg: "Informe seu nome para entrarmos em contato." });
      return;
    }
    if (!form.email.trim() && !form.telefone.trim()) {
      setLeadFeedback({ tipo: "erro", msg: "Informe e-mail ou telefone para contato." });
      return;
    }

    setEnviandoLead(true);
    setLeadFeedback(null);

    try {
      await criarLead({
        nome: form.nome.trim(),
        email: form.email.trim() || undefined,
        telefone: form.telefone.trim() || undefined,
        mensagem: form.mensagem.trim() || undefined,
        origem,
        veiculoId: veiculo.id,
      });

      if (origem === "WHATSAPP") {
        const texto = encodeURIComponent(
          `Olá! Tenho interesse no ${veiculo.marca} ${veiculo.modelo} ${veiculo.anoModelo} ` +
          `anunciado por ${formatBRL(veiculo.valor)}. Meu nome é ${form.nome.trim()}.`
        );
        window.open(`https://wa.me/${LOJA_WHATSAPP}?text=${texto}`, "_blank");
        setLeadFeedback({ tipo: "ok", msg: "Abrindo o WhatsApp da loja..." });
      } else if (origem === "VISITA") {
        setLeadFeedback({ tipo: "ok", msg: "Pedido de visita enviado! A loja entrará em contato para agendar." });
      } else if (origem === "FINANCIAMENTO") {
        setLeadFeedback({ tipo: "ok", msg: "Solicitação de financiamento enviada! A loja entrará em contato." });
      } else {
        setLeadFeedback({ tipo: "ok", msg: "Mensagem enviada com sucesso! A loja entrará em contato em breve." });
      }
    } catch {
      setLeadFeedback({ tipo: "erro", msg: "Não foi possível enviar. Tente novamente." });
    } finally {
      setEnviandoLead(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    registrarVisualizacao(Number(id));
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
        <div className="flex-1 flex flex-col items-center justify-center gap-5 py-20 text-center px-4">
          <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
            <ImageOff className="w-10 h-10 text-gray-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{erro || "Veículo não encontrado"}</h2>
            <p className="text-gray-500 max-w-sm mx-auto">O veículo solicitado pode ter sido removido ou está indisponível.</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/externo")}
            className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-semibold mt-2 hover:bg-black transition"
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

  const opcionaisList = [
    { key: "aceitaTroca", label: "Aceita troca" },
    { key: "blindado", label: "Blindado" },
    { key: "unicoDono", label: "Único dono" },
    { key: "ipvaPago", label: "IPVA pago" },
    { key: "licenciado", label: "Licenciado" },
    { key: "garantia", label: "Garantia" },
    { key: "revisado", label: "Revisado" },
  ] as const;

  const opcionaisAtivos = opcionaisList.filter(
    (o) => (veiculo as unknown as Record<string, unknown>)[o.key]
  );

  /* Itens de ficha técnica */
  const fichaTecnica: { label: string; value: string | number | null | undefined }[] = [
    { label: "Estado", value: [veiculo.cidade, veiculo.estado].filter(Boolean).join(" - ") || null },
    { label: "Ano", value: veiculo.anoFabricacao ? `${veiculo.anoFabricacao}/${veiculo.anoModelo}` : null },
    { label: "KM", value: veiculo.quilometragem > 0 ? formatKm(veiculo.quilometragem) : null },
    { label: "Câmbio", value: veiculo.cambio ? cambioLabel(veiculo.cambio as string) : null },
    { label: "Carroceria", value: veiculo.categoria ?? null },
    { label: "Combustível", value: veiculo.combustivel ? combustivelLabel(veiculo.combustivel as string) : null },
    { label: "Cor", value: veiculo.cor || null },
    { label: "Motor", value: veiculo.motor ?? null },
    { label: "Potência", value: veiculo.potencia ?? null },
    { label: "Portas", value: veiculo.portas ?? null },
  ].filter((item) => item.value);

  return (
    <div className="min-h-screen bg-[#F2F4F7] font-sans text-gray-900 flex flex-col">
      <Navbar />

      {/* ── GALERIA ── */}
      <GaleriaStrip fotos={fotos} titulo={titulo} />

      {/* ── CARD DE INFORMAÇÕES — sobrepõe o rodapé da galeria ── */}
      <div className="relative z-10 -mt-14 px-4 sm:px-6 lg:px-8 pb-16 flex-1">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="max-w-5xl mx-auto"
        >
          <div className="bg-white rounded-3xl shadow-2xl shadow-gray-900/15 overflow-hidden border border-gray-100/80">

            {/* ── HEADER: badges + título + localização + ações ── */}
            <div className="px-6 pt-6 pb-5 sm:px-8 sm:pt-8 border-b border-black/10">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${badge.cls}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                      {badge.label}
                    </span>
                    {veiculo.aceitaTroca && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-orange-50 text-orange-700 border border-orange-200">
                        Aceita troca
                      </span>
                    )}
                    {veiculo.destaque && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-amber-50 text-amber-700 border border-amber-200">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        Destaque
                      </span>
                    )}
                  </div>

                  {/* Título */}
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-black tracking-tight leading-tight mb-1">
                    {titulo}
                    {veiculo.versao && (
                      <span className="text-blue-500 font-semibold text-xl ml-2">{veiculo.versao}</span>
                    )}
                  </h1>

                  {/* Localização */}
                  {(veiculo.cidade || veiculo.estado) && (
                    <div className="flex items-center gap-1.5 text-black/60 text-sm font-medium mt-1">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      {[veiculo.cidade, veiculo.estado].filter(Boolean).join("/")}
                    </div>
                  )}
                </div>

                {/* Ações */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button className="flex items-center gap-1.5 px-3 py-2 bg-white border border-black/15 rounded-xl text-xs font-semibold text-black hover:bg-gray-50 transition-colors">
                    <Share2 className="w-3.5 h-3.5" /> Compartilhar
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-2 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors">
                    <Heart className="w-3.5 h-3.5 fill-red-400" /> Salvar
                  </button>
                </div>
              </div>
            </div>

            {/* ── CONTEÚDO PRINCIPAL: ESQUERDA + DIREITA ── */}
            <div className="flex flex-col lg:flex-row">

              {/* ─── COLUNA ESQUERDA: ficha, diferenciais, descrição ─── */}
              <div className="flex-1 min-w-0 px-6 py-6 sm:px-8 sm:py-8 lg:border-r border-black/10 space-y-8">

                {/* Ficha Técnica */}
                {fichaTecnica.length > 0 && (
                  <div>
                    <h2 className="text-[10px] font-extrabold text-black uppercase tracking-[0.15em] mb-4">
                      Ficha Técnica
                    </h2>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                      {fichaTecnica.map((item) => (
                        <div key={item.label} className="flex flex-col gap-0.5">
                          <span className="text-[11px] text-black/50 font-medium">{item.label}</span>
                          <span className="text-sm font-bold text-blue-700">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Diferenciais */}
                {opcionaisAtivos.length > 0 && (
                  <div>
                    <h2 className="text-[10px] font-extrabold text-black uppercase tracking-[0.15em] mb-4">
                      Diferenciais
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                      {opcionaisAtivos.map((o) => (
                        <div key={o.key} className="flex items-center gap-3">
                          <div className="w-9 h-9 flex-shrink-0 rounded-xl bg-blue-50 flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-blue-600" />
                          </div>
                          <span className="text-sm font-semibold text-blue-700">{o.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Descrição */}
                {veiculo.descricao && (
                  <div>
                    <h2 className="text-[10px] font-extrabold text-black uppercase tracking-[0.15em] mb-4">
                      Sobre o Veículo
                    </h2>
                    <p className="text-sm text-black/75 leading-relaxed whitespace-pre-line">
                      {veiculo.descricao}
                    </p>
                  </div>
                )}
              </div>

              {/* ─── COLUNA DIREITA: preço + formulário de contato ─── */}
              <div className="w-full lg:w-80 xl:w-96 flex-shrink-0 px-6 py-6 sm:px-8 sm:py-8 space-y-5 bg-gray-50/50 lg:bg-white">

                {/* Preço */}
                <div className="pb-4 border-b border-black/10">
                  {veiculo.valor > 0 ? (
                    <>
                      <p className="text-[11px] font-bold text-black/50 uppercase tracking-widest mb-0.5">Preço à vista</p>
                      <p className="text-3xl font-black text-emerald-600 tracking-tight">
                        {formatBRL(veiculo.valor)}
                      </p>
                    </>
                  ) : (
                    <p className="text-xl font-bold text-black">Consulte o valor</p>
                  )}
                </div>

                {isDisponivel ? (
                  /* Formulário de contato */
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Seu nome"
                      value={form.nome}
                      onChange={(e) => setForm({ ...form, nome: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    />
                    <input
                      type="email"
                      placeholder="E-mail"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    />
                    <input
                      type="tel"
                      placeholder="Telefone"
                      value={form.telefone}
                      onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    />
                    <textarea
                      rows={3}
                      value={form.mensagem}
                      onChange={(e) => setForm({ ...form, mensagem: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white resize-none"
                    />
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.receberOfertas}
                        onChange={(e) => setForm({ ...form, receberOfertas: e.target.checked })}
                        className="w-4 h-4 rounded accent-blue-600"
                      />
                      <span className="text-xs text-black/60">Quero receber ofertas semelhantes</span>
                    </label>

                    <AnimatePresence>
                      {leadFeedback && (
                        <motion.div
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          className={`rounded-xl border px-4 py-3 text-xs font-semibold ${
                            leadFeedback.tipo === "ok"
                              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                              : "bg-red-50 border-red-200 text-red-700"
                          }`}
                        >
                          {leadFeedback.msg}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <motion.button
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      disabled={enviandoLead}
                      onClick={() => enviarLead("EMAIL")}
                      className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-red-500/25 transition-all text-sm disabled:opacity-60"
                    >
                      <Send className="w-4 h-4" />
                      {enviandoLead ? "Enviando..." : "Estou interessado"}
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      disabled={enviandoLead}
                      onClick={() => enviarLead("WHATSAPP")}
                      className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition-all text-sm shadow-md shadow-emerald-500/20 disabled:opacity-60"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Chamar no WhatsApp
                    </motion.button>

                    <div className="grid grid-cols-2 gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        disabled={enviandoLead}
                        onClick={() => enviarLead("VISITA")}
                        className="flex items-center justify-center gap-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-semibold py-3 rounded-xl transition-all text-xs disabled:opacity-60"
                      >
                        Agendar visita
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        disabled={enviandoLead}
                        onClick={() => enviarLead("FINANCIAMENTO")}
                        className="flex items-center justify-center gap-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-semibold py-3 rounded-xl transition-all text-xs disabled:opacity-60"
                      >
                        Financiamento
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 rounded-xl border border-black/10 text-center">
                    <p className="text-sm font-bold text-black mb-1">Veículo Indisponível</p>
                    <p className="text-xs text-black/50">Status: {STATUS_LABELS[veiculo.status]}</p>
                    <motion.button
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => router.push("/externo")}
                      className="mt-4 w-full flex items-center justify-center gap-2 bg-gray-900 text-white font-bold py-3 rounded-xl text-sm"
                    >
                      Ver outros veículos
                    </motion.button>
                  </div>
                )}
              </div>
            </div>

            {/* ── ITENS OPCIONAIS DO VEÍCULO ── */}
            {(veiculo.opcionais ?? []).length > 0 && (
              <div className="px-6 py-6 sm:px-8 sm:py-8 border-t border-black/10 bg-blue-50/30">
                <h2 className="text-[10px] font-extrabold text-black uppercase tracking-[0.15em] mb-5">
                  Itens do Veículo
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-y-3 gap-x-6">
                  {(veiculo.opcionais ?? []).map((opcional) => (
                    <div key={`item-${opcional}`} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <span className="text-sm font-medium text-blue-700">{opcionalLabel(opcional)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ── FOOTER ── */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo-232motors.png" alt="232 Motors" className="w-9 h-9 object-contain mix-blend-multiply" />
            <span className="text-lg font-extrabold text-black tracking-tight">
              232<span className="text-blue-600">MOTORS</span>
            </span>
          </div>
          <p className="text-sm text-black/50 font-medium">
            © {new Date().getFullYear()} 232 Motors. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
