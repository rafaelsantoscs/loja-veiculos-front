"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

export interface Slide {
  id: number;
  image: string;
  caption: string;
}

interface SlideshowProps {
  slides: Slide[];
}

const SlideShow: React.FC<SlideshowProps> = ({ slides }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 10000);

    return () => clearInterval(intervalId);
  }, [slides.length]);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? slides.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  };

  if (slides.length === 0) {
    return null; // or return <div>Loading...</div>;
  }

  return (
    <div className="relative w-full h-100 flex flex-col items-center justify-center">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={slide.image}
            alt={slide.caption}
            layout="fill"
            objectFit="cover"
            className="rounded-lg"
            priority={index === currentIndex}
          />
        </div>
      ))}

      {/* Legenda com cores adaptadas */}
      <div className="mt-4 p-4 text-sm text-center w-full absolute bottom-0 bg-samu-vermelho bg-opacity-80 text-white dark:bg-samu-vermelhoEscuro dark:text-samu-branco">
        {slides[currentIndex].caption}
      </div>


      {/* Botões de navegação com cores da paleta */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 bg-samu-vermelho hover:bg-adm-azulEscuro text-white dark:bg-adm-azulEscuro dark:hover:bg-samu-vermelho p-2 rounded-full shadow-lg transition focus:outline-none"
        aria-label="Slide anterior"
      >
        &#10094;
      </button>

      <button
        onClick={goToNext}
        className="absolute right-4 bg-samu-vermelho hover:bg-adm-azulEscuro text-white dark:bg-adm-azulEscuro dark:hover:bg-samu-vermelho p-2 rounded-full shadow-lg transition focus:outline-none"
        aria-label="Próximo slide"
      >
        &#10095;
      </button>

      {/* Indicadores com contraste adequado */}
      <div className="absolute bottom-10 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-3 w-3 rounded-full focus:outline-none transition-colors ${
              index === currentIndex
                ? "bg-adm-azulEscuro dark:bg-samu-branco"
                : "bg-white/40 dark:bg-slate-600"
            }`}
            aria-label={`Ir para o slide ${index + 1}`}
          ></button>
        ))}
      </div>
    </div>
  );
};

export default SlideShow;
