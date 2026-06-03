'use client';

import React, { useState } from 'react';
//import { useSelector } from 'react-redux';
//import { RootState } from '@/store/store'; 
import { formatCPF } from '@/utils/formatters';
import axiosInstance from '@/services/axiosInstance';
import { ErrorAlert } from '../Alerts/ErrorAlert';
import { SucessAlert } from '../Alerts/SucessAlert';
import InformacoesDoUsuario from './InformacoesDoUsuario';
import { getUserLocalStorage } from '@/store/userLocalStorage';

interface User {
  id: number | null;
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  username: string;
  imagemUrl?: string;
  roles?: string[]; // Opcional
}

const SearchSystemUserByCpf = () => {
  //const { token } = useSelector((state: RootState) => state.user);
  const token = getUserLocalStorage()?.token || ''; // Obtém o token com segurança

  const [ errorMessage, setErrorMessage] = useState('')
  const [ messageFound, setMessageFound ] = useState('')
  const [ messageNotFound, setMessageNotFound ] = useState('')
  const [loading, setLoading] = useState(false);
  const [cpf, setCpf] = useState('');
  const [userData, setUserData] = useState(null);

   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedCPF = formatCPF(e.target.value);
    setCpf(formattedCPF);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setMessageFound('');
    setMessageNotFound('');
    
    if (!cpf || cpf.length !== 14) {
      setErrorMessage('Preencha o campo com um CPF válido.');
      return;
    }
    setLoading(true);
  
    try {
      // Envia os dados para o servidor
      const response = await axiosInstance.get(`/usuarios/buscar-por-cpf/${cpf}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200) {
        setUserData(response.data);
      } else{
        setMessageNotFound("Cadastro não Encontrado");
      }
    } catch (error) {
      //setCpfErradoValido(cpf);
      setUserData(null);
      //setFoto('');
      setErrorMessage('Sem cadastro!');
      //setMessageFound('');
    } finally {
      setLoading(false);
    }
  };

  const handleUserUpdate = (updatedUser: User | null) => {
    if (updatedUser === null) {
      setUserData(null); // Limpa o estado do usuário
      setCpf(''); // Limpa o CPF, se necessário
      setMessageFound("Cadastro atualizado com sucesso!");
    }
  };
  

  return (
    <div className="flex items-center justify-center py-8">
      <div className="w-full max-w-xl rounded-2xl shadow-xl overflow-hidden bg-white dark:bg-slate-800">
        {/* Cover Image */}
        <div className="relative h-28 bg-gradient-to-br from-blue-800 to-blue-600 flex items-end">
          <div className="absolute inset-0 bg-black bg-opacity-20 rounded-t-2xl"></div>
          <div className="relative w-full z-10 pb-3 px-6 flex flex-col items-start">
            <h1 className="text-xl font-bold text-white drop-shadow mb-1 w-full text-center">Buscar Cadastro Pelo CPF</h1>
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-3 py-1 inline-block mx-auto">
              <span className="text-white text-sm font-medium">Buscar CPF</span>
            </div>
          </div>
        </div>
        {/* Card Content */}
        <div className="px-6 pb-8 pt-4 text-center">
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 mb-4 items-center justify-center">
            <input
              name={cpf}
              type="text"
              value={cpf}
              onChange={handleChange}
              className="flex-1 border border-slate-300 dark:border-slate-600 p-2 rounded-lg shadow-sm bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="000.000.000-00"
            />
            <button
              type="submit"
              className="w-full md:w-1/3 bg-gradient-to-r from-blue-800 to-blue-400 text-white font-semibold py-2 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800"
            >
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
          </form>
          {errorMessage && <ErrorAlert message={errorMessage} />}
          {messageFound && <SucessAlert message={messageFound} />}
          {messageNotFound && <ErrorAlert message={messageNotFound} />}

          {userData && <InformacoesDoUsuario userData={userData}  onUpdate={handleUserUpdate} />}
        </div>
      </div>
    </div>
  );
};

export default SearchSystemUserByCpf;