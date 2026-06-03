'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import axiosInstance from '@/services/axiosInstance';
import { AxiosError } from 'axios';
import { Visibility, VisibilityOff } from '@mui/icons-material';

export default function RedefinirSenhaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [status, setStatus] = useState<'idle' | 'sucesso' | 'erro'>('idle');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [requisitosSenha, setRequisitosSenha] = useState({
    tamanho: false,
    maiuscula: false,
    minuscula: false,
    numero: false,
    especial: false,
    semEspaco: true,
  });

  const validarSenha = (senha: string): boolean => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[^\s]{6,}$/;
    return regex.test(senha);
  };

  const validarRequisitosSenha = (senha: string) => {
    setRequisitosSenha({
      tamanho: senha.length >= 6,
      maiuscula: /[A-Z]/.test(senha),
      minuscula: /[a-z]/.test(senha),
      numero: /\d/.test(senha),
      especial: /[\W_]/.test(senha),
      semEspaco: !/\s/.test(senha),
    });
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    validarRequisitosSenha(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMensagem('As senhas não coincidem.');
      setStatus('erro');
      return;
    }

    if (!validarSenha(password)) {
      setMensagem('A senha não atende aos requisitos mínimos.');
      setStatus('erro');
      return;
    }

    try {
      const response = await axiosInstance.post('/password/reset-password', {
        token,
        newPassword: password,
      });
      console.log(response.data);

      setMensagem('Senha redefinida com sucesso! Faça o login.');
      setStatus('sucesso');
    } catch (error: unknown) {
      let mensagemErro = 'Erro ao redefinir senha.';

      if (error instanceof AxiosError) {
        mensagemErro =
          typeof error.response?.data === 'string'
            ? error.response.data
            : error.response?.data?.message || mensagemErro;
      }

      setMensagem(mensagemErro);
      setStatus('erro');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4
     
     ">
      <h1 className="text-2xl font-bold text-camutanga-azul dark:text-camutanga-amarelo mb-6">
        Redefinir Senha
      </h1>

      {status === 'sucesso' ? (
        <>
          <p className="text-green-600 font-semibold">{mensagem}</p>
          <button
            className="w-100 mt-10 py-3 rounded transition border-2 bg-white text-camutanga-azul border-camutanga-azul hover:bg-camutanga-azul hover:text-white dark:bg-transparent dark:text-camutanga-branco dark:border-camutanga-branco dark:hover:bg-camutanga-branco dark:hover:text-camutanga-azul"
            onClick={() => router.push('/login')}
          >
            Tela de Login
          </button>
        </>
      ) : (
        <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white dark:bg-gray-800 p-6 rounded shadow-md">
          <div className="mb-4">
            <div className="relative">
              <label htmlFor="password" className="block font-semibold mb-1">Nova Senha:</label>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                required
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                className="w-full py-2 pr-10 pl-3 rounded border border-gray-300 dark:border-gray-600"
              />
              <span
                className="absolute right-3 top-1 flex items-start pt-[30px] cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <Visibility className="text-slate-400 dark:text-slate-300" />
                ) : (
                  <VisibilityOff className="text-slate-400 dark:text-slate-300" />
                )}
              </span>
            </div>
            <div className="mt-2 space-y-1 text-sm">
              <p className={`${requisitosSenha.tamanho ? 'text-green-600' : 'text-red-500'}`}>
                {requisitosSenha.tamanho ? '✔' : '✖'} Mínimo 6 caracteres
              </p>
              <p className={`${requisitosSenha.maiuscula ? 'text-green-600' : 'text-red-500'}`}>
                {requisitosSenha.maiuscula ? '✔' : '✖'} Ao menos uma letra maiúscula
              </p>
              <p className={`${requisitosSenha.minuscula ? 'text-green-600' : 'text-red-500'}`}>
                {requisitosSenha.minuscula ? '✔' : '✖'} Ao menos uma letra minúscula
              </p>
              <p className={`${requisitosSenha.numero ? 'text-green-600' : 'text-red-500'}`}>
                {requisitosSenha.numero ? '✔' : '✖'} Ao menos um número
              </p>
              <p className={`${requisitosSenha.especial ? 'text-green-600' : 'text-red-500'}`}>
                {requisitosSenha.especial ? '✔' : '✖'} Ao menos um caractere especial (!@#...)
              </p>
              <p className={`${requisitosSenha.semEspaco ? 'text-green-600' : 'text-red-500'}`}>
                {requisitosSenha.semEspaco ? '✔' : '✖'} A senha não pode conter espaços
              </p>
            </div>
          </div>

          <div className="mb-4">
            <div className="relative">
              <label htmlFor="confirmPassword" className="block font-semibold mb-1">Confirmar Senha:</label>
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full py-2 pr-10 pl-3 rounded border border-gray-300 dark:border-gray-600"
              />
              <span
                className="absolute right-3 top-1 flex items-start pt-[30px] cursor-pointer"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <Visibility className="text-slate-400 dark:text-slate-300" />
                ) : (
                  <VisibilityOff className="text-slate-400 dark:text-slate-300" />
                )}
              </span>
            </div>
            {confirmPassword && password !== confirmPassword && (
              <p className="text-red-500 text-sm mt-1">As senhas não coincidem.</p>
            )}
          </div>

          {mensagem && (
            <p className={`mb-4 font-bold ${status === 'erro' ? 'text-red-500' : 'text-green-600'}`}>{mensagem}</p>
          )}

          <button type="submit" className="w-full bg-camutanga-azul dark:bg-camutanga-amarelo text-white dark:text-gray-900 py-2 rounded hover:opacity-90 transition">
            Redefinir Senha
          </button>
        </form>
      )}
    </div>
  );
}