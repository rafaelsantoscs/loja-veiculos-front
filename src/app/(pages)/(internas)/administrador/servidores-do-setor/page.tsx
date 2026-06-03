'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import 'react-multi-date-picker/styles/colors/red.css';
import DefaultLayout from '@/components/Layouts/DefaultLayout';
import { clearUserLocalStorage } from '@/store/userLocalStorage';

const ServidoresDoSetorPage = () => {
 
  const { isAuthenticated } = useAuth(); // Obtém autenticação e usuário
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      clearUserLocalStorage();
      router.push('/externo');
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, router]);
    
  if (loading) {
    return <div>Carregando...</div>; // Mensagem de carregamento ou spinner
  }

  return (
    <DefaultLayout>
      <h1 className='text-2xl my-5 font-semibold mb-6 items-center text-center'>Funcionários</h1>
      <div className="p-4 text-center text-gray-500">
        Componente temporariamente indisponível
      </div>
    </DefaultLayout>
  );
};

export default ServidoresDoSetorPage;
