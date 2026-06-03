'use client';

import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { cleanRoles } from "@/utils/formatters";
import React, { useEffect, useState } from "react";
import { BASE_URL } from "@/config/config";
import FormEditUserSystemLimitedLocalStorage from "@/components/Forms/FormEditUserSystemLimitadLocalStorage";
import AlterarSenhaForm from "@/components/Forms/AlterarSenhaForm";
import { getUserLocalStorage } from "@/store/userLocalStorage";

const ProfileLocalStorage = () => {
  const [user, setUser] = useState({
    roles: [] as string[],
    imagemUrl: "",
    nomeCompleto: "",
    email: "",
    telefone: "",
    cpf: "",
  });

  const [showModalEditCitizenRegistration, setShowModalEditCitizenRegistration] = useState(false);
  const [showModalChangePassword, setShowModalChangePassword] = useState(false);

  useEffect(() => {
    const storedUser = getUserLocalStorage();
    if (storedUser) {
      setUser({
        roles: storedUser.roles ?? [],
        imagemUrl: storedUser.imagemUrl ?? "",
        nomeCompleto: storedUser.nomeCompleto ?? "",
        email: storedUser.email ?? "",
        telefone: storedUser.telefone ?? "",
        cpf: storedUser.cpf ?? "",
      });
    }
  }, []);

  const cleanedRoles = cleanRoles(user.roles ?? []);

  // Evita erro de imagem quebrada
  const urlPhotPerfil = user.imagemUrl
    ? BASE_URL + user.imagemUrl
    : "/images/profile/bg_default.png";

  useEffect(() => {
    const isMobile = window.innerWidth < 1024;
    if ((showModalEditCitizenRegistration || showModalChangePassword) && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showModalEditCitizenRegistration, showModalChangePassword]);

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Cover Image */}
          <div className="relative h-48 md:h-64 bg-gradient-to-br from-blue-800 via-purple-600 to-blue-400">
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
            <div className="absolute top-4 left-4">
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-3 py-1">
                <span className="text-white text-sm font-medium">Perfil</span>
              </div>
            </div>
          </div>
          
          {/* Profile Image */}
          <div className="relative -mt-20 flex justify-center">
            <div className="rounded-full p-2 backdrop-blur-md bg-white/30 border-2 border-white/30">
              <img
                src={urlPhotPerfil}
                width={160}
                height={160}
                className="rounded-full object-cover w-40 h-40 shadow-lg"
                alt="Foto de perfil"
                onError={(e) => {
                  e.currentTarget.src = "/images/profile/bg_default.png";
                }}
              />
            </div>
          </div>
          
          {/* User Info */}
          <div className="px-6 pb-8 text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mt-4 mb-2">
              {user.nomeCompleto}
            </h1>
            
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200 mb-6">
              {cleanedRoles}
            </div>
            
            {/* Contact Info Grid */}
            <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4">
                <div className="flex items-center justify-center mb-2">
                  <svg className="w-5 h-5 text-pink-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Email</span>
                </div>
                <p className="text-slate-900 dark:text-white font-semibold">{user.email}</p>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4">
                <div className="flex items-center justify-center mb-2">
                  <svg className="w-5 h-5 text-pink-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Telefone</span>
                </div>
                <p className="text-slate-900 dark:text-white font-semibold">{user.telefone}</p>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4 md:col-span-2">
                <div className="flex items-center justify-center mb-2">
                  <svg className="w-5 h-5 text-pink-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-4 0v1m4-1v1"></path>
                  </svg>
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">CPF</span>
                </div>
                <p className="text-slate-900 dark:text-white font-semibold">{user.cpf}</p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 justify-center mt-8">
              <button 
                onClick={() => setShowModalEditCitizenRegistration(true)}
                className="bg-gradient-to-r from-blue-800 to-blue-400 hover:from-blue-900 hover:to-blue-500 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800"
              >
                <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
                Editar Informações
              </button>
              <button
                onClick={() => setShowModalChangePassword(true)}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800"
              >
                <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11V17m0 0l-2-2m2 2l2-2m-6-6a9 9 0 1118 0 9 9 0 01-18 0z" />
                </svg>
                Alterar Senha
              </button>
            </div>
          </div>
        </div>

        {showModalEditCitizenRegistration && (
          <>
            {/* Backdrop do modal de edição de perfil */}
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-lg animate-fade-in" onClick={() => setShowModalEditCitizenRegistration(false)}></div>
            {/* Modal de edição de perfil */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
                        Editar Perfil
                      </h2>
                      <p className="text-sm text-white mt-1">
                        Atualize suas informações pessoais
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowModalEditCitizenRegistration(false)}
                    className="group p-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-200 hover:scale-110 shadow-md"
                    aria-label="Fechar"
                  >
                    <svg className="w-6 h-6 text-slate-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
                <div className="p-8 max-h-[70vh] overflow-y-auto bg-white/80 dark:bg-slate-900/80 rounded-b-3xl">
                  {user.cpf ? (
                    <FormEditUserSystemLimitedLocalStorage onClose={() => setShowModalEditCitizenRegistration(false)} />
                  ) : (
                    <p className="text-slate-500 text-center py-8">Nenhum dado encontrado.</p>
                  )}
                </div>
                <div className="bg-gradient-to-r from-blue-900 to-blue-400 dark:from-slate-800 dark:to-slate-700 px-8 py-5 border-t border-blue-200 dark:border-slate-700 rounded-b-3xl flex gap-4 justify-end">
                  <button 
                    onClick={() => setShowModalEditCitizenRegistration(false)}
                    className="px-7 py-3 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-500 shadow-sm"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    form="editForm"
                    className="px-7 py-3 text-white bg-gradient-to-r from-blue-800 to-blue-400 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-800 shadow-lg hover:scale-105 transition-all duration-200"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Novo modal para alteração de senha */}
        {showModalChangePassword && (
          <>
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-lg animate-fade-in" onClick={() => setShowModalChangePassword(false)}></div>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="max-w-md w-full rounded-3xl shadow-2xl border-2 border-transparent bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900/80 dark:to-slate-800/90 backdrop-blur-xl relative animate-modal-pop">
                <div className="absolute inset-0 rounded-3xl pointer-events-none border-4 border-transparent" style={{ borderImage: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%) 1' }}></div>
                <div className="relative bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 p-7 border-b border-blue-100 dark:border-slate-700 flex items-center justify-between rounded-t-3xl">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg animate-glow">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11V17m0 0l-2-2m2 2l2-2m-6-6a9 9 0 1118 0 9 9 0 01-18 0z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">
                        Alterar Senha
                      </h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Mantenha sua conta segura
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowModalChangePassword(false)}
                    className="group p-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-200 hover:scale-110 shadow-md"
                    aria-label="Fechar"
                  >
                    <svg className="w-6 h-6 text-slate-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
                <div className="p-8 max-h-[70vh] overflow-y-auto bg-white/80 dark:bg-slate-900/80 rounded-b-3xl">
                  <AlterarSenhaForm />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DefaultLayout>
  );
};

export default ProfileLocalStorage;