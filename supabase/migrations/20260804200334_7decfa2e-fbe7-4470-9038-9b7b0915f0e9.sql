-- Create basic tables for countries and currencies (referenced in Wave 1)
CREATE TABLE public.countries (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nome text NOT NULL,
    codigo_iso text UNIQUE NOT NULL,
    ativo boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE public.currencies (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo text UNIQUE NOT NULL,
    simbolo text NOT NULL,
    ativo boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- Wave 1 Tables
CREATE TABLE public.platform_admins (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at timestamptz DEFAULT now(),
    UNIQUE(user_id)
);

CREATE TABLE public.organizations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nome text NOT NULL,
    documento text,
    pais_id uuid REFERENCES public.countries(id),
    moeda_padrao_id uuid REFERENCES public.currencies(id),
    status text DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'bloqueado')),
    plan_id uuid, -- Plan details in Wave 7
    taxa_percentual_custom numeric,
    stripe_account_id text,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE public.organization_members (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role text NOT NULL CHECK (role IN ('produtor_owner', 'equipe')),
    permissions jsonb DEFAULT '[]'::jsonb, -- Array of strings: checkin, financeiro, marketing, suporte
    created_at timestamptz DEFAULT now(),
    UNIQUE(organization_id, user_id)
);

CREATE TABLE public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nome text,
    email text,
    telefone text,
    documento text,
    pais_id uuid REFERENCES public.countries(id),
    idioma_preferido text,
    created_at timestamptz DEFAULT now()
);

-- GRANTs (Required for Data API)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.countries TO authenticated;
GRANT SELECT ON public.countries TO anon;
GRANT ALL ON public.countries TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.currencies TO authenticated;
GRANT SELECT ON public.currencies TO anon;
GRANT ALL ON public.currencies TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.platform_admins TO authenticated;
GRANT ALL ON public.platform_admins TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.organizations TO authenticated;
GRANT ALL ON public.organizations TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.organization_members TO authenticated;
GRANT ALL ON public.organization_members TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT ALL ON public.profiles TO service_role;

-- RLS
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.currencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public read countries" ON public.countries FOR SELECT TO public USING (ativo = true);
CREATE POLICY "Public read currencies" ON public.currencies FOR SELECT TO public USING (ativo = true);

CREATE POLICY "Admins can read own record" ON public.platform_admins FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Members can read their organizations" ON public.organizations
FOR SELECT TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.organization_members 
    WHERE organization_id = public.organizations.id AND user_id = auth.uid()
));

CREATE POLICY "Owners can update their organizations" ON public.organizations
FOR UPDATE TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.organization_members 
    WHERE organization_id = public.organizations.id AND user_id = auth.uid() AND role = 'produtor_owner'
));

CREATE POLICY "Members can read organization members" ON public.organization_members
FOR SELECT TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.organization_members 
    WHERE organization_id = public.organization_members.organization_id AND user_id = auth.uid()
));

CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());
CREATE POLICY "Public can read profiles" ON public.profiles FOR SELECT TO public USING (true);

-- Trigger for auto-populating profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email)
  VALUES (new.id, new.raw_user_meta_data->>'nome', new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
