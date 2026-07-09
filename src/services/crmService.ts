import axios from "axios";
import axiosInstance from "@/services/axiosInstance";
import { BASE_URL } from "@/config/config";
import type {
  Avaliacao,
  DashboardResumo,
  Despesa,
  EstoqueAnalitico,
  FluxoCaixa,
  Lead,
  OrigemLead,
  RelatorioGiro,
  StatusAvaliacao,
  StatusLead,
  Venda,
  VendaPorMes,
  VendaPorVendedor,
  Vendedor,
  VeiculoVisualizado,
} from "@/types/crm";

/* ── Leads ─────────────────────────────────────────────────────── */

export interface NovoLead {
  nome: string;
  email?: string;
  telefone?: string;
  mensagem?: string;
  origem: OrigemLead;
  veiculoId?: number;
}

/** Criação pública de lead (não exige token). */
export async function criarLead(lead: NovoLead): Promise<Lead> {
  const { data } = await axios.post<Lead>(`${BASE_URL}/leads`, lead);
  return data;
}

export async function listarLeads(status?: StatusLead): Promise<Lead[]> {
  const { data } = await axiosInstance.get<Lead[]>("/leads", {
    params: status ? { status } : undefined,
  });
  return data ?? [];
}

export async function atualizarLead(
  id: number,
  payload: { status?: StatusLead; vendedorId?: number },
): Promise<Lead> {
  const { data } = await axiosInstance.patch<Lead>(`/leads/${id}`, payload);
  return data;
}

export async function excluirLead(id: number): Promise<void> {
  await axiosInstance.delete(`/leads/${id}`);
}

/* ── Vendedores ────────────────────────────────────────────────── */

export async function listarVendedores(somenteAtivos = false): Promise<Vendedor[]> {
  const { data } = await axiosInstance.get<Vendedor[]>("/vendedores", {
    params: { somenteAtivos },
  });
  return data ?? [];
}

export async function salvarVendedor(
  vendedor: Omit<Vendedor, "id"> & { id?: number },
): Promise<Vendedor> {
  if (vendedor.id) {
    const { data } = await axiosInstance.put<Vendedor>(`/vendedores/${vendedor.id}`, vendedor);
    return data;
  }
  const { data } = await axiosInstance.post<Vendedor>("/vendedores", vendedor);
  return data;
}

export async function excluirVendedor(id: number): Promise<void> {
  await axiosInstance.delete(`/vendedores/${id}`);
}

/* ── Vendas ────────────────────────────────────────────────────── */

export interface NovaVenda {
  veiculoId: number;
  vendedorId?: number;
  valorVenda: number;
  dataVenda?: string;
  nomeComprador?: string;
  observacao?: string;
}

export async function listarVendas(): Promise<Venda[]> {
  const { data } = await axiosInstance.get<Venda[]>("/vendas");
  return data ?? [];
}

export async function registrarVenda(venda: NovaVenda): Promise<Venda> {
  const { data } = await axiosInstance.post<Venda>("/vendas", venda);
  return data;
}

export async function excluirVenda(id: number): Promise<void> {
  await axiosInstance.delete(`/vendas/${id}`);
}

/* ── Despesas ──────────────────────────────────────────────────── */

export async function listarDespesas(veiculoId?: number): Promise<Despesa[]> {
  const { data } = await axiosInstance.get<Despesa[]>("/despesas", {
    params: veiculoId ? { veiculoId } : undefined,
  });
  return data ?? [];
}

export async function salvarDespesa(
  despesa: Omit<Despesa, "id" | "veiculoDescricao"> & { id?: number },
): Promise<Despesa> {
  if (despesa.id) {
    const { data } = await axiosInstance.put<Despesa>(`/despesas/${despesa.id}`, despesa);
    return data;
  }
  const { data } = await axiosInstance.post<Despesa>("/despesas", despesa);
  return data;
}

export async function excluirDespesa(id: number): Promise<void> {
  await axiosInstance.delete(`/despesas/${id}`);
}

/* ── Avaliações de usados ──────────────────────────────────────── */

export interface NovaAvaliacao {
  nome: string;
  email?: string;
  telefone?: string;
  marca: string;
  modelo: string;
  versao?: string;
  anoModelo?: number;
  quilometragem?: number;
  valorPretendido?: number;
  descricao?: string;
  fotos: File[];
}

/** Envio público (multipart) da avaliação de carro usado. */
export async function enviarAvaliacao(avaliacao: NovaAvaliacao): Promise<Avaliacao> {
  const formData = new FormData();
  formData.append("nome", avaliacao.nome);
  if (avaliacao.email) formData.append("email", avaliacao.email);
  if (avaliacao.telefone) formData.append("telefone", avaliacao.telefone);
  formData.append("marca", avaliacao.marca);
  formData.append("modelo", avaliacao.modelo);
  if (avaliacao.versao) formData.append("versao", avaliacao.versao);
  if (avaliacao.anoModelo) formData.append("anoModelo", String(avaliacao.anoModelo));
  if (avaliacao.quilometragem) formData.append("quilometragem", String(avaliacao.quilometragem));
  if (avaliacao.valorPretendido) formData.append("valorPretendido", String(avaliacao.valorPretendido));
  if (avaliacao.descricao) formData.append("descricao", avaliacao.descricao);
  avaliacao.fotos.forEach((foto) => formData.append("fotos", foto));

  // axios cru: multipart não pode passar pelo interceptor que força JSON
  const { data } = await axios.post<Avaliacao>(`${BASE_URL}/avaliacoes`, formData);
  return data;
}

export async function listarAvaliacoes(): Promise<Avaliacao[]> {
  const { data } = await axiosInstance.get<Avaliacao[]>("/avaliacoes");
  return data ?? [];
}

export async function atualizarStatusAvaliacao(
  id: number,
  status: StatusAvaliacao,
): Promise<Avaliacao> {
  const { data } = await axiosInstance.patch<Avaliacao>(`/avaliacoes/${id}/status`, { status });
  return data;
}

export async function excluirAvaliacao(id: number): Promise<void> {
  await axiosInstance.delete(`/avaliacoes/${id}`);
}

/* ── Dashboard / relatórios ────────────────────────────────────── */

export async function getDashboardResumo(): Promise<DashboardResumo> {
  const { data } = await axiosInstance.get<DashboardResumo>("/dashboard/resumo");
  return data;
}

export async function getVendasPorMes(meses = 12): Promise<VendaPorMes[]> {
  const { data } = await axiosInstance.get<VendaPorMes[]>("/dashboard/vendas-por-mes", {
    params: { meses },
  });
  return data ?? [];
}

export async function getVendasPorVendedor(): Promise<VendaPorVendedor[]> {
  const { data } = await axiosInstance.get<VendaPorVendedor[]>("/dashboard/vendas-por-vendedor");
  return data ?? [];
}

export async function getMaisVisualizados(limite = 10): Promise<VeiculoVisualizado[]> {
  const { data } = await axiosInstance.get<VeiculoVisualizado[]>("/dashboard/mais-visualizados", {
    params: { limite },
  });
  return data ?? [];
}

export async function getFluxoCaixa(inicio?: string, fim?: string): Promise<FluxoCaixa> {
  const { data } = await axiosInstance.get<FluxoCaixa>("/dashboard/fluxo-caixa", {
    params: { inicio, fim },
  });
  return data;
}

export async function getEstoqueAnalitico(): Promise<EstoqueAnalitico[]> {
  const { data } = await axiosInstance.get<EstoqueAnalitico[]>("/dashboard/estoque-analitico");
  return data ?? [];
}

export async function getRelatorioGiro(): Promise<RelatorioGiro> {
  const { data } = await axiosInstance.get<RelatorioGiro>("/dashboard/giro");
  return data;
}

/** Registra visualização pública de um veículo (fire-and-forget). */
export function registrarVisualizacao(veiculoId: number): void {
  axios.patch(`${BASE_URL}/veiculos/${veiculoId}/visualizar`).catch(() => {});
}
