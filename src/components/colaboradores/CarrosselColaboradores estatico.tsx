// src/components/colaboradores/CarrosselColaboradores.tsx
"use client";
import { Colaborador } from "@/types/types";
import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface CarrosselColaboradoresProps {
  colaboradores: Colaborador[];
  onSelecionarColaborador: (colab: Colaborador) => void;
  onVoltar: () => void;
}

export default function CarrosselColaboradores({
  colaboradores,
  onSelecionarColaborador,
  onVoltar,
}: CarrosselColaboradoresProps) {
  const [selectedIndex, setSelectedIndex] = useState(Math.floor(colaboradores.length / 2));
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaY > 0) {
        setSelectedIndex((prev) => (prev + 1) % colaboradores.length);
      } else if (e.deltaY < 0) {
        setSelectedIndex((prev) => (prev - 1 + colaboradores.length) % colaboradores.length);
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [colaboradores.length]);

  return (
    // <div className="fixed inset-0 bg-white dark:bg-[#2d3142] z-50 flex flex-col">
         <div
        className="fixed inset-0 z-50 flex flex-col 
        bg-white dark:bg-[#2d3142] 
        bg-cover bg-center 
        bg-[url('/images/colaboradores/samu-light.jpg')] 
        dark:bg-[url('/images/colaboradores/samu-dark.jpg')]"
      >
      <button
        onClick={onVoltar}
        // className="absolute top-4 left-4 bg-samu-azul text-white px-4 py-2 rounded-full shadow-lg z-50 sm:px-4 sm:py-2 sm:text-base"
         className="absolute top-2 left-2 bg-samu-azul text-white px-2 py-1 text-xs rounded-full shadow-md z-50 sm:top-4 sm:left-4 sm:px-4 sm:py-2 sm:text-base"
      >
        ← Voltar
      </button>

      <div className="mt-24 text-center px-4">
        <h1 className="lg:text-title-xl font-bold text-samu-azul dark:text-samu-branco mb-2">
          Escolha seu campeão
        </h1>
        <p className="text-md text-gray-600 dark:text-slate-300">
          Para conhecê-lo melhor, selecione abaixo.
        </p>
        <p className="mt-4 text-lg font-semibold text-samu-azul dark:text-samu-branco ">
          Você irá conhecer: <span className="lg:text-3xl text-samu-laranja  dark:text-yellow-300 font-extrabold">{colaboradores[selectedIndex]?.nome}</span>
        </p>
      </div>

      <div
        ref={containerRef}
        className="flex-1 flex items-center justify-center relative"
        style={{ perspective: "1000px", overflowX: "auto", overflowY: "hidden" }}
      >
        <div className="flex items-center justify-center relative min-w-[800px]">
          {colaboradores.map((colab, index) => {
            const visibleRange = 2;
            let offset = index - selectedIndex;

            if (offset > colaboradores.length / 2) offset -= colaboradores.length;
            if (offset < -colaboradores.length / 2) offset += colaboradores.length;

            if (Math.abs(offset) > visibleRange) return null;

            const rotateY = offset * 20;
            const translateX = offset * 130;
            const scale = 1 - Math.abs(offset) * 0.12;

            return (
              <motion.div
                key={colab.id}
                initial={false}
                animate={{
                  transform: `
                    translateX(${translateX}px)
                    scale(${scale})
                    rotateY(${rotateY}deg)
                  `,
                  zIndex: colaboradores.length - Math.abs(offset),
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="absolute cursor-pointer"
                onClick={() => {
                  if (index === selectedIndex) {
                    onSelecionarColaborador(colab);
                  } else {
                    setSelectedIndex(index);
                  }
                }}
              >
                <div className="flex flex-col items-center w-40">
                    <div
                        className={`h-60 rounded-xl border-4 shadow-xl ${
                      index === selectedIndex
                        ? colab.raridade === "lendario"
                          ? "border-yellow-400 shadow-[0_0_40px_20px_rgba(255,215,0,0.7)]"
                          : colab.raridade === "epico"
                          ? "border-purple-500 shadow-[0_0_40px_20px_rgba(128,0,128,0.7)]"
                          : colab.raridade === "raro"
                          ? "border-blue-400 shadow-[0_0_40px_20px_rgba(0,0,255,0.7)]"
                          : "border-white"
                        : "border-white"
                    }`}

                      >
                      <Image
                      src={colab.imagem}
                      alt={colab.nome}
                      width={160}
                      height={240}
                      className="w-full h-full object-cover  overflow-hidden"
                    />
                  </div>
                  <p className="mt-2 text-center text-samu-preto dark:text-samu-branco font-semibold">
                   {colab.id} - {colab.nome}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
