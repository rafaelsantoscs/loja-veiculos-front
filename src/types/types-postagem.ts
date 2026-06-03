export interface Postagem {
  id: number;
  titulo: string;
  conteudo: string; // HTML do rich editor
  resumo?: string;
  autor: {
    id: number;
    nome: string;
    nomeCompleto: string;
  };
  dataPublicacao: string;
  dataAtualizacao?: string;
  categoria: CategoriaPostagem;
  ativa: boolean;
  destaque: boolean;
  visualizacoes: number;
  anexos?: Anexo[];
}

export interface Anexo {
  id: number;
  nome: string;
  url: string;
  tipo: 'PDF' | 'IMAGE' | 'DOC';
  tamanho: number;
}

export type CategoriaPostagem = 'INFORMATIVO' | 'AVISO' | 'COMUNICADO' | 'NOTICIA' | 'FAQ';

export interface CriarPostagemRequest {
  titulo: string;
  conteudo: string;
  resumo?: string;
  categoria: CategoriaPostagem;
  destaque: boolean;
  ativa: boolean;
}

export interface FiltroPostagem {
  categoria?: CategoriaPostagem;
  busca?: string;
  ativa?: boolean;
  page?: number;
  size?: number;
}

export interface PostagemResponse {
  content: Postagem[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// Interfaces específicas para FAQ
export interface FAQ {
  id: number;
  pergunta: string; // mapeado do campo 'titulo'
  resposta: string; // mapeado do campo 'conteudo'
  categoria: 'FAQ';
  ativa: boolean;
  destaque: boolean;
  visualizacoes: number;
  dataPublicacao: string;
  autor: {
    id: number;
    nome: string;
    nomeCompleto: string;
  };
}

export interface CriarFAQRequest {
  pergunta: string;
  resposta: string;
  destaque: boolean;
  ativa: boolean;
}

export interface FiltroFAQ {
  busca?: string;
  page?: number;
  size?: number;
}
