"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const slides = [
  {
    title: "História de Vitória de Santo Antão",
    description:
      "Fundada em 1626, a cidade possui uma rica história ligada à resistência contra a invasão holandesa. Conhecida pela Batalha do Monte das Tabocas, é símbolo de coragem e tradição pernambucana.",
    image: "/images/colaboradores/profile1.jpg",
  },
  {
    title: "Cultura e Tradições",
    description:
      "O Carnaval da cidade é famoso pelos blocos de rua e pelas alegorias. A festa de Santo Antão, em janeiro, é uma das mais antigas do Brasil e atrai milhares de fiéis.",
    image: "/images/colaboradores/profile1.jpg",
  },
  {
    title: "Natureza e Turismo",
    description:
      "Vitória de Santo Antão encanta com sua paisagem de Mata Atlântica, além de ser banhada pelo Rio Tapacurá. Um convite ao ecoturismo e ao lazer em meio à natureza.",
    image: "/images/colaboradores/profile1.jpg",
  },
];

const Apresentacao = ({ onVoltar }: { onVoltar: () => void }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

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

  return (
    <>
      <div
        ref={scrollRef}
        // className="w-screen h-screen overflow-x-scroll flex snap-x snap-mandatory scroll-smooth relative"
      className="fixed inset-0 overflow-x-auto overflow-y-hidden flex snap-x snap-mandatory scroll-smooth bg-slate-800"
      >
        {/* Botão Voltar */}
        <button
          onClick={onVoltar}
          className="fixed top-4 left-4 bg-pink-600 text-white px-4 py-2 rounded-full z-50 shadow-lg"
        >
          ← Voltar
        </button>

        {/* Slides */}
        {slides.map((slide, i) => (
          <div
            key={i}
            className="w-screen h-screen flex-shrink-0 snap-start 
            flex items-center justify-center p-10 transition-transform 
            duration-700 ease-in-out bg-slate-800"
          >
            <div className="text-white text-center max-w-2xl">
              <h2 className="text-4xl font-extrabold mb-6">{slide.title}</h2>
              <p className="text-lg mb-6">{slide.description}</p>
              <div
                className="rounded-xl overflow-hidden shadow-xl cursor-pointer 
                border-4 border-white hover:border-yellow-300 hover:scale-105
                 transition-all duration-300"
                onClick={() => setFullscreenImage(slide.image)}
              >
                <Image
                  src={slide.image}
                  alt={slide.title}
                  width={300}
                  height={100}
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
