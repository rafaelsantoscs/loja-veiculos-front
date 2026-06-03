"use client";
import { useState } from 'react';
import { Postagem } from '@/types/types-postagem';
import { 
  FaInfoCircle, 
  FaBullhorn, 
  FaFileAlt, 
  FaNewspaper,
  FaQuestionCircle,
  FaUser,
  FaCalendarAlt,
  FaEye,
  FaClock,
  FaEdit,
  FaTrash,
  FaToggleOn,
  FaToggleOff
} from 'react-icons/fa';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import postagemService from '@/services/postagemService';
import PostagemModal from './PostagemModal';

interface PostagemCardProps {
  postagem: Postagem;
  isAdmin?: boolean;
  isPublica?: boolean;
  onUpdate?: () => void;
}

const PostagemCard: React.FC<PostagemCardProps> = ({ 
  postagem, 
  isAdmin = false,
  isPublica = false,
  onUpdate 
}) => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const getCategoriaIcon = (categoria: string) => {
    switch(categoria) {
      case 'INFORMATIVO': return <FaInfoCircle className="text-blue-500" />;
      case 'AVISO': return <FaBullhorn className="text-yellow-500" />;
      case 'COMUNICADO': return <FaFileAlt className="text-green-500" />;
      case 'NOTICIA': return <FaNewspaper className="text-purple-500" />;
      case 'FAQ': return <FaQuestionCircle className="text-orange-500" />;
      default: return <FaFileAlt className="text-slate-500" />;
    }
  };

  const getCategoriaLabel = (categoria: string) => {
    switch(categoria) {
      case 'INFORMATIVO': return 'Informativo';
      case 'AVISO': return 'Aviso';
      case 'COMUNICADO': return 'Comunicado';
      case 'NOTICIA': return 'Notícia';
      case 'FAQ': return 'Pergunta Frequente';
      default: return categoria;
    }
  };

  const getCategoriaColor = (categoria: string) => {
    switch(categoria) {
      case 'INFORMATIVO': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'AVISO': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'COMUNICADO': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'NOTICIA': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'FAQ': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300';
    }
  };

  const formatarData = (data: string) => {
    try {
      return format(new Date(data), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return 'Data inválida';
    }
  };

  const extrairResumo = (conteudo: string, limite = 150) => {
    // Remove tags HTML
    let textoLimpo = conteudo.replace(/<[^>]*>/g, '');
    
    // Decodifica entidades HTML usando DOM (mais robusto)
    if (typeof document !== 'undefined') {
      const textArea = document.createElement('textarea');
      textArea.innerHTML = textoLimpo;
      textoLimpo = textArea.value;
    } else {
      // Fallback para SSR - decodifica manualmente as mais comuns
      textoLimpo = textoLimpo
        .replace(/&ccedil;/g, 'ç')
        .replace(/&Ccedil;/g, 'Ç')
        .replace(/&atilde;/g, 'ã')
        .replace(/&Atilde;/g, 'Ã')
        .replace(/&otilde;/g, 'õ')
        .replace(/&Otilde;/g, 'Õ')
        .replace(/&aacute;/g, 'á')
        .replace(/&Aacute;/g, 'Á')
        .replace(/&eacute;/g, 'é')
        .replace(/&Eacute;/g, 'É')
        .replace(/&iacute;/g, 'í')
        .replace(/&Iacute;/g, 'Í')
        .replace(/&oacute;/g, 'ó')
        .replace(/&Oacute;/g, 'Ó')
        .replace(/&uacute;/g, 'ú')
        .replace(/&Uacute;/g, 'Ú')
        .replace(/&acirc;/g, 'â')
        .replace(/&Acirc;/g, 'Â')
        .replace(/&ecirc;/g, 'ê')
        .replace(/&Ecirc;/g, 'Ê')
        .replace(/&ocirc;/g, 'ô')
        .replace(/&Ocirc;/g, 'Ô')
        .replace(/&agrave;/g, 'à')
        .replace(/&Agrave;/g, 'À')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
    }
    
    return textoLimpo.length > limite 
      ? textoLimpo.substring(0, limite) + '...'
      : textoLimpo;
  };

  const handleVisualizarCompleta = async () => {
    try {
      // Só incrementa visualizações se for uma visualização pública
      if (isPublica) {
        await postagemService.incrementarVisualizacoes(postagem.id);
        // Atualizar contador localmente
        postagem.visualizacoes += 1;
      }
      setShowModal(true);
    } catch (error) {
      console.error('Erro ao incrementar visualizações:', error);
      setShowModal(true); // Abrir modal mesmo com erro
    }
  };

  const handleToggleStatus = async () => {
    if (!isAdmin) return;
    
    try {
      setLoading(true);
      await postagemService.alternarStatus(postagem.id);
      onUpdate?.();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletar = async () => {
    if (!isAdmin) return;
    
    if (window.confirm('Tem certeza que deseja deletar esta postagem?')) {
      try {
        setLoading(true);
        await postagemService.deletar(postagem.id);
        onUpdate?.();
      } catch (error) {
        console.error('Erro ao deletar postagem:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <>
      <div className={`bg-white dark:bg-[#1a2332] rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${
        !postagem.ativa && isAdmin ? 'opacity-60 border-2 border-rose-300' : ''
      }`}>
        {/* Cabeçalho */}
        <div className="p-6">
          {/* Categoria e Status */}
          <div className="flex items-center justify-between mb-4">
            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getCategoriaColor(postagem.categoria)}`}>
              {getCategoriaIcon(postagem.categoria)}
              {getCategoriaLabel(postagem.categoria)}
            </span>
            
            {postagem.destaque && (
              <span className="bg-rose-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                DESTAQUE
              </span>
            )}
          </div>

          {/* Título */}
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3 line-clamp-2">
            {postagem.titulo}
          </h3>

          {/* Resumo */}
          <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 line-clamp-3">
            {postagem.resumo || extrairResumo(postagem.conteudo)}
          </p>

          {/* Metadados */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-4">
            <span className="flex items-center gap-1">
              <FaUser className="text-xs" />
              {postagem.autor.nomeCompleto}
            </span>
            <span className="flex items-center gap-1">
              <FaCalendarAlt className="text-xs" />
              {formatarData(postagem.dataPublicacao)}
            </span>
            <span className="flex items-center gap-1">
              <FaEye className="text-xs" />
              {postagem.visualizacoes} visualizações
            </span>
          </div>

          {/* Data de atualização */}
          {postagem.dataAtualizacao && postagem.dataAtualizacao !== postagem.dataPublicacao && (
            <div className="flex items-center gap-1 text-xs text-slate-400 mb-4">
              <FaClock className="text-xs" />
              Atualizado em {formatarData(postagem.dataAtualizacao)}
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-2">
            <button
              onClick={handleVisualizarCompleta}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Ler mais
            </button>

            {/* Botões admin */}
            {isAdmin && (
              <div className="flex gap-1">
                <button
                  onClick={handleToggleStatus}
                  disabled={loading}
                  className={`p-2 rounded-md text-sm transition-colors ${
                    postagem.ativa 
                      ? 'bg-green-500 hover:bg-green-600 text-white' 
                      : 'bg-rose-500 hover:bg-rose-600 text-white'
                  }`}
                  title={postagem.ativa ? 'Desativar' : 'Ativar'}
                >
                  {postagem.ativa ? <FaToggleOn /> : <FaToggleOff />}
                </button>
                
                <button
                  className="p-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md transition-colors"
                  title="Editar"
                >
                  <FaEdit />
                </button>
                
                <button
                  onClick={handleDeletar}
                  disabled={loading}
                  className="p-2 bg-rose-500 hover:bg-rose-600 text-white rounded-md transition-colors"
                  title="Deletar"
                >
                  <FaTrash />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <PostagemModal 
          postagem={postagem}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
};

export default PostagemCard;
