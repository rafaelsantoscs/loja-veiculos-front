"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Check,
  Mail,
  Pencil,
  Phone,
  PlusCircle,
  Trash2,
  UserRound,
} from "lucide-react";

import { useVeiculoTheme } from "@/app/(pages)/(internas)/veiculo-admin/_components/useVeiculoTheme";
import { formatBRL } from "@/app/(pages)/(internas)/veiculo-admin/_components/veiculo.utils";
import {
  excluirVendedor,
  getVendasPorVendedor,
  listarVendedores,
  salvarVendedor,
} from "@/services/crmService";
import type { VendaPorVendedor, Vendedor } from "@/types/crm";

import CrmShell from "../../crm/_components/CrmShell";

interface FormVendedor {
  id?: number;
  nome: string;
  email: string;
  telefone: string;
  percentualComissao: string;
  ativo: boolean;
}

const FORM_VAZIO: FormVendedor = {
  nome: "",
  email: "",
  telefone: "",
  percentualComissao: "1",
  ativo: true,
};

export default function VendedoresPage() {
  const { isDark, mounted, colors, inputClass } = useVeiculoTheme();

  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [desempenho, setDesempenho] = useState<VendaPorVendedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const [modalAberto, setModalAberto] = useState(false);
  const [form, setForm] = useState<FormVendedor>(FORM_VAZIO);
  const [salvando, setSalvando] = useState(false);
  const [excluirAlvo, setExcluirAlvo] = useState<Vendedor | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  const notificar = (tipo: "success" | "error", msg: string) => {
    if (tipo === "success") setSucesso(msg);
    else setErro(msg);
    setTimeout(() => (tipo === "success" ? setSucesso("") : setErro("")), 3500);
  };

  const carregar = async () => {
    setLoading(true);
    try {
      const [vs, ds] = await Promise.all([listarVendedores(), getVendasPorVendedor()]);
      setVendedores(vs);
      setDesempenho(ds);
    } catch {
      setErro("Não foi possível carregar os vendedores.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const desempenhoPorNome = useMemo(() => {
    const mapa: Record<string, VendaPorVendedor> = {};
    desempenho.forEach((d) => { mapa[d.vendedor] = d; });
    return mapa;
  }, [desempenho]);

  const abrirNovo = () => {
    setForm(FORM_VAZIO);
    setModalAberto(true);
  };

  const abrirEdicao = (v: Vendedor) => {
    setForm({
      id: v.id,
      nome: v.nome,
      email: v.email ?? "",
      telefone: v.telefone ?? "",
      percentualComissao: String(v.percentualComissao ?? 0),
      ativo: v.ativo,
    });
    setModalAberto(true);
  };

  const salvar = async () => {
    if (!form.nome.trim()) return notificar("error", "Informe o nome do vendedor.");

    setSalvando(true);
    try {
      await salvarVendedor({
        id: form.id,
        nome: form.nome.trim(),
        email: form.email.trim() || undefined,
        telefone: form.telefone.trim() || undefined,
        percentualComissao: Number(form.percentualComissao) || 0,
        ativo: form.ativo,
      });
      notificar("success", form.id ? "Vendedor atualizado." : "Vendedor cadastrado.");
      setModalAberto(false);
      carregar();
    } catch {
      notificar("error", "Não foi possível salvar o vendedor.");
    } finally {
      setSalvando(false);
    }
  };

  const confirmarExclusao = async () => {
    if (!excluirAlvo) return;
    setExcluindo(true);
    try {
      await excluirVendedor(excluirAlvo.id);
      notificar("success", "Vendedor excluído.");
      setExcluirAlvo(null);
      carregar();
    } catch {
      notificar("error", "Não foi possível excluir. Verifique se há vendas vinculadas a ele.");
    } finally {
      setExcluindo(false);
    }
  };

  return (
    <CrmShell
      categoria="Gestão da Loja"
      titulo="Vendedores"
      subtitulo="Cadastre a equipe e acompanhe vendas e comissões calculadas automaticamente."
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

      <div className="mt-6 flex justify-end">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={abrirNovo}
          className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 font-medium text-white transition-all hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          Novo Vendedor
        </motion.button>
      </div>

      <section className="mt-4">
        {loading || !mounted ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 animate-pulse">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-48 rounded-2xl bg-slate-300/20" />
            ))}
          </div>
        ) : vendedores.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-2xl border p-12 text-center backdrop-blur ${colors.card.border} ${colors.card.background}`}
          >
            <UserRound className={`mx-auto mb-4 h-12 w-12 ${colors.text.muted}`} />
            <h3 className="font-semibold">Nenhum vendedor cadastrado</h3>
            <p className={`mt-1 text-sm ${colors.text.secondary}`}>
              Cadastre a equipe para atribuir leads e calcular comissões automaticamente.
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {vendedores.map((v, i) => {
              const d = desempenhoPorNome[v.nome];
              return (
                <motion.div
                  key={v.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.07, 0.4) }}
                  whileHover={{ y: -4 }}
                  className={`rounded-2xl border p-5 shadow-sm backdrop-blur transition-all hover:shadow-xl ${colors.card.border} ${colors.card.background}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-xl text-lg font-bold ${
                        isDark ? "bg-blue-500/20 text-blue-300 ring-1 ring-blue-400/30" : "bg-blue-500/15 text-blue-600 ring-1 ring-blue-400/20"
                      }`}>
                        {v.nome.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold">{v.nome}</p>
                        <span className={`text-[11px] font-semibold ${
                          v.ativo
                            ? isDark ? "text-green-400" : "text-green-600"
                            : isDark ? "text-slate-500" : "text-slate-400"
                        }`}>
                          {v.ativo ? "● Ativo" : "● Inativo"}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-1">
                      <button
                        onClick={() => abrirEdicao(v)}
                        className={`rounded-lg p-2 transition-colors ${
                          isDark ? "text-slate-400 hover:bg-slate-700/60" : "text-slate-500 hover:bg-slate-200/60"
                        }`}
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setExcluirAlvo(v)}
                        className={`rounded-lg p-2 transition-colors ${
                          isDark ? "text-red-400 hover:bg-red-500/15" : "text-red-500 hover:bg-red-50"
                        }`}
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className={`mt-3 space-y-1 text-xs ${colors.text.secondary}`}>
                    {v.telefone && (
                      <p className="inline-flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />{v.telefone}</p>
                    )}
                    {v.email && (
                      <p className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />{v.email}</p>
                    )}
                  </div>

                  <div className={`mt-4 grid grid-cols-3 gap-2 rounded-xl border p-3 text-center ${colors.card.border} ${
                    isDark ? "bg-slate-800/40" : "bg-slate-50/80"
                  }`}>
                    <div>
                      <p className={`text-[10px] uppercase tracking-wide ${colors.text.muted}`}>Vendas</p>
                      <p className="text-lg font-bold">{d?.quantidade ?? 0}</p>
                    </div>
                    <div>
                      <p className={`text-[10px] uppercase tracking-wide ${colors.text.muted}`}>Comissão</p>
                      <p className={`text-sm font-bold ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
                        {formatBRL(d?.comissao ?? 0)}
                      </p>
                    </div>
                    <div>
                      <p className={`text-[10px] uppercase tracking-wide ${colors.text.muted}`}>% Comissão</p>
                      <p className="text-lg font-bold">{v.percentualComissao}%</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* Modal cadastro/edição */}
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
              className={`w-full max-w-md rounded-2xl border p-6 backdrop-blur ${
                isDark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"
              }`}
            >
              <h3 className="text-lg font-semibold">{form.id ? "Editar vendedor" : "Novo vendedor"}</h3>

              <div className="mt-5 space-y-3">
                <div>
                  <label className={`mb-1.5 block text-sm font-medium ${colors.text.secondary}`}>Nome *</label>
                  <input
                    type="text"
                    value={form.nome}
                    onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))}
                    className={inputClass}
                    placeholder="Nome do vendedor"
                  />
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className={`mb-1.5 block text-sm font-medium ${colors.text.secondary}`}>Telefone</label>
                    <input
                      type="tel"
                      value={form.telefone}
                      onChange={(e) => setForm((p) => ({ ...p, telefone: e.target.value }))}
                      className={inputClass}
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                  <div>
                    <label className={`mb-1.5 block text-sm font-medium ${colors.text.secondary}`}>Comissão (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={0.1}
                      value={form.percentualComissao}
                      onChange={(e) => setForm((p) => ({ ...p, percentualComissao: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className={`mb-1.5 block text-sm font-medium ${colors.text.secondary}`}>E-mail</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    className={inputClass}
                    placeholder="email@exemplo.com"
                  />
                </div>
                <label className="flex cursor-pointer items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={form.ativo}
                    onChange={(e) => setForm((p) => ({ ...p, ativo: e.target.checked }))}
                    className="h-4 w-4 rounded accent-blue-600"
                  />
                  <span className="text-sm">Vendedor ativo</span>
                </label>
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
                  {salvando ? "Salvando..." : "Salvar"}
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
              <h3 className="text-lg font-semibold">Excluir vendedor</h3>
              <p className={`mt-2 text-sm ${colors.text.secondary}`}>
                Tem certeza que deseja excluir <b>{excluirAlvo.nome}</b>?
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
