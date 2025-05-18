-- Créer une table pour votre application
CREATE TABLE tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  text TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL
);

-- Ajouter une politique Row Level Security (RLS)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux utilisateurs de voir uniquement leurs propres éléments
CREATE POLICY "Utilisateurs peuvent voir leurs propres éléments" ON tasks
  FOR SELECT USING (auth.uid() = user_id);

-- Politique pour permettre aux utilisateurs de créer leurs propres éléments
CREATE POLICY "Utilisateurs peuvent créer leurs propres éléments" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politique pour permettre aux utilisateurs de modifier leurs propres éléments
CREATE POLICY "Utilisateurs peuvent modifier leurs propres éléments" ON tasks
  FOR UPDATE USING (auth.uid() = user_id);

-- Politique pour permettre aux utilisateurs de supprimer leurs propres éléments
CREATE POLICY "Utilisateurs peuvent supprimer leurs propres éléments" ON tasks
  FOR DELETE USING (auth.uid() = user_id);