import React, { useState, useRef, useEffect } from 'react';

interface DropdownWithSearchProps {
  liberarCampos?: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectOptions: string[];
  name?: string;
  propiedadeParaEdição?: string;
}

const DropdownWithSearch: React.FC<DropdownWithSearchProps> = ({
  liberarCampos,
  handleChange,
  selectOptions,
  name,
  propiedadeParaEdição,
}) => {
  const [searchTerm, setSearchTerm] = useState(''); // Manages search input
  const [isOpen, setIsOpen] = useState(false); // Manages dropdown visibility
  const [selectedOption, setSelectedOption] = useState(''); // Manages selected item
  const dropdownRef = useRef<HTMLDivElement | null>(null); // Ref for dropdown
 



  const filteredOptions = selectOptions.filter((option) =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Effect to handle clicks outside the dropdown, but only when input is focused
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false); // Close dropdown when clicked outside
        // If no option is selected, clear the search term
        if (!selectedOption) {
          setSearchTerm(''); // Clear input field
          const resetEvent = {
            target: {
              name: name,
              value: '', // Reset value
            },
          } as React.ChangeEvent<HTMLInputElement>;
          handleChange(resetEvent); // Trigger parent state reset
        }
      }
    };

    // Add event listener only when the dropdown is open (input is focused)
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Clean up the event listener when dropdown closes or unmounts
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, dropdownRef, selectedOption, handleChange, name]);

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option); // Set the selected option
    setSearchTerm(''); // Clear the search input
    setIsOpen(false); // Close dropdown

    // Create a synthetic event to update the parent state
    const event = {
      target: {
        name: name, // Use the dropdown's name
        value: option, // The selected option
      },
    } as React.ChangeEvent<HTMLInputElement>;

    handleChange(event); // Trigger change in parent component
  };

  return (
    <div ref={dropdownRef} className="relative">
      <input
        type="text"
        placeholder="Pesquisar..."
        autoComplete='off'
        name={name}
        className={`border border-gray-300 w-full p-2 rounded-md ${
          !liberarCampos ? 'bg-slate-200 placeholder-opacity-100 pointer-events-none' : ''
        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
        value={(propiedadeParaEdição === '') ? '' : (propiedadeParaEdição || selectedOption || searchTerm) }
        onFocus={() => setIsOpen(true)} // Open dropdown on focus
        onChange={(e) => {
         
          setSearchTerm(e.target.value); // Update the search term as user types
          setSelectedOption(''); // Clear selected option when typing
          handleChange(e); // Trigger change in parent component
        }}
      />
      {isOpen && (
        <div className="border border-gray-300 absolute max-h-75 overflow-auto bg-white w-full z-10 rounded-md mt-1">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <div
                key={index}
                onClick={() => handleOptionSelect(option)} // Select the clicked option
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

export default DropdownWithSearch;
