import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { FaUserPlus, FaList, FaPlusSquare, FaClock, FaCarSide, FaUsers, FaPills, FaCog, FaEdit, FaChartBar, FaEye, FaBuilding, FaUserTie, FaUserCog, FaArrowDown, FaFileContract, FaFileAlt, FaChartPie, FaStoreAlt } from "react-icons/fa";

interface GrupoProps {
  titulo: string;
  bgColor?: string;
  backgroundImage?: string;
  acoes: { label: string; route: string }[];
  colorScheme?: 'blue' | 'green' | 'red' | 'purple';
}

const GrupoDeServicosCard = ({ 
  titulo, 
  backgroundImage, 
  acoes, 
  colorScheme = 'blue' 
}: GrupoProps) => {
  const colorSchemes = {
    blue: {
      gradient: 'from-purple-600 via-blue-600 to-indigo-700',
      iconColor: 'text-blue-200',
      overlay: 'from-purple-500/20 via-blue-500/20 to-indigo-600/20'
    },
    green: {
      gradient: 'from-emerald-600 via-teal-600 to-cyan-700',
      iconColor: 'text-emerald-200',
      overlay: 'from-emerald-500/20 via-teal-500/20 to-cyan-600/20'
    },
    red: {
      gradient: 'from-orange-600 via-red-600 to-pink-700',
      iconColor: 'text-orange-200',
      overlay: 'from-orange-500/20 via-red-500/20 to-pink-600/20'
    },
    purple: {
      gradient: 'from-purple-600 via-indigo-600 to-blue-700',
      iconColor: 'text-purple-200',
      overlay: 'from-purple-500/20 via-indigo-500/20 to-blue-600/20'
    }
  };

  const currentScheme = colorSchemes[colorScheme];

  const getIconForLabel = (label: string) => {
  const lower = label.toLowerCase();
  // DADOS CADASTRAIS
  if (lower.includes("empresa")) return <FaBuilding className="text-xs" />;
  if (lower.includes("resp. legal")) return <FaUserTie className="text-xs" />;
  if (lower.includes("resp. técnico")) return <FaUserCog className="text-xs" />;
  if (lower.includes("porte")) return <FaChartBar className="text-xs" />;
  if (lower.includes("ver todos")) return <FaEye className="text-xs" />;
  // APROVAÇÃO
  if (lower.includes("pendente") || lower.includes("dados resp. técnico")) return <FaClock className="text-xs text-orange-400" />;
  if (lower.includes("dar baixa")) return <FaArrowDown className="text-xs" />;
  if (lower.includes("rascunho")) return <FaEdit className="text-xs" />;
  if (lower.includes("termo") || lower.includes("responsabilidade")) return <FaFileContract className="text-xs" />;
  if (lower.includes("baixa de resp. técnica")) return <FaFileAlt className="text-xs" />;
  // ESTABELECIMENTO
  if (lower.includes("definição de porte")) return <FaChartPie className="text-xs" />;
  if (lower.includes("pequeno porte")) return <FaStoreAlt className="text-xs" />;
  // DENÚNCIAS
  if (lower.includes("denuncia") && lower.includes("criar")) return <FaEdit className="text-xs" />;
  if (lower.includes("denuncia") && lower.includes("consultar")) return <FaEye className="text-xs" />;
  // NOTÍCIAS
  if (lower.includes("gerenciar postagens")) return <FaCog className="text-xs" />;
  if (lower.includes("nova postagem")) return <FaEdit className="text-xs" />;
  if (lower.includes("estatísticas")) return <FaChartBar className="text-xs" />;
  if (lower.includes("ver site público")) return <FaEye className="text-xs" />;
  // Outros ícones genéricos
  if (lower.includes("gerenciar")) return <FaCog className="text-xs" />;
  if (lower.includes("criar")) return <FaEdit className="text-xs" />;
  if (lower.includes("estatística") || lower.includes("stats")) return <FaChartBar className="text-xs" />;
  if (lower.includes("ver site") || lower.includes("público")) return <FaEye className="text-xs" />;
  if (lower.includes("mapa")) return <FaCarSide className="text-xs" />;
  if (lower.includes("cadastrar") || lower.includes("novo")) return <FaUserPlus className="text-xs" />;
  if (lower.includes("checklist")) return <FaList className="text-xs" />;
  if (lower.includes("equipe")) return <FaUsers className="text-xs" />;
  if (lower.includes("farmacia")) return <FaPills className="text-xs" />;
  if (lower.includes("registro")) return <FaClock className="text-xs" />;
  return <FaPlusSquare className="text-xs" />;
  };

  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleNavigate = (route: string) => {
    setLoading(true);
    router.push(route);
  };

  return (
    <div className="relative w-full min-h-[320px] rounded-3xl overflow-hidden group">
      {/* Efeito de fundo com gradiente */}
      <div className={`absolute inset-0 bg-gradient-to-br ${currentScheme.gradient} transition-all duration-700 group-hover:brightness-110`}></div>
      
      {/* Overlay de imagem de fundo se fornecida */}
      {backgroundImage && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center opacity-15"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
          <div className="absolute inset-0 bg-black/30" />
        </>
      )}
      
      {/* Elementos decorativos */}
      <div className={`absolute inset-0 bg-gradient-to-br ${currentScheme.overlay}`}></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
      
      {/* Conteúdo principal */}
      <div className="relative z-10 h-full flex flex-col p-5">
        {/* Header com ícone e título */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/20 backdrop-blur-md shadow-lg">
            {getIconForLabel(titulo)}
          </div>
          <h3 className="text-lg font-semibold text-white drop-shadow-md">
            {titulo}
          </h3>
        </div>
        
        {/* Área dos botões - Centralizada verticalmente */}
        <div className="flex-1 flex items-center">
          <div className="grid grid-cols-3 gap-1 w-full">
            {acoes.map((acao, index) => (
              <button
                key={index}
                type="button"
                className="flex flex-col items-center p-3 bg-white/15 backdrop-blur-md rounded-xl border border-white/10 
                         shadow-md hover:bg-white/25 hover:shadow-lg transition-all duration-300 
                         hover:-translate-y-1 group/button focus:outline-none"
                onClick={() => handleNavigate(acao.route)}
                disabled={loading}
              >
                <span className={`flex items-center justify-center w-8 h-8 bg-white/20 rounded-full mb-2 ${currentScheme.iconColor} shadow-inner group-hover/button:scale-110 transition-transform`}>
                  {getIconForLabel(acao.label)}
                </span>
                <span className="text-xs font-medium text-white text-center leading-tight">
                  {acao.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* Loader Overlay */}
      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2">
            <svg className="animate-spin h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-white font-bold text-lg animate-pulse">Carregando...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default GrupoDeServicosCard;