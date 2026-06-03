'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import axiosInstance from "@/services/axiosInstance";
import { decodeToken } from "@/utils/decodeToken";
import { setUserLocalStorage } from "@/store/userLocalStorage";
import { FaHome, FaUser, FaEye, FaEyeSlash, FaSun, FaMoon, FaCheckCircle, FaShieldAlt, FaInfoCircle } from "react-icons/fa";
import { AxiosError } from "axios";

const Login: React.FC = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const searchParams = useSearchParams();
  const msg = searchParams.get('msg');

  // Verificar se há preferência de tema salva
  useEffect(() => {
    const currentTheme = localStorage.getItem('theme') || 'light';
    if (currentTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
    
    if (msg) {
      setSuccessMessage('Redirecionamento detectado. Faça login para continuar.');
    }
  }, [msg]);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleLogin = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    // sempre limpar antes de enviar
    const sanitizedUsername = username.replace(/\s/g, "");
    const sanitizedPassword = password.replace(/\s/g, "");

    if (!sanitizedUsername || !sanitizedPassword) {
      setErrorMessage('Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);

    try {
      const response = await axiosInstance.post('/auth/login', {
        username: sanitizedUsername,
        password: sanitizedPassword,
      });

      if (response.status === 200 && response.data.token) {
        const decodedToken = decodeToken(response.data.token);

        const user = {
          id: response.data.id || null,
          nomeCompleto: response.data.nome || '',
          cpf: response.data.cpf || '',
          telefone: response.data.telefone || '',
          email: response.data.email || '',
          token: response.data.token,
          roles: decodedToken.roles || [],
          username: response.data.username || '',
          imagemUrl: response.data.imagemUrl || '',
        };
        setUserLocalStorage(user);
        
        // Se "Lembrar-me" estiver marcado, salvar credenciais (apenas username)
        if (rememberMe) {
          localStorage.setItem('rememberedUser', sanitizedUsername);
        } else {
          localStorage.removeItem('rememberedUser');
        }
        
        setSuccessMessage('Login realizado com sucesso! Redirecionando...');
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      } else {
        setErrorMessage('Credenciais inválidas.');
      }
    } catch (error) {
      const err = error as AxiosError;
      const msg = err.response?.data || "Erro ao conectar ao servidor.";
      setErrorMessage(typeof msg === "string" ? msg : "Erro ao fazer login.");
    } finally {
      setLoading(false);
    }
  };

  // Preencher username se estiver salvo
  useEffect(() => {
    const rememberedUser = localStorage.getItem('rememberedUser');
    if (rememberedUser) {
      setUsername(rememberedUser);
      setRememberMe(true);
    }
  }, []);

  return (
  <div className="min-h-screen transition-all duration-300 bg-gradient-to-b from-blue-800 via-blue-600 to-emerald-400 dark:from-blue-900 dark:via-blue-800 dark:to-emerald-700">
      {/* Theme Toggle */}
      <button 
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-50 p-3 rounded-full bg-white/20 dark:bg-slate-800 border border-white/30 dark:border-slate-700 text-blue-900 dark:text-white shadow-lg hover:scale-110 transition-all duration-300"
      >
        {isDarkMode ? <FaSun className="w-6 h-6" /> : <FaMoon className="w-6 h-6" />}
      </button>

      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-4xl mx-auto grid lg:grid-cols-2 gap-8 items-center">
          
          {/* Left Side - Welcome Section */}
          <div className="hidden lg:flex flex-col items-center text-center text-white animate-fade-in">
            <div className="mb-8">
              <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-white/20 flex items-center justify-center animate-pulse-slow">
                <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 4a1 1 0 011-1h8a1 1 0 011 1v1.5a1 1 0 01-.2.6L11 9.5V16a1 1 0 01-1 1H6a1 1 0 01-1-1v-6.5l-2.8-3.4A1 1 0 012 5.5V4a1 1 0 011-1zm1 1v.5h6V5H6z" clipRule="evenodd"></path>
                </svg>
              </div>
              <h1 className="text-4xl font-bold mb-4"> Bem vindo à CTIC</h1>
              <p className="text-xl text-white/80 max-w-md">
                Sistema de Gestão de TI - Acesse sua conta para continuar
              </p>
            </div>
            
            <div className="glass-effect rounded-2xl p-6 max-w-md">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-visa-verde rounded-full flex items-center justify-center">
                  <FaCheckCircle className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold">Inspeção e Fiscalização</h3>
                  <p className="text-sm text-white/70">Controle de qualidade e segurança</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-visa-azul rounded-full flex items-center justify-center">
                  <FaShieldAlt className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold">Acesso Seguro</h3>
                  <p className="text-sm text-white/70">Seus dados protegidos</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full max-w-md mx-auto animate-slide-up">
            <div className="bg-white/80 dark:bg-slate-800 rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-slate-700">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-800 to-emerald-400 dark:from-blue-900 dark:to-emerald-700 rounded-2xl flex items-center justify-center shadow-lg">
                  <FaUser className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-blue-900 dark:text-white mb-2">Fazer Login</h2>
                <p className="text-slate-700 dark:text-slate-300">Entre com suas credenciais</p>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-xl text-red-700 dark:text-red-200 text-sm">
                  {errorMessage}
                </div>
              )}

              {/* Success Message */}
              {successMessage && (
                <div className="mb-4 p-4 bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700 rounded-xl text-green-700 dark:text-green-200 text-sm">
                  {successMessage}
                </div>
              )}

              {/* Login Form */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleLogin();
                }}
                className="space-y-6"
              >
                {/* Username Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Usuário</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUser className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                    </div>
                    <input 
                      type="text" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value.replace(/\s/g, ""))}
                      onKeyDown={(e) => { if (e.key === " ") e.preventDefault(); }}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-800 focus:border-transparent transition-all duration-300"
                      placeholder="Digite seu usuário"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Senha</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaShieldAlt className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                    </div>
                    <input 
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value.replace(/\s/g, ""))}
                      onKeyDown={(e) => { if (e.key === " ") e.preventDefault(); }}
                      className="w-full pl-10 pr-12 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-800 focus:border-transparent transition-all duration-300"
                      placeholder="Digite sua senha"
                      required
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {showPassword ? (
                        <FaEyeSlash className="w-5 h-5" />
                      ) : (
                        <FaEye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-blue-600 dark:text-blue-400 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 rounded focus:ring-blue-400 dark:focus:ring-blue-800 focus:ring-2"
                    />
                    <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">Lembrar-me</span>
                  </label>
                  <Link 
                    href="/forgot-password" 
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                  >
                    Esqueceu a senha?
                  </Link>
                </div>

                {/* Login Button */}
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-800 to-emerald-400 dark:from-blue-900 dark:to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Entrando...
                    </span>
                  ) : (
                    "Entrar"
                  )}
                </button>
              </form>

              {/* Footer Links */}
              <div className="mt-8 text-center space-y-4">
                <div className="flex items-center justify-center space-x-4">
                  <Link href="/" className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
                    <FaHome className="w-4 h-4" />
                    <span className="text-sm">Página Inicial</span>
                  </Link>
                  <span className="text-slate-400 dark:text-slate-500">•</span>
                  <Link href="/help" className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
                    <FaInfoCircle className="w-4 h-4" />
                    <span className="text-sm">Ajuda</span>
                  </Link>
                </div>
                <div className="mt-4">
                  <span className="text-sm text-slate-700 dark:text-slate-300">Não tem conta?</span>
                  <Link href="/register" className="ml-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors underline">
                    Cadastre-se
                  </Link>
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  © 2024 Vigilância Sanitária. Todos os direitos reservados.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out;
        }
        .animate-slide-up {
          animation: slideUp 0.8s ease-out;
        }
        .animate-pulse-slow {
          animation: pulse 3s infinite;
        }
      `}</style>
    </div>
  );
};

export default Login;