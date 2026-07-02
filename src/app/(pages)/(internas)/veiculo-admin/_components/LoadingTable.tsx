"use client";

import { useVeiculoTheme } from "./useVeiculoTheme";

interface LoadingTableProps {
  rows?: number;
}

/** Skeleton da tabela (sem spinner), imitando a densidade de cada linha. */
export default function LoadingTable({ rows = 6 }: LoadingTableProps) {
  const { isDark } = useVeiculoTheme();

  const base = isDark ? "bg-slate-700/40" : "bg-slate-200/70";
  const line = `animate-pulse rounded-md ${base}`;

  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className={`flex items-center gap-4 rounded-2xl border p-4 ${
            isDark ? "border-slate-800/60" : "border-slate-200/60"
          }`}
        >
          <div className={`${line} h-[70px] w-[90px] flex-shrink-0`} />
          <div className="flex-1 space-y-2">
            <div className={`${line} h-4 w-1/3`} />
            <div className={`${line} h-3 w-2/3`} />
            <div className={`${line} h-3 w-1/2`} />
          </div>
          <div className="hidden w-28 space-y-2 md:block">
            <div className={`${line} h-5 w-full`} />
            <div className={`${line} h-3 w-2/3`} />
          </div>
          <div className={`${line} hidden h-6 w-24 rounded-full lg:block`} />
          <div className="flex gap-2">
            <div className={`${line} h-8 w-8 rounded-lg`} />
            <div className={`${line} h-8 w-8 rounded-lg`} />
            <div className={`${line} hidden h-8 w-8 rounded-lg sm:block`} />
          </div>
        </div>
      ))}
    </div>
  );
}
