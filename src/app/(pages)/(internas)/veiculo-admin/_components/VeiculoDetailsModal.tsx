"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Minus, Pencil, X } from "lucide-react";
import type { Veiculo } from "@/types/veiculo";
import { useVeiculoTheme } from "./useVeiculoTheme";
import StatusBadge from "./StatusBadge";
import {
  cambioLabel,
  combustivelLabel,
  formatBRL,
  formatData,
  formatKm,
} from "./veiculo.utils";

interface VeiculoDetailsModalProps {
  aberto: boolean;
  veiculo: Veiculo | null;
  onFechar: () => void;
  onEditar: (veiculo: Veiculo) => void;
}

/** Modal somente-leitura com todos os atributos do veículo. */
export default function VeiculoDetailsModal({
  aberto,
  veiculo,
  onFechar,
  onEditar,
}: VeiculoDetailsModalProps) {
  const { isDark, colors } = useVeiculoTheme();

  const Campo = ({ label, valor }: { label: string; valor?: React.ReactNode }) => (
    <div className={`rounded-xl p-3 ${isDark ? "bg-slate-800/50" : "bg-slate-50/80"}`}>
      <p className={`text-xs ${colors.text.secondary}`}>{label}</p>
      <p className="mt-0.5 font-medium">{valor ?? "—"}</p>
    </div>
  );

  const Booleano = ({ label, valor }: { label: string; valor?: boolean }) => (
    <div
      className={`flex items-center gap-2 rounded-xl p-3 text-sm ${
        isDark ? "bg-slate-800/50" : "bg-slate-50/80"
      }`}
    >
      {valor ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <Minus className={`h-4 w-4 ${colors.text.muted}`} />
      )}
      <span className={valor ? "font-medium" : colors.text.secondary}>{label}</span>
    </div>
  );

  return (
    <AnimatePresence>
      {aberto && veiculo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={onFechar}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className={`max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl border shadow-2xl backdrop-blur ${
              isDark ? "border-blue-500/30 bg-slate-900/90" : "border-blue-400/30 bg-white/95"
            }`}
          >
            <div className="flex items-start justify-between bg-gradient-to-r from-blue-700 to-blue-600 p-6 text-white">
              <div>
                <h2 className="text-xl font-bold">
                  {veiculo.marca} {veiculo.modelo}
                </h2>
                <p className="mt-1 text-sm text-blue-100">
                  {veiculo.versao} • {veiculo.anoFabricacao}/{veiculo.anoModelo}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onFechar}
                className="text-white/90 transition-colors hover:text-white"
                aria-label="Fechar"
              >
                <X className="h-6 w-6" />
              </motion.button>
            </div>

            <div className="max-h-[calc(90vh-160px)] overflow-y-auto p-6">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <StatusBadge status={veiculo.status as string} size="md" />
                <span className={`text-2xl font-bold ${isDark ? "text-blue-400" : "text-blue-600"}`}>
                  {formatBRL(veiculo.valor)}
                </span>
                {veiculo.valorFipe ? (
                  <span className={`text-sm ${colors.text.secondary}`}>
                    FIPE {formatBRL(veiculo.valorFipe)}
                  </span>
                ) : null}
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                <Campo label="Placa" valor={veiculo.placa || "—"} />
                <Campo label="Renavam" valor={veiculo.renavam} />
                <Campo label="Chassi" valor={veiculo.chassi} />
                <Campo label="Cor" valor={veiculo.cor} />
                <Campo label="Categoria" valor={veiculo.categoria} />
                <Campo label="Combustível" valor={combustivelLabel(veiculo.combustivel as string)} />
                <Campo label="Câmbio" valor={cambioLabel(veiculo.cambio as string)} />
                <Campo label="Motor" valor={veiculo.motor} />
                <Campo label="Potência" valor={veiculo.potencia} />
                <Campo label="Portas" valor={veiculo.portas} />
                <Campo label="Quilometragem" valor={formatKm(veiculo.quilometragem)} />
                <Campo label="Cidade" valor={veiculo.cidade} />
                <Campo label="Estado" valor={veiculo.estado} />
                <Campo label="Cadastro" valor={formatData(veiculo.dataCadastro)} />
                <Campo label="Atualização" valor={formatData(veiculo.dataAtualizacao)} />
              </div>

              {veiculo.descricao ? (
                <div className="mt-4">
                  <p className={`mb-1.5 text-sm font-medium ${colors.text.secondary}`}>Descrição</p>
                  <p
                    className={`rounded-xl p-4 text-sm leading-relaxed ${
                      isDark ? "bg-slate-800/50" : "bg-slate-50/80"
                    }`}
                  >
                    {veiculo.descricao}
                  </p>
                </div>
              ) : null}

              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                <Booleano label="Aceita troca" valor={veiculo.aceitaTroca} />
                <Booleano label="Blindado" valor={veiculo.blindado} />
                <Booleano label="Único dono" valor={veiculo.unicoDono} />
                <Booleano label="IPVA pago" valor={veiculo.ipvaPago} />
                <Booleano label="Licenciado" valor={veiculo.licenciado} />
                <Booleano label="Revisado" valor={veiculo.revisado} />
                <Booleano label="Garantia" valor={veiculo.garantia} />
                <Booleano label="Destaque" valor={veiculo.destaque} />
              </div>
            </div>

            <div
              className={`flex justify-end gap-3 border-t p-5 ${
                isDark ? "border-slate-800/60" : "border-slate-200/70"
              }`}
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onFechar}
                className={`rounded-xl px-6 py-3 font-medium transition-all ${
                  isDark
                    ? "bg-slate-700 text-slate-200 hover:bg-slate-600"
                    : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                }`}
              >
                Fechar
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onEditar(veiculo)}
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 font-medium text-white transition-all hover:from-blue-700 hover:to-blue-800"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Editar veículo
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
