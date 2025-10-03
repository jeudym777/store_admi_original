// src/hooks/useGetProducts.ts
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/supabaseClient";
 
export async function fetchProducts() {
  // Primero, veamos qué columnas existen realmente
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .limit(1);

  if (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
  
  console.log("Sample product structure:", data?.[0]);
  
  // Ahora hagamos la consulta completa con los nombres correctos
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select(`
      id,
      name_product,
      description,
      price_month,
      price_year,
      category,
      stock,
      discount,
      link_product,
      content_url,
      product_images (
        id,
        image_url,
        position
      )
    `)
    .order("created_at", { ascending: false });

  if (productsError) {
    console.error("Error fetching products:", productsError);
    throw productsError;
  }
  
  console.log("Fetched products:", products);
  return products;
}

export function useGetProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });
}
