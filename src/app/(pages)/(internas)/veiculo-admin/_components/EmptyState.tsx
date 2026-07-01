"use client";

import { motion } from "framer-motion";
import { CarFront, PlusCircle, SearchX } from "lucide-react";
import { useVeiculoTheme } from "./useVeiculoTheme";

interface EmptyStateProps {
  /** Quando true, indica que o vazio é resultado de filtros aplicados. */
  filtrado?: boolean;
  onCadastrar: () => void;
  onLimparFiltros?: () => void;
}

/** Estado vazio ilustrado para a listagem de veículos. */
export default function EmptyState({
  filtrado = false,
  onCadastrar,
  onLimparFiltros,
}: EmptyStateProps) {
  const { isDark, colors } = useVeiculoTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center px-6 py-16 text-center"
    >
      <div
        className={`relative mb-6 flex h-28 w-28 items-center justify-center rounded-full ${
          isDark ? "bg-blue-500/10 ring-1 ring-blue-400/20" : "bg-blue-50 ring-1 ring-blue-100"
        }`}
      >
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        >
          {filtrado ? (
            <SearchX className={`h-12 w-12 ${isDark ? "text-blue-400" : "text-blue-500"}`} />
          ) : (
            <CarFront className={`h-12 w-12 ${isDark ? "text-blue-400" : "text-blue-500"}`} />
          )}
        </motion.div>
      </div>

      <h3 className={`mb-1 text-lg font-semibold ${colors.text.primary}`}>
        {filtrado ? "Nenhum veículo encontrado" : "Nenhum veículo cadastrado"}
      </h3>
      <p className={`mb-6 max-w-sm text-sm ${colors.text.secondary}`}>
        {filtrado
          ? "Não encontramos veículos com os filtros selecionados. Ajuste a busca e tente novamente."
          : "Comece a montar seu estoque cadastrando o primeiro veículo da loja."}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {filtrado && onLimparFiltros && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onLimparFiltros}
            className={`rounded-2xl px-6 py-3 font-medium transition-all ${
              isDark
                ? "bg-slate-700 text-slate-200 hover:bg-slate-600"
                : "bg-slate-200 text-slate-700 hover:bg-slate-300"
            }`}
          >
            Limpar filtros
          </motion.button>
        )}
        {!filtrado && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCadastrar}
            className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 font-medium text-white transition-all hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <PlusCircle className="mr-2 h-5 w-5" />
            Cadastrar primeiro veículo
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
