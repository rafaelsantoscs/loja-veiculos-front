"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Filter, RotateCcw, SlidersHorizontal, Check } from "lucide-react";
import type { VeiculoFiltros } from "@/types/veiculo";
import { useVeiculoTheme } from "./useVeiculoTheme";
import {
  CATEGORIA_OPTIONS,
  COMBUSTIVEL_LABELS,
  CAMBIO_LABELS,
  STATUS_LABELS,
  STATUS_OPTIONS,
} from "./veiculo.utils";

interface VeiculoFiltersProps {
  filtros: VeiculoFiltros;
  marcas: string[];
  cidades: string[];
  aberto: boolean;
  onToggle: () => void;
  onChange: (name: keyof VeiculoFiltros, value: string) => void;
  onAplicar: () => void;
  onLimpar: () => void;
}

/** Painel de filtros avançados do estoque. */
export default function VeiculoFilters({
  filtros,
  marcas,
  cidades,
  aberto,
  onToggle,
  onChange,
  onAplicar,
  onLimpar,
}: VeiculoFiltersProps) {
  const { isDark, colors, inputClass, selectClass } = useVeiculoTheme();

  const labelClass = `mb-1.5 block text-sm font-medium ${colors.text.secondary}`;

  const field = (
    label: string,
    node: React.ReactNode,
  ) => (
    <div>
      <label className={labelClass}>{label}</label>
      {node}
    </div>
  );

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className={`rounded-2xl border ${colors.card.border} ${colors.card.background} ${colors.card.shadow} backdrop-blur`}
    >
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 p-5"
      >
        <div className="flex items-center gap-3">
          <div
            className={`rounded-xl p-2.5 ${
              isDark ? "bg-blue-500/15 ring-1 ring-blue-400/30" : "bg-blue-500/10 ring-1 ring-blue-400/20"
            }`}
          >
            <Filter className={`h-5 w-5 ${isDark ? "text-blue-400" : "text-blue-500"}`} />
          </div>
          <div className="text-left">
            <h3 className="text-base font-semibold">Filtros avançados</h3>
            <p className={`text-xs ${colors.text.secondary}`}>
              Refine o estoque por marca, ano, categoria, preço e mais
            </p>
          </div>
        </div>
        <motion.div animate={{ rotate: aberto ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <SlidersHorizontal className={`h-5 w-5 ${colors.text.secondary}`} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {aberto && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {field(
                  "Marca",
                  <select
                    value={filtros.marca}
                    onChange={(e) => onChange("marca", e.target.value)}
                    className={selectClass}
                  >
                    <option value="">Todas</option>
                    {marcas.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>,
                )}

                {field(
                  "Modelo",
                  <input
                    type="text"
                    value={filtros.modelo}
                    onChange={(e) => onChange("modelo", e.target.value)}
                    placeholder="Ex: Corolla"
                    className={inputClass}
                  />,
                )}

                {field(
                  "Ano",
                  <input
                    type="number"
                    value={filtros.ano}
                    onChange={(e) => onChange("ano", e.target.value)}
                    placeholder="Ex: 2022"
                    min={1900}
                    max={new Date().getFullYear() + 1}
                    className={inputClass}
                  />,
                )}

                {field(
                  "Categoria",
                  <select
                    value={filtros.categoria}
                    onChange={(e) => onChange("categoria", e.target.value)}
                    className={selectClass}
                  >
                    <option value="">Todas</option>
                    {CATEGORIA_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>,
                )}

                {field(
                  "Combustível",
                  <select
                    value={filtros.combustivel}
                    onChange={(e) => onChange("combustivel", e.target.value)}
                    className={selectClass}
                  >
                    <option value="">Todos</option>
                    {Object.entries(COMBUSTIVEL_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>,
                )}

                {field(
                  "Câmbio",
                  <select
                    value={filtros.cambio}
                    onChange={(e) => onChange("cambio", e.target.value)}
                    className={selectClass}
                  >
                    <option value="">Todos</option>
                    {Object.entries(CAMBIO_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>,
                )}

                {field(
                  "Cidade",
                  <select
                    value={filtros.cidade}
                    onChange={(e) => onChange("cidade", e.target.value)}
                    className={selectClass}
                  >
                    <option value="">Todas</option>
                    {cidades.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>,
                )}

                {field(
                  "Status",
                  <select
                    value={filtros.status}
                    onChange={(e) => onChange("status", e.target.value)}
                    className={selectClass}
                  >
                    <option value="">Todos</option>
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>,
                )}

                {field(
                  "Destaque",
                  <select
                    value={filtros.destaque}
                    onChange={(e) => onChange("destaque", e.target.value)}
                    className={selectClass}
                  >
                    <option value="">Todos</option>
                    <option value="true">Somente destaques</option>
                    <option value="false">Sem destaque</option>
                  </select>,
                )}

                {field(
                  "Preço inicial",
                  <input
                    type="number"
                    value={filtros.precoInicial}
                    onChange={(e) => onChange("precoInicial", e.target.value)}
                    placeholder="R$ mínimo"
                    min={0}
                    className={inputClass}
                  />,
                )}

                {field(
                  "Preço final",
                  <input
                    type="number"
                    value={filtros.precoFinal}
                    onChange={(e) => onChange("precoFinal", e.target.value)}
                    placeholder="R$ máximo"
                    min={0}
                    className={inputClass}
                  />,
                )}
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onLimpar}
                  className={`inline-flex items-center justify-center rounded-2xl px-6 py-3 font-medium transition-all ${
                    isDark
                      ? "bg-slate-700 text-slate-200 hover:bg-slate-600"
                      : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                  }`}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Limpar
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onAplicar}
                  className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 font-medium text-white transition-all hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <Check className="mr-2 h-4 w-4" />
                  Aplicar filtros
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
