'use client';

import React, { useEffect, useState } from 'react';

const TesteLocalStoragePage: React.FC = () => {
  const [dados, setDados] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    console.log('🧪 TESTE LOCALSTORAGE - Início');
    
    // Teste básico do localStorage
    try {
      localStorage.setItem('teste_basico', 'funcionando');
      const testeBasico = localStorage.getItem('teste_basico');
      console.log('✅ localStorage básico funciona:', testeBasico);
      localStorage.removeItem('teste_basico');
    } catch (e) {
      console.error('❌ localStorage não funciona:', e);
      return;
    }

    // Verificar a chave específica
    const chaveVeiculo = 'veiculo_ativo_offline';
    const dadosVeiculo = localStorage.getItem(chaveVeiculo);
    
    console.log('🔍 Verificando chave:', chaveVeiculo);
    console.log('📄 Dados encontrados:', dadosVeiculo);
    
    if (dadosVeiculo) {
      try {
        const dadosParsed = JSON.parse(dadosVeiculo);
        console.log('📊 Dados parseados:', dadosParsed);
        setDados(dadosParsed);
      } catch (e) {
        console.error('❌ Erro ao fazer parse:', e);
      }
    } else {
      console.log('❌ Nenhum dado encontrado');
      
      // Listar todas as chaves
      console.log('📋 Todas as chaves no localStorage:');
      for (let i = 0; i < localStorage.length; i++) {
        const chave = localStorage.key(i);
        const valor = localStorage.getItem(chave || '');
        console.log(`  [${i}] ${chave}: ${valor?.substring(0, 50)}...`);
      }
    }
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>🧪 Teste localStorage</h1>
      
      <div style={{ marginTop: '20px', padding: '15px', background: '#f5f5f5' }}>
        <h3>Resultado:</h3>
        {dados ? (
          <pre style={{ background: '#e8f5e8', padding: '10px' }}>
            {JSON.stringify(dados, null, 2)}
          </pre>
        ) : (
          <div style={{ background: '#f5e8e8', padding: '10px' }}>
            Nenhum dado encontrado
          </div>
        )}
      </div>

      <div style={{ marginTop: '20px' }}>
        <button 
          onClick={() => {
            const dadosVeiculo = localStorage.getItem('veiculo_ativo_offline');
            console.log('🔄 Verificação manual:', dadosVeiculo);
            if (dadosVeiculo) {
              setDados(JSON.parse(dadosVeiculo));
            }
          }}
          style={{ padding: '10px 20px', margin: '5px' }}
        >
          Verificar Novamente
        </button>
        
        <button 
          onClick={() => {
            const dadosTeste = {
              placa: 'TESTE-123',
              modelo: 'CARRO TESTE',
              combustivel: 'GASOLINA',
              timestampSalvamento: Date.now()
            };
            localStorage.setItem('veiculo_ativo_offline', JSON.stringify(dadosTeste));
            console.log('💾 Dados de teste salvos');
            setDados(dadosTeste);
          }}
          style={{ padding: '10px 20px', margin: '5px' }}
        >
          Salvar Dados de Teste
        </button>
        
        <button 
          onClick={() => {
            localStorage.removeItem('veiculo_ativo_offline');
            console.log('🗑️ Dados removidos');
            setDados(null);
          }}
          style={{ padding: '10px 20px', margin: '5px' }}
        >
          Limpar Dados
        </button>
      </div>
    </div>
  );
};

export default TesteLocalStoragePage;
