import { useState } from "react";
import axiosInstance from "@/services/axiosInstance";
import { toast } from "react-toastify";
import axios from "axios";
import { getUserLocalStorage } from "@/store/userLocalStorage";
import { Eye, EyeOff, Key, Lock, CheckCircle } from "lucide-react";

const AlterarSenhaForm = () => {
  const user = getUserLocalStorage() || {};
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  const [mostrarSenhaAtual, setMostrarSenhaAtual] = useState(false);
  const [forcaSenha, setForcaSenha] = useState(0);
  const [senhaMatch, setSenhaMatch] = useState(false);
  const [requisitos, setRequisitos] = useState({
    length: false,
    upper: false,
    number: false,
    special: false
  });

  const verificarForcaSenha = (senha: string) => {
    let score = 0;
    const novosRequisitos = {
      length: senha.length >= 6,
      upper: /[A-Z]/.test(senha),
      number: /\d/.test(senha),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(senha)
    };
    
    setRequisitos(novosRequisitos);
    
    // Calcular pontuação
    Object.values(novosRequisitos).forEach(req => {
      if (req) score++;
    });
    
    setForcaSenha(score);
  };

  const verificarSenhasIguais = () => {
    setSenhaMatch(novaSenha === confirmarSenha && novaSenha.length > 0);
  };

  const handleNovaSenhaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNovaSenha(value);
    verificarForcaSenha(value);
    verificarSenhasIguais();
  };

  const handleConfirmarSenhaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmarSenha(e.target.value);
    verificarSenhasIguais();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user.token) {
      toast.error("Usuário não autenticado.");
      return;
    }

    if (novaSenha !== confirmarSenha) {
      toast.error("As senhas não coincidem.");
      return;
    }

    try {
      await axiosInstance.put(
        "/usuarios/alterar-senha",
        { senhaAtual, novaSenha },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      toast.success("Senha alterada com sucesso!");
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");
      setForcaSenha(0);
      setSenhaMatch(false);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data || "Erro ao alterar a senha.");
      } else {
        toast.error("Erro inesperado ao alterar a senha.");
      }
    }
  };

  const getForcaSenhaTexto = () => {
    const niveis = [
      { texto: "Muito fraca", cor: "text-red-600", barra: "bg-red-500 w-1/4" },
      { texto: "Fraca", cor: "text-orange-600", barra: "bg-orange-500 w-2/4" },
      { texto: "Moderada", cor: "text-yellow-600", barra: "bg-yellow-500 w-3/4" },
      { texto: "Forte", cor: "text-green-600", barra: "bg-green-500 w-full" }
    ];
    
    return niveis[forcaSenha] || { texto: "", cor: "", barra: "bg-gray-200 w-0" };
  };

  return (
    <div className="rounded-3xl shadow-xl p-0 w-full bg-white dark:bg-slate-900 transition-colors duration-300">
      <div className="text-center mb-8 pt-8">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <Key className="text-blue-600 dark:text-blue-400" size={28} />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Alterar Senha</h1>
        <p className="text-gray-600 dark:text-gray-400">Mantenha sua conta segura</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 px-8 pb-8">
        {/* Senha atual */}
        <div className="mb-6">
          <label htmlFor="senhaAtual" className="flex items-center gap-2 font-semibold text-gray-700 dark:text-gray-300 mb-2">
            <Lock className="text-gray-500 dark:text-gray-400" size={16} />
            Senha atual:
          </label>
          <div className="relative">
            <input
              id="senhaAtual"
              type={mostrarSenhaAtual ? "text" : "password"}
              value={senhaAtual}
              onChange={(e) => setSenhaAtual(e.target.value)}
              className="w-full px-5 py-3 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 dark:bg-slate-800 dark:text-white pr-10 shadow-sm"
              required
              placeholder="Digite sua senha atual"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400"
              onClick={() => setMostrarSenhaAtual(!mostrarSenhaAtual)}
            >
              {mostrarSenhaAtual ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Nova senha */}
        <div className="mb-6">
          <label htmlFor="novaSenha" className="flex items-center gap-2 font-semibold text-gray-700 dark:text-gray-300 mb-2">
            <Key className="text-gray-500 dark:text-gray-400" size={16} />
            Nova senha:
          </label>
          <div className="relative">
            <input
              id="novaSenha"
              type={mostrarNovaSenha ? "text" : "password"}
              value={novaSenha}
              onChange={handleNovaSenhaChange}
              className="w-full px-5 py-3 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 dark:bg-slate-800 dark:text-white pr-10 shadow-sm"
              required
              minLength={6}
              placeholder="Digite a nova senha"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400"
              onClick={() => setMostrarNovaSenha(!mostrarNovaSenha)}
            >
              {mostrarNovaSenha ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {/* Indicador de força da senha */}
          {novaSenha.length > 0 && (
            <div className="mt-3 p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Força da senha:</span>
                <span className={`text-sm font-semibold ${getForcaSenhaTexto().cor}`}>{getForcaSenhaTexto().texto}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2 mb-3">
                <div className={`h-2 rounded-full transition-all duration-300 ${getForcaSenhaTexto().barra}`}></div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  {requisitos.length ? <CheckCircle className="text-green-500" size={16} /> : <div className="w-4 h-4 rounded-full border border-gray-300 dark:border-slate-600"></div>}
                  <span className={requisitos.length ? "text-green-600" : "text-gray-500 dark:text-gray-400"}>Pelo menos 6 caracteres</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {requisitos.upper ? <CheckCircle className="text-green-500" size={16} /> : <div className="w-4 h-4 rounded-full border border-gray-300 dark:border-slate-600"></div>}
                  <span className={requisitos.upper ? "text-green-600" : "text-gray-500 dark:text-gray-400"}>Uma letra maiúscula</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {requisitos.number ? <CheckCircle className="text-green-500" size={16} /> : <div className="w-4 h-4 rounded-full border border-gray-300 dark:border-slate-600"></div>}
                  <span className={requisitos.number ? "text-green-600" : "text-gray-500 dark:text-gray-400"}>Um número</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {requisitos.special ? <CheckCircle className="text-green-500" size={16} /> : <div className="w-4 h-4 rounded-full border border-gray-300 dark:border-slate-600"></div>}
                  <span className={requisitos.special ? "text-green-600" : "text-gray-500 dark:text-gray-400"}>Um caractere especial</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Confirmar nova senha */}
        <div className="mb-6">
          <label htmlFor="confirmarSenha" className="flex items-center gap-2 font-semibold text-gray-700 dark:text-gray-300 mb-2">
            <CheckCircle className="text-gray-500 dark:text-gray-400" size={16} />
            Confirmar nova senha:
          </label>
          <div className="relative">
            <input
              id="confirmarSenha"
              type={mostrarConfirmarSenha ? "text" : "password"}
              value={confirmarSenha}
              onChange={handleConfirmarSenhaChange}
              className="w-full px-5 py-3 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 dark:bg-slate-800 dark:text-white pr-10 shadow-sm"
              required
              minLength={6}
              placeholder="Confirme a nova senha"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400"
              onClick={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
            >
              {mostrarConfirmarSenha ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {/* Indicador de correspondência de senha */}
          {confirmarSenha.length > 0 && (
            <div className="mt-2 flex items-center gap-2 text-sm">
              {senhaMatch ? <CheckCircle className="text-green-500" size={16} /> : <div className="w-4 h-4 rounded-full border border-gray-300 dark:border-slate-600"></div>}
              <span className={senhaMatch ? "text-green-600" : "text-gray-500 dark:text-gray-400"}>
                {senhaMatch ? "As senhas coincidem" : "As senhas não coincidem"}
              </span>
            </div>
          )}
        </div>

        {/* Botão */}
        <button
          type="submit"
          className="w-full py-3 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-800 to-blue-400 hover:from-blue-900 hover:to-blue-500 text-white font-bold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg text-lg"
          disabled={!senhaMatch || forcaSenha < 2}
        >
          <Key size={18} />
          Alterar senha
        </button>
      </form>
    </div>
  );
};

export default AlterarSenhaForm;