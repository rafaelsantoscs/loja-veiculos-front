'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Atualiza o state para mostrar a UI de erro
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log do erro para debug
    console.error('ErrorBoundary capturou um erro:', error, errorInfo);
    
    // Salva informações detalhadas do erro no localStorage para debug no mobile
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    try {
      localStorage.setItem('lastError', JSON.stringify(errorDetails));
      console.log('Erro salvo no localStorage:', errorDetails);
    } catch (e) {
      console.error('Erro ao salvar no localStorage:', e);
    }

    // Atualiza o state com informações do erro
    this.setState({
      error,
      errorInfo
    });

    // Chama callback personalizado se fornecido
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  clearError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      // UI de fallback customizada ou padrão
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-red-800 dark:text-red-200">
                  Oops! Algo deu errado
                </h3>
                <p className="text-red-600 dark:text-red-300 text-sm mt-1">
                  Ocorreu um erro inesperado na aplicação
                </p>
              </div>
            </div>

            <div className="mb-4">
              <details className="bg-white dark:bg-gray-800 rounded border p-3">
                <summary className="cursor-pointer font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Detalhes do Erro (Para Debug)
                </summary>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                  <div>
                    <strong>Mensagem:</strong>
                    <pre className="mt-1 bg-gray-100 dark:bg-gray-700 p-2 rounded text-xs overflow-auto">
                      {this.state.error?.message}
                    </pre>
                  </div>
                  
                  <div>
                    <strong>Stack Trace:</strong>
                    <pre className="mt-1 bg-gray-100 dark:bg-gray-700 p-2 rounded text-xs overflow-auto max-h-32">
                      {this.state.error?.stack}
                    </pre>
                  </div>

                  {this.state.errorInfo && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="mt-1 bg-gray-100 dark:bg-gray-700 p-2 rounded text-xs overflow-auto max-h-32">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}

                  <div>
                    <strong>Informações do Dispositivo:</strong>
                    <pre className="mt-1 bg-gray-100 dark:bg-gray-700 p-2 rounded text-xs overflow-auto">
                      {navigator.userAgent}
                    </pre>
                  </div>

                  <div>
                    <strong>URL:</strong>
                    <pre className="mt-1 bg-gray-100 dark:bg-gray-700 p-2 rounded text-xs overflow-auto">
                      {window.location.href}
                    </pre>
                  </div>
                </div>
              </details>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.clearError}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
              >
                Tentar Novamente
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
              >
                Recarregar Página
              </button>

              <button
                onClick={() => {
                  const errorData = localStorage.getItem('lastError');
                  if (errorData) {
                    navigator.clipboard?.writeText(errorData).then(() => {
                      alert('Dados do erro copiados para a área de transferência!');
                    }).catch(() => {
                      // Fallback para dispositivos que não suportam clipboard API
                      const textarea = document.createElement('textarea');
                      textarea.value = errorData;
                      document.body.appendChild(textarea);
                      textarea.select();
                      document.execCommand('copy');
                      document.body.removeChild(textarea);
                      alert('Dados do erro copiados para a área de transferência!');
                    });
                  }
                }}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Copiar Erro
              </button>
            </div>

            <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              <p>💡 Dica: Os dados do erro foram salvos no localStorage do navegador para análise posterior.</p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
