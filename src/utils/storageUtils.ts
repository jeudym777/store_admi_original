import { supabase } from '@/supabaseClient';

export const checkStorageConfiguration = async () => {
  try {
    console.log('🔍 Verificando configuración de Storage...');
    
    // Verificar autenticación primero
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('❌ Error de autenticación:', authError);
      return { success: false, error: `Error de autenticación: ${authError.message}` };
    }
    
    if (!user) {
      console.error('❌ Usuario no autenticado');
      return { success: false, error: 'Usuario no autenticado' };
    }
    
    console.log('✅ Usuario autenticado:', user.email);
    
    // Verificar si los buckets existen
    console.log('📡 Intentando listar buckets...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Error al listar buckets:', bucketsError);
      console.error('❌ Detalles del error:', JSON.stringify(bucketsError, null, 2));
      return { success: false, error: `Error al listar buckets: ${bucketsError.message}` };
    }
    
    console.log('📦 Buckets disponibles:', buckets);
    console.log('📊 Número de buckets encontrados:', buckets?.length || 0);
    
    if (!buckets || buckets.length === 0) {
      console.error('❌ No se encontraron buckets');
      return { success: false, error: 'No se encontraron buckets' };
    }
    
    const imagesBucket = buckets?.find(bucket => bucket.name === 'images');
    const digitalContentBucket = buckets?.find(bucket => bucket.name === 'digitalcontent');
    
    console.log('🖼️ Bucket "images" encontrado:', !!imagesBucket);
    console.log('💾 Bucket "digitalcontent" encontrado:', !!digitalContentBucket);
    
    if (imagesBucket) {
      console.log('📋 Detalles bucket "images":', imagesBucket);
    }
    
    if (digitalContentBucket) {
      console.log('📋 Detalles bucket "digitalcontent":', digitalContentBucket);
    }
    
    // Verificar permisos de upload en el bucket de imágenes
    if (imagesBucket) {
      try {
        const testFile = new File(['test'], 'test.txt', { type: 'text/plain' });
        const testPath = `test/${Date.now()}-test.txt`;
        
        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(testPath, testFile);
          
        if (uploadError) {
          console.error('❌ Error de permisos en bucket "images":', uploadError);
        } else {
          console.log('✅ Permisos de upload en "images" funcionando');
          // Limpiar archivo de prueba
          await supabase.storage.from('images').remove([testPath]);
        }
      } catch (error) {
        console.error('❌ Error al probar upload en "images":', error);
      }
    }
    
    return {
      success: true,
      buckets: buckets?.map(b => b.name) || [],
      hasImagesBucket: !!imagesBucket,
      hasDigitalContentBucket: !!digitalContentBucket,
      needsManualSetup: !imagesBucket || !digitalContentBucket
    };
    
  } catch (error) {
    console.error('❌ Error general al verificar Storage:', error);
    return { success: false, error: 'Error general al verificar Storage' };
  }
};

export const testSupabaseConnection = async () => {
  try {
    console.log('🔌 Probando conexión con Supabase...');
    
    // Test 1: Verificar URL y key
    console.log('🔑 Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
    console.log('🔑 Supabase Key (primeros 10 chars):', import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 10) + '...');
    
    // Test 2: Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('👤 Usuario actual:', user?.email || 'No autenticado');
    
    if (authError) {
      console.error('❌ Error de auth:', authError);
      return false;
    }
    
    // Test 3: Hacer una consulta simple
    const { error } = await supabase.from('products').select('count').limit(1);
    
    if (error) {
      console.error('❌ Error de conexión DB:', error);
      return false;
    }
    
    console.log('✅ Conexión con Supabase OK');
    return true;
    
  } catch (error) {
    console.error('❌ Error inesperado:', error);
    return false;
  }
};

export const getStorageInstructions = () => {
  return {
    title: "🔧 Configuración Manual Requerida",
    message: "Los buckets de Storage deben crearse manualmente en el dashboard de Supabase.",
    steps: [
      "Ve a: https://wsqulmavuurhcoakdsbe.supabase.co/project/wsqulmavuurhcoakdsbe/storage/buckets",
      "Crea el bucket 'images': Nombre: images, Público: SÍ, Archivos permitidos: Imágenes",
      "Crea el bucket 'digitalcontent': Nombre: digitalcontent, Público: NO, Archivos permitidos: ZIP, RAR",
      "Después de crear los buckets, vuelve a hacer clic en 'Verificar Storage'"
    ],
    dashboardUrl: "https://wsqulmavuurhcoakdsbe.supabase.co/project/wsqulmavuurhcoakdsbe/storage/buckets"
  };
};

export const uploadImageWithRetry = async (file: File, path: string, maxRetries = 3): Promise<{ data: any; error: any } | null> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📤 Intento ${attempt}/${maxRetries} de subir imagen: ${file.name}`);
      
      const { data, error } = await supabase.storage
        .from('images')
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) {
        console.error(`❌ Error en intento ${attempt}:`, error);
        if (attempt === maxRetries) {
          return { data: null, error };
        }
        // Esperar antes del siguiente intento
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        continue;
      }
      
      console.log(`✅ Imagen subida exitosamente en intento ${attempt}`);
      return { data, error: null };
      
    } catch (error) {
      console.error(`❌ Error inesperado en intento ${attempt}:`, error);
      if (attempt === maxRetries) {
        return { data: null, error };
      }
    }
  }
  
  return { data: null, error: new Error('Falló después de todos los intentos') };
};