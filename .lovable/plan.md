# Plan: Multi-Tenant SaaS Architecture Evolution

Transition Zevva Tickets into a professional multi-tenant platform where producers, organizations, and events operate in isolated workspaces.

## Technical Details

### 1. Database Schema Refactor (Migration)
- Rename `organizations` to `tenants`.
- Rename `organization_members` to `tenant_members`.
- Update roles enum to include: `OWNER`, `ADMIN`, `MANAGER`, `CHECKIN_SUPERVISOR`, `CHECKIN_OPERATOR`, `FINANCEIRO`, `MARKETING`.
- Ensure all business tables (`events`, `tickets`, `campaigns`, `ads`, `checkin_records`, `email_logs`, `email_templates`) have a `tenant_id` column.
- Implement RLS policies that enforce `tenant_id` isolation: `USING (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()))`.
- Update `handle_new_user` trigger to support workspace context if applicable.

### 2. Tenant Context & Routing
- Create a `TenantContext` to store the active `tenant_id` in session/local storage or as a route parameter.
- Implement a `/workspaces` route for selecting which environment to enter.
- Update `src/routes/produtor.tsx` to require a selected tenant.

### 3. UI Implementation
- **Workspace Selector**: A high-density card grid ("Seus ambientes") showing available tenants with their logos and the user's role.
- **Tenant-Aware Sidebars**: 
    - Producer sidebar will now reflect the active tenant's settings.
    - Admin sidebar (Global) will allow switching between tenants to view specific data.
- **Role-Based Feature Gating**: Component-level checks to hide/disable features (e.g., `CHECKIN_OPERATOR` shouldn't see "Financeiro").

### 4. Code Refactor
- Update `supabase/client.ts` helpers if needed.
- Refactor existing routes (`/produtor/*`, `/checkin/*`) to use the new tenant filtering logic.
- Ensure `events` creation automatically assigns the active `tenant_id`.

## User Interface

- **Route `/workspaces`**: The "Seus ambientes" entrance.
- **Header**: Active tenant name and logo displayed next to the user menu.
- **Dashboard**: Real-time sales and operational metrics scoped to the active tenant.
