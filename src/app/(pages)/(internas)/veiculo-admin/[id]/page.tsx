"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  Camera,
  Car,
  Check,
  ChevronLeft,
  ChevronRight,
  Fuel,
  Gauge,
  ImageOff,
  Info,
  MapPin,
  Pencil,
  Settings2,
  Shield,
  Star,
  Tag,
  Trash2,
} from "lucide-react";

import DefaultLayout from "@/components/Layouts/DefaultLayout";
import axiosInstance from "@/services/axiosInstance";
import type { FotoVeiculo, Veiculo } from "@/types/veiculo";
import { useVeiculoTheme } from "../_components/useVeiculoTheme";
import {
  cambioLabel,
  combustivelLabel,
  formatBRL,
  formatData,
  formatKm,
  mapVeiculo,
  STATUS_LABELS,
} from "../_components/veiculo.utils";
import StatusBadge from "../_components/StatusBadge";
import FotoUploadModal from "../_components/FotoUploadModal";
import ConfirmDeleteModal from "../_components/ConfirmDeleteModal";

/* ── Helpers de UI ──────────────────────────────────────────────── */
function InfoRow({ label, value }: { label: string; value?: string | number | boolean | null }) {
  if (value === undefined || value === null || value === "") return null;
  const display =
    typeof value === "boolean"
      ? value
        ? "Sim"
        : "Não"
      : String(value);
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <span className="min-w-[130px] text-sm opacity-60">{label}</span>
      <span className="text-right text-sm font-medium">{display}</span>
    </div>
  );
}

function SectionCard({
  icon: Icon,
  title,
  children,
  isDark,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  isDark: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        isDark ? "border-slate-800/60 bg-slate-900/60" : "border-slate-200/60 bg-white"
      }`}
    >
      <div className="mb-3 flex items-center gap-2">
        <div className={`rounded-lg p-1.5 ${isDark ? "bg-blue-500/20 text-blue-400" : "bg-blue-500/15 text-blue-600"}`}>
          <Icon className="h-4 w-4" />
        </div>
        <h3 className="font-semibold">{title}</h3>
      </div>
      <div className={`divide-y ${isDark ? "divide-slate-800/60" : "divide-slate-100"}`}>
        {children}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   Página de Detalhes do Veículo
══════════════════════════════════════════════════════════════════ */
export default function VeiculoDetalhesPage() {
  const params = useParams();
  const router = useRouter();
  const veiculoId = Number(params.id);

  const { isDark, mounted, colors } = useVeiculoTheme();

  const [veiculo, setVeiculo] = useState<Veiculo | null>(null);
  const [fotos, setFotos] = useState<FotoVeiculo[]>([]);
  const [fotoIdx, setFotoIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  const [fotoModal, setFotoModal] = useState(false);
  const [excluirModal, setExcluirModal] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  /* Carrega veículo + fotos */
  useEffect(() => {
    if (!veiculoId) return;
    let ativo = true;

    const carregar = async () => {
      setLoading(true);
      try {
        const [veicRes, fotosRes] = await Promise.all([
          axiosInstance.get(`/veiculos/${veiculoId}`),
          axiosInstance.get<FotoVeiculo[]>(`/veiculos/${veiculoId}/fotos`),
        ]);
        if (!ativo) return;

        setVeiculo(mapVeiculo(veicRes.data));

        const ordenadas = [...(fotosRes.data ?? [])].sort((a, b) => {
          if (a.principal && !b.principal) return -1;
          if (!a.principal && b.principal) return 1;
          return (a.ordem ?? 0) - (b.ordem ?? 0);
        });
        setFotos(ordenadas);
        setFotoIdx(0);
      } catch {
        /* silencia — veículo não encontrado */
      } finally {
        if (ativo) setLoading(false);
      }
    };

    carregar();
    return () => { ativo = false; };
  }, [veiculoId]);

  const irFoto = (dir: 1 | -1) => {
    setImgError(false);
    setFotoIdx((prev) => (prev + dir + fotos.length) % fotos.length);
  };

  const excluir = async () => {
    if (!veiculo) return;
    setExcluindo(true);
    try {
      await axiosInstance.delete(`/veiculos/${veiculo.id}`);
      router.push("/veiculo-admin");
    } catch {
      setExcluindo(false);
    }
  };

  const handleFotoModalFechar = (fotosAtualizadas: FotoVeiculo[]) => {
    const ordenadas = [...fotosAtualizadas].sort((a, b) => {
      if (a.principal && !b.principal) return -1;
      if (!a.principal && b.principal) return 1;
      return (a.ordem ?? 0) - (b.ordem ?? 0);
    });
    setFotos(ordenadas);
    setFotoIdx(0);
    setImgError(false);
    setFotoModal(false);
  };

  /* ── Loading skeleton ───────────────────────────────────────── */
  if (loading || !mounted) {
    return (
      <DefaultLayout>
        <div className={`min-h-dvh ${colors.background} ${colors.text.primary}`}>
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
            <div className={`mb-6 h-8 w-48 animate-pulse rounded-xl ${isDark ? "bg-slate-800" : "bg-slate-200"}`} />
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className={`aspect-video animate-pulse rounded-2xl ${isDark ? "bg-slate-800" : "bg-slate-200"}`} />
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className={`h-12 animate-pulse rounded-xl ${isDark ? "bg-slate-800" : "bg-slate-200"}`} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  if (!veiculo) {
    return (
      <DefaultLayout>
        <div className={`flex min-h-dvh flex-col items-center justify-center ${colors.background} ${colors.text.primary}`}>
          <Car className="mb-4 h-16 w-16 opacity-20" />
          <p className="text-lg font-medium">Veículo não encontrado.</p>
          <button
            onClick={() => router.push("/veiculo-admin")}
            className="mt-4 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Voltar ao Estoque
          </button>
        </div>
      </DefaultLayout>
    );
  }

  const fotoAtual = fotos[fotoIdx];

  return (
    <DefaultLayout>
      <div className={`relative min-h-dvh ${mounted ? colors.background : "bg-slate-50"} ${colors.text.primary}`}>
        {/* Efeito de fundo */}
        {mounted && (
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1000px_300px_at_50%_-20%,rgba(59,130,246,.18),transparent)]" />
        )}

        <div className="relative z-10 mx-auto max-w-7xl px-4 pb-24 pt-4 sm:px-6">

          {/* ── Cabeçalho / Breadcrumb ──────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex flex-wrap items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/veiculo-admin")}
                className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-colors ${
                  isDark
                    ? "border-slate-700 bg-slate-800/60 text-slate-300 hover:bg-slate-700"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                }`}
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <p className={`text-xs ${colors.text.muted}`}>Estoque de Veículos</p>
                <h1 className="font-bold">
                  {veiculo.marca} {veiculo.modelo}
                  {veiculo.versao ? ` ${veiculo.versao}` : ""}
                </h1>
              </div>
            </div>

            {/* Ações principais */}
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => router.push(`/veiculo-admin/novo-veiculo?id=${veiculo.id}`)}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:from-blue-700 hover:to-blue-800"
              >
                <Pencil className="h-4 w-4" />
                Editar
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setExcluirModal(true)}
                className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
                  isDark
                    ? "border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                    : "border-red-400/30 bg-red-50 text-red-600 hover:bg-red-100"
                }`}
              >
                <Trash2 className="h-4 w-4" />
                Excluir
              </motion.button>
            </div>
          </motion.div>

          {/* ── Hero: Fotos + Info ───────────────────────────────── */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_460px]">

            {/* ─ GALERIA DE FOTOS ─────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 }}
              className={`overflow-hidden rounded-2xl border ${
                isDark ? "border-slate-800/60 bg-slate-900/60" : "border-slate-200/60 bg-white"
              }`}
            >
              {/* Foto principal */}
              <div className="group relative aspect-video w-full overflow-hidden bg-slate-900">
                {fotos.length > 0 && !imgError ? (
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
                        onError={() => setImgError(true)}
                      />
                    </AnimatePresence>

                    {/* Gradiente inferior */}
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/70 to-transparent" />

                    {/* Setas de navegação */}
                    {fotos.length > 1 && (
                      <>
                        <button
                          onClick={() => irFoto(-1)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
                        >
                          <ChevronLeft className="h-6 w-6" />
                        </button>
                        <button
                          onClick={() => irFoto(1)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
                        >
                          <ChevronRight className="h-6 w-6" />
                        </button>
                      </>
                    )}

                    {/* Contador */}
                    <span className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-sm text-white backdrop-blur-sm">
                      <Camera className="h-4 w-4" />
                      {fotoIdx + 1}/{fotos.length}
                    </span>

                    {/* Destaque */}
                    {veiculo.destaque && (
                      <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-amber-500/90 px-3 py-1 text-sm font-semibold text-white backdrop-blur-sm">
                        <Star className="h-4 w-4 fill-current" />
                        Destaque
                      </span>
                    )}
                  </>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-3">
                    {imgError ? (
                      <>
                        <ImageOff className="h-12 w-12 text-slate-600" />
                        <p className="text-sm text-slate-400">Imagem não disponível</p>
                      </>
                    ) : (
                      <>
                        <Car className="h-14 w-14 text-slate-600" />
                        <p className="text-sm text-slate-500">Sem fotos cadastradas</p>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {fotos.length > 1 && (
                <div className="flex gap-2 overflow-x-auto p-3">
                  {fotos.map((f, i) => (
                    <button
                      key={f.id}
                      onClick={() => { setFotoIdx(i); setImgError(false); }}
                      className={`flex-shrink-0 overflow-hidden rounded-lg transition-all ${
                        i === fotoIdx
                          ? "ring-2 ring-blue-500 ring-offset-1"
                          : "opacity-60 hover:opacity-100"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={f.url}
                        alt={`Foto ${i + 1}`}
                        className="h-16 w-24 object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Botão gerenciar fotos */}
              <div className={`border-t p-4 ${isDark ? "border-slate-800/60" : "border-slate-100"}`}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setFotoModal(true)}
                  className={`inline-flex w-full items-center justify-center gap-2 rounded-xl border py-3 text-sm font-medium transition-colors ${
                    isDark
                      ? "border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
                      : "border-blue-400/30 bg-blue-50 text-blue-600 hover:bg-blue-100"
                  }`}
                >
                  <Camera className="h-4 w-4" />
                  Gerenciar Fotos
                  {fotos.length > 0 && (
                    <span className={`rounded-full px-2 py-0.5 text-xs ${isDark ? "bg-blue-500/20" : "bg-blue-100"}`}>
                      {fotos.length}
                    </span>
                  )}
                </motion.button>
              </div>
            </motion.div>

            {/* ─ INFO PRINCIPAL ────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className={`flex flex-col gap-4 rounded-2xl border p-6 ${
                isDark ? "border-slate-800/60 bg-slate-900/60" : "border-slate-200/60 bg-white"
              }`}
            >
              {/* Status + Destaque */}
              <div className="flex items-center gap-2">
                <StatusBadge status={veiculo.status as string} />
                {veiculo.destaque && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                    <Star className="h-3 w-3 fill-current" />
                    Destaque
                  </span>
                )}
              </div>

              {/* Nome */}
              <div>
                <h2 className="text-2xl font-bold leading-tight">
                  {veiculo.marca} {veiculo.modelo}
                </h2>
                {veiculo.versao && (
                  <p className={`mt-0.5 text-base ${colors.text.secondary}`}>{veiculo.versao}</p>
                )}
                <p className={`mt-1 text-sm ${colors.text.muted}`}>
                  {veiculo.anoFabricacao}/{veiculo.anoModelo}
                  {veiculo.cor ? ` • ${veiculo.cor}` : ""}
                  {veiculo.placa ? ` • ${veiculo.placa}` : ""}
                </p>
              </div>

              {/* Chips técnicos */}
              <div className="flex flex-wrap gap-1.5">
                {veiculo.combustivel && (
                  <Chip icon={Fuel} label={combustivelLabel(veiculo.combustivel as string)} isDark={isDark} />
                )}
                {veiculo.cambio && (
                  <Chip icon={Settings2} label={cambioLabel(veiculo.cambio as string)} isDark={isDark} />
                )}
                {veiculo.quilometragem > 0 && (
                  <Chip icon={Gauge} label={formatKm(veiculo.quilometragem)} isDark={isDark} />
                )}
                {(veiculo.cidade || veiculo.estado) && (
                  <Chip icon={MapPin} label={[veiculo.cidade, veiculo.estado].filter(Boolean).join(" - ")} isDark={isDark} />
                )}
                {veiculo.portas && (
                  <Chip icon={Car} label={`${veiculo.portas} portas`} isDark={isDark} />
                )}
              </div>

              {/* Valor */}
              <div className={`rounded-xl border p-4 ${isDark ? "border-slate-800 bg-slate-800/40" : "border-slate-100 bg-slate-50"}`}>
                <p className={`mb-1 text-xs font-medium uppercase tracking-wider ${colors.text.muted}`}>
                  Valor de Venda
                </p>
                <p className={`text-3xl font-bold ${isDark ? "text-blue-400" : "text-blue-600"}`}>
                  {formatBRL(veiculo.valor)}
                </p>
                {veiculo.valorFipe && (
                  <p className={`mt-1 text-sm ${colors.text.secondary}`}>
                    FIPE: {formatBRL(veiculo.valorFipe)}
                  </p>
                )}
                {veiculo.aceitaTroca && (
                  <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-green-500/15 px-2 py-0.5 text-xs font-medium text-green-600 dark:text-green-400">
                    <Check className="h-3 w-3" />
                    Aceita troca
                  </span>
                )}
              </div>

              {/* Datas */}
              {veiculo.dataCadastro && (
                <p className={`flex items-center gap-1.5 text-xs ${colors.text.muted}`}>
                  <Calendar className="h-3.5 w-3.5" />
                  Cadastrado em {formatData(veiculo.dataCadastro)}
                  {veiculo.dataAtualizacao && ` • Atualizado ${formatData(veiculo.dataAtualizacao)}`}
                </p>
              )}

              {/* Botão editar */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push(`/veiculo-admin/novo-veiculo?id=${veiculo.id}`)}
                className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 py-3 text-sm font-medium text-white hover:from-blue-700 hover:to-blue-800"
              >
                <Pencil className="h-4 w-4" />
                Editar Informações
              </motion.button>
            </motion.div>
          </div>

          {/* ── Seções de detalhes ───────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
          >
            {/* Identificação */}
            <SectionCard icon={Tag} title="Identificação" isDark={isDark}>
              <InfoRow label="Marca" value={veiculo.marca} />
              <InfoRow label="Modelo" value={veiculo.modelo} />
              <InfoRow label="Versão" value={veiculo.versao} />
              <InfoRow label="Ano Fabricação" value={veiculo.anoFabricacao} />
              <InfoRow label="Ano Modelo" value={veiculo.anoModelo} />
              <InfoRow label="Cor" value={veiculo.cor} />
              <InfoRow label="Placa" value={veiculo.placa} />
              <InfoRow label="RENAVAM" value={veiculo.renavam} />
              <InfoRow label="Chassi" value={veiculo.chassi} />
              <InfoRow label="Categoria" value={veiculo.categoria} />
            </SectionCard>

            {/* Especificações */}
            <SectionCard icon={Settings2} title="Especificações Técnicas" isDark={isDark}>
              <InfoRow label="Motor" value={veiculo.motor} />
              <InfoRow label="Potência" value={veiculo.potencia} />
              <InfoRow label="Combustível" value={combustivelLabel(veiculo.combustivel as string)} />
              <InfoRow label="Câmbio" value={cambioLabel(veiculo.cambio as string)} />
              <InfoRow label="Portas" value={veiculo.portas} />
              <InfoRow label="Quilometragem" value={formatKm(veiculo.quilometragem)} />
            </SectionCard>

            {/* Localização */}
            <SectionCard icon={MapPin} title="Localização" isDark={isDark}>
              <InfoRow label="Cidade" value={veiculo.cidade} />
              <InfoRow label="Estado" value={veiculo.estado} />
            </SectionCard>

            {/* Valores */}
            <SectionCard icon={Tag} title="Valores" isDark={isDark}>
              <InfoRow label="Valor de compra" value={veiculo.valorCompra ? formatBRL(veiculo.valorCompra) : null} />
              <InfoRow label="Valor de venda" value={formatBRL(veiculo.valor)} />
              <InfoRow label="Valor FIPE" value={veiculo.valorFipe ? formatBRL(veiculo.valorFipe) : null} />
              <InfoRow label="Aceita troca" value={veiculo.aceitaTroca} />
            </SectionCard>

            {/* Condições */}
            <SectionCard icon={Shield} title="Condições" isDark={isDark}>
              <InfoRow label="Único dono" value={veiculo.unicoDono} />
              <InfoRow label="Blindado" value={veiculo.blindado} />
              <InfoRow label="IPVA pago" value={veiculo.ipvaPago} />
              <InfoRow label="Licenciado" value={veiculo.licenciado} />
              <InfoRow label="Garantia" value={veiculo.garantia} />
              <InfoRow label="Revisado" value={veiculo.revisado} />
            </SectionCard>

            {/* Status e publicação */}
            <SectionCard icon={Info} title="Status e Publicação" isDark={isDark}>
              <InfoRow label="Status" value={STATUS_LABELS[veiculo.status as string] ?? veiculo.status} />
              <InfoRow label="Destaque" value={veiculo.destaque} />
              <InfoRow label="Cadastro" value={formatData(veiculo.dataCadastro)} />
              <InfoRow label="Atualização" value={formatData(veiculo.dataAtualizacao)} />
            </SectionCard>

            {/* Descrição */}
            {veiculo.descricao && (
              <div
                className={`sm:col-span-2 xl:col-span-3 rounded-2xl border p-5 ${
                  isDark ? "border-slate-800/60 bg-slate-900/60" : "border-slate-200/60 bg-white"
                }`}
              >
                <div className="mb-3 flex items-center gap-2">
                  <div className={`rounded-lg p-1.5 ${isDark ? "bg-blue-500/20 text-blue-400" : "bg-blue-500/15 text-blue-600"}`}>
                    <Info className="h-4 w-4" />
                  </div>
                  <h3 className="font-semibold">Descrição</h3>
                </div>
                <p className={`whitespace-pre-wrap text-sm leading-relaxed ${colors.text.secondary}`}>
                  {veiculo.descricao}
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Modais */}
      <FotoUploadModal
        aberto={fotoModal}
        veiculo={veiculo}
        onFechar={handleFotoModalFechar}
      />

      <ConfirmDeleteModal
        aberto={excluirModal}
        veiculo={veiculo}
        carregando={excluindo}
        onCancelar={() => setExcluirModal(false)}
        onConfirmar={excluir}
      />
    </DefaultLayout>
  );
}

/* ── Chip auxiliar ──────────────────────────────────────────────── */
function Chip({ icon: Icon, label, isDark }: { icon: React.ElementType; label: string; isDark: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
      isDark ? "bg-slate-800/70 text-slate-300" : "bg-slate-100 text-slate-600"
    }`}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}
