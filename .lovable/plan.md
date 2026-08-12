---
title: Professional Tenant Isolation and Secure Logout
description: Implement robust session cleanup, tenant-scoped routing, and role-based access to admin/workspace environments.
---

# Professional Tenant Isolation and Secure Logout

This plan addresses the requirement for secure transitions between platform-level environments (Admin/Workspace) and individual tenant environments, ensuring strict isolation and automatic redirection for non-privileged users.

## User Review Required

> [!IMPORTANT]
> The "Back to Workspace" button will be restricted to users with the `platform_admin` role. Regular tenant members (producers, staff) will remain strictly isolated within their assigned project environment.

## Proposed Changes

### 1. Authentication & Session Security
- Update `handleLogout` globally to ensure clean state:
  - Clear `zevva_active_tenant_id` from localStorage.
  - Redirect specifically to the public home or login page.
- Modify `switchTenant` in `useTenants` to trigger a safe reload/redirect when moving between isolated environments.

### 2. Route Protection & Redirects
- **Admin Layout (`src/routes/admin.tsx`):**
  - Reinforce `beforeLoad` with a strict check against the `platform_admins` table.
  - Ensure any 403/401 state wipes the local tenant context.
- **Producer Layout (`src/routes/produtor.tsx`):**
  - Implement automatic redirection to `/app` (Workspace) if no `activeTenant` is selected.
  - Add a "Voltar para o Workspace" (Home icon) button that is **only** visible if `isAdmin` is true.
  - Hide the tenant switcher/management dropdown from users who are not owners or platform admins.

### 3. UI Refinements
- **User Menu (`src/components/auth/UserMenu.tsx`):**
  - Update "Meus Projetos" / "Painel Admin" visibility to strictly follow platform roles.
  - Ensure the "Sair" action performs a full session cleanup.
- **Tenant Sidebar:**
  - Remove all platform-level navigation links for non-admin users.

## Technical Details

- **Database:** No schema changes required; utilizing existing `platform_admins` and `tenant_members` tables.
- **TanStack Router:** Using `beforeLoad` and `redirect` for hard navigation guards.
- **Local Storage:** `zevva_active_tenant_id` will be the single source of truth for the active workspace context in the browser.

## Verification Plan
- **Logout Test:** Log out from a tenant environment and verify `localStorage` is cleared and admin routes are inaccessible.
- **Isolation Test:** Log in as a regular producer/staff and verify the absence of "Back to Workspace" or "Admin Panel" links.
- **Direct Access Test:** Attempt to navigate to `/admin` or `/app` directly as a regular user and verify immediate redirection to the tenant dashboard or unauthorized page.
