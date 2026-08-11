# Plano de Implementação: Inteligência de Dados Zevva BI

Transformar o dashboard administrativo e de produtores em uma central de inteligência funcional, com filtros dinâmicos, dados reais e exportação profissional.

## Alterações de Banco de Dados

### Tabelas Utilizadas (Existentes e Revisitadas)
- `events`: Filtros por título, categoria e localização (cidade).
- `orders`: Base para faturamento, quantidade de vendas e funil.
- `tickets`: Detalhamento de ingressos vendidos vs. disponíveis.
- `checkin_logs`: Cruzamento de presença real.
- `profiles`: Contagem de usuários e novos cadastros.
- `campaigns` & `ads`: Métricas de marketing (atribuição via metadados nos tickets/pedidos).

## Componentes Frontend

### `AdminDashboardBI.tsx` (Núcleo)
- **Estado Global de Filtros**: Implementar `filterState` (data inicial/final, evento, produtor, categoria, canal, status).
- **Filtro de Período**: Conectar botões "7d", "30d" e o "Personalizado" (usando `Popover` + `Calendar`).
- **Painel Lateral de Filtros Avançados**: Criar `Sheet` lateral com todos os seletores solicitados (Evento, Produtor, Categoria, Localização, etc.).
- **Integração Real**: Substituir mocks por queries Supabase com filtros `.eq()`, `.gte()`, `.lte()` baseados no estado.
- **Feedback Visual**: Implementar "Filtros Ativos" (tags) e botão "Limpar Filtros".

### Relatórios e Exportação (`src/lib/export/index.ts`)
- **PDF Profissional**: Atualizar `exportToPDF` para incluir cabeçalho Zevva, resumo executivo, tabelas filtradas e layout A4.
- **Excel Multi-Aba**: Atualizar `exportToExcel` para gerar XLSX com abas: Resumo, Eventos, Vendas, Usuários, Campanhas, Check-ins.

## Lógica de Negócio e BI
- **Atribuição de Marketing**: Implementar cálculo de ROI cruzando `investment` (se disponível) com `revenue` gerado por tickets marcados com `campaign_id`.
- **Métricas de Check-in**: Cruzar `tickets` (vendidos) com `checkin_logs` para gerar taxa de presença e no-show por segmento.

## Testes de Validação
- Seleção de período (7 dias) atualizando métricas de faturamento.
- Filtro por evento único isolando dados no funil e nos cards.
- Exportação de PDF validando se os dados no arquivo correspondem aos filtros aplicados na tela.
- Resiliência: Loading states durante as queries e tratamento de erros de conexão.

## Aspectos Técnicos
- Uso de `date-fns` para manipulação de períodos.
- Queries otimizadas no Supabase para evitar overfetching.
- Cache local para filtros aplicados.
