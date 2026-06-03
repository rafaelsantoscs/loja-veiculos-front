"use client";

import { useState, useEffect } from 'react';
//import { TextosInstitucionais } from "@/utils/UtilsStates";
import Image from "next/image";
import Link from 'next/link';
import { FaNewspaper, FaArrowRight, FaCalendarAlt, FaQuestionCircle } from 'react-icons/fa';
import { Postagem } from '@/types/types-postagem';
import postagemService from '@/services/postagemService';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';


export const Hero = () => {
  const [ultimasNoticias, setUltimasNoticias] = useState<Postagem[]>([]);
  const [faqsDestaque, setFaqsDestaque] = useState<Postagem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        // Carregar notícias e FAQ em paralelo
        const [noticiasResponse, faqsResponse] = await Promise.all([
          postagemService.listarPublicas({ page: 0, size: 3 }),
          postagemService.buscarFAQDestaque()
        ]);
        
        setUltimasNoticias(noticiasResponse.content);
        setFaqsDestaque(faqsResponse.slice(0, 3)); // Limitar a 3 FAQs
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, []);

  return (
    <section className="w-full px-4  sm:px-6 pt-24 lg:pt-24 py-10 
    bg-white dark:bg-[#2d3142] 
        bg-cover bg-center 
        bg-[url('/images/colaboradores/samu-light.jpg')] 
        dark:bg-[url('/images/colaboradores/samu-dark.jpg')]
    ">
      

      <h1 className=" hidden md:block text-3xl sm:text-4xl md:text-5xl font-bold mb-8 leading-tight text-center text-samu-vermelho dark:text-camutanga-branco">
         Sistema de Chamados de TI - CTIC
      </h1>

      <div className="max-w-7xl mx-auto flex flex-col-reverse lg:flex-row items-center justify-between gap-12">
        {/* Texto principal */}
        <div className="w-full lg:w-1/2 text-slate-900 dark:text-white">
       <p className="text-base sm:text-lg md:text-xl leading-relaxed text-justify text-slate-700 dark:text-slate-100">
      O SISATI é um sistema moderno, seguro e inteligente desenvolvido
      para otimizar a gestão dos chamados técnicos do setor de Tecnologia da Informação
      da Secretaria de Saúde de Vitória de Santo Antão.
      Disponível 24 horas por dia, a plataforma permite o registro, acompanhamento e controle
      de solicitações relacionadas a manutenção de computadores, suporte a sistemas, rede e equipamentos.
      Com uma interface intuitiva e recursos que facilitam a comunicação entre os usuários e a equipe técnica,
      o SISATI garante mais agilidade, transparência e eficiência no atendimento às demandas tecnológicas.
      O sistema é utilizado por servidores e gestores para monitorar chamados em tempo real
      e apoiar a tomada de decisões com base em dados atualizados e precisos,
      contribuindo para o bom funcionamento das atividades administrativas e de saúde do município.
      </p>

        </div>

          {/* Imagem + texto institucional */}
          <div className="w-full lg:w-1/2 flex flex-col items-center text-center">
            <div className="relative flex flex-col items-center">
              <Image
                src="/images/logo/CTIC.png"
                alt="Logotipo CTIC"
                width={300}
                height={300}
                className="object-contain"
                priority
              />

              <p className="absolute -bottom-2 sm:-bottom-3 md:-bottom-4 lg:-bottom-6 left-1/2 -translate-x-1/2 text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-wide text-adm-azul dark:text-samu-branco mb-8">
                
              </p>
            </div>
          </div>

      </div>

      {/* Card das Últimas Notícias - só aparece se houver notícias */}
      {!loading && ultimasNoticias.length > 0 && (
        <div className="max-w-7xl mx-auto mt-16 mb-8">
          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            {/* Cabeçalho do Card */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FaNewspaper className="text-white text-2xl" />
                  <h3 className="text-xl font-bold text-white">Últimas Notícias</h3>
                </div>
                <Link 
                  href="/noticias"
                  className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105"
                >
                  <span className="font-medium">Ver todas</span>
                  <FaArrowRight className="text-sm" />
                </Link>
              </div>
            </div>

            {/* Conteúdo do Card */}
            <div className="p-6">
              <div className="grid md:grid-cols-3 gap-6">
                {ultimasNoticias.map((noticia) => (
                  <Link 
                    key={noticia.id} 
                    href="/noticias"
                    className="group bg-slate-50 dark:bg-slate-700 rounded-lg p-4 hover:shadow-lg transition-all duration-200 hover:scale-105 border border-slate-200 dark:border-slate-600"
                  >
                    <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 overflow-hidden">
                      <span className="block overflow-hidden text-ellipsis whitespace-nowrap">
                        {noticia.titulo}
                      </span>
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-3 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                      {noticia.conteudo.replace(/<[^>]*>/g, '')}
                    </p>
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <FaCalendarAlt />
                        <span>{format(new Date(noticia.dataPublicacao), 'dd/MM/yyyy', { locale: ptBR })}</span>
                      </div>
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-xs">
                        {noticia.categoria}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Card de FAQ em Destaque - só aparece se houver FAQs */}
      {!loading && faqsDestaque.length > 0 && (
        <div className="max-w-7xl mx-auto mt-8 mb-8">
          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            {/* Cabeçalho do Card FAQ */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 dark:from-green-700 dark:to-green-800 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FaQuestionCircle className="text-white text-2xl" />
                  <h3 className="text-xl font-bold text-white">Perguntas Frequentes</h3>
                </div>
                <Link 
                  href="/faq"
                  className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105"
                >
                  <span className="font-medium">Ver todas</span>
                  <FaArrowRight className="text-sm" />
                </Link>
              </div>
            </div>

            {/* Conteúdo do Card FAQ */}
            <div className="p-6">
              <div className="grid md:grid-cols-3 gap-6">
                {faqsDestaque.map((faq) => (
                  <Link 
                    key={faq.id} 
                    href="/faq"
                    className="group bg-slate-50 dark:bg-slate-700 rounded-lg p-4 hover:shadow-lg transition-all duration-200 hover:scale-105 border border-slate-200 dark:border-slate-600"
                  >
                    <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-2 group-hover:text-green-600 dark:group-hover:text-green-400 overflow-hidden text-sm">
                      <span className="block overflow-hidden text-ellipsis" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {faq.titulo}
                      </span>
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mb-3 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {faq.conteudo.replace(/<[^>]*>/g, '')}
                    </p>
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <FaQuestionCircle />
                        <span>{faq.visualizacoes} visualizações</span>
                      </div>
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-xs">
                        FAQ
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
         
      {/* <div className="w-full mt-12">
        <Image
          src="/images/banner/banner-VISA.jpg"
          alt="Banner frota vsa"
          width={1300}
          height={200}
          className="object-contain w-full h-auto rounded"
          priority
        />
      </div> */}



 {/* Parallax aprimorado com overlay escuro para contraste */}
<div className="relative w-full">
  {/* Fundo com parallax */}
  <div className="bg-samu-parallax bg-fixed bg-center bg-cover w-full py-40 sm:py-64">
    {/* Overlay escuro para melhorar a leitura do texto */}
    <div className="absolute inset-0 bg-samu-azul/50 backdrop-brightness-75"></div>

    {/* Conteúdo centralizado */}
    <div className="relative z-10 flex items-center justify-center h-full px-4">
      <h2 className="text-white text-3xl sm:text-5xl font-bold
       text-center drop-shadow-lg">
        CENTRO DE TECNOLOGIA DA INFORMAÇÃO E COMUNICAÇÃO - CTIC
      </h2>
    </div>
  </div>
</div>




    </section>
  );
};
