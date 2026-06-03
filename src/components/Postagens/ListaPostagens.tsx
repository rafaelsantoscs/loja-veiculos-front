"use client";
import { useState, useEffect } from 'react';
import { Postagem, CategoriaPostagem } from '@/types/types-postagem';
import postagemService from '@/services/postagemService';
import PostagemCard from './PostagemCard';
import { FaSpinner } from 'react-icons/fa';

interface ListaPostagensProps {
  busca?: string;
  categoria?: CategoriaPostagem;
  isPublica?: boolean;
  isAdmin?: boolean;
}

const ListaPostagens: React.FC<ListaPostagensProps> = ({ 
  busca, 
  categoria, 
  isPublica = false,
  isAdmin = false 
}) => {
  const [postagens, setPostagens] = useState<Postagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const size = 10;

  const carregarPostagens = async () => {
    try {
      setLoading(true);
      
      const filtros = {
        busca,
        categoria,
        page,
        size,
        ...(isAdmin && { ativa: undefined }) // Admin vê todas
      };

      const response = isPublica 
        ? await postagemService.listarPublicas(filtros)
        : await postagemService.listarTodas(filtros);

      setPostagens(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error) {
      console.error('Erro ao carregar postagens:', error);
      setPostagens([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarPostagens();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busca, categoria, page, isPublica, isAdmin]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <FaSpinner className="animate-spin text-3xl text-blue-500" />
        <span className="ml-3 text-lg">Carregando postagens...</span>
      </div>
    );
  }

  if (postagens.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📭</div>
        <h3 className="text-xl font-semibold mb-2 text-slate-700 dark:text-slate-300">
          Nenhuma postagem encontrada
        </h3>
        <p className="text-slate-500 dark:text-slate-400">
          {busca || categoria 
            ? "Tente ajustar os filtros para encontrar o que procura."
            : "Ainda não há postagens publicadas."
          }
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Resultados */}
      <div className="mb-6">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Encontradas {totalElements} postagem{totalElements !== 1 ? 's' : ''}
          {busca && ` para "${busca}"`}
          {categoria && ` na categoria "${categoria}"`}
        </p>
      </div>

      {/* Grid de postagens */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 font-semibold">
        {postagens.map((postagem) => (
          <PostagemCard 
            key={postagem.id} 
            postagem={postagem}
            isAdmin={isAdmin}
            isPublica={isPublica}
            onUpdate={carregarPostagens}
          />
        ))}
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="mt-12 flex justify-center">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 0}
              className="px-4 py-2 rounded-md bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-700"
            >
              Anterior
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(0, Math.min(page - 2 + i, totalPages - 1));
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-4 py-2 rounded-md border ${
                    page === pageNum
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700'
                  }`}
                >
                  {pageNum + 1}
                </button>
              );
            })}

            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages - 1}
              className="px-4 py-2 rounded-md bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-700"
            >
              Próximo
            </button>
          </div>
        </div>
      )}

      {/* Info da paginação */}
      <div className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
        Página {page + 1} de {totalPages} • {totalElements} total
      </div>
    </div>
  );
};

export default ListaPostagens;
