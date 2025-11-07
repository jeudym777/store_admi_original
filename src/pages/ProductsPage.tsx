import { useForm } from "react-hook-form";
import { useAuth } from "@/hooks/useAuth";
import { useGetProducts } from "@/hooks/useGetProducts";
import { useDeleteProduct } from "@/hooks/useDeleteProduct";
import { toast } from "react-toastify";
import Layout from "./Layout";
import { supabase } from "@/supabaseClient";
import { useState } from "react";
import { checkStorageConfiguration, uploadImageWithRetry, getStorageInstructions, testSupabaseConnection } from "@/utils/storageUtils";

type ProductFormInput = {
  name_product: string;
  description: string;
  price_month: number;
  price_year: number;
  category: string;
  stock: number;
  discount: number;
  link_product: string;
};

export default function ProductsPage() {
  const { user } = useAuth();
  const [contentFile, setContentFile] = useState<File | null>(null);
  const { register, handleSubmit, reset } = useForm<ProductFormInput>();

  type ProductItem = {
    id: any;
    name_product: any;
    description: any;
    price_month: any;
    price_year: any;
    category: any;
    stock: any;
    discount: any;
    link_product: any;
    content_url?: string;
    product_images: { id: any; image_url: any; position: any }[];
  };

  const { data, isLoading, refetch, error } = useGetProducts() as {
    data: ProductItem[] | undefined;
    isLoading: boolean;
    refetch: () => void;
    error: any;
  };

  // Debug info
  console.log("Products data:", data);
  console.log("Is loading:", isLoading);
  console.log("Error:", error);
  const { mutate: handleDeleteProduct } = useDeleteProduct();
  const [files, setFiles] = useState<FileList | null>(null);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isCheckingStorage, setIsCheckingStorage] = useState(false);

  const handleStorageDiagnostic = async () => {
    setIsCheckingStorage(true);
    console.log('🔍 Iniciando diagnóstico completo...');
    
    try {
      // Primero probar la conexión general
      console.log('🔌 Paso 1: Probando conexión con Supabase...');
      const connectionOk = await testSupabaseConnection();
      
      if (!connectionOk) {
        toast.error("❌ Error de conexión con Supabase");
        return;
      }
      
      // Luego verificar Storage específicamente
      console.log('📦 Paso 2: Verificando buckets de Storage...');
      const result = await checkStorageConfiguration();
      
      if (result.success) {
        if (result.hasImagesBucket && result.hasDigitalContentBucket) {
          toast.success(`✅ Storage configurado correctamente! Buckets: ${result.buckets?.join(', ')}`);
          console.log('🎉 ¡Todo está funcionando perfectamente!');
        } else {
          const instructions = getStorageInstructions();
          toast.error("❌ Faltan buckets. Revisa la consola para instrucciones detalladas.");
          console.log('📋 INSTRUCCIONES DETALLADAS:', instructions.message);
          console.log('🔗 Dashboard:', instructions.dashboardUrl);
          
          // Información adicional
          console.log('🔍 Buckets faltantes:');
          if (!result.hasImagesBucket) console.log('   ❌ Falta bucket "images"');
          if (!result.hasDigitalContentBucket) console.log('   ❌ Falta bucket "digitalcontent"');
        }
        console.log('📊 Resultado completo del diagnóstico:', result);
      } else {
        toast.error(`❌ Error en diagnóstico: ${result.error}`);
        console.log('❌ Error detallado:', result);
      }
    } catch (error) {
      console.error('❌ Error inesperado durante el diagnóstico:', error);
      toast.error('❌ Error inesperado durante el diagnóstico');
    } finally {
      setIsCheckingStorage(false);
    }
  };

  const deleteOldImages = async (productId: number) => {
    const { data: oldImages, error } = await supabase
      .from("product_images")
      .select("*")
      .eq("product_id", productId);

    if (error || !oldImages) return;

    // Eliminar del storage
    for (const image of oldImages) {
      const path = image.image_url.split("/storage/v1/object/public/images/")[1];
      if (path) {
        await supabase.storage.from("images").remove([path]);
      }
    }

    // Eliminar de la base de datos
    await supabase.from("product_images").delete().eq("product_id", productId);
  };

  const onSubmit = async (formData: ProductFormInput) => {
    if (!user?.id) {
      toast.error("Usuario no autenticado");
      return;
    }

    // Verificar configuración de Storage antes de proceder
    console.log("🔍 Verificando configuración de Storage...");
    const storageCheck = await checkStorageConfiguration();
    
    if (!storageCheck.success) {
      toast.error(`Error de configuración de Storage: ${storageCheck.error}`);
      return;
    }
    
    if (!storageCheck.hasImagesBucket) {
      console.log("📦 Bucket 'images' no encontrado.");
      const instructions = getStorageInstructions();
      toast.error("❌ Faltan buckets requeridos. Revisa la consola para instrucciones.");
      console.log('📋 INSTRUCCIONES:', instructions.message);
      console.log('🔗 Dashboard:', instructions.dashboardUrl);
      return;
    }

    const { name_product, description, price_month, price_year, category, stock, discount, link_product } = formData;
    
    // Debug: Ver qué datos estamos enviando
    console.log("Form data:", formData);
    console.log("User ID:", user.id);

    if (editingProductId) {
      // Actualizar datos del producto
      const { error } = await supabase
        .from("products")
        .update({ name_product, description, price_month, price_year, category, stock, discount, link_product })
        .eq("id", editingProductId);

      if (error) {
        toast.error("Error al actualizar producto");
        return;
      }

      // Si se subieron nuevas imágenes
      if (files && files.length > 0) {
        await deleteOldImages(editingProductId); // 👈 Borrar anteriores

        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const filePath = `${user.id}/${Date.now()}-${file.name}`;

          try {
            console.log(`📤 Subiendo imagen ${i + 1}/${files.length}: ${file.name}`);
            
            const uploadResult = await uploadImageWithRetry(file, filePath);

            if (!uploadResult || uploadResult.error) {
              const errorMsg = uploadResult?.error?.message || uploadResult?.error || 'Error desconocido';
              console.error(`❌ Error al subir imagen ${file.name}:`, uploadResult?.error);
              toast.error(`Error al subir imagen ${file.name}: ${errorMsg}`);
              continue;
            }

            const imageUrl = supabase.storage.from("images").getPublicUrl(filePath).data.publicUrl;
            console.log(`✅ Imagen subida, URL generada: ${imageUrl}`);

            const { error: insertImageError } = await supabase.from("product_images").insert([
              {
                product_id: editingProductId,
                image_url: imageUrl,
                position: i + 1,
              },
            ]);

            if (insertImageError) {
              console.error(`❌ Error al guardar imagen en DB:`, insertImageError);
              toast.error(`Error al guardar imagen ${file.name} en la base de datos`);
            } else {
              console.log(`✅ Imagen ${file.name} guardada exitosamente en DB`);
            }
          } catch (error) {
            console.error(`❌ Error inesperado con imagen ${file.name}:`, error);
            toast.error(`Error inesperado al procesar imagen ${file.name}`);
          }
        }
      }

      toast.success("Producto actualizado");
      setEditingProductId(null);
    } else {
      // Crear producto nuevo
      const productData = {
        name_product,
        description,
        price_month: Number(price_month),
        price_year: price_year ? Number(price_year) : null,
        category,
        stock: Number(stock),
        discount: Number(discount),
        link_product: link_product || null,
        user_id: user.id
      };
      
      console.log("Inserting product:", productData);
      
      const { data: product, error: errorProduct } = await supabase
        .from("products")
        .insert([productData])
        .select()
        .single();

      if (errorProduct || !product) {
        toast.error("Error al agregar producto");
        return;
      }

      // Subir archivo digital si existe
      if (contentFile) {
        const filePath = `${user.id}/${Date.now()}-${contentFile.name}`;

        const { error: uploadError } = await supabase.storage
          .from("digitalcontent") // asegúrate que sea el nombre del bucket
          .upload(filePath, contentFile);

        if (uploadError) {
          toast.error("Error al subir archivo digital");
        } else {
          const publicUrl = supabase.storage
            .from("digitalcontent")
            .getPublicUrl(filePath).data.publicUrl;

          // Si tienes una columna en la tabla 'products' para este archivo:
          await supabase
            .from("products")
            .update({ content_url : publicUrl }) // <--- o como se llame tu campo
            .eq("id", product.id);
        }
      }


      if (files && files.length > 0) {
        console.log(`📤 Subiendo ${files.length} imágenes para producto nuevo...`);
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const filePath = `${user.id}/${Date.now()}-${file.name}`;

          try {
            console.log(`📤 Subiendo imagen ${i + 1}/${files.length}: ${file.name}`);
            
            const uploadResult = await uploadImageWithRetry(file, filePath);

            if (!uploadResult || uploadResult.error) {
              const errorMsg = uploadResult?.error?.message || uploadResult?.error || 'Error desconocido';
              console.error(`❌ Error al subir imagen ${file.name}:`, uploadResult?.error);
              toast.error(`Error al subir imagen ${file.name}: ${errorMsg}`);
              continue;
            }

            const imageUrl = supabase.storage.from("images").getPublicUrl(filePath).data.publicUrl;
            console.log(`✅ Imagen subida, URL generada: ${imageUrl}`);

            const { error: insertImageError } = await supabase.from("product_images").insert([
              {
                product_id: product.id,
                image_url: imageUrl,
                position: i + 1,
              },
            ]);

            if (insertImageError) {
              console.error(`❌ Error al guardar imagen en DB:`, insertImageError);
              toast.error(`Error al guardar imagen ${file.name} en la base de datos`);
            } else {
              console.log(`✅ Imagen ${file.name} guardada exitosamente en DB`);
            }
          } catch (error) {
            console.error(`❌ Error inesperado con imagen ${file.name}:`, error);
            toast.error(`Error inesperado al procesar imagen ${file.name}`);
          }
        }
      }

      toast.success("Producto agregado correctamente");
    }

    reset();
    setFiles(null);
    refetch();
    setPreviewUrls([]);

  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Mis Productos</h1>
          <button
            type="button"
            onClick={handleStorageDiagnostic}
            disabled={isCheckingStorage}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isCheckingStorage ? '🔍 Verificando...' : '🔍 Verificar Storage'}
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mb-8 space-y-4">
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
            {...register("price_month", { required: true })}
            className="w-full border p-3 rounded"
            placeholder="Precio mensual"
          />
          <input
            type="number"
            step="0.01"
            {...register("price_year", { required: false })}
            className="w-full border p-3 rounded"
            placeholder="Precio anual (opcional)"
          />

          <input
            {...register("category", { required: true })}
            placeholder="Categoría"
            className="w-full border p-3 rounded"
          />
          <input
            type="number"
            {...register("stock", { valueAsNumber: true, required: true })}
            placeholder="Stock"
            className="w-full border p-3 rounded"
          />
          <input
            type="number"
            {...register("discount", { valueAsNumber: true, required: true })}
            placeholder="Descuento (%)"
            className="w-full border p-3 rounded"
          />
          <input
            type="url"
            {...register("link_product", { required: false })}
            placeholder="Link del producto (opcional)"
            className="w-full border p-3 rounded"
          />


















          <label className="block">
            <span className="font-medium text-gray-700">Seleccionar imágenes del producto</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                const selectedFiles = e.target.files;
                if (!selectedFiles) return;
                setFiles(selectedFiles);

                const urls = Array.from(selectedFiles).map((file) => URL.createObjectURL(file));
                setPreviewUrls(urls);
              }}
              className="w-full border p-3 rounded mt-1"
            />
          </label>

          <label className="block mt-4">
            <span className="font-medium text-gray-700">Archivo digital (.zip, .rar)</span>
            <input
              type="file"
              accept=".zip,.rar"
              onChange={e => setContentFile(e.target.files?.[0] ?? null)}
              className="w-full border p-3 rounded mt-1"
            />
          </label>
          {contentFile && (
            <p className="text-sm text-gray-600 mt-1">
              📦 Archivo seleccionado: <strong>{contentFile.name}</strong>
            </p>
          )}




          <button className="bg-indigo-600 text-white px-5 py-3 rounded hover:bg-indigo-700 w-full">
            {editingProductId ? "Actualizar producto" : "Agregar producto"}
          </button>

          {previewUrls.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold mb-2 text-gray-700">Previsualización:</h4>
              <div className="flex flex-wrap gap-3">
                {previewUrls.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-24 h-24 object-cover rounded border"
                  />
                ))}
              </div>
            </div>
          )}



        </form>

        {isLoading ? (
          <p className="text-center text-gray-500">Cargando productos...</p>
        ) : data?.length === 0 ? (
          <p className="text-center text-gray-500">No hay productos aún.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.map((item) => (
              <div
                key={item.id}
                className="border rounded-xl shadow hover:shadow-lg transition duration-300 p-4 bg-white flex flex-col justify-between"
              >
                {/* Imagen principal */}
                <div className="w-full h-48 bg-gray-100 rounded overflow-hidden mb-3">
                  <img
                    src={item.product_images?.[0]?.image_url || "/placeholder.jpg"}
                    alt={item.name_product}
                    className="w-full h-full object-cover"
                  />
                </div>{/* Botón de descarga de archivo digital */}
 

                {/* Info */}
                <h3 className="text-lg font-semibold text-gray-800 mb-1 truncate">
                  {item.name_product}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-2">{item.description}</p>
                <p className="text-sm text-gray-700">Categoría: {item.category}</p>
                <p className="text-sm text-gray-700">Stock: {item.stock}</p>
                <p className="text-sm text-gray-700">Descuento: {item.discount}%</p>
                <div className="mt-2">
                  <p className="text-indigo-700 font-bold text-lg">
                    Mensual: ₡{Number(item.price_month).toLocaleString("es-CR")}
                  </p>
                  {item.price_year && (
                    <p className="text-green-700 font-bold text-lg">
                      Anual: ₡{Number(item.price_year).toLocaleString("es-CR")}
                    </p>
                  )}
                </div>
                {item.link_product && (
                  <a
                    href={item.link_product}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center justify-center px-3 py-1 text-white bg-blue-500 hover:bg-blue-600 rounded text-sm font-semibold transition"
                  >
                    🔗 Ver producto
                  </a>
                )}
                {/* Botón de descarga de archivo digital */}
                {item.content_url  && (
                  <a
                    href={item.content_url }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center justify-center px-4 py-2 text-white bg-green-500 hover:bg-green-600 rounded text-sm font-semibold transition"
                  >
                    📦 Descargar archivo
                  </a>
                )}





                {/* Miniaturas */}
                {item.product_images?.length > 1 && (
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {item.product_images.slice(1).map((img) => (
                      <img
                        key={img.image_url}
                        src={img.image_url}
                        className="w-10 h-10 rounded border object-cover"
                        alt="Extra"
                      />
                    ))}
                  </div>
                )}

                {/* Botones */}
                <div className="mt-4 flex justify-between items-center text-sm">
                  <button
                    onClick={() => {
                      setEditingProductId(item.id);
                      reset({
                        name_product: item.name_product,
                        description: item.description,
                        price_month: item.price_month,
                        price_year: item.price_year,
                        category: item.category,
                        stock: item.stock,
                        discount: item.discount,
                        link_product: item.link_product,
                      });
                      setFiles(null);
                      setPreviewUrls([]);

                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="text-blue-600 hover:underline"
                  >
                    Editar
                  </button>

                  <button
                    onClick={() => handleDeleteProduct(item.id)}
                    className="text-red-500 hover:underline"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
