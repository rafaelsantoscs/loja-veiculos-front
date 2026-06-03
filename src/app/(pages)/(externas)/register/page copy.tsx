'use client';

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CreditCard as CreditCardIcon, Email as EmailIcon, Person as PersonIcon, Phone as PhoneIcon, Visibility, VisibilityOff } from '@mui/icons-material';
import { formatCPF, formatPhoneNumberForInput, removerCaracteresNaoNumericos, validarCPF } from "@/utils/formatters";
import axiosInstance from "@/services/axiosInstance";
import TermsModal from "@/components/Modal/TermsModal";
import PrivacyModal from "@/components/Modal/PrivacyModal";
import { AxiosError } from "axios"; // Importar o tipo AxiosError

const SignUpCamutanga: React.FC = () => {
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

  // const [errorMessage, setErrorMessage] = useState<string | { message: string } | null>(null);



  const [requisitosSenha, setRequisitosSenha] = useState({
    tamanho: false,
    maiuscula: false,
    minuscula: false,
    numero: false,
    especial: false,
  });

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
      setTermo(`O Usuário ${nome}, CPF ${cpf}, aceitou os termos em https://saudevsa.com.br/termo e a política de privacidade em https://saudevsa.com.br/privacy em ${dataRegistro}.`);
    } else {
      setTermo("");
    }
  };

  // const verificarDominioEmail = async (email: string): Promise<string> => {
  //   try {
  //     const response = await axiosInstance.get(`/usuarios/validar-email`, {
  //       params: { email },
  //     });
  
  //    // console.log('VALIDANDO SE É UM DOMINIO REAL',response.data); // Verifique a resposta do servidor
  //     return response.data; // mensagem de sucesso

  //   } catch (error) {
  //     const err = error as AxiosError<{ message: string }>; // Especificar o tipo esperado no AxiosError
  //     if (err.response && err.response.data) {
  //       return err.response.data.message || "Erro ao verificar o domínio do e-mail."; // mensagem de erro
  //     }
  //     return "Erro ao verificar o domínio do e-mail.";
  //   }
  // };
  
  


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
      setErrorMessage("A senha deve ter no mínimo 6 caracteres, com letra maiúscula, minúscula, número e símbolo.");
      return;
    }

    // const dominioMsg = await verificarDominioEmail(email);
    // if (dominioMsg !== "Domínio válido para receber e-mails.") {
    //   setErrorMessage(dominioMsg);
    //   return;
    // }
  
    setLoading(true);
    
    try {
       const response = await axiosInstance.post('/usuarios/salvar-usuario', {
      //   // const response = await axiosInstance.post('/pre-cadastro', {

         nome,
         email,
         telefone:removerCaracteresNaoNumericos(telefone),
         username,
         password,
         roles,
         cpf: removerCaracteresNaoNumericos(cpf),
         termo,
       });
  
       if (response.status === 201) {
         router.push('/confirmar-email');
       } else {
         setErrorMessage('Erro ao cadastrar. Tente novamente.');
       }
      } catch (error) {
        const err = error as AxiosError<{ message: string }>; // Especificar o tipo esperado no AxiosError
        if (err.response && err.response.status === 409) {
          // Verificar se o erro contém a propriedade "message"
          const errorMessage = err.response.data?.message || 'Erro ao conectar ao servidor.';
          setErrorMessage(errorMessage);
        } else {
          setErrorMessage('Erro ao conectar ao servidor.');
        }
    } finally {
      setLoading(false);
    }
  };
  

  // const formatAndSetCpfInput = (value: string) => {
  //   const formattedCpf = formatCPF(value);
  //   setCpf(formattedCpf);
  // };

  const formatAndSetCpfInput = (valor: string) => {
    const apenasNumeros = valor.replace(/\D/g, '');
    const cpfFormatado = formatCPF(apenasNumeros);
    
    setCpf(cpfFormatado); // atualiza o campo com pontos e traço
    setCpfValido(validarCPF(apenasNumeros)); // valida os dígitos
  };

  const handleUsernameChange = (value: string) => {
    setUsername(value);
    setUsernameValido(!/\s/.test(value)); // true se não tiver espaços
  };

  // validando cpf matematicamente
  const [cpfValido, setCpfValido] = useState(true);
  // const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const novoCpf = e.target.value;
  //   setCpf(novoCpf);
  //   setCpfValido(validarCPF(novoCpf));
  // };

   //validando email

   const validarFormatoEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  //habilitando apenas se atender aos requisitos
  const isFormValid =
  nome.trim() !== '' &&
  cpf.trim() !== '' &&
  email.trim() !== '' &&
  validarFormatoEmail(email) &&
  confirmEmail.trim() !== '' &&
  email === confirmEmail &&
  telefone.trim() !== '' &&
  username.trim() !== '' &&
  !/\s/.test(username) && // não permite espaço no login
  password.trim() !== '' &&
  !/\s/.test(password) && // não permite espaço na senha
  confirmPassword.trim() !== '' &&
  password === confirmPassword &&
  isTermoAccepted;

  //validando a senha
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


  //const senhaConfere = password === confirmPassword;

  
  


  return (
    <div className="w-full min-h-screen flex flex-col lg:flex-row
    bg-white dark:bg-[#2d3142] 
        bg-cover bg-center 
        bg-[url('/images/colaboradores/samu-light.jpg')] 
        dark:bg-[url('/images/colaboradores/samu-dark.jpg')]
    ">
      <div className="hidden lg:flex w-1/2 items-center justify-center bg-transparent dark:bg-transparent">
        <div className="w-full lg:w-1/2 flex flex-col items-center text-center">
                <div className="flex flex-col items-center gap-2 ">
                      <Image
                        src="https://imgur.com/CxGjt56.png"
                        alt="Logotipo do Frota VSA"
                        width={300}
                        height={300}
                        className="object-contain "
                        priority
                      />
        
                      <div translate="no" className="leading-snug -mt-18">
                        {/* <p className="text-xl sm:text-2xl font-extrabold tracking-wide text-samu-vermelho dark:text-samu-branco">
                          VISA
                        </p> */}
                        <p className="text-5xl sm:text-6xl font-extrabold  tracking-wide text-samu-vermelho dark:text-samu-branco">
                          VISA
                        </p>
                      </div>
        
                    <Link
                      href="/"
                      className="inline-block mt-6 px-6 py-2 rounded-md 
                                bg-samu-vermelho text-white border-2 border-samu-vermelho
                                hover:bg-white hover:text-samu-vermelho 
                                dark:bg-transparent dark:text-white dark:border-white
                                dark:hover:bg-samu-branco dark:hover:text-samu-vermelho 
                                transition"
                    >
                      Voltar ao início
                    </Link>
                    </div>
                </div>
                </div>

      {/* <div className="w-full lg:w-1/2 p-6 sm:p-10"> */}
      <div className="w-full lg:w-1/2 max-h-screen overflow-y-auto p-6 sm:p-10 scrollbar-thin scrollbar-thumb-camutanga-azul scrollbar-track-white dark:scrollbar-thumb-camutanga-branco dark:scrollbar-track-transparent">
        <h2 className="text-2xl font-bold mb-4 text-samu-vermelho dark:text-samu-laranja">Criar uma conta de Acesso</h2>
        <div className="space-y-2">
          <div className="relative">
            <label className="block text-sm font-medium">Nome</label>
            <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Digite seu nome completo" className="w-full p-3 pr-10 rounded border border-slate-300 dark:border-slate-600 bg-transparent" />
            <span className="absolute right-4 top-9"><PersonIcon className="opacity-50" /></span>
          </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="relative">
            <label className="block text-sm font-medium">CPF</label>
            <input type="text" value={cpf} onChange={(e) => formatAndSetCpfInput(e.target.value)} placeholder="Digite seu CPF" className="w-full p-3 pr-10 rounded border border-slate-300 dark:border-slate-600 bg-transparent" />
            <span className="absolute right-4 top-9"><CreditCardIcon className="opacity-50" /></span>
          </div>
          {!cpfValido && <p className="text-rose-600 text-sm mt-1">CPF inválido</p>}

          <div className="relative">
            <label className="block text-sm font-medium">Telefone</label>
            <input type="text" value={telefone} onChange={(e) => setTelefone(formatPhoneNumberForInput(e.target.value))} placeholder="Digite seu telefone" className="w-full p-3 pr-10 rounded border border-slate-300 dark:border-slate-600 bg-transparent" />
            <span className="absolute right-4 top-9"><PhoneIcon className="opacity-50" /></span>
          </div>
          </div>
          <div className="relative">
            <label className="block text-sm font-medium">Email</label>
            <input type="email" value={email} 
           onChange={(e) => {
            const value = e.target.value;
            setEmail(value);
            setEmailValido(validarFormatoEmail(value));
          }}
            placeholder="Digite seu email"
            onKeyDown={(e) => e.key === ' ' && e.preventDefault()} 
            className="w-full p-3 pr-10 rounded border border-slate-300 dark:border-slate-600 bg-transparent" />
            <span className="absolute right-4 top-9"><EmailIcon className="opacity-50" /></span>
          </div>
          {email && !emailValido && (
          <p className="text-red-500 text-sm mt-1">Digite um e-mail válido.</p>
              )}

          <div className="relative">
            <label className="block text-sm font-medium">Confirmar Email</label>
            <input
              type="email"
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              placeholder="Confirme seu email"
              onPaste={(e) => e.preventDefault()}
              onKeyDown={(e) => e.key === ' ' && e.preventDefault()}               
              className="w-full p-3 pr-10 rounded border border-slate-300 dark:border-slate-600 bg-transparent"
            />
            <span className="absolute right-4 top-9"><EmailIcon className="opacity-50" /></span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">

          <div className="relative">
            <label className="block text-sm font-medium">Login</label>
            <input type="text" value={username}
             onChange={(e) => handleUsernameChange(e.target.value)}
             onKeyDown={(e) => e.key === ' ' && e.preventDefault()}
             placeholder="Digite seu login" 
             className="w-full p-3 rounded border border-slate-300 dark:border-slate-600 bg-transparent" />
            <span className="absolute right-4 top-9"><PersonIcon className="opacity-50" /></span>
          </div>
          {!usernameValido && (
              <p className="text-red-500 text-sm mt-1">
                O nome de usuário/login não pode conter espaços.
              </p>
            )}

          <div className="relative">
            <label className="block text-sm font-medium">Senha</label>
            {/* <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Digite sua senha" className="w-full p-3 pr-10 rounded border border-slate-300 dark:border-slate-600 bg-transparent" /> */}
            <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => handlePasswordChange(e.target.value)}
            onKeyDown={(e) => e.key === ' ' && e.preventDefault()}
            placeholder="Digite sua senha"
            className={`w-full p-3 pr-10 rounded border ${senhaValida ? 'border-slate-300 dark:border-slate-600' : 'border-red-500'} bg-transparent`}
          />

            <span className="absolute right-4 top-9 cursor-pointer" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <Visibility className="opacity-50"/> : <VisibilityOff className="opacity-50"/>}</span>
          </div>
            </div>

         


          <div className="relative">
              <label className="block text-sm font-medium">Confirmar senha</label>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onPaste={(e) => e.preventDefault()}
                placeholder="Confirme sua senha"
                className="w-full p-3 pr-10 rounded border border-slate-300 dark:border-slate-600 bg-transparent"
              />
              <span
                className="absolute right-4 top-9 cursor-pointer"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <Visibility className="opacity-50" /> : <VisibilityOff className="opacity-50" />}
              </span>

              {/* Mensagem dinâmica */}
              {confirmPassword && password !== confirmPassword && (
                <p className="text-red-500 text-sm mt-1">As senhas não coincidem.</p>
              )}
            </div>

         <div className="mt-2 space-y-1 text-sm">
        <p className={`${requisitosSenha.tamanho ? 'text-green-600' : 'text-camutanga-azul dark:text-camutanga-branco'}`}>
          {requisitosSenha.tamanho ? '✔' : '✖'} Mínimo 6 caracteres
        </p>
        <p className={`${requisitosSenha.maiuscula ? 'text-green-600' : 'text-camutanga-azul dark:text-camutanga-branco'}`}>
          {requisitosSenha.maiuscula ? '✔' : '✖'} Ao menos uma letra maiúscula
        </p>
        <p className={`${requisitosSenha.minuscula ? 'text-green-600' : 'text-camutanga-azul dark:text-camutanga-branco'}`}>
          {requisitosSenha.minuscula ? '✔' : '✖'} Ao menos uma letra minúscula
        </p>
        <p className={`${requisitosSenha.numero ? 'text-green-600' : 'text-camutanga-azul dark:text-camutanga-branco'}`}>
          {requisitosSenha.numero ? '✔' : '✖'} Ao menos um número
        </p>
        <p className={`${requisitosSenha.especial ? 'text-green-600' : 'text-camutanga-azul dark:text-camutanga-branco'}`}>
          {requisitosSenha.especial ? '✔' : '✖'} Ao menos um caractere especial (!@#...)
        </p>
        <p className={`${/\s/.test(password) ? 'text-red-500' : 'text-green-600'}`}>
          {/\s/.test(password) ? '✖' : '✔'} A senha não pode conter espaços
        </p>
      </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="terms" checked={isTermoAccepted} onChange={handleTermoChange} />
            <label htmlFor="terms" className="text-sm">
              Aceito os <span className="text-primary cursor-pointer" onClick={() => setTermsOpen(true)}>Termos de Uso</span> e <span className="text-primary cursor-pointer" onClick={() => setPrivacyOpen(true)}>Política de Privacidade</span>
            </label>
          </div>

          {isTermsOpen && <TermsModal onClose={() => setTermsOpen(false)} />} 
          {isPrivacyOpen && <PrivacyModal onClose={() => setPrivacyOpen(false)} />} 
          {/* {errorMessage && <p className="text-red-500 text-sm text-center">{errorMessage}</p>} */}
          {errorMessage && (
            <div className="text-red-500 text-sm text-center mt-2">
              {typeof errorMessage === 'string'
                ? errorMessage
                : errorMessage.message ?? 'Erro inesperado.'}
            </div>
          )}

        {confirmEmail && email !== confirmEmail && (
          <p className="text-red-500 text-sm mt-1">Os e-mails não coincidem.</p>
        )}



          <button
            className={`
              w-full py-3 rounded transition border-2 
              bg-white text-samu-vermelho border-samu-vermelho hover:bg-samu-vermelho hover:text-white

              dark:bg-transparent dark:text-samu-branco dark:border-samu-branco 
              dark:hover:bg-samu-branco dark:hover:text-samu-vermelho
            `}
            onClick={handleRegister}
            disabled={!isFormValid || loading}
          >
            {loading ? "Carregando..." : "Cadastrar"}
          </button>


          <div className="text-center mt-4">
            <p>Já tem conta? <Link href="/login" className="text-samu-vermelho underline dark:text-samu-laranja">Entrar</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpCamutanga;