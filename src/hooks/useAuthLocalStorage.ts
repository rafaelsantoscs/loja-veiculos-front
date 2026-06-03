import { useEffect, useState } from 'react';
import { isTokenExpiredLocalStorage } from '@/utils/jwtUtils';
import { clearUserLocalStorage, getUserLocalStorage, setUserLocalStorage } from '@/store/userLocalStorage';

interface User {
    token?: string; // Tornando o token opcional
    cpf: string;
    id?: string | null;
    nomeCompleto?: string;
    username?: string;
    roles?: string[];
    telefone?: string;
    email?: string;
    imagemUrl?: string;
    // Outros campos, conforme necessário
  }
  
  const useAuthLocalStorage = () => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
  
    useEffect(() => {
      const checkAuth = () => {
        try {
          const parsedUser = getUserLocalStorage(); // Usa a função do utilitário
          if (!parsedUser) {
            setUser(null);
            setIsAuthenticated(false);
            return;
          }
  
          // Garantir que a propriedade 'cpf' sempre seja uma string (caso contrário, será undefined)
          const userWithRoles = {
            ...parsedUser,
            roles: parsedUser.roles || [],
            cpf: parsedUser.cpf || '',  // Se 'cpf' for undefined, definir como string vazia
          };
  
          // Se o token existir e não estiver expirado, mantém o usuário autenticado
          if (userWithRoles.token && !isTokenExpiredLocalStorage(userWithRoles.token)) {
            setUserLocalStorage(userWithRoles);
            setIsAuthenticated(true);
          } else {
            clearUserLocalStorage(); // Limpa o usuário do localStorage
            setUser(null);
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error('Erro ao recuperar usuário do localStorage:', error);
          clearUserLocalStorage(); // Limpa o usuário do localStorage em caso de erro
          setUser(null);
          setIsAuthenticated(false);
        } finally {
          setIsLoading(false);
        }
      };
  
      checkAuth();
    }, []); // O array vazio garante que o efeito será executado apenas uma vez
  
    return { isAuthenticated, user, isLoading };
  };
  
  export default useAuthLocalStorage;
  