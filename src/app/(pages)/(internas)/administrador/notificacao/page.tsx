'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import 'react-multi-date-picker/styles/colors/red.css';
import DefaultLayout from '@/components/Layouts/DefaultLayout';
import useAuthLocalStorage from '@/hooks/useAuthLocalStorage';
import { clearUserLocalStorage } from '@/store/userLocalStorage';
import NotificacaoComponent from '@/components/Forms/NotificacaoComponent';

const PadroesChecklistPage = () => {
  const { isAuthenticated, isLoading } = useAuthLocalStorage(); 
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        console.log('Usuário não autenticado. Redirecionando para login...');
        clearUserLocalStorage();
        router.push('/externo');
      } else {
        console.log('Usuário autenticado. Carregando página...');
        setLoading(false);
      }
    }
  }, [isAuthenticated, isLoading, router]);
  

  if (isLoading || loading) {
    return <div>Carregando...</div>;
  }

  return (
    <DefaultLayout>
      <h1 className='text-2xl my-5 font-semibold mb-6 items-center text-center'>Notificações</h1>
      <NotificacaoComponent/>
      
    </DefaultLayout>
  );
};

export default PadroesChecklistPage;