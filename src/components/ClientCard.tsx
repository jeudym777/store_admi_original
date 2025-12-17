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
      <div className="group bg-white/90 backdrop-blur-sm border-2 border-gray-100 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 hover:-translate-y-1 hover:border-sky-200">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-sky-700 transition-colors">
                {client.nombre} {client.apellidos}
              </h3>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${getLoyaltyLevelColor(client.nivel_fidelidad)}`}>
                  {client.nivel_fidelidad.toUpperCase()}
                </span>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {client.email}
            </p>
            <p className="text-sm text-gray-600 mb-2">
              <span className="font-semibold">{formatTipoIdentificacion(client.tipo_identificacion)}:</span> {client.numero_identificacion}
            </p>
            
            {client.telefono && (
              <p className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {client.telefono}
              </p>
            )}
            
            <p className="text-sm text-gray-600 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-semibold">Cumpleaños:</span> {formatCumpleanos()}
            </p>
            
            <div className="flex items-center justify-between text-sm text-gray-600 mb-3 bg-gradient-to-r from-sky-50 to-indigo-50 p-3 rounded-xl">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                <span className="font-semibold">Puntos:</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-indigo-700 bg-clip-text text-transparent">{client.puntos_acumulados.toLocaleString()}</span>
              </div>
              <span className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${
                client.recibir_promociones 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : 'bg-gray-100 text-gray-800 border border-gray-200'
              }`}>
                {client.recibir_promociones ? '📧 Promociones' : '🔕 Sin promociones'}
              </span>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => onViewQR?.(client)}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-sky-100 to-blue-100 text-sky-700 rounded-xl hover:from-sky-200 hover:to-blue-200 transition-all duration-300 text-sm font-bold shadow-sm hover:shadow-md transform hover:scale-[1.02]"
              >
                📱 Ver QR
              </button>
              <button
                onClick={() => onAddPoints?.(client)}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 rounded-xl hover:from-green-200 hover:to-emerald-200 transition-all duration-300 text-sm font-bold shadow-sm hover:shadow-md transform hover:scale-[1.02]"
              >
                ⭐ + Puntos
              </button>
            </div>
          </div>
          
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="text-red-500 hover:text-red-700 transition-all p-2.5 hover:bg-red-50 rounded-xl border border-transparent hover:border-red-200 ml-3 group-delete"
            title="Eliminar cliente"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        <div className="text-xs text-gray-400 border-t-2 border-gray-100 pt-3 flex gap-4">
          <p className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Registrado: {new Date(client.created_at).toLocaleDateString('es-ES')}
          </p>
          {client.updated_at !== client.created_at && (
            <p className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Actualizado: {new Date(client.updated_at).toLocaleDateString('es-ES')}
            </p>
          )}
        </div>
      </div>

      {/* Confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl max-w-sm w-full p-8 border-2 border-white/20 animate-slide-up">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              ¿Eliminar cliente?
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              ¿Estás seguro de que quieres eliminar a <span className="font-semibold text-gray-800">{client.nombre} {client.apellidos}</span>? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-300 font-semibold shadow-sm hover:shadow"
                disabled={isPending}
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-md hover:shadow-lg"
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