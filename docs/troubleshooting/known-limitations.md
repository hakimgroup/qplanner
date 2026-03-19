# Known Limitations

## `inProgress` Staleness Check

The `requested` and `awaitingApproval` notification types check whether the selection's current status still matches before showing the action modal. The `inProgress` notification type does **not** perform this check — it always shows the admin review modal regardless of the current status.

**Impact:** Low. Admin review modals are informational and don't trigger status changes.

## Large Client Bundle

The client build produces a single JS chunk of ~2MB (gzipped ~650KB). This is above Vite's recommended 500KB limit.

**Impact:** Slightly slower initial page load on slow connections.

**Potential fix:** Implement code splitting with dynamic `import()` for admin pages and large modals.

## Sass Legacy API Warnings

During client build, you'll see deprecation warnings about the Sass legacy JS API. These are cosmetic and come from Mantine's internal Sass usage.

**Impact:** None — purely cosmetic build warnings.

**Resolution:** Will resolve automatically when Mantine updates their Sass dependency to the modern API.

## No Real-Time Updates

The app uses React Query polling (refetch on window focus) rather than Supabase real-time subscriptions. This means:
- Users don't see new notifications until they refocus the browser tab or navigate
- Two users viewing the same selection may see stale data briefly

**Impact:** Low. The polling strategy is sufficient for the current user base.

## Calendar Year Hardcoded

The calendar timeline view (`CampaignTimelineSkeleton.tsx`) has the calendar year hardcoded to `2026`. This will need to be updated for each new year.

**Location:** `client/src/components/campaignSelector/calendar/CampaignTimelineSkeleton.tsx`, line ~402:
```typescript
const calendarYear = 2026;
```
