"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Camera,
  CheckCircle2,
  ImageOff,
  ImagePlus,
  Loader2,
  Star,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "react-toastify";

import axiosInstance from "@/services/axiosInstance";
import type { FotoVeiculo, Veiculo } from "@/types/veiculo";
import { useVeiculoTheme } from "./useVeiculoTheme";
import { uploadFotoVeiculo } from "./veiculo.utils";

interface FotoUploadModalProps {
  aberto: boolean;
  veiculo: Veiculo | null;
  onFechar: (fotosAtualizadas: FotoVeiculo[]) => void;
}

interface UploadItem {
  file: File;
  preview: string;
  status: "aguardando" | "enviando" | "ok" | "erro";
  erroMsg?: string;
}

/* ─── FotoCard ──────────────────────────────────────────────────
   Componente isolado para cada foto, com tratamento de erro e
   suporte a blob URL local (para exibir antes do servidor carregar).
────────────────────────────────────────────────────────────────── */
function FotoCard({
  foto,
  localUrl,
  excluindo,
  definindoPrincipal,
  onExcluir,
  onDefinirPrincipal,
}: {
  foto: FotoVeiculo;
  localUrl?: string;
  excluindo: number | null;
  definindoPrincipal: number | null;
  onExcluir: (f: FotoVeiculo) => void;
  onDefinirPrincipal: (f: FotoVeiculo) => void;
}) {
  const { isDark } = useVeiculoTheme();
  const [serverError, setServerError] = useState(false);

  // Preferência: blob URL local (recém enviada) → URL do servidor
  const displayUrl = localUrl ?? foto.url;
  const isLocal = !!localUrl;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="group relative overflow-hidden rounded-xl"
    >
      {serverError && !isLocal ? (
        /* Fallback só aparece se: não há blob local E a URL do servidor falhou */
        <div
          className={`flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 ${
            isDark ? "bg-slate-800 text-slate-500" : "bg-slate-100 text-slate-400"
          }`}
        >
          <ImageOff className="h-8 w-8" />
          <span className="px-2 text-center text-xs leading-tight">
            Imagem não disponível
          </span>
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={displayUrl}
          alt="Foto do veículo"
          className="aspect-[4/3] w-full object-cover"
          onError={() => {
            if (isLocal) return; // blob URL nunca falha — ignora
            setServerError(true);
          }}
        />
      )}

      {/* Overlay de ações */}
      <div className="absolute inset-0 flex flex-col justify-between bg-black/0 p-2 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
        {foto.principal && (
          <span className="self-start rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-white">
            Principal
          </span>
        )}

        <div className="flex items-end justify-between gap-1.5">
          {!foto.principal && (
            <button
              onClick={() => onDefinirPrincipal(foto)}
              disabled={!!definindoPrincipal}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/90 text-white transition-colors hover:bg-amber-500"
              title="Definir como foto principal"
            >
              {definindoPrincipal === foto.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Star className="h-4 w-4" />
              )}
            </button>
          )}
          <button
            onClick={() => onExcluir(foto)}
            disabled={!!excluindo}
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/90 text-white transition-colors hover:bg-red-600"
            title="Excluir foto"
          >
            {excluindo === foto.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Star permanente nas principais */}
      {foto.principal && (
        <span className="pointer-events-none absolute left-2 top-2 rounded-full bg-amber-500 p-1 text-white shadow-lg">
          <Star className="h-3 w-3 fill-current" />
        </span>
      )}
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   Modal principal
══════════════════════════════════════════════════════════════════ */
export default function FotoUploadModal({
  aberto,
  veiculo,
  onFechar,
}: FotoUploadModalProps) {
  const { isDark, colors } = useVeiculoTheme();

  const [fotos, setFotos] = useState<FotoVeiculo[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [excluindo, setExcluindo] = useState<number | null>(null);
  const [definindoPrincipal, setDefinindoPrincipal] = useState<number | null>(null);
  const [fila, setFila] = useState<UploadItem[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [arrastando, setArrastando] = useState(false);

  /**
   * Mapa fotoId → blob URL local.
   * Mantemos o blob vivo enquanto o modal está aberto para exibir
   * a foto imediatamente após o upload, antes do backend servir.
   */
  const [localUrls, setLocalUrls] = useState<Map<number, string>>(new Map());

  const inputRef = useRef<HTMLInputElement>(null);

  /* Busca fotos do veículo */
  const carregarFotos = useCallback(async () => {
    if (!veiculo) return;
    setCarregando(true);
    try {
      const { data } = await axiosInstance.get<FotoVeiculo[]>(
        `/veiculos/${veiculo.id}/fotos`,
      );
      const ordenadas = [...(data ?? [])].sort((a, b) => {
        if (a.principal && !b.principal) return -1;
        if (!a.principal && b.principal) return 1;
        return (a.ordem ?? 0) - (b.ordem ?? 0);
      });
      setFotos(ordenadas);
    } catch {
      setFotos([]);
    } finally {
      setCarregando(false);
    }
  }, [veiculo]);

  useEffect(() => {
    if (aberto && veiculo) {
      setFila([]);
      setLocalUrls(new Map());
      carregarFotos();
    }
  }, [aberto, veiculo, carregarFotos]);

  /* Adiciona arquivos à fila */
  const adicionarArquivos = (files: FileList | File[]) => {
    const novos: UploadItem[] = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, 20)
      .map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        status: "aguardando",
      }));
    setFila((prev) => [...prev, ...novos]);
  };

  /* Upload sequencial de todos os itens na fila */
  const enviarFila = async () => {
    if (!veiculo || enviando) return;
    setEnviando(true);

    let enviadas = 0;
    let falhas = 0;
    const snapshot = [...fila];

    for (let i = 0; i < snapshot.length; i++) {
      const item = snapshot[i];
      if (item.status !== "aguardando") continue;

      setFila((prev) =>
        prev.map((x, idx) => (idx === i ? { ...x, status: "enviando" } : x)),
      );

      try {
        const foto = await uploadFotoVeiculo(veiculo.id, item.file);

        /* Guarda o blob URL local antes de revogar — usado para exibição
           enquanto o backend ainda não serve o arquivo corretamente. */
        setLocalUrls((prev) => new Map(prev).set(foto.id, item.preview));

        setFotos((prev) =>
          [...prev, foto].sort((a, b) => {
            if (a.principal && !b.principal) return -1;
            if (!a.principal && b.principal) return 1;
            return (a.ordem ?? 0) - (b.ordem ?? 0);
          }),
        );

        setFila((prev) =>
          prev.map((x, idx) => (idx === i ? { ...x, status: "ok" } : x)),
        );

        enviadas++;
        toast.success(
          snapshot.length === 1
            ? "✅ Foto enviada com sucesso!"
            : `✅ Foto ${enviadas} enviada`,
          { toastId: `foto-ok-${veiculo.id}-${i}`, autoClose: 2500 },
        );
      } catch (err: any) {
        const msg =
          err?.response?.data?.message ??
          err?.response?.data ??
          err?.message ??
          "Falha no envio";
        console.error("[FotoUpload] erro:", err?.response?.status, msg);

        URL.revokeObjectURL(item.preview); // falhou — libera memória
        setFila((prev) =>
          prev.map((x, idx) =>
            idx === i ? { ...x, status: "erro", erroMsg: String(msg) } : x,
          ),
        );

        falhas++;
        toast.error(`❌ Falha ao enviar foto: ${String(msg)}`, {
          autoClose: 5000,
        });
      }
    }

    setEnviando(false);

    if (snapshot.length > 1) {
      if (falhas === 0) {
        toast.success(
          `🎉 ${enviadas} foto${enviadas !== 1 ? "s" : ""} enviada${enviadas !== 1 ? "s" : ""} com sucesso!`,
          { autoClose: 3500 },
        );
      } else if (enviadas > 0) {
        toast.warn(
          `⚠️ ${enviadas} enviada${enviadas !== 1 ? "s" : ""}, ${falhas} falha${falhas !== 1 ? "s" : ""}.`,
          { autoClose: 4000 },
        );
      }
    }

    setFila((prev) => prev.filter((x) => x.status !== "ok"));
  };

  /* Excluir foto */
  const excluirFoto = async (foto: FotoVeiculo) => {
    if (!veiculo) return;
    setExcluindo(foto.id);
    try {
      await axiosInstance.delete(`/veiculos/${veiculo.id}/fotos/${foto.id}`);
      setFotos((prev) => prev.filter((f) => f.id !== foto.id));
      setLocalUrls((prev) => {
        const next = new Map(prev);
        const blobUrl = next.get(foto.id);
        if (blobUrl) URL.revokeObjectURL(blobUrl);
        next.delete(foto.id);
        return next;
      });
      toast.success("Foto excluída.", { autoClose: 2000 });
    } catch {
      toast.error("Não foi possível excluir a foto.");
    } finally {
      setExcluindo(null);
    }
  };

  /* Definir foto principal */
  const definirPrincipal = async (foto: FotoVeiculo) => {
    if (!veiculo || foto.principal) return;
    setDefinindoPrincipal(foto.id);
    try {
      await axiosInstance.patch(
        `/veiculos/${veiculo.id}/fotos/${foto.id}/principal`,
      );
      setFotos((prev) =>
        prev.map((f) => ({ ...f, principal: f.id === foto.id })),
      );
      toast.success("Foto definida como principal.", { autoClose: 2000 });
    } catch {
      toast.error("Não foi possível definir a foto principal.");
    } finally {
      setDefinindoPrincipal(null);
    }
  };

  /* Drag & Drop */
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setArrastando(true);
  };
  const onDragLeave = () => setArrastando(false);
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setArrastando(false);
    adicionarArquivos(e.dataTransfer.files);
  };

  const fechar = () => {
    /* Libera todos os blob URLs locais */
    fila.forEach((i) => URL.revokeObjectURL(i.preview));
    localUrls.forEach((url) => URL.revokeObjectURL(url));
    setFila([]);
    setLocalUrls(new Map());
    onFechar(fotos);
  };

  const aguardando = fila.filter((i) => i.status === "aguardando").length;
  const erros = fila.filter((i) => i.status === "erro").length;

  return (
    <AnimatePresence>
      {aberto && veiculo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={fechar}
        >
          <motion.div
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.94, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className={`flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border shadow-2xl ${
              isDark
                ? "border-slate-700/60 bg-slate-900"
                : "border-slate-200/70 bg-white"
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-gradient-to-r from-blue-700 to-blue-600 px-6 py-4 text-white">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-white/20 p-2.5">
                  <Camera className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-bold">
                    Fotos — {veiculo.marca} {veiculo.modelo}
                  </h2>
                  <p className="text-sm text-blue-100">
                    {fotos.length} foto{fotos.length !== 1 ? "s" : ""}{" "}
                    cadastrada{fotos.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <button
                onClick={fechar}
                className="rounded-lg p-1.5 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {/* Fotos existentes */}
              {carregando ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2
                    className={`h-8 w-8 animate-spin ${
                      isDark ? "text-blue-400" : "text-blue-500"
                    }`}
                  />
                </div>
              ) : fotos.length === 0 ? (
                <div
                  className={`rounded-2xl border-2 border-dashed py-10 text-center ${
                    isDark
                      ? "border-slate-700 text-slate-500"
                      : "border-slate-300 text-slate-400"
                  }`}
                >
                  <Camera className="mx-auto mb-3 h-10 w-10 opacity-40" />
                  <p className="font-medium">Nenhuma foto ainda</p>
                  <p className="mt-1 text-sm">
                    Adicione fotos usando a área abaixo
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  <AnimatePresence>
                    {fotos.map((foto) => (
                      <FotoCard
                        key={foto.id}
                        foto={foto}
                        localUrl={localUrls.get(foto.id)}
                        excluindo={excluindo}
                        definindoPrincipal={definindoPrincipal}
                        onExcluir={excluirFoto}
                        onDefinirPrincipal={definirPrincipal}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {/* Fila de upload (pré-visualização) */}
              {fila.length > 0 && (
                <div className="mt-5">
                  <h4
                    className={`mb-3 text-sm font-semibold ${colors.text.secondary}`}
                  >
                    Para enviar ({fila.length})
                  </h4>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                    {fila.map((item, idx) => (
                      <div
                        key={idx}
                        className="relative overflow-hidden rounded-xl"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.preview}
                          alt="Preview"
                          className="aspect-[4/3] w-full object-cover"
                        />
                        {/* Status overlay */}
                        <div
                          className={`absolute inset-0 flex flex-col items-center justify-center gap-1 p-1 ${
                            item.status === "enviando"
                              ? "bg-black/40"
                              : item.status === "ok"
                                ? "bg-green-500/40"
                                : item.status === "erro"
                                  ? "bg-red-500/50"
                                  : "bg-transparent"
                          }`}
                        >
                          {item.status === "enviando" && (
                            <Loader2 className="h-6 w-6 animate-spin text-white" />
                          )}
                          {item.status === "ok" && (
                            <CheckCircle2 className="h-6 w-6 text-white" />
                          )}
                          {item.status === "erro" && (
                            <>
                              <X className="h-6 w-6 text-white" />
                              {item.erroMsg && (
                                <span className="max-w-full break-words text-center text-[10px] leading-tight text-white">
                                  {item.erroMsg}
                                </span>
                              )}
                            </>
                          )}
                        </div>

                        {/* Remover da fila (só aguardando) */}
                        {item.status === "aguardando" && (
                          <button
                            onClick={() =>
                              setFila((prev) => {
                                URL.revokeObjectURL(item.preview);
                                return prev.filter((_, i) => i !== idx);
                              })
                            }
                            className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                            aria-label="Remover"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Drag & Drop / Seleção de arquivos */}
              <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => inputRef.current?.click()}
                className={`mt-5 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed py-8 text-center transition-colors ${
                  arrastando
                    ? isDark
                      ? "border-blue-500 bg-blue-500/10 text-blue-400"
                      : "border-blue-400 bg-blue-50 text-blue-600"
                    : isDark
                      ? "border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-400"
                      : "border-slate-300 text-slate-400 hover:border-slate-400 hover:text-slate-500"
                }`}
              >
                <ImagePlus className="h-8 w-8" />
                <p className="font-medium">
                  {arrastando
                    ? "Solte as fotos aqui"
                    : "Arraste fotos ou clique para selecionar"}
                </p>
                <p className="text-xs opacity-70">
                  JPG, PNG, WEBP — múltiplas fotos de uma vez
                </p>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) adicionarArquivos(e.target.files);
                    e.target.value = "";
                  }}
                />
              </div>
            </div>

            {/* Footer */}
            <div
              className={`flex flex-col gap-3 border-t px-5 py-4 sm:flex-row sm:items-center sm:justify-between ${
                isDark ? "border-slate-800/60" : "border-slate-200/70"
              }`}
            >
              <div className={`text-sm ${colors.text.secondary}`}>
                {aguardando > 0 && (
                  <span>
                    {aguardando} foto{aguardando !== 1 ? "s" : ""} para enviar
                  </span>
                )}
                {erros > 0 && (
                  <span className="ml-2 text-red-500">
                    • {erros} erro{erros !== 1 ? "s" : ""}
                  </span>
                )}
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={fechar}
                  className={`rounded-xl px-5 py-2.5 font-medium transition-all ${
                    isDark
                      ? "bg-slate-700 text-slate-200 hover:bg-slate-600"
                      : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                  }`}
                >
                  {fila.length === 0 ? "Fechar" : "Cancelar"}
                </motion.button>

                {aguardando > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={enviarFila}
                    disabled={enviando}
                    className={`inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-2.5 font-medium text-white transition-all hover:from-blue-700 hover:to-blue-800 disabled:opacity-70 ${
                      enviando ? "cursor-not-allowed" : ""
                    }`}
                  >
                    {enviando ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    {enviando
                      ? "Enviando..."
                      : `Enviar ${aguardando} foto${aguardando !== 1 ? "s" : ""}`}
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
