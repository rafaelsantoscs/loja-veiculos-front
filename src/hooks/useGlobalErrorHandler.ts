'use client';

import { useEffect } from 'react';

interface ErrorDetails {
  message: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  stack?: string;
  timestamp: string;
  userAgent: string;
  url: string;
  type: 'javascript' | 'unhandledrejection' | 'resource';
}

const useGlobalErrorHandler = () => {
  useEffect(() => {
    // Captura erros JavaScript não tratados
    const handleError = (event: ErrorEvent) => {
      const errorDetails: ErrorDetails = {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        type: 'javascript'
      };

      console.error('Erro JavaScript global capturado:', errorDetails);
      
      // Salva no localStorage para debug
      try {
        const existingErrors = JSON.parse(localStorage.getItem('globalErrors') || '[]');
        existingErrors.push(errorDetails);
        
        // Mantém apenas os últimos 10 erros
        if (existingErrors.length > 10) {
          existingErrors.splice(0, existingErrors.length - 10);
        }
        
        localStorage.setItem('globalErrors', JSON.stringify(existingErrors));
      } catch (e) {
        console.error('Erro ao salvar erro global no localStorage:', e);
      }
    };

    // Captura promises rejeitadas não tratadas
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const errorDetails: ErrorDetails = {
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        type: 'unhandledrejection'
      };

      console.error('Promise rejection global capturada:', errorDetails);
      
      // Salva no localStorage para debug
      try {
        const existingErrors = JSON.parse(localStorage.getItem('globalErrors') || '[]');
        existingErrors.push(errorDetails);
        
        // Mantém apenas os últimos 10 erros
        if (existingErrors.length > 10) {
          existingErrors.splice(0, existingErrors.length - 10);
        }
        
        localStorage.setItem('globalErrors', JSON.stringify(existingErrors));
      } catch (e) {
        console.error('Erro ao salvar rejection global no localStorage:', e);
      }
    };

    // Adiciona os listeners
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Cleanup
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // Função para limpar erros armazenados
  const clearStoredErrors = () => {
    try {
      localStorage.removeItem('globalErrors');
      localStorage.removeItem('lastError');
      console.log('Erros armazenados limpos');
    } catch (e) {
      console.error('Erro ao limpar erros armazenados:', e);
    }
  };

  // Função para obter erros armazenados
  const getStoredErrors = () => {
    try {
      const globalErrors = JSON.parse(localStorage.getItem('globalErrors') || '[]');
      const lastError = localStorage.getItem('lastError');
      
      return {
        globalErrors,
        lastError: lastError ? JSON.parse(lastError) : null
      };
    } catch (e) {
      console.error('Erro ao obter erros armazenados:', e);
      return {
        globalErrors: [],
        lastError: null
      };
    }
  };

  return {
    clearStoredErrors,
    getStoredErrors
  };
};

export default useGlobalErrorHandler;
