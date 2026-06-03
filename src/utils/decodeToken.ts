export interface JwtPayload {
    sub: string; // username
    roles: string[]; // Lista de roles
    iat: number; // Data de emissão
    exp: number; // Data de expiração
  }
  
  const base64UrlToBase64 = (base64Url: string): string => {
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padding = base64.length % 4;
    if (padding) {
      base64 += '='.repeat(4 - padding);
    }
    return base64;
  };
  
  export const decodeToken = (token: string): JwtPayload => {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token');
      }
  
      const payload = parts[1];
      const base64 = base64UrlToBase64(payload);
      const decodedString = atob(base64);
      const decoded: JwtPayload = JSON.parse(decodedString);
  
      return decoded;
    } catch (error) {
      console.error("Failed to decode token:", error);
      return { sub: "", roles: [], iat: 0, exp: 0 }; // Retorne valores padrão ou trate o erro como necessário
    }
  };
  