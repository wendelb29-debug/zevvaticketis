# Plano de Implementação: Gestão de Comunicação de Ingressos (Email)

Este plano detalha a implementação do sistema de gestão de comunicação de ingressos, permitindo que Administradores e Produtores acompanhem, reenviem e gerenciem templates de e-mails enviados aos participantes.

## 1. Banco de Dados e Segurança

### Novas Tabelas
- `email_templates`: Armazena os templates de e-mail (HTML, texto, variáveis).
- `email_logs`: Registro detalhado de cada envio (status, aberturas, falhas).

### Migração SQL
```sql
-- Templates de Email
CREATE TABLE public.email_templates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE, -- Produtor ou Admin
    event_id uuid REFERENCES public.events(id) ON DELETE CASCADE, -- Opcional: template específico por evento
    name text NOT NULL,
    category text NOT NULL, -- 'purchase_confirmation', 'ticket_available', 'reminder', etc.
    subject text NOT NULL,
    body_html text NOT NULL,
    body_text text,
    variables jsonb DEFAULT '[]', -- Lista de variáveis suportadas
    status text DEFAULT 'active', -- 'active', 'inactive'
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Logs de Email
CREATE TABLE public.email_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
    ticket_id uuid REFERENCES public.tickets(id) ON DELETE SET NULL,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    template_id uuid REFERENCES public.email_templates(id) ON DELETE SET NULL,
    operator_id uuid REFERENCES auth.users(id) SET NULL, -- Quem reenviou ou causou o envio manual
    email text NOT NULL,
    subject text NOT NULL,
    status text NOT NULL, -- 'sent', 'delivered', 'opened', 'failed', 'resent'
    sent_at timestamptz DEFAULT now(),
    opened_at timestamptz,
    failed_reason text,
    metadata jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now()
);

-- Permissões RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

GRANT ALL ON public.email_templates TO authenticated;
GRANT ALL ON public.email_templates TO service_role;
GRANT ALL ON public.email_logs TO authenticated;
GRANT ALL ON public.email_logs TO service_role;

-- Políticas
CREATE POLICY "Admins can see all templates" ON public.email_templates FOR ALL TO authenticated USING (public.check_is_platform_admin(auth.uid()));
CREATE POLICY "Producers can see their templates" ON public.email_templates FOR ALL TO authenticated USING (owner_id = auth.uid() OR event_id IN (SELECT id FROM public.events WHERE producer_id = auth.uid()));

CREATE POLICY "Admins can see all logs" ON public.email_logs FOR ALL TO authenticated USING (public.check_is_platform_admin(auth.uid()));
CREATE POLICY "Producers can see their logs" ON public.email_logs FOR ALL TO authenticated USING (event_id IN (SELECT id FROM public.events WHERE producer_id = auth.uid()));
```

## 2. Estrutura de Rotas

### Admin
- `/admin/email-management`: Dashboard global de comunicações.
- `/admin/email-templates`: Gestão central de templates do sistema.

### Produtor
- `/produtor/email-management`: Dashboard de comunicações dos seus eventos.
- `/produtor/configuracoes`: Aba para gestão de templates personalizados.

## 3. Componentes e Funcionalidades UI

### Dashboard de Gestão de E-mails
- Cards com indicadores: Total Enviados, Entregues, Abertos, Falhas, Reenviados.
- Filtros avançados: Evento, Produtor, Período, Status, Template.
- Tabela de Histórico com busca e paginação.

### Detalhe e Reenvio
- Modal com histórico do envio específico.
- Botão "Reenviar Ingresso" com confirmação de e-mail e registro de log.

### Editor de Templates
- Formulário para Assunto, HTML (usando um editor básico ou textarea rico) e Texto.
- Inserção de variáveis dinâmicas: `{{nome_usuario}}`, `{{nome_evento}}`, `{{qr_code}}`, etc.
- Preview em tempo real e envio de e-mail de teste.

## 4. Integração de Sistema

- Atualizar o fluxo de pós-compra para registrar os logs na tabela `email_logs`.
- Criar Server Functions para:
  - `sendEmailTest`: Enviar preview.
  - `resendTicketEmail`: Reenviar com novo log.
  - `getTemplateMetrics`: Calcular taxas de abertura e falha por filtro.

## Detalhes Técnicos
- **i18n**: Todo o painel será localizado em Português conforme solicitado.
- **Exportação**: CSV/PDF usando as bibliotecas já instaladas (`jsPDF`, `jsPDF-AutoTable`).
- **Realtime**: Assinatura em `email_logs` para atualização automática do dashboard.
