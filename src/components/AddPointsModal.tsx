import { useState } from 'react';
import { useAddLoyaltyPoints } from '@/hooks/useAddLoyaltyPoints';
import type { Client, MotivoPuntos } from '@/types/client';
import { MOTIVOS_PUNTOS, PUNTOS_CONFIG } from '@/types/client';

interface AddPointsModalProps {
  client: Client;
  onClose: () => void;
}

export default function AddPointsModal({ client, onClose }: AddPointsModalProps) {
  const [formData, setFormData] = useState({
    puntos_otorgados: 0,
    motivo: 'compra' as MotivoPuntos,
    monto_compra: 0,
    descripcion: '',
  });

  const { mutate: addPoints, isPending } = useAddLoyaltyPoints();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const transaction = {
      client_id: client.id,
      puntos_otorgados: formData.puntos_otorgados,
      motivo: formData.motivo,
      monto_compra: formData.monto_compra > 0 ? formData.monto_compra : undefined,
      descripcion: formData.descripcion || undefined,
    };

    addPoints(transaction, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  const handleMontoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const monto = parseFloat(e.target.value) || 0;
    setFormData(prev => ({
      ...prev,
      monto_compra: monto,
      puntos_otorgados: formData.motivo === 'compra' 
        ? Math.floor(monto * PUNTOS_CONFIG.PUNTOS_POR_PESO)
        : prev.puntos_otorgados
    }));
  };

  const handleMotivoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const motivo = e.target.value as MotivoPuntos;
    let puntos = 0;

    switch (motivo) {
      case 'compra':
        puntos = Math.floor(formData.monto_compra * PUNTOS_CONFIG.PUNTOS_POR_PESO);
        break;
      case 'cumpleanos':
        puntos = PUNTOS_CONFIG.BONUS_CUMPLEANOS;
        break;
      case 'registro':
        puntos = PUNTOS_CONFIG.BONUS_REGISTRO;
        break;
      default:
        puntos = 0;
    }

    setFormData(prev => ({
      ...prev,
      motivo,
      puntos_otorgados: puntos
    }));
  };

  const formatMotivo = (motivo: string): string => {
    const motivos: Record<string, string> = {
      compra: 'Compra',
      registro: 'Registro',
      referido: 'Referido',
      cumpleanos: 'Cumpleaños',
      promocion: 'Promoción',
      bonus: 'Bonus'
    };
    return motivos[motivo] || motivo;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Agregar Puntos</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900">{client.nombre} {client.apellidos}</h3>
          <p className="text-sm text-gray-600">Puntos actuales: {client.puntos_acumulados.toLocaleString()}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Motivo *
            </label>
            <select
              value={formData.motivo}
              onChange={handleMotivoChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              {MOTIVOS_PUNTOS.map(motivo => (
                <option key={motivo} value={motivo}>
                  {formatMotivo(motivo)}
                </option>
              ))}
            </select>
          </div>

          {formData.motivo === 'compra' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monto de Compra
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.monto_compra}
                onChange={handleMontoChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="0.00"
              />
              <p className="text-xs text-gray-500 mt-1">
                {PUNTOS_CONFIG.PUNTOS_POR_PESO} punto por cada peso gastado
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Puntos a Otorgar *
            </label>
            <input
              type="number"
              min="0"
              value={formData.puntos_otorgados}
              onChange={(e) => setFormData(prev => ({ ...prev, puntos_otorgados: parseInt(e.target.value) || 0 }))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Cantidad de puntos"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción (opcional)
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Descripción adicional..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              disabled={isPending}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending || formData.puntos_otorgados <= 0}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? 'Agregando...' : 'Agregar Puntos'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}