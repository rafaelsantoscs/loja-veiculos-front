// src/app/colaboradores/page.tsx
"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Navbar } from "@/components/InitialScreen/Navbar";
import Apresentacao from "@/components/colaboradores/Apresentacao";
import FotoComHistoria from "@/components/colaboradores/FotoComHIstoria";
import ImagemFullWidth from "@/components/colaboradores/ImagemFullWidth";
import CarrosselColaboradores from "@/components/colaboradores/CarrosselColaboradores";
import VideoComHistoria from "@/components/colaboradores/VideoComHistoria";
import { Colaborador } from "@/types/types-colaborador";
import axiosInstance from "@/services/axiosInstance";
import { FiFileText, FiAlertTriangle, FiTarget, FiUsers, FiArrowUp, FiHelpCircle } from "react-icons/fi";
import FAQSection from "@/components/FAQ/FAQSection";

const InstitucionalPage: React.FC = () => {
  const [mostrarApresentacao, setMostrarApresentacao] = useState(false);
  const [mostrarCarrossel, setMostrarCarrossel] = useState(false);
  const [selectedColaborador, setSelectedColaborador] = useState<Colaborador | null>(null);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [showScrollButtons, setShowScrollButtons] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const scrollPosition = useRef(0);



useEffect(() => {
  const fetchColaboradores = async () => {
    try {
      const response = await axiosInstance.get("/colaboradores");

      const colaboradoresRecebidos: Colaborador[] = Array.isArray(response.data)
        ? response.data
        : response.data.content ?? [];

      console.log("👥 Colaboradores do banco:", colaboradoresRecebidos);

      setColaboradores(
        colaboradoresRecebidos.sort((a, b) => a.nome.localeCompare(b.nome))
      );

    } catch (error) {
      console.error("Erro ao carregar colaboradores:", error);
    }
  };

  fetchColaboradores();
}, []);

// Hook para controlar visibilidade dos botões baseado no scroll
useEffect(() => {
  const handleScroll = () => {
    const currentScrollY = window.scrollY;
    
    if (currentScrollY < lastScrollY) {
      // Scrolling up
      setShowScrollButtons(true);
    } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
      // Scrolling down and past 100px
      setShowScrollButtons(false);
    }
    
    setLastScrollY(currentScrollY);
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  
  return () => window.removeEventListener('scroll', handleScroll);
}, [lastScrollY]);




  useEffect(() => {
    if (!mostrarApresentacao && !mostrarCarrossel) {   
      window.scrollTo({ top: scrollPosition.current, behavior: "smooth" });
    }
  }, [mostrarApresentacao, mostrarCarrossel]);

  if (mostrarApresentacao && selectedColaborador) {
    return (
      <Apresentacao
        colaborador={selectedColaborador}
        onVoltar={() => {
          setMostrarApresentacao(false);
          setMostrarCarrossel(true);                     
        }}
      />
    );
  }

 

  if (mostrarCarrossel) {
    return (
      <div className="relative bg-white dark:bg-[#0c1634] min-h-screen">
        <Navbar />
        <CarrosselColaboradores
          colaboradores={colaboradores}
          onSelecionarColaborador={(colaboradorSelecionado) => {
            setSelectedColaborador(colaboradorSelecionado);
            setMostrarCarrossel(false);
            setMostrarApresentacao(true);
          }}
          onVoltar={() => setMostrarCarrossel(false)}
        />
      </div>
    );
  }

  return (
    <div className="relative z-50 flex flex-col pt-26
        bg-[url('/images/colaboradores/samu-light.jpg')] dark:bg-[url('/images/colaboradores/samu-dark.jpg')]
        bg-cover bg-center 
        bg-white dark:bg-[#0c1634]"
    >
      {!mostrarApresentacao && (
        <div className="fixed top-0 left-0 w-full z-50">
          <Navbar />
        </div>
      )}

      <ImagemFullWidth
        src="/images/banner/banner-VISA.jpg"
        heightClass="h-[350px]"
        alt="Banner Vigilância Sanitária"
      />

      {/* Menu de Navegação Sticky */}
      <nav className={`sticky top-20 bg-white/95 dark:bg-[#0c1634]/95 backdrop-blur-md shadow-md border-b border-slate-200 dark:border-slate-600 z-40 transition-all duration-300 ${
        showScrollButtons ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}>
        <div className="max-w-6xl mx-auto px-4 py-3">
          <ul className="flex flex-wrap gap-2 justify-center text-base">
            <li>
              <button 
                onClick={() => document.getElementById('definicao')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-3 py-2 rounded-md font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-blue-100 dark:hover:bg-blue-800 hover:text-blue-700 dark:hover:text-blue-300 shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-1.5"
              >
                <FiFileText className="w-3 h-3" />
                Definição Legal
              </button>
            </li>
            <li>
              <button 
                onClick={() => document.getElementById('legislacao')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-3 py-2 rounded-md font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-indigo-100 dark:hover:bg-indigo-800 hover:text-indigo-700 dark:hover:text-indigo-300 shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-1.5"
              >
                <FiFileText className="w-3 h-3" />
                Legislação
              </button>
            </li>
            <li>
              <button 
                onClick={() => document.getElementById('riscos')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-3 py-2 rounded-md font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-orange-100 dark:hover:bg-orange-800 hover:text-orange-700 dark:hover:text-orange-300 shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-1.5"
              >
                <FiAlertTriangle className="w-3 h-3" />
                Riscos Sanitários
              </button>
            </li>
            <li>
              <button 
                onClick={() => document.getElementById('acoes')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-3 py-2 rounded-md font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-green-100 dark:hover:bg-green-800 hover:text-green-700 dark:hover:text-green-300 shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-1.5"
              >
                <FiTarget className="w-3 h-3" />
                Ações e Atividades
              </button>
            </li>
            <li>
              <button 
                onClick={() => document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-3 py-2 rounded-md font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-blue-100 dark:hover:bg-blue-800 hover:text-blue-700 dark:hover:text-blue-300 shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-1.5"
              >
                <FiHelpCircle className="w-3 h-3" />
                Perguntas Frequentes
              </button>
            </li>
            <li>
              <button 
                onClick={() => document.getElementById('equipe')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-3 py-2 rounded-md font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-purple-100 dark:hover:bg-purple-800 hover:text-purple-700 dark:hover:text-purple-300 shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-1.5"
              >
                <FiUsers className="w-3 h-3" />
                Nossa Equipe
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* Seção 1: Definição Legal */}
      <section id="definicao" className="bg-transparent py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-blue-700 dark:text-blue-300 text-center mb-8">
            Definição Legal da Vigilância Sanitária
          </h2>
          <div className="bg-blue-50 dark:bg-[#1a2332] p-8 rounded-lg shadow-lg border dark:border-slate-600">
            <p className="text-slate-700 dark:text-white mb-4 text-justify leading-relaxed">
              A definição de <strong>VIGILÂNCIA SANITÁRIA</strong>, expressa na Lei Federal n.º 8.080, de 19 de setembro de 1990, 
              conforme o artigo 6º, parágrafo 1º, diz o seguinte:
            </p>
            <blockquote className="border-l-4 border-blue-600 dark:border-blue-400 pl-6 italic text-slate-800 dark:text-slate-100 mb-4">
              &ldquo;Conjunto de ações capazes de eliminar, diminuir ou prevenir à saúde e de intervir nos problemas sanitários 
              decorrentes do meio ambiente, da produção e circulação de bens e da prestação de serviços de interesse da saúde, 
              abrangendo:
            </blockquote>
            <div className="ml-6 space-y-3">
              <p className="text-slate-700 dark:text-white">
                <strong>I –</strong> o controle de bens de consumo que, direta ou indiretamente se relacionem com a saúde, 
                compreendidas todas as etapas e processos, da produção ao consumo;
              </p>
              <p className="text-slate-700 dark:text-white">
                <strong>II –</strong> o controle da prestação de serviços que se relacionam direta ou indiretamente com a saúde.&rdquo;
              </p>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-6 text-right">
              — Lei Federal n.º 8.080/1990, Art. 6º, §1º
            </p>
          </div>
        </div>
      </section>

      {/* Seção 2: Legislação */}
      <section id="legislacao" className="bg-transparent py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-blue-700 dark:text-blue-300 text-center mb-12">
            Legislação e Normas
          </h2>
          <p className="text-slate-700 dark:text-white text-center mb-12 text-lg">
            Acesse as principais normas e regulamentações que regem a Vigilância Sanitária:
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Federal */}
            <div className="bg-white dark:bg-[#1a2332] p-8 rounded-lg border-l-4 border-blue-600 shadow-lg">
              <h3 className="text-2xl font-bold text-blue-700 dark:text-blue-300 mb-4 text-center flex items-center justify-center gap-3">
                <Image 
                  src="/images/logo/logo_anvisa.png" 
                  width={48} 
                  height={48} 
                  alt="ANVISA"
                  className="object-contain"
                />
                Federal
              </h3>
              <div className="space-y-4 text-slate-700 dark:text-white">
                <p className="text-justify leading-relaxed">
                  Para atualizações de normas federais acesse a <strong>&ldquo; Bibliotecas temáticas de normas &rdquo;</strong> 
                  através do link oficial da ANVISA:
                </p>
                <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                  <a 
                    href="http://portal.anvisa.gov.br/agenda-regulatoria/bibliotecas" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 font-semibold underline break-all"
                  >
                    portal.anvisa.gov.br/agenda-regulatoria/bibliotecas
                  </a>
                </div>
              </div>
            </div>

            {/* Estadual */}
            <div className="bg-white dark:bg-[#1a2332] p-8 rounded-lg border-l-4 border-green-600 shadow-lg">
              <h3 className="text-2xl font-bold text-green-700 dark:text-green-300 mb-4 text-center flex items-center justify-center gap-3">
                <Image 
                  src="/images/logo/logo_apevisa.png" 
                  width={48} 
                  height={48} 
                  alt="APEVISA"
                  className="object-contain"
                />
                Estadual
              </h3>
              <div className="space-y-4 text-slate-700 dark:text-white">
                <p className="text-justify leading-relaxed">
                  Para atualizações de normas estaduais acesse o site da <strong>Agência Pernambucana 
                  de Vigilância Sanitária</strong> através do link:
                </p>
                <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
                  <a 
                    href="https://www.apevisa.pe.gov.br/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 font-semibold underline"
                  >
                    www.apevisa.pe.gov.br
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Código Sanitário */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 p-8 rounded-lg border border-slate-200 dark:border-slate-600">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 text-center">
              📜 Decreto Nº 20.786/1998
            </h3>
            <p className="text-slate-700 dark:text-white text-center text-lg">
              <strong>Aprova o Regulamento do Código Sanitário do Estado de Pernambuco</strong>
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-300 text-center mt-2">
              Decreto de 10 de agosto de 1998
            </p>
          </div>
        </div>
      </section>

      {/* Seção 3: Riscos Sanitários */}
      <section id="riscos" className="bg-transparent py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-blue-700 dark:text-blue-300 text-center mb-12">
            Riscos Sanitários
          </h2>
          <p className="text-slate-700 dark:text-white text-center mb-12 text-lg">
            Compreensão dos conceitos fundamentais para a atuação da Vigilância Sanitária:
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* RISCO */}
            <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-lg border-l-4 border-orange-600">
              <h3 className="text-xl font-bold text-orange-700 dark:text-orange-300 mb-4 text-center">
                RISCO
              </h3>
              <div className="space-y-3 text-sm text-slate-700 dark:text-white">
                <p className="text-justify leading-relaxed">
                  Risco é a maneira moderna de avaliar o <strong>perigo em termos de probabilidade</strong>, 
                  num contexto de incerteza.
                </p>
                <p className="text-justify leading-relaxed">
                  Agrega o elemento de <strong>&ldquo;potencial dano à saúde&rdquo;</strong> e, consequentemente, 
                  a possibilidade de que um perigo venha causar um evento adverso.
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300 italic mt-4">
                  (Spink apud Douglas, 2002)
                </p>
              </div>
            </div>

            {/* PERIGO */}
            <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border-l-4 border-red-600">
              <h3 className="text-xl font-bold text-red-700 dark:text-red-300 mb-4 text-center">
                PERIGO
              </h3>
              <div className="space-y-3 text-sm text-slate-700 dark:text-white">
                <p className="text-justify leading-relaxed">
                  Perigo é a <strong>condição que pode ser verificada</strong>, inevitável, intrínseca, 
                  sem pressupor interação e exposição.
                </p>
                <p className="text-justify leading-relaxed">
                  Representa uma situação ou agente com <strong>potencial inerente</strong> de causar 
                  danos à saúde, independente da probabilidade de ocorrência.
                </p>
              </div>
            </div>

            {/* EVENTO ADVERSO */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg border-l-4 border-yellow-600">
              <h3 className="text-xl font-bold text-yellow-700 dark:text-yellow-300 mb-4 text-center">
                EVENTO ADVERSO
              </h3>
              <div className="space-y-3 text-sm text-slate-700 dark:text-white">
                <p className="text-justify leading-relaxed">
                  Um evento adverso pode ser definido como <strong>qualquer efeito não desejado</strong>, 
                  em humanos, decorrente do uso desses produtos.
                </p>
                <p className="text-justify leading-relaxed">
                  Representa a <strong>materialização do risco</strong>, quando o perigo se concretiza 
                  em dano efetivo à saúde.
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300 italic mt-4">
                  — RDC Anvisa n° 04/2009
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção 4: Ações e Atividades */}
      <section id="acoes" className="bg-transparent py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-blue-700 dark:text-blue-300 text-center mb-12">
            Ações e Atividades da Vigilância Sanitária
          </h2>
          <p className="text-slate-700 dark:text-white text-center mb-12 text-lg">
            As ações de Vigilância Sanitária compreendem três níveis de complexidade:
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Alta Complexidade */}
            <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border-l-4 border-red-600">
              <h3 className="text-xl font-bold text-red-700 dark:text-red-300 mb-4 text-center">
                Alta Complexidade
              </h3>
              <ul className="space-y-2 text-sm text-slate-700 dark:text-white">
                <li>• Aprovação de projetos e licenciamento de indústrias farmacêuticas</li>
                <li>• Fiscalização de estabelecimentos hospitalares e serviços ambulatoriais</li>
                <li>• Controle de receitas de entorpecentes</li>
                <li>• Vigilância de serviços de radiações ionizantes</li>
                <li>• Análises clínicas de alta tecnologia</li>
                <li>• Registro de produtos sob controle federal</li>
              </ul>
            </div>

            {/* Média Complexidade */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg border-l-4 border-yellow-600">
              <h3 className="text-xl font-bold text-yellow-700 dark:text-yellow-300 mb-4 text-center">
                Média Complexidade
              </h3>
              <ul className="space-y-2 text-sm text-slate-700 dark:text-white">
                <li>• Investigação de surtos de toxinfecção alimentar</li>
                <li>• Licenciamento de estabelecimentos alimentícios</li>
                <li>• Fiscalização de farmácias e distribuidoras</li>
                <li>• Controle de empresas dedetizadoras</li>
                <li>• Licenciamento de clínicas de beleza</li>
                <li>• Fiscalização de serviços de saúde básicos</li>
              </ul>
            </div>

            {/* Baixa Complexidade */}
            <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border-l-4 border-green-600">
              <h3 className="text-xl font-bold text-green-700 dark:text-green-300 mb-4 text-center">
                Baixa Complexidade
              </h3>
              <ul className="space-y-2 text-sm text-slate-700 dark:text-white">
                <li>• Mapeamento de estabelecimentos</li>
                <li>• Atendimento e orientação ao público</li>
                <li>• Licenciamento de salões e barbearias</li>
                <li>• Fiscalização de estabelecimentos alimentícios</li>
                <li>• Controle de condições sanitárias</li>
                <li>• Fiscalização de piscinas e criadouros</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Seção 5: FAQ - Perguntas Frequentes */}
      <FAQSection />

      {/* Botão Voltar ao Topo - Melhorado */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-6 right-6 bg-slate-600 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white p-4 rounded-full shadow-xl hover:shadow-2xl z-50 transform hover:scale-110 transition-all duration-300 group ${
          showScrollButtons ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
        }`}
        title="Voltar ao topo"
      >
        <FiArrowUp className="w-6 h-6 group-hover:animate-bounce" />
      </button>

      {/* Botão de Navegação Rápida - Melhorado */}
      <div className={`fixed bottom-6 left-6 z-50 transition-all duration-300 ${
        showScrollButtons ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
      }`}>
        <div className="bg-slate-100 dark:bg-slate-800 rounded-lg shadow-xl border border-slate-300 dark:border-slate-600 p-2">
          <div className="flex flex-col gap-2">
            <button
              onClick={() => document.getElementById('definicao')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-10 h-10 bg-slate-200 dark:bg-slate-700 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-lg flex items-center justify-center transition-colors"
              title="Definição Legal"
            >
              <FiFileText className="w-4 h-4 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-300" />
            </button>
            <button
              onClick={() => document.getElementById('legislacao')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-10 h-10 bg-slate-200 dark:bg-slate-700 hover:bg-indigo-200 dark:hover:bg-indigo-800 rounded-lg flex items-center justify-center transition-colors"
              title="Legislação"
            >
              <FiFileText className="w-4 h-4 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-300" />
            </button>
            <button
              onClick={() => document.getElementById('riscos')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-10 h-10 bg-slate-200 dark:bg-slate-700 hover:bg-orange-200 dark:hover:bg-orange-800 rounded-lg flex items-center justify-center transition-colors"
              title="Riscos Sanitários"
            >
              <FiAlertTriangle className="w-4 h-4 text-slate-600 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-300" />
            </button>
            <button
              onClick={() => document.getElementById('acoes')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-10 h-10 bg-slate-200 dark:bg-slate-700 hover:bg-green-200 dark:hover:bg-green-800 rounded-lg flex items-center justify-center transition-colors"
              title="Ações e Atividades"
            >
              <FiTarget className="w-4 h-4 text-slate-600 dark:text-slate-300 hover:text-green-600 dark:hover:text-green-300" />
            </button>
            <button
              onClick={() => document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-10 h-10 bg-slate-200 dark:bg-slate-700 hover:bg-purple-200 dark:hover:bg-purple-800 rounded-lg flex items-center justify-center transition-colors"
              title="Perguntas Frequentes"
            >
              <FiHelpCircle className="w-4 h-4 text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-300" />
            </button>
            <button
              onClick={() => document.getElementById('equipe')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-10 h-10 bg-slate-200 dark:bg-slate-700 hover:bg-teal-200 dark:hover:bg-teal-800 rounded-lg flex items-center justify-center transition-colors"
              title="Nossa Equipe"
            >
              <FiUsers className="w-4 h-4 text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-300" />
            </button>
          </div>
        </div>
      </div>

      {/* Seção da Equipe */}
      <div id="equipe">
      <FotoComHistoria
        src="/images/logo/logoVisa.png"
        title="Frota preparada"
  description="Equipe equipada para qualquer situação: viaturas e profissionais preparados para fiscalizações, inspeções e ações de vigilância sanitária em toda a cidade."
      />
      <FotoComHistoria
        src="/images/logo/logoVisa.png"
        title="Viaturas e Motolâncias"
  description="Detalhe das viaturas: veículos adaptados para inspeções sanitárias, transporte de amostras e atendimento a demandas de saúde pública."
        imageLeft={true}
      />
      <FotoComHistoria
        src="/images/logo/logoVisa.png"
        title="Organização da base"
  description="Organização, disciplina e cuidado: cada detalhe da base reforça o compromisso da Vigilância Sanitária com a excelência na proteção da saúde coletiva."
      />

     

         <VideoComHistoria
        url="https://www.youtube.com/embed/iqQFVVAJ__g?si=-ixGMdvo4BODvhc9"
        title="Vídeo Institucional"
  description="Conheça mais sobre nossa história, conquistas e o papel fundamental da Vigilância Sanitária na saúde pública."
        coverImage="/images/logo/logoVisa.png"
        centered
        />

        <VideoComHistoria
        url="https://www.youtube.com/embed/iqQFVVAJ__g?si=-ixGMdvo4BODvhc9"
        title="O Ano era 2023"
  description="Inauguração da nova sede da Vigilância Sanitária, ampliando a capacidade de fiscalização e atendimento à população."
        coverImage="/images/logo/logoVisa.png"
        />

      
        


      <div className="mb-20">
        <ImagemFullWidth
          src="/images/banner/banner-VISA.jpg"
          heightClass="h-[350px]"
          alt="Outro destaque"
        />
      </div>
      </div>
    </div>
  );
}

export default InstitucionalPage;
