import { differenceInYears, differenceInMonths, differenceInDays } from 'date-fns';

const calculateAge = (dataDeNasc: string) => {
    try {
      // Converte a string "DD/MM/YYYY" para um objeto Date
      const [dia, mes, ano] = dataDeNasc.split('/').map(Number);
      const nascimento = new Date(ano, mes - 1, dia); // O mês em JavaScript é baseado em zero
  
      if (isNaN(nascimento.getTime())) {
        throw new Error('Data de nascimento inválida');
      }
  
      const hoje = new Date();
  
      // Calcula a diferença em anos
      const anos = differenceInYears(hoje, nascimento);
  
      // Calcula a diferença de meses
      const dataComMeses = new Date(nascimento);
      dataComMeses.setFullYear(hoje.getFullYear());
      if (hoje < dataComMeses) {
        dataComMeses.setFullYear(hoje.getFullYear() - 1);  // Se não passou o aniversário este ano
      }
  
      const meses = differenceInMonths(hoje, dataComMeses);
  
      // Ajuste para calcular a diferença de dias
      const dataComMesesCorrigida = new Date(dataComMeses);
      dataComMesesCorrigida.setMonth(dataComMeses.getMonth() + meses);
      
      const dias = differenceInDays(hoje, dataComMesesCorrigida);
  
      // Para garantir que os dias não ultrapassem os dias do mês atual
      const diasNoMesAtual = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate(); // Dias no mês atual
      const diasCorrigidos = dias > diasNoMesAtual ? diasNoMesAtual : dias;
  
      return `${anos} anos, ${meses} meses e ${diasCorrigidos} dias`;
    } catch (error) {
      console.error(error);
      return 'Data inválida';
    }
  };
  export default calculateAge