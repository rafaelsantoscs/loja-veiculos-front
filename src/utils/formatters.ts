// import { DateObject } from "react-multi-date-picker";


export const formatCPF = (cpf: string) => {
  if (!cpf) return "";
  // Remove qualquer caractere não numérico
  const cleanCpf = cpf.replace(/\D/g, '');

  // Verifica se o CPF tem o comprimento correto após a limpeza
  if (cleanCpf.length <= 11) {
    return cleanCpf
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }

  // Se o CPF tiver mais de 11 caracteres, limita o tamanho e formata
  return cleanCpf.slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');

};

// formatar cpf caso venha continuo 
export function formatarCpfSeNecessario(cpf: string): string {
  const cpfLimpo = cpf.replace(/\D/g, '');

  if (cpfLimpo.length !== 11) return cpf; // Se não for um CPF válido, retorna como está

  // Se já estiver formatado corretamente, retorna como está
  const regexFormatado = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
  if (regexFormatado.test(cpf)) {
    return cpf;
  }

  // Caso contrário, aplica formatação
  return `${cpfLimpo.slice(0, 3)}.${cpfLimpo.slice(3, 6)}.${cpfLimpo.slice(6, 9)}-${cpfLimpo.slice(9, 11)}`;
}


//formatar cpf exibido escondendo caracters 
 export function mascararCpfExibido(cpf: string): string {
  const cpfLimpo = cpf.replace(/\D/g, '');

  if (cpfLimpo.length !== 11) return cpf; // Se não tiver 11 dígitos, retorna como veio

  // Retorna no formato ***.456.789-**
  return `***.${cpfLimpo.slice(3, 6)}.${cpfLimpo.slice(6, 9)}-**`;
}



//formatar ip
export function formatarIP(ip: string): string {
  return ip
    .split('.')
    .map(octeto => octeto.padStart(3, '0'))
    .join('.');
}

//formatar ip para exibição 
export function formatarIPExibicao(ip: string): string {
  // Caso esteja no formato contínuo: "192168010212"
  const ipLimpo = ip.replace(/\D/g, ''); // Remove qualquer caractere que não seja número

  if (ipLimpo.length === 12) {
    const octetos = [
      ipLimpo.slice(0, 3),
      ipLimpo.slice(3, 6),
      ipLimpo.slice(6, 9),
      ipLimpo.slice(9, 12),
    ];
    return octetos.join('.');
  }

  // Caso esteja no formato com pontos
  const octetos = ip.split('.');
  if (octetos.length === 4 && octetos.every(o => !isNaN(Number(o)))) {
    return octetos.map(o => o.padStart(3, '0')).join('.');
  }

  return ip; 
}



// remover qualquer mascara 
export const removerCaracteresNaoNumericos = (valor: string): string => valor.replace(/\D/g, '');

// formatar cnpj 
export const formatCNPJ = (value: string | undefined | null) => {
  if (!value) return ''; // garante que só formata se houver valor

  return value
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .slice(0, 18);
};

//função para formatar rg 

export function formatRG(valor: string): string {
  // Remove tudo que não for número
  const numeros = valor.replace(/\D/g, '');

  // Aplica a máscara: 99.999.999-9
  return numeros
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4')
    .substring(0, 12); // limita a 12 caracteres
}

export function formatRGDinamica(valor: string): string {
  const numeros = valor.replace(/\D/g, '');

  if (numeros.length === 7) {
    // Formato: 8.334.519
    return numeros
      .replace(/^(\d{1})(\d{3})(\d{3})/, '$1.$2.$3');
  }

  if (numeros.length === 8) {
    // Formato: 83.345.190
    return numeros
      .replace(/^(\d{2})(\d{3})(\d{3})/, '$1.$2.$3');
  }

  if (numeros.length === 9) {
    // Formato: 83.345.190-8
    return numeros
      .replace(/^(\d{2})(\d{3})(\d{3})(\d{1})/, '$1.$2.$3-$4');
  }

  if (numeros.length === 11) {
    // Novo modelo (CPF como RG): 123.456.789-00
    return numeros
      .replace(/^(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  return numeros; // se não atender nenhum caso
}


// Função para formatar a placa do veículo
export const formatPlaca = (placa: string): string => {
  // Remove qualquer caractere não alfanumérico
  const cleanPlaca = placa.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

  // Limita a placa a 7 caracteres (3 letras + 4 números/letras)
  const limitedPlaca = cleanPlaca.slice(0, 7);

  // Insere um hífen após o terceiro caractere, se houver mais de 3 caracteres
  if (limitedPlaca.length > 3) {
    return `${limitedPlaca.slice(0, 3)}-${limitedPlaca.slice(3)}`;
  }

  return limitedPlaca;
};

// Função para formatar a placa de máquinas (formato: TRT-01-AG)
export const formatPlacaMaquina = (placa: string): string => {
  // Remove qualquer caractere não alfanumérico
  const cleanPlaca = placa.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

  // Limita a placa a 7 caracteres (3 letras + 2 números + 2 letras)
  const limitedPlaca = cleanPlaca.slice(0, 7);

  // Formata no padrão TRT-01-AG
  if (limitedPlaca.length > 5) {
    return `${limitedPlaca.slice(0, 3)}-${limitedPlaca.slice(3, 5)}-${limitedPlaca.slice(5)}`;
  } else if (limitedPlaca.length > 3) {
    return `${limitedPlaca.slice(0, 3)}-${limitedPlaca.slice(3)}`;
  }

  return limitedPlaca;
};



  //formatar cep
export const formatCEP = (cep: string | undefined | null) => {
  if (!cep) return '';

  return cep
    .replace(/\D/g, '')
    .replace(/(\d{5})(\d{1,3})/, '$1-$2')
    .substring(0, 9);
};

      

  //validar cpf matematicamente
  export function validarCPF(cpf: string): boolean {
    cpf = cpf.replace(/[^\d]+/g, '');
  
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
      return false;
    }
  
    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
  
    let resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(9))) return false;
  
    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
  
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(10))) return false;
  
    return true;
  }

  export const formatarData = (dataISO: string): string => {
    const [ano, mes, dia] = dataISO.split("-");
    return `${dia}/${mes}/${ano}`;
  };
  
  
  
  export const formatDataNascimento = (text: string) => {
     // Remove qualquer caractere não numérico
  let formattedText = text.replace(/[^0-9]/g, '');

  // Limita o comprimento a 8 caracteres (DDMMYYYY)
  formattedText = formattedText.slice(0, 8);

  // Formata a data no formato DD/MM/YYYY
  if (formattedText.length > 2) {
    formattedText = formattedText.slice(0, 2) + '/' + formattedText.slice(2);
  }
  if (formattedText.length > 5) {
    formattedText = formattedText.slice(0, 5) + '/' + formattedText.slice(5);
  }

  return formattedText;
  };

// Função para remover o prefixo "ROLE_" de cada elemento em roles[]
export function cleanRoles(roles: string[]): string[] {
  return roles.map(role => role.replace("ROLE_", " | "));
}

// Função para remover o prefixo "ROLE_" de uma única string
export function cleanRole(role: string): string {
  return role.replace("ROLE_", " | ");
}

 // Função para converter string 'dd/mm/yyyy' em objeto Date
 export const stringToDate = (dateString: string): Date => {
  const [day, month, year] = dateString.split('/').map(Number);
  return new Date(year, month - 1, day); // Ajusta o mês (0-11 no objeto Date)
};



// export const stringToDate2 = (dateString: string): DateObject => {
//   const [day, month, year] = dateString.split('/').map(Number);
//   return { day, month, year };
// };

// Função para converter objeto Date em string 'dd/mm/yyyy'
export const dateToString = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Função para converter objeto Date em string 'hh:mm'
export const timeToString = (date: Date): string => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};


// Função para formatar a data no formato dd/mm/yyyy
export const formatDate = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Mês começa em 0
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};


/**
 * Remove caracteres especiais e espaços de um número de celular.
 * @param phoneNumber - O número de celular a ser formatado.
 * @returns O número de celular apenas com dígitos.
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  return phoneNumber.replace(/[^\d]/g, '');
};

//format number no input
export const formatPhoneNumberForInput = (value: string | undefined | null): string => {
  if (!value) return "";

  const cleaned = value.replace(/\D/g, "");

  if (cleaned.length === 0) return "";
  if (cleaned.length <= 2) return cleaned;
  if (cleaned.length <= 6) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
  if (cleaned.length <= 10) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;

  return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
};



export function abreviarNome(nomeCompleto: string): string {
  const partes = nomeCompleto.trim().split(" ");
  
  if (partes.length === 1) {
    return partes[0]; // Caso o nome completo tenha apenas um nome
  }
  
  const primeiroNome = partes[0]; // Primeiro nome completo
  const iniciais = partes.slice(1).map(parte => parte.charAt(0).toUpperCase()); // Iniciais dos demais nomes
  
  return `${primeiroNome} ${iniciais.join(" ")}`; // Junta o primeiro nome e as iniciais
}

  // Função para formatar a placa no padrão ABC-1A23
  export const formatarPlaca = (placa: string) => {
    // Remove qualquer coisa que não seja letra ou número
    const novoValor = placa.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    // Adiciona o traço no formato ABC-1A23
    if (novoValor.length > 3) {
      return `${novoValor.slice(0, 3)}-${novoValor.slice(3, 7)}`;
    }
    return novoValor;
  };

  export function obterTextResumido(texto: string) {
    if (!texto) return ""; // Verifica se o modelo é válido
    
    const partes = texto.split("/");
    if (partes.length > 1) {
        const restante = partes[1].trim();
        const palavras = restante.split(" ");
        
        if (palavras.length > 1) {
            return palavras[0] + " " + palavras[1];
        }
        return palavras[0];
    }
    
    const indexEspaco = texto.indexOf(" ");
    return indexEspaco !== -1 ? texto.substring(0, indexEspaco) : texto;
}

export const formatCurrency = (value: string): string => {
  // Remove caracteres não numéricos
  const numericValue = value.replace(/\D/g, "");

  // Converte para número e divide por 100 para manter duas casas decimais
  let floatValue = parseFloat(numericValue) / 100;

  // Garante que o número antes da vírgula não ultrapasse 4 dígitos
  if (floatValue >= 10000) {
    floatValue = 9999.99;
  }

  // Formata para moeda brasileira
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(floatValue);
};



//remove o R$ e formata para float
export const formatToFloat = (value: string): number => {
  if (!value) return 0; // Evita erro se o valor for undefined ou vazio

  // Remove "R$", pontos de milhar e espaços
  const numericValue = value.replace(/[^\d,]/g, "").replace(",", ".");

  return parseFloat(numericValue);
};


export const formatLitros = (value: string): string => {
  // Remove caracteres não numéricos
  let numericValue = value.replace(/[^\d]/g, "");

  // Limita o número de caracteres a 5
  if (numericValue.length > 5) {
    numericValue = numericValue.slice(0, 5); // Mantém até 5 caracteres
  }

  // Se o número tiver 3 caracteres, coloca o ponto após o primeiro número
  if (numericValue.length === 3) {
    const inteiro = numericValue.slice(0, 1); // Parte inteira com 1 caractere
    const decimal = numericValue.slice(1, 3); // Parte decimal com 2 caracteres
    return `${inteiro}.${decimal}`; // Junta a parte inteira e decimal
  }

  // Se o número tiver 4 caracteres, coloca o ponto após o segundo número
  if (numericValue.length === 4) {
    const inteiro = numericValue.slice(0, 2); // Parte inteira com 2 caracteres
    const decimal = numericValue.slice(2, 4); // Parte decimal com 2 caracteres
    return `${inteiro}.${decimal}`; // Junta a parte inteira e decimal
  }

  // Se o número tiver 5 caracteres, coloca o ponto após o segundo número e limita a dois dígitos
  if (numericValue.length === 5) {
    const inteiro = numericValue.slice(0, 3); // Parte inteira com 3 caracteres
    const decimal = numericValue.slice(3, 5); // Parte decimal com 2 caracteres
    return `${inteiro}.${decimal}`; // Junta a parte inteira e decimal
  }

  // Para valores com menos de 3 caracteres, retorna o valor sem ponto
  return numericValue;
};



// Converte para número e valida formato DECIMAL(10,1)
export const formatDecimal = (value: string) => {
  const num = parseFloat(value);
  if (isNaN(num)) return null;
  return num.toFixed(1); // Garante uma casa decimal (ex: 100 → "100.0")
};



export const abreviarNomesDoMeio = (value: string) => {
  const partes = value.trim().split(/\s+/); // Remove espaços extras e divide corretamente

  if (partes.length <= 2) {
    // Se só tem nome e sobrenome, não precisa abreviar
    return partes.map(parte => parte.toUpperCase()).join(' ');
  }

  const nomeAbreviado = partes.map((parte, index) => {
    if (index === 0 || index === partes.length - 1) {
      return parte.toUpperCase(); // Primeiro e último nome completos em maiúsculo
    }
    return `${parte.charAt(0).toUpperCase()}.`; // Abrevia nomes do meio
  });

  return nomeAbreviado.join(' ');
};


export const getFirstAndLastDayOfMonth = (): { from: string; to: string } => {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const formatDate = (date: Date) =>
    date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

  return { from: formatDate(firstDay), to: formatDate(lastDay) };
};

// Função para converter data no formato dd/mm/yyyy para yyyy-mm-dd (formato ISO)
  export const formatDateToISO = (dateString: string): string => {
    const [day, month, year] = dateString.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

export const getFullDateTime = (date: Date, includeSeconds = false): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = includeSeconds ? `:${String(date.getSeconds()).padStart(2, '0')}` : '';
  
  return `${day}/${month}/${year} ${hours}:${minutes}${seconds}`;
};


export const limparCPF = (cpf: string) => {
  // Remove tudo que não é dígito (0-9)
  return cpf.replace(/\D/g, '');
}

export const formatarDataParaBrasil = (data: Date | string) => {
  const dateObj = new Date(data);
  
  const dia = String(dateObj.getDate()).padStart(2, '0');
  const mes = String(dateObj.getMonth() + 1).padStart(2, '0');
  const ano = dateObj.getFullYear();
  
  const horas = String(dateObj.getHours()).padStart(2, '0');
  const minutos = String(dateObj.getMinutes()).padStart(2, '0');
  const segundos = String(dateObj.getSeconds()).padStart(2, '0');
  
  return `${dia}/${mes}/${ano} ${horas}:${minutos}:${segundos}`;
};



