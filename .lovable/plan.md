# Plano de Implementação: Módulo de Anúncios Zevva (Ads)

Este plano descreve a implementação do sistema completo de publicidade patrocinada da Zevva, abrangendo desde a infraestrutura de banco de dados até o componente flutuante na Home, com métricas reais e isolamento multi-tenant.

## 1. Banco de Dados e Segurança (Backend)
- Criar tabelas para Anunciantes, Campanhas, Criativos e Eventos de Métricas.
- Implementar RLS (Row Level Security) com base no `organization_id` para garantir que produtores vejam apenas seus próprios anúncios.
- Criar funções SQL para processar métricas de forma atômica (evitar duplicidade de cliques/impressões).
- Adicionar permissões granulares (`ads.view`, `ads.create`, `ads.approve`, etc.) no sistema de RBAC da Zevva.

## 2. Painel Administrativo (Gerenciamento)
- **Marketing > Anúncios**: Nova área administrativa organizada em abas.
- **Visão Geral**: Dashboard com métricas reais (Impressões, Cliques, CTR, Receita).
- **CRUDs**: Gestão de Anunciantes e Campanhas com suporte a orçamentos e limites.
- **Wizard de Campanha**: Fluxo para upload de criativos (desktop/mobile) e configuração de segmentação.
- **Fluxo de Aprovação**: Interface para administradores revisarem e ativarem campanhas.

## 3. Experiência do Usuário (Frontend)
- **Componente `FloatingSponsoredAd`**: Card flutuante na Home com suporte a:
  - **Identificação**: Rótulo visível "Patrocinado".
  - **Interação**: Minimizar, Fechar e Swipe-to-dismiss (arrastar para o lado).
  - **Persistência**: Lembrar se o usuário fechou o anúncio para não exibir novamente na mesma sessão/semana.
  - **Responsividade**: Layouts otimizados para Desktop e Mobile.

## 4. Motor de Métricas e Performance
- **Impressão Válida**: Uso de `IntersectionObserver` para contar apenas quando o anúncio está 50% visível por > 1s.
- **Performance**: Carregamento assíncrono para não travar a Home.
- **Segurança**: Validação de URLs e higienização de CTAs para evitar scripts maliciosos.

## Detalhes Técnicos
- **Tabelas**: `advertisers`, `ad_campaigns`, `ad_creatives`, `ad_metrics`.
- **Tecnologias**: Framer Motion (para animações de swipe), Tailwind 4 (tokens de contraste), TanStack Table (listagens).
- **Algoritmo de Seleção**: Rotação baseada em prioridade e frequência (Cap).
