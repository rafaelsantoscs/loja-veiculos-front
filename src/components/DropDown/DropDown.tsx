import React, { useState, useRef, useEffect } from 'react';

interface DropdownProps {
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectOptions: string[];
  name?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
  handleChange,
  selectOptions,
  name,
}) => {
  const [searchTerm, setSearchTerm] = useState(''); // Termo de pesquisa
  const [isOpen, setIsOpen] = useState(false); // Visibilidade do dropdown
  const dropdownRef = useRef<HTMLDivElement | null>(null); // Referência para o dropdown
 


  // Filtra as opções com base no termo de pesquisa
  const filteredOptions = selectOptions.filter((option) =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

    // Fechar dropdown ao clicar fora
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };
  
      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      }
  
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen]);

   // Selecionar uma opção
   const handleOptionSelect = (option: string) => {
    setSearchTerm(option); // Atualiza o valor exibido no campo de entrada
    setIsOpen(false); // Fecha o dropdown

    // Cria um evento sintético para comunicar a mudança ao componente pai
    const event = {
      target: {
        name: name,
        value: option,
      },
    } as React.ChangeEvent<HTMLInputElement>;

    handleChange(event);
  };

  return (
    <div ref={dropdownRef} className="relative">
      <input
        type="text"
        placeholder="Exibir dados por função..."
        autoComplete="off"
        name={name}
        className="border border-gray-300 w-full p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={searchTerm} // Usa searchTerm como valor controlado
        onFocus={() => setIsOpen(true)} // Abre o dropdown ao focar
        onChange={(e) => {
          setSearchTerm(e.target.value); // Atualiza o termo de pesquisa
          handleChange(e); // Comunica a mudança ao componente pai
        }}
      />
      {isOpen && (
        <div className="border border-gray-300 absolute max-h-75 overflow-auto bg-white w-full z-10 rounded-md mt-1">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <div
                key={index}
                onClick={() => handleOptionSelect(option)} // Seleciona a opção clicada
                className="p-2 cursor-pointer hover:bg-blue-100"
              >
                {option}
              </div>
            ))
          ) : (
            <div className="p-2">Nenhuma opção encontrada</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
