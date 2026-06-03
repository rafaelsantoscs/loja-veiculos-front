"use client";
import { useState } from "react";
import Image from "next/image";
import { FiZoomIn, FiZoomOut } from "react-icons/fi";

interface FotoComHistoriaProps {
  src: string;
  title: string;
  description: string;
  imageLeft?: boolean;
}

export default function FotoComHistoria({ src, title, description, imageLeft = false }: FotoComHistoriaProps) {
  const [fullscreen, setFullscreen] = useState(false);
  const [closing, setClosing] = useState(false);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setFullscreen(false);
      setClosing(false);
    }, 300); // TEMPO EXATO DA ANIMAÇÃO
  };

  return (
    <>
      <div className={`flex flex-col md:flex-row items-center lg:ml-10 p-4 rounded-lg ${imageLeft ? "md:flex-row-reverse" : ""}`}>
        {/* IMAGEM PEQUENA */}
        <div
          className="relative cursor-pointer border-4 
          border-transparent hover:border-yellow-300 
          transition-all duration-300 transform rotate-[-5deg] hover:scale-105"
          onClick={() => setFullscreen(true)}   
        >
          <Image
            src={src}
            alt={title}
            width={300}
            height={300}
            className="object-cover rounded-lg shadow-lg"
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
            <FiZoomIn size={50} className="text-white drop-shadow-lg" />
          </div>
        </div>

        {/* TEXTO */}
        <div className="md:ml-8 mt-4 md:mt-0 text-samu-azul
         dark:text-samu-branco max-w-md">
          <h2 className="text-3xl font-bold mb-2">{title}</h2>
          <p className="text-lg leading-relaxed">{description}</p>
        </div>
      </div>

      {/* MODAL FULLSCREEN */}
      {fullscreen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
          onClick={() => handleClose()}  // 👈 CLICOU FORA → FECHAR COM ANIMAÇÃO
        >
          {/* BOTÃO FECHAR */}
          <FiZoomOut
            size={40}
            className="absolute top-5 right-5 text-white cursor-pointer drop-shadow-lg"
            onClick={(e) => {
              e.stopPropagation(); // NÃO FECHA AO CLICAR NO BOTÃO
              handleClose();
            }}
          />

          {/* IMAGEM FULLSCREEN */}
          <div
            className={`relative w-[90vw] h-[90vh] ${
              closing
                ? (imageLeft ? 'animate-fadeOutToRight' : 'animate-fadeOutToLeft')
                : (imageLeft ? 'animate-fadeInFromRight' : 'animate-fadeInFromLeft')
            }`}
            onClick={(e) => e.stopPropagation()} // NÃO FECHAR AO CLICAR NA IMAGEM
          >
            <Image
              src={src}
              alt={title}
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}
