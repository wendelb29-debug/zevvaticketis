-- Create team_invites table
CREATE TABLE public.team_invites (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    email text NOT NULL,
    permissions jsonb NOT NULL DEFAULT '[]',
    status text NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aceito')),
    created_at timestamptz DEFAULT now() NOT NULL,
    UNIQUE(organization_id, email)
);

-- Update organization_members to include permissions and specific role
ALTER TABLE public.organization_members ADD COLUMN IF NOT EXISTS permissions jsonb DEFAULT '[]';

-- Update platform_settings table
CREATE TABLE IF NOT EXISTS public.platform_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    default_platform_fee numeric NOT NULL DEFAULT 10,
    updated_at timestamptz DEFAULT now() NOT NULL
);

-- RLS for team_invites
ALTER TABLE public.team_invites ENABLE ROW LEVEL SECURITY;

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.team_invites TO authenticated;
GRANT ALL ON public.team_invites TO service_role;

GRANT SELECT ON public.platform_settings TO authenticated;
GRANT ALL ON public.platform_settings TO service_role;

-- Policies for team_invites
CREATE POLICY "Owners can manage invites"
    ON public.team_invites
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.organization_members
            WHERE user_id = auth.uid()
            AND organization_id = team_invites.organization_id
            AND role = 'produtor_owner'
        )
    );

-- Policy for members to see their own organization's invites (optional but helpful)
CREATE POLICY "Members can see organization invites"
    ON public.team_invites
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.organization_members
            WHERE user_id = auth.uid()
            AND organization_id = team_invites.organization_id
        )
    );
