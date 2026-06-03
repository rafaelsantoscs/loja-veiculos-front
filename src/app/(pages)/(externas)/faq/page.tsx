"use client";

import { useState, useEffect } from 'react';
import { FaQuestionCircle, FaSearch, FaSpinner, FaInfoCircle } from 'react-icons/fa';
import { Navbar } from "@/components/InitialScreen/Navbar";
import { Footer } from "@/components/InitialScreen/Footer";
import FAQAccordion from '@/components/FAQ/FAQAccordion';
import postagemService from '@/services/postagemService';
import { Postagem, PostagemResponse } from '@/types/types-postagem';

export default function FAQPage() {
  const [faqs, setFaqs] = useState<Postagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const carregarFAQs = async (pageNum = 0, searchTerm = '', append = false) => {
    try {
      if (!append) setLoading(true);
      else setLoadingMore(true);

      const response: PostagemResponse = await postagemService.listarFAQ({
        busca: searchTerm,
        page: pageNum,
        size: 10
      });

      if (append) {
        setFaqs(prev => [...prev, ...response.content]);
      } else {
        setFaqs(response.content);
      }

      setTotalElements(response.totalElements);
      setHasMore(response.content.length === 10 && (pageNum + 1) < response.totalPages);
      
    } catch (error) {
      console.error('Erro ao carregar FAQ:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    carregarFAQs(0, busca);
    setPage(0);
  }, [busca]);

  const handleToggle = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    carregarFAQs(nextPage, busca, true);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    carregarFAQs(0, busca);
    setPage(0);
    setExpandedIndex(null);
  };

  return (
    <div className="min-h-screen bg-[url('/images/colaboradores/samu-light.jpg')] dark:bg-[url('/images/colaboradores/samu-dark.jpg')] bg-cover bg-center bg-white dark:bg-[#0c1634] mt-10">
      <Navbar />
      
      <div className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4">
          
          {/* Cabeçalho */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 text-blue-700 dark:text-blue-300 flex items-center justify-center gap-4">
              <FaQuestionCircle className="text-3xl" />
              Perguntas Frequentes
              <FaInfoCircle className="text-3xl" />
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Encontre respostas para as dúvidas mais comuns sobre Vigilância Sanitária
            </p>
          </div>

          {/* Busca */}
          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg p-6 mb-8 shadow-lg">
            <form onSubmit={handleSearchSubmit} className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por pergunta ou resposta..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Buscar
              </button>
            </form>
          </div>

          {/* Conteúdo */}
          {loading ? (
            <div className="text-center py-12">
              <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-300">Carregando perguntas frequentes...</p>
            </div>
          ) : faqs.length === 0 ? (
            <div className="text-center py-12">
              <FaQuestionCircle className="text-6xl text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-300 mb-2">
                {busca ? 'Nenhuma pergunta encontrada' : 'Nenhuma pergunta disponível'}
              </h3>
              <p className="text-slate-500 dark:text-slate-400">
                {busca ? 'Tente buscar com outros termos' : 'As perguntas frequentes ainda estão sendo preparadas'}
              </p>
            </div>
          ) : (
            <>
              {/* Contador de resultados */}
              <div className="mb-6">
                <p className="text-slate-600 dark:text-slate-300">
                  {busca ? (
                    <>Encontradas <strong>{totalElements}</strong> perguntas para &quot;{busca}&quot;</>
                  ) : (
                    <>Total de <strong>{totalElements}</strong> perguntas frequentes</>
                  )}
                </p>
              </div>

              {/* Lista de FAQ */}
              <div className="space-y-4 mb-8">
                {faqs.map((faq, index) => (
                  <FAQAccordion
                    key={faq.id}
                    faq={faq}
                    isExpanded={expandedIndex === index}
                    onToggle={() => handleToggle(index)}
                  />
                ))}
              </div>

              {/* Botão Carregar Mais */}
              {hasMore && (
                <div className="text-center">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    {loadingMore ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Carregando...
                      </>
                    ) : (
                      'Carregar mais perguntas'
                    )}
                  </button>
                </div>
              )}
            </>
          )}

          {/* Informações de Contato */}
          <div className="mt-16 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 p-8 rounded-lg border border-slate-200 dark:border-slate-600">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">
                Não encontrou sua dúvida?
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mb-6 text-lg">
                Nossa equipe está pronta para ajudar você!
                  <p className="text-sm text-slate-500">Seg-Sex: 7h às 16h</p>
              </p>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-700 p-6 rounded-lg shadow-sm">
                  <div className="text-3xl mb-3">📞</div>
                  <h4 className="font-semibold text-slate-800 dark:text-white mb-2">Telefone</h4>
                  <p className="text-slate-600 dark:text-slate-300">(81) 3526 - 5333</p>
                </div>
                
                <div className="bg-white dark:bg-slate-700 p-6 rounded-lg shadow-sm">
                  <div className="text-3xl mb-3">📧</div>
                  <h4 className="font-semibold text-slate-800 dark:text-white mb-2">E-mail</h4>
                  <p className="text-slate-600 dark:text-slate-300">sms.vitoria.visa@gmail.com</p>
                  <p className="text-sm text-slate-500">Resposta em até 48h</p>
                </div>
                
                <div className="bg-white dark:bg-slate-700 p-6 rounded-lg shadow-sm">
                  <div className="text-3xl mb-3">📍</div>
                  <h4 className="font-semibold text-slate-800 dark:text-white mb-2">Presencial</h4>
                  <p className="text-slate-600 dark:text-slate-300">Sede da VISA</p>
                  <p className="text-sm text-slate-500">Av. Henrique Holanda, 727 - Matriz - Vitória de Santo Antão - PE</p>
                  <p className="text-sm text-slate-500">Atendimento por ordem de chegada</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
