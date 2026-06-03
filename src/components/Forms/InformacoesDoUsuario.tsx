'use client';

import { BASE_URL } from '@/config/config';
import Image from 'next/image';
import React from 'react';
import FormEditUserSystem from './FormEditUserSystem';

interface User {
  id: number | null;
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  imagemUrl?: string;
  username: string;
  roles?: string[];
}

interface InformacoesDoUsuarioProps {
  userData: User;
  onUpdate: (updatedUser: User | null) => void;
}

const InformacoesDoUsuario: React.FC<InformacoesDoUsuarioProps> = ({ userData, onUpdate  }) => {

  const urlPhotPerfil = BASE_URL + userData.imagemUrl;
  return (
    <div className="p-4 border border-gray-200 rounded-md">
      <h2 className="text-lg font-semibold mb-4">Informações do Usuário</h2>
      <p><strong>Nome:</strong> {userData.nome}</p>
      <p><strong>CPF:</strong> {userData.cpf}</p>
      <p><strong>Telefone:</strong> {userData.telefone}</p>
      <p><strong>Email:</strong> {userData.email}</p>
      {userData.imagemUrl && (
         <Image
         width={120}
         height={120}
         
         src={urlPhotPerfil ? urlPhotPerfil : "/images/user/user-00.png"}
         style={{
         
         }}
         alt={userData.nome || "User"} // Usa o nome do usuário no alt
         className="object-cover "
       />
      )}

              <FormEditUserSystem userData={userData} onUpdate={onUpdate} />     
    </div>
  );
};

export default InformacoesDoUsuario;
