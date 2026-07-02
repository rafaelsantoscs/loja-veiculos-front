"use client";

import { useVeiculoTheme } from "./useVeiculoTheme";
import { statusLabel } from "./veiculo.utils";

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
}

/**
 * Badge de status do veículo com as cores definidas pelo produto:
 * Disponível (verde), Reservado (amarelo), Em negociação/Em preparação (azul),
 * Vendido (vermelho), Inativo (cinza).
 */
export default function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const { isDark } = useVeiculoTheme();

  const palette: Record<string, string> = {
    DISPONIVEL: isDark
      ? "bg-green-500/20 text-green-400 border-green-500/30"
      : "bg-green-100 text-green-800 border-green-200",
    RESERVADO: isDark
      ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      : "bg-yellow-100 text-yellow-800 border-yellow-200",
    EM_NEGOCIACAO: isDark
      ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
      : "bg-blue-100 text-blue-800 border-blue-200",
    EM_PREPARACAO: isDark
      ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
      : "bg-blue-100 text-blue-800 border-blue-200",
    VENDIDO: isDark
      ? "bg-red-500/20 text-red-400 border-red-500/30"
      : "bg-red-100 text-red-800 border-red-200",
    INATIVO: isDark
      ? "bg-gray-500/20 text-gray-400 border-gray-500/30"
      : "bg-gray-100 text-gray-700 border-gray-200",
  };

  const dotColor: Record<string, string> = {
    DISPONIVEL: "bg-green-500",
    RESERVADO: "bg-yellow-500",
    EM_NEGOCIACAO: "bg-blue-500",
    EM_PREPARACAO: "bg-blue-500",
    VENDIDO: "bg-red-500",
    INATIVO: "bg-gray-400",
  };

  const classes =
    palette[status] ??
    (isDark
      ? "bg-gray-500/20 text-gray-400 border-gray-500/30"
      : "bg-gray-100 text-gray-700 border-gray-200");

  const sizing =
    size === "md" ? "px-3 py-1.5 text-sm" : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${classes} ${sizing}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${dotColor[status] ?? "bg-gray-400"}`}
      />
      {statusLabel(status)}
    </span>
  );
}
