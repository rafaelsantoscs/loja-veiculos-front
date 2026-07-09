export type StatusVeiculo =
  | "DISPONIVEL"
  | "RESERVADO"
  | "EM_NEGOCIACAO"
  | "EM_PREPARACAO"
  | "VENDIDO"
  | "INATIVO";

export type Combustivel =
  | "GASOLINA"
  | "ETANOL"
  | "FLEX"
  | "DIESEL"
  | "GNV"
  | "ELETRICO"
  | "HIBRIDO";

export type Cambio =
  | "MANUAL"
  | "AUTOMATICO"
  | "CVT"
  | "DCT"
  | "AUTOMATIZADO";

export type OpcionalVeiculo =
  | "AR_CONDICIONADO"
  | "DIRECAO_HIDRAULICA"
  | "DIRECAO_ELETRICA"
  | "VIDRO_ELETRICO"
  | "TRAVA_ELETRICA"
  | "AIRBAG"
  | "FREIO_ABS"
  | "CAMERA_RE"
  | "SENSOR_ESTACIONAMENTO"
  | "CENTRAL_MULTIMIDIA"
  | "BANCO_COURO"
  | "TETO_SOLAR"
  | "RODAS_LIGA_LEVE"
  | "PILOTO_AUTOMATICO"
  | "CONTROLE_TRACAO"
  | "START_STOP"
  | "FAROL_LED"
  | "COMPUTADOR_BORDO"
  | "BLUETOOTH"
  | "GPS"
  | "ALARME"
  | "ENGATE_REBOQUE";

export interface FotoVeiculo {
  id: number;
  url: string;
  ordem: number;
  principal: boolean;
}

export interface Veiculo {
  id: number;
  marca: string;
  modelo: string;
  versao: string;
  anoFabricacao: number;
  anoModelo: number;
  placa: string;
  renavam?: string;
  chassi?: string;
  cor: string;
  categoria?: string;
  combustivel?: Combustivel | string;
  cambio?: Cambio | string;
  motor?: string;
  potencia?: string;
  quilometragem: number;
  portas?: number;
  cidade?: string;
  estado?: string;
  valor: number;
  valorCompra?: number;
  valorFipe?: number | null;
  descricao?: string;
  status: StatusVeiculo | string;
  destaque: boolean;
  aceitaTroca?: boolean;
  blindado?: boolean;
  unicoDono?: boolean;
  ipvaPago?: boolean;
  licenciado?: boolean;
  garantia?: boolean;
  revisado?: boolean;
  fotoPrincipal?: string | null;
  dataCadastro?: string;
  dataAtualizacao?: string;
  visualizacoes?: number;
  opcionais?: OpcionalVeiculo[];
}

/** Filtros aplicáveis à listagem de veículos. */
export interface VeiculoFiltros {
  busca: string;
  marca: string;
  modelo: string;
  ano: string;
  categoria: string;
  combustivel: string;
  cambio: string;
  cidade: string;
  status: string;
  destaque: string;
  precoInicial: string;
  precoFinal: string;
}

export type OrdenacaoCampo =
  | "valor"
  | "anoModelo"
  | "marca"
  | "modelo"
  | "quilometragem"
  | "dataCadastro";

export type OrdenacaoDirecao = "asc" | "desc";

export interface Ordenacao {
  campo: OrdenacaoCampo;
  direcao: OrdenacaoDirecao;
}
