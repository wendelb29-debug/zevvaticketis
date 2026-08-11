# Plano de Evolução: Chat Omnichannel Zevva

Transformação do módulo de chat em uma ferramenta operacional completa com IA, cards de venda dinâmicos e refinamento visual premium.

## Ações Planejadas

### 1. Refinamento Visual (Dark Mode Premium)
- **Ação:** Ajustar os tokens de cor do `AdminChatPage` para o tema escuro.
- **Detalhes:** 
    - Fundo da conversa: `#0b141a` (Darker Navy).
    - Sidebar: `#111b21` (Slate Navy).
    - Balões de saída (Agente): `#005c4b` (WhatsApp Green).
    - Balões de entrada (Cliente): `#202c33`.
- **Arquivo:** `src/routes/admin/chat.tsx`.

### 2. Motor de IA (Sugestão de Respostas)
- **Ação:** Criar função de servidor para gerar sugestões de resposta via Lovable AI.
- **Detalhes:** O sistema analisará as últimas 5 mensagens e sugerirá 3 opções de resposta baseadas no contexto de "Caravanas e Ingressos".
- **Arquivos:** `src/lib/chat.functions.ts` e integração no `src/routes/admin/chat.tsx`.

### 3. Cards de Venda Dinâmicos
- **Ação:** Implementar componente de seleção de ingressos para envio no chat.
- **Detalhes:** O agente poderá abrir um modal, buscar um ingresso da tabela `ticket_types` e gerar um card interativo com botão de checkout.
- **Arquivo:** `src/components/admin/chat/SalesCardPicker.tsx`.

### 4. Gestão de Mídia e Upload
- **Ação:** Conectar os inputs de arquivo ao Supabase Storage.
- **Detalhes:** Implementar o fluxo de upload e exibição de previews para imagens e PDFs.
- **Arquivo:** `src/routes/admin/chat.tsx`.

### 5. Auditoria e Histórico
- **Ação:** Conectar a interface de histórico aos `access_logs`.
- **Detalhes:** Mostrar quem visualizou ou editou a conversa e quando.

## Detalhes Técnicos
- Uso de `supabase.storage` para arquivos.
- Integração com `ai_gateway` para sugestões.
- Manutenção da responsividade e tokens Tailwind CSS v4.
