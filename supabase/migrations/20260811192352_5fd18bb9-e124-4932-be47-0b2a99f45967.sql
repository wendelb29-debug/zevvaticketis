-- Atualizar o enum de papéis para incluir os novos papéis solicitados
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tenant_role') THEN
    CREATE TYPE public.tenant_role AS ENUM ('OWNER', 'ADMIN', 'MANAGER', 'MARKETING', 'FINANCEIRO', 'CHECKIN_MANAGER', 'CHECKIN_OPERATOR');
  ELSE
    -- Postgres doesn't support ALTER TYPE ADD VALUE in a transaction with other commands easily
    -- but we can try to add them if they don't exist
    ALTER TYPE public.tenant_role ADD VALUE IF NOT EXISTS 'CHECKIN_MANAGER';
    ALTER TYPE public.tenant_role ADD VALUE IF NOT EXISTS 'CHECKIN_OPERATOR';
  END IF;
END $$;

-- Garantir que a tabela tenants (produtores) tenha os campos necessários
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS empresa TEXT;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS telefone TEXT;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pendente';
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free';

-- Garantir grants
GRANT SELECT, INSERT, UPDATE ON public.tenants TO authenticated;
GRANT ALL ON public.tenants TO service_role;

-- Função auxiliar para verificar permissão do usuário no produtor (tenant)
CREATE OR REPLACE FUNCTION public.user_has_producer_role(_user_id UUID, _tenant_id UUID, _required_roles public.tenant_role[])
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.tenant_members
    WHERE user_id = _user_id
      AND tenant_id = _tenant_id
      AND role = ANY(_required_roles)
  )
$$;

-- Refinar RLS em tabelas críticas para garantir isolamento absoluto
-- Exemplo: Campanhas
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own tenant campaigns" ON public.campaigns;
CREATE POLICY "Users can view their own tenant campaigns"
ON public.campaigns
FOR SELECT
TO authenticated
USING (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()));

-- Exemplo: Anúncios
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own tenant ads" ON public.ads;
CREATE POLICY "Users can view their own tenant ads"
ON public.ads
FOR SELECT
TO authenticated
USING (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()));

-- Garantir que eventos tenham tenant_id (produtor) e RLS
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Producers can manage their own events" ON public.events;
CREATE POLICY "Producers can manage their own events"
ON public.events
FOR ALL
TO authenticated
USING (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()))
WITH CHECK (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()));

-- Permitir leitura pública de eventos publicados (Marketplace)
CREATE POLICY "Anyone can view published events"
ON public.events
FOR SELECT
TO anon, authenticated
USING (status = 'publicado');
