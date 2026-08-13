---
name: Security Hardening - Fases 1 e 2
description: Corrige papéis multi-tenant e restaura tokens do design system conforme solicitado pelo arquiteto sênior.
type: feature
---

# Plano de Correção Fases 1 e 2

## Fase 1: Corrigir Papéis Multi-Tenant
1. **Atualizar `src/lib/security.ts`**:
   - Importar `Database` de `@/integrations/supabase/types`.
   - Redefinir `TenantRole` como `Database["public"]["Enums"]["tenant_role"]`.
   - Atualizar a lógica de `validateUserTenantAccess` para usar os valores reais do banco (Maiúsculas).
   - Implementar validação explícita por ação (criar evento, convidar equipe, etc.).
2. **Criar Testes de Isolamento**:
   - Desenvolver `src/lib/security.test.ts` cobrindo todos os cenários solicitados (OWNER cria evento, MARKETING não acessa financeiro, isolamento de tenant, etc.).
3. **Ajustar Consumidores**:
   - Atualizar `sendTeamInvite` e `createEventFull` em `src/lib/` para usar os novos papéis e validações.

## Fase 2: Restaurar Design System
1. **Atualizar `src/styles.css`**:
   - Reintroduzir as variáveis CSS semânticas do Shadcn (`--background`, `--foreground`, `--primary`, etc.).
   - Mapear essas variáveis para a paleta de cores aprovada (#F6F7F8, #D94B52, etc.).
   - Adicionar os tokens do chat WhatsApp (`--wa-*`).
   - Garantir que todas as classes base (`@layer base`) estejam configuradas para suportar os componentes Shadcn.
2. **Verificação Visual**:
   - Usar Playwright para capturar screenshots dos componentes críticos (Dialog, Dropdown, Table, Chat) e garantir que o visual da home permanece idêntico.

## Critérios de Aceite
- Build passando (`npm run build`).
- Testes de segurança passando (`vitest src/lib/security.test.ts`).
- Visual da home preservado.
- Componentes Shadcn com cores e contrastes corretos.
