// hooks/useAuth.ts

import { isTokenExpired } from '@/utils/jwtUtils';
import { getUserLocalStorage, clearUserLocalStorage } from '@/store/userLocalStorage';

const useAuth = () => {
  const user = getUserLocalStorage();

  if (!user?.token || isTokenExpired(user.token)) {
    clearUserLocalStorage(); // Limpa os dados do usuário se o token for inválido ou expirado
    return { isAuthenticated: false, user: null };
  }

  return { isAuthenticated: true, user };
};

export default useAuth;

