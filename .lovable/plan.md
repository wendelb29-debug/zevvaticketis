# Plano de Implementação: Fase 2 & 3 — Crescimento e Ecossistema

## Visão Geral
Este plano detalha a expansão do Zevva Tickets após a estabilização do MVP Comercial, focando em ferramentas de marketing, logística de caravanas e a criação de um ecossistema completo de eventos.

## Fase 2 — Crescimento

### 1. Marketing e Vendas
- **Cupons:** Sistema flexível de cupons (percentual, valor fixo, limite de uso, validade).
- **Afiliados:** Portal para promotores, rastreamento de vendas via link/cookie, gestão de comissões.
- **Automação:** Réguas de relacionamento via WhatsApp e E-mail integradas ao CRM.

### 2. Gestão e Logística
- **CRM Completo:** Segmentação de base, histórico de interações, lead scoring.
- **Caravanas:** Gestão de veículos (ônibus, vans), mapas de assentos, gestão de rotas e logística internacional.
- **Certificados:** Geração automática e validação de certificados de participação.

### 3. Financeiro Avançado
- **Repasses:** Automatização de pagamentos para produtores e afiliados.
- **Conciliação:** Ferramentas para conferência bancária e estornos em massa.

## Fase 3 — Ecossistema

### 1. Educação e Comunidade
- **Área de Membros:** Hospedagem de cursos, conteúdos exclusivos e materiais de apoio.
- **Networking:** App/Área para interação entre participantes de um mesmo evento.
- **Doações:** Módulo para arrecadação filantrópica vinculada a eventos.

### 2. Operações e Expansão
- **Loja:** E-commerce de produtos oficiais (camisetas, livros, etc.).
- **Palestrantes/Voluntários:** Portais específicos para gestão de escala e necessidades técnicas.
- **Multimoeda:** Suporte nativo a transações em USD, EUR e outras moedas.

### 3. Tecnologia
- **API Pública:** Documentação para integrações de terceiros.
- **Apps Móveis:** Aplicativos nativos para iOS e Android (White-label).

## Invariants
- Todos os novos módulos devem respeitar o isolamento multi-tenant.
- RLS deve ser aplicado em cada nova tabela.
- I18n deve cobrir todas as novas interfaces.
