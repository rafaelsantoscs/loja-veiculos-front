"use client";
import { useEffect } from 'react';
import { Postagem } from '@/types/types-postagem';
import { 
  FaTimes, 
  FaInfoCircle, 
  FaBullhorn, 
  FaFileAlt, 
  FaNewspaper,
  FaQuestionCircle,
  FaUser,
  FaCalendarAlt,
  FaEye,
  FaDownload
} from 'react-icons/fa';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PostagemModalProps {
  postagem: Postagem;
  onClose: () => void;
}

const PostagemModal: React.FC<PostagemModalProps> = ({ postagem, onClose }) => {
  
  useEffect(() => {
    // Bloquear scroll do body quando modal está aberto
    document.body.style.overflow = 'hidden';
    
    // Fechar com ESC
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    document.addEventListener('keydown', handleEsc);
    
    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

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
      return format(new Date(data), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
    } catch {
      return 'Data inválida';
    }
  };

  const getAnexoIcon = (tipo: string) => {
    switch(tipo) {
      case 'PDF': return '📄';
      case 'IMAGE': return '🖼️';
      case 'DOC': return '📝';
      default: return '📎';
    }
  };

  const formatarTamanho = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-[#1a2332] rounded-lg shadow-2xl max-w-4xl max-h-[90vh] w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getCategoriaColor(postagem.categoria)}`}>
              {getCategoriaIcon(postagem.categoria)}
              {getCategoriaLabel(postagem.categoria)}
            </span>
            
            {postagem.destaque && (
              <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                DESTAQUE
              </span>
            )}
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
          >
            <FaTimes className="text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6">
            {/* Título */}
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-6">
              {postagem.titulo}
            </h1>

            {/* Metadados */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-600 dark:text-slate-400 mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
              <span className="flex items-center gap-2">
                <FaUser />
                <strong>Autor:</strong> {postagem.autor.nomeCompleto}
              </span>
              <span className="flex items-center gap-2">
                <FaCalendarAlt />
                <strong>Publicado:</strong> {formatarData(postagem.dataPublicacao)}
              </span>
              <span className="flex items-center gap-2">
                <FaEye />
                <strong>Visualizações:</strong> {postagem.visualizacoes}
              </span>
            </div>

            {/* Conteúdo */}
            <div 
              className="prose prose-lg max-w-none dark:prose-invert prose-blue"
              dangerouslySetInnerHTML={{ __html: postagem.conteudo }}
            />

            {/* Anexos */}
            {postagem.anexos && postagem.anexos.length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
                  Anexos ({postagem.anexos.length})
                </h3>
                <div className="grid gap-3">
                  {postagem.anexos.map((anexo) => (
                    <div key={anexo.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {getAnexoIcon(anexo.tipo)}
                        </span>
                        <div>
                          <p className="font-medium text-slate-800 dark:text-white">
                            {anexo.nome}
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {formatarTamanho(anexo.tamanho)}
                          </p>
                        </div>
                      </div>
                      <a
                        href={anexo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm transition-colors"
                      >
                        <FaDownload />
                        Baixar
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-500 hover:bg-slate-600 text-white rounded-md transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostagemModal;
