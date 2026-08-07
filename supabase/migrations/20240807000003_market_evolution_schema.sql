-- 1. ENUMS AND ROLES
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM ('admin', 'produtor', 'staff', 'participante');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 2. PROFILES (Update to match Phase 2)
ALTER TABLE public.profiles RENAME COLUMN nome TO nome_completo;
-- Ensure other columns exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='status') THEN
        ALTER TABLE public.profiles ADD COLUMN status text DEFAULT 'ativo';
    END IF;
END $$;

-- 3. PRODUCERS
CREATE TABLE IF NOT EXISTS public.producers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    nome_empresa text NOT NULL,
    documento text,
    telefone text,
    email text,
    cidade text,
    pais text DEFAULT 'Brasil',
    status_aprovacao text DEFAULT 'pendente', -- pendente, aprovado, reprovado
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(user_id)
);

ALTER TABLE public.producers ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.producers TO authenticated;
GRANT ALL ON public.producers TO service_role;

-- 4. EVENTS (Update/Refine)
ALTER TABLE public.events RENAME COLUMN title TO nome_evento;
ALTER TABLE public.events RENAME COLUMN description TO descricao_completa;
ALTER TABLE public.events RENAME COLUMN cover_image TO imagem_capa;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='events' AND column_name='slug') THEN
        ALTER TABLE public.events ADD COLUMN slug text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='events' AND column_name='galeria_imagens') THEN
        ALTER TABLE public.events ADD COLUMN galeria_imagens text[];
    END IF;
END $$;

-- 5. ORDERS (Refine)
ALTER TABLE public.orders RENAME COLUMN valor_total TO valor_produtos;
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='taxa_plataforma') THEN
        ALTER TABLE public.orders ADD COLUMN taxa_plataforma numeric DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='valor_total') THEN
        ALTER TABLE public.orders ADD COLUMN valor_total numeric DEFAULT 0;
    END IF;
END $$;

-- 6. TICKETS (Refine)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tickets' AND column_name='codigo_unico') THEN
        ALTER TABLE public.tickets ADD COLUMN codigo_unico text UNIQUE;
    END IF;
END $$;

-- 7. CHECKINS (Refine)
CREATE TABLE IF NOT EXISTS public.checkins_new (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id uuid REFERENCES public.tickets(id) ON DELETE CASCADE NOT NULL,
    operador_id uuid REFERENCES auth.users(id) NOT NULL,
    local_checkin text,
    data_hora timestamptz DEFAULT now()
);

-- RLS POLICIES FOR NEW/UPDATED TABLES

-- Producers
CREATE POLICY "Producers manage own data" ON public.producers
FOR ALL TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- User Roles
CREATE POLICY "Admins manage roles" ON public.user_roles
FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Final Cleanup (Optional: migrate existing roles if needed)
-- INSERT INTO public.user_roles (user_id, role) 
-- SELECT id, 'admin'::public.app_role FROM public.profiles WHERE role = 'admin' ... (logic varies)

