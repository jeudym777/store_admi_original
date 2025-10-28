import { useState } from 'react';
import QRScanner from '@/components/QRScanner';
import ClientQRModal from '@/components/ClientQRModal';
import AddPointsModal from '@/components/AddPointsModal';
import type { Client } from '@/types/client';
import { getLoyaltyLevelColor, formatTipoIdentificacion, getLoyaltyDiscount } from '@/utils/clientUtils';

export default function IdentifyClientPage() {
  const [showScanner, setShowScanner] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showAddPointsModal, setShowAddPointsModal] = useState(false);

  const handleClientFound = (client: Client) => {
    setSelectedClient(client);
    setShowScanner(false);
  };

  const formatLastPoints = (fecha?: string) => {
    if (!fecha) return 'Nunca';
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Identificación de Clientes</h2>
        <p className="text-gray-600">Escanea códigos QR para identificar clientes y gestionar puntos</p>
      </div>

      {/* Scan Button */}
      <div className="flex justify-center">
        <button
          onClick={() => setShowScanner(true)}
          className="inline-flex items-center px-8 py-4 bg-indigo-600 text-white text-lg font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl"
        >
          <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h2M5 8h2a1 1 0 001-1V4a1 1 0 00-1-1H5a1 1 0 00-1 1v3a1 1 0 001 1zm0 10h2a1 1 0 001-1v-3a1 1 0 00-1-1H5a1 1 0 00-1 1v3a1 1 0 001 1zM16 8h2a1 1 0 001-1V4a1 1 0 00-1-1h-2a1 1 0 00-1 1v3a1 1 0 001 1z" />
          </svg>
          Identificar Cliente
        </button>
      </div>

      {/* Client Details */}
      {selectedClient && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-6 py-4 text-white">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Cliente Identificado</h3>
                <button
                  onClick={() => setSelectedClient(null)}
                  className="text-indigo-200 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Client Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-2xl font-bold text-gray-900">
                      {selectedClient.nombre} {selectedClient.apellidos}
                    </h4>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getLoyaltyLevelColor(selectedClient.nivel_fidelidad)}`}>
                      {selectedClient.nivel_fidelidad.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">Email:</span> {selectedClient.email}
                    </p>
                    <p>
                      <span className="font-medium">{formatTipoIdentificacion(selectedClient.tipo_identificacion)}:</span> {selectedClient.numero_identificacion}
                    </p>
                    {selectedClient.telefono && (
                      <p>
                        <span className="font-medium">Teléfono:</span> {selectedClient.telefono}
                      </p>
                    )}
                    <p>
                      <span className="font-medium">Último punto:</span> {formatLastPoints(selectedClient.fecha_ultimo_punto)}
                    </p>
                  </div>
                </div>

                <div className="text-center">
                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-6">
                    <h5 className="text-lg font-semibold text-gray-700 mb-2">Puntos Acumulados</h5>
                    <p className="text-4xl font-bold text-indigo-600 mb-2">
                      {selectedClient.puntos_acumulados.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      Descuento disponible: {getLoyaltyDiscount(selectedClient.nivel_fidelidad)}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  onClick={() => setShowQRModal(true)}
                  className="flex items-center justify-center px-4 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h2M5 8h2a1 1 0 001-1V4a1 1 0 00-1-1H5a1 1 0 00-1 1v3a1 1 0 001 1zm0 10h2a1 1 0 001-1v-3a1 1 0 00-1-1H5a1 1 0 00-1 1v3a1 1 0 001 1zM16 8h2a1 1 0 001-1V4a1 1 0 00-1-1h-2a1 1 0 00-1 1v3a1 1 0 001 1z" />
                  </svg>
                  Ver QR
                </button>
                <button
                  onClick={() => setShowAddPointsModal(true)}
                  className="flex items-center justify-center px-4 py-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-medium"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Agregar Puntos
                </button>
                <button
                  onClick={() => setShowScanner(true)}
                  className="flex items-center justify-center px-4 py-3 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors font-medium"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Escanear Otro
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      {!selectedClient && (
        <div className="max-w-2xl mx-auto bg-gray-50 rounded-lg p-8">
          <div className="text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Cómo usar el sistema de identificación</h3>
            <div className="text-left max-w-md mx-auto space-y-2 text-gray-600">
              <p>• Haz clic en "Identificar Cliente" para abrir el escáner</p>
              <p>• Escanea el código QR del cliente con la cámara</p>
              <p>• O ingresa el código manualmente si es necesario</p>
              <p>• Una vez identificado, podrás agregar puntos o ver su información</p>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showScanner && (
        <QRScanner
          onClientFound={handleClientFound}
          onClose={() => setShowScanner(false)}
        />
      )}

      {showQRModal && selectedClient && (
        <ClientQRModal
          client={selectedClient}
          onClose={() => setShowQRModal(false)}
        />
      )}

      {showAddPointsModal && selectedClient && (
        <AddPointsModal
          client={selectedClient}
          onClose={() => setShowAddPointsModal(false)}
        />
      )}
    </div>
  );
}