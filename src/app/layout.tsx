
"use client";
import "jsvectormap/dist/jsvectormap.css";
import "flatpickr/dist/flatpickr.min.css";
import "@/css/satoshi.css";
import "@/css/style.css";
import React, { useEffect, useState } from "react";
import Loader from "@/components/common/Loader";
import { ThemeProvider } from "next-themes";
import { ToastContainer } from 'react-toastify'
import GlobalSync from "@/components/GlobalSync";
//import { Navbar } from "@/components/InitialScreen/Navbar";
//import { Footer } from "@/components/InitialScreen/Footer";
//import { PopupWidget } from "@/components/InitialScreen/PopupWidget";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  //const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);

    // const pathname = usePathname();

    useEffect(() => {
      setTimeout(() => setLoading(false), 1000);
      
      // Verificação automática de conexão para redirecionamento com delay maior
      const verificarConexaoERedirecionamento = () => {
        // Só faz redirecionamento se estiver na página inicial
        if (typeof window !== 'undefined' && window.location.pathname === '/') {
          // Múltiplas verificações para garantir que realmente não há conexão
          let verificacoesOffline = 0;
          const verificarMultiplasVezes = () => {
            if (!navigator.onLine) {
              verificacoesOffline++;
              if (verificacoesOffline >= 3) {
                console.log('📵 Sem internet confirmada após múltiplas verificações - redirecionando para abastecimento offline');
                window.location.href = '/abastecimento-offline';
              } else {
                // Verifica novamente após 2 segundos
                setTimeout(verificarMultiplasVezes, 2000);
              }
            } else {
              verificacoesOffline = 0;
            }
          };
          verificarMultiplasVezes();
        }
      };

      // Verifica conexão após carregar com delay muito maior (10 segundos)
      setTimeout(verificarConexaoERedirecionamento, 10000);
      
      // Monitora mudanças de conexão com debounce
      let timeoutOffline: NodeJS.Timeout;
      const handleOffline = () => {
        clearTimeout(timeoutOffline);
        timeoutOffline = setTimeout(() => {
          console.log('📵 Conexão perdida - redirecionando para abastecimento offline');
          if (window.location.pathname === '/') {
            window.location.href = '/abastecimento-offline';
          }
        }, 5000); // Delay de 5 segundos antes de redirecionar
      };

      const handleOnline = () => {
        clearTimeout(timeoutOffline); // Cancela redirecionamento se conexão voltar
        console.log('🌐 Conexão restaurada');
        // Não redireciona automaticamente de volta, deixa o usuário escolher
      };

      window.addEventListener('offline', handleOffline);
      window.addEventListener('online', handleOnline);

      // Cleanup
      const cleanupConnection = () => {
        clearTimeout(timeoutOffline); // Limpa timeout pendente
        window.removeEventListener('offline', handleOffline);
        window.removeEventListener('online', handleOnline);
      };
      
      // Registrar Service Worker para PWA
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('SW registered: ', registration);
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
          });
      }

      // Retorna a função de cleanup
      return cleanupConnection;
    }, []); // ✅ ADICIONADO ARRAY DE DEPENDÊNCIAS VAZIO
  return (
    // <html lang="en">
    //   <body
    //     className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    //   >
    //     <ReduxProvider>
    //         {children}
    //       </ReduxProvider> 
    
    //   </body>
    // </html>
    // <html lang="en" suppressHydrationWarning>
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192x192.png" />
        <meta name="theme-color" content="#ea580c" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Abastecimento Vitória" />
        <meta name="description" content="Sistema de registro de abastecimento com funcionalidade offline" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#ea580c" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body >
        <ThemeProvider attribute="class">
        <div className="dark:bg-boxdark-2 dark:text-bodydark ">
        {/* Componente de sincronização automática global */}
        <GlobalSync />
        {/* Componentes de teste mobile removidos - sistema limpo agora */}
        {/* <Navbar /> */}
          {loading ? <Loader /> : children}
          <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="colored"
            />
        </div>
          {/* <Footer />
          <PopupWidget /> */}
        </ThemeProvider>
      </body>
    </html>
  );
}
