import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useGetClientByQR } from '@/hooks/useGetClientByQR';
import type { Client } from '@/types/client';
import { getLoyaltyLevelColor, formatTipoIdentificacion } from '@/utils/clientUtils';

interface QRScannerProps {
  onClientFound: (client: Client) => void;
  onClose: () => void;
}

export default function QRScanner({ onClientFound, onClose }: QRScannerProps) {
  const [scannedCode, setScannedCode] = useState<string>('');
  const [isScanning, setIsScanning] = useState(true);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const { data: client, isLoading, error } = useGetClientByQR(scannedCode);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      },
      false
    );

    scanner.render(
      (decodedText) => {
        setScannedCode(decodedText);
        setIsScanning(false);
        scanner.clear();
      },
      (error) => {
        // Silenciar errores de escaneo continuo
        console.debug('QR scan error:', error);
      }
    );

    scannerRef.current = scanner;

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, []);

  useEffect(() => {
    if (client) {
      onClientFound(client);
    }
  }, [client, onClientFound]);

  const handleManualInput = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const code = formData.get('manual-code') as string;
    if (code.trim()) {
      setScannedCode(code.trim());
      setIsScanning(false);
    }
  };

  const resetScanner = () => {
    setScannedCode('');
    setIsScanning(true);
    
    // Reiniciar el scanner
    if (scannerRef.current) {
      scannerRef.current.clear().then(() => {
        const newScanner = new Html5QrcodeScanner(
          "qr-reader",
          { 
            fps: 10, 
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          false
        );

        newScanner.render(
          (decodedText) => {
            setScannedCode(decodedText);
            setIsScanning(false);
            newScanner.clear();
          },
          (error) => {
            console.debug('QR scan error:', error);
          }
        );

        scannerRef.current = newScanner;
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Identificar Cliente</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {isScanning && (
          <div className="mb-6">
            <p className="text-center text-gray-600 mb-4">
              Escanea el código QR del cliente o ingresa el código manualmente
            </p>
            <div id="qr-reader" className="mb-4"></div>
            
            <div className="border-t pt-4">
              <form onSubmit={handleManualInput} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código QR Manual
                  </label>
                  <input
                    type="text"
                    name="manual-code"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Ingresa el código QR"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Buscar Cliente
                </button>
              </form>
            </div>
          </div>
        )}

        {scannedCode && !isScanning && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">Código escaneado:</p>
              <p className="font-mono text-sm bg-white p-2 rounded border">{scannedCode}</p>
            </div>

            {isLoading && (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <span className="ml-2 text-gray-600">Buscando cliente...</span>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-medium">Error al buscar cliente</p>
                <p className="text-red-600 text-sm mt-1">
                  {error instanceof Error ? error.message : 'Error desconocido'}
                </p>
              </div>
            )}

            {!isLoading && !client && !error && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 font-medium">Cliente no encontrado</p>
                <p className="text-yellow-600 text-sm mt-1">
                  No se encontró ningún cliente con este código QR
                </p>
              </div>
            )}

            {client && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-green-900">
                    {client.nombre} {client.apellidos}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLoyaltyLevelColor(client.nivel_fidelidad)}`}>
                    {client.nivel_fidelidad.toUpperCase()}
                  </span>
                </div>
                <p className="text-green-700 text-sm">{client.email}</p>
                <p className="text-green-700 text-sm">
                  {formatTipoIdentificacion(client.tipo_identificacion)}: {client.numero_identificacion}
                </p>
                <p className="text-lg font-bold text-green-900 mt-2">
                  {client.puntos_acumulados.toLocaleString()} puntos
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={resetScanner}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Escanear Otro
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}