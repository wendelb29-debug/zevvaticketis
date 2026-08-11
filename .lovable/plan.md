# Professional Check-in Evolution Plan

The goal is to transform the `/checkin` area into a professional event entry operation center, unifying existing resources and adding real-time tracking, supervisor panels, and advanced reporting.

## 1. Database & Security
- [x] Create `checkin_records` table to track entry events.
- [x] Create `checkin_logs` table for operational audit.
- [x] Configure RLS and Grants for the new tables.
- [ ] Ensure `event_staff` roles ('scanner_only', 'supervisor') are utilized correctly in UI guards.

## 2. Route Structure Evolution
- `/checkin`: Selection of authorized events with summary indicators.
- `/checkin/event/$eventId`: Operational Dashboard for the specific event.
- `/checkin/event/$eventId/scanner`: QR Code scanner (moved from global to event-scoped).
- `/checkin/event/$eventId/supervisor`: Panel for monitoring operators and hourly flow.
- `/checkin/event/$eventId/relatorios`: Attendance and missing person reports with exports.

## 3. Component Implementation
- **Event Selection Grid**: Redesign current dashboard cards to show "Expected", "Checked-in", and "Missing".
- **Real-time Dashboard**: Cards for presence percentage and flow stats using Supabase Realtime.
- **Enhanced Scanner**: Validation logic (event check, payment status, active status) and automatic counter updates.
- **Supervisor Panel**: List of active operators and hourly entry charts.
- **Reporting Engine**: Filters for ticket type, period, operator, and status.
- **Export System**: CSV and PDF (jsPDF) generation for professional reports.

## 4. Operational Alerts
- Visual indicators for "Event Filling Up" (80%+), "High Queue" (recent flow spike), and "Operator Inactivity".

## Technical Details
- **Schema**:
    - `checkin_records`: `id`, `event_id`, `ticket_id`, `operator_id`, `checkin_date`, `checkin_time`, `status`.
    - `event_staff`: Already contains `role` enum ('scanner_only', 'supervisor').
- **Frameworks**:
    - TanStack Router for nested event routes.
    - Recharts for supervisor flow charts.
    - jsPDF + autoTable for professional PDF reports.
    - Lucide-react for consistent iconography.
