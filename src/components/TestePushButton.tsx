// Componente de teste simples para push notifications
'use client';
import React, { useState } from 'react';

const TestePushButton: React.FC = () => {
  const [clicked, setClicked] = useState(false);

  const handleClick = () => {
    setClicked(!clicked);
    alert('Botão de teste clicado!');
    console.log('🔍 Botão de teste clicado!');
  };

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 99999,
      backgroundColor: 'red',
      color: 'white',
      padding: '10px 20px',
      borderRadius: '5px',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: 'bold',
      border: '3px solid yellow',
      boxShadow: '0 0 10px rgba(0,0,0,0.5)'
    }} onClick={handleClick}>
      {clicked ? 'CLICADO!' : 'TESTE PUSH'}
    </div>
  );
};

export default TestePushButton;
