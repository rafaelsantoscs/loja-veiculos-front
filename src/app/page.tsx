'use client';

import Loader from '@/components/common/Loader';
import ECommerce from '@/components/Dashboard/E-commerce';
import DefaultLayout from '@/components/Layouts/DefaultLayout';
import useAuth from '@/hooks/useAuth';
import { clearUserLocalStorage } from '@/store/userLocalStorage';
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from 'react';

const Home = () => {

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

  return (
    <>
    {loading && (
      <div className="flex items-center justify-center h-screen"> 
        <div className="flex items-center justify-center h-screen">
          <Loader />
        </div>
      </div>
      )}
      {!loading && (
        <DefaultLayout>
          <ECommerce />
        </DefaultLayout>
      )}  
    </>
  );
};

export default Home;
