// src/app/abastecimento-offline/page-debug.tsx

'use client';

import React, { useState, useEffect } from 'react';

interface DadosVeiculo {
  placa?: string;
  modelo?: string;
  combustivel?: string;
  motorista?: string;
  kmInicioMapa?: string;
  destino?: string;
}

// Versão simplificada para debug
const AbastecimentoOfflinePage: React.FC = () => {
  console.log('🚨 PÁGINA CARREGOU - PRIMEIRO LOG SEMPRE DEVE APARECER');

  const [dados, setDados] = useState<DadosVeiculo | null>(null);

  useEffect(() => {
    console.log('🚨 USEEFFECT EXECUTOU - SEGUNDO LOG');
    
    try {
      console.log('🔍 Tentando acessar localStorage...');
      const dadosStorage = localStorage.getItem('veiculo_ativo_offline');
      console.log('📄 Dados brutos:', dadosStorage);
      
      if (dadosStorage) {
        const dadosParsed = JSON.parse(dadosStorage);
        console.log('✅ Dados parseados:', dadosParsed);
        setDados(dadosParsed);
      } else {
        console.log('❌ Nenhum dado encontrado');
      }
    } catch (error) {
      console.error('❌ Erro:', error);
    }
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>🔧 Debug Abastecimento Offline</h1>
      
      <div style={{ margin: '20px 0', padding: '15px', background: '#f0f0f0' }}>
        <h3>Status:</h3>
        <div>Página carregada: ✅</div>
        <div>UseEffect executado: {dados ? '✅' : '⏳'}</div>
        <div>Dados encontrados: {dados ? '✅' : '❌'}</div>
      </div>

      {dados && (
        <div style={{ margin: '20px 0', padding: '15px', background: '#e8f5e8' }}>
          <h3>Dados do Veículo:</h3>
          <div><strong>Placa:</strong> {dados.placa}</div>
          <div><strong>Modelo:</strong> {dados.modelo}</div>
          <div><strong>Combustível:</strong> {dados.combustivel}</div>
          <div><strong>Motorista:</strong> {dados.motorista}</div>
          <div><strong>KM Inicial:</strong> {dados.kmInicioMapa}</div>
          <div><strong>Destino:</strong> {dados.destino}</div>
        </div>
      )}

      <div style={{ margin: '20px 0' }}>
        <button 
          onClick={() => {
            console.log('🔄 Botão clicado - testando localStorage');
            const teste = localStorage.getItem('veiculo_ativo_offline');
            console.log('📄 Resultado do teste:', teste);
            if (teste) {
              const parsed = JSON.parse(teste);
              setDados(parsed);
              console.log('✅ Dados setados no state:', parsed);
            }
          }}
          style={{ padding: '10px 20px', margin: '5px', cursor: 'pointer' }}
        >
          Testar localStorage
        </button>
      </div>
    </div>
  );
};

export default AbastecimentoOfflinePage;
