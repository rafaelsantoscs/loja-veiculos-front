"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Check,
  PlusCircle,
  Receipt,
  Trash2,
} from "lucide-react";

import axiosInstance from "@/services/axiosInstance";
import { useVeiculoTheme } from "@/app/(pages)/(internas)/veiculo-admin/_components/useVeiculoTheme";
import { formatBRL, formatData, mapVeiculo } from "@/app/(pages)/(internas)/veiculo-admin/_components/veiculo.utils";
import { excluirDespesa, listarDespesas, salvarDespesa } from "@/services/crmService";
import { CATEGORIA_DESPESA_LABELS, type CategoriaDespesa, type Despesa } from "@/types/crm";
import type { Veiculo } from "@/types/veiculo";

import CrmShell from "../../crm/_components/CrmShell";

const CATEGORIAS = Object.keys(CATEGORIA_DESPESA_LABELS) as CategoriaDespesa[];

export default function DespesasPage() {
  const { isDark, mounted, colors, inputClass, selectClass } = useVeiculoTheme();

  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const [filtroCategoria, setFiltroCategoria] = useState<string>("TODAS");
  const [modalAberto, setModalAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [excluirAlvo, setExcluirAlvo] = useState<Despesa | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  const [form, setForm] = useState({
    descricao: "",
    categoria: "OUTROS" as CategoriaDespesa,
    valor: "",
    data: new Date().toISOString().slice(0, 10),
    veiculoId: "",
  });

  const notificar = (tipo: "success" | "error", msg: string) => {
    if (tipo === "success") setSucesso(msg);
    else setErro(msg);
    setTimeout(() => (tipo === "success" ? setSucesso("") : setErro("")), 3500);
  };

  const carregar = async () => {
    setLoading(true);
    try {
      const [ds, veics] = await Promise.all([
        listarDespesas(),
        axiosInstance.get("/veiculos").then((r) => (r.data ?? []).map(mapVeiculo)),
      ]);
      setDespesas(ds);
      setVeiculos(veics);
    } catch {
      setErro("Não foi possível carregar as despesas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const filtradas = useMemo(
    () => (filtroCategoria === "TODAS" ? despesas : despesas.filter((d) => d.categoria === filtroCategoria)),
    [despesas, filtroCategoria],
  );

  const totalFiltrado = useMemo(
    () => filtradas.reduce((acc, d) => acc + (d.valor ?? 0), 0),
    [filtradas],
  );

  const totalPorCategoria = useMemo(() => {
    const mapa: Record<string, number> = {};
    despesas.forEach((d) => {
      mapa[d.categoria] = (mapa[d.categoria] ?? 0) + (d.valor ?? 0);
    });
    return mapa;
  }, [despesas]);

  const abrirModal = () => {
    setForm({
      descricao: "",
      categoria: "OUTROS",
      valor: "",
      data: new Date().toISOString().slice(0, 10),
      veiculoId: "",
    });
    setModalAberto(true);
  };

  const salvar = async () => {
    if (!form.descricao.trim()) return notificar("error", "Informe a descrição da despesa.");
    if (!form.valor || Number(form.valor) <= 0) return notificar("error", "Informe o valor da despesa.");

    setSalvando(true);
    try {
      await salvarDespesa({
        descricao: form.descricao.trim(),
        categoria: form.categoria,
        valor: Number(form.valor),
        data: form.data || new Date().toISOString().slice(0, 10),
        veiculoId: form.veiculoId ? Number(form.veiculoId) : undefined,
      });
      notificar("success", "Despesa registrada.");
      setModalAberto(false);
      carregar();
    } catch {
      notificar("error", "Não foi possível salvar a despesa.");
    } finally {
      setSalvando(false);
    }
  };

  const confirmarExclusao = async () => {
    if (!excluirAlvo) return;
    setExcluindo(true);
    try {
      await excluirDespesa(excluirAlvo.id);
      notificar("success", "Despesa excluída.");
      setExcluirAlvo(null);
      carregar();
    } catch {
      notificar("error", "Não foi possível excluir a despesa.");
    } finally {
      setExcluindo(false);
    }
  };

  const badgeCategoria = (categoria: CategoriaDespesa) => {
    const estilos: Record<CategoriaDespesa, string> = {
      LAVAGEM: isDark ? "bg-cyan-500/15 text-cyan-300 ring-cyan-400/30" : "bg-cyan-100 text-cyan-700 ring-cyan-300",
      OFICINA: isDark ? "bg-orange-500/15 text-orange-300 ring-orange-400/30" : "bg-orange-100 text-orange-700 ring-orange-300",
      DOCUMENTACAO: isDark ? "bg-purple-500/15 text-purple-300 ring-purple-400/30" : "bg-purple-100 text-purple-700 ring-purple-300",
      MARKETING: isDark ? "bg-pink-500/15 text-pink-300 ring-pink-400/30" : "bg-pink-100 text-pink-700 ring-pink-300",
      COMBUSTIVEL: isDark ? "bg-amber-500/15 text-amber-300 ring-amber-400/30" : "bg-amber-100 text-amber-700 ring-amber-300",
      COMISSAO: isDark ? "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30" : "bg-emerald-100 text-emerald-700 ring-emerald-300",
      OUTROS: isDark ? "bg-slate-500/15 text-slate-300 ring-slate-400/30" : "bg-slate-100 text-slate-600 ring-slate-300",
    };
    return `inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ${estilos[categoria]}`;
  };

  return (
    <CrmShell
      categoria="Gestão da Loja"
      titulo="Despesas"
      subtitulo="Controle os gastos por categoria e por veículo para saber o lucro real."
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

      {/* Resumo por categoria */}
      <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-7">
        {CATEGORIAS.map((cat, i) => (
          <motion.button
            key={cat}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => setFiltroCategoria(filtroCategoria === cat ? "TODAS" : cat)}
            className={`rounded-2xl border p-3 text-left backdrop-blur transition-all ${
              filtroCategoria === cat
                ? isDark ? "border-blue-500/60 bg-blue-500/15 ring-1 ring-blue-500/40" : "border-blue-500/60 bg-blue-50 ring-1 ring-blue-400/40"
                : `${colors.card.border} ${colors.card.background} ${colors.card.hover}`
            }`}
          >
            <p className={`truncate text-[11px] ${colors.text.muted}`}>{CATEGORIA_DESPESA_LABELS[cat]}</p>
            <p className="mt-1 truncate text-sm font-bold">{formatBRL(totalPorCategoria[cat] ?? 0)}</p>
          </motion.button>
        ))}
      </section>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className={`text-sm ${colors.text.secondary}`}>
          {filtradas.length} despesa{filtradas.length === 1 ? "" : "s"}
          {filtroCategoria !== "TODAS" && ` em ${CATEGORIA_DESPESA_LABELS[filtroCategoria as CategoriaDespesa]}`}
          {" — total "}
          <b className={isDark ? "text-red-400" : "text-red-600"}>{formatBRL(totalFiltrado)}</b>
        </p>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={abrirModal}
          className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 font-medium text-white transition-all hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          Nova Despesa
        </motion.button>
      </div>

      {/* Lista */}
      <section className="mt-4">
        {loading || !mounted ? (
          <div className="space-y-3 animate-pulse">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 rounded-2xl bg-slate-300/20" />
            ))}
          </div>
        ) : filtradas.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-2xl border p-12 text-center backdrop-blur ${colors.card.border} ${colors.card.background}`}
          >
            <Receipt className={`mx-auto mb-4 h-12 w-12 ${colors.text.muted}`} />
            <h3 className="font-semibold">Nenhuma despesa encontrada</h3>
            <p className={`mt-1 text-sm ${colors.text.secondary}`}>
              Registre lavagem, oficina, documentação e outros gastos para calcular o lucro real.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-2.5">
            {filtradas.map((despesa, i) => (
              <motion.div
                key={despesa.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.35) }}
                className={`flex items-center gap-4 rounded-2xl border p-4 backdrop-blur ${colors.card.border} ${colors.card.background} ${colors.card.hover}`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-medium">{despesa.descricao}</p>
                    <span className={badgeCategoria(despesa.categoria)}>
                      {CATEGORIA_DESPESA_LABELS[despesa.categoria] ?? despesa.categoria}
                    </span>
                  </div>
                  <p className={`mt-0.5 text-xs ${colors.text.secondary}`}>
                    {formatData(despesa.data)}
                    {despesa.veiculoDescricao && ` • ${despesa.veiculoDescricao}`}
                  </p>
                </div>

                <p className={`flex-shrink-0 font-bold ${isDark ? "text-red-400" : "text-red-600"}`}>
                  − {formatBRL(despesa.valor)}
                </p>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setExcluirAlvo(despesa)}
                  className={`flex-shrink-0 rounded-xl p-2.5 transition-colors ${
                    isDark ? "text-red-400 hover:bg-red-500/15" : "text-red-500 hover:bg-red-50"
                  }`}
                  title="Excluir despesa"
                >
                  <Trash2 className="h-4 w-4" />
                </motion.button>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Modal nova despesa */}
      <AnimatePresence>
        {modalAberto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => !salvando && setModalAberto(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-lg rounded-2xl border p-6 backdrop-blur ${
                isDark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"
              }`}
            >
              <h3 className="text-lg font-semibold">Nova despesa</h3>

              <div className="mt-5 space-y-3">
                <div>
                  <label className={`mb-1.5 block text-sm font-medium ${colors.text.secondary}`}>Descrição *</label>
                  <input
                    type="text"
                    value={form.descricao}
                    onChange={(e) => setForm((p) => ({ ...p, descricao: e.target.value }))}
                    className={inputClass}
                    placeholder="Ex.: Polimento completo"
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className={`mb-1.5 block text-sm font-medium ${colors.text.secondary}`}>Categoria *</label>
                    <select
                      value={form.categoria}
                      onChange={(e) => setForm((p) => ({ ...p, categoria: e.target.value as CategoriaDespesa }))}
                      className={selectClass}
                    >
                      {CATEGORIAS.map((c) => (
                        <option key={c} value={c}>{CATEGORIA_DESPESA_LABELS[c]}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`mb-1.5 block text-sm font-medium ${colors.text.secondary}`}>Valor *</label>
                    <input
                      type="number"
                      min={0}
                      step={10}
                      value={form.valor}
                      onChange={(e) => setForm((p) => ({ ...p, valor: e.target.value }))}
                      className={inputClass}
                      placeholder="R$ 0,00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className={`mb-1.5 block text-sm font-medium ${colors.text.secondary}`}>Data</label>
                    <input
                      type="date"
                      value={form.data}
                      onChange={(e) => setForm((p) => ({ ...p, data: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={`mb-1.5 block text-sm font-medium ${colors.text.secondary}`}>Veículo (opcional)</label>
                    <select
                      value={form.veiculoId}
                      onChange={(e) => setForm((p) => ({ ...p, veiculoId: e.target.value }))}
                      className={selectClass}
                    >
                      <option value="">Despesa geral da loja</option>
                      {veiculos.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.marca} {v.modelo} {v.anoModelo}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setModalAberto(false)}
                  disabled={salvando}
                  className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                    isDark ? "bg-slate-700 hover:bg-slate-600 text-slate-200" : "bg-slate-200 hover:bg-slate-300 text-slate-700"
                  }`}
                >
                  Cancelar
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={salvar}
                  disabled={salvando}
                  className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2.5 text-sm font-medium text-white transition-all hover:from-blue-700 hover:to-blue-800 disabled:opacity-60"
                >
                  {salvando ? "Salvando..." : "Salvar despesa"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal exclusão */}
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
              <h3 className="text-lg font-semibold">Excluir despesa</h3>
              <p className={`mt-2 text-sm ${colors.text.secondary}`}>
                Excluir a despesa <b>{excluirAlvo.descricao}</b> de {formatBRL(excluirAlvo.valor)}?
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
