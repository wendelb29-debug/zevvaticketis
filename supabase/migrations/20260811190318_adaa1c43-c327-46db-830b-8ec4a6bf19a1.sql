INSERT INTO public.email_templates (name, category, subject, body_html, status) 
VALUES ('Confirmação de Compra Padrão', 'purchase_confirmation', 'Seu ingresso chegou! 🎫', '<p>Olá {{nome_usuario}}, seu ingresso para {{nome_evento}} está confirmado!</p>', 'active');

-- Add logs linked to existing events
INSERT INTO public.email_logs (email, subject, status, event_id)
SELECT 'participante@exemplo.com', 'Seu ingresso chegou! 🎫', 'delivered', id FROM public.events LIMIT 1;

INSERT INTO public.email_logs (email, subject, status, event_id)
SELECT 'erro@exemplo.com', 'Seu ingresso chegou! 🎫', 'failed', id FROM public.events LIMIT 1;

INSERT INTO public.email_logs (email, subject, status, event_id)
SELECT 'aberto@exemplo.com', 'Seu ingresso chegou! 🎫', 'opened', id FROM public.events LIMIT 1;
