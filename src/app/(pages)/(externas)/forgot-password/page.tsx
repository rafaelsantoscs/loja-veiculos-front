"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axiosInstance from "@/services/axiosInstance";
import { AiFillMail } from "react-icons/ai";
import { toast } from "react-toastify";

const ForgotPassword: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  // const [errorMessage, setErrorMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async () => {
    if (!email) {
      setErrorMessage('Por favor, preencha o campo de email.');
      toast.error('Por favor, preencha o campo de email.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('Por favor, insira um email válido.');
      toast.error('Por favor, insira um email válido.');
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post('/password/forgot-password', { email });
      router.push(`/login?msg=Recuperação de senha enviada para ${email}. Verifique sua caixa de entrada ou spam.`);
    } catch (error) {
      setErrorMessage('Email não cadastrado.');
      toast('Email não cadastrado.');
      router.push('/register');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  if (errorMessage) {
    const timeout = setTimeout(() => {
      setErrorMessage(null);
    }, 4000); // 4 segundos

    return () => clearTimeout(timeout); 
  }
}, [errorMessage]);

  return (
    <div className="min-h-screen transition-all duration-300 bg-gradient-to-b from-blue-800 via-blue-600 to-emerald-400 dark:from-blue-900 dark:via-blue-800 dark:to-emerald-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto animate-slide-up">
        <div className="bg-white/90 dark:bg-slate-800 rounded-3xl p-10 shadow-2xl border border-slate-200 dark:border-slate-700">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-800 to-emerald-400 dark:from-blue-900 dark:to-emerald-700 rounded-2xl flex items-center justify-center shadow-lg">
              <AiFillMail className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-blue-900 dark:text-white mb-2">Recuperação de Senha</h2>
            <p className="text-slate-700 dark:text-slate-300">Informe seu e-mail para recuperar o acesso</p>
          </div>
          <form
            onSubmit={e => {
              e.preventDefault();
              handleForgotPassword();
            }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">E-mail</label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="Digite seu e-mail"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-800 focus:border-transparent transition-all duration-300"
                  required
                />
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <AiFillMail className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                </span>
              </div>
            </div>
            {errorMessage && (
              <p className="text-rose-600 dark:text-rose-400 text-sm mb-4 animate-pulse">{errorMessage}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-800 to-emerald-400 dark:from-blue-900 dark:to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? "Carregando..." : "Enviar"}
            </button>
          </form>
          <div className="mt-8 text-center text-sm">
            <Link href="/login" className="text-blue-800 dark:text-blue-400 underline hover:opacity-90">
              Voltar para login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
