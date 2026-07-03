"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Check,
  DollarSign,
  PlusCircle,
  Trash2,
  TrendingUp,
} from "lucide-react";

import axiosInstance from "@/services/axiosInstance";
import { useVeiculoTheme } from "@/app/(pages)/(internas)/veiculo-admin/_components/useVeiculoTheme";
import { formatBRL, formatData, mapVeiculo } from "@/app/(pages)/(internas)/veiculo-admin/_components/veiculo.utils";
import {
  excluirVenda,
  listarVendas,
  listarVendedores,
  registrarVenda,
} from "@/services/crmService";
import type { Venda, Vendedor } from "@/types/crm";
import type { Veiculo } from "@/types/veiculo";

import CrmShell from "../../crm/_components/CrmShell";

export default function VendasPage() {
  const { isDark, mounted, colors, inputClass, selectClass } = useVeiculoTheme();

  const [vendas, setVendas] = useState<Venda[]>([]);
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [veiculosDisponiveis, setVeiculosDisponiveis] = useState<Veiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const [modalAberto, setModalAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [excluirAlvo, setExcluirAlvo] = useState<Venda | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  const [form, setForm] = useState({
    veiculoId: "",
    vendedorId: "",
    valorVenda: "",
    dataVenda: new Date().toISOString().slice(0, 10),
    nomeComprador: "",
    observacao: "",
  });

  const notificar = (tipo: "success" | "error", msg: string) => {
    if (tipo === "success") setSucesso(msg);
    else setErro(msg);
    setTimeout(() => (tipo === "success" ? setSucesso("") : setErro("")), 3500);
  };

  const carregar = async () => {
    setLoading(true);
    try {
      const [vs, vds, veics] = await Promise.all([
        listarVendas(),
        listarVendedores(true),
        axiosInstance.get("/veiculos").then((r) => (r.data ?? []).map(mapVeiculo)),
      ]);
      setVendas(vs);
      setVendedores(vds);
      setVeiculosDisponiveis(
        (veics as Veiculo[]).filter((v) => v.status !== "VENDIDO" && v.status !== "INATIVO"),
      );
    } catch {
      setErro("Não foi possível carregar as vendas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const totais = useMemo(() => {
    const faturamento = vendas.reduce((acc, v) => acc + (v.valorVenda ?? 0), 0);
    const lucro = vendas.reduce((acc, v) => acc + (v.lucro ?? 0), 0);
    const comissoes = vendas.reduce((acc, v) => acc + (v.valorComissao ?? 0), 0);
    return { faturamento, lucro, comissoes, quantidade: vendas.length };
  }, [vendas]);

  const abrirModal = () => {
    setForm({
      veiculoId: "",
      vendedorId: "",
      valorVenda: "",
      dataVenda: new Date().toISOString().slice(0, 10),
      nomeComprador: "",
      observacao: "",
    });
    setModalAberto(true);
  };

  /* Preenche o valor de venda com o preço anunciado ao escolher o veículo */
  const selecionarVeiculo = (id: string) => {
    const veiculo = veiculosDisponiveis.find((v) => String(v.id) === id);
    setForm((prev) => ({
      ...prev,
      veiculoId: id,
      valorVenda: veiculo && veiculo.valor > 0 ? String(veiculo.valor) : prev.valorVenda,
    }));
  };

  const salvar = async () => {
    if (!form.veiculoId) return notificar("error", "Selecione o veículo vendido.");
    if (!form.valorVenda || Number(form.valorVenda) <= 0)
      return notificar("error", "Informe o valor da venda.");

    setSalvando(true);
    try {
      await registrarVenda({
        veiculoId: Number(form.veiculoId),
        vendedorId: form.vendedorId ? Number(form.vendedorId) : undefined,
        valorVenda: Number(form.valorVenda),
        dataVenda: form.dataVenda || undefined,
        nomeComprador: form.nomeComprador.trim() || undefined,
        observacao: form.observacao.trim() || undefined,
      });
      notificar("success", "Venda registrada! O veículo foi marcado como vendido.");
      setModalAberto(false);
      carregar();
    } catch (e: any) {
      notificar("error", e?.response?.data?.message || "Não foi possível registrar a venda.");
    } finally {
      setSalvando(false);
    }
  };

  const confirmarExclusao = async () => {
    if (!excluirAlvo) return;
    setExcluindo(true);
    try {
      await excluirVenda(excluirAlvo.id);
      notificar("success", "Venda excluída. O veículo voltou para o estoque.");
      setExcluirAlvo(null);
      carregar();
    } catch {
      notificar("error", "Não foi possível excluir a venda.");
    } finally {
      setExcluindo(false);
    }
  };

  const cardClass = `rounded-2xl border p-5 backdrop-blur ${colors.card.border} ${colors.card.background}`;

  return (
    <CrmShell
      categoria="Gestão da Loja"
      titulo="Vendas"
      subtitulo="Registre as vendas: o sistema calcula comissão e lucro por veículo automaticamente."
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

      {/* Cards de totais */}
      <section className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Vendas registradas",
            valor: String(totais.quantidade),
            cls: isDark ? "border-blue-500/30 bg-blue-500/10" : "border-blue-400/30 bg-blue-50/80",
          },
          {
            label: "Faturamento total",
            valor: formatBRL(totais.faturamento),
            cls: isDark ? "border-indigo-500/30 bg-indigo-500/10" : "border-indigo-400/30 bg-indigo-50/80",
          },
          {
            label: "Lucro total",
            valor: formatBRL(totais.lucro),
            cls: isDark ? "border-green-500/30 bg-green-500/10" : "border-green-400/30 bg-green-50/80",
          },
          {
            label: "Comissões pagas",
            valor: formatBRL(totais.comissoes),
            cls: isDark ? "border-yellow-500/30 bg-yellow-500/10" : "border-yellow-400/30 bg-yellow-50/80",
          },
        ].map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.08 }}
            whileHover={{ y: -4 }}
            className={`rounded-2xl border p-5 shadow-sm backdrop-blur transition-all hover:shadow-xl ${c.cls}`}
          >
            <p className={`mb-2 text-sm ${colors.text.secondary}`}>{c.label}</p>
            <p className="truncate text-2xl font-bold">{c.valor}</p>
          </motion.div>
        ))}
      </section>

      {/* Botão registrar */}
      <div className="mt-6 flex justify-end">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={abrirModal}
          className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 font-medium text-white transition-all hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          Registrar Venda
        </motion.button>
      </div>

      {/* Lista de vendas */}
      <section className="mt-4">
        {loading || !mounted ? (
          <div className="space-y-3 animate-pulse">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 rounded-2xl bg-slate-300/20" />
            ))}
          </div>
        ) : vendas.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-2xl border p-12 text-center backdrop-blur ${colors.card.border} ${colors.card.background}`}
          >
            <DollarSign className={`mx-auto mb-4 h-12 w-12 ${colors.text.muted}`} />
            <h3 className="font-semibold">Nenhuma venda registrada</h3>
            <p className={`mt-1 text-sm ${colors.text.secondary}`}>
              Registre a primeira venda para acompanhar faturamento, lucro e comissões.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {vendas.map((venda, i) => (
              <motion.div
                key={venda.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.05, 0.4) }}
                className={`rounded-2xl border p-4 backdrop-blur ${colors.card.border} ${colors.card.background} ${colors.card.hover}`}
              >
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{venda.veiculoDescricao ?? `Veículo #${venda.veiculoId}`}</p>
                    <div className={`mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs ${colors.text.secondary}`}>
                      <span>{formatData(venda.dataVenda)}</span>
                      {venda.vendedorNome && <span>Vendedor: {venda.vendedorNome}</span>}
                      {venda.nomeComprador && <span>Comprador: {venda.nomeComprador}</span>}
                    </div>
                  </div>

                  {/* Composição do lucro */}
                  <div className="grid flex-shrink-0 grid-cols-2 gap-x-8 gap-y-1 text-sm sm:grid-cols-4">
                    <div>
                      <p className={`text-[11px] ${colors.text.muted}`}>Compra</p>
                      <p className="font-semibold">{formatBRL(venda.precoCompra)}</p>
                    </div>
                    <div>
                      <p className={`text-[11px] ${colors.text.muted}`}>Gastos</p>
                      <p className="font-semibold">{formatBRL(venda.totalDespesas)}</p>
                    </div>
                    <div>
                      <p className={`text-[11px] ${colors.text.muted}`}>Venda</p>
                      <p className={`font-semibold ${isDark ? "text-blue-300" : "text-blue-700"}`}>
                        {formatBRL(venda.valorVenda)}
                      </p>
                    </div>
                    <div>
                      <p className={`text-[11px] ${colors.text.muted}`}>Lucro</p>
                      <p className={`inline-flex items-center gap-1 font-bold ${
                        (venda.lucro ?? 0) >= 0
                          ? isDark ? "text-emerald-400" : "text-emerald-600"
                          : isDark ? "text-red-400" : "text-red-600"
                      }`}>
                        <TrendingUp className="h-3.5 w-3.5" />
                        {formatBRL(venda.lucro)}
                      </p>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setExcluirAlvo(venda)}
                    className={`flex-shrink-0 self-start rounded-xl p-2.5 transition-colors xl:self-center ${
                      isDark ? "text-red-400 hover:bg-red-500/15" : "text-red-500 hover:bg-red-50"
                    }`}
                    title="Excluir venda"
                  >
                    <Trash2 className="h-4 w-4" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Modal registrar venda */}
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
              <h3 className="text-lg font-semibold">Registrar venda</h3>
              <p className={`mt-1 text-sm ${colors.text.secondary}`}>
                O veículo será marcado como vendido e a comissão calculada automaticamente.
              </p>

              <div className="mt-5 space-y-3">
                <div>
                  <label className={`mb-1.5 block text-sm font-medium ${colors.text.secondary}`}>Veículo *</label>
                  <select
                    value={form.veiculoId}
                    onChange={(e) => selecionarVeiculo(e.target.value)}
                    className={selectClass}
                  >
                    <option value="">Selecione o veículo</option>
                    {veiculosDisponiveis.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.marca} {v.modelo} {v.anoModelo} — {formatBRL(v.valor)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className={`mb-1.5 block text-sm font-medium ${colors.text.secondary}`}>Valor da venda *</label>
                    <input
                      type="number"
                      min={0}
                      step={100}
                      value={form.valorVenda}
                      onChange={(e) => setForm((p) => ({ ...p, valorVenda: e.target.value }))}
                      className={inputClass}
                      placeholder="R$ 0,00"
                    />
                  </div>
                  <div>
                    <label className={`mb-1.5 block text-sm font-medium ${colors.text.secondary}`}>Data da venda</label>
                    <input
                      type="date"
                      value={form.dataVenda}
                      onChange={(e) => setForm((p) => ({ ...p, dataVenda: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className={`mb-1.5 block text-sm font-medium ${colors.text.secondary}`}>Vendedor</label>
                    <select
                      value={form.vendedorId}
                      onChange={(e) => setForm((p) => ({ ...p, vendedorId: e.target.value }))}
                      className={selectClass}
                    >
                      <option value="">Sem vendedor</option>
                      {vendedores.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.nome} ({v.percentualComissao}% comissão)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`mb-1.5 block text-sm font-medium ${colors.text.secondary}`}>Comprador</label>
                    <input
                      type="text"
                      value={form.nomeComprador}
                      onChange={(e) => setForm((p) => ({ ...p, nomeComprador: e.target.value }))}
                      className={inputClass}
                      placeholder="Nome do comprador"
                    />
                  </div>
                </div>

                <div>
                  <label className={`mb-1.5 block text-sm font-medium ${colors.text.secondary}`}>Observação</label>
                  <textarea
                    rows={2}
                    value={form.observacao}
                    onChange={(e) => setForm((p) => ({ ...p, observacao: e.target.value }))}
                    className={`${inputClass} resize-none`}
                    placeholder="Detalhes da negociação..."
                  />
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
                  {salvando ? "Registrando..." : "Registrar venda"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal excluir venda */}
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
              <h3 className="text-lg font-semibold">Excluir venda</h3>
              <p className={`mt-2 text-sm ${colors.text.secondary}`}>
                Excluir a venda do <b>{excluirAlvo.veiculoDescricao}</b>? O veículo voltará ao
                estoque como disponível.
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
