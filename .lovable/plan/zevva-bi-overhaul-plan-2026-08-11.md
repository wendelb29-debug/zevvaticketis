# Zevva BI Overhaul Plan

Transform the Zevva BI dashboard into a dynamic, data-driven intelligence layer for platform admins and producers, enabling real-time performance tracking and professional reporting.

## User Review Required

> [!IMPORTANT]
> - The ROI calculation will be based on `orders` (revenue) vs. `campaigns` (cost, which we'll add to the schema).
> - Marketing attribution depends on UTMS parameters being captured during checkout, which is partially implemented in the tracking table.

## Proposed Changes

### Database & Schema Updates
- Add `budget` and `spend` columns to `campaigns` table to enable ROI calculations.
- Ensure `sales_attribution` table is correctly populated during the checkout process.
- Verify RLS policies allow BI queries while maintaining data privacy.

### Dashboard Core (AdminDashboardBI.tsx)
- **Global Filter State**: Implement `dateRange`, `eventId`, `producerId`, and `category` filters.
- **Dynamic Data Fetching**: Replace mock data with real-time Supabase queries using the filters.
- **Advanced Filters Sidebar**: Add a `Sheet` based sidebar for granular filtering of large datasets.
- **Alert Panel Engine**: Connect the alerts (low sales, expiring events) to real database triggers.

### Business Intelligence Modules
- **Conversion Funnel**: Calculate real conversion rates: Views -> Clicks -> Signups -> Sales -> Check-in.
- **Marketing ROI**: Rank campaigns by ROI and volume.
- **Financial Analytics**: Segment gross vs. net revenue (Zevva fee vs. Producer payout).
- **Presence BI**: Cross-reference check-in data with sales to identify "no-show" patterns by event type.

### Professional Reporting (src/lib/export/index.ts)
- Already overhauled to support A4 PDF branding and executive summaries.
- Will integrate these calls into the dashboard's "Gerar Relatório" menu.

## Technical Details

### Filter Logic
Use a `useEffect` that triggers a combined data fetch when the global filter state changes.
```typescript
const [filters, setFilters] = useState({
  start: subDays(new Date(), 30),
  end: new Date(),
  producerId: 'all',
  eventId: 'all'
});
```

### ROI Formula
`ROI = (Total Revenue from Attribution - Campaign Spend) / Campaign Spend` (expressed as a multiple, e.g., 5.0x).

### Data Aggregation
Heavy use of Supabase `.select()` with counts and `.sum()` where possible, or client-side aggregation for complex funnel steps.
