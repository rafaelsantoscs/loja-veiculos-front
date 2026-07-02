"use client";

import { motion } from "framer-motion";
import { Car, CheckCircle2, Clock, DollarSign, XCircle } from "lucide-react";
import { useVeiculoTheme } from "./useVeiculoTheme";
import { formatBRL } from "./veiculo.utils";

interface DashboardCardsProps {
  total: number;
  disponiveis: number;
  reservados: number;
  vendidos: number;
  valorEstoque: number;
}

type Accent = "blue" | "green" | "yellow" | "red";

interface CardConfig {
  label: string;
  value: string | number;
  icon: React.ElementType;
  accent: Accent;
}

/** Cards de resumo do estoque exibidos no topo da tela. */
export default function DashboardCards({
  total,
  disponiveis,
  reservados,
  vendidos,
  valorEstoque,
}: DashboardCardsProps) {
  const { isDark } = useVeiculoTheme();

  const accents: Record<Accent, { card: string; iconWrap: string; icon: string; label: string }> = {
    blue: {
      card: isDark
        ? "border-blue-500/30 bg-blue-500/10 hover:border-blue-400/50"
        : "border-blue-400/30 bg-blue-50/80 hover:border-blue-300/50",
      iconWrap: isDark
        ? "bg-blue-500/20 ring-1 ring-blue-400/30"
        : "bg-blue-500/15 ring-1 ring-blue-400/20",
      icon: isDark ? "text-blue-400" : "text-blue-500",
      label: isDark ? "text-blue-300" : "text-blue-600",
    },
    green: {
      card: isDark
        ? "border-green-500/30 bg-green-500/10 hover:border-green-400/50"
        : "border-green-400/30 bg-green-50/80 hover:border-green-300/50",
      iconWrap: isDark
        ? "bg-green-500/20 ring-1 ring-green-400/30"
        : "bg-green-500/15 ring-1 ring-green-400/20",
      icon: isDark ? "text-green-400" : "text-green-500",
      label: isDark ? "text-green-300" : "text-green-600",
    },
    yellow: {
      card: isDark
        ? "border-yellow-500/30 bg-yellow-500/10 hover:border-yellow-400/50"
        : "border-yellow-400/30 bg-yellow-50/80 hover:border-yellow-300/50",
      iconWrap: isDark
        ? "bg-yellow-500/20 ring-1 ring-yellow-400/30"
        : "bg-yellow-500/15 ring-1 ring-yellow-400/20",
      icon: isDark ? "text-yellow-400" : "text-yellow-500",
      label: isDark ? "text-yellow-300" : "text-yellow-600",
    },
    red: {
      card: isDark
        ? "border-red-500/30 bg-red-500/10 hover:border-red-400/50"
        : "border-red-400/30 bg-red-50/80 hover:border-red-300/50",
      iconWrap: isDark
        ? "bg-red-500/20 ring-1 ring-red-400/30"
        : "bg-red-500/15 ring-1 ring-red-400/20",
      icon: isDark ? "text-red-400" : "text-red-500",
      label: isDark ? "text-red-300" : "text-red-600",
    },
  };

  const cards: CardConfig[] = [
    { label: "Total de veículos", value: total, icon: Car, accent: "blue" },
    { label: "Disponíveis", value: disponiveis, icon: CheckCircle2, accent: "green" },
    { label: "Reservados", value: reservados, icon: Clock, accent: "yellow" },
    { label: "Vendidos", value: vendidos, icon: XCircle, accent: "red" },
  ];

  return (
    <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card, index) => {
        const a = accents[card.accent];
        const Icon = card.icon;
        return (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.08 }}
            whileHover={{ y: -4 }}
            className={`group rounded-2xl border p-5 shadow-sm backdrop-blur transition-all hover:shadow-xl ${a.card}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`mb-2 text-sm ${a.label}`}>{card.label}</p>
                <p className="text-3xl font-bold">{card.value}</p>
              </div>
              <div className={`rounded-xl p-3 transition-transform group-hover:scale-110 ${a.iconWrap}`}>
                <Icon className={`h-6 w-6 ${a.icon}`} />
              </div>
            </div>
          </motion.div>
        );
      })}

      {/* Valor do estoque — card destacado, ocupa espaço maior no mobile */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 + cards.length * 0.08 }}
        whileHover={{ y: -4 }}
        className={`group relative overflow-hidden rounded-2xl border p-5 shadow-sm backdrop-blur transition-all hover:shadow-xl sm:col-span-2 xl:col-span-1 ${
          isDark
            ? "border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 to-blue-500/10 hover:border-indigo-400/50"
            : "border-indigo-400/30 bg-gradient-to-br from-indigo-50/90 to-blue-50/80 hover:border-indigo-300/50"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className={`mb-2 text-sm ${isDark ? "text-indigo-300" : "text-indigo-600"}`}>
              Valor do estoque
            </p>
            <p className="truncate text-2xl font-bold xl:text-[1.7rem]">
              {formatBRL(valorEstoque)}
            </p>
          </div>
          <div
            className={`rounded-xl p-3 transition-transform group-hover:scale-110 ${
              isDark
                ? "bg-indigo-500/20 ring-1 ring-indigo-400/30"
                : "bg-indigo-500/15 ring-1 ring-indigo-400/20"
            }`}
          >
            <DollarSign className={`h-6 w-6 ${isDark ? "text-indigo-400" : "text-indigo-500"}`} />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
