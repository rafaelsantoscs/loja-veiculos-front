"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Clock,
  Eye,
  Lightbulb,
  MessageSquare,
  Package,
  Sparkles,
  Trophy,
} from "lucide-react";

import { useVeiculoTheme } from "@/app/(pages)/(internas)/veiculo-admin/_components/useVeiculoTheme";
import { formatBRL, formatData } from "@/app/(pages)/(internas)/veiculo-admin/_components/veiculo.utils";
import { getEstoqueAnalitico, getRelatorioGiro } from "@/services/crmService";
import type { EstoqueAnalitico, RelatorioGiro } from "@/types/crm";

import CrmShell from "../_components/CrmShell";

const STATUS_ESTOQUE_LABELS: Record<string, string> = {
  DISPONIVEL: "Disponível",
  RESERVADO: "Reservado",
  VENDIDO: "Vendido",
  INATIVO: "Inativo",
};

export default function RelatoriosPage() {
  const { isDark, mounted, colors } = useVeiculoTheme();

  const [estoque, setEstoque] = useState<EstoqueAnalitico[]>([]);
  const [giro, setGiro] = useState<RelatorioGiro | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [e, g] = await Promise.all([getEstoqueAnalitico(), getRelatorioGiro()]);
        setEstoque(e);
        setGiro(g);
      } catch {
        setErro("Não foi possível carregar os relatórios.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const emEstoque = useMemo(
    () => estoque.filter((v) => v.status !== "VENDIDO" && v.status !== "INATIVO"),
    [estoque],
  );

  const encalhados = useMemo(
    () =>
      emEstoque
        .filter((v) => (v.diasEmEstoque ?? 0) >= 60)
        .sort((a, b) => (b.diasEmEstoque ?? 0) - (a.diasEmEstoque ?? 0)),
    [emEstoque],
  );

  const comSugestao = useMemo(
    () => emEstoque.filter((v) => v.sugestao),
    [emEstoque],
  );

  const maisInteresse = useMemo(
    () =>
      [...estoque]
        .sort((a, b) => (b.visualizacoes ?? 0) - (a.visualizacoes ?? 0))
        .slice(0, 10),
    [estoque],
  );

  const cardClass = `rounded-2xl border p-5 shadow-sm backdrop-blur ${colors.card.border} ${colors.card.background}`;

  const badgeStatus = (status: string) => {
    const estilos: Record<string, string> = {
      DISPONIVEL: isDark ? "bg-green-500/15 text-green-300 ring-green-400/30" : "bg-green-100 text-green-700 ring-green-300",
      RESERVADO: isDark ? "bg-yellow-500/15 text-yellow-300 ring-yellow-400/30" : "bg-yellow-100 text-yellow-700 ring-yellow-300",
      VENDIDO: isDark ? "bg-blue-500/15 text-blue-300 ring-blue-400/30" : "bg-blue-100 text-blue-700 ring-blue-300",
      INATIVO: isDark ? "bg-slate-500/15 text-slate-300 ring-slate-400/30" : "bg-slate-100 text-slate-600 ring-slate-300",
    };
    return `inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${
      estilos[status] ?? estilos.INATIVO
    }`;
  };

  const diasBadge = (dias?: number) => {
    if (dias == null) return null;
    const critico = dias >= 90;
    const atencao = dias >= 60;
    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${
        critico
          ? isDark ? "bg-red-500/15 text-red-300 ring-red-400/30" : "bg-red-100 text-red-700 ring-red-300"
          : atencao
            ? isDark ? "bg-orange-500/15 text-orange-300 ring-orange-400/30" : "bg-orange-100 text-orange-700 ring-orange-300"
            : isDark ? "bg-slate-500/15 text-slate-300 ring-slate-400/30" : "bg-slate-100 text-slate-600 ring-slate-300"
      }`}>
        <Clock className="h-3 w-3" />
        {dias} dias
      </span>
    );
  };

  if (loading || !mounted) {
    return (
      <CrmShell categoria="Premium" titulo="Relatórios" subtitulo="Carregando análises...">
        <div className="mt-6 space-y-4 animate-pulse">
          <div className="h-28 rounded-2xl bg-slate-300/20" />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="h-80 rounded-2xl bg-slate-300/20" />
            <div className="h-80 rounded-2xl bg-slate-300/20" />
          </div>
        </div>
      </CrmShell>
    );
  }

  return (
    <CrmShell
      categoria="Premium"
      titulo="Relatórios Inteligentes"
      subtitulo="Histórico de interesse, tempo em estoque, precificação inteligente e relatório de giro."
    >
      {erro && (
        <div className={`mt-4 rounded-2xl border p-4 text-sm ${
          isDark ? "border-red-500/30 bg-red-500/10 text-red-300" : "border-red-400/30 bg-red-100/80 text-red-700"
        }`}>
          {erro}
        </div>
      )}

      {/* Indicadores rápidos */}
      <section className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -4 }}
          className={`rounded-2xl border p-5 shadow-sm backdrop-blur transition-all hover:shadow-xl ${
            isDark ? "border-blue-500/30 bg-blue-500/10" : "border-blue-400/30 bg-blue-50/80"
          }`}
        >
          <div className="flex items-center gap-2">
            <Clock className={`h-5 w-5 ${isDark ? "text-blue-400" : "text-blue-600"}`} />
            <p className={`text-sm ${colors.text.secondary}`}>Tempo médio em estoque</p>
          </div>
          <p className="mt-2 text-2xl font-bold">
            {giro?.tempoMedioEstoqueDias ?? 0} dias
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          whileHover={{ y: -4 }}
          className={`rounded-2xl border p-5 shadow-sm backdrop-blur transition-all hover:shadow-xl ${
            isDark ? "border-orange-500/30 bg-orange-500/10" : "border-orange-400/30 bg-orange-50/80"
          }`}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className={`h-5 w-5 ${isDark ? "text-orange-400" : "text-orange-600"}`} />
            <p className={`text-sm ${colors.text.secondary}`}>Veículos encalhados (60+ dias)</p>
          </div>
          <p className="mt-2 text-2xl font-bold">{encalhados.length}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          whileHover={{ y: -4 }}
          className={`rounded-2xl border p-5 shadow-sm backdrop-blur transition-all hover:shadow-xl ${
            isDark ? "border-purple-500/30 bg-purple-500/10" : "border-purple-400/30 bg-purple-50/80"
          }`}
        >
          <div className="flex items-center gap-2">
            <Lightbulb className={`h-5 w-5 ${isDark ? "text-purple-400" : "text-purple-600"}`} />
            <p className={`text-sm ${colors.text.secondary}`}>Sugestões de precificação</p>
          </div>
          <p className="mt-2 text-2xl font-bold">{comSugestao.length}</p>
        </motion.div>
      </section>

      {/* Precificação inteligente */}
      {comSugestao.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6"
        >
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className={`h-5 w-5 ${isDark ? "text-purple-400" : "text-purple-600"}`} />
            <h2 className="text-lg font-semibold">Precificação Inteligente</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {comSugestao.map((v, i) => (
              <motion.div
                key={v.veiculoId}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + i * 0.05 }}
                className={`rounded-2xl border p-5 backdrop-blur ${
                  isDark ? "border-purple-500/30 bg-purple-500/5" : "border-purple-300/60 bg-purple-50/60"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold">{v.descricao}</p>
                  {diasBadge(v.diasEmEstoque)}
                </div>
                <p className={`mt-2 text-sm ${colors.text.secondary}`}>{v.sugestao}</p>
                <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
                  <span>
                    Preço atual:{" "}
                    <b className={isDark ? "text-slate-200" : "text-slate-800"}>{formatBRL(v.precoVenda)}</b>
                  </span>
                  {v.precoSugerido != null && (
                    <span>
                      Sugerido:{" "}
                      <b className={isDark ? "text-purple-300" : "text-purple-700"}>{formatBRL(v.precoSugerido)}</b>
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Histórico de interesse + tempo em estoque */}
      <section className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Interesse */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={cardClass}
        >
          <div className="mb-4 flex items-center gap-2">
            <Eye className={`h-5 w-5 ${isDark ? "text-blue-400" : "text-blue-600"}`} />
            <h2 className="font-semibold">Histórico de Interesse</h2>
          </div>
          {maisInteresse.length === 0 ? (
            <p className={`py-8 text-center text-sm ${colors.text.muted}`}>Sem dados de interesse ainda.</p>
          ) : (
            <div className="space-y-2.5">
              {maisInteresse.map((v) => (
                <div
                  key={v.veiculoId}
                  className={`flex items-center gap-3 rounded-xl border p-3 ${colors.card.border} ${
                    isDark ? "bg-slate-800/40" : "bg-slate-50/80"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-medium">{v.descricao}</p>
                      <span className={badgeStatus(v.status)}>
                        {STATUS_ESTOQUE_LABELS[v.status] ?? v.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-4 text-xs">
                    <span className="inline-flex items-center gap-1" title="Visualizações">
                      <Eye className={`h-3.5 w-3.5 ${colors.text.muted}`} />
                      <b>{v.visualizacoes}</b>
                    </span>
                    <span className="inline-flex items-center gap-1" title="Contatos (leads)">
                      <MessageSquare className={`h-3.5 w-3.5 ${colors.text.muted}`} />
                      <b>{v.contatos}</b>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Tempo em estoque */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className={cardClass}
        >
          <div className="mb-4 flex items-center gap-2">
            <Package className={`h-5 w-5 ${isDark ? "text-orange-400" : "text-orange-600"}`} />
            <h2 className="font-semibold">Tempo em Estoque</h2>
          </div>
          {emEstoque.length === 0 ? (
            <p className={`py-8 text-center text-sm ${colors.text.muted}`}>Nenhum veículo em estoque.</p>
          ) : (
            <div className="space-y-2.5">
              {[...emEstoque]
                .sort((a, b) => (b.diasEmEstoque ?? 0) - (a.diasEmEstoque ?? 0))
                .slice(0, 10)
                .map((v) => (
                  <div
                    key={v.veiculoId}
                    className={`flex items-center gap-3 rounded-xl border p-3 ${
                      (v.diasEmEstoque ?? 0) >= 60
                        ? isDark ? "border-orange-500/40 bg-orange-500/10" : "border-orange-300 bg-orange-50/80"
                        : `${colors.card.border} ${isDark ? "bg-slate-800/40" : "bg-slate-50/80"}`
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{v.descricao}</p>
                      <p className={`text-[11px] ${colors.text.muted}`}>
                        Entrada: {v.dataEntrada ? formatData(v.dataEntrada) : "—"}
                        {v.precoVenda != null && ` • ${formatBRL(v.precoVenda)}`}
                      </p>
                    </div>
                    {diasBadge(v.diasEmEstoque)}
                  </div>
                ))}
            </div>
          )}
        </motion.div>
      </section>

      {/* Lucro por veículo */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className={`mt-6 ${cardClass}`}
      >
        <div className="mb-4 flex items-center gap-2">
          <Trophy className={`h-5 w-5 ${isDark ? "text-yellow-400" : "text-yellow-600"}`} />
          <h2 className="font-semibold">Lucro por Veículo</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={`border-b text-left ${colors.card.border} ${colors.text.secondary}`}>
                <th className="px-3 py-2.5 font-medium">Veículo</th>
                <th className="px-3 py-2.5 font-medium">Status</th>
                <th className="px-3 py-2.5 text-right font-medium">Compra</th>
                <th className="px-3 py-2.5 text-right font-medium">Gastos</th>
                <th className="px-3 py-2.5 text-right font-medium">Venda</th>
                <th className="px-3 py-2.5 text-right font-medium">Lucro</th>
              </tr>
            </thead>
            <tbody>
              {estoque.map((v) => {
                const lucro = v.lucro ?? v.lucroPrevisto;
                const vendido = v.status === "VENDIDO";
                return (
                  <tr key={v.veiculoId} className={`border-b last:border-0 ${colors.card.border}`}>
                    <td className="px-3 py-2.5 font-medium">{v.descricao}</td>
                    <td className="px-3 py-2.5">
                      <span className={badgeStatus(v.status)}>
                        {STATUS_ESTOQUE_LABELS[v.status] ?? v.status}
                      </span>
                    </td>
                    <td className={`px-3 py-2.5 text-right ${colors.text.secondary}`}>
                      {v.precoCompra != null ? formatBRL(v.precoCompra) : "—"}
                    </td>
                    <td className={`px-3 py-2.5 text-right ${isDark ? "text-red-400" : "text-red-600"}`}>
                      {v.despesas > 0 ? formatBRL(v.despesas) : "—"}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      {vendido
                        ? formatBRL(v.valorVenda)
                        : v.precoVenda != null
                          ? `${formatBRL(v.precoVenda)} (anunciado)`
                          : "—"}
                    </td>
                    <td className={`px-3 py-2.5 text-right font-bold ${
                      lucro == null
                        ? colors.text.muted
                        : lucro >= 0
                          ? isDark ? "text-emerald-400" : "text-emerald-600"
                          : isDark ? "text-red-400" : "text-red-600"
                    }`}>
                      {lucro != null ? `${formatBRL(lucro)}${vendido ? "" : " (previsto)"}` : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.section>

      {/* Relatório de giro */}
      <section className="mt-8">
        <div className="mb-3 flex items-center gap-2">
          <Trophy className={`h-5 w-5 ${isDark ? "text-yellow-400" : "text-yellow-600"}`} />
          <h2 className="text-lg font-semibold">Relatório de Giro</h2>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {[
            { titulo: "Mais vendidos", dados: giro?.maisVendidos ?? [], metrica: "vendas" as const },
            { titulo: "Maior lucro", dados: giro?.maiorLucro ?? [], metrica: "lucro" as const },
            { titulo: "Menor lucro", dados: giro?.menorLucro ?? [], metrica: "lucro" as const },
          ].map((bloco, bi) => (
            <motion.div
              key={bloco.titulo}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 + bi * 0.08 }}
              className={cardClass}
            >
              <h3 className="mb-3 font-semibold">{bloco.titulo}</h3>
              {bloco.dados.length === 0 ? (
                <p className={`py-6 text-center text-sm ${colors.text.muted}`}>Sem vendas registradas.</p>
              ) : (
                <div className="space-y-2">
                  {bloco.dados.map((m, i) => (
                    <div
                      key={m.modelo}
                      className={`flex items-center gap-3 rounded-xl border p-3 ${colors.card.border} ${
                        isDark ? "bg-slate-800/40" : "bg-slate-50/80"
                      }`}
                    >
                      <span className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                        i === 0
                          ? isDark ? "bg-yellow-500/20 text-yellow-300" : "bg-yellow-100 text-yellow-700"
                          : isDark ? "bg-slate-700 text-slate-300" : "bg-slate-200 text-slate-600"
                      }`}>
                        {i + 1}º
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{m.modelo}</p>
                        <p className={`text-[11px] ${colors.text.muted}`}>
                          {m.quantidadeVendida} venda{m.quantidadeVendida === 1 ? "" : "s"}
                        </p>
                      </div>
                      <p className={`flex-shrink-0 text-sm font-bold ${
                        bloco.metrica === "vendas"
                          ? ""
                          : m.lucroTotal >= 0
                            ? isDark ? "text-emerald-400" : "text-emerald-600"
                            : isDark ? "text-red-400" : "text-red-600"
                      }`}>
                        {bloco.metrica === "vendas" ? `${m.quantidadeVendida}x` : formatBRL(m.lucroTotal)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </section>
    </CrmShell>
  );
}
