'use client';

import React, { useEffect, useState } from 'react';
//import { useSelector } from 'react-redux';
//import { RootState } from '@/store/store'; 
import { formatCPF } from '@/utils/formatters';
import axiosInstance from '@/services/axiosInstance';
import { ErrorAlert } from '../Alerts/ErrorAlert';
import { SucessAlert } from '../Alerts/SucessAlert';
import axios from 'axios';
import { rolesOptions } from '@/types/types';
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

interface FormEditUserSystemProps {
  userData: User;
  onUpdate: (updatedUser: User | null) => void;
}

const FormEditUserSystem: React.FC<FormEditUserSystemProps> = ({ userData, onUpdate  }) => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="max-w-xl w-full rounded-3xl shadow-2xl border-2 border-transparent bg-gradient-to-br from-white/80 to-slate-100 dark:from-slate-900/80 dark:to-slate-800/90 backdrop-blur-xl relative animate-modal-pop">
        <div className="absolute inset-0 rounded-3xl pointer-events-none border-4 border-transparent" style={{ borderImage: 'linear-gradient(135deg, #1e40af 0%, #60a5fa 100%) 1' }}></div>
        <div className="relative bg-gradient-to-r from-blue-900 to-blue-400 dark:from-slate-800 dark:to-slate-700 p-7 border-b border-blue-200 dark:border-slate-700 flex items-center justify-between rounded-t-3xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-800 to-blue-400 rounded-2xl shadow-lg animate-glow">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                Editar Usuário
              </h2>
              <p className="text-sm text-white mt-1">
                Atualize as informações do usuário
              </p>
            </div>
          </div>
          {/* Botão de fechar pode ser implementado aqui se necessário */}
        </div>
        <div className="p-8 max-h-[70vh] overflow-y-auto bg-white/80 dark:bg-slate-900/80 rounded-b-3xl">
          {errorMessage && (
            <ErrorAlert message={errorMessage} description="" />
          )}
          {messageFound && (
            <SucessAlert message={messageFound} description="" />
          )}
          <form onSubmit={handleUpdateUser} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-left mb-2 text-slate-700 dark:text-slate-200 font-bold">Nome:</label>
                <input
                  type="text"
                  value={updatedName}
                  onChange={(e) => setUpdatedName(e.target.value)}
                  className="block w-full border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-left mb-2 text-slate-700 dark:text-slate-200 font-bold">Telefone:</label>
                <input
                  type="text"
                  value={updatedTelefone}
                  onChange={(e) => setUpdatedTelefone(e.target.value)}
                  className="block w-full border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-left mb-2 text-slate-700 dark:text-slate-200 font-bold">Email:</label>
                <input
                  type="email"
                  value={updatedEmail}
                  onChange={(e) => setUpdatedEmail(e.target.value)}
                  className="block w-full border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-left mb-2 text-slate-700 dark:text-slate-200 font-bold">Login (Username):</label>
                <input
                  type="text"
                  value={updatedUsername}
                  onChange={(e) => setUpdatedUsername(e.target.value)}
                  className="block w-full border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-left mb-2 text-slate-700 dark:text-slate-200 font-bold">CPF:</label>
                <input
                  type="text"
                  value={updatedCpf}
                  onChange={(e) => setUpdatedCpf(e.target.value)}
                  className="block w-full border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 p-2"
                  required
                />
              </div>
            </div>
            <div className="mt-4">
              <h4 className="text-md font-semibold mb-2 uppercase text-slate-700 dark:text-slate-200">Editar Papéis:</h4>
              <div className="grid grid-cols-2 gap-2">
                {rolesOptions.map((role, index) => (
                  <label key={index} className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={updatedRoles.includes(role)}
                      onChange={() => handleRoleChange(role)}
                      className="form-checkbox h-4 w-4 text-blue-600"
                    />
                    <span className="ml-2">{role}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-4 justify-end mt-8">
              <button
                type="button"
                onClick={() => onUpdate(null)}
                className="px-7 py-3 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-500 shadow-sm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-7 py-3 text-white bg-gradient-to-r from-blue-800 to-blue-400 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-800 shadow-lg hover:scale-105 transition-all duration-200"
              >
                Salvar Alterações
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FormEditUserSystem;