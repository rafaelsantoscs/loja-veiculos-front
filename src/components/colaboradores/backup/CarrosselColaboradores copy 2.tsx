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
  

  // 🎯 Scroll para girar o carrossel
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
    <div className="fixed inset-0 bg-white dark:bg-[#2d3142] z-50 flex flex-col">
      {/* Botão voltar */}
      <button
        onClick={onVoltar}
        className="absolute top-4 left-4 bg-pink-600 text-white px-4 py-2 rounded-full shadow-lg z-50"
      >
        ← Voltar
      </button>

      {/* Texto acima */}
      <div className="mt-24 text-center px-4">
        <h1 className="text-2xl font-bold text-samu-azul dark:text-samu-branco mb-2">
          Escolha seu campeão
        </h1>
        <p className="text-md text-gray-600 dark:text-gray-300">
          Para conhecê-lo melhor, selecione abaixo.
        </p>
        <p className="mt-4 text-lg font-semibold text-samu-vermelho dark:text-yellow-300">
          Campeão selecionado: {colaboradores[selectedIndex]?.nome}
        </p>
      </div>

      {/* Carrossel 3D com scroll */}
      <div
        ref={containerRef}
        className="flex-1 flex items-center justify-center relative"
        style={{ perspective: "1000px", overflowX: "auto", overflowY: "hidden" }}
      >
        <div className="flex items-center justify-center relative min-w-[800px]">
          {colaboradores.map((colab, index) => {
            const offset = index - selectedIndex;
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
                <div className={`w-40 h-60 rounded-xl overflow-hidden shadow-xl border-4 ${
                  index === selectedIndex
                    ? "border-yellow-300 scale-105"
                    : "border-white"
                }`}>
                  <Image
                    src={colab.imagem}
                    alt={colab.nome}
                    width={160}
                    height={240}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="mt-2 text-center text-white font-semibold">
                  {colab.nome}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
