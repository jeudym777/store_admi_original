import { useState } from 'react';
import ClientGrid from '@/components/ClientGrid';
import ClientForm from '@/components/ClientForm';

export default function ClientsPage() {
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Clientes</h2>
          <p className="text-gray-600 mt-1">Administra tu base de clientes</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Agregar Cliente
        </button>
      </div>

      {/* Grid de clientes */}
      <ClientGrid />

      {/* Modal de formulario */}
      {showAddForm && (
        <ClientForm onClose={() => setShowAddForm(false)} />
      )}
    </div>
  );
}