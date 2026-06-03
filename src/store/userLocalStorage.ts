// src/utils/userStorage.ts

interface UserState {
    id?: string | null;
    nomeCompleto?: string;
    username?: string;
    roles?: string[];
    cpf?: string;
    telefone?: string;
    email?: string;
    token?: string;
    imagemUrl?: string;
  }
  
  // Chave usada no localStorage
  const USER_STORAGE_KEY = 'user';
  
  // Salva o usuário no localStorage
  export const setUserLocalStorage = (user: UserState) => {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  };
  
  // Obtém o usuário do localStorage
  export const getUserLocalStorage = (): UserState | null => {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  };
  
  // Remove o usuário do localStorage (logout)
  export const clearUserLocalStorage = () => {
    localStorage.removeItem(USER_STORAGE_KEY);
  };
  