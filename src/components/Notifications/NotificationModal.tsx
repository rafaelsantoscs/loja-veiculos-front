"use client";
import React, { useState, useEffect } from 'react';
import { getUserLocalStorage } from "@/store/userLocalStorage";
import { toast } from "react-toastify";
import axiosInstance from "@/services/axiosInstance";

type Notificacao = {
  id: number;
  mensagem: string;
  criadoPor: string;
  enviadoPara: string;
  nomeCompleto: string;
  recebidoPor: string | null;
  momentoCriacao: string;
  momentoRecebido: string | null;
};

interface NotificationModalProps {
  /** Se deve verificar automaticamente as notificações ao montar o componente */
  autoFetch?: boolean;
  /** Função callback chamada quando há notificações pendentes */
  onNotificationsFound?: (count: number) => void;
  /** Função callback chamada quando todas as notificações são marcadas como recebidas */
  onNotificationsCleared?: () => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({
  autoFetch = true,
  onNotificationsFound,
  onNotificationsCleared
}) => {
  const [token, setToken] = useState("");
  const [username, setUsername] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [notificacoesPendentes, setNotificacoesPendentes] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(false);

  // Função para formatar data e hora
  const formatarDataHora = (dataString: string) => {
    try {
      if (!dataString) return '-';
      
      // Se a string já está no formato brasileiro (dd/MM/yyyy HH:mm), retorna ela mesma
      const formatoBrasileiroRegex = /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/;
      if (formatoBrasileiroRegex.test(dataString)) {
        return dataString;
      }
      
      // Se for uma string ISO ou outro formato, converte
      const date = new Date(dataString);
      if (isNaN(date.getTime())) {
        console.warn('Data inválida recebida:', dataString);
        return dataString;
      }
      
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Erro ao formatar data:', error, dataString);
      return dataString || '-';
    }
  };

  useEffect(() => {
    const user = getUserLocalStorage();
    if (user?.token && user?.username) {
      setToken(user.token);
      setUsername(user.username);
    }
  }, []);

  useEffect(() => {
    if (autoFetch && token && username) {
      fetchNotificacoesDoUsuario();
    }
  }, [token, username, autoFetch]);

  const fetchNotificacoesDoUsuario = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/notificacoes/pendentes/destinatario/${username}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (Array.isArray(response.data)) {
        setNotificacoesPendentes(response.data);
        
        if (response.data.length > 0) {
          setShowModal(true);
          onNotificationsFound?.(response.data.length);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      toast.error('Erro ao carregar notificações');
    } finally {
      setLoading(false);
    }
  };

  const marcarComoRecebida = async (ids: number[]) => {
    try {
      setLoading(true);

      // Formatação correta da data e hora para o Brasil
      const now = new Date();
      const formattedDate = now.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
      const formattedTime = now.toLocaleTimeString('pt-BR', { 
        timeZone: 'America/Sao_Paulo', 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
      });
      const momentoRecebido = `${formattedDate} ${formattedTime}`;
      
      const payload = { momentoRecebido: momentoRecebido };
      console.log('Payload sendo enviado:', payload);
      
      // Marca todas as notificações como recebidas
      await Promise.all(
        ids.map(id => 
          axiosInstance.post(`/api/notificacoes/${id}/receber`, payload, {
            headers: { Authorization: `Bearer ${token}` }
          })
        )
      );
      toast.success("Notificações marcadas como recebidas!");
      setShowModal(false);
      setNotificacoesPendentes([]);
      onNotificationsCleared?.();
    } catch (error) {
      toast.error("Erro ao marcar notificações");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    if (notificacoesPendentes.length > 0) {
      const ids = notificacoesPendentes.map(n => n.id);
      marcarComoRecebida(ids);
    }
  };

  if (!showModal || notificacoesPendentes.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-boxdark rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
              Notificações Pendentes ({notificacoesPendentes.length})
            </h3>
          </div>
          
          <div className="space-y-4">
            {notificacoesPendentes.map((notificacao) => (
              <div key={notificacao.id} className="border-b pb-4 last:border-b-0">
                <div className="mb-2">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    De: {notificacao.criadoPor}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Para: {notificacao.nomeCompleto}
                  </p>
                   
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    {formatarDataHora(notificacao.momentoCriacao)}
                  </p>
                </div>
                
                <p className="text-rose-700 dark:text-rose-300 text-xl font-semibold mb-2">
                  {notificacao.mensagem}
                </p>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end mt-6">
            <button
              onClick={handleCloseModal}
              className="min-w-40 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              disabled={loading}
            >
              {loading ? 'Processando...' : 'OK'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
