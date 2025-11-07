# Configuración de Supabase Storage para Imágenes

## Problema Detectado

El problema que tienes es que los **buckets de storage** necesarios para subir imágenes no están creados o configurados correctamente en tu proyecto de Supabase.

## Solución Paso a Paso

### 1. Verificar Estado Actual

Primero, usa el botón **"🔍 Verificar Storage"** que agregué en la página de productos para diagnosticar el estado actual de tu Storage.

### 2. Configurar Storage en Supabase Dashboard

Si el diagnóstico muestra que faltan buckets, ve a tu dashboard de Supabase:

1. **Accede a Storage:**
   - Ve a https://wsqulmavuurhcoakdsbe.supabase.co
   - Navega a **Storage** en el panel lateral

2. **Crear Bucket de Imágenes:**
   ```
   Nombre: images
   Público: ✅ Sí (para que las imágenes sean accesibles)
   Tamaño máximo: 10 MB
   Tipos permitidos: image/png, image/jpeg, image/jpg, image/gif, image/webp
   ```

3. **Crear Bucket de Contenido Digital:**
   ```
   Nombre: digitalcontent
   Público: ❌ No (contenido privado)
   Tamaño máximo: 100 MB
   Tipos permitidos: application/zip, application/x-rar-compressed
   ```

### 3. Configurar Políticas RLS (Row Level Security)

Para el bucket **images** (público):

```sql
-- Política para permitir INSERT
CREATE POLICY "Allow authenticated users to upload images" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'images');

-- Política para permitir SELECT
CREATE POLICY "Allow public to view images" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'images');

-- Política para permitir DELETE (para el propietario)
CREATE POLICY "Allow users to delete own images" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1]);
```

Para el bucket **digitalcontent** (privado):

```sql
-- Política para permitir INSERT
CREATE POLICY "Allow authenticated users to upload content" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'digitalcontent');

-- Política para permitir SELECT (solo el propietario)
CREATE POLICY "Allow users to view own content" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'digitalcontent' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Política para permitir DELETE (solo el propietario)
CREATE POLICY "Allow users to delete own content" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'digitalcontent' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### 4. Estructura de Archivos

Los archivos se guardarán con esta estructura:
```
images/
  ├── {user_id}/
  │   ├── {timestamp}-imagen1.jpg
  │   └── {timestamp}-imagen2.png

digitalcontent/
  ├── {user_id}/
  │   ├── {timestamp}-archivo.zip
  │   └── {timestamp}-contenido.rar
```

### 5. Debugging

Si sigues teniendo problemas:

1. **Verifica en la consola del navegador** los errores específicos
2. **Usa el botón de diagnóstico** para ver el estado de los buckets
3. **Revisa los permisos** en el dashboard de Supabase
4. **Verifica la autenticación** del usuario

## Mensajes de Error Comunes

- **"Bucket does not exist"**: El bucket no está creado
- **"Access denied"**: Faltan políticas RLS
- **"File too large"**: El archivo excede el límite del bucket
- **"Invalid file type"**: El tipo de archivo no está permitido

## Testing

Después de configurar todo:

1. Usa el botón "🔍 Verificar Storage" - debería mostrar ✅
2. Intenta subir una imagen pequeña (< 1MB) primero
3. Revisa la consola del navegador para logs detallados
4. Si funciona, prueba con archivos más grandes

## Automatización

El código que agregué incluye funciones para:

- ✅ **Verificar automáticamente** si los buckets existen
- ✅ **Crear buckets** automáticamente si faltan
- ✅ **Reintentos automáticos** si falla la subida
- ✅ **Logs detallados** para debugging
- ✅ **Manejo de errores** mejorado