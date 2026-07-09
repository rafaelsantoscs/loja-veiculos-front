"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  Car,
  CheckCircle2,
  DollarSign,
  Eye,
  Percent,
  Users,
} from "lucide-react";
import type { ApexOptions } from "apexcharts";

import { useVeiculoTheme } from "@/app/(pages)/(internas)/veiculo-admin/_components/useVeiculoTheme";
import { formatBRL } from "@/app/(pages)/(internas)/veiculo-admin/_components/veiculo.utils";
import {
  getDashboardResumo,
  getMaisVisualizados,
  getVendasPorMes,
  getVendasPorVendedor,
} from "@/services/crmService";
import type {
  DashboardResumo,
  VendaPorMes,
  VendaPorVendedor,
  VeiculoVisualizado,
} from "@/types/crm";

import CrmShell from "./_components/CrmShell";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

const MES_LABELS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function formatMes(mes: string): string {
  const [ano, m] = mes.split("-");
  return `${MES_LABELS[Number(m) - 1]}/${ano.slice(2)}`;
}

/* ── Card de métrica ────────────────────────────────────────────── */

interface MetricaCardProps {
  label: string;
  valor: string | number;
  icon: React.ElementType;
  accent: "blue" | "green" | "indigo" | "yellow" | "purple";
  delay: number;
  detalhe?: string;
}

function MetricaCard({ label, valor, icon: Icon, accent, delay, detalhe }: MetricaCardProps) {
  const { isDark } = useVeiculoTheme();

  const accents = {
    blue: isDark
      ? "border-blue-500/30 bg-blue-500/10 hover:border-blue-400/50"
      : "border-blue-400/30 bg-blue-50/80 hover:border-blue-300/50",
    green: isDark
      ? "border-green-500/30 bg-green-500/10 hover:border-green-400/50"
      : "border-green-400/30 bg-green-50/80 hover:border-green-300/50",
    indigo: isDark
      ? "border-indigo-500/30 bg-indigo-500/10 hover:border-indigo-400/50"
      : "border-indigo-400/30 bg-indigo-50/80 hover:border-indigo-300/50",
    yellow: isDark
      ? "border-yellow-500/30 bg-yellow-500/10 hover:border-yellow-400/50"
      : "border-yellow-400/30 bg-yellow-50/80 hover:border-yellow-300/50",
    purple: isDark
      ? "border-purple-500/30 bg-purple-500/10 hover:border-purple-400/50"
      : "border-purple-400/30 bg-purple-50/80 hover:border-purple-300/50",
  };

  const iconAccents = {
    blue: isDark ? "text-blue-400 bg-blue-500/20 ring-blue-400/30" : "text-blue-500 bg-blue-500/15 ring-blue-400/20",
    green: isDark ? "text-green-400 bg-green-500/20 ring-green-400/30" : "text-green-500 bg-green-500/15 ring-green-400/20",
    indigo: isDark ? "text-indigo-400 bg-indigo-500/20 ring-indigo-400/30" : "text-indigo-500 bg-indigo-500/15 ring-indigo-400/20",
    yellow: isDark ? "text-yellow-400 bg-yellow-500/20 ring-yellow-400/30" : "text-yellow-500 bg-yellow-500/15 ring-yellow-400/20",
    purple: isDark ? "text-purple-400 bg-purple-500/20 ring-purple-400/30" : "text-purple-500 bg-purple-500/15 ring-purple-400/20",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -4 }}
      className={`group rounded-2xl border p-5 shadow-sm backdrop-blur transition-all hover:shadow-xl ${accents[accent]}`}
    >
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <p className={`mb-2 text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>{label}</p>
          <p className="truncate text-2xl font-bold xl:text-3xl">{valor}</p>
          {detalhe && (
            <p className={`mt-1 text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>{detalhe}</p>
          )}
        </div>
        <div className={`rounded-xl p-3 ring-1 transition-transform group-hover:scale-110 ${iconAccents[accent]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </motion.div>
  );
}

/* ── Skeleton ───────────────────────────────────────────────────── */

function DashboardSkeleton() {
  return (
    <div className="mt-6 space-y-6 animate-pulse">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-slate-300/20" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="h-96 rounded-2xl bg-slate-300/20" />
        <div className="h-96 rounded-2xl bg-slate-300/20" />
      </div>
      <div className="h-80 rounded-2xl bg-slate-300/20" />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   Página — CRM Dashboard
══════════════════════════════════════════════════════════════════ */

export default function CrmDashboardPage() {
  const { isDark, mounted, colors } = useVeiculoTheme();

  const [resumo, setResumo] = useState<DashboardResumo | null>(null);
  const [vendasMes, setVendasMes] = useState<VendaPorMes[]>([]);
  const [vendasVendedor, setVendasVendedor] = useState<VendaPorVendedor[]>([]);
  const [maisVistos, setMaisVistos] = useState<VeiculoVisualizado[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    Promise.all([
      getDashboardResumo(),
      getVendasPorMes(12),
      getVendasPorVendedor(),
      getMaisVisualizados(8),
    ])
      .then(([r, vm, vv, mv]) => {
        setResumo(r);
        setVendasMes(vm);
        setVendasVendedor(vv);
        setMaisVistos(mv);
      })
      .catch(() => setErro("Não foi possível carregar os dados do dashboard."))
      .finally(() => setLoading(false));
  }, []);

  const axisColor = isDark ? "#94a3b8" : "#64748b";
  const gridColor = isDark ? "rgba(148,163,184,.15)" : "rgba(100,116,139,.15)";

  /* Gráfico: vendas por mês (colunas + linha de faturamento) */
  const vendasMesOptions: ApexOptions = useMemo(
    () => ({
      chart: { type: "line", toolbar: { show: false }, background: "transparent" },
      stroke: { width: [0, 3], curve: "smooth" },
      colors: ["#2563eb", "#22c55e"],
      plotOptions: { bar: { columnWidth: "45%", borderRadius: 6 } },
      dataLabels: { enabled: false },
      grid: { borderColor: gridColor },
      xaxis: {
        categories: vendasMes.map((v) => formatMes(v.mes)),
        labels: { style: { colors: axisColor } },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: [
        {
          title: { text: "Vendas", style: { color: axisColor } },
          labels: { style: { colors: axisColor } },
        },
        {
          opposite: true,
          title: { text: "Faturamento", style: { color: axisColor } },
          labels: {
            style: { colors: axisColor },
            formatter: (v: number) => `R$ ${Math.round(v / 1000)}k`,
          },
        },
      ],
      legend: { labels: { colors: axisColor } },
      tooltip: {
        theme: isDark ? "dark" : "light",
        y: [
          {},
          { formatter: (v: number) => formatBRL(v) },
        ],
      },
    }),
    [vendasMes, isDark, axisColor, gridColor],
  );

  const vendasMesSeries = useMemo(
    () => [
      { name: "Vendas", type: "column" as const, data: vendasMes.map((v) => v.quantidade) },
      { name: "Faturamento", type: "line" as const, data: vendasMes.map((v) => v.faturamento) },
    ],
    [vendasMes],
  );

  /* Gráfico: vendas por vendedor (barras horizontais) */
  const vendedorOptions: ApexOptions = useMemo(
    () => ({
      chart: { type: "bar", toolbar: { show: false }, background: "transparent" },
      colors: ["#2563eb"],
      plotOptions: { bar: { horizontal: true, borderRadius: 6, barHeight: "55%" } },
      dataLabels: { enabled: true, style: { colors: ["#fff"] } },
      grid: { borderColor: gridColor },
      xaxis: {
        categories: vendasVendedor.map((v) => v.vendedor),
        labels: { style: { colors: axisColor } },
      },
      yaxis: { labels: { style: { colors: axisColor } } },
      tooltip: {
        theme: isDark ? "dark" : "light",
        custom: ({ dataPointIndex }: { dataPointIndex: number }) => {
          const v = vendasVendedor[dataPointIndex];
          if (!v) return "";
          return `<div style="padding:8px 12px">
            <b>${v.vendedor}</b><br/>
            Vendas: ${v.quantidade}<br/>
            Faturamento: ${formatBRL(v.faturamento)}<br/>
            Comissão: ${formatBRL(v.comissao)}
          </div>`;
        },
      },
    }),
    [vendasVendedor, isDark, axisColor, gridColor],
  );

  const vendedorSeries = useMemo(
    () => [{ name: "Vendas", data: vendasVendedor.map((v) => v.quantidade) }],
    [vendasVendedor],
  );

  const cardClass = `rounded-2xl border p-6 backdrop-blur ${colors.card.border} ${colors.card.background}`;

  return (
    <CrmShell
      categoria="CRM de Vendas"
      titulo="Dashboard"
      subtitulo="Visão geral do estoque, vendas, leads e desempenho da loja."
    >
      {!mounted || loading ? (
        <DashboardSkeleton />
      ) : erro ? (
        <div className={`mt-6 rounded-2xl border p-6 text-center backdrop-blur ${
          isDark ? "border-red-500/30 bg-red-500/10 text-red-300" : "border-red-400/30 bg-red-100/80 text-red-700"
        }`}>
          {erro}
        </div>
      ) : (
        <>
          {/* Cards de resumo */}
          <section className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">
            <MetricaCard
              label="Carros em estoque"
              valor={resumo?.carrosEstoque ?? 0}
              detalhe={`${formatBRL(resumo?.valorEstoque)} em estoque`}
              icon={Car}
              accent="blue"
              delay={0.1}
            />
            <MetricaCard
              label="Carros vendidos"
              valor={resumo?.carrosVendidos ?? 0}
              detalhe={`${resumo?.vendasMes ?? 0} neste mês`}
              icon={CheckCircle2}
              accent="green"
              delay={0.18}
            />
            <MetricaCard
              label="Faturamento do mês"
              valor={formatBRL(resumo?.faturamentoMes)}
              detalhe={`Saldo: ${formatBRL(resumo?.saldoMes)}`}
              icon={DollarSign}
              accent="indigo"
              delay={0.26}
            />
            <MetricaCard
              label="Leads recebidos"
              valor={resumo?.leadsRecebidos ?? 0}
              detalhe={`${resumo?.leadsMes ?? 0} neste mês`}
              icon={Users}
              accent="yellow"
              delay={0.34}
            />
            <MetricaCard
              label="Conversão de vendas"
              valor={`${resumo?.conversaoVendas ?? 0}%`}
              detalhe="Leads convertidos em venda"
              icon={Percent}
              accent="purple"
              delay={0.42}
            />
          </section>

          {/* Gráficos */}
          <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={cardClass}
            >
              <h3 className="mb-4 font-semibold">Vendas por mês</h3>
              <ReactApexChart options={vendasMesOptions} series={vendasMesSeries} type="line" height={330} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38 }}
              className={cardClass}
            >
              <h3 className="mb-4 font-semibold">Vendas por vendedor</h3>
              {vendasVendedor.length === 0 ? (
                <div className={`flex h-[330px] items-center justify-center text-sm ${colors.text.secondary}`}>
                  Nenhuma venda registrada ainda.
                </div>
              ) : (
                <ReactApexChart options={vendedorOptions} series={vendedorSeries} type="bar" height={330} />
              )}
            </motion.div>
          </section>

          {/* Mais visualizados */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.46 }}
            className={`mt-6 ${cardClass}`}
          >
            <div className="mb-4 flex items-center gap-2">
              <Eye className={`h-5 w-5 ${isDark ? "text-blue-400" : "text-blue-500"}`} />
              <h3 className="font-semibold">Veículos mais visualizados</h3>
            </div>

            {maisVistos.length === 0 ? (
              <p className={`py-8 text-center text-sm ${colors.text.secondary}`}>
                Ainda não há visualizações registradas.
              </p>
            ) : (
              <div className="space-y-2">
                {maisVistos.map((v, i) => {
                  const max = Math.max(...maisVistos.map((m) => m.visualizacoes), 1);
                  return (
                    <motion.div
                      key={v.veiculoId}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.05 }}
                      className={`flex items-center gap-4 rounded-xl border p-3 ${colors.card.border} ${
                        isDark ? "bg-slate-800/30" : "bg-white/50"
                      }`}
                    >
                      <span className={`w-6 text-center text-sm font-bold ${colors.text.muted}`}>{i + 1}º</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{v.descricao}</p>
                        <div className={`mt-1.5 h-1.5 w-full overflow-hidden rounded-full ${
                          isDark ? "bg-slate-700/60" : "bg-slate-200/80"
                        }`}>
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400"
                            style={{ width: `${(v.visualizacoes / max) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex flex-shrink-0 items-center gap-4 text-xs">
                        <span className={`flex items-center gap-1 ${colors.text.secondary}`}>
                          <Eye className="h-3.5 w-3.5" /> {v.visualizacoes}
                        </span>
                        <span className={`flex items-center gap-1 ${colors.text.secondary}`}>
                          <Users className="h-3.5 w-3.5" /> {v.contatos}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.section>
        </>
      )}
    </CrmShell>
  );
}
