# Plano de Implementação: Zevva Master Console

Este plano descreve a transformação do Master Console atual em uma central operacional real para gestão global da plataforma Zevva, integrando segurança robusta, dados reais e gestão granular de tenants.

## 1. Segurança e Acesso Global

Implementação de uma camada de proteção rigorosa para garantir que apenas administradores da plataforma acessem recursos globais.

- **RBAC Global**: Criação de permissões canônicas (ex: `master.view`, `master.manage_projects`, `master.view_financial`).
- **Middleware de Rota**: Reforço do `beforeLoad` em `/admin/master` e novas rotas administrativas.
- **Proteção de Dados**: Garantir que RPCs e queries filtrem dados sensíveis (PII e segredos) conforme a permissão do admin.

## 2. Dashboard BI Real (Master Console)

Substituição de mocks por indicadores dinâmicos calculados via banco de dados.

- **KPIs Dinâmicos**: Projetos ativos, total de usuários, eventos publicados e receita real (taxas Zevva vs GMV).
- **Filtros Avançados**: Implementação de busca por nome/slug/email e filtros de status/plano com persistência na URL.
- **Paginação Server-side**: Transição de lista fixa para paginação real (20/50/100 itens).

## 3. Gestão de Projetos (Tenants)

Criação da rota detalhada `/admin/tenants/$id` com abas operacionais.

- **Visão Geral**: Saúde do projeto, alertas de limites e métricas de uso.
- **Identidade e Domínio**: Gestão de marca branca, domínios personalizados e configurações regionais.
- **Planos e Limites**: Interface para upgrade/downgrade de planos e ajuste manual de limites com auditoria.
- **Controle de Equipe**: Gestão de membros do tenant, revisão de permissões e revogação de sessões.
- **Operações**: Atalhos para gestão de eventos, ingressos e financeiro específicos do tenant.

## 4. Auditoria e Suspensão

- **Logs Imutáveis**: Registro de todas as ações administrativas na tabela `audit_logs` (ou similar).
- **Fluxo de Suspensão**: Implementação de suspensão controlada (bloqueio de novas vendas/eventos mantendo acesso a ingressos emitidos).
- **Modo Suporte**: Acesso controlado a tenants para resolução de chamados com banner de identificação e log reforçado.

## Detalhes Técnicos

- **Arquitetura**: Uso intensivo de `createServerFn` para operações críticas e RPCs para cálculos agregados no Postgres.
- **Internacionalização**: Sincronização de todos os termos novos com o sistema i18n da Zevva.
- **Interface**: Utilização de componentes Shadcn UI (Sheet, Popover, Dialog) para filtros e ações críticas, mantendo o tema Graphite/Coral.
- **Banco de Dados**: Utilização das tabelas existentes (`tenants`, `profiles`, `events`, `orders`, `audit_logs`) sem criar estruturas duplicadas.

---
**Nota**: Não haverá redesenho completo; a estrutura visual atual será refinada para suportar a nova densidade de dados e ações.
