-- Create push_automations table
CREATE TABLE public.push_automations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    trigger_type TEXT NOT NULL, -- 'payment_approved', 'event_reminder_24h', 'abandoned_cart', 'post_event_feedback', 'new_course'
    status TEXT NOT NULL DEFAULT 'paused', -- 'active', 'paused', 'disabled'
    delay_time INTERVAL, -- delay after trigger
    audience TEXT NOT NULL DEFAULT 'all', -- 'all', 'buyers', 'students', 'producers', 'segmented'
    title_template TEXT,
    message_template TEXT,
    button_text TEXT,
    action_url TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create push_notifications (log/queue) table
CREATE TABLE public.push_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    automation_id UUID REFERENCES public.push_automations(id) ON DELETE SET NULL,
    campaign_name TEXT, -- for manual campaigns
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'failed', 'read'
    sent_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    error_message TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create event_feedbacks table
CREATE TABLE public.event_feedbacks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.push_automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_feedbacks ENABLE ROW LEVEL SECURITY;

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.push_automations TO authenticated;
GRANT ALL ON public.push_automations TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.push_notifications TO authenticated;
GRANT ALL ON public.push_notifications TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_feedbacks TO authenticated;
GRANT ALL ON public.event_feedbacks TO service_role;

-- Policies (Admin only for automations and all logs, user can see their own notifications/feedbacks)
CREATE POLICY "Admins can manage push automations" ON public.push_automations
    FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can see all push notifications" ON public.push_notifications
    FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can see their own push notifications" ON public.push_notifications
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can see all feedbacks" ON public.event_feedbacks
    FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can manage their own feedbacks" ON public.event_feedbacks
    FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Initial Seeds for standard automations
INSERT INTO public.push_automations (name, description, trigger_type, status, title_template, message_template, button_text)
VALUES 
('COMPRA APROVADA', 'Enviar confirmação imediata após pagamento confirmado.', 'payment_approved', 'active', 'Compra confirmada 🎉', 'Olá {{nome}}, sua compra foi confirmada. Seu ingresso já está disponível.', 'Abrir ingresso'),
('LEMBRETE 24H', 'Aviso automático um dia antes do evento.', 'event_reminder_24h', 'active', 'Seu evento acontece amanhã 🚀', 'O evento {{evento}} começa em 24h em {{local}}.', 'Ver ingresso'),
('CARRINHO ABANDONADO', 'Recupere vendas não finalizadas após 2h.', 'abandoned_cart', 'paused', 'Você deixou sua compra pendente.', 'Ainda dá tempo de garantir sua vaga no {{evento}}!', 'Continuar compra'),
('FEEDBACK PÓS-EVENTO', 'Peça avaliação aos participantes.', 'post_event_feedback', 'disabled', 'Como foi sua experiência?', 'Conte-nos o que achou do evento {{evento}}.', 'Avaliar evento'),
('NOVO CURSO', 'Notifica alunos sobre novas aulas.', 'new_course', 'active', 'Novo curso disponível.', 'Um novo conteúdo acaba de ser publicado: {{curso}}.', 'Ver curso');
