import axiosInstance from '@/services/axiosInstance';
// import { RootState } from '@/store/store';
import React, { useCallback, useEffect, useState } from 'react';
import 'react-multi-date-picker/styles/colors/red.css'
// import { useSelector } from 'react-redux';
import { cleanRole } from "@/utils/formatters";
import { getUserLocalStorage } from '@/store/userLocalStorage';

interface User {
  id: number | null;
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  username: string;
  imagemUrl?: string;
  roles?: string[]; // Opcional
}

interface OperadoresProps {
  roles: string[];
}

const OperadoresDoSertorOuUnidade: React.FC<OperadoresProps> = ({ roles }) => {
  const user = getUserLocalStorage() || {}; // Evita erro se for null
  const [userSystemsByRole, setUserSystemsByRole] = useState<Record<string, User[]>>({});

  const [errorMessage, setErrorMessage] = useState<string | null>('');
  const [loading, setLoading] = useState(false);

  // Função para buscar Profissionais ao carregar a página
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const usersByRole: Record<string, User[]> = {};
       // Faz requisições separadas para cada role
       for (const role of roles) {
        const response = await axiosInstance.get(`/usuarios/roles?roles=${role}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        usersByRole[role] = response.data;
      }

      setUserSystemsByRole(usersByRole);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar Veículos: ', error);
      setErrorMessage('Erro ao carregar lista de Servidores');
      setUserSystemsByRole({});
    }
   
  }, [roles, user.token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);  

  const handleDeleteUser = async (usuario: User) => {
    console.log('id', usuario.id);
    if (window.confirm(`Tem certeza que deseja excluir o cadastro do usuário ${usuario.nome}?`)) {
      try {
        const response = await axiosInstance.delete(`/usuarios/${usuario.id}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        console.log('response', response);
        if (response.status === 204) {
          alert("Usuário excluído com sucesso!");
        }
        // Atualiza a lista removendo o usuário excluído
        setUserSystemsByRole((prev) => {
          const updatedRoles = { ...prev };
          Object.keys(updatedRoles).forEach((role) => {
            updatedRoles[role] = updatedRoles[role].filter(user => user.id !== usuario.id);
          });
          return updatedRoles;
        });
      } catch (error) {
        console.error("Erro ao excluir usuário:", error);
        alert("Erro ao excluir o usuário.");
      }
    }
  };

  return (
    <>
     
     <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 sm:p-6 transition-colors duration-300">
  {/* Loading Indicator */}
  {loading && (
    <div className="flex items-center justify-center p-4 bg-camutanga-amarelo/20 dark:bg-camutanga-amarelo/10 rounded-lg mb-4">
      <svg 
        className="animate-spin h-5 w-5 text-camutanga-azul dark:text-camutanga-amarelo mr-2" 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span className="text-camutanga-azul dark:text-camutanga-amarelo">Carregando usuários...</span>
    </div>
  )}

  {/* Error Message */}
  {errorMessage && (
    <div className="p-4 mb-6 bg-rose-100 dark:bg-rose-900/20 border-l-4 border-camutanga-vinho text-rose-700 dark:text-rose-300 rounded">
      <p>{errorMessage}</p>
    </div>
  )}

  {/* Roles List */}
  <div className="space-y-6 sm:space-y-8">
    {roles.map((role) => (
      <div key={role} className="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-3 sm:p-4 transition-colors duration-300">
        {/* Role Header */}
        <h2 className="text-lg sm:text-xl font-bold text-camutanga-azul dark:text-camutanga-amarelo mb-3 sm:mb-4 pb-2 border-b-2 border-camutanga-amarelo">
          {userSystemsByRole[role]?.length || 0} {cleanRole(role)}
        </h2>

        {/* Users Table */}
        {userSystemsByRole[role]?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse rounded-lg overflow-hidden shadow-sm text-sm sm:text-base">
              <thead>
                <tr className="bg-camutanga-azul text-camutanga-branco">
                  <th className="px-3 py-2 sm:px-4 sm:py-3 text-left">ID</th>
                  <th className="px-3 py-2 sm:px-4 sm:py-3 text-left">Ações</th>
                  <th className="px-3 py-2 sm:px-4 sm:py-3 text-left">Nome</th>
                  <th className="px-3 py-2 sm:px-4 sm:py-3 text-left">Telefone</th>
                  <th className="px-3 py-2 sm:px-4 sm:py-3 text-left">Email</th>
                  <th className="px-3 py-2 sm:px-4 sm:py-3 text-left">CPF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-600">
                {userSystemsByRole[role].map((user) => (
                  <tr key={user.id} className="hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-3 py-2 sm:px-4 sm:py-3">{user.id}</td>
                    <td className="px-3 py-2 sm:px-4 sm:py-3">
                      <button 
                        onClick={() => handleDeleteUser(user)} 
                        className="bg-camutanga-vinho text-white px-2 py-1 sm:px-3 sm:py-1 rounded hover:bg-opacity-90 transition-all text-xs sm:text-sm"
                      >
                        Excluir
                      </button>
                    </td>
                    <td className="px-3 py-2 sm:px-4 sm:py-3">{user.nome}</td>
                    <td className="px-3 py-2 sm:px-4 sm:py-3">{user.telefone}</td>
                    <td className="px-3 py-2 sm:px-4 sm:py-3 whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px] sm:max-w-none">
                      {user.email}
                    </td>
                    <td className="px-3 py-2 sm:px-4 sm:py-3">{user.cpf}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-4 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 rounded-lg border border-dashed border-slate-300 dark:border-slate-600">
            Nenhum servidor encontrado para esta regra.
          </div>
        )}
      </div>
    ))}
  </div>
</div>
    </>
  );
};
export default OperadoresDoSertorOuUnidade;