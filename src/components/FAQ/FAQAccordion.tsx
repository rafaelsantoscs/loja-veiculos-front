"use client";

import { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { Postagem } from '@/types/types-postagem';

interface FAQAccordionProps {
  faq: Postagem;
  isExpanded?: boolean;
  onToggle?: () => void;
}

export const FAQAccordion: React.FC<FAQAccordionProps> = ({ 
  faq, 
  isExpanded = false, 
  onToggle 
}) => {
  const [expanded, setExpanded] = useState(isExpanded);

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setExpanded(!expanded);
    }
  };

  const isOpen = onToggle ? isExpanded : expanded;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600 shadow-sm hover:shadow-md transition-all duration-200">
      {/* Cabeçalho - Pergunta */}
      <button
        onClick={handleToggle}
        className="w-full text-left p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset rounded-t-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 pr-4">
            {faq.titulo}
          </h3>
          <div className="flex-shrink-0">
            {isOpen ? (
              <FaChevronUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            ) : (
              <FaChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </div>
        </div>
      </button>

      {/* Conteúdo - Resposta */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-700">
          <div 
            className="text-slate-700 dark:text-slate-300 prose prose-sm max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: faq.conteudo }}
          />
          
          {/* Metadados */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>
              Visualizações: {faq.visualizacoes}
            </span>
            <span>
              Atualizado em: {new Date(faq.dataAtualizacao || faq.dataPublicacao).toLocaleDateString('pt-BR')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQAccordion;
