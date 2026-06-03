import { ReactNode } from "react";

export const rolesOptions = [
  'ROLE_ADMIN',
  'ROLE_USUARIO',
  'ROLE_ASSISTENTE',
  'ROLE_MOTORISTA',
  'ROLE_ADMINISTRADOR',
];

export interface Abastecimento {
  id: string;
  combustivel: string;
  data: string;
  hora: string;
  motorista: string;
  placa: string;
  valor: number;
  km: number;
  litros: number;
  lotacao?: string;
}

export interface TotalAbastecimentosPostoDeCombustivelResponse {
  totalAbastecimentosDiesel: number;
  totalAbastecimentosGasolina: number;
  totalAbastecimentosArla: number;
  totalValorAbastecimentosDiesel: number;
  totalValorAbastecimentosGasolina: number;
  totalValorAbastecimentosArla: number;

}

export interface TotalFuncionariosResponse {
  totalFuncionariosLigados: number;
  totalExFuncionarios: number;
  totalEfetivos: number;
  totalContratados: number;
  totalTerceirizados: number;
  totalComissionados: number;
}

export interface TotalViagensResponse {
    totalViagensSoPacientes: number;
    totalViagensAcompanhantes: number;
    totalPessoasAmbulancia: number;
    totalPessoasCarro: number;
    totalPessoasOnibus: number;
    totalPessoasVan: number;
  }



  export interface VagasOcupadasOnibusResponse {
    vagasOcupadasAllison04h: number;
    vagasOcupadasAllison08h: number;
    vagasOcupadasKid04h: number;
    vagasOcupadasKid08h: number;
    vagasOcupadasMarinaldo04h: number;
  }

  export interface VagasOcupadasCarrosResponse {
    vagasOcupadasCarro02h: number;
    vagasOcupadasCarro04h: number;
    vagasOcupadasCarro06h: number;
    vagasOcupadasCarro08h: number;
    vagasOcupadasCarro11h: number;
  }

  export interface VagasOcupadasVansResponse {
    vagasOcupadasVan04h: number;
    vagasOcupadasVan13h: number;
  }

  export const vagasLimiteOnibus: Record<string, number> = {
    Allison04h: 44,
    Allison08h: 44,
    Kid04h: 44,
    Kid08h: 44,
    Marinaldo04h: 28,
  };
  
  export const vagasOcupadasOnibusMap: Record<string, keyof VagasOcupadasOnibusResponse> = {
    Allison04h: 'vagasOcupadasAllison04h',
    Allison08h: 'vagasOcupadasAllison08h',
    Kid04h: 'vagasOcupadasKid04h',
    Kid08h: 'vagasOcupadasKid08h',
    Marinaldo04h: 'vagasOcupadasMarinaldo04h',
  };

  // Defina os limites de cada tipo de ônibus
export const vagasLimiteCar: Record<string, number> = {
  Carro02h: 4,
  Carro04h: 12,
  Carro06h: 4,
  Carro08h: 10,
  Carro11h: 4,
};

export const vagasOcupadasCarMap: Record<string, keyof VagasOcupadasCarrosResponse> = {
  Carro02h: 'vagasOcupadasCarro02h',
  Carro04h: 'vagasOcupadasCarro04h',
  Carro06h: 'vagasOcupadasCarro06h',
  Carro08h: 'vagasOcupadasCarro08h',
  Carro11h: 'vagasOcupadasCarro11h',
};

export const vagasLimiteVan: Record<string, number> = {
  Van04h: 16,
  Van13h: 16,
};

export const vagasOcupadasVanMap: Record<string, keyof VagasOcupadasVansResponse> = {
  Van04h: 'vagasOcupadasVan04h',
  Van13h: 'vagasOcupadasVan13h',
};



export type Raridade = "comum" | "raro" | "epico" | "lendario";

export interface Slide {
    title: string;
    description: string;
    image: string;
}

export interface Colaborador {
    id?: number;
    nome: string;
    imagem: string;
    raridade?: Raridade;
    slides: Slide[];
}

//tipagem de indicadores por plantão 

// src/types/IndicadorItem.ts

export type Turno = "diurno" | "noturno";


export interface IndicadorItem {
  label: string;
  diurno: number | string;
  noturno: number| string;
  icon?: ReactNode;
}

// src/types/indicadores.ts
export interface QtcData {
  usa: { diurno: number; noturno: number };
  usb1: { diurno: number; noturno: number };
  usb2: { diurno: number; noturno: number };
  motolancia: { diurno: number; noturno: number };
  totalDiurno: number;
  totalNoturno: number;
}

export interface TempoRespostaData {
  tempoRespostaMinimoDiurno: number;
  tempoRespostaMedioDiurno: number;
  tempoRespostaMaximoDiurno: number;
  tempoRespostaMinimoNoturno: number;
  tempoRespostaMedioNoturno: number;
  tempoRespostaMaximoNoturno: number;
}

export interface FaixaEtariaData {
  menorDeUmAnoDiurno: number;
  menorDeUmAnoNoturno: number;
  deUmANoveDiurno: number;
  deUmANoveNoturno: number;
  deDezDezenoveDiurno: number;
  deDezDezenoveNoturno: number;
  deVinteTrintaNoveDiurno: number;
  deVinteTrintaNoveNoturno: number;
  deQuarentaCinquentaNoveDiurno: number;
  deQuarentaCinquentaNoveNoturno: number;
  deSessentaOuMaisDiurno: number;
  deSessentaOuMaisNoturno: number;
  naoInformadoDiurno: number;
  naoInformadoNoturno: number;
}

export interface TipoOcorrenciaData {
  TRAUMADiurno: number;
  TRAUMANoturno: number;
  CLINICODiurno: number;
  CLINICONoturno: number;
  REMOCAODiurno: number;
  REMOCAONoturno: number;
}

export interface SubtipoData {
  acidenteDeTransitoDiurno: number;
  acidenteDeTransitoNoturno: number;
  vitimasDeViolenciaDiurno: number;
  vitimasDeViolenciaNoturno: number;
  outrosAcidentesDiurno: number;
  outrosAcidentesNoturno: number;
  psiquiatricoDiurno: number;
  psiquiatricoNoturno: number;
  obstetricoDiurno: number;
  obstetricoNoturno: number;
  outrosDiurno: number;
  outrosNoturno: number;
}


export interface LocalOcorrenciaData {
  localDeTrabalhoDiurno: number;
  localDeTrabalhoNoturno: number;
  unidadeDeSaudeDiurno: number;
  unidadeDeSaudeNoturno: number;
  viaPublicaDiurno: number;
  viaPublicaNoturno: number;
  domicilioDiurno: number;
  domicilioNoturno: number;
  outrosDiurno: number;
  outrosNoturno: number;
  unidadeHospitalarDiurno: number;
  unidadeHospitalarNoturno: number;
}

export interface IncidenteData {
  atendimentoNoLocalDiurno: number;
  atendimentoNoLocalNoturno: number;
  nenhumDiurno: number;
  nenhumNoturno: number;
  obitoDiurno: number;
  obitoNoturno: number;
  recusaDiurno: number;
  recusaNoturno: number;
  removidoPorCuriososDiurno: number;
  removidoPorCuriososNoturno: number;
  removidoPorCBDiurno: number;
  removidoPorCBNoturno: number;
  qtaDiurno: number;
  qtaNoturno: number;
}


export interface DestinoData {
  hjmoDiurno: number;
  hjmoNoturno: number;
  outrosDiurno: number;
  outrosNoturno: number;
}

//ocorrencias

export interface Ocorrencia {
  id: number;
  nome: string;
  idade?: number;
  sexo: string;
  data: string;
  qtc: string;
  horaDaChamada: string;
  chegadaAoLocal: string;
  tempoDeResposta: number;
  saidaDoLocal: string;
  saidaDoHospital?: string;
  horaDaConclusao: string;
  faixaEtaria: string;
  endereco: string;
  local: string;
  outroLocal?: string;
  viatura: string;
  tipo: string;
  subtipo: string;
  destino: string;
  outroDestino?: string;
  incidente: string;
  turno: string;
  registradoPor?: string;
  dataRegistro?: string;
  editadoPor?: string;
  dataEdicao?: string;
}

// Interface para Veículo
export interface Veiculo {
  id: string;
  modelo: string;
  placa: string;
  km: string;
  combustivel: string;
  tipo?: string;
  lotacao?: string;
}

// Interface para Definição de Porte
export interface DefinicaoPorte {
  id?: number;
  cnpjCpfEmpresa: string;
  empresaId: number;
  quantidadeGerada: number;
  porte: string;
  responsavelTipo: 'LEGAL' | 'TECNICO';
  responsavelId: number;
  responsavelNome: string;
  registradoPor?: string;
  dataRegistro?: string;
  cpfDoRegistrador?: string;
  usuarioId?: number;
}

// Interface para Responsável (base para Legal e Técnico)
export interface Responsavel {
  id?: number;
  nome: string;
  tipo: 'LEGAL' | 'TECNICO';
}

// Interface para Faixa de Porte
export interface FaixaPorte {
  faixa: string;
  descricao: string;
  porte: string;
  minimo?: number;
  maximo?: number;
}

// Interface para Response da API de Definição de Porte
export interface ApiResponseDefinicaoPorte<T> {
  success: boolean;
  message: string;
  data?: T;
}
