"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  BarChart3,
  Car,
  ClipboardCheck,
  DollarSign,
  Landmark,
  LayoutDashboard,
  Moon,
  Receipt,
  Sun,
  UserRound,
  Users,
} from "lucide-react";

import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { getUserLocalStorage } from "@/store/userLocalStorage";
import { useVeiculoTheme } from "@/app/(pages)/(internas)/veiculo-admin/_components/useVeiculoTheme";

/* ── Navegação entre as telas do CRM / Gestão ───────────────────── */

const NAV_ITEMS = [
  { href: "/crm", label: "Dashboard", icon: LayoutDashboard },
  { href: "/crm/leads", label: "Leads", icon: Users },
  { href: "/gestao/vendas", label: "Vendas", icon: DollarSign },
  { href: "/gestao/vendedores", label: "Vendedores", icon: UserRound },
  { href: "/gestao/despesas", label: "Despesas", icon: Receipt },
  { href: "/gestao/fluxo-caixa", label: "Fluxo de Caixa", icon: Landmark },
  { href: "/gestao/avaliacoes", label: "Avaliações", icon: ClipboardCheck },
  { href: "/crm/relatorios", label: "Relatórios", icon: BarChart3 },
];

function ThemeToggle() {
  const { theme, setTheme, mounted } = useVeiculoTheme();
  if (!mounted) return <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-200/60" />;
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 ${
        theme === "dark"
          ? "bg-slate-800/60 text-yellow-400 ring-1 ring-slate-700/30 hover:bg-slate-700/60"
          : "bg-slate-200/60 text-orange-500 ring-1 ring-slate-300/30 hover:bg-slate-300/60"
      }`}
    >
      <motion.div
        initial={false}
        animate={{ rotate: theme === "dark" ? 0 : 180, scale: theme === "dark" ? 1 : 0.8 }}
        transition={{ duration: 0.3 }}
      >
        {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </motion.div>
    </motion.button>
  );
}

interface CrmShellProps {
  categoria: string;
  titulo: string;
  subtitulo?: string;
  children: React.ReactNode;
}

/**
 * Casca padrão das telas do CRM / Gestão da Loja: header, tabs de
 * navegação entre módulos, efeitos de fundo e footer.
 */
export default function CrmShell({ categoria, titulo, subtitulo, children }: CrmShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isDark, mounted, colors } = useVeiculoTheme();
  const user = getUserLocalStorage() || {};

  return (
    <DefaultLayout>
      <div
        className={`relative min-h-dvh w-full overflow-hidden ${
          mounted ? colors.background : "bg-slate-50"
        } ${colors.text.primary}`}
      >
        {/* Efeitos de fundo */}
        {mounted && isDark && (
          <>
            <div className="pointer-events-none absolute inset-0 opacity-50 [background:repeating-linear-gradient(0deg,rgba(255,255,255,.03)_0px,rgba(255,255,255,.03)_1px,transparent_1px,transparent_3px)]" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1000px_300px_at_50%_-20%,rgba(59,130,246,.25),transparent)]" />
          </>
        )}
        {mounted && !isDark && (
          <>
            <div className="pointer-events-none absolute inset-0 opacity-30 [background:repeating-linear-gradient(0deg,rgba(0,0,0,.02)_0px,rgba(0,0,0,.02)_1px,transparent_1px,transparent_3px)]" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1000px_300px_at_50%_-20%,rgba(59,130,246,.15),transparent)]" />
          </>
        )}

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                isDark ? "bg-blue-500/20 ring-1 ring-blue-400/30" : "bg-blue-500/15 ring-1 ring-blue-400/20"
              }`}
            >
              <Car className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <p className={`text-xs/4 ${colors.text.secondary}`}>{categoria}</p>
              <h1 className="font-semibold tracking-wide">{titulo}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <span className={`hidden text-xs sm:block ${colors.text.secondary}`}>
              {user.nomeCompleto || "Administrador"}
            </span>
          </div>
        </div>

        <main className="relative z-10 mx-auto max-w-[1400px] px-4 pb-24 sm:px-6">
          {/* Título */}
          <section className="pt-4">
            <motion.h2
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-semibold md:text-3xl"
            >
              {titulo}
            </motion.h2>
            {subtitulo && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className={`mt-1 text-sm ${colors.text.secondary}`}
              >
                {subtitulo}
              </motion.p>
            )}
          </section>

          {/* Tabs de navegação do módulo */}
          <motion.nav
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`mt-5 flex gap-1.5 overflow-x-auto rounded-2xl border p-1.5 backdrop-blur ${colors.card.border} ${colors.card.background}`}
          >
            {NAV_ITEMS.map((item) => {
              const ativo = pathname === item.href;
              const Icon = item.icon;
              return (
                <button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  className={`flex flex-shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                    ativo
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow"
                      : isDark
                        ? "text-slate-300 hover:bg-slate-800/70"
                        : "text-slate-600 hover:bg-slate-200/70"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </motion.nav>

          {children}
        </main>

        <footer className={`relative z-10 mx-auto max-w-[1400px] px-6 pb-8 pt-6 text-center text-xs ${colors.text.muted}`}>
          © {new Date().getFullYear()} – Sistema de Gestão de Veículos. Desenvolvido com Next.js e Tailwind.
        </footer>
      </div>
    </DefaultLayout>
  );
}
