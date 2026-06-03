// src/app/(internas)/samu/colaboradores/page.tsx
"use client";
import FormCadastroColaborador from "@/components/Forms/FormCadastroColaborador";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import useAuthLocalStorage from "@/hooks/useAuthLocalStorage";
import { clearUserLocalStorage } from "@/store/userLocalStorage";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CadastroColaboradoresSamu() {
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
    <div className="p-6">
      <FormCadastroColaborador />
    </div>
    </DefaultLayout>
  );
}
