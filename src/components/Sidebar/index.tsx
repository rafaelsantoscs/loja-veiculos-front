"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Home,
  Building,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Sun,
  Moon,
  ClipboardList,
  UserRound,
  ShieldCheck,
  DoorOpen,
  LogOut,
  Car,
} from "lucide-react";
import { useTheme } from "next-themes";
import { clearUserLocalStorage } from "@/store/userLocalStorage";

interface SidebarSubItem {
  title: string;
  href: string;
  description?: string;
}

interface SidebarItem {
  title: string;
  href?: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  description?: string;
  children?: SidebarSubItem[];
}

interface SidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

// Componente do Botão de Tema
function ThemeToggle({ size = "default" }: { size?: "default" | "small" }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  if (!mounted) {
    return (
      <div className={`${size === "small" ? "w-8 h-8" : "w-10 h-10"} rounded-xl bg-slate-200/60 animate-pulse`} />
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      className={`
        relative flex items-center justify-center rounded-xl
        transition-all duration-300
        ${size === "small" ? "w-8 h-8" : "w-10 h-10"}
        ${theme === 'dark' 
          ? 'bg-slate-800/60 ring-1 ring-slate-700/30 hover:bg-slate-700/60 text-yellow-400' 
          : 'bg-slate-200/60 ring-1 ring-slate-300/30 hover:bg-slate-300/60 text-orange-500'
        }
      `}
      title={theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
    >
      <motion.div
        initial={false}
        animate={{ 
          rotate: theme === 'dark' ? 0 : 180,
          scale: theme === 'dark' ? 1 : 0.8 
        }}
        transition={{ duration: 0.3 }}
      >
        {theme === 'dark' ? (
          <Sun className={size === "small" ? "w-4 h-4" : "w-5 h-5"} />
        ) : (
          <Moon className={size === "small" ? "w-4 h-4" : "w-5 h-5"} />
        )}
      </motion.div>
    </motion.button>
  );
}

export default function SidebarGamificada({ isOpen = true, onToggle }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [collapsed, setCollapsed] = useState(!isOpen);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Cores dinâmicas baseadas no tema
  const colors = {
    background: theme === 'dark' 
      ? 'bg-slate-900/95 backdrop-blur-md'
      : 'bg-white/95 backdrop-blur-md',
    
    border: theme === 'dark' 
      ? 'border-slate-800/60' 
      : 'border-slate-200/60',
    
    text: {
      primary: theme === 'dark' ? 'text-slate-100' : 'text-slate-900',
      secondary: theme === 'dark' ? 'text-slate-400' : 'text-slate-600',
      muted: theme === 'dark' ? 'text-slate-500' : 'text-slate-400',
    },
    
    hover: theme === 'dark' 
      ? 'hover:bg-slate-800/60 hover:text-slate-100' 
      : 'hover:bg-slate-100/80 hover:text-slate-900',
    
    active: theme === 'dark' 
      ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' 
      : 'bg-blue-500/15 text-blue-600 border-blue-400/30',
  };

  const sidebarItems: SidebarItem[] = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      description: 'Visão geral do sistema'
    },
    {
      title: 'Veículos',
      icon: Car,
      description: 'Gestão do estoque',
      children: [
        {
          title: 'Estoque',
          href: '/veiculo-admin',
          description: 'Listar e gerenciar veículos'
        },
        {
          title: 'Novo Veículo',
          href: '/veiculo-admin/novo-veiculo',
          description: 'Cadastrar um novo veículo'
        }
      ]
    },
    {
      title: 'Formulários',
      href: '/formularios',
      icon: ClipboardList,
      description: 'Central de formulários'
    },
    {
      title: 'Chamados',
      icon: Building,
      description: 'Sistema de chamados',
      children: [
        {
          title: 'Novo Chamado',
          href: '/formularios/chamados',
          description: 'Criar novo chamado'
        },
        {
          title: 'Listar Chamados',
          href: '/formularios/chamados/listar-chamados',
          description: 'Ver todos os chamados'
        }
      ]
    },
    {
      title: 'Materiais',
      icon: DoorOpen,
      description: 'Controle de materiais',
      children: [
        {
          title: 'Cadastrar Material',
          href: '/formularios/materiais',
          description: 'Adicionar novo material'
        },
        {
          title: 'Listar Materiais',
          href: '/formularios/materiais/listar-materiais',
          description: 'Ver todos os materiais'
        }
      ]
    },
    {
      title: 'Manutenção',
      icon: Settings,
      description: 'Ordem de serviços',
      children: [
        {
          title: 'Nova OS',
          href: '/formularios/manutencao',
          description: 'Criar ordem de serviço'
        },
        {
          title: 'OS Abertas',
          href: '/formularios/manutencao/abertas',
          description: 'Ver ordens abertas'
        }
      ]
    },
    {
      title: 'Tarefas',
      icon: ClipboardList,
      description: 'Gerenciar tarefas',
      children: [
        {
          title: 'Minhas Tarefas',
          href: '/formularios/tarefas',
          description: 'Ver tarefas atribuídas'
        },
        {
          title: 'Gerenciar Tarefas',
          href: '/formularios/tarefas/gerenciar',
          description: 'Criar e atribuir tarefas'
        }
      ]
    },
    {
      title: 'Unidades',
      icon: Building,
      description: 'Gerenciar unidades',
      children: [
        {
          title: 'Cadastrar Unidade',
          href: '/formularios/cadastrar-unidade',
          description: 'Adicionar nova unidade'
        },
        {
          title: 'Listar Unidades',
          href: '/formularios/cadastrar-unidade/listar-unidades',
          description: 'Ver todas as unidades'
        }
      ]
    },
    {
      title: 'Perfil',
      href: '/profile-ls',
      icon: UserRound,
      description: 'Meu perfil'
    }
  ];

  const adminItems: SidebarItem[] = [
    {
      title: 'Usuários',
      href: '/administrador/geral/usuarios-sistema',
      icon: Users,
      description: 'Gerenciar usuários'
    },
    {
      title: 'Colaboradores',
      href: '/administrador/colaboradores',
      icon: UserRound,
      description: 'Gerenciar colaboradores'
    },
    {
      title: 'Controle Acesso',
      href: '/administrador/controle-de-acesso',
      icon: ShieldCheck,
      description: 'Permissões e acessos'
    },
    {
      title: 'Notificações',
      href: '/administrador/notificacao',
      icon: Settings,
      description: 'Central de notificações'
    }
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    clearUserLocalStorage();
    router.push('/');
  };

  const handleToggle = () => {
    setCollapsed(!collapsed);
    onToggle?.();
  };

  const handleNavigation = (href: string, event?: React.MouseEvent) => {
    event?.preventDefault();
    router.push(href);
  };

  const toggleSubmenu = (itemTitle: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemTitle)) {
      newExpanded.delete(itemTitle);
    } else {
      newExpanded.add(itemTitle);
    }
    setExpandedItems(newExpanded);
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    return pathname === href || pathname.startsWith(href + '/');
  };

  const isItemActive = (item: SidebarItem) => {
    if (item.href && isActive(item.href)) return true;
    if (item.children) {
      return item.children.some(child => isActive(child.href));
    }
    return false;
  };

  if (!mounted) {
    return (
      <div className={`fixed left-0 top-0 h-full ${
        collapsed ? 'w-20' : 'w-80'
      } ${colors.background} ${colors.border} border-r transition-all duration-300 z-40`}>
        <div className="flex flex-col h-full">
          {/* Header Skeleton */}
          <div className="p-4 border-b border-slate-700/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-700/30 rounded-xl animate-pulse" />
              {!collapsed && (
                <div className="space-y-2">
                  <div className="h-4 bg-slate-700/30 rounded animate-pulse w-24" />
                  <div className="h-3 bg-slate-700/30 rounded animate-pulse w-32" />
                </div>
              )}
            </div>
          </div>
          
          {/* Menu Items Skeleton */}
          <div className="flex-1 p-4 space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-700/30 animate-pulse">
                <div className="w-6 h-6 bg-slate-600/30 rounded" />
                {!collapsed && <div className="h-4 bg-slate-600/30 rounded flex-1" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Overlay para mobile */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setCollapsed(true)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{ 
          width: collapsed ? 80 : 320,
          x: collapsed ? 0 : 0
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`fixed left-0 top-0 h-full ${colors.background} ${colors.border} border-r backdrop-blur-md z-40 shadow-2xl`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={`p-4 border-b ${theme === 'dark' ? 'border-slate-800/60' : 'border-slate-200/60'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className={`flex items-center justify-center rounded-xl ${
                    theme === 'dark' 
                      ? 'bg-blue-500/20 ring-1 ring-blue-400/30' 
                      : 'bg-blue-500/15 ring-1 ring-blue-400/20'
                  } ${collapsed ? 'w-10 h-10' : 'w-12 h-12'}`}
                >
                  <Building className={collapsed ? "w-5 h-5" : "w-6 h-6"} />
                </motion.div>
                
                <AnimatePresence>
                  {!collapsed && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="flex-1 min-w-0"
                    >
                      <h1 className="font-bold text-lg leading-tight truncate">
                        Sistema CTIC
                      </h1>
                      <p className="text-xs text-slate-400 truncate">
                        Gestão de TI • v2.0
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Botão Toggle */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleToggle}
                className={`flex items-center justify-center rounded-lg ${
                  theme === 'dark' 
                    ? 'bg-slate-800/60 hover:bg-slate-700/60 text-slate-400' 
                    : 'bg-slate-200/60 hover:bg-slate-300/60 text-slate-600'
                } transition-colors ${collapsed ? 'w-8 h-8' : 'w-8 h-8'}`}
              >
                {collapsed ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ChevronLeft className="w-4 h-4" />
                )}
              </motion.button>
            </div>
          </div>

          {/* Conteúdo da Sidebar */}
          <div className="flex-1 overflow-y-auto">
            {/* Seção Principal */}
            <div className="p-4">
              <AnimatePresence>
                {!collapsed && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6"
                  >
                    <h3 className={`text-xs font-semibold uppercase tracking-wider ${colors.text.muted} mb-3`}>
                      Navegação Principal
                    </h3>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-1">
                {sidebarItems.map((item) => (
                  <div key={item.title}>
                    <motion.button
                      onClick={(event) => {
                        if (item.href) {
                          handleNavigation(item.href, event);
                        } else if (item.children) {
                          toggleSubmenu(item.title);
                        }
                      }}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 group ${
                        isItemActive(item)
                          ? colors.active
                          : `${colors.border} ${colors.hover} ${colors.text.secondary}`
                      } ${collapsed ? 'justify-center' : ''}`}
                    >
                      <item.icon className={`flex-shrink-0 ${
                        collapsed ? "w-5 h-5" : "w-5 h-5"
                      } ${isItemActive(item) ? 'text-current' : ''}`} />
                      
                      <AnimatePresence>
                        {!collapsed && (
                          <motion.div
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: "auto" }}
                            exit={{ opacity: 0, width: 0 }}
                            className="flex-1 min-w-0 text-left"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <span className="font-medium block truncate">
                                  {item.title}
                                </span>
                                <span className={`text-xs truncate ${
                                  theme === 'dark' ? 'text-slate-500' : 'text-slate-500'
                                }`}>
                                  {item.description}
                                </span>
                              </div>
                              {item.children && (
                                <ChevronDown className={`w-4 h-4 transition-transform ${
                                  expandedItems.has(item.title) ? 'rotate-180' : ''
                                }`} />
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>

                    {/* Submenu */}
                    <AnimatePresence>
                      {!collapsed && item.children && expandedItems.has(item.title) && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="ml-8 mt-1 space-y-1"
                        >
                          {item.children.map((child) => (
                            <motion.button
                              key={child.href}
                              onClick={(event) => handleNavigation(child.href, event)}
                              className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all duration-200 text-sm ${
                                isActive(child.href)
                                  ? `${theme === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-500/15 text-blue-600'}`
                                  : `${colors.text.secondary} hover:bg-opacity-50 ${
                                      theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
                                    }`
                              }`}
                            >
                              <div className={`w-2 h-2 rounded-full ${
                                isActive(child.href)
                                  ? (theme === 'dark' ? 'bg-blue-400' : 'bg-blue-600')
                                  : (theme === 'dark' ? 'bg-slate-600' : 'bg-slate-400')
                              }`} />
                              <div className="flex-1 min-w-0 text-left">
                                <span className="font-medium block truncate">
                                  {child.title}
                                </span>
                                <span className={`text-xs truncate ${
                                  theme === 'dark' ? 'text-slate-500' : 'text-slate-500'
                                }`}>
                                  {child.description}
                                </span>
                              </div>
                            </motion.button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>

            {/* Divisor */}
            <div className={`px-4 py-2 ${theme === 'dark' ? 'border-slate-800/60' : 'border-slate-200/60'}`}>
              <div className={`h-px ${theme === 'dark' ? 'bg-slate-800/60' : 'bg-slate-200/60'}`} />
            </div>

            {/* Seção Administração */}
            <div className="p-4">
              <AnimatePresence>
                {!collapsed && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-3"
                  >
                    <h3 className={`text-xs font-semibold uppercase tracking-wider ${colors.text.muted}`}>
                      Administração
                    </h3>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-1">
                {adminItems.map((item, index) => (
                  <motion.button
                    key={item.href!}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (sidebarItems.length + index) * 0.05 }}
                    onClick={(event) => item.href && handleNavigation(item.href, event)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 group ${
                      isActive(item.href) 
                        ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                        : `${colors.border} ${colors.hover} ${colors.text.secondary}`
                    } ${collapsed ? 'justify-center' : ''}`}
                  >
                    <item.icon className={`flex-shrink-0 ${
                      collapsed ? "w-5 h-5" : "w-5 h-5"
                    } ${isActive(item.href) ? 'text-current' : ''}`} />
                    
                    <AnimatePresence>
                      {!collapsed && (
                        <motion.div
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          className="flex-1 min-w-0 text-left"
                        >
                          <span className="font-medium block truncate">
                            {item.title}
                          </span>
                          <span className={`text-xs truncate ${
                            theme === 'dark' ? 'text-slate-500' : 'text-slate-500'
                          }`}>
                            {item.description}
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className={`p-4 border-t ${theme === 'dark' ? 'border-slate-800/60' : 'border-slate-200/60'}`}>
            <div className="flex items-center justify-between gap-2">
              <ThemeToggle size={collapsed ? "small" : "default"} />
              
              <AnimatePresence>
                {!collapsed && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="flex-1 px-3 min-w-0"
                  >
                    <p className="text-xs text-slate-400 truncate">
                      Modo {theme === 'dark' ? 'Escuro' : 'Claro'}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">
                      {theme === 'dark' ? 'Tema noturno ativo' : 'Tema diurno ativo'}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Botão de Logout */}
              <motion.button
                onClick={handleLogout}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark' 
                    ? 'hover:bg-red-500/20 text-slate-400 hover:text-red-400' 
                    : 'hover:bg-red-50 text-slate-600 hover:text-red-600'
                }`}
                title={collapsed ? "Sair" : undefined}
              >
                <LogOut className="w-4 h-4" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="ml-2 text-xs font-medium overflow-hidden whitespace-nowrap"
                    >
                      Sair
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Botão para abrir sidebar em mobile quando colapsada */}
      {collapsed && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setCollapsed(false)}
          className={`fixed top-4 left-4 z-30 lg:hidden flex items-center justify-center w-10 h-10 rounded-xl ${
            theme === 'dark' 
              ? 'bg-slate-800/60 ring-1 ring-slate-700/30 hover:bg-slate-700/60 text-slate-400' 
              : 'bg-white/60 ring-1 ring-slate-300/30 hover:bg-white/80 text-slate-600'
          } backdrop-blur-md transition-colors`}
        >
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      )}
    </>
  );
}