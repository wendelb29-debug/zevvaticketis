# Plano de Auditoria Corretiva e Segurança — Fase 1: Multi-tenant

Missão: Tornar o sistema seguro, estável e preparado para produção, focando no isolamento multi-tenant e validação server-side.

## Fase 1: Segurança Multi-tenant

### 1. Auditoria e Correção de Funções Server-side
- **Função Central de Segurança**: Criação de `src/lib/security.ts` com a função `validateUserTenantAccess` para centralizar a verificação de pertencimento ao tenant, papéis (OWNER, ADMIN, etc.) e privilégios de Platform Admin.
- **Correção em Convites (`sendTeamInvite`)**: 
    - Exigência de `tenantId` explícito.
    - Validação de autorização no servidor antes de usar `supabaseAdmin`.
    - Sanitização de `redirectTo` para evitar redirecionamentos externos maliciosos.
    - Zod schemas restritos.
- **Correção em Eventos (`createEventFull`)**:
    - Validação rigorosa de inputs (tamanhos, tipos, valores não negativos).
    - Verificação de autorização do usuário para o `tenant_id` informado antes da criação.
    - Garantia de que um produtor não crie eventos em tenants alheios.
- **Auditoria `supabaseAdmin`**: Revisão de todas as funções que utilizam o cliente administrativo para garantir que a autorização precede a operação.

### 2. Riscos e Observações
- **Risco**: Se as políticas de RLS não estiverem perfeitamente alinhadas com a lógica de `tenant_members`, as funções podem falhar ou permitir vazamentos via queries diretas.
- **Ação**: A Fase 2 focará exclusivamente no RLS para complementar essas travas server-side.

## Arquivos Afetados
- `src/lib/security.ts` (Novo: Função central de validação)
- `src/lib/team.functions.ts` (Correção de convites)
- `src/lib/events-creation.functions.ts` (Correção de criação de eventos)

## Próximos Passos
Após a validação da Fase 1 pelo usuário, prosseguiremos para a **Fase 2: RLS e Banco de Dados**.
