import { useState } from "react";
import { supabase } from "@/supabaseClient";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

type LoginForm = {
  email: string;
  password: string;
};

export default function Auth() {
  const [loading, setLoading] = useState(false);

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
      toast.success("Vous êtes connecté avec succès!");
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
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col space-y-4 p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold">Connexion / Inscription</h1>

      <input
        className="border p-2 rounded"
        type="email"
        placeholder="Votre email"
        {...register("email", { required: true })}
      />

      <input
        className="border p-2 rounded"
        type="password"
        placeholder="Votre mot de passe"
        {...register("password", { required: true })}
      />

      <div className="flex space-x-2">
        <button
          onClick={handleSubmit(onLoginSubmit)}
          disabled={loading || !formState.isValid}
          className="cursor-pointer flex-1 bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "Chargement..." : "Connexion"}
        </button>

        <button
          onClick={handleSubmit(onRegisterSubmit)}
          disabled={loading || !formState.isValid}
          className="cursor-pointer flex-1 bg-green-500 text-white p-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? "Chargement..." : "Inscription"}
        </button>
      </div>

      <button
        onClick={() => supabase.auth.signInWithOAuth({ provider: "google" })}
        className="cursor-pointer bg-gray-100 p-2 rounded hover:bg-gray-200 flex items-center justify-center"
      >
        <span>Continuer avec Google</span>
      </button>
    </div>
  );
}
