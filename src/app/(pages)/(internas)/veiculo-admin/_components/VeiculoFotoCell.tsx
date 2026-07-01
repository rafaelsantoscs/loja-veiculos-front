"use client";

import { useEffect, useRef, useState } from "react";
import { Car } from "lucide-react";
import axiosInstance from "@/services/axiosInstance";
import type { FotoVeiculo } from "@/types/veiculo";
import { useVeiculoTheme } from "./useVeiculoTheme";

interface VeiculoFotoCellProps {
  veiculoId: number;
  fotoPrincipal?: string | null;
  alt: string;
}

// Cache em memória para evitar múltiplas requisições da mesma galeria.
const fotoCache = new Map<number, string | null>();

/**
 * Célula de foto principal do veículo (90x70, cantos arredondados).
 * Busca a galeria sob demanda quando a URL não vem embutida no veículo.
 */
export default function VeiculoFotoCell({
  veiculoId,
  fotoPrincipal,
  alt,
}: VeiculoFotoCellProps) {
  const { isDark } = useVeiculoTheme();
  const [url, setUrl] = useState<string | null>(fotoPrincipal ?? fotoCache.get(veiculoId) ?? null);
  const [erro, setErro] = useState(false);
  const tentou = useRef(false);

  useEffect(() => {
    if (fotoPrincipal || url || fotoCache.has(veiculoId) || tentou.current) return;
    tentou.current = true;
    let ativo = true;

    axiosInstance
      .get<FotoVeiculo[]>(`/veiculos/${veiculoId}/fotos`)
      .then((res) => {
        const fotos = res.data ?? [];
        const principal = fotos.find((f) => f.principal) ?? fotos[0];
        const nova = principal?.url ?? null;
        fotoCache.set(veiculoId, nova);
        if (ativo) setUrl(nova);
      })
      .catch(() => {
        fotoCache.set(veiculoId, null);
        if (ativo) setUrl(null);
      });

    return () => {
      ativo = false;
    };
  }, [veiculoId, fotoPrincipal, url]);

  const mostrarPlaceholder = !url || erro;

  return (
    <div
      className={`flex h-[70px] w-[90px] flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border ${
        isDark ? "border-slate-700/60 bg-slate-800/50" : "border-slate-200 bg-slate-100"
      }`}
    >
      {mostrarPlaceholder ? (
        <Car className={`h-7 w-7 ${isDark ? "text-slate-600" : "text-slate-400"}`} />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url as string}
          alt={alt}
          loading="lazy"
          onError={() => setErro(true)}
          className="h-full w-full object-cover"
        />
      )}
    </div>
  );
}
