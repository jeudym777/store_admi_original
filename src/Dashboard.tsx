import { useAuth } from "@/hooks/useAuth";
import { useGetTasks } from "./hooks/useGetTasks";
import { useSignOut } from "./hooks/useSignOut";
import { useForm } from "react-hook-form";
import { useDeleteTask } from "./hooks/useDeleteTask";
import { useAddTask } from "./hooks/useAddTask";
import { toast } from "react-toastify";

export default function Dashboard() {
  const { user } = useAuth();
  const { register, handleSubmit, reset } = useForm<{ text: string }>();
  const { data, isLoading } = useGetTasks();
  const { mutate: handleAddTask } = useAddTask();
  const { mutate: handleSignOut } = useSignOut();
  const { mutate: handleDelete } = useDeleteTask();

  const onDelete = (id: string) => {
    handleDelete(id, {
      onSuccess: () => {
        toast.success("Tâche supprimée avec succès");
      },
      onError: () => {
        toast.error(
          "Une erreur est survenue lors de la suppression de la tâche"
        );
      },
    });
  };

  const onSubmit = (data: { text: string }) => {
    handleAddTask(data.text, {
      onSuccess: () => {
        toast.success("Tâche ajoutée avec succès");
        reset();
      },
      onError: () => {
        toast.error("Une erreur est survenue lors de l'ajout de la tâche");
      },
    });
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
        <div>
          <span className="mr-2">{user.email}</span>
          <button
            onClick={() => handleSignOut()}
            className="cursor-pointer text-red-500 hover:text-red-700 hover:underline"
          >
            Déconnexion
          </button>
        </div>
      </div>

      {/* Formulaire d'ajout */}
      <form onSubmit={handleSubmit(onSubmit)} className="mb-6">
        <div className="flex gap-2">
          <input
            className="flex-1 border p-2 rounded"
            {...register("text")}
            placeholder="Nouvelle tâche..."
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 cursor-pointer"
          >
            Ajouter
          </button>
        </div>
      </form>

      {/* Liste des éléments */}
      {isLoading ? (
        <div>Chargement des données...</div>
      ) : (
        <ul className="space-y-2">
          {data?.length === 0 ? (
            <div className="text-gray-500">Aucun élément trouvé.</div>
          ) : (
            data?.map((item) => (
              <li
                key={item.id}
                className="flex justify-between items-center p-3 bg-gray-50 rounded"
              >
                <span>{item.text}</span>
                <button
                  onClick={() => onDelete(item.id)}
                  className="cursor-pointer text-red-500 hover:text-red-700 hover:underline"
                >
                  Supprimer
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
