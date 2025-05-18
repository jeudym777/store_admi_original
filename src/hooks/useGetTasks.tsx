import { supabase } from "@/supabaseClient";
import { useAuth } from "./useAuth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import type { Task } from "@/types/task";

export const useGetTasks = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  async function fetchTasks() {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data as Task[];
  }

  useEffect(() => {
    if (!user) return;

    console.log("Configuration du temps réel pour les tâches");

    const eventsChannel = supabase
      .channel("tasks-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "tasks",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("INSERT reçu:", payload);
          queryClient.setQueryData<Task[]>(["tasks"], (oldData = []) => {
            return [payload.new as Task, ...oldData];
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "tasks",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("UPDATE reçu:", payload);
          queryClient.setQueryData<Task[]>(["tasks"], (oldData = []) => {
            return oldData.map((task) =>
              task.id === payload.new.id ? (payload.new as Task) : task
            );
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "tasks",
          // PAS de filtre sur user_id car la ligne est déjà supprimée
        },
        (payload) => {
          console.log("DELETE reçu:", payload);
          // Vérifier si la tâche supprimée est dans notre liste avant de mettre à jour
          queryClient.setQueryData<Task[]>(["tasks"], (oldData = []) => {
            return oldData.filter((task) => task.id !== payload.old.id);
          });
        }
      )
      .subscribe();

    // Nettoyage
    return () => {
      console.log("Nettoyage des souscriptions temps réel");
      supabase.removeChannel(eventsChannel);
    };
  }, [user, queryClient]);

  return useQuery({
    queryKey: ["tasks"],
    queryFn: fetchTasks,
    enabled: !!user,
  });
};
