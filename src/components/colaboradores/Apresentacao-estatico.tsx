"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Slide } from "@/types/types";

interface Colaborador {
  id?: number;
  nome: string;
  imagem: string;
  slides: Slide[];
}

interface Cenario {
  src: string;
  alt: string;
  descricao: string;
  position: "left" | "right";
}

interface ApresentacaoProps {
  colaborador: Colaborador | null;
  onVoltar: () => void;
}

const Apresentacao = ({ colaborador, onVoltar }: ApresentacaoProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [cenarios, setCenarios] = useState<Cenario[]>([]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        container.scrollBy({
          left: e.deltaY * 4,
          behavior: "smooth",
        });
      }
    };

    document.body.style.overflow = "hidden";
    container.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      document.body.style.overflow = "";
      container.removeEventListener("wheel", handleWheel);
    };
  }, []);

  // Carrega cenários aleatórios
  useEffect(() => {
    fetch("/data/cenarios.json")
      .then((res) => res.json())
      .then((data: Cenario[]) => {
        const shuffled = [...data].sort(() => Math.random() - 0.5);
        // pega apenas um para cada lado se houver
        const left = shuffled.find((c) => c.position === "left");
        const right = shuffled.find((c) => c.position === "right");
        setCenarios([left,right].filter(Boolean) as Cenario[]);
      });
  }, []);

  if (!colaborador) return null;

  return (
    <>
      <div
        ref={scrollRef}
        className="fixed inset-0 overflow-x-auto overflow-y-hidden flex snap-x snap-mandatory scroll-smooth bg-slate-800"
      >
        {/* Botão Voltar */}
        <button
          onClick={onVoltar}
          // className="fixed top-4 left-4 bg-samu-azul text-white px-4 py-2 rounded-full z-50 shadow-lg sm:px-4 sm:py-2 sm:text-base"
           className="fixed top-2 left-2 bg-samu-azul text-white px-2 py-1 text-xs rounded-full shadow-md z-50 sm:top-4 sm:left-4 sm:px-4 sm:py-2 sm:text-base"
        >
          ← Voltar
        </button>

        {/* Slide do colaborador com cenários aleatórios */}
        <div
          className="w-screen h-screen flex-shrink-0 snap-start 
          relative bg-slate-800 flex items-center justify-center p-10"
        >

          
          {/* Cenários laterais */}
          {cenarios.map((cenario, index) => (
            <div
              key={index}
              className={`hidden md:block absolute ${
                cenario.position === "left" ? "left-8" : "right-8"
              } top-1/2 transform -translate-y-1/2`}
            >
              <Image
                src={cenario.src}
                alt={cenario.alt}
                width={400}
                height={400}
                className="object-contain opacity-30 drop-shadow-xl "
              />
             
              
            </div>
          ))}

          {/* 🎯 Centro - colaborador */}
          <div className="flex flex-col items-center text-white">
            <div className="-rotate-3 overflow-hidden border-4 border-white mb-6">
              <Image
                src={colaborador.imagem}
                alt={colaborador.nome}
                width={350}
                height={200}
                className="object-cover"
              />
            </div>
            <h2 className="font-extrabold">{colaborador.nome}</h2>
            
          </div>
        </div>

        {/* Slides adicionais do colaborador */}
        {colaborador.slides.map((slide, i) => (
          <div
            key={i}
            className="w-screen h-screen flex-shrink-0 snap-start 
            flex items-center justify-center p-10 transition-transform 
            duration-700 ease-in-out bg-slate-800"
          >
            <div className="text-white text-center max-w-2xl">
              <h2 className="lg:text-4xl font-extrabold mb-6">{slide.title}</h2>
              <p className="text-lg mb-6">{slide.description}</p>
              <div
                className="relative w-full h-96 rounded-xl overflow-hidden shadow-xl cursor-pointer 
                border-4 border-white hover:border-yellow-300 hover:scale-105 transition-all duration-300"
                onClick={() => setFullscreenImage(slide.image)}
              >
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Tela Cheia */}
      {fullscreenImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <button
            aria-label="Fechar imagem em tela cheia"
            className="absolute top-5 right-5 bg-white text-black px-4 py-2 rounded-full shadow-lg"
            onClick={() => setFullscreenImage(null)}
          >
            Fechar
          </button>

          <div className="max-w-full max-h-full">
            <Image
              src={fullscreenImage}
              alt="Imagem em tela cheia"
              width={450}
              height={100}
              className="object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Apresentacao;
