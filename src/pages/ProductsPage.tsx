import { useForm } from "react-hook-form";
import { useAuth } from "@/hooks/useAuth";
import { useGetProducts } from "@/hooks/useGetProducts";
import { useDeleteProduct } from "@/hooks/useDeleteProduct";
import { toast } from "react-toastify";
import Layout from "./Layout";
import { supabase } from "@/supabaseClient";
import { useState } from "react";

type ProductFormInput = {
  name_product: string;
  description: string;
  price: number;
};

export default function ProductsPage() {
  const { user } = useAuth();
  const { register, handleSubmit, reset } = useForm<ProductFormInput>();
  const { data, isLoading, refetch } = useGetProducts();
  const { mutate: handleDeleteProduct } = useDeleteProduct();
  const [files, setFiles] = useState<FileList | null>(null);

  const onSubmit = async (formData: ProductFormInput) => {
    if (!user?.id) {
      toast.error("Usuario no autenticado");
      return;
    }

    const { name_product, description, price } = formData;

    // Paso 1: insertar producto
    const { data: product, error: errorProduct } = await supabase
      .from("products")
      .insert([{ name_product, description, price, user_id: user.id }])
      .select()
      .single();

    if (errorProduct || !product) {
      toast.error("Error al agregar producto");
      return;
    }

    // Paso 2: subir imágenes al bucket 'images'
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const filePath = `${user.id}/${Date.now()}-${file.name}`;

        const { data: _uploadedImage, error: uploadError } = await supabase.storage
          .from("images")
          .upload(filePath, file);

        if (uploadError) {
          toast.error(`Error al subir imagen ${file.name}`);
          continue;
        }

        const imageUrl = supabase.storage.from("images").getPublicUrl(filePath).data.publicUrl;

        const { error: insertImageError } = await supabase.from("product_images").insert([
          {
            product_id: product.id,
            image_url: imageUrl,
            position: i + 1,
          },
        ]);

        if (insertImageError) {
          toast.error(`Error al guardar la imagen ${file.name}`);
        }
      }
    }

    toast.success("Producto agregado correctamente");
    reset();
    setFiles(null);
    refetch();
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Mis Productos</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="mb-4 space-y-3">
          <input
            {...register("name_product", { required: true })}
            className="w-full border p-3 rounded"
            placeholder="Nombre del producto"
          />
          <textarea
            {...register("description", { required: true })}
            className="w-full border p-3 rounded"
            placeholder="Descripción del producto"
          />
          <input
            type="number"
            step="0.01"
            {...register("price", { required: true })}
            className="w-full border p-3 rounded"
            placeholder="Precio"
          />

          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setFiles(e.target.files)}
            className="w-full border p-3 rounded"
          />

          <button className="bg-indigo-600 text-white px-5 py-3 rounded hover:bg-indigo-700">
            Agregar producto
          </button>
        </form>

        {isLoading ? (
          <p>Cargando productos...</p>
        ) : (
          <ul className="space-y-3">
            {data?.map((item) => (
              <li
                key={item.id}
                className="p-4 bg-gray-100 rounded flex justify-between items-start"
              >
                <div>
                  <p className="font-medium text-lg">{item.name_product}</p>
                  <p className="text-gray-600">{item.description}</p>
                  <p className="text-indigo-700 font-semibold mt-1">₡{item.price}</p>

                  <div className="flex flex-wrap gap-2 mt-2">
                    {item.product_images?.map((img) => (
                      <img
                        key={img.image_url}
                        src={img.image_url}
                        alt="Imagen del producto"
                        className="h-20 rounded shadow"
                      />
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteProduct(item.id)}
                  className="text-red-500 hover:underline"
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  );
}
