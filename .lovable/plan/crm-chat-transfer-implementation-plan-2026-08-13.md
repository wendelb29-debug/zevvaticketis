# CRM & Chat Transfer Implementation Plan

## 1. Database Schema Hardening
- Create `whatsapp_departments` table (tenant_id, name, status).
- Create `whatsapp_department_members` table (department_id, user_id).
- Create `attendance_transfers` table (detailed log of all transfer events).
- Update `whatsapp_attendances` to include `department_id` and ensure RLS consistency.
- Implement `transfer_attendance` RPC function for atomic, thread-safe transfers.

## 2. Admin Dashboard BI Visual Fixes (v11)
- Refactor `BIStatCard` in `AdminDashboardBI.tsx` to remove `bg-white` and use `bg-card`.
- Audit all occurrences of `bg-white` in `AdminDashboardBI.tsx`.
- Standardize KPIs with semantic tokens (Coral icons, Graphite backgrounds).

## 3. Zevva Chat: Protocol Transfer Flow
- Implement `SidebarTransfer.tsx` component with:
  - Department and Agent selection (conditional logic).
  - Mandatory transfer reason with character count.
  - "Send message to customer" switch.
- Connect Chat Sidebar "Transferir" button to the new modal.
- Real-time updates via Supabase for queues and assigned protocol removal/addition.

## 4. Permissions & Audit
- Implement RLS for the new transfer tables.
- Add event logs for every transfer action.
- Update `SidebarHistory.tsx` to show transfer events in the timeline.

## Technical Details
- **Atomic Transfer**: Using a Postgres transaction (via RPC) to ensure protocol state, assignment, and history log are updated simultaneously.
- **Real-time**: Leveraging Supabase `postgres_changes` to trigger UI updates for both the source and destination agents.
- **Design**: Strict adherence to Zevva Coral/Graphite palette using Tailwind 4 semantic tokens.
