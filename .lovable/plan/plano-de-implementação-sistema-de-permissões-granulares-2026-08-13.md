# Plano de Implementação: Sistema de Permissões Granulares

Aprimorar o sistema de permissões para oferecer controle granular sobre as ações dos usuários dentro de cada organização (tenant), garantindo segurança e flexibilidade para produtores e administradores.

## Mudanças Propostas

### Backend (Banco de Dados e Segurança)
- Atualizar as políticas de RLS e funções de segurança para validar permissões específicas.
- Sincronizar as definições de permissões entre o frontend e o backend (`src/lib/security.ts`).

### Lógica de Negócio (Server Functions)
- Atualizar `src/lib/team.functions.ts` para suportar a nova estrutura de permissões no convite de membros.
- Garantir que o `inviteSchema` reflita as opções reais disponíveis no sistema.

### Interface do Usuário (Painel do Produtor)
- Refatorar `src/routes/produtor/equipe.tsx` para listar todas as permissões granulares disponíveis.
- Agrupar permissões por categorias (Check-in, Financeiro, Marketing, Eventos, Configurações).
- Adicionar tooltips explicativos para cada permissão.
- Implementar a edição de permissões para membros já ativos (atualmente falta na UI do produtor).

## Detalhes Técnicos

- **Enum de Roles**: Manter a estrutura de roles do Supabase (`OWNER`, `ADMIN`, `MANAGER`, etc.) mas expandir o campo `permissions` (JSON) para conter flags específicas.
- **Mapeamento de Ações**: Atualizar `ACTION_PERMISSIONS` em `src/lib/security.ts` para incluir novas ações como `gerenciar_configuracoes`, `visualizar_relatorios`, etc.
- **Componente TeamManagement**: Unificar a lógica entre o componente de admin e o de produtor onde for possível, ou garantir que ambos usem o mesmo conjunto de permissões.

## Próximos Passos
1. Validar a lista final de permissões desejadas.
2. Atualizar `src/lib/security.ts` com as novas ações.
3. Modificar `src/routes/produtor/equipe.tsx` para refletir as mudanças.
4. Testar o fluxo de convite e validação de acesso.