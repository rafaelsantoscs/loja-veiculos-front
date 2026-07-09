/* ── Tipos do CRM / Gestão da Loja ─────────────────────────────── */

export type StatusLead =
  | "NOVO"
  | "EM_NEGOCIACAO"
  | "VISITA_AGENDADA"
  | "FINANCIAMENTO"
  | "VENDIDO"
  | "PERDIDO";

export type OrigemLead =
  | "WHATSAPP"
  | "EMAIL"
  | "PROPOSTA"
  | "VISITA"
  | "FINANCIAMENTO"
  | "AVALIACAO"
  | "OUTRO";

export type CategoriaDespesa =
  | "LAVAGEM"
  | "OFICINA"
  | "DOCUMENTACAO"
  | "MARKETING"
  | "COMBUSTIVEL"
  | "COMISSAO"
  | "OUTROS";

export type StatusAvaliacao =
  | "PENDENTE"
  | "EM_ANALISE"
  | "PROPOSTA_ENVIADA"
  | "ACEITA"
  | "RECUSADA";

export interface Lead {
  id: number;
  nome: string;
  email?: string | null;
  telefone?: string | null;
  mensagem?: string | null;
  origem: OrigemLead;
  status: StatusLead;
  veiculoId?: number | null;
  veiculoDescricao?: string | null;
  vendedorId?: number | null;
  vendedorNome?: string | null;
  dataCriacao?: string;
  dataAtualizacao?: string | null;
}

export interface Vendedor {
  id: number;
  nome: string;
  email?: string | null;
  telefone?: string | null;
  percentualComissao: number;
  ativo: boolean;
}

export interface Venda {
  id: number;
  veiculoId: number;
  veiculoDescricao?: string;
  vendedorId?: number | null;
  vendedorNome?: string | null;
  valorVenda: number;
  valorComissao?: number | null;
  precoCompra?: number | null;
  totalDespesas?: number | null;
  lucro?: number | null;
  dataVenda: string;
  nomeComprador?: string | null;
  observacao?: string | null;
}

export interface Despesa {
  id: number;
  categoria: CategoriaDespesa;
  descricao: string;
  valor: number;
  data: string;
  veiculoId?: number | null;
  veiculoDescricao?: string | null;
}

export interface Avaliacao {
  id: number;
  nome: string;
  email?: string | null;
  telefone?: string | null;
  marca: string;
  modelo: string;
  versao?: string | null;
  anoModelo?: number | null;
  quilometragem?: number | null;
  valorPretendido?: number | null;
  descricao?: string | null;
  status: StatusAvaliacao;
  dataEnvio?: string;
  fotos: string[];
}

/* ── Dashboard ─────────────────────────────────────────────────── */

export interface DashboardResumo {
  carrosEstoque: number;
  carrosVendidos: number;
  vendasMes: number;
  faturamentoMes: number;
  despesasMes: number;
  saldoMes: number;
  leadsRecebidos: number;
  leadsMes: number;
  conversaoVendas: number;
  valorEstoque: number;
}

export interface VendaPorMes {
  mes: string;
  quantidade: number;
  faturamento: number;
}

export interface VendaPorVendedor {
  vendedor: string;
  quantidade: number;
  faturamento: number;
  comissao: number;
}

export interface VeiculoVisualizado {
  veiculoId: number;
  descricao: string;
  visualizacoes: number;
  contatos: number;
  status: string;
}

export interface FluxoCaixaDia {
  data: string;
  entradas: number;
  saidas: number;
  saldo: number;
}

export interface FluxoCaixa {
  inicio: string;
  fim: string;
  totalEntradas: number;
  totalSaidas: number;
  saldo: number;
  saldoDiario: FluxoCaixaDia[];
  despesasPorCategoria: Record<string, number>;
}

export interface EstoqueAnalitico {
  veiculoId: number;
  descricao: string;
  status: string;
  dataEntrada?: string | null;
  precoCompra?: number | null;
  precoVenda?: number | null;
  visualizacoes: number;
  contatos: number;
  despesas: number;
  valorVenda?: number;
  lucro?: number;
  lucroPrevisto?: number;
  diasEmEstoque?: number;
  sugestao?: string;
  precoSugerido?: number;
}

export interface GiroModelo {
  modelo: string;
  quantidadeVendida: number;
  lucroTotal: number;
}

export interface RelatorioGiro {
  maisVendidos: GiroModelo[];
  maiorLucro: GiroModelo[];
  menorLucro: GiroModelo[];
  tempoMedioEstoqueDias: number;
}

/* ── Labels (pt-BR) ────────────────────────────────────────────── */

export const STATUS_LEAD_LABELS: Record<StatusLead, string> = {
  NOVO: "Novo",
  EM_NEGOCIACAO: "Em negociação",
  VISITA_AGENDADA: "Visita agendada",
  FINANCIAMENTO: "Financiamento",
  VENDIDO: "Vendido",
  PERDIDO: "Perdido",
};

export const ORIGEM_LEAD_LABELS: Record<OrigemLead, string> = {
  WHATSAPP: "WhatsApp",
  EMAIL: "E-mail",
  PROPOSTA: "Proposta",
  VISITA: "Visita",
  FINANCIAMENTO: "Financiamento",
  AVALIACAO: "Avaliação",
  OUTRO: "Outro",
};

export const CATEGORIA_DESPESA_LABELS: Record<CategoriaDespesa, string> = {
  LAVAGEM: "Lavagem",
  OFICINA: "Oficina",
  DOCUMENTACAO: "Documentação",
  MARKETING: "Marketing",
  COMBUSTIVEL: "Combustível",
  COMISSAO: "Comissão",
  OUTROS: "Outros",
};

export const STATUS_AVALIACAO_LABELS: Record<StatusAvaliacao, string> = {
  PENDENTE: "Pendente",
  EM_ANALISE: "Em análise",
  PROPOSTA_ENVIADA: "Proposta enviada",
  ACEITA: "Aceita",
  RECUSADA: "Recusada",
};
