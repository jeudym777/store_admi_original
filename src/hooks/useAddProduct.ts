import { useMutation } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { supabase } from "@/supabaseClient";

export const useAddProduct = () => {
  const { user } = useAuth();

  async function addProduct(newProduct: { name: string; image_url?: string }) {
    const { error } = await supabase.from("products").insert([
      {
        name: newProduct.name,
        image_url: newProduct.image_url ?? "",
        user_id: user?.id ?? "",
      },
    ]);

    if (error) {
      console.error(error);
      throw error;
    }
  }

  return useMutation({ mutationFn: addProduct });
};