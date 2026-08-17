# Plano de Implementação — Gestão Individual de Tenants (Master Console)

Finalizar a central operacional de gestão de projetos (/admin/tenants/$id), garantindo isolamento total, dados reais e ações administrativas auditáveis.

## Arquitetura de Componentes
- `src/components/admin/tenant/TenantHeader.tsx`: Cabeçalho adaptável com metadados, status e ações rápidas.
- `src/components/admin/tenant/TenantTabs.tsx`: Barra de abas rolável com persistência de estado na URL.
- `src/components/admin/tenant/TenantOverview.tsx`: Dashboard de saúde e indicadores reais.
- `src/components/admin/tenant/TenantActivityFeed.tsx`: Linha do tempo de auditoria filtrada por projeto.
- `src/components/admin/tenant/TenantFinancial.tsx`: Visão financeira (GMV vs Receita) com RLS hardened.
- `src/components/admin/tenant/modals/`: Diálogos para Suspensão, Mudança de Plano e Modo Suporte.

## Detalhes Técnicos
- **Estado Global**: Utilizar `useQuery` centralizado no componente pai para evitar re-fetchings desnecessários.
- **Persistência de URL**: Sincronizar a aba ativa com `searchParams` do TanStack Router.
- **Segurança (Backend)**:
  - Todas as ações críticas (suspender, alterar plano) executadas via RPC em `src/lib/master/tenants.functions.ts`.
  - Validação rigorosa via `private.is_platform_admin_current()` em todas as chamadas administrativas.
- **Auditoria**: Cada alteração manual feita pelo administrador global será registrada na tabela `audit_logs`.

## Etapas de Execução
1. **Infraestrutura**: Criar hooks customizados `useTenantAdminDetails` e `useTenantAdminStats`.
2. **Layout Base**: Implementar o novo `TenantHeader` e a navegação rolável.
3. **Módulos Funcionais**: Popular as abas de Visão Geral, Identidade, Plano, Equipe e Financeiro.
4. **Interatividade**: Finalizar o diálogo de Suspensão e o menu de Ações do Sistema.
5. **Polimento**: Refinar responsividade, estados de erro (404/403) e feedback visual (Skeleton).

## Invariantes e Segurança
- Nunca exibir segredos de integração ou senhas.
- Garantir que o UUID no breadcrumb seja substituído pelo nome amigável do projeto.
- Bloquear operações financeiras se o usuário não possuir a permissão `master.view_financial`.
