'use client';

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  FaHome, FaUser, FaEye, FaEyeSlash, FaSun, FaMoon, 
  FaCheckCircle, FaShieldAlt, FaEnvelope, 
  FaIdCard, FaPhone, FaLock 
} from "react-icons/fa";
import { formatCPF, formatPhoneNumberForInput, removerCaracteresNaoNumericos, validarCPF } from "@/utils/formatters";
import axiosInstance from "@/services/axiosInstance";
import TermsModal from "@/components/Modal/TermsModal";
import PrivacyModal from "@/components/Modal/PrivacyModal";
import { AxiosError } from "axios";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { decodeToken } from "@/utils/decodeToken";
import { setUserLocalStorage } from "@/store/userLocalStorage";

const SignUpVisa: React.FC = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [usernameValido, setUsernameValido] = useState(true);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [senhaValida, setSenhaValida] = useState(true);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [cpf, setCpf] = useState("");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [termo, setTermo] = useState("");
  const [dataRegistro, setDataRegistro] = useState("");
  const [roles] = useState(["ROLE_USUARIO"]);
  const [errorMessage, setErrorMessage] = useState<string | { message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [isTermoAccepted, setIsTermoAccepted] = useState(false);
  const [isTermsOpen, setTermsOpen] = useState(false);
  const [isPrivacyOpen, setPrivacyOpen] = useState(false);
  const [emailValido, setEmailValido] = useState(true);
  const [confirmEmail, setConfirmEmail] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const googleEnabled = !!googleClientId && googleClientId !== 'SEU_GOOGLE_CLIENT_ID_AQUI';

  // Estados para requisitos de senha
  const [requisitosSenha, setRequisitosSenha] = useState({
    tamanho: false,
    maiuscula: false,
    minuscula: false,
    numero: false,
    especial: false,
  });

  // Verificar se há preferência de tema salva
  useEffect(() => {
    const currentTheme = localStorage.getItem('theme') || 'light';
    if (currentTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

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

  useEffect(() => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    const formattedTime = now.toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour12: false });
    setDataRegistro(`${formattedDate} ${formattedTime}`);
  }, []);

  const handleTermoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setIsTermoAccepted(isChecked);
    if (isChecked) {
      setTermo(`O Usuário ${nome}, CPF ${cpf}, aceitou os termos e a política de privacidade em ${dataRegistro}.`);
    } else {
      setTermo("");
    }
  };

  const handleRegister = async () => {
    if (!isTermoAccepted) {
      setErrorMessage("Você precisa aceitar os termos para se cadastrar.");
      return;
    }
  
    if (!nome || !cpf || !email || !telefone || !username || !password || !confirmPassword) {
      setErrorMessage('Preencha todos os campos.');
      return;
    }

    if (!validarCPF(cpf)) {
      setErrorMessage("CPF inválido. Verifique e tente novamente.");
      return;
    }

    if (/\s/.test(username)) {
      setErrorMessage("O nome de usuário não pode conter espaços.");
      return;
    }

    if (!validarFormatoEmail(email)) {
      setErrorMessage("Digite um e-mail válido.");
      return;
    }
  
    if (password !== confirmPassword) {
      setErrorMessage("As senhas não coincidem.");
      return;
    }

    if (email !== confirmEmail) {
      setErrorMessage("Os e-mails não coincidem.");
      return;
    }
    
  
    if (!validarSenha(password)) {
      setErrorMessage("A senha não atende aos requisitos mínimos de segurança.");
      return;
    }

    setLoading(true);
    
    try {
      const response = await axiosInstance.post('/usuarios/salvar-usuario', {
        nome,
        email,
        telefone: removerCaracteresNaoNumericos(telefone),
        username,
        password,
        roles,
        cpf: removerCaracteresNaoNumericos(cpf),
        termo,
      });
  
      if (response.status === 201) {
        router.push('/login?msg=Cadastro realizado com sucesso! Faça login para continuar.');
      } else {
        setErrorMessage('Erro ao cadastrar. Tente novamente.');
      }
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      if (err.response && err.response.status === 409) {
        const errorMessage = err.response.data?.message || 'Erro ao conectar ao servidor.';
        setErrorMessage(errorMessage);
      } else {
        setErrorMessage('Erro ao conectar ao servidor.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      setErrorMessage('Não foi possível obter as credenciais do Google.');
      return;
    }
    setGoogleLoading(true);
    setErrorMessage(null);
    try {
      const response = await axiosInstance.post('/auth/google', {
        credential: credentialResponse.credential,
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
        const roleValue = user.roles.join(',');
        document.cookie = `userRoles=${encodeURIComponent(roleValue)}; path=/; SameSite=Strict; max-age=86400`;
        const isUsuario = user.roles.includes('ROLE_USUARIO') && user.roles.length === 1;
        router.push(isUsuario ? '/externo' : '/dashboard');
      }
    } catch (error) {
      const err = error as AxiosError;
      const msg = err.response?.data || 'Erro ao autenticar com Google.';
      setErrorMessage(typeof msg === 'string' ? msg : 'Erro ao fazer login com Google.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const formatAndSetCpfInput = (valor: string) => {
    const apenasNumeros = valor.replace(/\D/g, '');
    const cpfFormatado = formatCPF(apenasNumeros);
    
    setCpf(cpfFormatado);
    setCpfValido(validarCPF(apenasNumeros));
  };

  const handleUsernameChange = (value: string) => {
    setUsername(value);
    setUsernameValido(!/\s/.test(value));
  };

  const [cpfValido, setCpfValido] = useState(true);

  const validarFormatoEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const isFormValid =
    nome.trim() !== '' &&
    cpf.trim() !== '' &&
    email.trim() !== '' &&
    validarFormatoEmail(email) &&
    confirmEmail.trim() !== '' &&
    email === confirmEmail &&
    telefone.trim() !== '' &&
    username.trim() !== '' &&
    !/\s/.test(username) &&
    password.trim() !== '' &&
    !/\s/.test(password) &&
    confirmPassword.trim() !== '' &&
    password === confirmPassword &&
    isTermoAccepted;

  const validarSenha = (senha: string): boolean => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[^\s]{6,}$/;
    return regex.test(senha);
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    const isValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[^\s]{6,}$/.test(value);
    setSenhaValida(isValid); 
  
    setRequisitosSenha({
      tamanho: value.length >= 6,
      maiuscula: /[A-Z]/.test(value),
      minuscula: /[a-z]/.test(value),
      numero: /\d/.test(value),
      especial: /[!@#$%^&*(),.?":{}|<>]/.test(value),
    });
  };

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
              <h1 className="text-4xl font-bold mb-4">Vigilância Sanitária</h1>
              <p className="text-xl text-white/80 max-w-md">
                Sistema de Fiscalização e Controle Sanitário - Crie sua conta
              </p>
            </div>
            
            <div className="glass-effect rounded-2xl p-6 max-w-md">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <FaCheckCircle className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold">Cadastro Seguro</h3>
                  <p className="text-sm text-white/70">Seus dados protegidos</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center">
                  <FaShieldAlt className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold">Acesso Rápido</h3>
                  <p className="text-sm text-white/70">Comece a usar em minutos</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Registration Form */}
          <div className="w-full max-w-2xl mx-auto animate-slide-up">
            <div className="bg-white/90 dark:bg-slate-800 rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-slate-700">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-800 to-emerald-400 dark:from-blue-900 dark:to-emerald-700 rounded-2xl flex items-center justify-center shadow-lg">
                  <FaUser className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-blue-900 dark:text-white mb-2">Criar Conta</h2>
                <p className="text-slate-700 dark:text-slate-300">Preencha seus dados para se cadastrar</p>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="mb-4 p-4 bg-rose-100 dark:bg-rose-900 border border-rose-300 dark:border-rose-700 rounded-xl text-rose-700 dark:text-rose-200 text-sm">
                  {typeof errorMessage === 'string'
                    ? errorMessage
                    : errorMessage.message ?? 'Erro inesperado.'}
                </div>
              )}

              {/* Registration Form */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleRegister();
                }}
                className="space-y-4"
              >
                {/* Nome Completo */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nome Completo</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUser className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                    </div>
                    <input 
                      type="text" 
                      value={nome} 
                      onChange={(e) => setNome(e.target.value)} 
                      placeholder="Digite seu nome completo" 
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-800 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                </div>

                {/* CPF e Telefone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">CPF</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaIdCard className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                      </div>
                      <input 
                        type="text" 
                        value={cpf} 
                        onChange={(e) => formatAndSetCpfInput(e.target.value)} 
                        placeholder="Digite seu CPF" 
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-800 focus:border-transparent transition-all duration-300"
                      />
                    </div>
                    {!cpfValido && <p className="text-rose-500 text-sm mt-1">CPF inválido</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Telefone</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaPhone className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                      </div>
                      <input 
                        type="text" 
                        value={telefone} 
                        onChange={(e) => setTelefone(formatPhoneNumberForInput(e.target.value))} 
                        placeholder="Digite seu telefone" 
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-800 focus:border-transparent transition-all duration-300"
                      />
                    </div>
                  </div>
                </div>

                {/* Email e Confirmação de Email */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaEnvelope className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                    </div>
                    <input 
                      type="email" 
                      value={email} 
                      onChange={(e) => {
                        const value = e.target.value;
                        setEmail(value);
                        setEmailValido(validarFormatoEmail(value));
                      }}
                      placeholder="Digite seu email"
                      onKeyDown={(e) => e.key === ' ' && e.preventDefault()} 
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-800 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                  {email && !emailValido && (
                    <p className="text-rose-500 text-sm mt-1">Digite um e-mail válido.</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Confirmar Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaEnvelope className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                    </div>
                    <input
                      type="email"
                      value={confirmEmail}
                      onChange={(e) => setConfirmEmail(e.target.value)}
                      placeholder="Confirme seu email"
                      onPaste={(e) => e.preventDefault()}
                      onKeyDown={(e) => e.key === ' ' && e.preventDefault()}               
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-800 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                  {confirmEmail && email !== confirmEmail && (
                    <p className="text-rose-500 text-sm mt-1">Os e-mails não coincidem.</p>
                  )}
                </div>

                {/* Username e Senha */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nome de Usuário</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaUser className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                      </div>
                      <input 
                        type="text" 
                        value={username}
                        onChange={(e) => handleUsernameChange(e.target.value)}
                        onKeyDown={(e) => e.key === ' ' && e.preventDefault()}
                        placeholder="Digite seu login" 
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-800 focus:border-transparent transition-all duration-300"
                      />
                    </div>
                    {!usernameValido && (
                      <p className="text-rose-500 text-sm mt-1">O nome de usuário não pode conter espaços.</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Senha</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaLock className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => handlePasswordChange(e.target.value)}
                        onKeyDown={(e) => e.key === ' ' && e.preventDefault()}
                        placeholder="Digite sua senha"
                        className={`w-full pl-10 pr-12 py-3 bg-slate-50 dark:bg-slate-800 border ${senhaValida ? 'border-slate-300 dark:border-slate-600' : 'border-rose-500'} rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-800 focus:border-transparent transition-all duration-300`}
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        {showPassword ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Confirmar Senha */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Confirmar Senha</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLock className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onPaste={(e) => e.preventDefault()}
                      placeholder="Confirme sua senha"
                      className="w-full pl-10 pr-12 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-800 focus:border-transparent transition-all duration-300"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {showConfirmPassword ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-rose-500 text-sm mt-1">As senhas não coincidem.</p>
                  )}
                </div>

                {/* Requisitos da Senha */}
                <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-xl text-sm space-y-1">
                  <p className="font-medium text-slate-700 dark:text-slate-300 mb-2">Requisitos da senha:</p>
                  <p className={`${requisitosSenha.tamanho ? 'text-green-600' : 'text-slate-600 dark:text-slate-400'}`}>
                    {requisitosSenha.tamanho ? '✔' : '✖'} Mínimo 6 caracteres
                  </p>
                  <p className={`${requisitosSenha.maiuscula ? 'text-green-600' : 'text-slate-600 dark:text-slate-400'}`}>
                    {requisitosSenha.maiuscula ? '✔' : '✖'} Ao menos uma letra maiúscula
                  </p>
                  <p className={`${requisitosSenha.minuscula ? 'text-green-600' : 'text-slate-600 dark:text-slate-400'}`}>
                    {requisitosSenha.minuscula ? '✔' : '✖'} Ao menos uma letra minúscula
                  </p>
                  <p className={`${requisitosSenha.numero ? 'text-green-600' : 'text-slate-600 dark:text-slate-400'}`}>
                    {requisitosSenha.numero ? '✔' : '✖'} Ao menos um número
                  </p>
                  <p className={`${requisitosSenha.especial ? 'text-green-600' : 'text-slate-600 dark:text-slate-400'}`}>
                    {requisitosSenha.especial ? '✔' : '✖'} Ao menos um caractere especial (!@#...)
                  </p>
                  <p className={`${/\s/.test(password) ? 'text-rose-500' : 'text-green-600'}`}>
                    {/\s/.test(password) ? '✖' : '✔'} A senha não pode conter espaços
                  </p>
                </div>

                {/* Termos e Condições */}
                <div className="flex items-start gap-3">
                  <input 
                    type="checkbox" 
                    id="terms" 
                    checked={isTermoAccepted} 
                    onChange={handleTermoChange} 
                    className="mt-1 w-4 h-4 text-blue-600 dark:text-blue-400 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 rounded focus:ring-blue-400 dark:focus:ring-blue-800 focus:ring-2"
                  />
                  <label htmlFor="terms" className="text-sm text-slate-700 dark:text-slate-300">
                    Aceito os <span className="text-blue-600 dark:text-blue-400 cursor-pointer hover:underline" onClick={() => setTermsOpen(true)}>Termos de Uso</span> e <span className="text-blue-600 dark:text-blue-400 cursor-pointer hover:underline" onClick={() => setPrivacyOpen(true)}>Política de Privacidade</span>
                  </label>
                </div>

                {isTermsOpen && <TermsModal onClose={() => setTermsOpen(false)} />} 
                {isPrivacyOpen && <PrivacyModal onClose={() => setPrivacyOpen(false)} />} 

                {/* Botão de Cadastro */}
                <button
                  type="submit"
                  disabled={!isFormValid || loading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-800 to-blue-600 dark:from-blue-900 dark:to-blue-900 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Cadastrando...
                    </span>
                  ) : (
                    "Cadastrar"
                  )}
                </button>
              </form>

              {/* Divisor Google — sempre visível */}
              <div className="mt-6">
                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-300 dark:border-slate-600" />
                  </div>
                  <span className="relative bg-white/80 dark:bg-slate-800 px-4 text-sm text-slate-500 dark:text-slate-400">
                    ou cadastre-se com
                  </span>
                </div>

                <div className="mt-4 flex justify-center">
                  {googleLoading ? (
                    <div className="flex items-center justify-center h-10">
                      <svg className="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    </div>
                  ) : googleEnabled ? (
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => setErrorMessage('Login com Google cancelado ou falhou.')}
                      text="signup_with"
                      shape="rectangular"
                      theme={isDarkMode ? 'filled_black' : 'outline'}
                      size="large"
                      width="320"
                    />
                  ) : (
                    <div className="w-full">
                      <button
                        type="button"
                        disabled
                        className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 opacity-60 cursor-not-allowed select-none"
                      >
                        <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
                          <path d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z" fill="#FFC107"/>
                          <path d="M6.3 14.7l7 5.1C15.1 16 19.2 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 16.3 2 9.7 7.4 6.3 14.7z" fill="#FF3D00"/>
                          <path d="M24 46c5.5 0 10.4-1.9 14.3-5.1l-6.6-5.6C29.6 36.9 26.9 38 24 38c-6.1 0-10.7-3.1-11.7-8.5l-7 5.4C9.1 41.9 16.1 46 24 46z" fill="#4CAF50"/>
                          <path d="M44.5 20H24v8.5h11.8c-.8 2.6-2.5 4.7-4.7 6.1l6.6 5.6C41.3 36.4 44.5 30.6 44.5 24c0-1.3-.2-2.7-.5-4z" fill="#1976D2"/>
                        </svg>
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                          Cadastrar com Google
                        </span>
                      </button>
                      <p className="text-xs text-center text-amber-600 dark:text-amber-400 mt-2">
                        Configure <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> no <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">.env.local</code> para ativar
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Links */}
              <div className="mt-6 text-center space-y-4">
                <div className="flex items-center justify-center space-x-4">
                  <Link href="/" className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
                    <FaHome className="w-4 h-4" />
                    <span className="text-sm">Página Inicial</span>
                  </Link>
                  <span className="text-slate-400 dark:text-slate-500">•</span>
                  <Link href="/login" className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
                    <FaUser className="w-4 h-4" />
                    <span className="text-sm">Fazer Login</span>
                  </Link>
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  © 2025 Vigilância Sanitária. Todos os direitos reservados.
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
        .glass-effect {
          backdrop-filter: blur(10px);
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .dark .glass-effect {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
};

export default SignUpVisa;