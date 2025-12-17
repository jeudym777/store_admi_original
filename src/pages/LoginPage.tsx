import { useState } from "react";
import { supabase } from "@/supabaseClient";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import Layout from "./Layout";
import { useNavigate } from "react-router-dom";

type LoginForm = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState } = useForm<LoginForm>();

  const onRegisterSubmit = async (data: LoginForm) => {
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (error) {
      toast.error(error.message);
    } else {
      navigate("/dashboard");
      toast.success("You are logged in successfully!");
    }

    setLoading(false);
  };

  const onLoginSubmit = async (data: LoginForm) => {
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      toast.error(error.message);
    } else {
      navigate("/dashboard");
      toast.success("You are logged in successfully!");
    }

    setLoading(false);
  };

  return (
    <Layout>
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 overflow-hidden animate-slide-up">
          <div className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 p-8 text-white">
            <h1 className="text-3xl font-bold text-center">
              Bienvenido a YeooStore
            </h1>
            <p className="text-sky-100 text-center mt-2">
              Inicia sesión para gestionar tu tienda
            </p>
          </div>

          <form className="p-8 space-y-6">
            <div className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Correo Electrónico
                </label>
                <input
                  id="email"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 bg-white/80"
                  type="email"
                  placeholder="tu@email.com"
                  {...register("email", { required: true })}
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Contraseña
                </label>
                <input
                  id="password"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 bg-white/80"
                  type="password"
                  placeholder="••••••••"
                  {...register("password", { required: true })}
                />
              </div>
            </div>

            <div className="flex gap-4 flex-col sm:flex-row">
              <button
                type="button"
                onClick={handleSubmit(onLoginSubmit)}
                disabled={loading || !formState.isValid}
                className="cursor-pointer flex-1 bg-gradient-to-r from-sky-600 to-indigo-700 text-white py-3 px-4 rounded-xl hover:from-sky-700 hover:to-indigo-800 disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-glow font-semibold transform hover:scale-[1.02]"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Cargando...
                  </span>
                ) : (
                  "Iniciar Sesión"
                )}
              </button>

              <button
                type="button"
                onClick={handleSubmit(onRegisterSubmit)}
                disabled={loading || !formState.isValid}
                className="cursor-pointer flex-1 bg-white text-sky-700 border-2 border-sky-600 py-3 px-4 rounded-xl hover:bg-sky-50 disabled:opacity-50 transition-all duration-300 shadow-md font-semibold transform hover:scale-[1.02]"
              >
                {loading ? "Cargando..." : "Registrarse"}
              </button>
            </div>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t-2 border-gray-200"></div>
              <span className="flex-shrink mx-4 text-gray-400 text-sm font-medium">o continúa con</span>
              <div className="flex-grow border-t-2 border-gray-200"></div>
            </div>

            <button
              type="button"
              onClick={() =>
                supabase.auth.signInWithOAuth({ provider: "google" })
              }
              className="cursor-pointer w-full bg-white border-2 border-gray-200 py-3 px-4 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center font-semibold text-gray-700 transform hover:scale-[1.02]"
            >
              <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
                <path fill="none" d="M1 1h22v22H1z" />
              </svg>
              Continuar con Google
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
