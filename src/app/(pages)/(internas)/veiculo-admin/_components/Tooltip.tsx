"use client";

import { ReactNode, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useVeiculoTheme } from "./useVeiculoTheme";

interface TooltipProps {
  label: string;
  children: ReactNode;
}

/** Tooltip leve baseado em hover/focus, consistente com o tema do projeto. */
export default function Tooltip({ label, children }: TooltipProps) {
  const { isDark } = useVeiculoTheme();
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      <AnimatePresence>
        {open && (
          <motion.span
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`pointer-events-none absolute -top-9 left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-medium shadow-lg ${
              isDark
                ? "bg-slate-800 text-slate-100 ring-1 ring-slate-700"
                : "bg-slate-900 text-white"
            }`}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
