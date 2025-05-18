import { AuthProvider } from "@/context/AuthContext";
import Auth from "@/Auth";
import Dashboard from "@/Dashboard";
import { useAuth } from "./hooks/useAuth";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./libs/queryClient";
import { ToastContainer } from "react-toastify";

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center p-12">Chargement...</div>;
  }

  return user ? <Dashboard /> : <Auth />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="min-h-screen bg-gray-100">
          <div className="container mx-auto py-8">
            <AppContent />
          </div>
        </div>
        <ToastContainer />
      </AuthProvider>
    </QueryClientProvider>
  );
}
