import { useState } from 'react';
import { useDeleteClient } from '@/hooks/useDeleteClient';
import type { Client } from '@/types/client';
import { getLoyaltyLevelColor, formatTipoIdentificacion } from '@/utils/clientUtils';

interface ClientCardProps {
  client: Client;
  onViewQR?: (client: Client) => void;
  onAddPoints?: (client: Client) => void;
}

export default function ClientCard({ client, onViewQR, onAddPoints }: ClientCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { mutate: deleteClient, isPending } = useDeleteClient();

  const handleDelete = () => {
    deleteClient(client.id, {
      onSuccess: () => {
        setShowDeleteConfirm(false);
      }
    });
  };

  const formatCumpleanos = () => {
    if (client.cumpleanos_dia && client.cumpleanos_mes) {
      return `${client.cumpleanos_dia} de ${client.cumpleanos_mes}`;
    }
    return 'No especificado';
  };

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {client.nombre} {client.apellidos}
              </h3>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLoyaltyLevelColor(client.nivel_fidelidad)}`}>
                  {client.nivel_fidelidad.toUpperCase()}
                </span>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-1">{client.email}</p>
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-medium">{formatTipoIdentificacion(client.tipo_identificacion)}:</span> {client.numero_identificacion}
            </p>
            
            {client.telefono && (
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium">Tel:</span> {client.telefono}
              </p>
            )}
            
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-medium">Cumpleaños:</span> {formatCumpleanos()}
            </p>
            
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <div className="flex items-center">
                <span className="font-medium mr-2">Puntos:</span>
                <span className="text-lg font-bold text-indigo-600">{client.puntos_acumulados.toLocaleString()}</span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${
                client.recibir_promociones 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {client.recibir_promociones ? 'Promociones: Sí' : 'Promociones: No'}
              </span>
            </div>

            <div className="flex gap-2 mt-3">
              <button
                onClick={() => onViewQR?.(client)}
                className="flex-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition-colors text-sm font-medium"
              >
                Ver QR
              </button>
              <button
                onClick={() => onAddPoints?.(client)}
                className="flex-1 px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors text-sm font-medium"
              >
                + Puntos
              </button>
            </div>
          </div>
          
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="text-red-500 hover:text-red-700 transition-colors p-2 hover:bg-red-50 rounded-full"
            title="Eliminar cliente"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        <div className="text-xs text-gray-400 border-t pt-3">
          <p>Registrado: {new Date(client.created_at).toLocaleDateString('es-ES')}</p>
          {client.updated_at !== client.created_at && (
            <p>Actualizado: {new Date(client.updated_at).toLocaleDateString('es-ES')}</p>
          )}
        </div>
      </div>

      {/* Confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              ¿Eliminar cliente?
            </h3>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que quieres eliminar a {client.nombre} {client.apellidos}? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                disabled={isPending}
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}