# Templates de E-mail de Autenticação Zevva

Este diretório contém os templates HTML oficiais para o sistema de autenticação da Zevva (Supabase Auth).

## Como Instalar

1. Acesse o painel do seu projeto Supabase.
2. Vá em **Authentication** > **Email Templates**.
3. Para cada template abaixo, copie o conteúdo do arquivo HTML correspondente e cole no campo "Message Body".
4. Copie também o assunto sugerido para o campo "Subject".

## Templates

### 1. Confirmação de Cadastro (Signup)
- **Arquivo:** `confirm-signup.html`
- **Assunto:** `Confirme seu e-mail para acessar a Zevva`
- **Variáveis:** `{{ .ConfirmationURL }}`

### 2. Redefinição de Senha (Recovery)
- **Arquivo:** `recovery.html`
- **Assunto:** `Redefina sua senha da Zevva`
- **Variáveis:** `{{ .ConfirmationURL }}`

### 3. Convite de Usuário (Invite)
- **Arquivo:** `invite.html`
- **Assunto:** `Você recebeu um convite para acessar a Zevva`
- **Variáveis:** `{{ .ConfirmationURL }}`

### 4. Link Mágico (Magic Link)
- **Arquivo:** `magic-link.html`
- **Assunto:** `Seu acesso seguro à Zevva`
- **Variáveis:** `{{ .ConfirmationURL }}`

### 5. Alteração de E-mail (Email Change)
- **Arquivo:** `email-change.html`
- **Assunto:** `Confirme a alteração do seu e-mail na Zevva`
- **Variáveis:** `{{ .ConfirmationURL }}`, `{{ .NewEmail }}`

### 6. Reautenticação (OTP/Token)
- **Arquivo:** `reauthentication.html`
- **Assunto:** `Código de segurança da Zevva`
- **Variáveis:** `{{ .Token }}`

## Observações Importantes

- Os links de redirecionamento (`Redirect URLs`) devem estar configurados corretamente no Supabase.
- A Zevva utiliza o callback oficial em `/auth/callback`.
- A identidade visual utiliza o logotipo hospedado em HTTPS.
