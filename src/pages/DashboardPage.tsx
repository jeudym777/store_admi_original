import { useForm } from "react-hook-form";
import { useAuth } from "@/hooks/useAuth";
import { useGetTasks } from "@/hooks/useGetTasks";
import { useSignOut } from "@/hooks/useSignOut";
import { useDeleteTask } from "@/hooks/useDeleteTask";
import { useAddTask } from "@/hooks/useAddTask";
import { toast } from "react-toastify";
import Layout from "./Layout"; 
import ProductsPage from "@/pages/ProductsPage";


export default function DashboardPage() {
  const { user } = useAuth();
  const { register, handleSubmit, reset } = useForm<{ text: string }>();
  const { data, isLoading } = useGetTasks();
  const { mutate: handleAddTask } = useAddTask();
  const { mutate: handleSignOut } = useSignOut();
  const { mutate: handleDelete } = useDeleteTask();

  const onDelete = (id: string) => {
    handleDelete(id, {
      onSuccess: () => {
        toast.success("Task deleted successfully");
      },
      onError: () => {
        toast.error("An error occurred while deleting the task");
      },
    });
  };

  const onSubmit = (data: { text: string }) => {
    handleAddTask(data.text, {
      onSuccess: () => {
        toast.success("Task added successfully");
        reset();
      },
      onError: () => {
        toast.error("An error occurred while adding the task");
      },
    });
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-6 py-4 text-white">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7 mr-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <h1 className="text-2xl font-bold">My tasks</h1>
              </div>
              <div className="flex items-center bg-indigo-700/50 rounded-full px-4 py-2 text-sm">
                <span className="mr-2 truncate max-w-[150px] sm:max-w-xs">
                  {user.email}
                </span>
                <button
                  onClick={() => handleSignOut()}
                  className="ml-2 cursor-pointer text-indigo-500 hover:text-white transition-colors flex items-center p-2 bg-indigo-100 hover:bg-indigo-600 rounded-lg"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
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
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Add form */}
           

          {/* List of items */}
           

            {/* Footer */}
            {data && data.length > 0 && (
              <div className="mt-8 pt-4 border-t border-gray-100 text-center text-sm text-gray-500">
                Creado por Ingeniero Yeudi Martinez ss
                <ProductsPage />

              </div>

              
            )}
          </div>
        </div>            
 
    


    </Layout>

  );
}
