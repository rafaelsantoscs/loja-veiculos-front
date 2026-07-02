"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Car,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Eye,
  Fuel,
  Gauge,
  MapPin,
  Pencil,
  Settings2,
  Star,
  Trash2,
} from "lucide-react";

import axiosInstance from "@/services/axiosInstance";
import type { FotoVeiculo, Veiculo } from "@/types/veiculo";
import { useVeiculoTheme } from "./useVeiculoTheme";
import {
  cambioLabel,
  combustivelLabel,
  formatBRL,
  formatData,
  formatKm,
} from "./veiculo.utils";
import StatusBadge from "./StatusBadge";
import Tooltip from "./Tooltip";

interface VeiculoCardProps {
  veiculo: Veiculo;
  /** Incrementar para forçar refresh das fotos (ex: após upload). */
  refreshKey?: number;
  onFotos: (v: Veiculo) => void;
  onFinanceiro: (v: Veiculo) => void;
  onExcluir: (v: Veiculo) => void;
}

export default function VeiculoCard({
  veiculo,
  refreshKey = 0,
  onFotos,
  onFinanceiro,
  onExcluir,
}: VeiculoCardProps) {
  const router = useRouter();
  const { isDark, colors } = useVeiculoTheme();

  const [fotos, setFotos] = useState<FotoVeiculo[]>([]);
  const [fotoIdx, setFotoIdx] = useState(0);
  const [fotoErro, setFotoErro] = useState(false);

  /* Carrega fotos ao montar e quando refreshKey mudar */
  useEffect(() => {
    let ativo = true;
    setFotoErro(false);
    setFotoIdx(0);

    axiosInstance
      .get<FotoVeiculo[]>(`/veiculos/${veiculo.id}/fotos`)
      .then((r) => {
        if (!ativo) return;
        const ordenadas = [...(r.data ?? [])].sort((a, b) => {
          if (a.principal && !b.principal) return -1;
          if (!a.principal && b.principal) return 1;
          return (a.ordem ?? 0) - (b.ordem ?? 0);
        });
        setFotos(ordenadas);
      })
      .catch(() => { if (ativo) setFotos([]); });

    return () => { ativo = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [veiculo.id, refreshKey]);

  const irFoto = (dir: 1 | -1, e: React.MouseEvent) => {
    e.stopPropagation();
    setFotoErro(false);
    setFotoIdx((prev) => (prev + dir + fotos.length) % fotos.length);
  };

  const temFotos = fotos.length > 0 && !fotoErro;
  const fotoAtual = fotos[fotoIdx];

  const acoes = [
    {
      label: "Ver detalhes",
      icon: Eye,
      color: isDark
        ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
        : "bg-blue-500/15 text-blue-600 hover:bg-blue-500/25",
      fn: () => router.push(`/veiculo-admin/${veiculo.id}`),
    },
    {
      label: "Editar",
      icon: Pencil,
      color: isDark
        ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
        : "bg-green-500/15 text-green-600 hover:bg-green-500/25",
      fn: () => router.push(`/veiculo-admin/novo-veiculo?id=${veiculo.id}`),
    },
    {
      label: `Fotos${fotos.length > 0 ? ` (${fotos.length})` : ""}`,
      icon: Camera,
      color: isDark
        ? "bg-purple-500/20 text-purple-400 hover:bg-purple-500/30"
        : "bg-purple-500/15 text-purple-600 hover:bg-purple-500/25",
      fn: () => onFotos(veiculo),
    },
    {
      label: "Financeiro",
      icon: DollarSign,
      color: isDark
        ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
        : "bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25",
      fn: () => onFinanceiro(veiculo),
    },
    {
      label: "Excluir",
      icon: Trash2,
      color: isDark
        ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
        : "bg-red-500/15 text-red-600 hover:bg-red-500/25",
      fn: () => onExcluir(veiculo),
    },
  ] as const;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      onClick={() => router.push(`/veiculo-admin/${veiculo.id}`)}
      className={`group flex cursor-pointer flex-col overflow-hidden rounded-2xl border shadow-sm transition-shadow hover:shadow-xl ${
        isDark ? "border-slate-800/60 bg-slate-900/60" : "border-slate-200/70 bg-white"
      }`}
    >
      {/* ── ÁREA DE FOTO ─────────────────────────────────────────── */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-900">
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

            {/* Degradê inferior */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />

            {/* Setas (só quando > 1 foto) */}
            {fotos.length > 1 && (
              <>
                <button
                  onClick={(e) => irFoto(-1, e)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={(e) => irFoto(1, e)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>

                {/* Dots */}
                <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                  {fotos.slice(0, 8).map((_, i) => (
                    <button
                      key={i}
                      onClick={(e) => { e.stopPropagation(); setFotoErro(false); setFotoIdx(i); }}
                      className={`h-1.5 rounded-full transition-all ${
                        i === fotoIdx ? "w-4 bg-white" : "w-1.5 bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Contador */}
            <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
              <Camera className="h-3.5 w-3.5" />
              {fotoIdx + 1}/{fotos.length}
            </span>
          </>
        ) : (
          /* Placeholder sem fotos */
          <div className="flex h-full flex-col items-center justify-center gap-3">
            <Car className="h-12 w-12 text-slate-600" />
            <p className="text-sm text-slate-500">Sem fotos</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => { e.stopPropagation(); onFotos(veiculo); }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600/80 px-4 py-2 text-xs font-medium text-white backdrop-blur-sm hover:bg-blue-600"
            >
              <Camera className="h-3.5 w-3.5" />
              Adicionar fotos
            </motion.button>
          </div>
        )}

        {/* Badge destaque */}
        {veiculo.destaque && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-amber-500/90 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            <Star className="h-3.5 w-3.5 fill-current" />
            Destaque
          </span>
        )}
      </div>

      {/* ── INFO ─────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        {/* Status + placa */}
        <div className="flex items-center justify-between gap-2">
          <StatusBadge status={veiculo.status as string} />
          {veiculo.placa && (
            <span className={`font-mono text-xs font-semibold tracking-widest ${colors.text.secondary}`}>
              {veiculo.placa}
            </span>
          )}
        </div>

        {/* Nome */}
        <div>
          <h3 className="truncate text-base font-bold leading-tight">
            {veiculo.marca} {veiculo.modelo}
          </h3>
          <p className={`mt-0.5 truncate text-sm ${colors.text.secondary}`}>
            {veiculo.versao} • {veiculo.anoFabricacao}/{veiculo.anoModelo}
            {veiculo.cor ? ` • ${veiculo.cor}` : ""}
          </p>
        </div>

        {/* Chips */}
        <div className="flex flex-wrap gap-1.5">
          {veiculo.combustivel && (
            <Chip icon={Fuel} label={combustivelLabel(veiculo.combustivel as string)} isDark={isDark} />
          )}
          {veiculo.cambio && (
            <Chip icon={Settings2} label={cambioLabel(veiculo.cambio as string)} isDark={isDark} />
          )}
          {(veiculo.cidade || veiculo.estado) && (
            <Chip icon={MapPin} label={[veiculo.cidade, veiculo.estado].filter(Boolean).join(" - ")} isDark={isDark} />
          )}
          {veiculo.quilometragem > 0 && (
            <Chip icon={Gauge} label={formatKm(veiculo.quilometragem)} isDark={isDark} />
          )}
        </div>

        {/* Preço */}
        <div className="mt-auto">
          <p className={`text-2xl font-bold ${isDark ? "text-blue-400" : "text-blue-600"}`}>
            {formatBRL(veiculo.valor)}
          </p>
          {veiculo.valorFipe ? (
            <p className={`text-xs ${colors.text.muted}`}>FIPE {formatBRL(veiculo.valorFipe)}</p>
          ) : null}
          {veiculo.dataCadastro && (
            <p className={`mt-1 text-xs ${colors.text.muted}`}>
              Cadastro: {formatData(veiculo.dataCadastro)}
            </p>
          )}
        </div>

        {/* ── AÇÕES ─────────────────────────────────────────────── */}
        <div
          className={`flex flex-wrap items-center gap-1.5 border-t pt-3 ${
            isDark ? "border-slate-800/60" : "border-slate-200/70"
          }`}
        >
          {acoes.map(({ label, icon: Icon, color, fn }) => (
            <Tooltip key={label} label={label}>
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={(e) => { e.stopPropagation(); fn(); }}
                className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${color}`}
                aria-label={label}
              >
                <Icon className="h-4 w-4" />
              </motion.button>
            </Tooltip>
          ))}
        </div>
      </div>
    </motion.article>
  );
}

/* ── Chip auxiliar ─────────────────────────────────────────────── */
function Chip({ icon: Icon, label, isDark }: { icon: React.ElementType; label: string; isDark: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${
      isDark ? "bg-slate-800/70 text-slate-300" : "bg-slate-100 text-slate-600"
    }`}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}
