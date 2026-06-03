import React, { useState, useRef } from 'react';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';
import { Bars4Icon, VideoCameraIcon, VideoCameraSlashIcon } from '@heroicons/react/24/solid';

interface BarcodeScannerProps {
  onCodigoEscaneado: (codigo: string) => void; // Adicionamos essa props
  
}
const BarcodeScanner: React.FC <BarcodeScannerProps> = ({ onCodigoEscaneado }) => {
  const [barcode, setBarcode] = useState<string>(''); // Código detectado
  const [scanning, setScanning] = useState<boolean>(false); // Controle do scanner
  const videoRef = useRef<HTMLVideoElement>(null); // Referência para o vídeo
  const codeReader = useRef<BrowserMultiFormatReader>(new BrowserMultiFormatReader()); // Reutiliza o leitor

   // Função para limpar o estado barcode
   const clearBarcode = () => {
    setBarcode(''); // Limpa o estado local
  };
  
  // Inicia o scanner ao clicar no botão
  const startScanning = async () => {
    if (scanning) return; // Evita múltiplas execuções
    setScanning(true);

    try {
      // Solicita permissão para acessar a câmera
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play(); // Garante que o vídeo começa a rodar
      }

     // console.log('Iniciando leitura...');

      // Inicia a leitura de códigos de barras a partir do vídeo
      codeReader.current.decodeFromVideoDevice(
        null, // Usa a câmera padrão
        videoRef.current!,
        (result, err) => {
          if (result) {
            //console.log('Código detectado:', result.getText());
            setBarcode(result.getText()); // Atualiza o estado com o código de barras detectado
            onCodigoEscaneado(result.getText());
            stopScanning(); // Para automaticamente após detectar um código
          }

          if (err && !(err instanceof NotFoundException)) {
            console.error('Erro ao tentar ler o código de barras:', err);
          }
        }
      );
    } catch (error) {
      console.error('Erro ao acessar a câmera:', error);
      setScanning(false);
    }
  };

  // Para o scanner e fecha a câmera
  const stopScanning = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop()); // Fecha a câmera
    }
    setScanning(false);
  };

  return (
    <div className="flex flex-col items-center justify-center p-2">
      {/* <h2 className="text-xl font-bold ">Scanner</h2> */}

      {/* Botões para iniciar e parar */}
      {!scanning ? (
        <button
          onClick={startScanning}
          className="p-4 bg-green-500 text-white rounded"
        >
          <span className='flex'><VideoCameraIcon className="h-12 w-12 text-gray-500" /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<Bars4Icon className="h-12 w-12 text-gray-500 rotate-90" /><Bars4Icon className="h-12 w-12 text-gray-500 rotate-90" /><Bars4Icon className="h-12 w-12 text-gray-500 rotate-90" /> </span>
        </button>
      ) : (
        <button
          onClick={stopScanning}
          className="p-4 px-24 bg-rose-500 text-white rounded"
        >
          <VideoCameraSlashIcon className="h-12 w-12 text-gray-500" />
        </button>
      )}

      {/* Exibe o vídeo apenas quando estiver escaneando */}
      {scanning && (

     <div className="grid place-items-center h-[200px]">
     <div className="relative w-full min-w-[300px] h-[100px] border-4 border-blue-500 rounded-md overflow-hidden flex items-center justify-center">
       <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
     </div>
   </div>
      )}


      {/* Exibe o código abaixo */}
      {/* {barcode && <p className="mt-2 text-lg">Código de barras detectado: {barcode}</p>} */}
      {barcode && (
          <div className="mt-4 p-4 bg-slate-400 text-white rounded-xl shadow-md border border-slate-200 text-center">
            <p className="text-lg font-semibold text-center">Código de Barras Detectado:</p>
            <p className="mt-2 text-2xl font-bold text-center tracking-widest bg-slate-600 p-2 rounded-lg">
              {barcode}
            </p>
             {/* Botão para limpar o estado barcode */}
            <button onClick={clearBarcode} className="bg-rose-500 text-white p-2 rounded mt-6">
              Limpar Código
            </button>
          </div>
        )}
    </div>
  );
};

export default BarcodeScanner;