"use client";

import { useVeiculoTheme } from "./useVeiculoTheme";
import { formatBRL } from "./veiculo.utils";

interface ValorBadgeProps {
  valor: number;
  valorFipe?: number | null;
}

/** Exibe o valor de venda em destaque (azul, negrito) e a FIPE logo abaixo. */
export default function ValorBadge({ valor, valorFipe }: ValorBadgeProps) {
  const { isDark } = useVeiculoTheme();

  return (
    <div className="leading-tight">
      <p
        className={`text-lg font-bold ${
          isDark ? "text-blue-400" : "text-blue-600"
        }`}
      >
        {formatBRL(valor)}
      </p>
      {valorFipe ? (
        <p className={`mt-0.5 text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
          FIPE {formatBRL(valorFipe)}
        </p>
      ) : null}
    </div>
  );
}
