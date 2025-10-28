import { useEffect, useState } from 'react';
import type { Client } from '@/types/client';
import { generateQRCodeImage, getLoyaltyLevelColor, formatTipoIdentificacion } from '@/utils/clientUtils';

interface ClientQRModalProps {
  client: Client;
  onClose: () => void;
}

export default function ClientQRModal({ client, onClose }: ClientQRModalProps) {
  const [qrImage, setQrImage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const generateQR = async () => {
      try {
        setIsLoading(true);
        const image = await generateQRCodeImage(client.qr_code);
        setQrImage(image);
      } catch (error) {
        console.error('Error generating QR image:', error);
      } finally {
        setIsLoading(false);
      }
    };
    generateQR();
  }, [client.qr_code]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Código QR del Cliente</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="text-center">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {client.nombre} {client.apellidos}
            </h3>
            <div className="flex justify-center mb-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getLoyaltyLevelColor(client.nivel_fidelidad)}`}>
                {client.nivel_fidelidad.toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              {formatTipoIdentificacion(client.tipo_identificacion)}: {client.numero_identificacion}
            </p>
            <p className="text-lg font-bold text-indigo-600 mt-2">
              {client.puntos_acumulados.toLocaleString()} puntos
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : qrImage ? (
              <div className="flex justify-center">
                <img 
                  src={qrImage} 
                  alt={`QR Code for ${client.nombre}`}
                  className="max-w-full h-auto"
                />
              </div>
            ) : (
              <div className="flex justify-center items-center h-48 text-gray-500">
                Error al generar el código QR
              </div>
            )}
          </div>

          <div className="text-xs text-gray-500 mb-4">
            <p>Código: {client.qr_code}</p>
            <p className="mt-1">Muestra este código para identificarte en la tienda</p>
          </div>

          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}