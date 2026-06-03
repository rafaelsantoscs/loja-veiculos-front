"use client";

import React, { useState, useEffect } from "react";

import { motion } from "framer-motion";
import { 
  Building, 
  DoorOpen, 
  PlusCircle, 

  Settings
} from "lucide-react";

// Importações das suas instâncias existentes
import { getUserLocalStorage } from "@/store/userLocalStorage";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import unidadeService, { UnidadeServiceError } from "@/services/unidadeService";
import { Unidade } from "@/types";
import { useNotification } from "@/components/Notification";
import { useLoading, LoadingButton, LoadingSpinner } from "@/hooks/useLoading";
import Notification from "@/components/Notification";

export default function CadastroUnidadesGamificado() {
  const user = getUserLocalStorage() || {};
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [unidadeForm, setUnidadeForm] = useState({ nome: "" });
  const [setorForm, setSetorForm] = useState<{ nome: string; unidadeId: string | number }>({ 
    nome: "", 
    unidadeId: "" 
  });

  // Hooks para loading e notificações
  const { isLoading, executeWithLoading } = useLoading();
  const { 
    notifications, 
    removeNotification, 
    showSuccess, 
    showError, 
    showWarning 
  } = useNotification();

  // Carregar dados
  useEffect(() => {
    carregarUnidades();
  }, []);

  const carregarUnidades = async () => {
    await executeWithLoading('carregarUnidades', async () => {
      try {
        console.log("Carregando unidades...");
        
        const unidades = await unidadeService.listarUnidades();
        console.log("Unidades carregadas:", unidades);
        
        setUnidades(unidades);
        return unidades;
      } catch (error) {
        if (error instanceof UnidadeServiceError) {
          showError('Erro ao carregar unidades', error.message);
        } else {
          showError('Erro ao carregar unidades', 'Erro inesperado. Tente novamente.');
        }
        throw error;
      }
    });
  };

  const cadastrarUnidade = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!unidadeForm.nome.trim()) {
      showWarning('Validação', 'O nome da unidade é obrigatório');
      return;
    }

    await executeWithLoading('cadastrarUnidade', async () => {
      try {
        console.log("Cadastrando unidade:", unidadeForm);
        
        const result = await unidadeService.criarUnidade(unidadeForm);
        console.log("Unidade cadastrada:", result.data);
        
        setUnidadeForm({ nome: "" });
        await carregarUnidades(); // Recarrega a lista atualizada
        
        showSuccess('Sucesso!', 'Unidade cadastrada com sucesso!');
        return result;
      } catch (error) {
        if (error instanceof UnidadeServiceError) {
          showError('Erro ao cadastrar unidade', error.message);
        } else {
          showError('Erro ao cadastrar unidade', 'Erro inesperado. Tente novamente.');
        }
        throw error;
      }
    });
  };

  const cadastrarSetor = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!setorForm.nome.trim() || !setorForm.unidadeId) {
      showWarning('Validação', 'Nome do setor e unidade são obrigatórios');
      return;
    }

    await executeWithLoading('cadastrarSetor', async () => {
      try {
        // Validar o ID da unidade
        const unidadeId = typeof setorForm.unidadeId === 'string' ? 
          parseInt(setorForm.unidadeId) : setorForm.unidadeId;
          
        if (isNaN(unidadeId) || unidadeId <= 0) {
          showError('Validação', 'ID da unidade inválido');
          throw new Error('ID da unidade inválido');
        }

        // Verificar se a unidade existe
        const unidadeExiste = unidades.some(u => u.id === unidadeId);
        if (!unidadeExiste) {
          showError('Validação', 'Unidade selecionada não existe');
          throw new Error('Unidade selecionada não existe');
        }

        const dadosSetor = {
          nome: setorForm.nome.trim(),
          unidadeId: unidadeId
        };

        console.log("Cadastrando setor:", dadosSetor);
        
        const result = await unidadeService.criarSetor(dadosSetor);
        console.log("Setor cadastrado:", result.data);
        
        setSetorForm({ nome: "", unidadeId: "" });
        await carregarUnidades(); // Recarrega a lista atualizada
        
        showSuccess('Sucesso!', 'Setor cadastrado com sucesso!');
        return result;
      } catch (error) {
        if (error instanceof UnidadeServiceError) {
          showError('Erro ao cadastrar setor', error.message);
        } else if (!(error instanceof Error && error.message.includes('Validação'))) {
          showError('Erro ao cadastrar setor', 'Erro inesperado. Tente novamente.');
        }
        throw error;
      }
    });
  };

  // Loading state
  if (isLoading('carregarUnidades')) {
    return (
      <div className="min-h-dvh w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" color="text-indigo-500" className="mx-auto mb-4" />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-slate-300"
          >
            Carregando unidades...
          </motion.p>
        </div>
      </div>
    );
  }

  return (
    <DefaultLayout>
      <div className="relative min-h-dvh w-full overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-950 dark:to-black text-slate-900 dark:text-slate-100">
        {/* Background effects */}
        <div className="pointer-events-none absolute inset-0 opacity-30 dark:opacity-50 [background:repeating-linear-gradient(0deg,rgba(0,0,0,.02)_0px,rgba(0,0,0,.02)_1px,transparent_1px,transparent_3px)] dark:[background:repeating-linear-gradient(0deg,rgba(255,255,255,.03)_0px,rgba(255,255,255,.03)_1px,transparent_1px,transparent_3px)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1000px_300px_at_50%_-20%,rgba(59,130,246,.15),transparent)] dark:bg-[radial-gradient(1000px_300px_at_50%_-20%,rgba(99,102,241,.25),transparent)]" />

        {/* Header simplificado */}
        <div className="relative z-10 flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-500/20 ring-1 ring-green-400/30">
              <Building className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <p className="text-xs/4 text-slate-600 dark:text-slate-400">Sistema</p>
              <h1 className="font-semibold tracking-wide text-slate-900 dark:text-slate-100">Cadastrar Unidades & Setores</h1>
            </div>
          </div>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="hidden text-xs text-slate-400 sm:block"
        >
          Gestão Corporativa • {user.nomeCompleto || 'Usuário'}
        </motion.div>
      </div>

      {/* Conteúdo principal */}
      <main className="relative z-10 mx-auto max-w-7xl px-6 pb-24">
        {/* Hero */}
        <section className="mx-auto max-w-4xl pt-6">
          <motion.h2
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-3 text-3xl font-semibold md:text-4xl text-center"
          >
            Gestão de Estrutura
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="mx-auto max-w-2xl text-sm text-slate-300 md:text-base text-center"
          >
            Cadastre e gerencie unidades e setores da organização. 
            Mantenha a estrutura corporativa sempre atualizada.
          </motion.p>
        </section>

        {/* Grid de Cadastros */}
        <section className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Cadastro de Unidade */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="group block h-full rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6 shadow-[0_0_0_1px_rgba(34,197,94,.2)] backdrop-blur transition hover:translate-y-[-2px] hover:bg-slate-900/70 hover:shadow-[0_10px_30px_-10px_rgba(34,197,94,.35)]"
          >
            <div className="mb-6 flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/15 ring-1 ring-green-400/30">
                <Building className="h-6 w-6 text-green-400" />
              </span>
              <div>
                <h3 className="text-xl font-medium tracking-wide">Nova Unidade</h3>
                <p className="text-sm text-slate-400">Adicione uma nova unidade</p>
              </div>
            </div>

            <form onSubmit={cadastrarUnidade}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-3 text-slate-300">Nome da Unidade *</label>
                <div className="relative">
                  <Building className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <input
                    type="text"
                    required
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-700 bg-slate-800/50 text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all backdrop-blur"
                    value={unidadeForm.nome}
                    onChange={(e) => setUnidadeForm({ nome: e.target.value })}
                    placeholder="Ex: Matriz, Filial 1..."
                  />
                </div>
              </div>

              <LoadingButton
                type="submit"
                isLoading={isLoading('cadastrarUnidade')}
                loadingText="Cadastrando..."
                variant="success"
                className="w-full"
              >
                <PlusCircle className="h-5 w-5 mr-2" />
                Cadastrar Unidade
              </LoadingButton>
            </form>
          </motion.div>

          {/* Cadastro de Setor */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="group block h-full rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6 shadow-[0_0_0_1px_rgba(168,85,247,.2)] backdrop-blur transition hover:translate-y-[-2px] hover:bg-slate-900/70 hover:shadow-[0_10px_30px_-10px_rgba(168,85,247,.35)]"
          >
            <div className="mb-6 flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/15 ring-1 ring-purple-400/30">
                <DoorOpen className="h-6 w-6 text-purple-400" />
              </span>
              <div>
                <h3 className="text-xl font-medium tracking-wide">Novo Setor</h3>
                <p className="text-sm text-slate-400">Adicione um setor à unidade</p>
              </div>
            </div>

            <form onSubmit={cadastrarSetor}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-3 text-slate-300">Unidade *</label>
                <div className="relative">
                  <Building className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <select
                    required
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-700 bg-slate-800/50 text-slate-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all backdrop-blur appearance-none"
                    value={String(setorForm.unidadeId)}
                    onChange={(e) => setSetorForm({ ...setorForm, unidadeId: Number(e.target.value) || "" })}
                  >
                    <option value="">Selecione a unidade</option>
                    {unidades.map(unidade => (
                      <option key={unidade.id} value={unidade.id}>{unidade.nome}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-3 text-slate-300">Nome do Setor *</label>
                <div className="relative">
                  <DoorOpen className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <input
                    type="text"
                    required
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-700 bg-slate-800/50 text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all backdrop-blur"
                    value={setorForm.nome}
                    onChange={(e) => setSetorForm({ ...setorForm, nome: e.target.value })}
                    placeholder="Ex: TI, RH, Administrativo..."
                  />
                </div>
              </div>

              <LoadingButton
                type="submit"
                disabled={!setorForm.unidadeId}
                isLoading={isLoading('cadastrarSetor')}
                loadingText="Cadastrando..."
                variant="primary"
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PlusCircle className="h-5 w-5 mr-2" />
                Cadastrar Setor
              </LoadingButton>
            </form>
          </motion.div>
        </section>

        {/* Lista de Unidades e Setores */}
        <section className="mt-10 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6 shadow-[0_0_0_1px_rgba(59,130,246,.2)] backdrop-blur"
          >
            <div className="mb-6 flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/15 ring-1 ring-blue-400/30">
                <Settings className="h-6 w-6 text-blue-400" />
              </span>
              <div>
                <h3 className="text-xl font-medium tracking-wide">Estrutura Organizacional</h3>
                <p className="text-sm text-slate-400">{unidades.length} unidades cadastradas</p>
              </div>
            </div>

            {unidades.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8"
              >
                <Building className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">Nenhuma unidade cadastrada</p>
              </motion.div>
            ) : (
              <div className="space-y-6">
                {unidades.map((unidade, idx) => (
                  <motion.div
                    key={unidade.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * idx }}
                    className="rounded-xl border border-slate-800 bg-slate-800/30 p-5 backdrop-blur"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <Building className="h-5 w-5 text-blue-400" />
                      <h4 className="font-semibold text-lg text-slate-100">{unidade.nome}</h4>
                    </div>
                    
                    {unidade.setores && unidade.setores.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {unidade.setores.map((setor) => (
                          <motion.div 
                            key={setor.id}
                            whileHover={{ scale: 1.02 }}
                            className="flex items-center gap-3 rounded-lg bg-slate-800/50 p-3 border border-slate-700/50"
                          >
                            <DoorOpen className="h-4 w-4 text-purple-400" />
                            <span className="text-slate-200">{setor.nome}</span>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-500 text-sm">Nenhum setor cadastrado</p>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </section>
      </main>

      {/* Rodapé */}
      <footer className="relative z-10 mx-auto max-w-7xl px-6 pb-8 pt-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} – Sistema de Gestão. Desenvolvido com Next.js e Tailwind.
      </footer>

      {/* Notificações */}
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          type={notification.type}
          title={notification.title}
          message={notification.message}
          isVisible={true}
          onClose={() => removeNotification(notification.id)}
          duration={notification.duration}
        />
      ))}
    </div>
    </DefaultLayout>
  );
}