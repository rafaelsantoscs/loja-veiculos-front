"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

/**
 * Centraliza as classes de cor dependentes do tema, seguindo exatamente o
 * padrão já utilizado nas demais telas do projeto (dark/light).
 */
export function useVeiculoTheme() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = theme === "dark";

  const colors = {
    background: isDark
      ? "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black"
      : "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-50 via-blue-50 to-indigo-100",

    text: {
      primary: isDark ? "text-slate-100" : "text-slate-900",
      secondary: isDark ? "text-slate-400" : "text-slate-600",
      muted: isDark ? "text-slate-500" : "text-slate-400",
    },

    card: {
      background: isDark ? "bg-slate-900/40" : "bg-white/80",
      border: isDark ? "border-slate-800/60" : "border-slate-200/60",
      hover: isDark ? "hover:bg-slate-900/70" : "hover:bg-white/90",
      shadow: isDark
        ? "shadow-[0_0_0_1px_rgba(59,130,246,.2)]"
        : "shadow-[0_0_0_1px_rgba(59,130,246,.1)]",
    },

    input: {
      background: isDark ? "bg-slate-800/50" : "bg-white/50",
      border: isDark ? "border-slate-700" : "border-slate-300",
      text: isDark ? "text-slate-100" : "text-slate-900",
      placeholder: isDark ? "placeholder-slate-400" : "placeholder-slate-500",
    },
  };

  const inputClass = `w-full p-3 rounded-xl border ${colors.input.border} ${colors.input.background} ${colors.input.text} ${colors.input.placeholder} focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all backdrop-blur`;

  const selectClass = `w-full p-3 rounded-xl border ${colors.input.border} ${colors.input.background} ${colors.input.text} focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all backdrop-blur`;

  return { theme, setTheme, isDark, mounted, colors, inputClass, selectClass };
}
