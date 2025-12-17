import { Link } from "react-router-dom";
import Layout from "./Layout";
import { IoMdGlobe } from "react-icons/io";
import { TbCheckupList } from "react-icons/tb";
import { FiClock } from "react-icons/fi";

export default function HomePage() {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="animate-slide-up">
          <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 bg-clip-text text-transparent mb-6 leading-tight">
            Welcome to YEOOSTORE
          </h1>
          <p className="text-xl text-gray-500 mb-3">Panel de Administración</p>
        </div>

        <div className="max-w-2xl mx-auto animate-fade-in">
          <p className="text-lg text-gray-700 mb-8 leading-relaxed">
            Organiza tus productos de forma simple y eficiente. La página de administrador te ayuda
            a gestionar tus tareas diarias sin esfuerzo para mantenerte productivo y
            enfocado en lo que realmente importa.
          </p>
        </div>

        <Link
          to="/dashboard"
          className="bg-gradient-to-r from-sky-600 to-indigo-700 hover:from-sky-700 hover:to-indigo-800 text-white font-semibold py-4 px-10 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-glow-lg shadow-xl flex items-center gap-2 group"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 group-hover:rotate-12 transition-transform duration-300"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
              clipRule="evenodd"
            />
          </svg>
          Iniciar Sesión
        </Link>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="group bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-2xl border border-white transition-all duration-300 hover:-translate-y-2">
            <div className="text-sky-600 mb-4 flex justify-center transform group-hover:scale-110 transition-transform duration-300">
              <TbCheckupList className="text-[3.5rem]" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-800">Fácil de usar</h3>
            <p className="text-gray-600 leading-relaxed">
              Interfaz intuitiva para gestionar tus tareas de manera eficiente.
            </p>
          </div>

          <div className="group bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-2xl border border-white transition-all duration-300 hover:-translate-y-2">
            <div className="text-blue-600 mb-4 flex justify-center transform group-hover:scale-110 transition-transform duration-300">
              <FiClock className="text-[3.5rem]" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-800">Rápido y reactivo</h3>
            <p className="text-gray-600 leading-relaxed">
              Experiencia fluida que te permite trabajar con agilidad.
            </p>
          </div>

          <div className="group bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-2xl border border-white transition-all duration-300 hover:-translate-y-2">
            <div className="text-indigo-600 mb-4 flex justify-center transform group-hover:scale-110 transition-transform duration-300">
              <IoMdGlobe className="text-[3.5rem]" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-800">Trabaja desde cualquier lugar</h3>
            <p className="text-gray-600 leading-relaxed">
              Accede a tus tareas desde cualquier dispositivo, en cualquier momento.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
