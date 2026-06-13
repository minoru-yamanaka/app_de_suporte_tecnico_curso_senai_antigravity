-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'tecnico', 'cliente');
CREATE TYPE ticket_priority AS ENUM ('Baixa', 'Média', 'Alta', 'Crítica');

-- Create categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create statuses table
CREATE TABLE statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  text_color TEXT NOT NULL,
  bg_color TEXT NOT NULL,
  is_closed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role user_role DEFAULT 'cliente',
  title TEXT,
  phone TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tickets table
CREATE TABLE tickets (
  id SERIAL PRIMARY KEY,
  subject TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  priority ticket_priority DEFAULT 'Baixa',
  status_id UUID REFERENCES statuses(id) ON DELETE RESTRICT,
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ
);

-- Create system settings table (singleton)
CREATE TABLE system_settings (
  id INT PRIMARY KEY DEFAULT 1,
  title TEXT NOT NULL DEFAULT 'Suporte Técnico',
  subtitle TEXT NOT NULL DEFAULT 'Painel de Controle Integrado',
  logo_url TEXT,
  help_text TEXT,
  help_email TEXT,
  help_phone TEXT,
  help_website TEXT,
  CHECK (id = 1)
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Public read access" ON categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin write access" ON categories FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Public read access" ON statuses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin write access" ON statuses FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Public read access" ON system_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin write access" ON system_settings FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Public read profiles" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manage profiles" ON profiles FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Users edit own profile" ON profiles FOR UPDATE TO authenticated USING (
  id = auth.uid()
);

CREATE POLICY "Users read all tickets" ON tickets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users create tickets" ON tickets FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Admin and techs update tickets" ON tickets FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'tecnico'))
);
CREATE POLICY "Admin delete tickets" ON tickets FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Insert settings
INSERT INTO system_settings (title, subtitle) VALUES ('Suporte Técnico', 'Painel Integrado');

-- Insert statuses
INSERT INTO statuses (id, name, text_color, bg_color, is_closed) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Pendente', 'text-on-surface-variant', 'bg-outline', FALSE),
  ('22222222-2222-2222-2222-222222222222', 'Em Progresso', 'text-primary-container', 'bg-secondary', FALSE),
  ('33333333-3333-3333-3333-333333333333', 'Validando', 'text-secondary', 'bg-tertiary-fixed-dim', FALSE),
  ('44444444-4444-4444-4444-444444444444', 'Concluído', 'text-on-secondary-fixed-variant', 'bg-primary-fixed-dim', TRUE);

-- Insert categories
INSERT INTO categories (id, name, icon) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Informática/TI', 'computer'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Elétrica', 'electrical_services'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Predial/Civil', 'domain'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Segurança', 'security'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Telecom', 'router');

-- Create Admin User (admin@admin.com / admin)
-- We must make sure the pgcrypto extension is active
CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES 
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', 'admin@admin.com', crypt('admin', gen_salt('bf')), NOW(), '{"provider": "email", "providers": ["email"]}', '{}', NOW(), NOW());

INSERT INTO profiles (id, name, role, title, photo_url)
VALUES ('00000000-0000-0000-0000-000000000000', 'Administrador', 'admin', 'Suporte Nível 3', 'https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff');

-- Insert mock tickets
INSERT INTO tickets (subject, description, category_id, priority, status_id, created_by) VALUES
  ('Falha no Servidor de Arquivos', 'Servidor principal inoperante, todos os arquivos bloqueados.', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Crítica', '22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000'),
  ('Troca de Lâmpadas Hall Entrada', 'Lâmpadas queimadas no hall principal.', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Baixa', '11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000'),
  ('Manutenção AC Sala 4', 'Ar condicionado pingando.', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Alta', '33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000000');
