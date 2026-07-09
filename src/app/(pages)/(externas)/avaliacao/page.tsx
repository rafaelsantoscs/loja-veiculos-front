"use client";

import React, { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Camera,
  Car,
  CheckCircle2,
  ImagePlus,
  LogIn,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { enviarAvaliacao } from "@/services/crmService";

const MAX_FOTOS = 8;

const inputClass =
  "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white";

function Navbar() {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-gray-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button
            onClick={() => router.push("/externo")}
            className="flex items-center gap-2 text-black hover:text-blue-600 transition-colors group font-medium text-sm"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="hidden sm:inline">Voltar ao catálogo</span>
          </button>

          <a href="/externo" className="flex items-center gap-2">
            <img
              src="/logo-232motors.png"
              alt="232 Motors"
              className="w-9 h-9 object-contain mix-blend-multiply"
            />
            <span className="text-lg font-extrabold text-black tracking-tight hidden sm:block">
              232<span className="text-blue-600">MOTORS</span>
            </span>
          </a>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/login")}
            className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all"
          >
            <LogIn className="w-4 h-4" />
            <span className="hidden sm:inline">Entrar</span>
          </motion.button>
        </div>
      </div>
    </header>
  );
}

export default function AvaliacaoPublica() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    marca: "",
    modelo: "",
    versao: "",
    anoModelo: "",
    quilometragem: "",
    valorPretendido: "",
    descricao: "",
  });
  const [fotos, setFotos] = useState<File[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [enviado, setEnviado] = useState(false);

  const previews = useMemo(
    () => fotos.map((f) => ({ file: f, url: URL.createObjectURL(f) })),
    [fotos],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErro("");
  };

  const adicionarFotos = (files: FileList | null) => {
    if (!files) return;
    const novas = Array.from(files).filter((f) => f.type.startsWith("image/"));
    setFotos((prev) => [...prev, ...novas].slice(0, MAX_FOTOS));
  };

  const removerFoto = (index: number) => {
    setFotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.nome.trim()) return setErro("Informe seu nome.");
    if (!form.email.trim() && !form.telefone.trim())
      return setErro("Informe e-mail ou telefone para contato.");
    if (!form.marca.trim() || !form.modelo.trim())
      return setErro("Informe a marca e o modelo do seu veículo.");

    setEnviando(true);
    setErro("");

    try {
      await enviarAvaliacao({
        nome: form.nome.trim(),
        email: form.email.trim() || undefined,
        telefone: form.telefone.trim() || undefined,
        marca: form.marca.trim(),
        modelo: form.modelo.trim(),
        versao: form.versao.trim() || undefined,
        anoModelo: form.anoModelo ? Number(form.anoModelo) : undefined,
        quilometragem: form.quilometragem ? Number(form.quilometragem) : undefined,
        valorPretendido: form.valorPretendido ? Number(form.valorPretendido) : undefined,
        descricao: form.descricao.trim() || undefined,
        fotos,
      });
      setEnviado(true);
    } catch {
      setErro("Não foi possível enviar sua solicitação. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  };

  if (enviado) {
    return (
      <div className="min-h-screen bg-[#F2F4F7] flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4 py-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-10 max-w-md text-center"
          >
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-50 flex items-center justify-center mb-5">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
            <h1 className="text-2xl font-extrabold text-black mb-2">Solicitação enviada!</h1>
            <p className="text-sm text-black/60 mb-6">
              Recebemos as informações do seu {form.marca} {form.modelo}. Nossa equipe vai
              avaliar e entrar em contato em breve com uma proposta.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/externo")}
              className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white font-bold py-3 rounded-xl text-sm transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao catálogo
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F4F7] font-sans text-gray-900 flex flex-col">
      <Navbar />

      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="max-w-3xl mx-auto"
        >
          {/* Cabeçalho */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-600 flex items-center justify-center mb-4 shadow-lg shadow-blue-600/25">
              <Car className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold text-black tracking-tight mb-2">
              Venda seu carro para a gente
            </h1>
            <p className="text-sm text-black/60 max-w-lg mx-auto">
              Envie as fotos e as informações do seu veículo usado. Nossa equipe faz a
              avaliação e retorna com uma proposta sem compromisso.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="bg-white rounded-3xl shadow-2xl shadow-gray-900/10 border border-gray-100/80 overflow-hidden">
              {/* Dados de contato */}
              <div className="px-6 py-6 sm:px-8 border-b border-black/10">
                <h2 className="text-[10px] font-extrabold text-black uppercase tracking-[0.15em] mb-4">
                  Seus dados
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input type="text" name="nome" value={form.nome} onChange={handleChange}
                    placeholder="Seu nome *" className={inputClass} />
                  <input type="email" name="email" value={form.email} onChange={handleChange}
                    placeholder="E-mail" className={inputClass} />
                  <input type="tel" name="telefone" value={form.telefone} onChange={handleChange}
                    placeholder="Telefone / WhatsApp" className={inputClass} />
                </div>
              </div>

              {/* Dados do veículo */}
              <div className="px-6 py-6 sm:px-8 border-b border-black/10">
                <h2 className="text-[10px] font-extrabold text-black uppercase tracking-[0.15em] mb-4">
                  Dados do veículo
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input type="text" name="marca" value={form.marca} onChange={handleChange}
                    placeholder="Marca *" className={inputClass} />
                  <input type="text" name="modelo" value={form.modelo} onChange={handleChange}
                    placeholder="Modelo *" className={inputClass} />
                  <input type="text" name="versao" value={form.versao} onChange={handleChange}
                    placeholder="Versão" className={inputClass} />
                  <input type="number" name="anoModelo" value={form.anoModelo} onChange={handleChange}
                    placeholder="Ano modelo" min={1950} max={new Date().getFullYear() + 1} className={inputClass} />
                  <input type="number" name="quilometragem" value={form.quilometragem} onChange={handleChange}
                    placeholder="Quilometragem" min={0} className={inputClass} />
                  <input type="number" name="valorPretendido" value={form.valorPretendido} onChange={handleChange}
                    placeholder="Valor pretendido (R$)" min={0} step={100} className={inputClass} />
                </div>
                <textarea
                  name="descricao"
                  value={form.descricao}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Conte mais sobre o carro: estado de conservação, revisões, detalhes..."
                  className={`${inputClass} mt-3 resize-none`}
                />
              </div>

              {/* Fotos */}
              <div className="px-6 py-6 sm:px-8 border-b border-black/10">
                <h2 className="text-[10px] font-extrabold text-black uppercase tracking-[0.15em] mb-4">
                  Fotos do veículo ({fotos.length}/{MAX_FOTOS})
                </h2>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    adicionarFotos(e.target.files);
                    e.target.value = "";
                  }}
                />

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <AnimatePresence>
                    {previews.map((p, i) => (
                      <motion.div
                        key={p.url}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="relative aspect-[4/3] rounded-xl overflow-hidden border border-gray-200 group"
                      >
                        <img src={p.url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removerFoto(i)}
                          className="absolute top-1.5 right-1.5 w-7 h-7 flex items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {fotos.length < MAX_FOTOS && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-[4/3] rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50/50 transition-all flex flex-col items-center justify-center gap-1.5 text-gray-400 hover:text-blue-600"
                    >
                      <ImagePlus className="w-6 h-6" />
                      <span className="text-xs font-semibold">Adicionar fotos</span>
                    </button>
                  )}
                </div>

                <p className="mt-3 text-xs text-black/40 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5" />
                  Dica: fotografe a frente, traseira, laterais, painel e interior.
                </p>
              </div>

              {/* Erro + enviar */}
              <div className="px-6 py-6 sm:px-8 space-y-4">
                <AnimatePresence>
                  {erro && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700"
                    >
                      <X className="w-4 h-4 flex-shrink-0" />
                      {erro}
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={enviando}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/25 transition-all text-sm disabled:opacity-60"
                >
                  <Send className="w-4 h-4" />
                  {enviando ? "Enviando..." : "Enviar para avaliação"}
                </motion.button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>

      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo-232motors.png" alt="232 Motors" className="w-9 h-9 object-contain mix-blend-multiply" />
            <span className="text-lg font-extrabold text-black tracking-tight">
              232<span className="text-blue-600">MOTORS</span>
            </span>
          </div>
          <p className="text-sm text-black/50 font-medium">
            © {new Date().getFullYear()} 232 Motors. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
