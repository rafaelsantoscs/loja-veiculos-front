'use client';

import { useEffect, useState } from 'react';
import { formatCEP, formatCNPJ, formatPhoneNumberForInput, removerCaracteresNaoNumericos } from '@/utils/formatters';
import axiosInstance from '@/services/axiosInstance';
import { getUserLocalStorage } from '@/store/userLocalStorage';
import axios from 'axios';
import { toast } from 'react-toastify';

type Empregador = {
  id: number;
  nome: string;
  cnpj: string;
  razaoSocial:string;
  logradouro: string;
  numero: string;
  bairro: string;
  pontoDeReferencia: string;
  cep: string;
  horarioAtendimento: string;
  telefone: string;
  email: string;
  cidade: string;
  latitude:number;
  longitude:number;
};

export default function EmpregadorForm() {
  const [token, setToken] = useState(""); // ✅ token via useState

  const [formData, setFormData] = useState<Empregador>({
    id: 0,
    nome: '',
    cnpj: '',
    razaoSocial: '',
    logradouro: '',
    numero: '',
    bairro: '',
    pontoDeReferencia: '',
    cep: '',
    horarioAtendimento: '',
    telefone: '',
    email: '',
    cidade: '',
    latitude:0,
    longitude:0,
  });

  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [empregadorSalvo, setEmpregadorSalvo] = useState<Empregador | null>(null);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [idEmpregador, setIdEmpregador] = useState<number | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);
const [tipoMensagem, setTipoMensagem] = useState<"erro" | "sucesso" | null>(null);


  // Carrega token ao montar o componente
  useEffect(() => {
    const user = getUserLocalStorage();
    if (user?.token) {
      setToken(user.token);
    } else {
      console.warn("Token não encontrado no localStorage.");
    }
  }, []);

  // Carrega empregador quando o token estiver disponível
  useEffect(() => {
    if (!token) return;

    const carregarEmpregador = async () => {
      try {
        const response = await axiosInstance.get('/empregador', {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        console.log("Dados recebidos:", response.data);
        const empregador = response.data[0];
        if (empregador.id) {
          setFormData(empregador);
          setIdEmpregador(empregador.id);
          setModoEdicao(true);
        }
      } catch (error) {
        console.log("Nenhum empregador encontrado.");
      }
    };

    carregarEmpregador();
  }, [token]); //  depende do token carregado

  useEffect(() => {
    if (mensagem) {
      const timeout = setTimeout(() => {
        setMensagem(null);
        setTipoMensagem(null);
      }, 2000);
  
      return () => clearTimeout(timeout);
    }
  }, [mensagem]);
  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!token) {
      setMensagem("Token de autenticação não encontrado. Faça login novamente.");
      setTipoMensagem("erro");
      return;
    }
  
    setLoading(true);
  
    try {
      if (modoEdicao && !idEmpregador) {
        setMensagem("ID do empregador não encontrado para edição.");
        setTipoMensagem("erro");
        setLoading(false);
        return;
      }
  
      const url = modoEdicao
        ? `/empregador/${idEmpregador}`
        : '/empregador/cadastrar';
  
      const metodo = modoEdicao ? 'put' : 'post';
  
      const dadosParaEnvio = {
        ...formData,
        cnpj: removerCaracteresNaoNumericos(formData.cnpj),
        telefone: removerCaracteresNaoNumericos(formData.telefone),
        cep: removerCaracteresNaoNumericos(formData.cep),
      };
  
  
      const response = await axiosInstance[metodo](url, dadosParaEnvio, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
  
      console.log("Resposta do servidor:", response.data);
      toast.success("Dados do Empregador Atualizados!");
      setEmpregadorSalvo(response.data);
      setShowModal(true);
  
      if (!modoEdicao && response.data.id) {
        setIdEmpregador(response.data.id);
        setModoEdicao(true);
      }
  
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message;
    
        if (typeof message === 'string' && message.includes("JWT String argument cannot be null or empty")) {
          setMensagem("Erro de autenticação: o token JWT está ausente ou inválido.");
          setTipoMensagem("erro");
        } else {
          setMensagem("Erro ao salvar os dados do empregador.");
          setTipoMensagem("erro");
        }
      } else {
        setMensagem("Ocorreu um erro desconhecido.");
        setTipoMensagem("erro");
      }
    } finally {
      setLoading(false);
    }
  };
  
  
  
  
  

  return (
    <>

      {mensagem && (
        <div
          className={`w-full px-4 py-3 rounded-md text-sm font-semibold text-center ${
            tipoMensagem === "erro"
              ? "bg-red-100 text-red-700 border border-red-300"
              : "bg-green-100 text-green-700 border border-green-300"
          }`}
        >
          {mensagem}
        </div>
      )}
      <div className="max-w-4xl mx-auto max-h-[90vh] overflow-y-auto p-6 md:p-8 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-lg shadow-md space-y-6 transition-colors duration-300">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-2xl font-bold mb-4 text-slate-700 dark:text-white">Cadastro do Empregador</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="nome" className="label">Nome <span className="text-camutanga-vinho">**</span></label>
              <input id="nome" name="nome" value={formData.nome} onChange={handleChange} className="w-full p-2 border border-slate-400 dark:border-slate-300 rounded-md dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-[#F2C200] focus:outline-none transition"
 />
            </div>
            <div>
              <label htmlFor="cnpj" className="label">CNPJ</label>
              <input id="cnpj" name="cnpj" value={formatCNPJ(formData.cnpj)} onChange={handleChange} className="w-full p-2 border border-slate-400 dark:border-slate-300 rounded-md dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-[#F2C200] focus:outline-none transition"
 />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-6">
              <label htmlFor="razaoSocial" className="label">Razão Social</label>
              <input id="razaoSocial" name="razaoSocial" value={formData.razaoSocial} onChange={handleChange} className="w-full p-2 border border-slate-400 dark:border-slate-300 rounded-md dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-[#F2C200] focus:outline-none transition"
 />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-6">
              <label htmlFor="logradouro" className="label">logradouro</label>
              <input id="logradouro" name="logradouro" value={formData.logradouro} onChange={handleChange} className="w-full p-2 border border-slate-400 dark:border-slate-300 rounded-md dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-[#F2C200] focus:outline-none transition"
 />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="numero" className="label">Número</label>
              <input id="numero" name="numero" value={formData.numero} onChange={handleChange} className="w-full p-2 border border-slate-400 dark:border-slate-300 rounded-md dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-[#F2C200] focus:outline-none transition"
 />
            </div>
            <div className="md:col-span-4">
              <label htmlFor="bairro" className="label">Bairro</label>
              <input id="bairro" name="bairro" value={formData.bairro} onChange={handleChange} className="w-full p-2 border border-slate-400 dark:border-slate-300 rounded-md dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-[#F2C200] focus:outline-none transition"
 />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-6">
              <label htmlFor="pontoDeReferencia" className="label">Ponto de Referência</label>
              <input id="pontoDeReferencia" name="pontoDeReferencia" value={formData.pontoDeReferencia} onChange={handleChange} className="w-full p-2 border border-slate-400 dark:border-slate-300 rounded-md dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-[#F2C200] focus:outline-none transition"
 />
            </div>
            <div className="md:col-span-4">
              <label htmlFor="cidade" className="label">Cidade</label>
              <input id="cidade" name="cidade" value={formData.cidade} onChange={handleChange} className="w-full p-2 border border-slate-400 dark:border-slate-300 rounded-md dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-[#F2C200] focus:outline-none transition"
 />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="cep" className="label">CEP</label>
              <input id="cep" name="cep" value={formatCEP(formData.cep)} onChange={handleChange} className="w-full p-2 border border-slate-400 dark:border-slate-300 rounded-md dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-[#F2C200] focus:outline-none transition"
 />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="horarioAtendimento" className="label">Horário de Atendimento</label>
              <input id="horarioAtendimento" name="horarioAtendimento" value={formData.horarioAtendimento} onChange={handleChange} className="w-full p-2 border border-slate-400 dark:border-slate-300 rounded-md dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-[#F2C200] focus:outline-none transition"
 />
            </div>
            <div>
              <label htmlFor="telefone" className="label">Telefone</label>
              <input id="telefone" name="telefone" value={formatPhoneNumberForInput(formData.telefone)} onChange={handleChange} className="w-full p-2 border border-slate-400 dark:border-slate-300 rounded-md dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-[#F2C200] focus:outline-none transition"
 />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="label">E-mail</label>
            <input id="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-2 border border-slate-400 dark:border-slate-300 rounded-md dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-[#F2C200] focus:outline-none transition"
 />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> 
                 <div>
                  <label htmlFor="latitude" className="label">Latitude (ex) -8.108513235518142 <span className="text-camutanga-vinho"></span></label>
                  <input id="latitude" name="latitude" value={formData.latitude} onChange={handleChange}  placeholder='-8.108513235518142' className="w-full p-2 border border-slate-400 dark:border-slate-300 rounded-md dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-[#F2C200] focus:outline-none transition"
                />
                  </div>
                   <div>
                  <label htmlFor="longitude" className="label">Longitude (ex) -35.29417930614851<span className="text-camutanga-vinho"></span></label>
                  <input id="longitude" name="longitude" value={formData.longitude} onChange={handleChange}  placeholder='-35.29417930614851' className="w-full p-2 border border-slate-400 dark:border-slate-300 rounded-md dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-[#F2C200] focus:outline-none transition"
                     />
                  </div>
              </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full font-semibold py-3 rounded transition border border-[#2D2A6B] ${
                loading
                ? 'bg-gray-400 cursor-not-allowed flex items-center justify-center gap-2 text-white'
                : 'bg-transparent text-[#2D2A6B] hover:bg-[#2D2A6B] hover:text-white dark:bg-[#2D2A6B] dark:text-white dark:hover:bg-white dark:hover:text-[#2D2A6B]'
            }`}
            >
            {loading ? (
                <>
                <div className="w-5 h-5 border-2 border-white dark:border-[#2D2A6B] border-t-transparent rounded-full animate-spin"></div>
                <span className="dark:text-[#2D2A6B]">Enviando...</span>
                </>
            ) : (
                // modoEdicao ? 'Cadastrar Empregador' : 'Atualizar Empregador'
                modoEdicao ? 'Atualizar Empregador' : 'Cadastrar Empregador'

            )}
            </button>



        </form>
      </div>

      {showModal && empregadorSalvo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg max-w-lg w-full">
            <h2 className="text-xl font-bold mb-4 text-green-600">Empregador cadastrado com sucesso!</h2>
            <div className="space-y-2 text-sm dark:text-white">
              <p><strong>Nome:</strong> {empregadorSalvo.nome}</p>
              <p><strong>CNPJ:</strong> {empregadorSalvo.cnpj}</p>
              <p><strong>Razão Social:</strong> {empregadorSalvo.razaoSocial}</p>
              <p><strong>Telefone:</strong> {empregadorSalvo.telefone}</p>
              <p><strong>Email:</strong> {empregadorSalvo.email}</p>
              <p><strong>Cidade:</strong> {empregadorSalvo.cidade}</p>
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
