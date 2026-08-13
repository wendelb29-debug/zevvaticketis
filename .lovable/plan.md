# Plano de Correção e Integração do Chat Zevva

O sistema de chat atual possui "pontas soltas" que prejudicam a operação em um ambiente multi-tenant (SaaS) e a confiabilidade das mensagens. Este plano resolve as desconexões entre o frontend, backend e as regras de negócio do Zevva.

## Problemas Identificados
1. **Falta de Isolamento por Tenant**: As funções de busca de contatos e mensagens não filtram pelo `tenant_id` ativo, o que permitiria que um produtor visse conversas de outro.
2. **Dependência de Instância Única**: O envio de mensagens pega a primeira instância ativa que encontrar, sem validar se ela pertence à organização (tenant) correta.
3. **Status de Leitura Manual**: As mensagens recebidas via webhook não estão atualizando o status de "lida" automaticamente quando o chat está aberto.
4. **Desconexão com o Workflow de Atendimento**: O sistema de "Em Espera" vs "Em Atendimento" no frontend é puramente visual e não persiste no banco de dados.

## Ações Técnicas

### 1. Hardening do Backend (Server Functions)
- Atualizar `getWhatsAppContacts` para aceitar `tenantId` e filtrar a query.
- Atualizar `sendWhatsAppMessage` para buscar a instância de WhatsApp vinculada especificamente ao `tenantId` da requisição.
- Implementar `markMessagesAsRead` server function para limpar o contador de não lidas ao abrir o chat.

### 2. Sincronização de Estado de Atendimento
- Adicionar coluna `status` (atendimento/espera) na tabela `whatsapp_contacts` (via migração se necessário, ou usar metadados).
- Refatorar os filtros da lista de contatos para usar o estado real do banco.

### 3. Melhoria na UX de Realtime
- Ajustar o listener do Supabase Realtime para filtrar pelo `tenant_id` para evitar processamento desnecessário de mensagens de outras organizações.
- Implementar feedback visual de "Digitando..." (se suportado pela UAZAPI).

### 4. Integração com IA e CRM
- Conectar o "Assistente de IA" ao contexto do evento selecionado para respostas mais precisas sobre roteiros e valores.

## Detalhes Técnicos
- **Arquivo**: `src/lib/whatsapp/whatsapp.functions.ts`
- **Componente**: `src/routes/admin/chat.tsx`
- **Banco**: Tabelas `whatsapp_contacts`, `whatsapp_messages`, `whatsapp_instances`.
