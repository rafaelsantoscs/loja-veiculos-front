"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  CalendarDays,
  Wallet,
} from "lucide-react";

import { useVeiculoTheme } from "@/app/(pages)/(internas)/veiculo-admin/_components/useVeiculoTheme";
import { formatBRL, formatData } from "@/app/(pages)/(internas)/veiculo-admin/_components/veiculo.utils";
import { getFluxoCaixa } from "@/services/crmService";
import type { FluxoCaixa } from "@/types/crm";

import CrmShell from "../../crm/_components/CrmShell";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

function primeiroDiaDoMes(): string {
  const hoje = new Date();
  return new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().slice(0, 10);
}

function hojeISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function FluxoCaixaPage() {
  const { isDark, mounted, colors, inputClass } = useVeiculoTheme();

  const [inicio, setInicio] = useState(primeiroDiaDoMes());
  const [fim, setFim] = useState(hojeISO());
  const [fluxo, setFluxo] = useState<FluxoCaixa | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const carregar = async (dataInicio: string, dataFim: string) => {
    setLoading(true);
    setErro("");
    try {
      const dados = await getFluxoCaixa(dataInicio, dataFim);
      setFluxo(dados);
    } catch {
      setErro("Não foi possível carregar o fluxo de caixa.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(inicio, fim); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const aplicarPeriodo = () => carregar(inicio, fim);

  const chartOptions = useMemo(() => {
    const dias = fluxo?.saldoDiario ?? [];
    return {
      chart: {
        type: "bar" as const,
        toolbar: { show: false },
        background: "transparent",
        stacked: false,
      },
      theme: { mode: (isDark ? "dark" : "light") as "dark" | "light" },
      plotOptions: { bar: { columnWidth: "60%", borderRadius: 3 } },
      dataLabels: { enabled: false },
      colors: ["#10b981", "#ef4444", "#3b82f6"],
      stroke: { width: [0, 0, 3], curve: "smooth" as const },
      xaxis: {
        categories: dias.map((d) => formatData(d.data)),
        labels: { rotate: -45, style: { fontSize: "11px" } },
      },
      yaxis: {
        labels: {
          formatter: (v: number) =>
            new Intl.NumberFormat("pt-BR", { notation: "compact" }).format(v),
        },
      },
      tooltip: {
        y: { formatter: (v: number) => formatBRL(v) },
      },
      legend: { position: "top" as const },
      grid: { borderColor: isDark ? "#334155" : "#e2e8f0" },
    };
  }, [fluxo, isDark]);

  const chartSeries = useMemo(() => {
    const dias = fluxo?.saldoDiario ?? [];
    return [
      { name: "Entradas", type: "column" as const, data: dias.map((d) => d.entradas) },
      { name: "Saídas", type: "column" as const, data: dias.map((d) => d.saidas) },
      { name: "Saldo do dia", type: "line" as const, data: dias.map((d) => d.saldo) },
    ];
  }, [fluxo]);

  const saldoPositivo = (fluxo?.saldo ?? 0) >= 0;

  return (
    <CrmShell
      categoria="Gestão da Loja"
      titulo="Fluxo de Caixa"
      subtitulo="Entradas (vendas) e saídas (despesas) com saldo diário e do período."
    >
      {/* Filtro de período */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className={`mt-6 rounded-2xl border p-4 backdrop-blur ${colors.card.border} ${colors.card.background}`}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className={`mb-1.5 block text-sm font-medium ${colors.text.secondary}`}>Data inicial</label>
            <input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} className={inputClass} />
          </div>
          <div className="flex-1">
            <label className={`mb-1.5 block text-sm font-medium ${colors.text.secondary}`}>Data final</label>
            <input type="date" value={fim} onChange={(e) => setFim(e.target.value)} className={inputClass} />
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={aplicarPeriodo}
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-2.5 font-medium text-white transition-all hover:from-blue-700 hover:to-blue-800"
          >
            <CalendarDays className="mr-2 h-4 w-4" />
            Aplicar
          </motion.button>
        </div>
      </motion.div>

      {erro && (
        <div className={`mt-4 rounded-2xl border p-4 text-sm ${
          isDark ? "border-red-500/30 bg-red-500/10 text-red-300" : "border-red-400/30 bg-red-100/80 text-red-700"
        }`}>
          {erro}
        </div>
      )}

      {/* Cards resumo */}
      <section className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {loading || !mounted ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-300/20" />
          ))
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              whileHover={{ y: -4 }}
              className={`rounded-2xl border p-5 shadow-sm backdrop-blur transition-all hover:shadow-xl ${
                isDark ? "border-emerald-500/30 bg-emerald-500/10" : "border-emerald-400/30 bg-emerald-50/80"
              }`}
            >
              <div className="flex items-center gap-2">
                <ArrowUpCircle className={`h-5 w-5 ${isDark ? "text-emerald-400" : "text-emerald-600"}`} />
                <p className={`text-sm ${colors.text.secondary}`}>Entradas (vendas)</p>
              </div>
              <p className={`mt-2 text-2xl font-bold ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
                {formatBRL(fluxo?.totalEntradas ?? 0)}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.13 }}
              whileHover={{ y: -4 }}
              className={`rounded-2xl border p-5 shadow-sm backdrop-blur transition-all hover:shadow-xl ${
                isDark ? "border-red-500/30 bg-red-500/10" : "border-red-400/30 bg-red-50/80"
              }`}
            >
              <div className="flex items-center gap-2">
                <ArrowDownCircle className={`h-5 w-5 ${isDark ? "text-red-400" : "text-red-600"}`} />
                <p className={`text-sm ${colors.text.secondary}`}>Saídas (despesas)</p>
              </div>
              <p className={`mt-2 text-2xl font-bold ${isDark ? "text-red-400" : "text-red-600"}`}>
                {formatBRL(fluxo?.totalSaidas ?? 0)}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.21 }}
              whileHover={{ y: -4 }}
              className={`rounded-2xl border p-5 shadow-sm backdrop-blur transition-all hover:shadow-xl ${
                saldoPositivo
                  ? isDark ? "border-blue-500/30 bg-blue-500/10" : "border-blue-400/30 bg-blue-50/80"
                  : isDark ? "border-orange-500/30 bg-orange-500/10" : "border-orange-400/30 bg-orange-50/80"
              }`}
            >
              <div className="flex items-center gap-2">
                <Wallet className={`h-5 w-5 ${
                  saldoPositivo
                    ? isDark ? "text-blue-400" : "text-blue-600"
                    : isDark ? "text-orange-400" : "text-orange-600"
                }`} />
                <p className={`text-sm ${colors.text.secondary}`}>Saldo do período</p>
              </div>
              <p className={`mt-2 text-2xl font-bold ${
                saldoPositivo
                  ? isDark ? "text-blue-400" : "text-blue-600"
                  : isDark ? "text-orange-400" : "text-orange-600"
              }`}>
                {formatBRL(fluxo?.saldo ?? 0)}
              </p>
            </motion.div>
          </>
        )}
      </section>

      {/* Gráfico diário */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className={`mt-6 rounded-2xl border p-5 backdrop-blur ${colors.card.border} ${colors.card.background}`}
      >
        <h3 className="mb-4 font-semibold">Movimentação diária</h3>
        {loading || !mounted ? (
          <div className="h-72 animate-pulse rounded-xl bg-slate-300/20" />
        ) : (fluxo?.saldoDiario?.length ?? 0) === 0 ? (
          <div className={`flex h-72 flex-col items-center justify-center text-sm ${colors.text.muted}`}>
            <Wallet className="mb-3 h-10 w-10" />
            Nenhuma movimentação no período selecionado.
          </div>
        ) : (
          <Chart options={chartOptions} series={chartSeries} type="line" height={320} />
        )}
      </motion.div>

      {/* Tabela de dias */}
      {!loading && mounted && (fluxo?.saldoDiario?.length ?? 0) > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`mt-6 overflow-hidden rounded-2xl border backdrop-blur ${colors.card.border} ${colors.card.background}`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b text-left ${colors.card.border} ${colors.text.secondary}`}>
                  <th className="px-4 py-3 font-medium">Data</th>
                  <th className="px-4 py-3 text-right font-medium">Entradas</th>
                  <th className="px-4 py-3 text-right font-medium">Saídas</th>
                  <th className="px-4 py-3 text-right font-medium">Saldo do dia</th>
                </tr>
              </thead>
              <tbody>
                {fluxo!.saldoDiario.map((dia) => (
                  <tr key={dia.data} className={`border-b last:border-0 ${colors.card.border}`}>
                    <td className="px-4 py-2.5">{formatData(dia.data)}</td>
                    <td className={`px-4 py-2.5 text-right font-medium ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
                      {dia.entradas > 0 ? formatBRL(dia.entradas) : "—"}
                    </td>
                    <td className={`px-4 py-2.5 text-right font-medium ${isDark ? "text-red-400" : "text-red-600"}`}>
                      {dia.saidas > 0 ? `− ${formatBRL(dia.saidas)}` : "—"}
                    </td>
                    <td className={`px-4 py-2.5 text-right font-bold ${
                      dia.saldo >= 0
                        ? isDark ? "text-blue-400" : "text-blue-600"
                        : isDark ? "text-orange-400" : "text-orange-600"
                    }`}>
                      {formatBRL(dia.saldo)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </CrmShell>
  );
}
