# Plano de Implementação: Fase 1 — MVP Comercial

## Visão Geral
Esta fase foca na transição do Zevva Tickets de um protótipo funcional para uma plataforma comercialmente viável, implementando o motor de vendas real, gestão de estoque transacional e conformidade operacional (LGPD/Segurança).

## Ações Imediatas

### 1. Pagamentos e Checkout (Stripe Connect)
- Implementar `src/lib/payments/stripe.functions.ts` para gerenciar Payment Intents.
- Criar webhooks em `src/routes/api/public/stripe-webhook.ts` para processar pagamentos.
- Implementar lógica de idempotência para evitar duplicidade de pedidos.
- Adicionar suporte a Pix com cotação dinâmica em tempo real.

### 2. Gestão de Estoque e Pedidos
- Implementar controle transacional de estoque (SELECT FOR UPDATE) para evitar overbooking.
- Criar fluxos de cancelamento e reembolso automatizados.
- Desenvolver tela de "Meus Pedidos" com histórico detalhado e status transacional.

### 3. Cadastro Profissional de Eventos
- Expandir o Wizard de eventos para incluir configurações avançadas de impostos e taxas.
- Implementar validação rigorosa de documentos de produtores.

### 4. Notificações e BI Real
- Integrar notificações transacionais (E-mail/WhatsApp) via webhooks após confirmação de pagamento.
- Substituir dados simulados do Dashboard BI por queries reais agregadas do `ledger_entries` e `orders`.

### 5. Segurança e Conformidade
- Implementar 2FA (Autenticação de Dois Fatores) para contas de produtores e admins.
- Adicionar logs de auditoria para ações sensíveis (LGPD).
- Criar central de privacidade para gestão de dados do usuário.

## Detalhes Técnicos

### Esquema de Banco (Novas Tabelas/Campos)
```sql
-- Extensão de estoque e segurança
ALTER TABLE public.ticket_types ADD COLUMN stock_version int DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN two_factor_enabled boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN two_factor_secret text;
```

### Segurança
- Uso de `security definer` apenas em funções críticas com `search_path` fixo.
- RLS endurecido para isolamento total entre Tenants na camada de pagamentos.
