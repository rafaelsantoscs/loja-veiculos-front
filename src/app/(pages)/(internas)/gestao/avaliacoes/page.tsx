"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Camera,
  Check,
  ClipboardCheck,
  Gauge,
  Mail,
  Phone,
  Trash2,
  X,
} from "lucide-react";

import { useVeiculoTheme } from "@/app/(pages)/(internas)/veiculo-admin/_components/useVeiculoTheme";
import { formatBRL, formatKm } from "@/app/(pages)/(internas)/veiculo-admin/_components/veiculo.utils";
import {
  atualizarStatusAvaliacao,
  excluirAvaliacao,
  listarAvaliacoes,
} from "@/services/crmService";
import type { Avaliacao, StatusAvaliacao } from "@/types/crm";
import { STATUS_AVALIACAO_LABELS } from "@/types/crm";

import CrmShell from "../../crm/_components/CrmShell";

const STATUS_ORDEM: StatusAvaliacao[] = [
  "PENDENTE",
  "EM_ANALISE",
  "PROPOSTA_ENVIADA",
  "ACEITA",
  "RECUSADA",
];

const STATUS_CORES: Record<StatusAvaliacao, { dark: string; light: string }> = {
  PENDENTE: {
    dark: "border-yellow-500/40 bg-yellow-500/15 text-yellow-300",
    light: "border-yellow-300 bg-yellow-50 text-yellow-700",
  },
  EM_ANALISE: {
    dark: "border-blue-500/40 bg-blue-500/15 text-blue-300",
    light: "border-blue-300 bg-blue-50 text-blue-700",
  },
  PROPOSTA_ENVIADA: {
    dark: "border-purple-500/40 bg-purple-500/15 text-purple-300",
    light: "border-purple-300 bg-purple-50 text-purple-700",
  },
  ACEITA: {
    dark: "border-green-500/40 bg-green-500/15 text-green-300",
    light: "border-green-300 bg-green-50 text-green-700",
  },
  RECUSADA: {
    dark: "border-red-500/40 bg-red-500/15 text-red-300",
    light: "border-red-300 bg-red-50 text-red-700",
  },
};

function formatDataHora(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR") + " " +
    d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export default function AvaliacoesAdminPage() {
  const { isDark, mounted, colors, selectClass } = useVeiculoTheme();

  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [fotoAberta, setFotoAberta] = useState<string | null>(null);
  const [excluirAlvo, setExcluirAlvo] = useState<Avaliacao | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState("");

  const notificar = (tipo: "success" | "error", msg: string) => {
    if (tipo === "success") setSucesso(msg);
    else setErro(msg);
    setTimeout(() => (tipo === "success" ? setSucesso("") : setErro("")), 3500);
  };

  useEffect(() => {
    listarAvaliacoes()
      .then(setAvaliacoes)
      .catch(() => setErro("Não foi possível carregar as avaliações."))
      .finally(() => setLoading(false));
  }, []);

  const filtradas = useMemo(
    () => avaliacoes.filter((a) => !filtroStatus || a.status === filtroStatus),
    [avaliacoes, filtroStatus],
  );

  const mudarStatus = async (avaliacao: Avaliacao, status: StatusAvaliacao) => {
    try {
      const atualizada = await atualizarStatusAvaliacao(avaliacao.id, status);
      setAvaliacoes((prev) => prev.map((a) => (a.id === avaliacao.id ? atualizada : a)));
      notificar("success", `Avaliação marcada como "${STATUS_AVALIACAO_LABELS[status]}".`);
    } catch {
      notificar("error", "Não foi possível atualizar o status.");
    }
  };

  const confirmarExclusao = async () => {
    if (!excluirAlvo) return;
    setExcluindo(true);
    try {
      await excluirAvaliacao(excluirAlvo.id);
      setAvaliacoes((prev) => prev.filter((a) => a.id !== excluirAlvo.id));
      notificar("success", "Avaliação excluída.");
      setExcluirAlvo(null);
    } catch {
      notificar("error", "Não foi possível excluir a avaliação.");
    } finally {
      setExcluindo(false);
    }
  };

  const badgeStatus = (status: StatusAvaliacao) =>
    isDark ? STATUS_CORES[status].dark : STATUS_CORES[status].light;

  return (
    <CrmShell
      categoria="Gestão da Loja"
      titulo="Avaliações de Usados"
      subtitulo="Carros enviados pelos clientes para a loja avaliar e fazer proposta."
    >
      <AnimatePresence>
        {(erro || sucesso) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4"
          >
            <div className={`flex items-center gap-3 rounded-2xl border p-4 backdrop-blur ${
              erro
                ? isDark ? "border-red-500/30 bg-red-500/10 text-red-300" : "border-red-400/30 bg-red-100/80 text-red-700"
                : isDark ? "border-green-500/30 bg-green-500/10 text-green-300" : "border-green-400/30 bg-green-100/80 text-green-700"
            }`}>
              {erro ? <AlertTriangle className="h-5 w-5 flex-shrink-0" /> : <Check className="h-5 w-5 flex-shrink-0" />}
              <span className="text-sm">{erro || sucesso}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filtro por status */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setFiltroStatus("")}
          className={`rounded-xl border px-3.5 py-1.5 text-xs font-semibold transition-all ${
            filtroStatus === ""
              ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white border-transparent"
              : `${colors.card.border} ${colors.card.background} ${colors.text.secondary}`
          }`}
        >
          Todas ({avaliacoes.length})
        </button>
        {STATUS_ORDEM.map((s) => (
          <button
            key={s}
            onClick={() => setFiltroStatus((prev) => (prev === s ? "" : s))}
            className={`rounded-xl border px-3.5 py-1.5 text-xs font-semibold transition-all ${
              filtroStatus === s ? "ring-2 ring-blue-500/60 " + badgeStatus(s) : badgeStatus(s)
            }`}
          >
            {STATUS_AVALIACAO_LABELS[s]} ({avaliacoes.filter((a) => a.status === s).length})
          </button>
        ))}
      </div>

      {/* Lista */}
      <section className="mt-5">
        {loading || !mounted ? (
          <div className="space-y-3 animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-44 rounded-2xl bg-slate-300/20" />
            ))}
          </div>
        ) : filtradas.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-2xl border p-12 text-center backdrop-blur ${colors.card.border} ${colors.card.background}`}
          >
            <ClipboardCheck className={`mx-auto mb-4 h-12 w-12 ${colors.text.muted}`} />
            <h3 className="font-semibold">Nenhuma avaliação recebida</h3>
            <p className={`mt-1 text-sm ${colors.text.secondary}`}>
              Quando um cliente enviar o carro dele pela página &quot;Venda seu carro&quot;, aparece aqui.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filtradas.map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.06, 0.4) }}
                className={`rounded-2xl border p-5 backdrop-blur ${colors.card.border} ${colors.card.background}`}
              >
                <div className="flex flex-col gap-4 lg:flex-row">
                  {/* Fotos */}
                  <div className="flex gap-2 overflow-x-auto lg:w-72 lg:flex-shrink-0 lg:flex-wrap">
                    {a.fotos.length === 0 ? (
                      <div className={`flex h-24 w-32 flex-shrink-0 items-center justify-center rounded-xl border ${colors.card.border} ${
                        isDark ? "bg-slate-800/40" : "bg-slate-100"
                      }`}>
                        <Camera className={`h-6 w-6 ${colors.text.muted}`} />
                      </div>
                    ) : (
                      a.fotos.slice(0, 4).map((url, fi) => (
                        <button
                          key={url}
                          onClick={() => setFotoAberta(url)}
                          className="relative h-24 w-32 flex-shrink-0 overflow-hidden rounded-xl border border-black/10 transition-transform hover:scale-[1.03]"
                        >
                          <img src={url} alt={`Foto ${fi + 1}`} className="h-full w-full object-cover" />
                          {fi === 3 && a.fotos.length > 4 && (
                            <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-sm font-bold text-white">
                              +{a.fotos.length - 4}
                            </span>
                          )}
                        </button>
                      ))
                    )}
                  </div>

                  {/* Informações */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold">
                        {a.marca} {a.modelo} {a.versao ?? ""} {a.anoModelo ?? ""}
                      </h3>
                      <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${badgeStatus(a.status)}`}>
                        {STATUS_AVALIACAO_LABELS[a.status]}
                      </span>
                    </div>

                    <div className={`mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs ${colors.text.secondary}`}>
                      <span className="font-medium">{a.nome}</span>
                      {a.telefone && (
                        <span className="inline-flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{a.telefone}</span>
                      )}
                      {a.email && (
                        <span className="inline-flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{a.email}</span>
                      )}
                      <span>{formatDataHora(a.dataEnvio)}</span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                      {a.quilometragem != null && (
                        <span className="inline-flex items-center gap-1.5">
                          <Gauge className={`h-4 w-4 ${colors.text.muted}`} />
                          {formatKm(a.quilometragem)}
                        </span>
                      )}
                      {a.valorPretendido != null && (
                        <span className={`font-semibold ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
                          Pretende: {formatBRL(a.valorPretendido)}
                        </span>
                      )}
                    </div>

                    {a.descricao && (
                      <p className={`mt-2 text-xs italic ${colors.text.muted}`}>“{a.descricao}”</p>
                    )}
                  </div>

                  {/* Ações */}
                  <div className="flex flex-shrink-0 items-start gap-2">
                    <select
                      value={a.status}
                      onChange={(e) => mudarStatus(a, e.target.value as StatusAvaliacao)}
                      className={`${selectClass} !w-auto !p-2.5 text-sm`}
                    >
                      {STATUS_ORDEM.map((s) => (
                        <option key={s} value={s}>{STATUS_AVALIACAO_LABELS[s]}</option>
                      ))}
                    </select>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setExcluirAlvo(a)}
                      className={`rounded-xl p-2.5 transition-colors ${
                        isDark ? "text-red-400 hover:bg-red-500/15" : "text-red-500 hover:bg-red-50"
                      }`}
                      title="Excluir avaliação"
                    >
                      <Trash2 className="h-4 w-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Lightbox de foto */}
      <AnimatePresence>
        {fotoAberta && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4"
            onClick={() => setFotoAberta(null)}
          >
            <button
              onClick={() => setFotoAberta(null)}
              className="absolute top-5 right-5 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <motion.img
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              src={fotoAberta}
              alt="Foto da avaliação"
              className="max-h-[88vh] max-w-[90vw] rounded-xl object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de exclusão */}
      <AnimatePresence>
        {excluirAlvo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => !excluindo && setExcluirAlvo(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-md rounded-2xl border p-6 backdrop-blur ${
                isDark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"
              }`}
            >
              <h3 className="text-lg font-semibold">Excluir avaliação</h3>
              <p className={`mt-2 text-sm ${colors.text.secondary}`}>
                Excluir a avaliação do <b>{excluirAlvo.marca} {excluirAlvo.modelo}</b> enviada por{" "}
                <b>{excluirAlvo.nome}</b>?
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setExcluirAlvo(null)}
                  disabled={excluindo}
                  className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                    isDark ? "bg-slate-700 hover:bg-slate-600 text-slate-200" : "bg-slate-200 hover:bg-slate-300 text-slate-700"
                  }`}
                >
                  Cancelar
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={confirmarExclusao}
                  disabled={excluindo}
                  className="flex-1 rounded-xl bg-gradient-to-r from-red-600 to-red-700 px-4 py-2.5 text-sm font-medium text-white transition-all hover:from-red-700 hover:to-red-800 disabled:opacity-60"
                >
                  {excluindo ? "Excluindo..." : "Excluir"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </CrmShell>
  );
}
