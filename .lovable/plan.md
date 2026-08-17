# Plan: Ticket Management and Multi-Tenant Isolation Hardening

Implement a unified ticket management system for both Producers and Platform Admins, ensuring strict multi-tenant isolation and granular RBAC permissions.

## User Review Required

> [!IMPORTANT]
> This update involves changes to data access rules (RLS). Producers will only see tickets within their assigned organizations. Platform Admins will have a global view for auditing purposes.

- No manual database setup required; all changes are handled via migrations.

## Proposed Changes

### 🎟️ Ticket Management UI
- **Producer View**: New "Gestão de ingressos" item in the sidebar, scoped to their organization.
- **Admin View**: New "Gestão global de ingressos" for platform administrators.
- **Unified Dashboard**: Reusable `TicketManagementDashboard` component with scope-aware filtering.
- **Enhanced List**: `IssuedTicketsList` updated to show event/tenant details when viewed by admins.

### 🔐 Security and RBAC
- **Hardened RLS**: Updated `tickets` policies to prevent cross-tenant data leaks.
- **Audit Logs**: New `ticket_audit_logs` table to track sensitive operations (cancellations, manual check-ins).
- **RPC Hardening**: Secured `process_ticket_checkin` to prevent unauthorized execution.
- **Permission Matrix**: Integrated `INGRESSOS` and `platform_tickets.*` permissions.

### 🌐 Internationalization (i18n)
- Added translations for all new labels and descriptions in Portuguese, English, and Spanish.

## Technical Details

### 1. Database Migrations
- Update `tickets` RLS policies.
- Create `ticket_audit_logs` table with appropriate grants and policies.
- Hardening `process_ticket_checkin` function (SECURITY DEFINER cleanup).

### 2. Frontend Components
- `src/components/tickets/TicketManagementDashboard.tsx`: Unified dashboard entry point.
- `src/components/admin/eventos/IssuedTicketsList.tsx`: Scope-aware ticket table.
- `src/routes/produtor/gestao-ingressos.tsx`: Producer-specific route.
- `src/routes/admin/ingressos.tsx`: Admin-specific route.

### 3. Sidebar and i18n
- Modify `src/routes/produtor.tsx` and `src/routes/admin.tsx` to include new menu items.
- Update `src/lib/translations.ts` and `src/lib/i18n/types.ts`.
