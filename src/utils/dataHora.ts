// Função para obter a data e hora formatadas
export const obterDataHora = (): string => {
    const now = new Date();
    
    // Obtém a data e hora separadamente
    const formattedDate = now.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    const formattedTime = now.toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour12: false });
    
    // Retorna a data e hora concatenadas
    return `${formattedDate} ${formattedTime}`;
  };
  