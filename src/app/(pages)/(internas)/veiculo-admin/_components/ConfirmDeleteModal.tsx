"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Trash2, X } from "lucide-react";
import type { Veiculo } from "@/types/veiculo";
import { useVeiculoTheme } from "./useVeiculoTheme";

interface ConfirmDeleteModalProps {
  aberto: boolean;
  veiculo: Veiculo | null;
  carregando?: boolean;
  onCancelar: () => void;
  onConfirmar: () => void;
}

/** Modal de confirmação de exclusão de veículo. */
export default function ConfirmDeleteModal({
  aberto,
  veiculo,
  carregando = false,
  onCancelar,
  onConfirmar,
}: ConfirmDeleteModalProps) {
  const { isDark, colors } = useVeiculoTheme();

  return (
    <AnimatePresence>
      {aberto && veiculo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={onCancelar}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-md overflow-hidden rounded-2xl border shadow-2xl backdrop-blur ${
              isDark ? "border-red-500/30 bg-slate-900/90" : "border-red-400/30 bg-white/95"
            }`}
          >
            <div className="flex items-start justify-between bg-gradient-to-r from-red-600 to-red-700 p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-white/20 p-2.5">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Excluir veículo</h2>
                  <p className="text-sm text-red-100">Esta ação não pode ser desfeita</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onCancelar}
                className="text-white/90 transition-colors hover:text-white"
                aria-label="Fechar"
              >
                <X className="h-6 w-6" />
              </motion.button>
            </div>

            <div className="p-6">
              <p className={`text-sm ${colors.text.secondary}`}>
                Tem certeza que deseja excluir o veículo abaixo? Todos os dados e fotos
                associados serão removidos permanentemente.
              </p>

              <div
                className={`mt-4 rounded-xl border p-4 ${
                  isDark ? "border-slate-800/60 bg-slate-800/40" : "border-slate-200 bg-slate-50"
                }`}
              >
                <p className="font-semibold">
                  {veiculo.marca} {veiculo.modelo}{" "}
                  <span className={colors.text.secondary}>{veiculo.versao}</span>
                </p>
                <p className={`mt-1 text-sm ${colors.text.secondary}`}>
                  {veiculo.anoFabricacao}/{veiculo.anoModelo}
                  {veiculo.placa ? ` • ${veiculo.placa}` : ""}
                </p>
              </div>

              <div className="mt-6 flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onCancelar}
                  className={`flex-1 rounded-xl px-6 py-3 font-medium transition-all ${
                    isDark
                      ? "bg-slate-700 text-slate-200 hover:bg-slate-600"
                      : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                  }`}
                >
                  Cancelar
                </motion.button>
                <motion.button
                  whileHover={{ scale: carregando ? 1 : 1.02 }}
                  whileTap={{ scale: carregando ? 1 : 0.98 }}
                  onClick={onConfirmar}
                  disabled={carregando}
                  className={`flex flex-1 items-center justify-center rounded-xl bg-gradient-to-r from-red-600 to-red-700 px-6 py-3 font-medium text-white transition-all hover:from-red-700 hover:to-red-800 ${
                    carregando ? "cursor-not-allowed opacity-70" : ""
                  }`}
                >
                  {carregando ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
