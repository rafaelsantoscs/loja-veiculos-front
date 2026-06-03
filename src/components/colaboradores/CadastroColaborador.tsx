"use client";
import { Colaborador } from "@/types/types";
import { useState } from "react";

interface CadastroColaboradorProps {
  onAdicionar: (novoColaborador: Colaborador) => void;
  onFechar: () => void;
}

export default function CadastroColaborador({ onAdicionar, onFechar }: CadastroColaboradorProps) {
  const [nome, setNome] = useState("");
  const [imagem, setImagem] = useState("");
  
  // Para um exemplo simples, você pode adicionar slides manualmente depois
  const handleSalvar = () => {
    const novoColaborador: Colaborador = {
      id: Date.now(), // ID simples
      nome,
      imagem,
      slides: [],
    };
    onAdicionar(novoColaborador);
    onFechar();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-[#2d3142] p-6 rounded-xl shadow-xl w-80">
        <h2 className="text-xl font-bold mb-4 text-samu-azul dark:text-samu-branco">
          Adicionar Colaborador
        </h2>
        <input
          type="text"
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
        />
        <input
          type="text"
          placeholder="URL da Imagem"
          value={imagem}
          onChange={(e) => setImagem(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
        />
        <div className="flex justify-end space-x-2">
          <button
            onClick={onFechar}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancelar
          </button>
          <button
            onClick={handleSalvar}
            className="px-4 py-2 bg-samu-azul text-white rounded hover:bg-samu-vermelho"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
