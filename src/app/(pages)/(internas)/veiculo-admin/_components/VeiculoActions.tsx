"use client";

import { motion } from "framer-motion";
import { Copy, DollarSign, Eye, Image as ImageIcon, Pencil, Trash2 } from "lucide-react";
import type { Veiculo } from "@/types/veiculo";
import { useVeiculoTheme } from "./useVeiculoTheme";
import Tooltip from "./Tooltip";

interface VeiculoActionsProps {
  veiculo: Veiculo;
  onVisualizar: (veiculo: Veiculo) => void;
  onEditar: (veiculo: Veiculo) => void;
  onFotos: (veiculo: Veiculo) => void;
  onFinanceiro: (veiculo: Veiculo) => void;
  onDuplicar: (veiculo: Veiculo) => void;
  onExcluir: (veiculo: Veiculo) => void;
}

type Tone = "blue" | "green" | "purple" | "emerald" | "amber" | "red";

/** Conjunto de ações (somente ícones) de cada veículo, todas com tooltip. */
export default function VeiculoActions({
  veiculo,
  onVisualizar,
  onEditar,
  onFotos,
  onFinanceiro,
  onDuplicar,
  onExcluir,
}: VeiculoActionsProps) {
  const { isDark } = useVeiculoTheme();

  const tones: Record<Tone, string> = {
    blue: isDark
      ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
      : "bg-blue-500/15 text-blue-600 hover:bg-blue-500/25",
    green: isDark
      ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
      : "bg-green-500/15 text-green-600 hover:bg-green-500/25",
    purple: isDark
      ? "bg-purple-500/20 text-purple-400 hover:bg-purple-500/30"
      : "bg-purple-500/15 text-purple-600 hover:bg-purple-500/25",
    emerald: isDark
      ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
      : "bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25",
    amber: isDark
      ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
      : "bg-amber-500/15 text-amber-600 hover:bg-amber-500/25",
    red: isDark
      ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
      : "bg-red-500/15 text-red-600 hover:bg-red-500/25",
  };

  const acoes: {
    label: string;
    tone: Tone;
    icon: React.ElementType;
    onClick: () => void;
  }[] = [
    { label: "Visualizar", tone: "blue", icon: Eye, onClick: () => onVisualizar(veiculo) },
    { label: "Editar", tone: "green", icon: Pencil, onClick: () => onEditar(veiculo) },
    { label: "Fotos", tone: "purple", icon: ImageIcon, onClick: () => onFotos(veiculo) },
    { label: "Financeiro", tone: "emerald", icon: DollarSign, onClick: () => onFinanceiro(veiculo) },
    { label: "Duplicar", tone: "amber", icon: Copy, onClick: () => onDuplicar(veiculo) },
    { label: "Excluir", tone: "red", icon: Trash2, onClick: () => onExcluir(veiculo) },
  ];

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {acoes.map(({ label, tone, icon: Icon, onClick }) => (
        <Tooltip key={label} label={label}>
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${tones[tone]}`}
            aria-label={label}
          >
            <Icon className="h-4 w-4" />
          </motion.button>
        </Tooltip>
      ))}
    </div>
  );
}
