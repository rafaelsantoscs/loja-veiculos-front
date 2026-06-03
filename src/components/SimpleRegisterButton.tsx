// Botão simples APENAS para registrar dispositivo
'use client';
import React from 'react';

const SimpleRegisterButton: React.FC = () => {
  console.log('🔍 SimpleRegisterButton renderizado!');
  
  const handleRegister = async () => {
    console.log('🔍 Registrando dispositivo simples...');
    
    try {
      // Solicitar permissão
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          alert('❌ Permissão negada!\n\nAtive as notificações no navegador.');
          return;
        }
      }
      
      // Registrar service worker
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.register('/sw.js');
        await navigator.serviceWorker.ready;
        
        // Criar subscription
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: 'BEDENAz3fGhIJE53o3iHk1okSh6Rzzc8tVKqAuoDesDJCaL8iEWpHWnxHWp4_A5bKvxYOe5OVvNQLLJ9595hXbM'
        });
        
        // Enviar para o servidor
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        const response = await fetch('/api/push-subscriptions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userData.token}`
          },
          body: JSON.stringify({
            endpoint: subscription.endpoint,
            keys: {
              p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))),
              auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!)))
            }
          })
        });
        
        if (response.ok) {
          alert('✅ DISPOSITIVO REGISTRADO!\n\nVocê pode receber notificações agora.');
        } else {
          alert('❌ Erro ao salvar no servidor.');
        }
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('❌ Erro: ' + String(error));
    }
  };

  return (
    <div>
      {/* Botão bem visível */}
      <button
        onClick={handleRegister}
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          zIndex: 99999,
          backgroundColor: '#9333ea',
          color: 'white',
          padding: '15px',
          borderRadius: '50%',
          border: '4px solid yellow',
          cursor: 'pointer',
          fontSize: '24px',
          width: '80px',
          height: '80px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.8)',
          animation: 'pulse 2s infinite'
        }}
        title="APENAS registrar dispositivo"
      >
        📡
      </button>
      
      {/* Indicador de debug */}
      <div
        style={{
          position: 'fixed',
          top: '100px',
          left: '20px',
          zIndex: 99998,
          backgroundColor: 'lime',
          color: 'black',
          padding: '10px',
          borderRadius: '5px',
          fontSize: '12px'
        }}
      >
        SimpleRegisterButton ATIVO
      </div>
    </div>
  );
};

export default SimpleRegisterButton;
