# Plano de Implementação: Gestão Individual de Projetos no Master Console

Ajustar a navegação e a interface do Master Console para permitir que administradores da plataforma gerenciem projetos individuais diretamente, integrando a visão do produtor com as ferramentas de controle global.

## Alterações Propostas

### 1. Navegação Unificada
- Modificar o botão "Gerenciar" no Master Console (`/admin/master`) para direcionar o administrador a uma nova rota que combine a visão do produtor com controles de administrador.
- Atualizar a barra lateral (`src/routes/admin.tsx`) para incluir um acesso rápido ao Workspace do projeto sendo gerenciado.

### 2. Interface de Gestão Individual (`/admin/tenants/$id`)
- Expandir a página atual de detalhes do tenant para incluir abas funcionais:
    - **Dashboard Operacional**: Espelhamento do dashboard que o produtor vê.
    - **Financeiro**: Detalhamento de vendas e taxas retidas.
    - **Equipe**: Gestão de membros e convites do tenant.
    - **Eventos & Ingressos**: Lista e status de eventos do projeto.
    - **Configurações do Tenant**: Acesso às configurações que o produtor possui, permitindo ajustes administrativos.

### 3. Segurança e RPCs
- Refinar a RPC `get_master_tenant_details` para garantir que retorne todos os metadados necessários para as novas abas (contagem de membros, histórico financeiro resumido, etc.).
- Garantir isolamento total entre projetos durante a gestão, respeitando as permissões de `platform_admin`.

### 4. Componentes de UI
- Implementar `AdminProjectStats` para exibir métricas rápidas no topo da página de gestão individual.
- Adicionar atalhos para "Visualizar como Produtor" (login as tenant).

## Detalhes Técnicos
- **Rotas**: `/admin/tenants/$id` será o hub central.
- **Hooks**: Atualizar `useTenantAdminDetails` e `useTenantAdminStats` para suportar o carregamento granular de cada aba.
- **RPCs**: `public.get_master_tenant_details` será otimizada para evitar múltiplas chamadas.
- **UI**: Uso de tokens Tailwind 4 (`navy`, `coral`, `brand-dark`) para manter a consistência com a nova identidade visual.
