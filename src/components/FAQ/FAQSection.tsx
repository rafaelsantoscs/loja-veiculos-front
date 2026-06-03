"use client";

import { useState, useEffect } from 'react';
import { FaQuestionCircle, FaArrowRight, FaSpinner } from 'react-icons/fa';
import Link from 'next/link';
import FAQAccordion from './FAQAccordion';
import postagemService from '@/services/postagemService';
import { Postagem } from '@/types/types-postagem';

export const FAQSection: React.FC = () => {
  const [faqsDestaque, setFaqsDestaque] = useState<Postagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  useEffect(() => {
    const carregarFAQDestaque = async () => {
      try {
        const faqs = await postagemService.buscarFAQDestaque();
        setFaqsDestaque(faqs);
      } catch (error) {
        // Log silencioso para não expor informações sensíveis
      } finally {
        setLoading(false);
      }
    };

    carregarFAQDestaque();
  }, []);

  const handleToggle = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  if (loading) {
    return (
      <section id="faq" className="bg-transparent py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-300">Carregando perguntas frequentes...</p>
        </div>
      </section>
    );
  }

  // Se não houver FAQ em destaque, não mostra a seção
  if (faqsDestaque.length === 0) {
    return null; // Não renderiza nada se não há FAQ
  }

  return (
    <section id="faq" className="bg-transparent py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Cabeçalho */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-blue-700 dark:text-blue-300 mb-4 flex items-center justify-center gap-3">
            <FaQuestionCircle className="text-2xl" />
            Perguntas Frequentes
          </h2>
          <p className="text-slate-700 dark:text-white text-lg">
            Respostas rápidas para as dúvidas mais comuns sobre Vigilância Sanitária
          </p>
        </div>

        {/* FAQ Cards */}
        <div className="space-y-4 mb-8">
          {faqsDestaque.map((faq, index) => (
            <FAQAccordion
              key={faq.id}
              faq={faq}
              isExpanded={expandedIndex === index}
              onToggle={() => handleToggle(index)}
            />
          ))}
        </div>

        {/* Link para página completa */}
        <div className="text-center">
          <Link 
            href="/faq"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <span>Ver todas as perguntas</span>
            <FaArrowRight className="text-sm" />
          </Link>
        </div>

        {/* Não encontrou sua dúvida? */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 p-6 rounded-lg border border-slate-200 dark:border-slate-600 text-center">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
            Não encontrou sua dúvida?
          </h3>
          <p className="text-slate-600 dark:text-slate-300 mb-4">
            Entre em contato conosco através dos nossos canais de atendimento
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <span className="bg-white dark:bg-slate-700 px-3 py-1 rounded-full border">
              📞 Telefone: (81) 3526 - 5333
            </span>
            <span className="bg-white dark:bg-slate-700 px-3 py-1 rounded-full border">
              📧 sms.vitoria.visa@gmail.com
            </span>
            <span className="bg-white dark:bg-slate-700 px-3 py-1 rounded-full border">
              🕒 Seg-Sex: 07h às 16h
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
