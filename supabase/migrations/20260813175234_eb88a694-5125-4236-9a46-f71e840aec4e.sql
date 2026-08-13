
-- 1. Create global permission definitions
CREATE TABLE public.permission_definitions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    key text UNIQUE NOT NULL,
    module text NOT NULL,
    name text NOT NULL,
    description text,
    risk_level text CHECK (risk_level IN ('baixo', 'médio', 'alto', 'crítico')) DEFAULT 'baixo',
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

GRANT SELECT ON public.permission_definitions TO authenticated;
GRANT ALL ON public.permission_definitions TO service_role;

ALTER TABLE public.permission_definitions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can read permission definitions" ON public.permission_definitions FOR SELECT TO authenticated USING (true);

-- 2. Create project roles table
CREATE TABLE public.project_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name text NOT NULL,
    description text,
    color text,
    is_system boolean DEFAULT false,
    is_protected boolean DEFAULT false,
    is_active boolean DEFAULT true,
    created_by uuid REFERENCES auth.users(id),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(tenant_id, name)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_roles TO authenticated;
GRANT ALL ON public.project_roles TO service_role;

ALTER TABLE public.project_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see roles from their tenants" ON public.project_roles
FOR SELECT TO authenticated
USING (tenant_id IN (SELECT get_user_tenants()));

CREATE POLICY "Admins can manage roles" ON public.project_roles
FOR ALL TO authenticated
USING (
    tenant_id IN (SELECT get_user_tenants()) 
    AND (EXISTS (SELECT 1 FROM tenant_members WHERE tenant_id = project_roles.tenant_id AND user_id = auth.uid() AND role IN ('OWNER', 'ADMIN')))
);

-- 3. Role Permissions mapping
CREATE TABLE public.role_permissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    role_id uuid NOT NULL REFERENCES public.project_roles(id) ON DELETE CASCADE,
    permission_id uuid NOT NULL REFERENCES public.permission_definitions(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    UNIQUE(role_id, permission_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.role_permissions TO authenticated;
GRANT ALL ON public.role_permissions TO service_role;

ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see permissions of roles in their tenants" ON public.role_permissions
FOR SELECT TO authenticated
USING (tenant_id IN (SELECT get_user_tenants()));

CREATE POLICY "Admins can manage role permissions" ON public.role_permissions
FOR ALL TO authenticated
USING (
    tenant_id IN (SELECT get_user_tenants())
    AND (EXISTS (SELECT 1 FROM tenant_members WHERE tenant_id = role_permissions.tenant_id AND user_id = auth.uid() AND role IN ('OWNER', 'ADMIN')))
);

-- 4. Assign roles to members
CREATE TABLE public.project_member_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id uuid NOT NULL REFERENCES public.project_roles(id) ON DELETE CASCADE,
    assigned_by uuid REFERENCES auth.users(id),
    assigned_at timestamptz DEFAULT now(),
    UNIQUE(tenant_id, user_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_member_roles TO authenticated;
GRANT ALL ON public.project_member_roles TO service_role;

ALTER TABLE public.project_member_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see member roles in their tenants" ON public.project_member_roles
FOR SELECT TO authenticated
USING (tenant_id IN (SELECT get_user_tenants()));

CREATE POLICY "Admins can assign roles" ON public.project_member_roles
FOR ALL TO authenticated
USING (
    tenant_id IN (SELECT get_user_tenants())
    AND (EXISTS (SELECT 1 FROM tenant_members WHERE tenant_id = project_member_roles.tenant_id AND user_id = auth.uid() AND role IN ('OWNER', 'ADMIN')))
);

-- 5. Helper function has_permission
CREATE OR REPLACE FUNCTION public.has_permission(p_permission_key text, p_tenant_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id uuid := auth.uid();
    v_is_owner boolean;
BEGIN
    -- 1. Check if user is OWNER of the tenant (Owner bypass)
    SELECT EXISTS (
        SELECT 1 FROM public.tenant_members 
        WHERE tenant_id = p_tenant_id 
        AND user_id = v_user_id 
        AND role = 'OWNER'
    ) INTO v_is_owner;

    IF v_is_owner THEN
        RETURN true;
    END IF;

    -- 2. Check if user has a role with that permission
    RETURN EXISTS (
        SELECT 1 
        FROM public.project_member_roles pmr
        JOIN public.role_permissions rp ON pmr.role_id = rp.role_id
        JOIN public.permission_definitions pd ON rp.permission_id = pd.id
        WHERE pmr.tenant_id = p_tenant_id
        AND pmr.user_id = v_user_id
        AND pd.key = p_permission_key
        AND pd.is_active = true
    );
END;
$$;

-- 6. Populate default permissions
INSERT INTO public.permission_definitions (key, module, name, description, risk_level) VALUES
('dashboard.view', 'DASHBOARD', 'Visualizar Dashboard', 'Acessar a página inicial de indicadores', 'baixo'),
('dashboard.view_metrics', 'DASHBOARD', 'Visualizar indicadores', 'Ver gráficos e métricas detalhadas', 'baixo'),
('dashboard.export', 'DASHBOARD', 'Exportar dados do Dashboard', 'Baixar relatórios em PDF ou CSV', 'médio'),
('chat.view', 'CHAT', 'Acessar o Chat', 'Ver a lista de atendimentos', 'baixo'),
('chat.reply', 'CHAT', 'Responder clientes', 'Enviar mensagens para os clientes', 'médio'),
('chat.transfer', 'CHAT', 'Transferir atendimento', 'Passar atendimento para outro agente ou setor', 'médio'),
('chat.finalize', 'CHAT', 'Finalizar atendimento', 'Concluir a conversa com o cliente', 'médio'),
('contacts.view', 'CONTATOS', 'Visualizar contatos', 'Ver a lista de clientes cadastrados', 'baixo'),
('contacts.create', 'CONTATOS', 'Criar contatos', 'Adicionar novos clientes manualmente', 'médio'),
('contacts.update', 'CONTATOS', 'Editar contatos', 'Alterar dados cadastrais de clientes', 'médio'),
('events.view', 'EVENTOS', 'Visualizar eventos', 'Ver a lista de eventos do projeto', 'baixo'),
('events.create', 'EVENTOS', 'Criar eventos', 'Criar novos eventos e experiências', 'médio'),
('events.update', 'EVENTOS', 'Editar eventos', 'Alterar detalhes de eventos existentes', 'médio'),
('events.publish', 'EVENTOS', 'Publicar eventos', 'Tornar eventos visíveis ao público', 'crítico'),
('tickets.view', 'INGRESSOS', 'Visualizar ingressos', 'Ver tipos de ingresso e vendas', 'baixo'),
('finance.view', 'FINANCEIRO', 'Visualizar financeiro', 'Acessar relatórios financeiros', 'crítico'),
('team.view', 'EQUIPE', 'Visualizar equipe', 'Ver membros do projeto', 'baixo'),
('team.invite', 'EQUIPE', 'Convidar usuário', 'Enviar convites para novos membros', 'alto'),
('roles.view', 'PERMISSÕES', 'Visualizar cargos', 'Ver cargos e permissões configurados', 'baixo'),
('roles.manage', 'PERMISSÕES', 'Gerenciar cargos', 'Criar, editar e excluir cargos', 'crítico');

-- 7. Trigger to sync legacy roles for existing tenants
CREATE OR REPLACE FUNCTION public.sync_legacy_roles()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    t_record RECORD;
    r_proprietario_id uuid;
    r_administrador_id uuid;
    r_atendente_id uuid;
    p_dashboard_view_id uuid;
    p_chat_view_id uuid;
    p_chat_reply_id uuid;
BEGIN
    SELECT id INTO p_dashboard_view_id FROM public.permission_definitions WHERE key = 'dashboard.view';
    SELECT id INTO p_chat_view_id FROM public.permission_definitions WHERE key = 'chat.view';
    SELECT id INTO p_chat_reply_id FROM public.permission_definitions WHERE key = 'chat.reply';

    FOR t_record IN SELECT id FROM public.tenants LOOP
        -- Create Proprietário
        INSERT INTO public.project_roles (tenant_id, name, description, is_system, is_protected)
        VALUES (t_record.id, 'Proprietário', 'Acesso total e controle do projeto', true, true)
        ON CONFLICT (tenant_id, name) DO UPDATE SET is_system = true RETURNING id INTO r_proprietario_id;

        -- Create Administrador
        INSERT INTO public.project_roles (tenant_id, name, description, is_system, is_protected)
        VALUES (t_record.id, 'Administrador', 'Gerencia a maioria dos recursos', true, true)
        ON CONFLICT (tenant_id, name) DO UPDATE SET is_system = true RETURNING id INTO r_administrador_id;

        -- Create Atendente
        INSERT INTO public.project_roles (tenant_id, name, description, is_system, is_protected)
        VALUES (t_record.id, 'Atendente', 'Acesso operacional ao chat', true, true)
        ON CONFLICT (tenant_id, name) DO UPDATE SET is_system = true RETURNING id INTO r_atendente_id;

        -- Assign some basic permissions to Atendente for testing
        INSERT INTO public.role_permissions (tenant_id, role_id, permission_id)
        VALUES 
            (t_record.id, r_atendente_id, p_dashboard_view_id),
            (t_record.id, r_atendente_id, p_chat_view_id),
            (t_record.id, r_atendente_id, p_chat_reply_id)
        ON CONFLICT DO NOTHING;

        -- Migrate existing members
        INSERT INTO public.project_member_roles (tenant_id, user_id, role_id)
        SELECT tm.tenant_id, tm.user_id, 
               CASE 
                 WHEN tm.role = 'OWNER' THEN r_proprietario_id
                 WHEN tm.role = 'ADMIN' THEN r_administrador_id
                 ELSE r_atendente_id
               END
        FROM public.tenant_members tm
        WHERE tm.tenant_id = t_record.id
        ON CONFLICT (tenant_id, user_id) DO NOTHING;
    END LOOP;
END;
$$;

SELECT public.sync_legacy_roles();
