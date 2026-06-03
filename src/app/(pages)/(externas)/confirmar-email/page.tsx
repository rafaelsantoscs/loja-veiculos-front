'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import axiosInstance from '@/services/axiosInstance';
import Link from 'next/link';

export default function ConfirmarEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [mensagem, setMensagem] = useState('');
  const [status, setStatus] = useState<'loading' | 'sucesso' | 'erro'>('loading');
  const hasFetched = useRef(false); // <- Evita chamadas duplicadas

  useEffect(() => {
    if (token && !hasFetched.current) {
      hasFetched.current = true; // Marcar como já buscado

      axiosInstance.get(`/usuarios/confirmar-email?token=${token}`)
        .then(response => {
          const msg = typeof response.data === 'string'
            ? response.data
            : response.data.mensagem;

          console.log('RESPOSTA DA CONFIRMAÇÃO', response);

          setMensagem(msg);

          if (msg.includes('sucesso') || msg.includes('confirmado anteriormente')) {
            setStatus('sucesso');
          } else {
            setStatus('erro');
          }
        })
        .catch(error => {
          const mensagemErro = typeof error.response?.data === 'string'
            ? error.response.data
            : error.response?.data?.message || 'Erro ao confirmar e-mail.';

          setMensagem(mensagemErro);
          setStatus('erro');
        });
    }
  }, [token]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-white dark:bg-gray-900 text-center">
      <h1 className="text-2xl font-bold mb-4 text-camutanga-azul dark:text-camutanga-amarelo">
        Confirmação de E-mail
      </h1>
      {status === 'loading' ? (
        <p className="text-rose-600 dark:text-yellow-500 font-bold animate-pulse-scale">{!mensagem && 'Um E-mail foi enviado para você, ...AGUARDANDO A CONFIRMAÇÃO...'}</p>
      ) : (
        <>
          <p className={`text-2xl font-bold ${status === 'sucesso' ? 'text-green-600' : 'text-rose-500'}`}>
            {mensagem}
          </p>
        </>
      )}
          <Link href="/login">
            <button
              className={`
                w-100 py-3 mt-16 rounded transition border-2 animate-pulse-scale
                bg-white text-camutanga-azul border-camutanga-azul hover:bg-camutanga-azul hover:text-white

                dark:bg-transparent dark:text-camutanga-branco dark:border-camutanga-branco 
                dark:hover:bg-camutanga-branco dark:hover:text-camutanga-azul
              `}
              
            >
              Ir para tela de login
            </button>
          </Link>
    </div>
  );
}
