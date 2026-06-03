'use client';

// import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import Image from "next/image";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { cleanRoles } from "@/utils/formatters";
import React, { useEffect, useState } from "react";
import { BASE_URL } from "@/config/config";
import FormEditUserSystemLimitedLocalStorage from "@/components/Forms/FormEditUserSystemLimitadLocalStorage";
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

  if (showModalEditCitizenRegistration && isMobile) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }

  return () => {
    document.body.style.overflow = '';
  };
}, [showModalEditCitizenRegistration]);



  return (
    <DefaultLayout>
      <div className="mx-auto max-w-242.5 text-center">
        {/* <Breadcrumb pageName="Perfil" /> */}

        <div className="overflow-hidden rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="relative z-20 h-35 md:h-65">
            <Image
              src="/images/logo/logoVISA.png"
              alt="profile cover"
              className="h-full w-full rounded-tl-sm rounded-tr-sm  object-contain"
              width={930}
              height={260}
            />
          </div>

             <div className="relative z-30 mx-auto -mt-22 h-40 w-40 rounded-full bg-white/20 p-1 backdrop-blur shadow-md">
                <Image
                  src={urlPhotPerfil}
                  width={160}
                  height={160}
                  className="rounded-full object-cover w-full h-full"
                  alt="Foto de perfil"
                />
              </div>


            <div className="mt-4 mb-10">
              <h3 className="mb-1.5 text-2xl font-semibold text-black dark:text-white">
                {user.nomeCompleto}
              </h3>
              <p className="font-medium">Perfil(s): {cleanedRoles}</p>

              <div className="mx-auto max-w-180">
                <h4 className="font-semibold text-black dark:text-white">
                  Telefone: {user.telefone}
                </h4>
                <h4 className="font-semibold text-black dark:text-white">
                  Email: {user.email}
                </h4>
              </div>
            </div>
        </div>

        <button
          className="bg-pink-500 text-white active:bg-pink-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-150 min-w-100 m-5"
          type="button"
          onClick={() => setShowModalEditCitizenRegistration(true)}
        >
          Editar informações
        </button>

        {showModalEditCitizenRegistration && (
          <>
            {/* Backdrop escuro */}

            {/* Modal */}
            <div className="fixed inset-0 z-50 top-[72px] flex items-center justify-center bg-black/50 p-4">
               <div className="bg-white dark:bg-slate-900 w-full max-w-screen-md rounded-lg shadow-lg overflow-y-auto max-h-screen text-slate-900 dark:text-slate-100">

                {/* Cabeçalho */}
                <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
                  <h3 className="text-2xl font-semibold">Editar Dados</h3>
                  <button
                    onClick={() => setShowModalEditCitizenRegistration(false)}
                    className="text-red-500 hover:text-red-700 font-bold text-xl"
                    aria-label="Fechar"
                  >
                    ×
                  </button>
                </div>

                {/* Corpo com scroll */}
                <div className="p-6 max-h-[80vh] overflow-y-auto">
                  {user.cpf ? (
                    <FormEditUserSystemLimitedLocalStorage />
                  ) : (
                    <p className="text-slate-500">Nenhum dado encontrado.</p>
                  )}
                </div>

                {/* Rodapé */}
                <div className="flex justify-end p-4 border-t border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => setShowModalEditCitizenRegistration(false)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase text-sm px-6 py-2 rounded shadow"
                  >
                    Fechar
                  </button>
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
