// Enums para os tipos de material
export enum TipoMaterial {
  MONITOR = "MONITOR",
  CPU = "CPU",
  ESTABILIZADOR = "ESTABILIZADOR",
  IMPRESSORA = "IMPRESSORA",
  SCANNER = "SCANNER",
  ROTEADOR = "ROTEADOR",
  INTERNET = "INTERNET",
  SWITCH = "SWITCH",
  MOUSE = "MOUSE",
  TECLADO = "TECLADO",
  OUTRO = "OUTRO"
}

// Enums para status do material
export enum StatusMaterial {
  FUNCIONANDO = "FUNCIONANDO",
  DEFEITO = "DEFEITO",
  EM_REPARO = "EM_REPARO",
  SEM_CONSERTO = "SEM_CONSERTO",
  EM_ESTOQUE = "EM_ESTOQUE"
}

// Enums para status do chamado
export enum StatusChamado {
  ABERTO = "ABERTO",
  EM_ATENDIMENTO = "EM_ATENDIMENTO",
  FECHADO = "FECHADO",
  FINALIZADO = "FINALIZADO"
}

// Interfaces
export interface Unidade {
  id: number;
  nome: string;
  setores: Setor[];
}

export interface Setor {
  id: number;
  nome: string;
  unidadeId: number;
}

export interface Material {
  id: number;
  tipo: TipoMaterial;
  tombamento: string;
  status: StatusMaterial;
  unidadeId: number;
  setorId: number;
  marca: string;
  especificacoes: string;
  cadastradoPor: string;
  dataCadastro: string;
}

export interface Chamado {
  id: number;
  usuarioAbertura: string;
  dataAbertura: string;
  unidadeId: number;
  setorId: number;
  materialId: number;
  status: StatusChamado;
  protocolo: string;
  descricaoProblema: string;
  parecerSuporte?: string;
}

export interface Manutencao {
  id: number;
  materialId: number;
  chamadoId?: number;
  dataAbertura: string;
  dataFechamento?: string;
  descricaoProblema: string;
  descricaoSolucao?: string;
  tecnico: string;
  status: 'ABERTA' | 'FECHADA';
}

export interface Chamado {
  id: number;
  usuarioAbertura: string;
  dataAbertura: string;
  unidadeId: number;
  setorId: number;
  materialId: number;
  status: StatusChamado;
  protocolo: string;
  descricaoProblema: string;
  parecerSuporte?: string;
}

// Enums para Tarefas
export enum PrioridadeTarefa {
  BAIXA = "BAIXA",
  MEDIA = "MEDIA",
  ALTA = "ALTA",
  URGENTE = "URGENTE"
}

export enum StatusTarefa {
  PENDENTE = "PENDENTE",
  EM_ANDAMENTO = "EM_ANDAMENTO",
  CONCLUIDA = "CONCLUIDA",
  CANCELADA = "CANCELADA"
}

// Interfaces para Tarefas
export interface Subtarefa {
  id?: number;
  titulo: string;
  descricao?: string;
  concluida: boolean;
  dataConclusao?: string;
  concluidaPor?: string;
  ordem: number;
}

export interface Tarefa {
  id?: number;
  titulo: string;
  descricao?: string;
  criadoPor: string; // Email do criador
  criadoPorNome?: string; // Nome do criador
  atribuidoPara: string; // Emails dos responsáveis (separados por vírgula)
  atribuidoParaNome?: string; // Nomes dos responsáveis (separados por vírgula)
  atribuidoParaEmails?: string[]; // Lista de emails dos responsáveis
  atribuidoParaNomes?: string[]; // Lista de nomes dos responsáveis
  dataCriacao?: string;
  dataPrazo?: string;
  dataConclusao?: string;
  prioridade: PrioridadeTarefa;
  status: StatusTarefa;
  observacoes?: string;
  subtarefas: Subtarefa[];
  progresso?: number;
}