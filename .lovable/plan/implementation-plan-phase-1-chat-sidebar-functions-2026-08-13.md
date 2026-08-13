# Implementation Plan - Phase 1: Chat Sidebar Functions

Implement the first phase of the Zevva Chat sidebar functions: Client Groups, Shared Files, Attendance History, and Scheduling.

## User Review Required

> [!IMPORTANT]
> - I will create new tables for Groups, Attendances, and Schedules as they are currently missing from the schema.
> - Shared files will be extracted from existing `whatsapp_messages` media URLs.

## Proposed Changes

### Database Schema (Migration)
- Create `whatsapp_contact_groups`: `id`, `tenant_id`, `name`, `description`, `color`.
- Create `whatsapp_contact_group_memberships`: `id`, `contact_id`, `group_id`.
- Create `whatsapp_attendances`: `id`, `tenant_id`, `contact_id`, `agent_id`, `status` (open, closed, pending), `rating`, `feedback`, `closure_reason`, `internal_notes`.
- Create `whatsapp_schedules`: `id`, `tenant_id`, `contact_id`, `agent_id`, `scheduled_at`, `message_content`, `status` (pending, sent, failed, cancelled).
- Enable RLS and add GRANTS for all new tables.

### Backend (Server Functions)
- `getContactGroups`: List groups for a tenant and indicate which ones the contact belongs to.
- `updateContactGroups`: Add/remove contact from groups.
- `getSharedFiles`: Extract media messages for a contact and categorize into Media, Docs, Links.
- `getAttendanceHistory`: List closed attendances for a contact.
- `createSchedule`: Schedule a message or reminder.
- `closeAttendance`: Finalize an active attendance with reason and notes.

### Frontend (UI Components)
- Refactor sidebar state to handle only one active tool at a time.
- Implement **Groups Modal**: Multi-select groups with search and creation.
- Implement **Files Panel**: Lateral panel with Media/Docs/Links tabs.
- Implement **History Modal**: Searchable list of past attendances with message preview.
- Implement **Scheduling Modal**: Date/time picker with message preview and formatting.
- Implement **Finalization Modal**: Form with reason, notes, and closing message toggle.
- Implement **Transfer Modal**: Select department/agent for transfer.

## Technical Details
- Use `shadcn/ui` components (Dialog, Tabs, ScrollArea, Tooltip).
- Ensure theme consistency (Graphite Dark Mode, Coral highlights).
- Tenant isolation enforced via `tenant_id` on every query.
- Use `requireSupabaseAuth` middleware for all server functions.
- Optimize shared files query by filtering messages with `media_url` not null or `content` containing URLs.
