"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Car,
  Check,
  Mail,
  MessageSquare,
  Phone,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";

import { useVeiculoTheme } from "@/app/(pages)/(internas)/veiculo-admin/_components/useVeiculoTheme";
import {
  atualizarLead,
  excluirLead,
  listarLeads,
  listarVendedores,
} from "@/services/crmService";
import type { Lead, StatusLead, Vendedor } from "@/types/crm";
import {
  ORIGEM_LEAD_LABELS,
  STATUS_LEAD_LABELS,
} from "@/types/crm";

import CrmShell from "../_components/CrmShell";

const STATUS_ORDEM: StatusLead[] = [
  "NOVO",
  "EM_NEGOCIACAO",
  "VISITA_AGENDADA",
  "FINANCIAMENTO",
  "VENDIDO",
  "PERDIDO",
];

const STATUS_CORES: Record<StatusLead, { dark: string; light: string }> = {
  NOVO: {
    dark: "border-blue-500/40 bg-blue-500/15 text-blue-300",
    light: "border-blue-300 bg-blue-50 text-blue-700",
  },
  EM_NEGOCIACAO: {
    dark: "border-yellow-500/40 bg-yellow-500/15 text-yellow-300",
    light: "border-yellow-300 bg-yellow-50 text-yellow-700",
  },
  VISITA_AGENDADA: {
    dark: "border-purple-500/40 bg-purple-500/15 text-purple-300",
    light: "border-purple-300 bg-purple-50 text-purple-700",
  },
  FINANCIAMENTO: {
    dark: "border-indigo-500/40 bg-indigo-500/15 text-indigo-300",
    light: "border-indigo-300 bg-indigo-50 text-indigo-700",
  },
  VENDIDO: {
    dark: "border-green-500/40 bg-green-500/15 text-green-300",
    light: "border-green-300 bg-green-50 text-green-700",
  },
  PERDIDO: {
    dark: "border-red-500/40 bg-red-500/15 text-red-300",
    light: "border-red-300 bg-red-50 text-red-700",
  },
};

function formatDataHora(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }) +
    " " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export default function LeadsPage() {
  const { isDark, mounted, colors, inputClass, selectClass } = useVeiculoTheme();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [excluirAlvo, setExcluirAlvo] = useState<Lead | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  const notificar = (tipo: "success" | "error", msg: string) => {
    if (tipo === "success") setSucesso(msg);
    else setErro(msg);
    setTimeout(() => (tipo === "success" ? setSucesso("") : setErro("")), 3500);
  };

  const carregar = async () => {
    setLoading(true);
    try {
      const [ls, vs] = await Promise.all([listarLeads(), listarVendedores(true)]);
      setLeads(ls);
      setVendedores(vs);
    } catch {
      setErro("Não foi possível carregar os leads.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const leadsFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return leads.filter((l) => {
      if (filtroStatus && l.status !== filtroStatus) return false;
      if (!termo) return true;
      const alvo = `${l.nome} ${l.email ?? ""} ${l.telefone ?? ""} ${l.veiculoDescricao ?? ""}`.toLowerCase();
      return alvo.includes(termo);
    });
  }, [leads, busca, filtroStatus]);

  const contagemPorStatus = useMemo(() => {
    const contagem: Partial<Record<StatusLead, number>> = {};
    leads.forEach((l) => {
      contagem[l.status] = (contagem[l.status] ?? 0) + 1;
    });
    return contagem;
  }, [leads]);

  const mudarStatus = async (lead: Lead, status: StatusLead) => {
    try {
      const atualizado = await atualizarLead(lead.id, { status });
      setLeads((prev) => prev.map((l) => (l.id === lead.id ? atualizado : l)));
      notificar("success", `Lead de ${lead.nome} movido para "${STATUS_LEAD_LABELS[status]}".`);
    } catch {
      notificar("error", "Não foi possível atualizar o status do lead.");
    }
  };

  const mudarVendedor = async (lead: Lead, vendedorId: number) => {
    try {
      const atualizado = await atualizarLead(lead.id, { vendedorId });
      setLeads((prev) => prev.map((l) => (l.id === lead.id ? atualizado : l)));
      notificar("success", "Vendedor responsável atualizado.");
    } catch {
      notificar("error", "Não foi possível atribuir o vendedor.");
    }
  };

  const confirmarExclusao = async () => {
    if (!excluirAlvo) return;
    setExcluindo(true);
    try {
      await excluirLead(excluirAlvo.id);
      setLeads((prev) => prev.filter((l) => l.id !== excluirAlvo.id));
      notificar("success", "Lead excluído.");
      setExcluirAlvo(null);
    } catch {
      notificar("error", "Não foi possível excluir o lead.");
    } finally {
      setExcluindo(false);
    }
  };

  const badgeStatus = (status: StatusLead) =>
    isDark ? STATUS_CORES[status].dark : STATUS_CORES[status].light;

  return (
    <CrmShell
      categoria="CRM de Vendas"
      titulo="Gestão de Leads"
      subtitulo="Todos os interessados que chegaram pelo site: WhatsApp, propostas, visitas e financiamento."
    >
      {/* Alertas */}
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

      {/* Resumo por status (clicável = filtro) */}
      <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {STATUS_ORDEM.map((status, i) => (
          <motion.button
            key={status}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 * i }}
            onClick={() => setFiltroStatus((prev) => (prev === status ? "" : status))}
            className={`rounded-2xl border p-4 text-left backdrop-blur transition-all ${
              filtroStatus === status
                ? "ring-2 ring-blue-500/60 " + badgeStatus(status)
                : badgeStatus(status)
            }`}
          >
            <p className="text-xs font-medium opacity-80">{STATUS_LEAD_LABELS[status]}</p>
            <p className="mt-1 text-2xl font-bold">{contagemPorStatus[status] ?? 0}</p>
          </motion.button>
        ))}
      </section>

      {/* Busca */}
      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className={`pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 ${colors.text.muted}`} />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Pesquisar por nome, contato ou veículo de interesse..."
            className={`${inputClass} !pl-12`}
          />
        </div>
        {filtroStatus && (
          <button
            onClick={() => setFiltroStatus("")}
            className={`inline-flex items-center gap-1 text-xs underline underline-offset-2 ${
              isDark ? "text-blue-400" : "text-blue-600"
            }`}
          >
            <X className="h-3.5 w-3.5" />
            Limpar filtro: {STATUS_LEAD_LABELS[filtroStatus as StatusLead]}
          </button>
        )}
      </div>

      {/* Lista */}
      <section className="mt-5">
        {loading || !mounted ? (
          <div className="space-y-3 animate-pulse">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-32 rounded-2xl bg-slate-300/20" />
            ))}
          </div>
        ) : leadsFiltrados.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-2xl border p-12 text-center backdrop-blur ${colors.card.border} ${colors.card.background}`}
          >
            <Users className={`mx-auto mb-4 h-12 w-12 ${colors.text.muted}`} />
            <h3 className="font-semibold">Nenhum lead encontrado</h3>
            <p className={`mt-1 text-sm ${colors.text.secondary}`}>
              {leads.length === 0
                ? "Quando alguém demonstrar interesse em um veículo no site, o lead aparece aqui automaticamente."
                : "Ajuste a busca ou o filtro de status."}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {leadsFiltrados.map((lead, i) => (
              <motion.div
                key={lead.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.05, 0.4) }}
                className={`rounded-2xl border p-4 backdrop-blur transition-colors ${colors.card.border} ${colors.card.background} ${colors.card.hover}`}
              >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
                  {/* Identificação */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{lead.nome}</span>
                      <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${badgeStatus(lead.status)}`}>
                        {STATUS_LEAD_LABELS[lead.status]}
                      </span>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] ${
                        isDark ? "bg-slate-800/80 text-slate-300" : "bg-slate-100 text-slate-600"
                      }`}>
                        <MessageSquare className="h-3 w-3" />
                        {ORIGEM_LEAD_LABELS[lead.origem]}
                      </span>
                    </div>

                    <div className={`mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs ${colors.text.secondary}`}>
                      {lead.telefone && (
                        <span className="inline-flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{lead.telefone}</span>
                      )}
                      {lead.email && (
                        <span className="inline-flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{lead.email}</span>
                      )}
                      <span>{formatDataHora(lead.dataCriacao)}</span>
                    </div>

                    {lead.veiculoDescricao && (
                      <p className={`mt-2 inline-flex items-center gap-1.5 text-sm font-medium ${
                        isDark ? "text-blue-300" : "text-blue-700"
                      }`}>
                        <Car className="h-4 w-4" />
                        Interesse: {lead.veiculoDescricao}
                      </p>
                    )}

                    {lead.mensagem && (
                      <p className={`mt-2 text-xs italic ${colors.text.muted}`}>“{lead.mensagem}”</p>
                    )}
                  </div>

                  {/* Ações */}
                  <div className="flex flex-shrink-0 flex-col gap-2 sm:flex-row xl:w-auto">
                    <select
                      value={lead.status}
                      onChange={(e) => mudarStatus(lead, e.target.value as StatusLead)}
                      className={`${selectClass} !w-auto !p-2.5 text-sm`}
                    >
                      {STATUS_ORDEM.map((s) => (
                        <option key={s} value={s}>{STATUS_LEAD_LABELS[s]}</option>
                      ))}
                    </select>

                    <select
                      value={lead.vendedorId ?? ""}
                      onChange={(e) => e.target.value && mudarVendedor(lead, Number(e.target.value))}
                      className={`${selectClass} !w-auto !p-2.5 text-sm`}
                    >
                      <option value="">Sem vendedor</option>
                      {vendedores.map((v) => (
                        <option key={v.id} value={v.id}>{v.nome}</option>
                      ))}
                    </select>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setExcluirAlvo(lead)}
                      className={`flex items-center justify-center rounded-xl p-2.5 transition-colors ${
                        isDark ? "text-red-400 hover:bg-red-500/15" : "text-red-500 hover:bg-red-50"
                      }`}
                      title="Excluir lead"
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
              <h3 className="text-lg font-semibold">Excluir lead</h3>
              <p className={`mt-2 text-sm ${colors.text.secondary}`}>
                Tem certeza que deseja excluir o lead de <b>{excluirAlvo.nome}</b>? Essa ação não pode ser desfeita.
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
