# Plan - Fix Master Console Tenant Management

Fixing the 404 error and stabilizing the Individual Project Management page (`/admin/tenants/$id`) by aligning it with the canonical `tenants` table and implementing a secure RPC.

## User Review Required

> [!IMPORTANT]
> The fix involves creating a new Database RPC `get_master_tenant_details`. This will be executed as a migration.

## Proposed Changes

### 1. Database & Security
- Create a `SECURITY DEFINER` RPC `get_master_tenant_details(uuid)` to securely fetch tenant data for platform admins.
- Ensure the RPC validates the caller's global admin status and sanitizes output (no secrets/tokens).
- Audit current `tenants` table RLS to ensure `is_platform_admin()` covers global access.

### 2. Backend Logic (Server Functions)
- Update `src/lib/master/tenants.functions.ts` to use the new RPC instead of direct Supabase Select.
- Implement error normalization to distinguish between `FORBIDDEN`, `NOT_FOUND`, and `INVALID_ID`.

### 3. Frontend Navigation & Routing
- Update `src/routes/admin/master.tsx` to use typed `navigate` with correct tenant ID params (removing `as any` where possible).
- Update `src/routes/admin/tenants/$id.tsx` to:
    - Validate UUID format before querying.
    - Implement granular loading and error states (skeletons for success, specific alerts for errors).
    - Persist the active tab in the URL state.
    - Load tab-specific data progressively.

### 4. UI/UX Refinement
- Update Breadcrumbs to show the tenant's name instead of ID.
- Ensure the page header displays real data (logo, name, owner, plan) fetched via the new RPC.
- Maintain responsive sidebar layout and theme (Graphite/Coral).

## Technical Details

- **RPC Name**: `public.get_master_tenant_details`
- **Tables Audited**: `tenants`, `platform_admins`, `profiles`.
- **Route**: `/admin/tenants/$id`
- **Query Keys**: Standardized as `["master-tenant-details", id]`.
