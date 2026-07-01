import axios from "axios";
import type { FotoVeiculo, Veiculo } from "@/types/veiculo";
import { BASE_URL } from "@/config/config";

/**
 * Upload de uma foto para o veículo via multipart/form-data.
 * Usa o axios cru (sem axiosInstance) porque o interceptor global
 * sobrescreve Content-Type para application/json, o que quebra o multipart.
 */
export async function uploadFotoVeiculo(
  veiculoId: number,
  file: File,
): Promise<FotoVeiculo> {
  const token = (() => {
    try {
      if (typeof window === "undefined") return "";
      return JSON.parse(localStorage.getItem("user") || "{}")?.token ?? "";
    } catch {
      return "";
    }
  })();

  const formData = new FormData();
  formData.append("file", file);

  const { data } = await axios.post<FotoVeiculo>(
    `${BASE_URL}/veiculos/${veiculoId}/fotos`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        // Não definir Content-Type aqui — o axios seta multipart/form-data
        // com boundary correto automaticamente ao receber FormData.
      },
    },
  );
  return data;
}

export const STATUS_LABELS: Record<string, string> = {
  DISPONIVEL: "Disponível",
  RESERVADO: "Reservado",
  EM_NEGOCIACAO: "Em negociação",
  EM_PREPARACAO: "Em preparação",
  VENDIDO: "Vendido",
  INATIVO: "Inativo",
};

export const STATUS_OPTIONS = [
  "DISPONIVEL",
  "RESERVADO",
  "EM_NEGOCIACAO",
  "EM_PREPARACAO",
  "VENDIDO",
  "INATIVO",
];

export const COMBUSTIVEL_LABELS: Record<string, string> = {
  GASOLINA: "Gasolina",
  ETANOL: "Etanol",
  FLEX: "Flex",
  DIESEL: "Diesel",
  GNV: "GNV",
  ELETRICO: "Elétrico",
  HIBRIDO: "Híbrido",
};

export const CAMBIO_LABELS: Record<string, string> = {
  MANUAL: "Manual",
  AUTOMATICO: "Automático",
  CVT: "CVT",
  DCT: "DCT",
  AUTOMATIZADO: "Automatizado",
};

export const CATEGORIA_OPTIONS = [
  "Hatch",
  "Sedã",
  "SUV",
  "Picape",
  "Utilitário",
  "Cupê",
  "Conversível",
  "Minivan",
];

/** Formata um número como moeda brasileira (R$). */
export function formatBRL(valor?: number | null): string {
  if (valor === null || valor === undefined || Number.isNaN(valor)) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(valor);
}

/** Formata quilometragem no padrão brasileiro (42.300 km). */
export function formatKm(km?: number | null): string {
  if (km === null || km === undefined || Number.isNaN(km)) return "—";
  return `${new Intl.NumberFormat("pt-BR").format(km)} km`;
}

/** Formata uma data ISO para o padrão brasileiro (dd/mm/aaaa). */
export function formatData(data?: string | null): string {
  if (!data) return "—";
  const d = new Date(data);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function combustivelLabel(value?: string): string {
  if (!value) return "—";
  return COMBUSTIVEL_LABELS[value] ?? value;
}

export function cambioLabel(value?: string): string {
  if (!value) return "—";
  return CAMBIO_LABELS[value] ?? value;
}

export function statusLabel(value?: string): string {
  if (!value) return "—";
  return STATUS_LABELS[value] ?? value;
}

/**
 * Normaliza a resposta da API (que hoje expõe um subconjunto dos campos)
 * para a interface rica de `Veiculo` usada na tela, com fallbacks seguros.
 */
export function mapVeiculo(raw: any): Veiculo {
  return {
    id: raw.id,
    marca: raw.marca ?? "",
    modelo: raw.modelo ?? "",
    versao: raw.versao ?? "",
    anoFabricacao: raw.anoFabricacao ?? raw.anoModelo ?? 0,
    anoModelo: raw.anoModelo ?? raw.anoFabricacao ?? 0,
    placa: raw.placa ?? "",
    renavam: raw.renavam ?? undefined,
    chassi: raw.chassi ?? undefined,
    cor: raw.cor ?? "",
    categoria: raw.categoria ?? undefined,
    combustivel: raw.combustivel ?? undefined,
    cambio: raw.cambio ?? undefined,
    motor: raw.motor ?? undefined,
    potencia: raw.potencia ?? undefined,
    quilometragem: raw.quilometragem ?? 0,
    portas: raw.portas ?? undefined,
    cidade: raw.cidade ?? undefined,
    estado: raw.estado ?? undefined,
    valor: raw.valor ?? raw.precoVenda ?? 0,
    valorCompra: raw.precoCompra != null ? Number(raw.precoCompra) : undefined,
    valorFipe: raw.valorFipe ?? null,
    descricao: raw.descricao ?? undefined,
    status: raw.status ?? "DISPONIVEL",
    destaque: Boolean(raw.destaque),
    aceitaTroca: raw.aceitaTroca ?? undefined,
    blindado: raw.blindado ?? undefined,
    unicoDono: raw.unicoDono ?? undefined,
    ipvaPago: raw.ipvaPago ?? undefined,
    licenciado: raw.licenciado ?? undefined,
    garantia: raw.garantia ?? undefined,
    revisado: raw.revisado ?? undefined,
    fotoPrincipal: raw.fotoPrincipal ?? null,
    dataCadastro: raw.dataCadastro ?? raw.dataEntrada ?? undefined,
    dataAtualizacao: raw.dataAtualizacao ?? undefined,
  };
}
