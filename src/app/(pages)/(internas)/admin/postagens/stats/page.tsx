'use client';

import React, { useState, useEffect } from 'react';
import DefaultLayout from '@/components/Layouts/DefaultLayout';
import { getUserLocalStorage } from '@/store/userLocalStorage';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaNewspaper, FaEye, FaToggleOn, FaToggleOff, FaCalendar, FaStar } from 'react-icons/fa';
import postagemService from '@/services/postagemService';
import { Postagem } from '@/types/types-postagem';

const EstatisticasPostagens: React.FC = () => {
  const [stats, setStats] = useState({
    totalPostagens: 0,
    postagensAtivas: 0,
    postagensInativas: 0,
    totalVisualizacoes: 0
  });
  const [postagensDestaque, setPostagensDestaque] = useState<Postagem[]>([]);
  const [postagensMaisVistas, setPostagensMaisVistas] = useState<Postagem[]>([]);
  const [loading, setLoading] = useState(true);

  const user = getUserLocalStorage();
  const router = useRouter();

  const isAdmin = user?.roles?.includes('ROLE_ADMIN') || user?.roles?.includes('ROLE_ADMINISTRADOR');

  useEffect(() => {
    if (!isAdmin) {
      toast.error('Acesso negado. Apenas administradores podem acessar esta página.');
      router.push('/dashboard');
      return;
    }
    carregarDados();
  }, [isAdmin, router]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      // Carregar estatísticas
      const statsData = await postagemService.obterEstatisticas();
      setStats(statsData);

      // Carregar postagens em destaque
      const destaqueData = await postagemService.buscarDestaque();
      setPostagensDestaque(destaqueData);

      // Simular postagens mais vistas (ordenar por visualizações)
      const todasPostagens = await postagemService.listarPublicas({});
      const maisVistas = todasPostagens.content
        .sort((a, b) => b.visualizacoes - a.visualizacoes)
        .slice(0, 5);
      setPostagensMaisVistas(maisVistas);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar estatísticas');
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
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
            Estatísticas das Postagens
          </h2>
          <button
            onClick={() => router.push('/admin/postagens')}
            className="inline-flex items-center gap-2 rounded-md bg-gray-500 px-4 py-2 text-white hover:bg-opacity-90"
          >
            <FaArrowLeft className="h-4 w-4" />
            Voltar
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
          </div>
        ) : (
          <>
            {/* Cards de Estatísticas */}
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="flex items-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
                    <FaNewspaper className="h-6 w-6 fill-primary dark:fill-white" />
                  </div>
                  <div className="ml-4">
                    <div className="text-title-xl font-bold text-black dark:text-white">
                      {stats.totalPostagens}
                    </div>
                    <span className="text-sm font-medium text-black dark:text-white">Total de Postagens</span>
                  </div>
                </div>
              </div>

              <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="flex items-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-meta-3 dark:bg-meta-4">
                    <FaToggleOn className="h-6 w-6 fill-success dark:fill-white" />
                  </div>
                  <div className="ml-4">
                    <div className="text-title-xl font-bold text-black dark:text-white">
                      {stats.postagensAtivas}
                    </div>
                    <span className="text-sm font-medium text-black dark:text-white">Postagens Ativas</span>
                  </div>
                </div>
              </div>

              <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="flex items-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-meta-7 dark:bg-meta-4">
                    <FaToggleOff className="h-6 w-6 fill-danger dark:fill-white" />
                  </div>
                  <div className="ml-4">
                    <div className="text-title-xl font-bold text-black dark:text-white">
                      {stats.postagensInativas}
                    </div>
                    <span className="text-sm font-medium text-black dark:text-white">Postagens Inativas</span>
                  </div>
                </div>
              </div>

              <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="flex items-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-meta-5 dark:bg-meta-4">
                    <FaEye className="h-6 w-6 fill-warning dark:fill-white" />
                  </div>
                  <div className="ml-4">
                    <div className="text-title-xl font-bold text-black dark:text-white">
                      {stats.totalVisualizacoes}
                    </div>
                    <span className="text-sm font-medium text-black dark:text-white">Total de Visualizações</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Grid com listas */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* Postagens em Destaque */}
              <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="border-b border-stroke px-6 py-4 dark:border-strokedark">
                  <h4 className="flex items-center gap-2 text-xl font-semibold text-black dark:text-white">
                    <FaStar className="h-5 w-5 text-warning" />
                    Postagens em Destaque
                  </h4>
                </div>
                <div className="p-6">
                  {postagensDestaque.length === 0 ? (
                    <p className="text-center text-gray-500">Nenhuma postagem em destaque</p>
                  ) : (
                    <div className="space-y-4">
                      {postagensDestaque.map((postagem) => (
                        <div
                          key={postagem.id}
                          className="flex items-start justify-between rounded-lg border border-stroke p-4 dark:border-strokedark"
                        >
                          <div className="flex-1">
                            <h5 className="font-medium text-black dark:text-white">
                              {postagem.titulo}
                            </h5>
                            <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <FaCalendar className="h-3 w-3" />
                                {formatarData(postagem.dataPublicacao)}
                              </span>
                              <span className="flex items-center gap-1">
                                <FaEye className="h-3 w-3" />
                                {postagem.visualizacoes} visualizações
                              </span>
                            </div>
                            <span className="mt-2 inline-block rounded-full bg-primary bg-opacity-10 px-2 py-1 text-xs font-medium text-primary">
                              {postagem.categoria}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Postagens Mais Vistas */}
              <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="border-b border-stroke px-6 py-4 dark:border-strokedark">
                  <h4 className="flex items-center gap-2 text-xl font-semibold text-black dark:text-white">
                    <FaEye className="h-5 w-5 text-warning" />
                    Postagens Mais Vistas
                  </h4>
                </div>
                <div className="p-6">
                  {postagensMaisVistas.length === 0 ? (
                    <p className="text-center text-gray-500">Nenhuma visualização registrada</p>
                  ) : (
                    <div className="space-y-4">
                      {postagensMaisVistas.map((postagem, index) => (
                        <div
                          key={postagem.id}
                          className="flex items-start justify-between rounded-lg border border-stroke p-4 dark:border-strokedark"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white text-sm font-bold">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <h5 className="font-medium text-black dark:text-white">
                                {postagem.titulo}
                              </h5>
                              <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                  <FaCalendar className="h-3 w-3" />
                                  {formatarData(postagem.dataPublicacao)}
                                </span>
                                <span className="font-semibold text-warning">
                                  {postagem.visualizacoes} visualizações
                                </span>
                              </div>
                              <span className="mt-2 inline-block rounded-full bg-success bg-opacity-10 px-2 py-1 text-xs font-medium text-success">
                                {postagem.categoria}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Resumo */}
            <div className="mt-8 rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
              <h4 className="mb-4 text-xl font-semibold text-black dark:text-white">
                Resumo Geral
              </h4>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {stats.postagensAtivas > 0 ? Math.round((stats.totalVisualizacoes / stats.postagensAtivas) * 100) / 100 : 0}
                  </div>
                  <div className="text-sm text-gray-500">Média de visualizações por postagem ativa</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-success">
                    {stats.totalPostagens > 0 ? Math.round((stats.postagensAtivas / stats.totalPostagens) * 100) : 0}%
                  </div>
                  <div className="text-sm text-gray-500">Taxa de postagens ativas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-warning">
                    {postagensDestaque.length}
                  </div>
                  <div className="text-sm text-gray-500">Postagens em destaque</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DefaultLayout>
  );
};

export default EstatisticasPostagens;
