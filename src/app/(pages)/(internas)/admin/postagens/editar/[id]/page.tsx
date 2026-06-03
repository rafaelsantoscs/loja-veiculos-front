'use client';

import React, { useState, useEffect } from 'react';
import DefaultLayout from '@/components/Layouts/DefaultLayout';
import { getUserLocalStorage } from '@/store/userLocalStorage';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { FaSave, FaArrowLeft } from 'react-icons/fa';
import postagemService from '@/services/postagemService';
import { CategoriaPostagem } from '@/types/types-postagem';
import TinyMCEEditor from '@/components/Editor/TinyMCEEditor';

const EditarPostagem: React.FC = () => {
  const [formData, setFormData] = useState({
    titulo: '',
    resumo: '',
    conteudo: '',
    categoria: 'INFORMATIVO' as CategoriaPostagem,
    ativa: true,
    destaque: false
  });
  const [loading, setLoading] = useState(false);
  const [carregandoPostagem, setCarregandoPostagem] = useState(true);

  const user = getUserLocalStorage();
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  // Limites dos campos baseados no banco de dados
  const LIMITS = {
    titulo: 255,
    resumo: 255,
    categoria: 255
  };

  // Função para renderizar contador de caracteres
  const renderCharacterCounter = (currentLength: number, maxLength: number) => {
    const remaining = maxLength - currentLength;
    const isNearLimit = remaining <= 20;
    const isOverLimit = remaining < 0;
    
    return (
      <div className={`text-sm mt-1 ${isOverLimit ? 'text-red-500' : isNearLimit ? 'text-yellow-500' : 'text-gray-500'}`}>
        {remaining >= 0 ? `${remaining} caracteres restantes` : `${Math.abs(remaining)} caracteres excedidos`}
      </div>
    );
  };

  const isAdmin = user?.roles?.includes('ROLE_ADMIN') || user?.roles?.includes('ROLE_ADMINISTRADOR');

  useEffect(() => {
    // Removida validação de admin - qualquer usuário logado pode acessar
    // if (!isAdmin) {
    //   toast.error('Acesso negado. Apenas administradores podem acessar esta página.');
    //   router.push('/dashboard');
    //   return;
    // }

    if (id) {
      carregarPostagem();
    }
  }, [isAdmin, router, id]); // eslint-disable-line react-hooks/exhaustive-deps

  const carregarPostagem = async () => {
    try {
      setCarregandoPostagem(true);
      const postagem = await postagemService.buscarPorId(Number(id));
      
      setFormData({
        titulo: postagem.titulo,
        resumo: postagem.resumo || '',
        conteudo: postagem.conteudo,
        categoria: postagem.categoria,
        ativa: postagem.ativa,
        destaque: postagem.destaque
      });
    } catch (error: unknown) {
      console.error('Erro ao carregar postagem:', error);
      
      // Verificar se é erro axios e status específico
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 404) {
        toast.error('Postagem não encontrada');
      } else if (axiosError.response?.status === 403) {
        toast.error('Sem permissão para acessar esta postagem');
      } else {
        toast.error('Erro ao carregar postagem');
      }
      
      router.push('/admin/postagens');
    } finally {
      setCarregandoPostagem(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação de campos obrigatórios
    if (!formData.titulo.trim()) {
      toast.error('Título é obrigatório');
      return;
    }

    if (!formData.conteudo.trim()) {
      toast.error('Conteúdo é obrigatório');
      return;
    }

    // Validação de limites de caracteres
    if (formData.titulo.length > LIMITS.titulo) {
      toast.error(`Título deve ter no máximo ${LIMITS.titulo} caracteres`);
      return;
    }

    if (formData.resumo.length > LIMITS.resumo) {
      toast.error(`Resumo deve ter no máximo ${LIMITS.resumo} caracteres`);
      return;
    }

    try {
      setLoading(true);
      await postagemService.atualizar(Number(id), formData);
      toast.success('Postagem atualizada com sucesso!');
      router.push('/admin/postagens');
    } catch (error) {
      console.error('Erro ao atualizar postagem:', error);
      toast.error('Erro ao atualizar postagem');
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return null;
  }

  if (carregandoPostagem) {
    return (
      <DefaultLayout>
        <div className="flex items-center justify-center py-20">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-md2 font-semibold text-black dark:text-white">
            Editar Postagem
          </h2>
          <button
            onClick={() => router.push('/admin/postagens')}
            className="inline-flex items-center gap-2 rounded-md bg-gray-500 px-4 py-2 text-white hover:bg-opacity-90"
          >
            <FaArrowLeft className="h-4 w-4" />
            Voltar
          </button>
        </div>

        {/* Formulário */}
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
            <h3 className="font-medium text-black dark:text-white">
              Informações da Postagem
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="p-6.5">
            <div className="mb-4.5">
              <label className="mb-2.5 block text-black dark:text-white">
                Título <span className="text-meta-1">*</span>
              </label>
              <input
                type="text"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                placeholder="Digite o título da postagem"
                className={`w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary ${
                  formData.titulo.length > LIMITS.titulo ? 'border-red-500' : ''
                }`}
                required
                maxLength={LIMITS.titulo + 50} // Permite digitação extra para mostrar erro
              />
              {renderCharacterCounter(formData.titulo.length, LIMITS.titulo)}
            </div>

            <div className="mb-4.5">
              <label className="mb-2.5 block text-black dark:text-white">
                Resumo
              </label>
              <textarea
                rows={3}
                value={formData.resumo}
                onChange={(e) => setFormData({ ...formData, resumo: e.target.value })}
                placeholder="Digite um resumo da postagem (opcional)"
                className={`w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary ${
                  formData.resumo.length > LIMITS.resumo ? 'border-red-500' : ''
                }`}
                maxLength={LIMITS.resumo + 50} // Permite digitação extra para mostrar erro
              />
              {renderCharacterCounter(formData.resumo.length, LIMITS.resumo)}
            </div>

            <div className="mb-4.5">
              <label className="mb-2.5 block text-black dark:text-white">
                Categoria <span className="text-meta-1">*</span>
              </label>
              <select
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value as CategoriaPostagem })}
                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                required
              >
                <option value="INFORMATIVO">Informativo</option>
                <option value="AVISO">Aviso</option>
                <option value="COMUNICADO">Comunicado</option>
                <option value="NOTICIA">Notícia</option>
                <option value="FAQ">Pergunta Frequente</option>
              </select>
            </div>

            <div className="mb-4.5">
              <label className="mb-2.5 block text-black dark:text-white">
                Conteúdo <span className="text-meta-1">*</span>
              </label>
              <div className="rounded border-[1.5px] border-stroke bg-transparent dark:border-form-strokedark dark:bg-form-input">
                <TinyMCEEditor
                  value={formData.conteudo}
                  onChange={(content: string) => setFormData({ ...formData, conteudo: content })}
                  placeholder="Digite o conteúdo da postagem..."
                  height={350}
                />
              </div>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="ativa"
                  checked={formData.ativa}
                  onChange={(e) => setFormData({ ...formData, ativa: e.target.checked })}
                  className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="ativa" className="text-black dark:text-white">
                  Postagem ativa (visível no site)
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="destaque"
                  checked={formData.destaque}
                  onChange={(e) => setFormData({ ...formData, destaque: e.target.checked })}
                  className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="destaque" className="text-black dark:text-white">
                  Postagem em destaque
                </label>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading || formData.titulo.length > LIMITS.titulo || formData.resumo.length > LIMITS.resumo}
                className="inline-flex items-center gap-2 rounded bg-primary px-6 py-3 font-medium text-white hover:bg-opacity-90 disabled:cursor-not-allowed disabled:bg-opacity-50"
              >
                <FaSave className="h-4 w-4" />
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </button>

              <button
                type="button"
                onClick={() => router.push('/admin/postagens')}
                className="inline-flex items-center gap-2 rounded bg-gray-500 px-6 py-3 font-medium text-white hover:bg-opacity-90"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default EditarPostagem;
