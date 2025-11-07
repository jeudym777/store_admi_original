-- ========================================
-- POLÍTICAS SQL PARA SUPABASE STORAGE
-- ========================================
-- Ejecuta este SQL en tu Supabase Dashboard > SQL Editor

-- 1. POLÍTICAS PARA EL BUCKET "images" (público)
-- ========================================

-- Permitir a usuarios autenticados subir imágenes
CREATE POLICY "Allow authenticated users to upload images" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'images');

-- Permitir a todos ver las imágenes (público)
CREATE POLICY "Allow public to view images" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'images');

-- Permitir a usuarios autenticados ver sus propias imágenes
CREATE POLICY "Allow authenticated to view images" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'images');

-- Permitir a usuarios eliminar sus propias imágenes
CREATE POLICY "Allow users to delete own images" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Permitir a usuarios actualizar sus propias imágenes
CREATE POLICY "Allow users to update own images" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ========================================
-- 2. POLÍTICAS PARA EL BUCKET "digitalcontent" (privado)
-- ========================================

-- Permitir a usuarios autenticados subir contenido digital
CREATE POLICY "Allow authenticated users to upload content" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'digitalcontent');

-- Permitir a usuarios ver solo su propio contenido digital
CREATE POLICY "Allow users to view own content" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'digitalcontent' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Permitir a usuarios eliminar su propio contenido digital
CREATE POLICY "Allow users to delete own content" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'digitalcontent' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Permitir a usuarios actualizar su propio contenido digital
CREATE POLICY "Allow users to update own content" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'digitalcontent' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ========================================
-- 3. POLÍTICA PARA LISTAR BUCKETS
-- ========================================

-- Permitir a usuarios autenticados listar buckets disponibles
CREATE POLICY "Allow authenticated users to list buckets" ON storage.buckets
FOR SELECT TO authenticated
USING (true);

-- ========================================
-- 4. VERIFICAR POLÍTICAS EXISTENTES (opcional)
-- ========================================

-- Ejecuta esta consulta para ver las políticas actuales:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies 
-- WHERE schemaname = 'storage';

-- ========================================
-- INSTRUCCIONES:
-- ========================================
-- 1. Ve a: https://wsqulmavuurhcoakdsbe.supabase.co/project/wsqulmavuurhcoakdsbe/sql
-- 2. Copia y pega TODO este código
-- 3. Haz clic en "Run"
-- 4. Vuelve a tu aplicación y prueba "🔍 Verificar Storage"