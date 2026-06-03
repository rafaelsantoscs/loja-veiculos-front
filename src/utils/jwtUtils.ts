// src/utils/jwtUtils.ts

import { decodeToken } from './decodeToken';

export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeToken(token);
  const currentTime = Math.floor(Date.now() / 1000); // Hora atual em segundos
  return decoded.exp < currentTime;
};

export const isTokenExpiredLocalStorage = (token: string): boolean => {
  try {
    if (!token) return true; // Se não houver token, considera como expirado
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return true; // Se não conseguir decodificar ou não houver `exp`, considera expirado

    const currentTime = Math.floor(Date.now() / 1000); // Hora atual em segundos
    return decoded.exp < currentTime;
  } catch (error) {
    console.error('Erro ao verificar expiração do token:', error);
    return true; // Se houver erro, considera o token expirado
  }
};
