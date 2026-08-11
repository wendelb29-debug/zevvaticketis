# Plano de Implementação: Navegação SaaS Multi-Projeto (Estilo EZ Chat)

Transformar o Zevva em uma plataforma multi-produtor profissional, implementando uma camada de seleção de projetos post-login para total isolamento de ambientes.

## Alterações de Dados e Segurança

- **Entidade PROJETOS**: Utilizaremos a tabela `tenants` existente, expandindo a semântica para "Projetos".
- **Entidade PROJECT_USERS**: Utilizaremos a tabela `tenant_members` para gerenciar permissões (`OWNER`, `ADMIN`, `MANAGER`, etc.).
- **Isolamento de Dados**: Reforço das políticas de RLS para garantir que `events`, `tickets`, `orders` e `campaigns` sejam filtrados estritamente pelo `tenant_id` ativo.

## Interface e Fluxo (UX)

- **Nova Rota `/app` (Meus Projetos)**: 
  - Primeira tela após o login.
  - Exibição de cards com logo, nome e papel do usuário no projeto.
  - Botão "Novo Projeto" para produtores criarem novos ambientes.
- **Seletor de Projetos no Header**: 
  - Adição de um menu dropdown no painel do produtor para troca rápida de contexto.
  - Exibição do "Projeto Ativo" com logo e nome.
- **Sidebar Dinâmica**: 
  - Menus e funcionalidades habilitadas/desabilitadas com base nas permissões do usuário no projeto selecionado.

## Implementação Técnica

1.  **Refatoração do `use-tenants.tsx`**: Para gerenciar o estado global do projeto ativo com persistência.
2.  **Migração Semântica**: Atualização de textos e ícones para refletir a terminologia de "Projetos/Produtores".
3.  **Proteção de Rotas**: Garantir que o acesso a `/produtor/*` exija um `activeProject` selecionado.
4.  **Admin Master**: Página `/admin/master` com visão holística de todos os projetos para administradores Zevva.

## Plano de Testes

- **Teste 1**: Login de usuário com múltiplos projetos -> Verificar redirecionamento para `/app` e listagem correta.
- **Teste 2**: Seleção de Projeto A -> Verificar se apenas eventos do Projeto A aparecem.
- **Teste 3**: Troca para Projeto B via Header -> Verificar atualização instantânea do dashboard.
- **Teste 4**: Usuário sem projetos -> Verificar exibição de tela de boas-vindas e incentivo à criação do primeiro projeto.
