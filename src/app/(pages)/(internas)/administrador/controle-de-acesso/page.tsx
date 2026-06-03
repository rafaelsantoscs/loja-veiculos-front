'use client';
import SearchForUsersRegistrationByNamePorRole from '@/components/Forms/SearchForUsersRegistrationByNamePorRole';
import DefaultLayout from '@/components/Layouts/DefaultLayout';
import useAuthLocalStorage from '@/hooks/useAuthLocalStorage';
import { clearUserLocalStorage } from '@/store/userLocalStorage';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const ControleDeAcesso = () => {
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
  const allowedRoles = [
  'ROLE_USUARIO',
  'ROLE_ASSISTENTE',
  'ROLE_MOTORISTA',
  'ROLE_ADMINISTRADOR',
  ];

    return (
      <DefaultLayout>
        <div className="min-h-screen bg-slate-100 dark:bg-transparent flex justify-center">
            <div className="mx-auto w-full max-w-screen-2xl px-4">
              <h1 className="text-2xl my-5 text-samu-azul dark:text-samu-branco font-semibold uppercase text-left sm:text-center">
                Área de Administração dos Usuários do Sistema
              </h1>
              <SearchForUsersRegistrationByNamePorRole allowedRoles={allowedRoles} />
            </div>
        </div>
    </DefaultLayout>
    );
};

export default ControleDeAcesso;
