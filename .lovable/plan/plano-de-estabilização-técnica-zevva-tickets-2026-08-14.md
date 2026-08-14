# Plano de Estabilização Técnica — Zevva Tickets

Este plano estabelece as diretrizes para a **Fase 0 — Estabilização**, focando em consolidar a infraestrutura, segurança multi-tenant e remoção de dados fictícios para preparar o sistema para escala global.

## Mudanças Propostas

### 1. Banco de Dados e Migrações
- **Saneamento de Migrações**: Identificar e remover `INSERT` statements de dados fictícios (ex: eventos de teste, membros de organizações de exemplo) das migrações de schema em `supabase/migrations/`.
- **Integridade de Sementes**: Garantir que apenas dados fundamentais (países, moedas, definições de permissões, automações padrão) permaneçam no banco inicial.

### 2. Isolamento Multi-tenant (Multiempresa)
- **RLS Audit**: Revisar e endurecer as políticas de Row Level Security em tabelas críticas (`events`, `orders`, `whatsapp_messages`, `team_invites`) para garantir isolamento total por `tenant_id`.
- **Fluxo de Workspace**: Reforçar os guards em `src/routes/produtor.tsx` e `src/routes/admin.tsx` para assegurar que o contexto do `activeTenant` nunca seja perdido em sub-rotas.

### 3. Remoção de Mocks no Frontend
- **Chat & BI**: Substituir dados simulados em `src/routes/admin/chat.tsx` e no dashboard de BI por conexões reais com as tabelas do Supabase.
- **Limpeza de Logs**: Remover mensagens de console e mocks residuais em `src/lib/chat.functions.ts`.

### 4. Estabilização de Preferências e i18n
- **Race Condition Fix**: Garantir que a inicialização do `i18next` e do `UI Store` (Zustand) ocorra de forma atômica para evitar o erro `hasLanguageSomeTranslations`.
- **Sincronização**: Validar a persistência de preferências de idioma, tema e fuso horário entre múltiplos dispositivos via `user_device_preferences`.

## Detalhes Técnicos
- **Testes de Permissão**: Implementar testes unitários para o RPC `has_permission` e para a lógica de RBAC granular.
- **Validação de Checkout**: Criar scripts de teste para o fluxo de pagamento e geração de ingressos digitais.
- **Infraestrutura**: Configurar `search_path` e `SECURITY INVOKER` em todas as funções SQL novas para mitigar vulnerabilidades identificadas.

## Critérios de Aceite
- [ ] Banco de dados operando apenas com dados reais ou sementes de sistema.
- [ ] Isolamento de dados entre diferentes organizações verificado via RLS.
- [ ] Sistema de internacionalização carregando instantaneamente sem falhas de estado.
- [ ] Dashboard e Chat consumindo dados reais do banco.