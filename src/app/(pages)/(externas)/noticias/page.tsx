"use client";
import { useState } from 'react';
import { Navbar } from "@/components/InitialScreen/Navbar";
import { Footer } from "@/components/InitialScreen/Footer";
import { FaNewspaper, FaInfoCircle, FaSearch, FaFilter } from 'react-icons/fa';
import ListaPostagens from '@/components/Postagens/ListaPostagens';
import { CategoriaPostagem } from '@/types/types-postagem';

export default function NoticiasPage() {
  const [busca, setBusca] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<CategoriaPostagem | ''>('');

  return (
    <div className="min-h-screen bg-[url('/images/colaboradores/samu-light.jpg')] dark:bg-[url('/images/colaboradores/samu-dark.jpg')] bg-cover bg-center bg-white dark:bg-[#0c1634] mt-10">
      <Navbar />
      
      <div className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4">
          {/* Cabeçalho */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 text-blue-700 dark:text-blue-300 flex items-center justify-center gap-4">
              <FaNewspaper className="text-3xl" />
              Notícias e Informativos
              <FaInfoCircle className="text-3xl" />
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Acompanhe as últimas informações e comunicados da Vigilância Sanitária
            </p>
          </div>

          {/* Filtros */}
          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg p-6 mb-8 shadow-lg">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Busca */}
              <div className="flex-1">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por título ou conteúdo..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  />
                </div>
              </div>

              {/* Filtro por categoria */}
              <div className="md:w-64">
                <div className="relative">
                  <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    value={categoriaFiltro}
                    onChange={(e) => setCategoriaFiltro(e.target.value as CategoriaPostagem | '')}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white appearance-none"
                  >
                    <option value="">Todas as categorias</option>
                    <option value="NOTICIA">Notícias</option>
                    <option value="INFORMATIVO">Informativos</option>
                    <option value="AVISO">Avisos</option>
                    <option value="COMUNICADO">Comunicados</option>
                    <option value="FAQ">Perguntas Frequentes</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de postagens */}
          <ListaPostagens 
            busca={busca}
            categoria={categoriaFiltro || undefined}
            isPublica={true}
          />
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
