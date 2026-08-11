# Plan: Zevva Workspaces (Multi-Tenant SaaS Architecture)

Implement a professional SaaS multi-tenant architecture where organizations (tenants) have independent "workspaces".

## User Experience
- **Workspace Selector**: After login, users land at `/app` to choose which workspace to enter.
- **Role-Based Access**: Access is gated by roles within the workspace (OWNER, ADMIN, MANAGER, etc.).
- **Data Isolation**: All operations (events, tickets, sales) are automatically scoped to the active workspace.
- **Admin Master Console**: A global view for platform administrators to manage all tenants.

## Proposed Changes

### Database Evolution
- **Schema Renaming**: Finalize standardizing all tables to use `tenant_id` (migrated from `organization_id`).
- **Roles Expansion**: Expand `tenant_role` enum to include requested roles (OWNER, ADMIN, MANAGER, MARKETING, FINANCEIRO, CHECKIN_SUPERVISOR, CHECKIN_OPERATOR).
- **Table Relationships**: Ensure `events`, `tickets`, `orders`, `campaigns`, `ads`, `checkin_records`, and `email_logs` are all correctly linked to `tenants`.
- **Row Level Security (RLS)**: Refine policies to strictly isolate data based on user membership and role.

### Application Logic
- **Tenant Context (`useTenants`)**: Enhance the existing provider to persist `activeTenant` across sessions and provide role-based helpers.
- **Routing & Guards**: 
    - Update `/produtor` layout to enforce active tenant selection.
    - Implement `/checkin` redirection: if a user is an `OPERATOR` for a specific workspace, they go directly to that workspace's scanner.
- **Global Search & Filter**: Update all database queries in producer and check-in views to filter by `activeTenant.id`.

### User Interface
- **Sidebar (Producer)**: 
    - Display current Workspace branding (Logo + Name).
    - Dynamically hide menu items based on the user's role in that workspace.
- **Workspace Selection Page (`/app`)**: Redesign with a premium SaaS look, showing role and branding for each accessible workspace.
- **Master Admin Dashboard**: Create `/admin/master` for global metrics across all workspaces.

### Deliverables
1. **Migration Script**: Updates to roles and schema.
2. **Enhanced `useTenants` Hook**: Persistent and role-aware context.
3. **Updated Routes**: `/produtor/*`, `/checkin/*`, and `/admin/master`.
4. **Role-Based Menu Logic**: Dynamic sidebar in `src/routes/produtor.tsx`.

## Technical Details
- Use `tenant_id` consistently across all queries.
- Implement a `hasPermission(role, action)` utility.
- Ensure `beforeLoad` guards in TanStack routes check for both authentication and tenant membership.
- Use Supabase RLS for hard data isolation.
