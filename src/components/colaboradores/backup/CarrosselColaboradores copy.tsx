// src/components/colaboradores/CarrosselColaboradores.tsx
"use client";
import { Colaborador } from "@/types/types";
import Image from "next/image";



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
  return (
    <div className="fixed inset-0 bg-white dark:bg-[#2d3142] z-50 overflow-x-auto flex flex-col">
      
      {/* Botão voltar fixo */}
      <button
        onClick={onVoltar}
        className="absolute top-4 left-4 bg-pink-600 text-white px-4 py-2 rounded-full shadow-lg z-50"
      >
        ← Voltar
      </button>

      {/* Carrossel de perfis */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full overflow-x-auto flex space-x-4 p-4 scroll-smooth">
          {colaboradores.map((colab) => (
            <div
              key={colab.id}
              onClick={() => onSelecionarColaborador(colab)}
              className="flex flex-col items-center cursor-pointer"
            >
              <div 
              className="w-200 h-200 rounded overflow-hidden 
              border-4 border-white hover:border-yellow-300 
              transition-all duration-300 shadow-md hover:scale-105"
              // className="w-28 h-28 rounded-full overflow-hidden 
              // ring-4 ring-samu-azul dark:ring-samu-laranja shadow-xl"
              >

                <Image
                  src={colab.imagem}
                  alt={colab.nome}
                //   width={96}
                //   height={96}
                width={100}
                height={300}
                  className="object-cover"
                  // className="object-contain"
                />
              </div>
              <span className="mt-2 text-samu-azul dark:text-samu-branco 
              text-sm font-semibold">
                {colab.nome}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
