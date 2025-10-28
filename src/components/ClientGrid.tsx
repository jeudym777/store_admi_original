import { useState } from 'react';
import { useGetClients } from '@/hooks/useGetClients';
import ClientCard from './ClientCard';
import ClientQRModal from './ClientQRModal';
import AddPointsModal from './AddPointsModal';
import type { Client } from '@/types/client';

export default function ClientGrid() {
  const { data: clients = [], isLoading, error } = useGetClients();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showAddPointsModal, setShowAddPointsModal] = useState(false);

  const handleViewQR = (client: Client) => {
    setSelectedClient(client);
    setShowQRModal(true);
  };

  const handleAddPoints = (client: Client) => {
    setSelectedClient(client);
    setShowAddPointsModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-2 text-gray-600">Cargando clientes...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-2">
          <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-lg font-medium">Error al cargar clientes</p>
          <p className="text-sm text-gray-600 mt-1">
            {error instanceof Error ? error.message : 'Ha ocurrido un error inesperado'}
          </p>
        </div>
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay clientes registrados</h3>
        <p className="text-gray-600 mb-4">Comienza agregando tu primer cliente.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map((client) => (
          <ClientCard 
            key={client.id} 
            client={client} 
            onViewQR={handleViewQR}
            onAddPoints={handleAddPoints}
          />
        ))}
      </div>

      {/* Modals */}
      {showQRModal && selectedClient && (
        <ClientQRModal
          client={selectedClient}
          onClose={() => {
            setShowQRModal(false);
            setSelectedClient(null);
          }}
        />
      )}

      {showAddPointsModal && selectedClient && (
        <AddPointsModal
          client={selectedClient}
          onClose={() => {
            setShowAddPointsModal(false);
            setSelectedClient(null);
          }}
        />
      )}
    </>
  );
}