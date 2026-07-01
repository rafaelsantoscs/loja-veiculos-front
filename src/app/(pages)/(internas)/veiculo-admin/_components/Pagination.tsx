"use client";

import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useVeiculoTheme } from "./useVeiculoTheme";

interface PaginationProps {
  paginaAtual: number;
  totalPaginas: number;
  totalItens: number;
  itensPorPagina: number;
  indiceInicial: number;
  indiceFinal: number;
  onPaginaChange: (pagina: number) => void;
  onItensPorPaginaChange: (qtd: number) => void;
}

const OPCOES_POR_PAGINA = [10, 20, 50, 100];

/** Paginação com seletor de itens por página, no padrão visual do projeto. */
export default function Pagination({
  paginaAtual,
  totalPaginas,
  totalItens,
  itensPorPagina,
  indiceInicial,
  indiceFinal,
  onPaginaChange,
  onItensPorPaginaChange,
}: PaginationProps) {
  const { isDark, colors, selectClass } = useVeiculoTheme();

  const botaoNav = (desabilitado: boolean) =>
    `flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
      desabilitado
        ? isDark
          ? "cursor-not-allowed bg-slate-800/30 text-slate-600"
          : "cursor-not-allowed bg-slate-100/50 text-slate-400"
        : isDark
          ? "bg-slate-700 text-slate-200 hover:bg-slate-600"
          : "bg-slate-200 text-slate-700 hover:bg-slate-300"
    }`;

  const paginas = Array.from({ length: totalPaginas }, (_, i) => i + 1).filter(
    (p) =>
      p === 1 ||
      p === totalPaginas ||
      (p >= paginaAtual - 1 && p <= paginaAtual + 1),
  );

  return (
    <div className="mt-6 flex flex-col gap-4 border-t pt-4 lg:flex-row lg:items-center lg:justify-between"
      style={{ borderColor: isDark ? "rgba(30,41,59,0.6)" : "rgba(226,232,240,0.6)" }}
    >
      <div className="flex flex-wrap items-center gap-4">
        <p className={`text-sm ${colors.text.secondary}`}>
          Mostrando{" "}
          <span className="font-semibold">{totalItens === 0 ? 0 : indiceInicial + 1}</span> a{" "}
          <span className="font-semibold">{Math.min(indiceFinal, totalItens)}</span> de{" "}
          <span className="font-semibold">{totalItens}</span> veículos
        </p>

        <div className="flex items-center gap-2">
          <span className={`text-sm ${colors.text.secondary}`}>Por página</span>
          <select
            value={itensPorPagina}
            onChange={(e) => onItensPorPaginaChange(Number(e.target.value))}
            className={`${selectClass} !w-auto !py-2 !px-3 text-sm`}
          >
            {OPCOES_POR_PAGINA.map((qtd) => (
              <option key={qtd} value={qtd}>
                {qtd}
              </option>
            ))}
          </select>
        </div>
      </div>

      {totalPaginas > 1 && (
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: paginaAtual === 1 ? 1 : 1.05 }}
            whileTap={{ scale: paginaAtual === 1 ? 1 : 0.95 }}
            onClick={() => onPaginaChange(Math.max(1, paginaAtual - 1))}
            disabled={paginaAtual === 1}
            className={botaoNav(paginaAtual === 1)}
            aria-label="Página anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </motion.button>

          <div className="flex gap-1">
            {paginas.map((pagina, idx, arr) => {
              const gap = idx > 0 && pagina - arr[idx - 1] > 1;
              return (
                <div key={pagina} className="flex items-center gap-1">
                  {gap && <span className={`px-1 ${colors.text.muted}`}>…</span>}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onPaginaChange(pagina)}
                    className={`h-10 min-w-[2.5rem] rounded-xl px-3 text-sm font-medium transition-all ${
                      paginaAtual === pagina
                        ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white"
                        : isDark
                          ? "bg-slate-700 text-slate-200 hover:bg-slate-600"
                          : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                    }`}
                  >
                    {pagina}
                  </motion.button>
                </div>
              );
            })}
          </div>

          <motion.button
            whileHover={{ scale: paginaAtual === totalPaginas ? 1 : 1.05 }}
            whileTap={{ scale: paginaAtual === totalPaginas ? 1 : 0.95 }}
            onClick={() => onPaginaChange(Math.min(totalPaginas, paginaAtual + 1))}
            disabled={paginaAtual === totalPaginas}
            className={botaoNav(paginaAtual === totalPaginas)}
            aria-label="Próxima página"
          >
            <ChevronRight className="h-4 w-4" />
          </motion.button>
        </div>
      )}
    </div>
  );
}
