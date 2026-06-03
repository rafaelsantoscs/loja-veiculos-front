'use client';

import React, { useState, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import TinyMCEUsageTracker from './TinyMCEUsageTracker';
import SimpleTextEditor from './SimpleTextEditor';

interface TinyMCEEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  height?: number;
  showUsageTracker?: boolean;
}

const TinyMCEEditor: React.FC<TinyMCEEditorProps> = ({
  value,
  onChange,
  placeholder = 'Digite o conteúdo...',
  height = 400,
  showUsageTracker = true
}) => {
  const [usage, setUsage] = useState<number>(0);
  const [limit] = useState<number>(1000);

  useEffect(() => {
    // Monitora o uso da API
    const currentUsage = parseInt(localStorage.getItem('tinymce_usage') || '0');
    setUsage(currentUsage);
  }, []);
  
  const handleEditorChange = (content: string) => {
    onChange(content);
  };

  // Se atingiu o limite, usa editor simples
  const isLimitReached = usage >= limit;

  if (isLimitReached) {
    return (
      <div>
        {showUsageTracker && <TinyMCEUsageTracker />}
        <SimpleTextEditor
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          height={height}
        />
      </div>
    );
  }

  return (
    <div>
      {showUsageTracker && <TinyMCEUsageTracker />}
      
      <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
      <Editor
        apiKey="b0i9zzb28g9g84c0c9neq2m8r566je7qkkrkxmqj2meuh01a"
        value={value}
        onEditorChange={handleEditorChange}
        init={{
          height: height - 20,
          menubar: true,
          placeholder: placeholder,
          
          // Toolbar simplificada que funciona
          toolbar: 'undo redo | formatselect | fontselect fontsizeselect | bold italic underline | forecolor | alignleft aligncenter alignright | bullist numlist | link | removeformat',
          
          // Plugins mínimos necessários
          plugins: [
            'autolink', 'lists', 'link', 'searchreplace', 'table', 'wordcount'
          ],
          
          // Configurações básicas de fonte
          font_formats: 
            'Arial=arial,helvetica,sans-serif; ' +
            'Times New Roman=times new roman,times,serif; ' +
            'Calibri=calibri,sans-serif; ' +
            'Georgia=georgia,serif; ' +
            'Verdana=verdana,sans-serif; ' +
            'Courier New=courier new,courier,monospace; ' +
            'Impact=impact,sans-serif',
            
          fontsize_formats: '8pt 10pt 12pt 14pt 16pt 18pt 20pt 24pt 30pt 36pt 48pt 60pt 72pt',
          
          // Configurações básicas
          branding: false,
          resize: false,
          statusbar: true,
          wordcount: true,
          promotion: false, // Remove o botão "Explore trial"
          
          // Configurações de idioma
          language: 'pt_BR',
          
          // Configurações de conteúdo
          content_style: `
            body { 
              font-family: Arial, sans-serif; 
              font-size: 14px; 
              line-height: 1.5;
              margin: 1rem;
            }
          `,
          
          // Configurações de setup
          setup: (editor) => {
            editor.on('init', () => {
              console.log('TinyMCE Editor inicializado com seletores de fonte');
            });
          }
        }}
      />
      </div>
    </div>
  );
};

export default TinyMCEEditor;
