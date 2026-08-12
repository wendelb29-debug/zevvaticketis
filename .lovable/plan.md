# Plan: WhatsApp Real-Time Omnichannel Integration

Establish a real-time, database-backed WhatsApp chat system in the Admin panel, replacing mock data with live interactions from Lovable Cloud.

## User Review Required
> [!IMPORTANT]
> This integration assumes that WhatsApp messages are being populated into the `whatsapp_messages` table via an external webhook or the existing UAZAPI setup. The `UAZAPI_BASE_URL` secret must be configured for outbound messages.

## Proposed Changes

### Database & Backend
- Refine `src/lib/whatsapp/whatsapp.functions.ts` to support fetching real contacts and their message history.
- Ensure the `getWhatsAppContacts` function correctly joins contacts with their latest message for the sidebar view.

### Frontend Integration
- **State Management:** Replace hardcoded `contacts` and `messages` arrays in `src/routes/admin/chat.tsx` with `useQuery` hooks.
- **Real-Time Updates:** Implement a Supabase Realtime subscription to the `whatsapp_messages` table to inject new inbound/outbound messages instantly into the UI.
- **Outbound Flow:** Connect the message input field to the `sendWhatsAppMessage` server function.
- **Contact Selection:** Ensure selecting a contact from the sidebar loads their specific message history and updates the header with real contact details (phone, name).

### UI Refinement
- Update the chat bubbles to distinguish between `inbound` (client) and `outbound` (agent) directions based on database records.
- Sync agent status (online/offline) with a shared state or database field if available.

## Technical Details
- **Tables:** `whatsapp_contacts`, `whatsapp_messages`, `whatsapp_instances`.
- **Hooks:** `@tanstack/react-query` for initial loading and caching; `supabase.channel().on('postgres_changes', ...)` for real-time sync.
- **Authentication:** All requests are scoped by `tenant_id` to maintain multi-tenant isolation.
