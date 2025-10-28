-- Create a table for clients
CREATE TABLE clients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  nombre TEXT NOT NULL,
  apellidos TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  telefono TEXT,
  cumpleanos_dia INTEGER CHECK (cumpleanos_dia >= 1 AND cumpleanos_dia <= 31),
  cumpleanos_mes TEXT CHECK (cumpleanos_mes IN ('Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre')),
  recibir_promociones BOOLEAN DEFAULT false,
  -- Nuevos campos para el sistema de fidelización
  tipo_identificacion TEXT CHECK (tipo_identificacion IN ('cedula', 'pasaporte', 'licencia', 'otro')) DEFAULT 'cedula',
  numero_identificacion TEXT NOT NULL,
  qr_code TEXT UNIQUE NOT NULL, -- Código QR único generado
  puntos_acumulados INTEGER DEFAULT 0 CHECK (puntos_acumulados >= 0),
  nivel_fidelidad TEXT DEFAULT 'bronce' CHECK (nivel_fidelidad IN ('bronce', 'plata', 'oro', 'platino')),
  fecha_ultimo_punto TIMESTAMP WITH TIME ZONE,
  user_id UUID REFERENCES auth.users(id) NOT NULL
);

-- Add Row Level Security (RLS)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to see only their own clients
CREATE POLICY "Users can see their own clients" ON clients
  FOR SELECT USING (auth.uid() = user_id);

-- Policy to allow users to create their own clients
CREATE POLICY "Users can create their own clients" ON clients
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update their own clients
CREATE POLICY "Users can update their own clients" ON clients
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy to allow users to delete their own clients
CREATE POLICY "Users can delete their own clients" ON clients
  FOR DELETE USING (auth.uid() = user_id);

-- Create an updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE
    ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create index for QR code lookups
CREATE INDEX idx_clients_qr_code ON clients(qr_code);
CREATE INDEX idx_clients_numero_identificacion ON clients(numero_identificacion);

-- Create a table for loyalty transactions (historial de puntos)
CREATE TABLE loyalty_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  puntos_otorgados INTEGER NOT NULL,
  motivo TEXT NOT NULL,
  monto_compra DECIMAL(10,2),
  descripcion TEXT,
  user_id UUID REFERENCES auth.users(id) NOT NULL
);

-- Add RLS to loyalty_transactions
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;

-- Policies for loyalty_transactions
CREATE POLICY "Users can see their own loyalty transactions" ON loyalty_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own loyalty transactions" ON loyalty_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to update loyalty level based on points
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

CREATE TRIGGER update_client_loyalty_level BEFORE UPDATE OF puntos_acumulados
    ON clients FOR EACH ROW EXECUTE FUNCTION update_loyalty_level();