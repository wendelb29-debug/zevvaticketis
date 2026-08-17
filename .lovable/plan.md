# Redesign Visual do Master Console Zevva

Este plano detalha o redesenho visual completo e cuidadoso do Master Console, transformando-o em uma interface SaaS premium, profissional e operacional (estilo Stripe/Linear), sem alterar as funcionalidades, rotas ou regras de negócio existentes.

## Padrões Visuais e Identidade
- **Tipografia**: Manrope (títulos) e Inter (corpo). Títulos de página 28-32px, bold.
- **Cores**: Fundo neutro claro (#F6F7F8), superfícies brancas, texto grafite, vermelho Zevva (#D94B52) apenas em detalhes (item ativo, links, ações).
- **Espaçamento**: Escala 4, 8, 12, 16, 24, 32px.
- **Bordas/Sombras**: Botões 8-10px, cards 12-16px. Sombras mínimas, priorizando bordas suaves.

## Componentes de Interface (Design System)
- Criar/Consolidar componentes em `src/components/admin/master/`:
  - `MasterPageHeader.tsx`: Cabeçalho padrão com título, descrição e ações.
  - `MasterMetricCard.tsx`: Cards de indicadores compactos com tendência e ícones discretos.
  - `MasterDataTable.tsx`: Tabela operacional com cabeçalho fixo, hover discreto e badges compactos.
  - `MasterStatusBadge.tsx`: Badges de status com ponto colorido e texto.
  - `MasterEmptyState.tsx` & `MasterTableSkeleton.tsx`: Estados de carregamento e vazio refinados.

## Rotas e Telas
- **Master Console (`/admin/master`)**: Grid 4 colunas de métricas, filtros em Drawer (mobile)/Sheet (desktop), busca debounced.
- **Gerenciamento de Projeto (`/admin/tenants/$id`)**: Cabeçalho com logo e metadados, organização de abas por grupos (Gestão, Operação, Plataforma), audit feed refinado.
- **Configurações Globais**: Layout de navegação lateral para as 12 seções, formulários com labels superiores e justificativa obrigatória.

## Etapas de Implementação
1. **Fase 1: Infraestrutura Visual**: Ajuste de tokens globais em `src/styles.css` e criação dos componentes base.
2. **Fase 2: Redesign da Home do Master**: Implementação do novo header, métricas e tabela de tenants.
3. **Fase 3: Redesign do Detalhe do Tenant**: Ajuste do header do projeto, abas e visão geral.
4. **Fase 4: Configurações Globais**: Ajuste do layout de abas e formulários.
5. **Fase 5: Dark Mode e Responsividade**: Auditoria fina de contraste e comportamento em dispositivos móveis.

## Detalhes Técnicos
- **Sem Quebras**: Nenhuma alteração em RPCs, Supabase, RLS ou queries do React Query.
- **Audit Requirement**: Preservar a necessidade de justificativa para alterações críticas.
- **Framer Motion**: Transições suaves (120-200ms) para interações.
- **Tailwind 4**: Uso estrito de tokens semânticos (`bg-background`, `border-border`, etc).
