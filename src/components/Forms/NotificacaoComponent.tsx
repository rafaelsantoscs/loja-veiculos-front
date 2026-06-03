import { useState, useEffect } from 'react';
import { getUserLocalStorage } from '@/store/userLocalStorage';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import axiosInstance from '@/services/axiosInstance';
import AdvancedPushNotificationManager from '@/components/AdvancedPushNotificationManager';

type Notificacao = {
  id: number;
  mensagem: string;
  criadoPor: string;
  enviadoPara: string;
  nomeCompleto: string;
  momentoCriacao: string;
  momentoRecebido: string | null;
};

type User = {
  id: number | null;
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  username: string;
  imagemUrl?: string;
  roles?: string[];
}

type PaginatedResponse<T> = {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  first: boolean;
};

export default function NotificacaoComponent() {
  const [token, setToken] = useState("");
  const [nomeCompleto, setNomeCompleto] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Notificacao | null>(null);
  const [notificacoesRecebidas, setNotificacoesRecebidas] = useState<PaginatedResponse<Notificacao>>({
    content: [],
    pageable: { pageNumber: 0, pageSize: 3 },
    totalPages: 0,
    totalElements: 0,
    last: false,
    first: true
  });
  const [notificacoesAReceber, setNotificacoesAReceber] = useState<PaginatedResponse<Notificacao>>({
    content: [],
    pageable: { pageNumber: 0, pageSize: 3 },
    totalPages: 0,
    totalElements: 0,
    last: false,
    first: true
  });
  const [currentPageAReceber, setCurrentPageAReceber] = useState(0);
  const [currentPageRecebidas, setCurrentPageRecebidas] = useState(0);

  // Form states
  const [formData, setFormData] = useState({
    mensagem: "",
    destinatario: "",
    nomeCompleto: "",
    tipoEnvio: "individual", // individual, multiplos, role, todos
    destinatariosSelecionados: [] as User[],
    rolesSelecionadas: [] as string[],
    enviarPush: false // Nova opção para notificações push
  });
  const [showUserSuggestions, setShowUserSuggestions] = useState(false);

  useEffect(() => {
    const user = getUserLocalStorage();
    if (user?.token && user?.nomeCompleto) {
      setToken(user.token);
      setNomeCompleto(user.nomeCompleto);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchNotificacoesAReceber(currentPageAReceber);
      fetchUsers();
      fetchNotificacoesRecebidas(currentPageRecebidas);
    }
  }, [token, currentPageAReceber, currentPageRecebidas]);

  const fetchNotificacoesAReceber = async (page: number) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/notificacoes/a-receber?page=${page}&size=3`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotificacoesAReceber(response.data);
    } catch (error) {
      toast.error("Erro ao carregar notificações");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotificacoesRecebidas = async (page: number) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/notificacoes/recebidas?page=${page}&size=3`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotificacoesRecebidas(response.data);
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      toast.error('Erro ao carregar notificações recebidas');
    } finally {
      setLoading(false);
    }
  };

    const handlePageRecebidasChange = (newPage: number) => {
      setCurrentPageRecebidas(newPage);
    };

    const handlePageAReceberChange = (newPage: number) => {
      setCurrentPageAReceber(newPage);
    };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const rolesToFetch = [
        'ROLE_ADMIN',
        'ROLE_USUARIO',
        'ROLE_ASSISTENTE',
        'ROLE_MOTORISTA',
        'ROLE_ADMINISTRADOR',
      ];

      const usersMap = new Map<number, User>();
      
      for (const role of rolesToFetch) {
        const response = await axiosInstance.get(`/usuarios/roles?roles=${role}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const usersData = Array.isArray(response.data) ? response.data : [];
        
        usersData.forEach((user: User) => {
          if (user.id !== null) {
            if (usersMap.has(user.id)) {
              const existingUser = usersMap.get(user.id)!;
              usersMap.set(user.id, {
                ...existingUser,
                roles: [...(existingUser.roles || []), role]
              });
            } else {
              usersMap.set(user.id, {
                ...user,
                roles: [role]
              });
            }
          }
        });
      }
      
      const uniqueUsers = Array.from(usersMap.values());
      setUsers(uniqueUsers);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Função para enviar notificação push
  const enviarNotificacaoPush = async (mensagem: string, destinatarios: string[]) => {
    if (!formData.enviarPush || destinatarios.length === 0) return;

    try {
      const pushData = {
        title: `Frota VSA - ${nomeCompleto}`,
        body: mensagem,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png',
        data: {
          url: '/',
          timestamp: Date.now()
        }
      };

      // Enviar para o backend que vai distribuir as notificações push
      await axiosInstance.post('/api/push-notifications/send', {
        notification: pushData,
        usernames: destinatarios
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Notificações push enviadas com sucesso');
    } catch (error) {
      console.error('Erro ao enviar notificações push:', error);
      // Não exibir erro para o usuário, pois é uma funcionalidade adicional
    }
  };

  const handleSubmit = async () => {
    if (!formData.mensagem) {
      toast.warning("Preencha a mensagem");
      return;
    }

    // Validação baseada no tipo de envio
    if (formData.tipoEnvio === "individual" && !formData.destinatario) {
      toast.warning("Selecione um destinatário");
      return;
    }
    
    if (formData.tipoEnvio === "multiplos" && formData.destinatariosSelecionados.length === 0) {
      toast.warning("Selecione pelo menos um destinatário");
      return;
    }
    
    if (formData.tipoEnvio === "role" && formData.rolesSelecionadas.length === 0) {
      toast.warning("Selecione pelo menos uma função");
      return;
    }

    // Formatação correta da data e hora para o Brasil
    const now = new Date();
    const formattedDate = now.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    const formattedTime = now.toLocaleTimeString('pt-BR', { 
      timeZone: 'America/Sao_Paulo', 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
    const momentoCriacao = `${formattedDate} ${formattedTime}`;

    try {
      setLoading(true);

      // Preparar dados baseados no tipo de envio
      const notificacoes: Array<{
        mensagem: string;
        enviadoPara: string;
        nomeCompleto: string;
        criadoPor: string;
        momentoCriacao: string;
      }> = [];

      if (formData.tipoEnvio === "individual") {
        notificacoes.push({
          mensagem: formData.mensagem,
          enviadoPara: formData.destinatario,
          nomeCompleto: formData.nomeCompleto,
          criadoPor: nomeCompleto,
          momentoCriacao: momentoCriacao
        });
      } 
      else if (formData.tipoEnvio === "multiplos") {
        for (const user of formData.destinatariosSelecionados) {
          notificacoes.push({
            mensagem: formData.mensagem,
            enviadoPara: user.username,
            nomeCompleto: user.nome,
            criadoPor: nomeCompleto,
            momentoCriacao: momentoCriacao
          });
        }
      } 
      else if (formData.tipoEnvio === "role") {
        // Buscar usuários por roles selecionadas
        for (const role of formData.rolesSelecionadas) {
          const usuariosDaRole = users.filter(user => user.roles?.includes(role));
          for (const user of usuariosDaRole) {
            // Evitar duplicatas se o usuário já foi adicionado por outra role
            if (!notificacoes.find(n => n.enviadoPara === user.username)) {
              notificacoes.push({
                mensagem: formData.mensagem,
                enviadoPara: user.username,
                nomeCompleto: user.nome,
                criadoPor: nomeCompleto,
                momentoCriacao: momentoCriacao
              });
            }
          }
        }
      } 
      else if (formData.tipoEnvio === "todos") {
        for (const user of users) {
          notificacoes.push({
            mensagem: formData.mensagem,
            enviadoPara: user.username,
            nomeCompleto: user.nome,
            criadoPor: nomeCompleto,
            momentoCriacao: momentoCriacao
          });
        }
      }

      // Enviar todas as notificações
      if (editando) {
        // Para edição, mantém o comportamento original
        await axiosInstance.put(`/api/notificacoes/${editando.id}`, notificacoes[0], {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Notificação atualizada!");
      } else {
        // Para criação, envia todas as notificações
        await Promise.all(
          notificacoes.map(notificacao =>
            axiosInstance.post("/api/notificacoes", notificacao, {
              headers: { Authorization: `Bearer ${token}` }
            })
          )
        );
        
        const mensagemSucesso = notificacoes.length === 1 
          ? "Notificação enviada!" 
          : `${notificacoes.length} notificações enviadas!`;
        toast.success(mensagemSucesso);
        
        // Enviar notificações push se a opção estiver ativada
        if (formData.enviarPush) {
          const destinatarios = notificacoes.map(n => n.enviadoPara);
          await enviarNotificacaoPush(formData.mensagem, destinatarios);
        }
      }

      fetchNotificacoesAReceber(currentPageAReceber);
      setModalOpen(false);
      resetForm();
    } catch (error) {
      toast.error("Erro ao salvar notificação");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta notificação?")) return;
    
    try {
      setLoading(true);
      await axiosInstance.delete(`/api/notificacoes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Notificação excluída!");
      fetchNotificacoesAReceber(currentPageAReceber);
    } catch (error) {
      toast.error("Erro ao excluir notificação");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecebida = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta notificação recebida?")) return;
    
    try {
      setLoading(true);
      await axiosInstance.delete(`/api/notificacoes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Notificação excluída!");
      fetchNotificacoesRecebidas(currentPageRecebidas);
    } catch (error) {
      toast.error("Erro ao excluir notificação");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const marcarComoRecebida = async (id: number) => {
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
      
      const response = await axiosInstance.post(`/api/notificacoes/${id}/receber`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Resposta do backend:', response.data);
      toast.success("Notificação marcada como recebida!");
      fetchNotificacoesAReceber(currentPageAReceber);
      fetchNotificacoesRecebidas(currentPageRecebidas);
    } catch (error) {
      toast.error("Erro ao marcar notificação");
      console.error('Erro completo:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      mensagem: "",
      destinatario: "",
      nomeCompleto: "",
      tipoEnvio: "individual",
      destinatariosSelecionados: [],
      rolesSelecionadas: [],
      enviarPush: false
    });
    setEditando(null);
  };

  const openEditModal = (notificacao: Notificacao) => {
    setFormData({
      mensagem: notificacao.mensagem,
      destinatario: notificacao.enviadoPara,
      nomeCompleto: notificacao.nomeCompleto,
      tipoEnvio: "individual",
      destinatariosSelecionados: [],
      rolesSelecionadas: [],
      enviarPush: false
    });
    setEditando(notificacao);
    setModalOpen(true);
  };

  const selectUser = (user: User) => {
    setFormData({
      ...formData,
      destinatario: user.username,
      nomeCompleto: user.nome
    });
    setShowUserSuggestions(false);
  };

  const adicionarDestinatario = (user: User) => {
    if (!formData.destinatariosSelecionados.find(u => u.id === user.id)) {
      setFormData({
        ...formData,
        destinatario: "",
        destinatariosSelecionados: [...formData.destinatariosSelecionados, user]
      });
    }
    setShowUserSuggestions(false);
  };

  const removerDestinatario = (userId: number) => {
    setFormData({
      ...formData,
      destinatariosSelecionados: formData.destinatariosSelecionados.filter(u => u.id !== userId)
    });
  };

  const toggleRole = (role: string) => {
    const rolesAtivas = formData.rolesSelecionadas.includes(role)
      ? formData.rolesSelecionadas.filter(r => r !== role)
      : [...formData.rolesSelecionadas, role];
    
    setFormData({
      ...formData,
      rolesSelecionadas: rolesAtivas
    });
  };

  const rolesDisponiveis = [
    { value: 'ROLE_ADMIN', label: 'Administrador' },
    { value: 'ROLE_ASSISTENTE', label: 'Assistente' },
    { value: 'ROLE_CONDUTOR', label: 'Condutor' },
    { value: 'ROLE_ENFERMEIRO', label: 'Enfermeiro' },
    { value: 'ROLE_TECNICO', label: 'Técnico' },
    { value: 'ROLE_ADMINISTRADOR', label: 'Administrador Sistema' },
  ];

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
        return dataString; // Retorna a string original se não conseguir converter
      }
      
      return format(date, "dd/MM/yyyy HH:mm", { locale: ptBR });
    } catch (error) {
      console.error('Erro ao formatar data:', error, dataString);
      return dataString || '-'; // Retorna a string original em caso de erro
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Notificações</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Nova Notificação
        </button>
      </div>

      {/* Sistema de Push Notifications - APENAS para Registrar Dispositivo e Enviar para Outros */}
      <div className="mb-8">
        <AdvancedPushNotificationManager />
      </div>

      {/* Lista de Notificações Pendentes com Paginação */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300">
            Pendentes
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageAReceberChange(currentPageAReceber - 1)}
              disabled={notificacoesAReceber.first || loading}
              className="px-3 py-1 rounded bg-blue-200 dark:bg-blue-700 disabled:opacity-50"
            >
              Anterior
            </button>
            <span className="text-sm text-slate-600 dark:text-slate-300">
              Página {currentPageAReceber + 1} de {notificacoesAReceber.totalPages}
            </span>
            <button
              onClick={() => handlePageAReceberChange(currentPageAReceber + 1)}
              disabled={notificacoesAReceber.last || loading}
              className="px-3 py-1 rounded bg-blue-200 dark:bg-blue-700 disabled:opacity-50"
            >
              Próxima
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {notificacoesAReceber.content.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400">Nenhuma notificação pendente</p>
          ) : (
            notificacoesAReceber.content.map(notificacao => (
              <div 
                key={notificacao.id}
                className="border rounded-lg p-4 bg-yellow-100 dark:bg-yellow-700 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">Nº {notificacao.id}</p>
                    <p className="font-medium">{notificacao.mensagem}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      De: {notificacao.criadoPor} • Para: {notificacao.enviadoPara} • {formatarDataHora(notificacao.momentoCriacao)}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => marcarComoRecebida(notificacao.id)}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200"
                    >
                      Marcar Recebida
                    </button>
                    <button
                      onClick={() => openEditModal(notificacao)}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(notificacao.id)}
                      className="px-3 py-1 bg-rose-100 text-rose-700 rounded text-sm hover:bg-rose-200"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Contador de itens e navegação inferior */}
        <div className="flex justify-between items-center mt-4">
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Mostrando {notificacoesAReceber.content.length} de {notificacoesAReceber.totalElements} notificações
          </span>
          <div className="flex space-x-2">
            {Array.from({ length: Math.min(5, notificacoesAReceber.totalPages) }, (_, i) => {
              let pageNum;
              if (notificacoesAReceber.totalPages <= 5) {
                pageNum = i;
              } else if (currentPageAReceber <= 2) {
                pageNum = i;
              } else if (currentPageAReceber >= notificacoesAReceber.totalPages - 3) {
                pageNum = notificacoesAReceber.totalPages - 5 + i;
              } else {
                pageNum = currentPageAReceber - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageAReceberChange(pageNum)}
                  className={`px-3 py-1 rounded ${
                    currentPageAReceber === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-700'
                  }`}
                >
                  {pageNum + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      

      {/* Lista de Notificações Recebidas com Paginação */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300">
            Recebidas
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageRecebidasChange(currentPageRecebidas - 1)}
              disabled={notificacoesRecebidas.first || loading}
              className="px-3 py-1 rounded bg-blue-200 dark:bg-blue-700 disabled:opacity-50"
            >
              Anterior
            </button>
            <span className="text-sm text-slate-600 dark:text-slate-300">
              Página {currentPageRecebidas + 1} de {notificacoesRecebidas.totalPages}
            </span>
            <button
              onClick={() => handlePageRecebidasChange(currentPageRecebidas + 1)}
              disabled={notificacoesRecebidas.last || loading}
              className="px-3 py-1 rounded bg-blue-200 dark:bg-blue-700 disabled:opacity-50"
            >
              Próxima
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {notificacoesRecebidas.content.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400">Nenhuma notificação recebida</p>
          ) : (
            notificacoesRecebidas.content.map(notificacao => (
              <div 
                key={notificacao.id}
                className="border rounded-lg p-4 bg-green-50 dark:bg-green-900 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium">Nº {notificacao.id}</p>
                    <p className="font-medium">{notificacao.mensagem}</p>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                      <p className="text-slate-500 dark:text-slate-300">
                        <span className="font-semibold">De:</span> {notificacao.criadoPor}
                      </p>
                      <p className="text-slate-500 dark:text-slate-300">
                        <span className="font-semibold">Para:</span> {notificacao.enviadoPara}
                      </p>
                      <p className="text-slate-500 dark:text-slate-300">
                        <span className="font-semibold">Enviado em:</span> {formatarDataHora(notificacao.momentoCriacao)}
                      </p>
                      <p className="text-slate-500 dark:text-slate-300">
                        <span className="font-semibold">Recebido em:</span> {notificacao.momentoRecebido ? formatarDataHora(notificacao.momentoRecebido) : '-'}
                      </p>
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <button
                      onClick={() => handleDeleteRecebida(notificacao.id)}
                      className="px-3 py-1 bg-rose-100 text-rose-700 rounded text-sm hover:bg-rose-200 transition-colors"
                      title="Excluir notificação"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Contador de itens e navegação inferior */}
        <div className="flex justify-between items-center mt-4">
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Mostrando {notificacoesRecebidas.content.length} de {notificacoesRecebidas.totalElements} notificações
          </span>
          <div className="flex space-x-2">
            {Array.from({ length: Math.min(5, notificacoesRecebidas.totalPages) }, (_, i) => {
              let pageNum;
              if (notificacoesRecebidas.totalPages <= 5) {
                pageNum = i;
              } else if (currentPageRecebidas <= 2) {
                pageNum = i;
              } else if (currentPageRecebidas >= notificacoesRecebidas.totalPages - 3) {
                pageNum = notificacoesRecebidas.totalPages - 5 + i;
              } else {
                pageNum = currentPageRecebidas - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageRecebidasChange(pageNum)}
                  className={`px-3 py-1 rounded ${
                    currentPageRecebidas === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-700'
                  }`}
                >
                  {pageNum + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>


      {/* Modal para criar/editar notificação */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold dark:text-white">
                  {editando ? 'Editar Notificação' : 'Nova Notificação'}
                </h2>
                <button 
                  onClick={() => {
                    setModalOpen(false);
                    resetForm();
                  }}
                  className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {/* Tipo de Envio */}
                {!editando && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Tipo de Envio
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, tipoEnvio: "individual", destinatariosSelecionados: [], rolesSelecionadas: []})}
                        className={`p-2 text-sm rounded border ${
                          formData.tipoEnvio === "individual" 
                            ? "bg-blue-100 border-blue-500 text-blue-700 dark:bg-blue-700 dark:text-blue-100" 
                            : "bg-slate-100 border-slate-300 dark:bg-slate-700 dark:border-slate-600"
                        }`}
                      >
                        Individual
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, tipoEnvio: "multiplos", destinatario: "", nomeCompleto: "", rolesSelecionadas: []})}
                        className={`p-2 text-sm rounded border ${
                          formData.tipoEnvio === "multiplos" 
                            ? "bg-blue-100 border-blue-500 text-blue-700 dark:bg-blue-700 dark:text-blue-100" 
                            : "bg-slate-100 border-slate-300 dark:bg-slate-700 dark:border-slate-600"
                        }`}
                      >
                        Múltiplos
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, tipoEnvio: "role", destinatario: "", nomeCompleto: "", destinatariosSelecionados: []})}
                        className={`p-2 text-sm rounded border ${
                          formData.tipoEnvio === "role" 
                            ? "bg-blue-100 border-blue-500 text-blue-700 dark:bg-blue-700 dark:text-blue-100" 
                            : "bg-slate-100 border-slate-300 dark:bg-slate-700 dark:border-slate-600"
                        }`}
                      >
                        Por Função
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, tipoEnvio: "todos", destinatario: "", nomeCompleto: "", destinatariosSelecionados: [], rolesSelecionadas: []})}
                        className={`p-2 text-sm rounded border ${
                          formData.tipoEnvio === "todos" 
                            ? "bg-blue-100 border-blue-500 text-blue-700 dark:bg-blue-700 dark:text-blue-100" 
                            : "bg-slate-100 border-slate-300 dark:bg-slate-700 dark:border-slate-600"
                        }`}
                      >
                        Todos
                      </button>
                    </div>
                  </div>
                )}

                {/* Mensagem */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Mensagem
                  </label>
                  <textarea
                    value={formData.mensagem}
                    onChange={(e) => setFormData({...formData, mensagem: e.target.value})}
                    className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    rows={3}
                    placeholder="Digite a mensagem da notificação"
                  />
                </div>

                {/* Opção de Notificação Push */}
                <div className="flex items-center space-x-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <input
                    type="checkbox"
                    id="enviarPush"
                    checked={formData.enviarPush}
                    onChange={(e) => setFormData({...formData, enviarPush: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="enviarPush" className="text-sm text-blue-700 dark:text-blue-300">
                    <span className="font-medium">📱 Enviar também como Notificação Push</span>
                    <br />
                    <span className="text-xs text-blue-600 dark:text-blue-400">
                      Aparecerá na tela do dispositivo mesmo com app fechado
                    </span>
                  </label>
                </div>

                {/* Destinatário Individual */}
                {formData.tipoEnvio === "individual" && (
                  <div className="relative">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Destinatário
                    </label>
                    <input
                      type="text"
                      value={formData.destinatario}
                      onChange={(e) => {
                        setFormData({...formData, destinatario: e.target.value});
                        setShowUserSuggestions(e.target.value.length > 0);
                      }}
                      className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                      placeholder="Digite o nome do destinatário"
                    />
                    {showUserSuggestions && (
                      <div className="absolute z-10 mt-1 w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-lg max-h-60 overflow-auto">
                        {users
                          .filter(user => 
                            user.nome.toLowerCase().includes(formData.destinatario.toLowerCase()) ||
                            user.username.toLowerCase().includes(formData.destinatario.toLowerCase())
                          )
                          .map(user => (
                            <div
                              key={user.id}
                              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-600 cursor-pointer"
                              onClick={() => selectUser(user)}
                            >
                              {user.nome} - Usuario: ({user.username})
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Múltiplos Destinatários */}
                {formData.tipoEnvio === "multiplos" && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Destinatários Selecionados ({formData.destinatariosSelecionados.length})
                    </label>
                    
                    {/* Lista de destinatários selecionados */}
                    {formData.destinatariosSelecionados.length > 0 && (
                      <div className="mb-3 max-h-32 overflow-y-auto">
                        <div className="space-y-1">
                          {formData.destinatariosSelecionados.map(user => (
                            <div key={user.id} className="flex items-center justify-between bg-blue-100 dark:bg-blue-900 p-2 rounded">
                              <span className="text-sm">{user.nome} ({user.username})</span>
                              <button
                                type="button"
                                onClick={() => removerDestinatario(user.id!)}
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                Remover
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Campo para adicionar destinatário */}
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.destinatario}
                        onChange={(e) => {
                          setFormData({...formData, destinatario: e.target.value});
                          setShowUserSuggestions(e.target.value.length > 0);
                        }}
                        className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        placeholder="Digite o nome para adicionar destinatário"
                      />
                      {showUserSuggestions && (
                        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-lg max-h-60 overflow-auto">
                          {users
                            .filter(user => 
                              (user.nome.toLowerCase().includes(formData.destinatario.toLowerCase()) ||
                               user.username.toLowerCase().includes(formData.destinatario.toLowerCase())) &&
                              !formData.destinatariosSelecionados.find(u => u.id === user.id)
                            )
                            .map(user => (
                              <div
                                key={user.id}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-600 cursor-pointer"
                                onClick={() => adicionarDestinatario(user)}
                              >
                                {user.nome} - Usuario: ({user.username})
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Envio por Roles */}
                {formData.tipoEnvio === "role" && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Selecionar Funções
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {rolesDisponiveis.map(role => (
                        <button
                          key={role.value}
                          type="button"
                          onClick={() => toggleRole(role.value)}
                          className={`p-2 text-sm rounded border text-left ${
                            formData.rolesSelecionadas.includes(role.value)
                              ? "bg-green-100 border-green-500 text-green-700 dark:bg-green-700 dark:text-green-100"
                              : "bg-slate-100 border-slate-300 dark:bg-slate-700 dark:border-slate-600"
                          }`}
                        >
                          {role.label}
                        </button>
                      ))}
                    </div>
                    {formData.rolesSelecionadas.length > 0 && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                        {formData.rolesSelecionadas.length} função(ões) selecionada(s)
                      </p>
                    )}
                  </div>
                )}

                {/* Envio para Todos */}
                {formData.tipoEnvio === "todos" && (
                  <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      ⚠️ Esta notificação será enviada para todos os usuários do sistema ({users.length} usuários).
                    </p>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => {
                      setModalOpen(false);
                      resetForm();
                    }}
                    className="px-4 py-2 border rounded hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700 dark:text-white"
                  >
                    Cancelar
                  </button>
                  
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400"
                  >
                    {loading ? 'Salvando...' : 'Enviar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}