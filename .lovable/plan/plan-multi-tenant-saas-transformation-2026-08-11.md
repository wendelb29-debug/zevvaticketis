# Plan - Multi-Tenant SaaS Transformation

Establish a robust multi-tenant architecture where independent producers manage their own events and workspaces, while the platform maintains global oversight.

## User Review Required

> [!IMPORTANT]
> The current implementation already uses `tenants` and `tenant_members`. I will rename/alias these to `producers` and `producer_users` in the UI to match your request, while keeping the database structure stable to avoid breaking existing features.

- **Terminology**: The UI will refer to "Produtores" instead of "Tenants/Organizações".
- **Dashboard Visibility**: Should producers see their Zevva commission deduction on the main dashboard, or just the net revenue?

## Proposed Changes

### Database & Security
- **RLS Refinement**: Ensure every business table (`ads`, `campaigns`, `checkin_records`, etc.) has a strict `tenant_id` check against the user's membership.
- **Roles Expansion**: Update the roles to include `CHECKIN_MANAGER` and `CHECKIN_OPERATOR` as requested.

### Producer Experience
- **Workspace Selector**: Update `/app` to refer to "Meus Produtores".
- **Producer Dashboard**: Redesign the producer dashboard to include integrated metrics for sales, campaigns, and check-ins.
- **Route Structure**: Implement `/producer/:id/dashboard` pattern for deep-linking into specific workspaces.

### Master Admin
- **Global Overview**: Overhaul `/admin/master` to show platform GMV, active producers, and revenue (commissions).

### Components & UI
- **Marketplace Logic**: Ensure the homepage filters and "Organized by" labels correctly attribute events to their producers.
- **i18n & Meta**: Update head metadata and platform strings to reflect the "Marketplace de Produtores" mission.

## Technical Details
- **RLS Policy**: `USING (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()))`
- **Hook Update**: Enhance `useTenants` to handle the new role granularities.
- **Navigation**: Update Sidebar and Navbar to be context-aware of the selected producer workspace.
