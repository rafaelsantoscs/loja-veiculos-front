'use client';

import React, { useState, useEffect } from 'react';
import DefaultLayout from '@/components/Layouts/DefaultLayout';
import { getUserLocalStorage } from '@/store/userLocalStorage';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaEye, FaToggleOn, FaToggleOff, FaNewspaper } from 'react-icons/fa';
import postagemService from '@/services/postagemService';
import { Postagem, CategoriaPostagem } from '@/types/types-postagem';

const GerenciarPostagens: React.FC = () => {
  const [postagens, setPostagens] = useState<Postagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    categoria: '' as CategoriaPostagem | '',
    ativa: '' as 'true' | 'false' | '',
    busca: ''
  });
  const [pagina, setPagina] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [stats, setStats] = useState({
    totalPostagens: 0,
    postagensAtivas: 0,
    postagensInativas: 0,
    totalVisualizacoes: 0
  });

  const user = getUserLocalStorage();
  const router = useRouter();

  const isAdmin = user?.roles?.includes('ROLE_ADMIN') || user?.roles?.includes('ROLE_ADMINISTRADOR');

  useEffect(() => {
    // Removida validação de admin - qualquer usuário logado pode acessar
    // if (!isAdmin) {
    //   toast.error('Acesso negado. Apenas administradores podem acessar esta página.');
    //   router.push('/dashboard');
    //   return;
    // }
    carregarPostagens();
    carregarEstatisticas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, router, pagina, filtros]);

  const carregarPostagens = async () => {
    try {
      setLoading(true);
      
      // Tentar primeiro o endpoint de admin
      let response;
      try {
        response = await postagemService.listarTodas({
          categoria: filtros.categoria || undefined,
          ativa: filtros.ativa ? filtros.ativa === 'true' : undefined,
          busca: filtros.busca || undefined,
          page: pagina,
          size: 10
        });
      } catch (adminError) {
        // Fallback para endpoint público para teste
        response = await postagemService.listarPublicas({
          categoria: filtros.categoria || undefined,
          busca: filtros.busca || undefined,
          page: pagina,
          size: 10
        });
      }

      // Verificar se a resposta tem a estrutura correta
      if (response && response.content) {
        setPostagens(response.content);
        setTotalPaginas(response.totalPages || 0);
      } else {
        // Fallback: se a resposta for um array direto
        const postagens = Array.isArray(response) ? response : [];
        setPostagens(postagens);
        setTotalPaginas(1);
      }
    } catch (error: unknown) {
      console.error('Erro ao carregar postagens:', error);
      
      // Verificar se é erro axios e status 404
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 404) {
        setPostagens([]);
        setTotalPaginas(0);
        toast.info('Nenhuma postagem encontrada');
      } else {
        toast.error('Erro ao carregar postagens');
        setPostagens([]);
        setTotalPaginas(0);
      }
    } finally {
      setLoading(false);
    }
  };

  const carregarEstatisticas = async () => {
    try {
      const statsData = await postagemService.obterEstatisticas();
      setStats(statsData);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const alternarStatus = async (id: number) => {
    try {
      await postagemService.alternarStatus(id);
      toast.success('Status da postagem alterado com sucesso!');
      carregarPostagens();
      carregarEstatisticas();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast.error('Erro ao alterar status da postagem');
    }
  };

  const deletarPostagem = async (id: number) => {
    if (!confirm('Tem certeza que deseja deletar esta postagem?')) {
      return;
    }

    try {
      await postagemService.deletar(id);
      toast.success('Postagem deletada com sucesso!');
      carregarPostagens();
      carregarEstatisticas();
    } catch (error) {
      console.error('Erro ao deletar postagem:', error);
      toast.error('Erro ao deletar postagem');
    }
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-md2 font-semibold text-black dark:text-white">
            Gerenciar Postagens
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => router.push('/admin/postagens/nova')}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-white hover:bg-opacity-90"
            >
              <FaPlus className="h-4 w-4" />
              Nova Postagem
            </button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="flex items-center">
              <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
                <FaNewspaper className="fill-primary dark:fill-white" />
              </div>
              <div className="ml-4">
                <div className="text-title-lg font-bold text-black dark:text-white">
                  {stats.totalPostagens}
                </div>
                <span className="text-sm font-medium">Total de Postagens</span>
              </div>
            </div>
          </div>

          <div className="rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="flex items-center">
              <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full  dark:bg-meta-4">
                <FaToggleOn className="fill-success dark:fill-white" />
              </div>
              <div className="ml-4">
                <div className="text-title-lg font-bold text-black dark:text-white">
                  {stats.postagensAtivas}
                </div>
                <span className="text-sm font-medium">Postagens Ativas</span>
              </div>
            </div>
          </div>

          <div className="rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="flex items-center">
              <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full  dark:bg-meta-4">
                <FaToggleOff className="fill-danger dark:fill-white" />
              </div>
              <div className="ml-4">
                <div className="text-title-lg font-bold text-black dark:text-white">
                  {stats.postagensInativas}
                </div>
                <span className="text-sm font-medium">Postagens Inativas</span>
              </div>
            </div>
          </div>

          <div className="rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="flex items-center">
              <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full  dark:bg-meta-4">
                <FaEye className="fill-blue-600 dark:fill-white" />
              </div>
              <div className="ml-4">
                <div className="text-title-lg font-bold text-black dark:text-white">
                  {stats.totalVisualizacoes}
                </div>
                <span className="text-sm font-medium">Total de Visualizações</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="mb-6 rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                Categoria
              </label>
              <select
                value={filtros.categoria}
                onChange={(e) => setFiltros({ ...filtros, categoria: e.target.value as CategoriaPostagem | '' })}
                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-2 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              >
                <option value="">Todas as categorias</option>
                <option value="INFORMATIVO">Informativo</option>
                <option value="AVISO">Aviso</option>
                <option value="COMUNICADO">Comunicado</option>
                <option value="NOTICIA">Notícia</option>
                <option value="FAQ">Pergunta Frequente</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                Status
              </label>
              <select
                value={filtros.ativa}
                onChange={(e) => setFiltros({ ...filtros, ativa: e.target.value as 'true' | 'false' | '' })}
                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-2 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              >
                <option value="">Todos os status</option>
                <option value="true">Ativas</option>
                <option value="false">Inativas</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                Buscar
              </label>
              <input
                type="text"
                value={filtros.busca}
                onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
                placeholder="Título, conteúdo..."
                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-2 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setPagina(0)}
                className="w-full rounded bg-primary px-4 py-2 text-white hover:bg-opacity-90"
              >
                Filtrar
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Postagens */}
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="px-4 py-6 md:px-6 xl:px-7.5">
            <h4 className="text-xl font-semibold text-black dark:text-white">
              Postagens ({postagens.length})
            </h4>
          </div>

          <div className="grid grid-cols-6 border-t border-stroke px-4 py-4.5 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5">
            <div className="col-span-2 flex items-center">
              <p className="font-medium">Título</p>
            </div>
            <div className="col-span-1 hidden items-center sm:flex">
              <p className="font-medium">Categoria</p>
            </div>
            <div className="col-span-1 flex items-center">
              <p className="font-medium">Status</p>
            </div>
            <div className="col-span-1 flex items-center">
              <p className="font-medium">Visualizações</p>
            </div>
            <div className="col-span-1 hidden items-center sm:flex">
              <p className="font-medium">Data</p>
            </div>
            <div className="col-span-1 flex items-center">
              <p className="font-medium">Ações</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-6">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
            </div>
          ) : postagens.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FaNewspaper className="mb-4 h-12 w-12 text-gray-400" />
              <p className="mb-2 text-lg font-medium text-gray-500">Nenhuma postagem encontrada</p>
              <p className="text-sm text-gray-400">
                {filtros.busca || filtros.categoria || filtros.ativa 
                  ? 'Tente ajustar os filtros ou crie uma nova postagem'
                  : 'O sistema de postagens está funcionando! Comece criando sua primeira postagem.'
                }
              </p>
              <button
                onClick={() => router.push('/admin/postagens/nova')}
                className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-white hover:bg-opacity-90"
              >
                <FaPlus className="h-4 w-4" />
                Nova Postagem
              </button>
              <p className="mt-4 text-xs text-gray-400">
                📍 Backend: {filtros.busca || filtros.categoria ? 'Filtros aplicados' : 'Aguardando primeiras postagens'}
              </p>
            </div>
          ) : (
            postagens.map((postagem) => (
              <div
                key={postagem.id}
                className="grid grid-cols-6 border-t border-stroke px-4 py-4.5 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5"
              >
                <div className="col-span-2 flex items-center">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium text-black dark:text-white">
                      {postagem.titulo}
                    </p>
                    {postagem.destaque && (
                      <span className="inline-flex rounded-full bg-warning bg-opacity-10 px-2 py-1 text-xs font-medium text-warning">
                        Destaque
                      </span>
                    )}
                  </div>
                </div>

                <div className="col-span-1 hidden items-center sm:flex">
                  <p className="text-sm text-black dark:text-white">
                    {postagem.categoria}
                  </p>
                </div>

                <div className="col-span-1 flex items-center">
                  <p
                    className={`inline-flex rounded-full bg-opacity-10 px-3 py-1 text-xs font-medium ${
                      postagem.ativa
                        ? 'bg-success text-success'
                        : 'bg-danger text-danger'
                    }`}
                  >
                    {postagem.ativa ? 'Ativa' : 'Inativa'}
                  </p>
                </div>

                <div className="col-span-1 flex items-center">
                  <p className="text-sm text-black dark:text-white">
                    {postagem.visualizacoes}
                  </p>
                </div>

                <div className="col-span-1 hidden items-center sm:flex">
                  <p className="text-sm text-black dark:text-white">
                    {formatarData(postagem.dataPublicacao)}
                  </p>
                </div>

                <div className="col-span-1 flex items-center gap-2">
                  <button
                    onClick={() => router.push(`/admin/postagens/editar/${postagem.id}`)}
                    className="hover:text-primary"
                    title="Editar"
                  >
                    <FaEdit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => alternarStatus(postagem.id)}
                    className={`${postagem.ativa ? 'hover:text-danger' : 'hover:text-success'}`}
                    title={postagem.ativa ? 'Desativar' : 'Ativar'}
                  >
                    {postagem.ativa ? (
                      <FaToggleOff className="h-4 w-4" />
                    ) : (
                      <FaToggleOn className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => deletarPostagem(postagem.id)}
                    className="hover:text-danger"
                    title="Deletar"
                  >
                    <FaTrash className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Paginação */}
        {totalPaginas > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              onClick={() => setPagina(pagina - 1)}
              disabled={pagina === 0}
              className="rounded bg-primary px-3 py-1 text-white disabled:bg-gray-400"
            >
              Anterior
            </button>
            <span className="text-sm">
              Página {pagina + 1} de {totalPaginas}
            </span>
            <button
              onClick={() => setPagina(pagina + 1)}
              disabled={pagina >= totalPaginas - 1}
              className="rounded bg-primary px-3 py-1 text-white disabled:bg-gray-400"
            >
              Próxima
            </button>
          </div>
        )}
      </div>
    </DefaultLayout>
  );
};

export default GerenciarPostagens;
