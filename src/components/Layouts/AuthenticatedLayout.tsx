"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SidebarGamificada from "@/components/Sidebar";
import Loader from "@/components/common/Loader";
import { getUserLocalStorage, clearUserLocalStorage } from "@/store/userLocalStorage";
import { isTokenExpired } from "@/utils/jwtUtils";

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export default function AuthenticatedLayout({
  children,
}: AuthenticatedLayoutProps) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const user = getUserLocalStorage();
        
        if (!user?.token || isTokenExpired(user.token)) {
          clearUserLocalStorage();
          setIsAuthenticated(false);
          // Use replace em vez de push para evitar história desnecessária
          router.replace('/externo');
          return;
        }
        
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Erro na verificação de autenticação:', error);
        clearUserLocalStorage();
        setIsAuthenticated(false);
        router.replace('/externo');
      } finally {
        setIsLoading(false);
      }
    };

    // Execute apenas uma vez no mount
    checkAuth();
  }, []); // Remover router das dependencies para evitar re-execução

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-950 dark:to-black">
        <div className="text-center">
          <Loader />
          <p className="mt-4 text-slate-600 dark:text-slate-300">
            Verificando autenticação...
          </p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return null; // A navigation será handled pelo useEffect
  }

  // Authenticated - render layout
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-950 dark:to-black">
      {/* Sidebar */}
      <SidebarGamificada 
        isOpen={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)} 
      />
      
      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-80' : 'ml-20'}`}>
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}