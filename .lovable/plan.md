# Plano de Implementação: Fase 0 — Estabilização

Este plano visa consolidar as bases técnicas do Zevva Tickets, removendo mocks residuais, estabilizando o isolamento de dados (Multi-Tenant) e garantindo que o sistema de preferências e idiomas esteja operando sem falhas.

## 1. Limpeza de Dados e Mockups

### Banco de Dados
- **Ação:** Identificar e remover `INSERT` statements de dados fictícios em migrações legadas.
- **Técnica:** Criar uma nova migração de sanitização que deleta eventos, organizações e membros de teste que não possuam referências reais de usuários.
- **Status:** Em andamento (migrações mapeadas).

### Frontend
- **Chat Admin (`src/routes/admin/chat.tsx`):** Substituir listas estáticas de contatos por consultas reais ao Supabase com `realtime`.
- **BI Dashboard (`src/components/dashboard/AdminDashboardBI.tsx`):** Remover valores de funil hardcoded (`setFunnelData`) e conectar ao motor de métricas real.
- **Sugestões de IA (`src/lib/chat.functions.ts`):** Remover as frases fixas e preparar o hook para a integração real via AI Gateway.

## 2. Reforço do Isolamento Multi-Tenant

### Auditoria de RLS
- **Ação:** Revisar as políticas de RLS das tabelas `events`, `tickets` e `whatsapp_messages`.
- **Garantia:** Assegurar que nenhuma query no frontend possa omitir o filtro `tenant_id` ou `organization_id` sem disparar erro de permissão no banco.

### Backend Handlers
- **Ação:** Aplicar o helper `validateUserTenantAccess` em todas as server functions que manipulam dados sensíveis (convites, finanças, configurações).

## 3. Estabilização de Temas e Idiomas

### Ciclo de Vida i18n
- **Ação:** Garantir que o `i18nReady` seja respeitado em todos os componentes de layout antes de renderizar strings dinâmicas.
- **Ação:** Sincronizar as chaves de tradução entre os arquivos de `pt-BR`, `en-US` e `es-ES` para evitar o erro "hasLanguageSomeTranslations".

### Preferências de Usuário
- **Ação:** Consolidar a gravação de preferências (idioma, tema, zoom) nas tabelas `user_preferences` e `user_device_preferences`.
- **Ação:** Otimizar o script de prevenção de "flash of unstyled content" no `__root.tsx`.

## Detalhes Técnicos
- Utilização de `BroadcastChannel` para sincronização de estado entre abas.
- Implementação de subscrições Supabase Realtime para o módulo de Chat Omnichannel.
- Centralização de tipos em `src/lib/i18n/types.ts`.
