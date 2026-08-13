# Plano de Implementação CRM Zevva

Este plano descreve a implementação do módulo de CRM de Contatos, Grupos e Histórico de Atendimentos, conforme solicitado.

## Fase 1: Base de Dados e Normalização

### Objetivos
- Auditar e expandir tabelas existentes sem perda de dados.
- Implementar normalização de telefones e deduplicação.
- Garantir isolamento por tenant via RLS.

### Alterações no Banco de Dados (Migration)
1.  **whatsapp_contacts**:
    *   Adicionar: `normalized_phone`, `email`, `document`, `avatar_url`, `channel`, `external_contact_id`, `notes`, `status`, `first_contact_at`, `updated_at`, `created_by`.
    *   Constraint Unique: `(tenant_id, normalized_phone)`.
    *   Índices: `name`, `normalized_phone`, `email`.
2.  **whatsapp_contact_groups**:
    *   Adicionar: `status`, `updated_at`, `created_by`.
    *   Constraint Unique: `(tenant_id, name)` (já existe).
3.  **whatsapp_contact_group_memberships**:
    *   Adicionar: `tenant_id`, `added_by`.
4.  **whatsapp_attendances**:
    *   Adicionar: `protocol`, `channel`, `department_id`, `assigned_user_id`, `subject`, `summary`, `started_at`, `first_response_at`, `finalized_at`, `finalized_by`, `finalization_reason`, `internal_notes`.
    *   Atualizar Status: `waiting`, `active`, `transferred`, `finalized`, `cancelled`.
5.  **attendance_events**: (Nova tabela)
    *   Registrar linha do tempo de cada atendimento.

### Lógica de Backend
- Função SQL para normalização de telefone.
- Upsert de contato no webhook do WhatsApp para evitar duplicidade.

## Fase 2: Gestão de Grupos e Integração Chat

### Objetivos
- Interface para CRUD de grupos no painel Admin.
- Gerenciamento de membros de grupos.
- Modal de grupos integrado à barra lateral do Chat.

### Componentes UI
- `SidebarGroups.tsx` (Atualização para persistência real).
- Novas rotas: `/admin/grupos`.

## Fase 3: Área de Contatos no Admin

### Objetivos
- Listagem global de contatos com filtros e busca.
- Detalhes do contato com abas (Visão Geral, Grupos, Histórico, Notas).

### Componentes UI
- `/admin/contatos/index.tsx`.
- `/admin/contatos/$id.tsx`.
- Aba de Histórico com visualização de mensagens antigas.

## Detalhes Técnicos

- **Framework**: TanStack Start v1.
- **Banco de Dados**: Supabase (Lovable Cloud).
- **Estilo**: Tailwind 4 (Tokens semânticos, Graphite Dark Mode).
- **Segurança**: RLS em todas as tabelas, funções SECURITY INVOKER com search_path.
- **I18n**: Support para PT-BR/EN.

## Próximos Passos
1. Executar migration da Fase 1.
2. Atualizar funções de servidor para usar os novos campos.
3. Implementar interface de Grupos.
