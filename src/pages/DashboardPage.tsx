import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSignOut } from "@/hooks/useSignOut";
import Layout from "./Layout";
import ProductsPage from "@/pages/ProductsPage";
import ClientsPage from "@/pages/ClientsPage";
import IdentifyClientPage from "@/pages/IdentifyClientPage";

type ActiveSection = 'products' | 'clients' | 'identify';

export default function DashboardPage() {
  const { user } = useAuth();
  const { mutate: handleSignOut } = useSignOut();
  const [activeSection, setActiveSection] = useState<ActiveSection>('products');

  const getSectionTitle = () => {
    switch (activeSection) {
      case 'products':
        return 'Panel de Inventario';
      case 'clients':
        return 'Panel de Clientes';
      case 'identify':
        return 'Identificación de Clientes';
      default:
        return 'Panel de Administración';
    }
  };

  const getSectionIcon = () => {
    switch (activeSection) {
      case 'products':
        return (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        );
      case 'clients':
        return (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        );
      case 'identify':
        return (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h2M5 8h2a1 1 0 001-1V4a1 1 0 00-1-1H5a1 1 0 00-1 1v3a1 1 0 001 1zm0 10h2a1 1 0 001-1v-3a1 1 0 00-1-1H5a1 1 0 00-1 1v3a1 1 0 001 1zM16 8h2a1 1 0 001-1V4a1 1 0 00-1-1h-2a1 1 0 00-1 1v3a1 1 0 001 1z"
          />
        );
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 px-8 py-6 text-white">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 mr-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {getSectionIcon()}
                </svg>
                <h1 className="text-3xl font-bold">{getSectionTitle()}</h1>
              </div>
              <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-5 py-2.5 text-sm border border-white/30">
                <span className="mr-2 truncate max-w-[150px] sm:max-w-xs font-medium">
                  {user.email}
                </span>
                <button
                  onClick={() => handleSignOut()}
                  className="ml-2 cursor-pointer text-white hover:text-sky-100 transition-all flex items-center p-2 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm border border-white/30 group"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Salir
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b-2 border-gray-100 bg-gradient-to-b from-gray-50 to-white">
            <nav className="flex space-x-8 px-8">
              <button
                onClick={() => setActiveSection('products')}
                className={`py-4 px-2 border-b-4 font-semibold text-sm transition-all duration-300 ${
                  activeSection === 'products'
                    ? 'border-sky-600 text-sky-700 scale-105'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Inventario
                </div>
              </button>
              <button
                onClick={() => setActiveSection('clients')}
                className={`py-4 px-2 border-b-4 font-semibold text-sm transition-all duration-300 ${
                  activeSection === 'clients'
                    ? 'border-sky-600 text-sky-700 scale-105'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Clientes
                </div>
              </button>
              <button
                onClick={() => setActiveSection('identify')}
                className={`py-4 px-2 border-b-4 font-semibold text-sm transition-all duration-300 ${
                  activeSection === 'identify'
                    ? 'border-sky-600 text-sky-700 scale-105'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h2M5 8h2a1 1 0 001-1V4a1 1 0 00-1-1H5a1 1 0 00-1 1v3a1 1 0 001 1zm0 10h2a1 1 0 001-1v-3a1 1 0 00-1-1H5a1 1 0 00-1 1v3a1 1 0 001 1zM16 8h2a1 1 0 001-1V4a1 1 0 00-1-1h-2a1 1 0 00-1 1v3a1 1 0 001 1z" />
                  </svg>
                  Identificar
                </div>
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="px-8 py-8">
            {activeSection === 'products' && <ProductsPage />}
            {activeSection === 'clients' && <ClientsPage />}
            {activeSection === 'identify' && <IdentifyClientPage />}
          </div>
        </div>
      </div>
    </Layout>
  );
}
