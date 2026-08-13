# Plano de Implementação — Módulo CRM Zevva

Este plano detalha a execução das fases de modernização da base de contatos, gerenciamento de grupos e histórico de atendimentos, garantindo isolamento multi-tenant e integridade dos dados.

## Fases Concluídas

### Fase 1: Base de Dados e Normalização
- Auditoria da estrutura existente e normalização das tabelas de WhatsApp.
- Implementação da função `normalize_phone` para garantir unicidade de contatos.
- Expansão da tabela `whatsapp_contacts` com campos de CRM (email, documento, status, notas).
- Criação da tabela `attendance_events` para auditoria operacional.
- Configuração de políticas RLS rigorosas para isolamento total entre tenants.
- Atualização do webhook `uazapi-webhook.ts` para realizar o upsert automático de contatos e gerenciar ciclos de atendimento.

### Fase 2: Gerenciamento de Grupos
- Implementação de CRUD de grupos com suporte a cores e metadados.
- Criação da tabela de relacionamento `whatsapp_contact_group_memberships`.
- Integração do modal de grupos no Chat para atribuição em tempo real.

### Fase 3: Área Administrativa de Contatos
- Criação da rota `/admin/contatos` com listagem, busca e indicadores.
- Criação da rota de detalhes `/admin/contatos/$id` com abas de Visão Geral, Histórico e Observações.
- Atualização da navegação lateral (Sidebar) para incluir o novo módulo de Contatos.

## Próximas Fases

### Fase 4: Histórico e Finalização
- [ ] Implementar visualização em modo somente leitura de mensagens antigas no histórico.
- [ ] Adicionar funcionalidade de "Imprimir Atendimento" e "Copiar Histórico".
- [ ] Criar dashboard de métricas de produtividade por atendente (SLA, Tempo Médio de Resposta).

### Fase 5: Validação e Refinamento
- [ ] Testes de carga na ingestão de mensagens com milhares de contatos.
- [ ] Refinamento da interface mobile para as telas de listagem.
- [ ] Implementação de ação administrativa para "Mesclar Contatos" duplicados.

## Detalhes Técnicos
- **Deduplicação:** Realizada via `normalized_phone` no nível de banco de dados (`ON CONFLICT (tenant_id, normalized_phone) DO UPDATE`).
- **Ciclo de Atendimento:** O status `finalized` agora é o padrão para tickets concluídos, preservando o histórico completo.
- **Segurança:** Todas as consultas utilizam `tenant_id` filtrado por RLS, impedindo vazamento de dados entre projetos.
