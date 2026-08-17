# Plan — Zevva Ads Module (Multi-tenant Advertising)

Implementation of a professional advertising system within the Zevva ecosystem, allowing platform admins to manage sponsored content and track performance across the marketplace.

## Objectives
- Create a multi-tenant ad management system with RLS.
- Implement a floating ad engine for the homepage with interaction tracking.
- Build a management dashboard for Advertisers and Campaigns.

## Technical Details
- **Tables**: `ad_advertisers`, `ad_campaigns`, `ad_creatives`, `ad_metrics` (already created).
- **Isolation**: Tenant-level RLS with `public.has_permission` checks.
- **Frontend**: Framer Motion for animations, `IntersectionObserver` for viewability tracking (50% visibility for 1s).
- **Metrics**: serves, impressions, clicks, dismissals.

## Proposed Changes

### Database & Permissions
- Verify `GRANT`s and RLS for all `ad_*` tables.
- Ensure `public.has_permission` handles ad management scopes.

### Components
- `FloatingSponsoredAd.tsx`: Interactive floating ad with swipe-to-dismiss and viewability tracking (Already partially implemented).
- `AdsManager`: Homepage integration (Already implemented in `src/routes/index.tsx`).

### Admin Dashboard (`/admin/marketing/anuncios`)
- Overhaul `anuncios.tsx` to include:
  - **Advertisers Tab**: List and CRUD for partners.
  - **Campaigns Tab**: Management of active ads, scheduling, and priority.
  - **Metrics Dashboard**: Visual summary of clicks/impressions/CTR.

### Integrations
- Connect `logAdEvent` server function to ensure metrics are recorded accurately.
- Standardize ad images using `EventImage` fallback patterns.

## User Review Required
> [!IMPORTANT]
> The current plan uses a single floating ad slot on the homepage. Should we allow multiple simultaneous ads or sticky slots in category pages?
