# Zevva Tickets — Caravanas e Igrejas Internacionais (Inspirado no Sympla)

## Como usar

Cole **uma wave por vez**, nessa ordem. Espere a wave terminar de construir, teste na prática (preview do Lovable), e só então cole a próxima. Colar tudo de uma vez tende a confundir o agente e gerar retrabalho.

**Dois avisos importantes antes de começar:**
1. **Não use o botão nativo "Add Payments" do Lovable.** Ele só funciona com Lovable Cloud e não suporta multi-vendedor (Stripe Connect). O checkout é 100% custom, feito na Wave 3.
2. **Conecte uma conta Supabase própria desde o Wave 0** (não o Lovable Cloud padrão) — é isso que te dá controle de custo e evita o problema de escala que vimos antes.

---

## Wave 0 — Setup inicial

```
Quero criar o projeto Zevva Tickets, uma plataforma marketplace de eventos internacionais focada em caravanas e igrejas.

1. Conecte este projeto a um projeto Supabase externo (não use o Lovable Cloud padrão) — vou fornecer a URL e a chave do meu projeto Supabase.

2. Configure o design system com esta paleta de marca:
   - Fundo principal (dark navy quase preto): #05070F
   - Painel/card secundário: #0E1428
   - Dourado primário (destaque, ícones, CTAs): #D9A94D
   - Dourado claro (hover): #F0CB7A
   - Dourado suave (texto secundário): #C9B08A
   - Creme (fundo de seções claras): #EDE7DD
   - Texto principal sobre fundo escuro: #F5F3EE
   - Sucesso: #4FBF8B / Erro: #E2685A

3. Use a fonte "Manrope" (peso 800/700) para títulos e "Inter" para corpo de texto, ambas via Google Fonts.

4. Crie a estrutura de rotas base (ainda sem funcionalidade, só o esqueleto de navegação):
   - / (landing pública)
   - /eventos (catálogo)
   - /login e /cadastro
   - /app (área logada do participante)
   - /produtor (área logada do produtor)
   - /checkin (app de check-in da equipe)
   - /admin (painel do admin da plataforma)

Não implemente lógica de negócio ainda, só a base visual e de roteamento.
```

---

## Wave 1 — Autenticação e cadastro (participante + produtor)

```
Agora vamos implementar autenticação e cadastro. Contexto: esta é uma plataforma marketplace com 4 papéis — Admin da Plataforma, Produtor, Equipe (staff de um produtor) e Participante.

1. Configure Supabase Auth com email/senha e login social via Google.

2. Crie estas tabelas (com RLS habilitado em todas):

platform_admins
  id uuid, user_id uuid (fk auth.users), created_at

organizations
  id uuid, nome text, documento text, pais_id uuid, moeda_padrao_id uuid,
  status text (pendente | aprovado | bloqueado), plan_id uuid,
  taxa_percentual_custom numeric, stripe_account_id text, created_at

organization_members
  id uuid, organization_id uuid (fk organizations), user_id uuid (fk auth.users),
  role text (produtor_owner | equipe),
  permissions jsonb (array de strings: checkin, financeiro, marketing, suporte)

profiles
  id uuid (= auth.users.id), nome text, email text, telefone text,
  documento text, pais_id uuid, idioma_preferido text, created_at

3. Crie um trigger que popula "profiles" automaticamente quando um novo usuário se cadastra no Supabase Auth.

4. Fluxo de cadastro com 2 caminhos distintos, escolhidos numa tela inicial "Como você quer usar a Zevva?":
   - "Quero comprar ingressos" → cadastro simples (nome, email, senha) → vai direto pra /app
   - "Quero vender ingressos" → cadastro + formulário de organização (nome do negócio, documento, país) → cria uma linha em "organizations" com status = 'pendente' → mostra tela "Seu cadastro está em análise" até um admin aprovar

5. Regras de RLS:
   - platform_admins: só linhas onde user_id = auth.uid() são legíveis pelo próprio usuário; para outros dados globais, acesso só via Edge Function com service role.
   - organizations: visível/editável apenas por quem tem uma linha correspondente em organization_members.
   - profiles: cada usuário só lê/edita a própria linha.

6. Crie uma proteção de rota: se o usuário for produtor com organization status = 'pendente', ele só pode ver a tela de "aguardando aprovação", nada além disso.
```

---

## Wave 2 — Cadastro completo de eventos

```
Agora vamos implementar o cadastro de eventos, disponível apenas para produtores com organização aprovada.

1. Crie a tabela events:

events
  id uuid, organization_id uuid (fk organizations),
  nome text, subtitulo text, descricao text, imagem_url text, video_url text,
  categoria text, tipo text (presencial | online | hibrido),
  data_inicio timestamptz, data_fim timestamptz, encerramento_vendas timestamptz,
  local text, google_maps_url text, pais_id uuid, cidade text, idioma text, timezone text,
  moeda_id uuid, capacidade int, classificacao text,
  organizador_nome text, site text, instagram text, whatsapp text,
  politica_cancelamento text,
  falta_automatica_ativa boolean default false, falta_automatica_minutos int,
  status text (rascunho | publicado | encerrado | cancelado),
  created_at timestamptz default now()

2. RLS: só membros da organization dona do evento podem criar/editar. Leitura pública apenas para eventos com status = 'publicado'.

3. Construa um formulário multi-step (wizard) de criação de evento, dividido em:
   - Passo 1: Informações básicas (nome, subtítulo, descrição, categoria, tipo)
   - Passo 2: Local e data (presencial: endereço + mapa; online: link; híbrido: os dois)
   - Passo 3: Configurações regionais (país, cidade, idioma, timezone, moeda)
   - Passo 4: Mídia (upload de imagem de capa via Supabase Storage, vídeo opcional)
   - Passo 5: Política de cancelamento e redes sociais
   - Revisão final antes de publicar (status vira 'publicado' só quando o produtor confirma)

4. Crie a página de listagem "Meus Eventos" no painel do produtor, com filtro por status (rascunho/publicado/encerrado/cancelado) e busca por nome.

5. Crie a página pública /eventos (catálogo) que lista apenas eventos com status = 'publicado', com filtro por país, categoria e data. Cada card mostra imagem, nome, local, data e "a partir de" (esse preço vem da Wave 3, deixe um placeholder por enquanto).
```

---

## Wave 3 — Ingressos, pacotes de viagem e checkout multimoeda

```
Agora vamos implementar tipos de ingresso (incluindo pacotes de viagem internacional) e o checkout completo com Stripe Connect. Esta é a wave mais sensível do projeto — vá com calma e teste cada parte isoladamente.

1. Crie as tabelas:

ticket_types
  id uuid, event_id uuid (fk events), nome text, descricao text,
  quantidade int, quantidade_vendida int default 0, valor numeric, moeda_id uuid,
  data_inicial timestamptz, data_final timestamptz, taxa numeric,
  limite_por_cpf int, limite_por_compra int, cor text, ordem int,
  moeda_fixa_venda boolean default false,
  formas_pagamento_permitidas text[] (valores possíveis: cartao_internacional, pix_cotacao_dia)

trip_itinerary_days
  id uuid, ticket_type_id uuid (fk ticket_types), dia_numero int, titulo text, descricao text, data date

trip_hotels
  id uuid, ticket_type_id uuid (fk ticket_types), cidade text, nome_hotel text,
  categoria text, noites int, imagem_url text, descricao text

trip_cost_items
  id uuid, ticket_type_id uuid (fk ticket_types),
  tipo text (visto | almoco | gorjetas | transporte | seguro_viagem | outro),
  incluso boolean, valor_estimado numeric, moeda_id uuid, observacao text

orders
  id uuid, buyer_id uuid (fk auth.users), event_id uuid (fk events), organization_id uuid,
  status text (pendente | pago | reembolsado | cancelado),
  valor_bruto numeric, moeda_id uuid, taxa_plataforma numeric, valor_liquido_produtor numeric,
  stripe_payment_intent_id text, forma_pagamento text (pix | cartao | apple_pay | google_pay),
  created_at timestamptz default now()

2. No formulário de criação de evento (Wave 2), adicione a opção "Este ingresso é um pacote de viagem" ao criar um ticket_type. Quando marcado, libera 3 abas extras no formulário: Roteiro (dia a dia), Hospedagem (lista de hotéis) e Custos (itens inclusos/não inclusos). Quando NÃO marcado, é um ingresso simples normal.

3. Na página pública do evento, mostre os ticket_types disponíveis. Se for um pacote de viagem, exiba as abas Roteiro / Hospedagem / Custos / Valor antes do botão de compra.

4. Implemente Stripe Connect via Edge Functions (NÃO use o recurso nativo "Add Payments" do Lovable — ele não suporta split multi-vendedor):
   - Edge Function "criar-conta-stripe-connect": cria uma Stripe Connect Express account pra organização no momento da aprovação do produtor, salva o stripe_account_id.
   - Edge Function "criar-checkout": recebe ticket_type_id e quantidade, cria um Payment Intent no Stripe com application_fee_amount (a taxa da plataforma) e transfer_data.destination apontando pra conta do produtor.
   - Webhook "stripe-webhook": escuta payment_intent.succeeded, atualiza orders para status = 'pago', gera as linhas em "tickets" (isso será detalhado na Wave 4) e uma linha em ledger_entries.

5. Implemente o fluxo de Pix na cotação do dia:
   - Edge Function "gerar-cobranca-pix": recebe valor_usd, busca a cotação atual numa API de câmbio (ex: exchangerate.host ou similar), calcula valor_brl = valor_usd * cotacao, gera a cobrança Pix com expiração de 20 minutos.
   - Na tela de checkout, mostre claramente "Valor oficial: US$ X" e, se Pix for selecionado, "Equivalente em Pix hoje: R$ Y (válido por 20 min)" com um contador regressivo.

6. Tela de checkout: seletor de moeda (se o ticket_type não tiver moeda_fixa_venda), seleção de forma de pagamento (Cartão internacional / Pix / Apple Pay / Google Pay), resumo do pedido, botão de confirmação.

7. RLS: orders visível apenas pelo buyer_id (participante) ou pelos membros da organization dona do evento.
```

---

## Wave 4 — QR Code, check-in e falta automática

```
Agora vamos implementar a geração de ingressos com QR code, o app de check-in da equipe e a regra de falta automática.

1. Crie as tabelas:

tickets
  id uuid, order_id uuid (fk orders), ticket_type_id uuid (fk ticket_types), event_id uuid (fk events),
  owner_id uuid (fk auth.users), qr_code text (token assinado, único),
  status text (valido | presente | falta | cancelado | transferido),
  checked_in_at timestamptz, attendance_source text (qrcode | manual | auto_falta),
  created_at timestamptz default now()

checkin_logs
  id uuid, ticket_id uuid (fk tickets), operator_id uuid (fk auth.users),
  resultado text (sucesso | duplicado | invalido), scanned_at timestamptz default now()

2. No webhook do Stripe (Wave 3), ao confirmar pagamento, gere uma linha em "tickets" para cada unidade comprada. O qr_code deve ser um token assinado (HMAC ou JWT curto) gerado numa Edge Function com service role — nunca gerar isso no client.

3. Crie a página "Meus Ingressos" na área do participante (/app), listando os tickets do usuário logado com o QR code renderizado (use uma biblioteca de geração de QR no client, a partir do token assinado), nome do evento, tipo de ingresso e status. Inclua botão de download em PDF.

4. Crie o app de check-in (/checkin), acessível apenas por usuários com permissão "checkin" em organization_members:
   - Tela com acesso à câmera pra ler o QR code
   - Edge Function "validar-checkin": recebe o token do QR, faz um UPDATE atômico:
     UPDATE tickets SET status='presente', checked_in_at=now(), attendance_source='qrcode'
     WHERE qr_code = $1 AND status IN ('valido','falta')
     Se 0 linhas afetadas, retornar "já utilizado ou inválido". Sempre gravar uma linha em checkin_logs, sucesso ou não.
   - Feedback visual: tela verde (liberado), vermelha (já usado/inválido), amarela (ingresso de outro evento)

5. Adicione um campo "falta_automatica_minutos" e "falta_automatica_ativa" na tela de configurações do evento (produtor), se ainda não existir.

6. Configure um job agendado (pg_cron, rodando a cada 10 minutos) que executa:
   UPDATE tickets t SET status = 'falta'
   FROM events e
   WHERE t.event_id = e.id AND e.falta_automatica_ativa = true
     AND t.status = 'valido'
     AND now() >= e.data_inicio + (e.falta_automatica_minutos || ' minutes')::interval

7. RLS: tickets visível pelo owner_id (participante) ou por membros da organization com permissão de checkin/financeiro.
```

---

## Wave 5 — Painel financeiro básico

```
Agora vamos implementar o painel financeiro básico do produtor.

1. Crie a tabela:

ledger_entries
  id uuid, organization_id uuid (fk organizations), moeda_id uuid, order_id uuid (fk orders),
  tipo text (venda | taxa_plataforma | reembolso), valor numeric, created_at timestamptz default now()

2. No webhook do Stripe (Wave 3), ao confirmar um pagamento, gere duas linhas em ledger_entries: uma do tipo 'venda' (valor bruto) e uma do tipo 'taxa_plataforma' (valor retido pela plataforma).

3. Crie a página "Financeiro" no painel do produtor (/produtor/financeiro):
   - Extrato simples agrupado por evento e por moeda (soma de ledger_entries)
   - Cards de resumo: total vendido, total de taxas retidas, saldo líquido — separados por moeda (não some moedas diferentes)
   - Tabela detalhada com data, evento, tipo de movimentação e valor

4. Deixe claro na interface que não há saque ou conversão de moeda ainda disponível (isso é uma funcionalidade futura da Carteira Global) — apenas visualização.

5. RLS: ledger_entries visível apenas por membros da organization com permissão "financeiro".
```

---

## Wave 6 — Relatórios e dashboard do produtor

```
Agora vamos implementar relatórios e o dashboard principal do produtor.

1. Crie a página principal do painel do produtor (/produtor) com um dashboard mostrando, por evento selecionado:
   - Ingressos vendidos (total e hoje)
   - Receita (por moeda)
   - Check-ins realizados e taxa de comparecimento (% presente / total vendido)
   - Taxa de conversão do checkout (pedidos pagos / pedidos iniciados)
   - Gráfico de vendas ao longo do tempo (linha ou barras)

2. Crie a página "Relatórios" (/produtor/relatorios) por evento, com:
   - Tabela de participantes: nome, email, tipo de ingresso, status (válido/presente/falta/cancelado), data do check-in
   - Filtro por status
   - Botão de exportação em CSV e XLSX

3. Adicione um resumo por país/cidade dos compradores (baseado em profiles.pais_id), útil pra produtor entender de onde vem o público.

4. RLS: dados de relatório visíveis apenas por membros da organization com permissão "financeiro" ou "marketing".
```

---

## Wave 7 — Painel do Admin da Plataforma

```
Agora vamos implementar o painel do Admin da Plataforma — o nível acima dos produtores.

1. Crie as tabelas:

platform_settings
  id uuid, taxa_padrao_percentual numeric, moedas_ativas text[], paises_ativos text[]

plans
  id uuid, nome text, taxa_percentual numeric, limite_eventos int,
  limite_ingressos int, preco_mensal numeric

countries
  id uuid, nome text, codigo_iso text, ativo boolean

currencies
  id uuid, codigo text, simbolo text, ativo boolean

2. Crie o painel /admin, acessível apenas por usuários presentes na tabela platform_admins (verificação via Edge Function com service role, nunca só no client):
   - Fila de aprovação de produtores: lista organizations com status = 'pendente', com botão aprovar/rejeitar (ao aprovar, dispara a criação da conta Stripe Connect da Wave 3)
   - Gestão de produtores: listar todos, bloquear/desbloquear (muda status para 'bloqueado')
   - Gestão de planos: CRUD da tabela plans
   - Gestão de países e moedas: CRUD de countries e currencies, com toggle ativo/inativo
   - Dashboard global: total de produtores ativos, eventos publicados na plataforma, receita total processada (soma de ledger_entries tipo 'taxa_plataforma')

3. RLS: todas essas tabelas só são editáveis via Edge Function que verifica platform_admins — não exponha escrita direta via client mesmo com RLS, porque são dados sensíveis de configuração global.

4. Adicione um log de auditoria simples (tabela audit_logs: id, admin_id, acao, alvo_tipo, alvo_id, created_at) que registra toda aprovação, bloqueio ou mudança de taxa feita por um admin.
```

---

## Wave 8 (opcional) — Integrações Gmail, Google Drive, Agenda, Planilhas e Maps

**Antes de colar este prompt:** os conectores precisam ser habilitados manualmente primeiro. No painel de Conectores do Lovable (ícone de conectores → aba "Todos"), clique em **Conectar** em cada um destes 5: **Gmail**, **Google Drive**, **Google Agenda**, **Planilhas Google** e **Plataforma Google Maps** — cada um pede autorização OAuth separada com sua conta Google. Só depois de conectados o prompt abaixo funciona, porque ele instrui o Lovable a *usar* os conectores, não a habilitá-los.

```
Agora vamos integrar os conectores Google já conectados (Gmail, Google Drive, Google Agenda, Planilhas Google e Google Maps) às funcionalidades existentes da Zevva Tickets.

1. GMAIL — notificações transacionais por e-mail:
   - Edge Function "enviar-email-confirmacao": disparada pelo webhook do Stripe (Wave 3) quando um order muda pra status='pago'. Envia via Gmail um e-mail de confirmação de compra com nome do evento, tipo de ingresso e QR code em anexo/link.
   - Edge Function "enviar-lembrete-evento": rodando via pg_cron uma vez por dia, busca eventos com data_inicio no dia seguinte e envia lembrete por e-mail pra todos os compradores com tickets status='valido' daquele evento.
   - Envie também um e-mail de agradecimento pós-evento pros participantes com status='presente', 24h depois do data_fim do evento.
   - Todos os e-mails devem ser enviados a partir da conta Gmail conectada, com nome de remetente "Zevva Tickets".

2. GOOGLE AGENDA — sincronização de datas:
   - Na tela "Meus Ingressos" do participante, adicione um botão "Adicionar à Google Agenda" em cada ticket válido, que cria um evento no Google Agenda do usuário logado com nome do evento, local, data/hora de início e fim.
   - No painel do produtor, ao publicar um evento (status vira 'publicado'), crie automaticamente um evento correspondente na Google Agenda do produtor, como lembrete de gestão.

3. PLANILHAS GOOGLE — exportação viva de relatórios:
   - Na página de Relatórios (Wave 6), adicione a option "Exportar para Planilhas Google" além do CSV/XLSX existente — cria uma nova planilha com as mesmas colunas (nome, email, tipo de ingresso, status, data do check-in) e retorna o link de acesso.
   - Essa planilha deve ser gerada sob demanda (não fica sincronizando em tempo real), um snapshot no momento do clique.

4. GOOGLE MAPS — localização dos eventos e pacotes de viagem:
   - Na página pública de um evento presencial ou híbrido, use o campo google_maps_url (já existente na tabela events) pra renderizar um mapa embutido mostrando a localização exata.
   - Na aba "Hospedagem" de um pacote de viagem (trip_hotels, Wave 3), mostre a localização de cada hotel num mapa, se houver endereço cadastrado.
   - No formulário de cadastro de evento (Wave 2), adicione autocomplete de endereço usando a API do Google Maps ao preencher o campo "local", preenchendo automaticamente o google_maps_url.

5. GOOGLE DRIVE — backup de documentos:
   - Ao gerar um relatório em PDF ou planilha, salve automaticamente uma cópia numa pasta do Google Drive da conta conectada, organizada por evento (uma subpasta por evento, nomeada com o nome do evento).
   - Isso serve como backup e não deve exigir nenhuma ação manual do produtor.
```

---

## Depois da Wave 7

Nesse ponto o MVP dos 90 dias está funcionalmente completo. Antes de ir pra produção:
- Rodar o checklist de segurança (2FA, captcha no cadastro público, backup automático do Supabase)
- Configurar domínio próprio (.com) antes de tentar habilitar o modo "live" do Stripe
- Testar o fluxo ponta a ponta com cartão de teste do Stripe antes de qualquer transação real
