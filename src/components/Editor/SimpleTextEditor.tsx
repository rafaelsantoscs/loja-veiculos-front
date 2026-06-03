'use client';

import React from 'react';

interface SimpleTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  height?: number;
}

const SimpleTextEditor: React.FC<SimpleTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Digite o conteúdo...',
  height = 400
}) => {
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  // Remove HTML tags se o conteúdo vier do TinyMCE
  const cleanValue = value.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
      {/* Toolbar simples informativo */}
      <div className="bg-amber-50 dark:bg-amber-900/20 p-2 border-b border-amber-200 dark:border-amber-800">
        <div className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-200">
          <span>⚠️</span>
          <span>Editor simples ativo (limite TinyMCE atingido)</span>
        </div>
      </div>

      {/* Área de texto simples */}
      <textarea
        value={cleanValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full p-4 resize-none focus:outline-none bg-white dark:bg-gray-800 dark:text-white border-0 focus:ring-2 focus:ring-blue-500"
        style={{ 
          minHeight: `${height - 60}px`,
          fontFamily: 'Arial, sans-serif',
          fontSize: '14px',
          lineHeight: '1.5'
        }}
      />
    </div>
  );
};

export default SimpleTextEditor;
