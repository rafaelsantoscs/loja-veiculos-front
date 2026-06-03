"use client";
import { useState } from "react";
import { FiZoomIn, FiZoomOut } from "react-icons/fi";

interface VideoComHistoriaProps {
  url: string;
  title: string;
  description: string;
  coverImage: string;
  imageLeft?: boolean;
  centered?: boolean;
  textFirst?: boolean

}

export default function VideoComHistoria({
  url,
  title,
  description,
  coverImage,
  imageLeft = false,
  centered = false,
  textFirst = false,
}: VideoComHistoriaProps) {
  const [fullscreen, setFullscreen] = useState(false);
  const [closing, setClosing] = useState(false);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setFullscreen(false);
      setClosing(false);
    }, 300); // TEMPO DA ANIMAÇÃO
  };

  return (
    <>
      {/* <div className={`flex flex-col md:flex-row items-center lg:ml-10 p-4 rounded-lg ${imageLeft ? "md:flex-row-reverse" : ""}`}> */}
      {/* <div
        className={`flex ${
          centered ? 'flex-col items-center' : `flex-col md:flex-row items-center lg:ml-10 ${imageLeft ? "md:flex-row-reverse" : ""}`
        } p-4 rounded-lg`}
      > */}
            <div
            className={`flex ${
              centered
                ? 'flex-col items-center'
                : `flex-col md:flex-row items-center lg:ml-10 ${textFirst ? 'md:flex-row-reverse' : ''}`
            } p-4 rounded-lg`}
          >


        {/* CAPA PEQUENA */}
       {/* <div
        className="relative cursor-pointer border-4 border-transparent hover:border-yellow-300 transition-all duration-300 transform rotate-[-5deg] hover:scale-105 w-full max-w-[300px] aspect-video bg-cover bg-center bg-no-repeat rounded-lg shadow-lg"
        style={{ backgroundImage: `url(${coverImage})` }}
        onClick={() => setFullscreen(true)}
      > */}
     {/* <div
      className={`relative cursor-pointer border-4 border-transparent hover:border-yellow-300 transition-all duration-300 ${
        centered ? "mx-auto hover:scale-105" : "transform rotate-[-5deg] hover:scale-105"
      } w-full max-w-[300px] aspect-video bg-cover bg-center bg-no-repeat rounded-lg shadow-lg`}
      style={{ backgroundImage: `url(${coverImage})` }}
      onClick={() => setFullscreen(true)}
    > */}
            <div
                className={`relative cursor-pointer border-4 border-transparent hover:border-yellow-300 transition-all duration-300 ${
                  centered ? "mx-auto hover:scale-105" : "transform rotate-[-5deg] hover:scale-105"
                } w-[300px] h-[170px] bg-cover bg-center bg-no-repeat rounded-lg shadow-lg`}
                style={{ backgroundImage: `url(${coverImage})` }}
                onClick={() => setFullscreen(true)}
              >




          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
            <FiZoomIn size={50} className="text-white drop-shadow-lg" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-samu-vermelho opacity-80" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        {/* TEXTO */}
        <div className="md:ml-8 mt-4 md:mt-0 text-samu-azul dark:text-samu-branco max-w-md">
          <h2 className="text-3xl font-bold mb-2 text-center">{title}</h2>
          <p className="text-lg leading-relaxed text-center">{description}</p>
        </div>
      </div>

      {/* MODAL FULLSCREEN */}
      {fullscreen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50" onClick={() => handleClose()}>
          <FiZoomOut
            size={40}
            className="absolute top-5 right-5 text-white cursor-pointer drop-shadow-lg"
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
          />

          {/* VIDEO FULLSCREEN */}
          <div
            className={`relative w-[90vw] h-[90vh] ${
              closing
                ? imageLeft ? 'animate-fadeOutToRight' : 'animate-fadeOutToLeft'
                : imageLeft ? 'animate-fadeInFromRight' : 'animate-fadeInFromLeft'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              src={`${url}?autoplay=1&controls=1`}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full rounded-lg"
            ></iframe>
          </div>
        </div>
      )}
    </>
  );
}
