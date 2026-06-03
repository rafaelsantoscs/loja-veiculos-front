'use client';

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import SlideShow, { Slide } from "@/components/Slide/SlideShow";
import axiosInstance from "@/services/axiosInstance";
import { decodeToken } from "@/utils/decodeToken";
import { setUserLocalStorage } from "@/store/userLocalStorage";
import { FaHome, FaUser } from "react-icons/fa";
import { TextosInstitucionais } from "@/utils/UtilsStates";
import { AxiosError } from "axios";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const Login: React.FC = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const msg = searchParams.get('msg');
  const [showPassword, setShowPassword] = useState(false);

  const loginSlides: Slide[] = [
    {
      id: 1,
      image: 'https://imgur.com/CxGjt56.png',
      caption: TextosInstitucionais.descricao,
    }
  ];

  const handleLogin = async () => {
    setErrorMessage('');

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
        router.push('/dashboard');
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

  return (
    <div className="w-full h-screen
      text-slate-900 dark:text-white flex flex-col lg:flex-row transition-colors
      bg-white dark:bg-[#2d3142] 
      bg-cover bg-center 
      bg-[url('/images/colaboradores/samu-light.jpg')] 
      dark:bg-[url('/images/colaboradores/samu-dark.jpg')]
    ">
      {/* Lado esquerdo com imagem e mensagem */}
      <div className="hidden lg:flex flex-col justify-center items-center w-1/2  text-samu-vermelho dark:text-samu-bg-samu-branco p-8 transition-colors">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
          <h1 className="text-3xl font-bold text-samu-vermelho dark:text-samu-branco text-center sm:mb-0">
            Bem-vindo
          </h1>
          <Link
            href="/"
            className="px-6 py-2 rounded-md border-2 
            border-samu-vermelho dark:border-samu-branco 
            text-samu-vermelho dark:text-samu-branco 
            font-semibold 
            hover:bg-samu-vermelho dark:hover:bg-samu-branco 
            hover:text-white dark:hover:text-slate-900 
            transition"
          >
            Voltar à página inicial
          </Link>
        </div>
        <SlideShow slides={loginSlides} />
      </div>

      {/* Lado direito com o formulário */}
      <div className="flex flex-col justify-center items-center w-full lg:w-1/2 p-6 sm:p-12">
        {msg && (
          <div className="text-lg mb-8 font-semibold bg-lime-300 p-4 rounded-md animate-pulse-scale">
            {msg}
          </div>
        )}

        <div className="flex items-center gap-2 mb-8">
          <Link href="/" className="text-samu-vermelho dark:text-samu-branco hover:opacity-80" title="Voltar à página inicial">
            <FaHome size={22} />
          </Link>
          <span className="text-lg text-samu-vermelho dark:text-slate-300">|</span>
          <h2 className="text-2xl font-bold text-samu-vermelho dark:text-samu-branco">
            Faça seu Login
          </h2>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
          className="w-full max-w-md"
        >
          <label className="block text-sm font-medium mb-2">
            Usuário
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Digite seu nome de usuário"
              className="w-full p-3 rounded border border-slate-300 dark:border-slate-600 bg-transparent focus:outline-none focus:ring-2 focus:ring-samu-vermelho dark:focus:ring-samu-laranja mb-4"
              value={username}
              onChange={(e) => setUsername(e.target.value.replace(/\s/g, ""))}
              onKeyDown={(e) => { if (e.key === " ") e.preventDefault(); }}
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-300">
              <FaUser size={20} />
            </span>
          </div>

          <label className="block text-sm font-medium mb-2">
            Senha de Acesso
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Digite sua senha"
              className="w-full p-3 rounded border border-slate-300 dark:border-slate-600 bg-transparent focus:outline-none focus:ring-2 focus:ring-samu-vermelho dark:focus:ring-samu-laranja mb-4"
              value={password}
              onChange={(e) => setPassword(e.target.value.replace(/\s/g, ""))}
              onKeyDown={(e) => { if (e.key === " ") e.preventDefault(); }}
            />
            <span
              className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <Visibility className="text-slate-400 dark:text-slate-300" />
              ) : (
                <VisibilityOff className="text-slate-400 dark:text-slate-300" />
              )}
            </span>
          </div>

          {errorMessage && (
            <p className="text-rose-600 dark:text-rose-400 text-sm mb-4 animate-pulse-scale">{errorMessage}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 rounded-md border-2 border-samu-vermelho text-samu-vermelho dark:border-samu-laranja dark:text-samu-laranja font-semibold hover:bg-samu-vermelho hover:text-white dark:hover:bg-samu-laranja dark:hover:text-slate-900 transition"
          >
            {loading ? "Carregando..." : "Entrar"}
          </button>
        </form>

        <div className="text-center mt-6 text-sm space-y-2">
          <p>
            Não tem uma conta?{" "}
            <Link href="/register" className="text-samu-vermelho dark:text-samu-laranja underline hover:opacity-90">
              Cadastre-se
            </Link>
          </p>
          <p>
            Esqueceu a senha?{" "}
            <Link href="/forgot-password" className="text-samu-vermelho dark:text-samu-laranja underline hover:opacity-90">
              Recuperar senha
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
