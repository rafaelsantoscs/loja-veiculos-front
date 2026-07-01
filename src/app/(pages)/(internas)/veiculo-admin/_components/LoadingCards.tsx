"use client";

import { useVeiculoTheme } from "./useVeiculoTheme";

interface LoadingCardsProps {
  count?: number;
}

/** Skeleton em grade de cards — sem spinner. */
export default function LoadingCards({ count = 8 }: LoadingCardsProps) {
  const { isDark } = useVeiculoTheme();
  const base = isDark ? "bg-slate-700/40" : "bg-slate-200/70";
  const s = `animate-pulse rounded-lg ${base}`;
  const card = isDark
    ? "border-slate-800/60 bg-slate-900/40"
    : "border-slate-200/60 bg-white/70";

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`overflow-hidden rounded-2xl border ${card}`}
        >
          {/* Foto */}
          <div className={`aspect-[4/3] w-full ${base} animate-pulse`} />
          {/* Info */}
          <div className="space-y-3 p-4">
            <div className="flex items-center justify-between">
              <div className={`${s} h-5 w-24`} />
              <div className={`${s} h-5 w-20 rounded-full`} />
            </div>
            <div className={`${s} h-6 w-3/4`} />
            <div className={`${s} h-4 w-1/2`} />
            <div className="flex gap-2">
              <div className={`${s} h-6 w-16 rounded-full`} />
              <div className={`${s} h-6 w-16 rounded-full`} />
              <div className={`${s} h-6 w-16 rounded-full`} />
            </div>
            <div className={`${s} h-8 w-2/3`} />
            <div className={`border-t pt-3 ${isDark ? "border-slate-800/60" : "border-slate-200/60"} flex gap-2`}>
              {Array.from({ length: 5 }).map((_, j) => (
                <div key={j} className={`${s} h-9 w-9 flex-shrink-0 rounded-lg`} />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
