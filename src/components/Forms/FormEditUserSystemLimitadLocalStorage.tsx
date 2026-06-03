'use client';

import React, { useEffect, useState } from 'react';
import axiosInstance from '@/services/axiosInstance';
import { ErrorAlert } from '../Alerts/ErrorAlert';
import { SucessAlert } from '../Alerts/SucessAlert';
import axios from 'axios';
import Image from 'next/image';
import { BASE_URL } from '@/config/config';
import { useRouter } from 'next/navigation';
import { clearUserLocalStorage, getUserLocalStorage } from '@/store/userLocalStorage';
import { formatPhoneNumberForInput } from '@/utils/formatters';
import { Camera, Save } from 'lucide-react';

type Props = {
  onClose?: () => void;
};

const FormEditUserSystemLimitedLocalStorage: React.FC<Props> = ({ onClose }) => {
  const router = useRouter();

  const [user, setUser] = useState({
    roles: [] as string[],
    imagemUrl: '',
    nomeCompleto: '',
    email: '',
    telefone: '',
    cpf: '',
    id: '',
    token: '',
  });

  const urlPhotPerfil =
    user.imagemUrl && user.imagemUrl !== '/' && !user.imagemUrl.endsWith('/')
      ? BASE_URL + user.imagemUrl
      : '/images/profile/bg_default.png';

  const [errorMessage, setErrorMessage] = useState('');
  const [messageFound, setMessageFound] = useState('');
  const [updatedName, setUpdatedName] = useState(user.nomeCompleto);
  const [updatedTelefone, setUpdatedTelefone] = useState(user.telefone);
  const [updatedEmail, setUpdatedEmail] = useState(user.email);
  const [fileInfo, setFileInfo] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = getUserLocalStorage();
    if (storedUser) {
      setUser({
        roles: storedUser.roles ?? [],
        imagemUrl: storedUser.imagemUrl ?? '',
        nomeCompleto: storedUser.nomeCompleto ?? '',
        email: storedUser.email ?? '',
        telefone: storedUser.telefone ?? '',
        cpf: storedUser.cpf ?? '',
        id: storedUser.id ?? '',
        token: storedUser.token ?? '',
      });
    }
  }, []);

  useEffect(() => {
    setUpdatedName(user.nomeCompleto);
    setUpdatedTelefone(user.telefone);
    setUpdatedEmail(user.email);
  }, [user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileInfo(file);
      
      // Criar preview da imagem
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateUserData = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setMessageFound('');

    try {
      const response = await axiosInstance.patch(
        `/usuarios/atualizar-dados/${user.id}`,
        { nome: updatedName, telefone: updatedTelefone, email: updatedEmail },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        setMessageFound('Cadastro atualizado com sucesso! É necessário fazer login novamente.');
        await handleSaveImage();
        // Close modal after successful update
        if (onClose) {
          setTimeout(() => onClose(), 1500); // Give time to show success message
        }
      } else {
        setErrorMessage('Falha ao atualizar os dados do usuário.');
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('Erro desconhecido ao atualizar os dados do usuário.');
      }
    }
  };

  const handleSaveImage = async () => {
    if (fileInfo) {
      setLoading(true);
      try {
        const formData = new FormData();
        const fileName = `photo_user_id_${user.id}_${new Date().getTime()}.jpg`;
        formData.append('file', fileInfo, fileName);

        const response = await axiosInstance.patch(
          `/usuarios/${user.id}/imagem`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        if (response.status === 200) {
          setMessageFound('Imagem atualizada com sucesso! É necessário fazer Login novamente.');
          setTimeout(handleLogout, 2000);
        } else {
          setErrorMessage(response.data.message || 'Erro ao salvar a imagem.');
        }
      } catch (error) {
        console.error('Erro ao salvar imagem:', error);
        setErrorMessage('Erro ao enviar os dados.');
      } finally {
        setLoading(false);
      }
    } else {
      setMessageFound('Dados atualizados com sucesso! É necessário fazer Login novamente.');
      setTimeout(handleLogout, 2000);
    }
  };

  const handleLogout = () => {
    clearUserLocalStorage();
    router.push('/login');
  };

  useEffect(() => {
    if (messageFound) {
      const timer = setTimeout(() => setMessageFound(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [messageFound]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  return (
    <div className="bg-white/90 dark:bg-slate-900/90 rounded-3xl shadow-xl p-0 max-w-3xl mx-auto animate-fade-in">
      {/* Título e subtítulo claros para ambos os modos */}
      <div className="px-8 pt-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-blue-800">Editar Perfil</h2>
          <p className="text-base text-blue-800">Atualize suas informações pessoais</p>
        </div>
        {errorMessage && <ErrorAlert message={errorMessage} description="" />}
        {messageFound && <SucessAlert message={messageFound} description="" />}
      </div>

      <div className="flex flex-col gap-10 px-8 pb-8">
        {/* Coluna única: Foto e informações básicas */}
        <div className="w-full">
          <form onSubmit={handleUpdateUserData} className="space-y-8" id="editForm">
            {/* Upload de foto refinado */}
            <div className="text-center mb-6">
              <div className="relative inline-block group">
                  <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-gradient shadow-xl mx-auto transition-all duration-300 group-hover:scale-105">
                    <Image
                      src={imagePreview || urlPhotPerfil}
                      alt="Foto de perfil"
                      width={144}
                      height={144}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <label className="absolute bottom-2 right-2 bg-gradient-to-br from-blue-800 to-blue-400 text-white p-3 rounded-full shadow-lg cursor-pointer hover:scale-110 transition-all duration-200 border-2 border-white">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <Camera size={22} />
                  </label>
                </div>
              <p className="text-xs text-slate-500 mt-3">Clique na câmera para alterar a foto</p>
            </div>

            {/* Campos do formulário refinados */}
            <div className="space-y-5">
              <div className="relative">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Nome Completo</label>
                <input
                  type="text"
                  value={updatedName}
                  onChange={(e) => setUpdatedName(e.target.value)}
                  className="w-full px-5 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 dark:bg-slate-800 dark:text-white shadow-sm"
                  required
                  placeholder="Digite seu nome completo"
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Email</label>
                <input
                  type="email"
                  value={updatedEmail}
                  onChange={(e) => setUpdatedEmail(e.target.value)}
                  className="w-full px-5 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 dark:bg-slate-800 dark:text-white shadow-sm"
                  required
                  placeholder="Digite seu email"
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Telefone</label>
                <input
                  type="text"
                  value={formatPhoneNumberForInput(updatedTelefone)}
                  onChange={(e) => setUpdatedTelefone(e.target.value)}
                  className="w-full px-5 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 dark:bg-slate-800 dark:text-white shadow-sm"
                  required
                  placeholder="Digite seu telefone"
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">CPF</label>
                <input
                  type="text"
                  value={user.cpf}
                  className="w-full px-5 py-3 border border-slate-200 rounded-xl bg-slate-100 dark:bg-slate-700 dark:text-white shadow-sm"
                  readOnly
                />
                <p className="text-xs text-slate-500 mt-1">CPF não pode ser alterado</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-800 to-blue-400 hover:from-blue-900 hover:to-blue-500 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2 text-lg"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Save size={22} />
              )}
              {loading ? 'Salvando...' : 'Atualizar Dados'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FormEditUserSystemLimitedLocalStorage;