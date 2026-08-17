# Plan for Official Zevva Authentication Email Templates

Implement the official authentication email templates for Zevva, ensuring consistency with the brand identity (Gold/White, Coral accents) and high compatibility across email clients.

## Proposed Changes

### 1. Unified Email Layout System
- Create `src/lib/email-templates/Layout.tsx` as a reusable component for all authentication emails.
- Implement HTML table-based layout for maximum compatibility.
- Use the official Zevva logo (using absolute URL).
- Apply the requested visual identity:
  - External background: `#F5F5F7`
  - Main card: `#FFFFFF`
  - Primary text: `#171717`
  - Secondary text: `#666666`
  - Zevva Red/Coral for accents and buttons.
  - 12px border radius.
  - Arial/Helvetica fallback fonts.
- Include standard footer with support and privacy links.

### 2. Individual Template Implementation
- Refactor existing templates in `src/lib/email-templates/`:
  - `signup.tsx` -> **Confirmação de Inscrição**
  - `recovery.tsx` -> **Redefinição de Senha**
  - `invite.tsx` -> **Convite**
  - `magic-link.tsx` -> **Link Mágico**
  - `email-change.tsx` -> **Alteração de E-mail**
  - `reauthentication.tsx` -> **Reautenticação**
- Implement specific content, subjects, and subjects as requested.
- Ensure all variables (`{{ .ConfirmationURL }}`, `{{ .Token }}`, etc.) are correctly placed.

### 3. Supabase Integration Audit & Export
- Verify `src/routes/auth/callback.tsx` handle redirects correctly.
- Create `supabase/templates/auth/` containing raw HTML versions of the templates for manual pasting into the Supabase dashboard.
- Create a `README.md` in that folder with installation instructions.

### 4. Admin Preview UI
- Update `src/routes/admin/configuracoes.tsx` or create a new route `src/routes/admin/emails/templates.tsx` to provide a preview interface.
- Allow toggling between desktop and mobile views.
- Display subject lines and allow copying HTML.

## Technical Details

### Identity Tokens
- **Logo URL:** `https://zevvaticketis.lovable.app/__l5e/assets-v1/43accad5-eee9-40c2-9d9d-cc58014040d3/logo-zevva.png`
- **Main Accent Color:** Coral (Zevva Red #D94B52)
- **Primary Font:** Arial, Helvetica, sans-serif

### Variable Mapping (Supabase Auth)
- `confirm-signup`: `{{ .ConfirmationURL }}`
- `recovery`: `{{ .ConfirmationURL }}`
- `invite`: `{{ .ConfirmationURL }}`
- `magic-link`: `{{ .ConfirmationURL }}`
- `email-change`: `{{ .ConfirmationURL }}`, `{{ .NewEmail }}`
- `reauthentication`: `{{ .Token }}`

### Compatibility Strategy
- CSS inline styles via `@react-email/components`.
- No Tailwind classes in the final HTML.
- 600px max width.
- Hidden preheaders for better inbox previews.
