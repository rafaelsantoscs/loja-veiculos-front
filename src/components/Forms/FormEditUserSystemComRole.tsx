'use client';

import React, { useEffect, useState } from 'react';
//import { useSelector } from 'react-redux';
//import { RootState } from '@/store/store'; 
import { formatCPF } from '@/utils/formatters';
import axiosInstance from '@/services/axiosInstance';
import { ErrorAlert } from '../Alerts/ErrorAlert';
import { SucessAlert } from '../Alerts/SucessAlert';
import axios from 'axios';
import { getUserLocalStorage } from '@/store/userLocalStorage';
//import { rolesOptions } from '@/types/types';

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

interface FormEditUserSystemProps {
  userData: User;
  onUpdate: (updatedUser: User | null) => void;
  allowedRoles?: string[];
}

const FormEditUserSystemComRole: React.FC<FormEditUserSystemProps> = ({ userData, onUpdate, allowedRoles  }) => {
  //const { token } = useSelector((state: RootState) => state.user);
  const token = getUserLocalStorage()?.token || '';


  const [errorMessage, setErrorMessage] = useState('');
  const [messageFound, setMessageFound] = useState('');
  const [messageNotFound, setMessageNotFound] = useState('');
  
  const [updatedRoles, setUpdatedRoles] = useState<string[]>([]); 
  const [updatedName, setUpdatedName] = useState('');
  const [updatedTelefone, setUpdatedTelefone] = useState('');
  const [updatedEmail, setUpdatedEmail] = useState('');
  const [updatedUsername, setUpdatedUsername] = useState('');
  const [updatedCpf, setUpdatedCpf] = useState('');

  useEffect(() => {
    if (userData) {
      setUpdatedName(userData.nome);
      setUpdatedTelefone(userData.telefone);
      setUpdatedEmail(userData.email);
      setUpdatedUsername(userData.username);
      setUpdatedCpf(formatCPF(userData.cpf));
      setUpdatedRoles(userData.roles || []); // Preenche os papéis ao buscar dados do usuário
    }
  }, [userData]);

  const handleRoleChange = (role: string) => {
    setUpdatedRoles((prev) =>
      prev.includes(role)
        ? prev.filter((r) => r !== role) // Remove o papel se já estiver selecionado
        : [...prev, role] // Adiciona o papel se não estiver selecionado
    );
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userData || userData.id === null) {
      setErrorMessage('Dados do usuário inválidos.');
      return;
    }

    // Resetar mensagens
    setErrorMessage('');
    setMessageFound('');
    setMessageNotFound('');

    try {
      // Envia os dados atualizados para o servidor
      const response = await axiosInstance.patch(`/usuarios/atualizar-dados/${userData.id}`, {
        nome: updatedName,
        telefone: updatedTelefone,
        email: updatedEmail,
        username: updatedUsername,
        cpf: updatedCpf,
        roles: updatedRoles // Inclui os papéis
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200) {
        
        onUpdate(null);
      } else {
        setErrorMessage('Falha ao atualizar os dados do usuário.');
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response && error.response.data && (error.response.data).message) {
          setErrorMessage((error.response.data).message);
        } else {
          setErrorMessage('Erro ao atualizar os dados do usuário.');
        }
      } else {
        // Tratamento para outros tipos de erro
        setErrorMessage('Erro desconhecido ao atualizar os dados do usuário.');
      }
    }
  };

  // Limpar mensagens após 4 segundos
  useEffect(() => {
    if (messageNotFound) {
      const timer = setTimeout(() => setMessageNotFound(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [messageNotFound]);

  useEffect(() => {
    if (messageFound) {
      const timer = setTimeout(() => setMessageFound(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [messageFound]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);
  
  return (
    <div className="mt-6 p-4 bg-slate-50 border bg-transparent dark:text-samu-branco border-slate-300 rounded-lg min-w-screen flex-col md:flex-row md:space-x-4">
      <h3 className="text-md font-semibold mb-2">Editar Dados do Usuário</h3>
      {errorMessage && (
        <ErrorAlert message={errorMessage} description="" />
      )}
      {messageFound && (
        <SucessAlert message={messageFound} description="" />
      )}
      <form onSubmit={handleUpdateUser} className="mt-4 bg-transparent  dark:bg-transparent p-4 rounded-3xl">
      <div className="flex flex-col md:flex-row md:space-x-4 space-x-4 bg-transparent dark:bg-transparent ">  {/* div inserida para que o dados fiquem lado a lado com a div de editar papeis */}
        <div className="grid grid-cols-1 gap-4 ">
          <label className="block">
            <span className="text-slate-700 dark:text-samu-branco font-bold">Nome:</span>
            <input
              type="text"
              value={updatedName}
              onChange={(e) => setUpdatedName(e.target.value)}
              className="mt-1 block w-full border-samu-azul text-samu-preto rounded-md shadow-sm bg-rose-100 dark:bg-slate-100 focus:ring-samu-azul focus:border-blue-500 p-1"
              required
            />
          </label>
          <label className="block ">
            <span className="text-slate-700 dark:text-samu-branco font-bold">Telefone:</span>
            <input
              type="text"
              value={updatedTelefone}
              onChange={(e) => setUpdatedTelefone(e.target.value)}
              className="mt-1 block w-full border-samu-azul text-samu-preto rounded-md shadow-sm bg-rose-100 dark:bg-slate-100 focus:ring-blue-500 focus:border-blue-500 bg-red-100 p-1 "
              required
            />
          </label>
          <label className="block">
            <span className="text-slate-700 font-bold dark:text-samu-branco">Email:</span>
            <input
              type="email"
              value={updatedEmail}
              onChange={(e) => setUpdatedEmail(e.target.value)}
              className="mt-1 block w-full border-samu-azul text-samu-preto rounded-md shadow-sm bg-rose-100 dark:bg-slate-100 focus:ring-blue-500 focus:border-blue-500 p-1 "
              required
            />
          </label>
          <label className="block">
            <span className="text-slate-700 font-bold dark:text-samu-branco">Login (Username):</span>
            <input
              type="text"
              value={updatedUsername}
              onChange={(e) => setUpdatedUsername(e.target.value)}
              className="mt-1 block w-full border-samu-azul text-samu-preto rounded-md shadow-sm  dark:text-samu-preto bg-rose-100 dark:bg-slate-100 focus:ring-blue-500 focus:border-blue-500 p-1"
              required
            />
          </label>
          <label className="block">
            <span className="text-slate-700 font-bold dark:text-samu-branco">CPF:</span>
            <input
              type="text"
              value={updatedCpf}
              onChange={(e) => setUpdatedCpf(e.target.value)}
              className="mt-1 mb-1 block w-full border-samu-azul text-samu-preto rounded-md shadow-sm  dark:text-samu-preto bg-rose-100 dark:bg-slate-100 focus:ring-blue-500 focus:border-blue-500 p-1"
              required
            />
          </label>
        </div>

        <div className="mt-4 md:mt-0 p-4 border-green-300">
          <h4 className="text-md font-semibold mb-2 uppercase">Editar Papéis:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {allowedRoles?.map((role, index) => (
              <label key={index} className="inline-flex items-center text-samu-preto dark:text-samu-branco">
                <input
                  type="checkbox"
                  checked={updatedRoles.includes(role)}
                  onChange={() => handleRoleChange(role)}
                  className="form-checkbox h-4 w-4  text-samu-azul dark:text-samu-branco"
                />
                <span className="ml-2">{role}</span>
              </label>
            ))}
          </div>
        </div>
        </div>

        <button
          type="submit"
          className=" mt-3 p-2 border-2 border-samu-azul bg-transparent 
                 text-samu-azul py-2 rounded-md hover:bg-samu-azul hover:text-samu-branco
                 dark:border-samu-branco dark:bg-transparent dark:text-samu-branco dark:hover:bg-samu-branco dark:hover:text-samu-azul
                 focus:outline-none focus:ring-2 focus:ring-samu-azul"
        >
          Atualizar
        </button>
      </form>
    </div>
  );
};

export default FormEditUserSystemComRole;