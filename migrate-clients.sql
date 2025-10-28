-- SCRIPT DE MIGRACIÓN PARA ACTUALIZAR TABLA CLIENTS EXISTENTE
-- Ejecutar este script en lugar del clients-db.sql completo

-- 1. Agregar nuevos campos a la tabla clients existente
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS tipo_identificacion TEXT CHECK (tipo_identificacion IN ('cedula', 'pasaporte', 'licencia', 'otro')) DEFAULT 'cedula',
ADD COLUMN IF NOT EXISTS numero_identificacion TEXT,
ADD COLUMN IF NOT EXISTS qr_code TEXT,
ADD COLUMN IF NOT EXISTS puntos_acumulados INTEGER DEFAULT 0 CHECK (puntos_acumulados >= 0),
ADD COLUMN IF NOT EXISTS nivel_fidelidad TEXT DEFAULT 'bronce' CHECK (nivel_fidelidad IN ('bronce', 'plata', 'oro', 'platino')),
ADD COLUMN IF NOT EXISTS fecha_ultimo_punto TIMESTAMP WITH TIME ZONE;

-- 2. Actualizar campos que no pueden ser NULL después
-- Primero actualizar los registros existentes con valores por defecto
UPDATE clients 
SET 
    numero_identificacion = COALESCE(numero_identificacion, 'ID-' || SUBSTRING(id::text, 1, 8)),
    qr_code = COALESCE(qr_code, 'QR-' || SUBSTRING(id::text, 1, 8) || '-' || EXTRACT(EPOCH FROM NOW())::text)
WHERE numero_identificacion IS NULL OR qr_code IS NULL;

-- 3. Ahora hacer los campos NOT NULL
ALTER TABLE clients 
ALTER COLUMN numero_identificacion SET NOT NULL,
ALTER COLUMN qr_code SET NOT NULL;

-- 4. Agregar constraint de UNIQUE para qr_code si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'clients_qr_code_key'
    ) THEN
        ALTER TABLE clients ADD CONSTRAINT clients_qr_code_key UNIQUE (qr_code);
    END IF;
END $$;

-- 5. Crear índices para optimizar búsquedas
CREATE INDEX IF NOT EXISTS idx_clients_qr_code ON clients(qr_code);
CREATE INDEX IF NOT EXISTS idx_clients_numero_identificacion ON clients(numero_identificacion);

-- 6. Crear tabla de transacciones de lealtad si no existe
CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  puntos_otorgados INTEGER NOT NULL,
  motivo TEXT NOT NULL,
  monto_compra DECIMAL(10,2),
  descripcion TEXT,
  user_id UUID REFERENCES auth.users(id) NOT NULL
);

-- 7. Habilitar RLS para loyalty_transactions si no está habilitado
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'loyalty_transactions' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- 8. Crear políticas de seguridad para loyalty_transactions
DO $$ 
BEGIN
    -- Política para SELECT
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'loyalty_transactions' 
        AND policyname = 'Users can see their own loyalty transactions'
    ) THEN
        CREATE POLICY "Users can see their own loyalty transactions" ON loyalty_transactions
        FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    -- Política para INSERT
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'loyalty_transactions' 
        AND policyname = 'Users can create their own loyalty transactions'
    ) THEN
        CREATE POLICY "Users can create their own loyalty transactions" ON loyalty_transactions
        FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- 9. Crear función para actualizar niveles de fidelidad
CREATE OR REPLACE FUNCTION update_loyalty_level()
RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar nivel de fidelidad basado en puntos
    IF NEW.puntos_acumulados >= 10000 THEN
        NEW.nivel_fidelidad = 'platino';
    ELSIF NEW.puntos_acumulados >= 5000 THEN
        NEW.nivel_fidelidad = 'oro';
    ELSIF NEW.puntos_acumulados >= 2000 THEN
        NEW.nivel_fidelidad = 'plata';
    ELSE
        NEW.nivel_fidelidad = 'bronce';
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 10. Crear trigger para actualizar niveles automáticamente
DROP TRIGGER IF EXISTS update_client_loyalty_level ON clients;
CREATE TRIGGER update_client_loyalty_level BEFORE UPDATE OF puntos_acumulados
    ON clients FOR EACH ROW EXECUTE FUNCTION update_loyalty_level();

-- 11. Dar puntos de bienvenida a clientes existentes que no tengan puntos
UPDATE clients 
SET puntos_acumulados = 100, 
    fecha_ultimo_punto = NOW()
WHERE puntos_acumulados = 0;

-- 12. Actualizar QR codes únicos para clientes existentes que tengan códigos duplicados
UPDATE clients 
SET qr_code = 'QR-' || id::text || '-' || EXTRACT(EPOCH FROM NOW())::text
WHERE qr_code LIKE 'QR-%' AND qr_code IN (
    SELECT qr_code 
    FROM clients 
    GROUP BY qr_code 
    HAVING COUNT(*) > 1
);

-- Verificación final
SELECT 
    'Migración completada exitosamente' as status,
    COUNT(*) as total_clientes,
    COUNT(CASE WHEN puntos_acumulados > 0 THEN 1 END) as clientes_con_puntos,
    COUNT(CASE WHEN qr_code IS NOT NULL THEN 1 END) as clientes_con_qr
FROM clients;