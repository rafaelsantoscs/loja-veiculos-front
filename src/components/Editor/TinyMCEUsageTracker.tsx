'use client';

import React, { useState, useEffect } from 'react';

const TinyMCEUsageTracker: React.FC = () => {
  const [usage, setUsage] = useState<number>(0);
  const [limit] = useState<number>(1000); // Limite do plano gratuito

  useEffect(() => {
    // Pega o uso atual do localStorage
    const currentUsage = localStorage.getItem('tinymce_usage');
    if (currentUsage) {
      setUsage(parseInt(currentUsage));
    }

    // Incrementa o contador a cada carregamento do editor
    const incrementUsage = () => {
      const newUsage = (parseInt(localStorage.getItem('tinymce_usage') || '0')) + 1;
      localStorage.setItem('tinymce_usage', newUsage.toString());
      setUsage(newUsage);
    };

    // Incrementa quando o componente monta (editor carrega)
    incrementUsage();
  }, []);

  const remaining = Math.max(0, limit - usage);
  const isLimitReached = usage >= limit;

  return (
    <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700 mb-3">
      <div className="text-sm text-gray-700 dark:text-gray-300">
        <span className="font-medium">TinyMCE:</span> {usage} usados, {remaining} restantes
      </div>
      
      {isLimitReached && (
        <div className="mt-1 text-xs text-red-600 dark:text-red-400">
          ⚠️ Limite atingido. Editor alternativo ativado.
        </div>
      )}
    </div>
  );
};

export default TinyMCEUsageTracker;
