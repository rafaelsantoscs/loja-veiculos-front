import React, { useState, useRef, useEffect } from 'react';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';
import { Bars4Icon, VideoCameraIcon, VideoCameraSlashIcon } from '@heroicons/react/24/solid';

interface BarcodeScannerProps {
  onCodigoEscaneado: (codigo: string) => void;
}

const BarcodeScannerUp: React.FC<BarcodeScannerProps> = ({ onCodigoEscaneado }) => {
  const [barcode, setBarcode] = useState<string>('');
  const [scanning, setScanning] = useState<boolean>(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReader = useRef<BrowserMultiFormatReader>(new BrowserMultiFormatReader());

  useEffect(() => {
    // Precisa da permissão para pegar os nomes (labels) das câmeras
    navigator.mediaDevices.getUserMedia({ video: true }).then(() => {
      navigator.mediaDevices.enumerateDevices().then(devices => {
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setDevices(videoDevices);
      });
    });
  }, []);

  const clearBarcode = () => {
    setBarcode('');
  };

  const startScanning = async () => {
    if (scanning) return;
    setScanning(true);

    try {
      const constraints = selectedDeviceId
        ? { deviceId: { exact: selectedDeviceId } }
        : { facingMode: 'environment' };

      const stream = await navigator.mediaDevices.getUserMedia({ video: constraints });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      codeReader.current.decodeFromVideoDevice(
        selectedDeviceId || null,
        videoRef.current!,
        (result, err) => {
          if (result) {
            setBarcode(result.getText());
            onCodigoEscaneado(result.getText());
            stopScanning();
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

  const stopScanning = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    codeReader.current.reset();
    setScanning(false);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 space-y-4">
      {!scanning ? (
        <button
          onClick={startScanning}
          className="p-4 bg-green-500 text-white rounded shadow-md"
        >
          <span className='flex items-center gap-4'>
            <VideoCameraIcon className="h-8 w-8 text-white" />
            <Bars4Icon className="h-8 w-8 text-white rotate-90" />
            <Bars4Icon className="h-8 w-8 text-white rotate-90" />
            <Bars4Icon className="h-8 w-8 text-white rotate-90" />
          </span>
        </button>
      ) : (
        <button
          onClick={stopScanning}
          className="p-4 px-24 bg-rose-500 text-white rounded shadow-md"
        >
          <VideoCameraSlashIcon className="h-10 w-10 text-white" />
        </button>
      )}

      {/* Seleção da câmera */}
      {devices.length > 1 && (
        <select
          className="mt-2 p-2 border border-slate-400 rounded text-sm"
          value={selectedDeviceId ?? ''}
          onChange={e => setSelectedDeviceId(e.target.value)}
        >
          <option value="">Automática (traseira padrão)</option>
          {devices.map((device, idx) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label || `Câmera ${idx + 1}`}
            </option>
          ))}
        </select>
      )}

      {scanning && (
        <div className="relative w-full max-w-md aspect-video border-4 border-blue-500 rounded-md overflow-hidden shadow-md">
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        </div>
      )}

      {barcode && (
        <div className="mt-4 p-4 bg-slate-400 text-white rounded-xl shadow-md border border-slate-200 text-center">
          <p className="text-lg font-semibold text-center">Código de Barras Detectado:</p>
          <p className="mt-2 text-2xl font-bold text-center tracking-widest bg-slate-600 p-2 rounded-lg">
            {barcode}
          </p>
          <button onClick={clearBarcode} className="bg-rose-500 text-white p-2 rounded mt-6">
            Limpar Código
          </button>
        </div>
      )}
    </div>
  );
};

export default BarcodeScannerUp;
