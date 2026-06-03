import axiosInstance from './axiosInstance';
import { getUserLocalStorage } from '@/store/userLocalStorage';
import { 
  Postagem, 
  CriarPostagemRequest, 
  FiltroPostagem, 
  PostagemResponse 
} from '@/types/types-postagem';

class PostagemService {

  // Listar postagens públicas (sem autenticação)
  async listarPublicas(filtros?: FiltroPostagem): Promise<PostagemResponse> {
    const params = new URLSearchParams();
    
    if (filtros?.categoria) params.append('categoria', filtros.categoria);
    if (filtros?.busca) params.append('busca', filtros.busca);
    if (filtros?.page !== undefined) params.append('page', filtros.page.toString());
    if (filtros?.size !== undefined) params.append('size', filtros.size.toString());

    const response = await axiosInstance.get(`/api/postagens/publicas?${params.toString()}`);
    return response.data;
  }

  // Listar todas as postagens (admin)
  async listarTodas(filtros?: FiltroPostagem): Promise<PostagemResponse> {
    const params = new URLSearchParams();
    
    if (filtros?.categoria) params.append('categoria', filtros.categoria);
    if (filtros?.busca) params.append('busca', filtros.busca);
    if (filtros?.ativa !== undefined) params.append('ativa', filtros.ativa.toString());
    if (filtros?.page !== undefined) params.append('page', filtros.page.toString());
    if (filtros?.size !== undefined) params.append('size', filtros.size.toString());
    
    const response = await axiosInstance.get(`/api/postagens/admin?${params.toString()}`);
    
    return response.data;
  }

  // Buscar postagem por ID para edição (admin - não incrementa visualizações)
  async buscarPorId(id: number): Promise<Postagem> {
    const response = await axiosInstance.get(`/api/postagens/admin/${id}`);
    return response.data;
  }

  // Buscar postagem por ID público (incrementa visualizações)
  async buscarPorIdPublico(id: number): Promise<Postagem> {
    const response = await axiosInstance.get(`/api/postagens/publicas/${id}`);
    return response.data;
  }

  // Criar nova postagem
  async criar(postagem: CriarPostagemRequest): Promise<Postagem> {
    const response = await axiosInstance.post('/api/postagens', postagem);
    return response.data;
  }

  // Atualizar postagem
  async atualizar(id: number, postagem: Partial<CriarPostagemRequest>): Promise<Postagem> {
    const response = await axiosInstance.put(`/api/postagens/${id}`, postagem);
    return response.data;
  }

  // Deletar postagem
  async deletar(id: number): Promise<void> {
    await axiosInstance.delete(`/api/postagens/${id}`);
  }

  // Alternar status (ativa/inativa)
  async alternarStatus(id: number): Promise<Postagem> {
    const response = await axiosInstance.patch(`/api/postagens/${id}/status`, {});
    return response.data;
  }

  // Incrementar visualizações
  async incrementarVisualizacoes(id: number): Promise<void> {
    // Usa o endpoint público que já incrementa as visualizações
    await axiosInstance.get(`/api/postagens/publicas/${id}`);
  }

  // Upload de anexo
  async uploadAnexo(id: number, file: File): Promise<Postagem> {
    const formData = new FormData();
    formData.append('file', file);

    const user = getUserLocalStorage();
    const response = await axiosInstance.post(`/api/postagens/${id}/anexos`, formData, {
      headers: {
        Authorization: `Bearer ${user?.token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Remover anexo
  async removerAnexo(postagemId: number, anexoId: number): Promise<void> {
    await axiosInstance.delete(`/api/postagens/${postagemId}/anexos/${anexoId}`);
  }

  // Buscar postagens em destaque
  async buscarDestaque(): Promise<Postagem[]> {
    const response = await axiosInstance.get('/api/postagens/destaque');
    return response.data;
  }

  // Obter estatísticas
  async obterEstatisticas(): Promise<{
    totalPostagens: number;
    postagensAtivas: number;
    postagensInativas: number;
    totalVisualizacoes: number;
  }> {
    const response = await axiosInstance.get('/api/postagens/stats');
    return response.data;
  }

  // Buscar postagens por autor
  async buscarPorAutor(autorId: number, page = 0, size = 10): Promise<PostagemResponse> {
    const response = await axiosInstance.get(`/api/postagens/autor/${autorId}?page=${page}&size=${size}`);
    return response.data;
  }

  // Listar categorias
  async listarCategorias(): Promise<string[]> {
    const response = await axiosInstance.get('/api/postagens/categorias');
    return response.data;
  }

  // Debug - verificar roles do usuário
  async debugUserRoles(): Promise<{
    username: string;
    authorities: string[];
    principal: unknown;
  }> {
    const response = await axiosInstance.get('/api/postagens/debug/user-roles');
    return response.data;
  }

  // ==================== MÉTODOS ESPECÍFICOS PARA FAQ ====================

  // Listar FAQ públicas
  async listarFAQ(filtros?: { busca?: string; page?: number; size?: number }): Promise<PostagemResponse> {
    const params = new URLSearchParams();
    
    if (filtros?.busca) params.append('busca', filtros.busca);
    if (filtros?.page !== undefined) params.append('page', filtros.page.toString());
    if (filtros?.size !== undefined) params.append('size', filtros.size.toString());

    const response = await axiosInstance.get(`/api/postagens/faq?${params.toString()}`);
    return response.data;
  }

  // Buscar FAQ em destaque (para página institucional)
  async buscarFAQDestaque(): Promise<Postagem[]> {
    // Temporariamente usar o endpoint que funciona e filtrar no frontend
    const response = await axiosInstance.get('/api/postagens/faq?size=50');
    const faqsData: PostagemResponse = response.data;
    
    // Filtrar apenas as que estão em destaque
    return faqsData.content.filter(faq => faq.destaque === true).slice(0, 5);
  }

  // Criar FAQ (usando o método geral de postagem com categoria FAQ)
  async criarFAQ(faq: { pergunta: string; resposta: string; destaque: boolean; ativa: boolean }): Promise<Postagem> {
    const postagemData: CriarPostagemRequest = {
      titulo: faq.pergunta,
      conteudo: faq.resposta,
      categoria: 'FAQ',
      destaque: faq.destaque,
      ativa: faq.ativa
    };

    return this.criar(postagemData);
  }
}

export const postagemService = new PostagemService();
export default postagemService;
