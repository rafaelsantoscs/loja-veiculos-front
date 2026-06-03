'use client';
import Loader from '@/components/common/Loader';
import SearchForUsersRegistrationByName from '@/components/Forms/SearchForUsersRegistrationByName';
import SearchSystemUserByCpf from '@/components/Forms/SearchSystemUserByCpf';
import DefaultLayout from '@/components/Layouts/DefaultLayout';
import SlideShow, { Slide } from '@/components/Slide/SlideShow';
import useAuth from '@/hooks/useAuth';
//import { RootState } from '@/store/store'; 
import { clearUserLocalStorage, getUserLocalStorage } from '@/store/userLocalStorage';
import { useRouter } from 'next/navigation';
//import { TextosInstitucionais } from '@/utils/UtilsStates';
import { useEffect, useState } from 'react';
//import { useSelector } from 'react-redux';

const UsuarioSistema = () => {

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
  const user = getUserLocalStorage() || {}; // Evita erro se for null
  const { roles = [] } = user; // Garante que roles sempre seja um array
   const [isAdmin, setIsAdmin] = useState(false);
   useEffect(() => {
     setIsAdmin(roles.includes('ROLE_ADMIN'));
   }, [roles]); // Executa sempre que 'roles' mudar

   const deniedSlides: Slide[] = [

    //{ id: 1, image:'/images/slideShow/slide01CMT.jpg', caption: TextosInstitucionais.descricaoCamutanga },
   
  ];

    return (
      <>
        {loading && (
          <div className="flex items-center justify-center h-screen bg-slate-100 dark:bg-slate-900">
            <Loader />
          </div>
        )}
        {!loading && (
          <DefaultLayout>
            <div className="mx-auto max-w-4xl px-4 py-8">
              {isAdmin ? (
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden">
                  {/* Cover Image */}
                  <div className="relative h-32 md:h-44 bg-gradient-to-br from-blue-800 to-blue-600 flex items-end">
                    <div className="absolute inset-0 bg-black bg-opacity-20 rounded-t-2xl"></div>
                    <div className="relative w-full z-10 pb-3 px-6 flex flex-col items-start">
                      <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow mb-1 uppercase tracking-wide w-full text-center">Área de Administração dos Usuários</h1>
                      <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-3 py-1 inline-block mx-auto">
                        <span className="text-white text-sm font-medium">Administração</span>
                      </div>
                    </div>
                  </div>
                  {/* Card Content */}
                  <div className="px-6 pb-8 pt-4 text-center">
                    <div className="w-full space-y-6">
                      <SearchSystemUserByCpf />
                      <SearchForUsersRegistrationByName />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col items-center justify-center min-h-[400px] py-12">
                  <div className="relative h-32 md:h-44 w-full bg-gradient-to-br from-red-500 via-pink-600 to-red-400">
                    <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                  </div>
                  <h1 className="text-2xl font-semibold text-red-500 dark:text-red-400 mb-4 mt-6">ACESSO NEGADO</h1>
                  <div className="w-[60%] h-[60%] mx-auto">
                    <SlideShow slides={deniedSlides} />
                  </div>
                </div>
              )}
            </div>
          </DefaultLayout>
        )}
      </>
    );
};

export default UsuarioSistema;
