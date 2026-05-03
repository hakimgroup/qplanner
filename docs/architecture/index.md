# Architecture

## System Diagram

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Browser    │────▶│  Vercel (Client)  │────▶│    Supabase     │
│  React App   │     │  Static + SPA     │     │  PostgreSQL DB  │
└─────────────┘     └──────────────────┘     │  Auth (Azure AD)│
                                              │  RPC Functions   │
┌─────────────┐     ┌──────────────────┐     │  RLS Policies    │
│ cron-job.org│────▶│  Vercel (Server)  │────▶│                 │
│  Scheduler  │     │  Express.js API   │     └─────────────────┘
└─────────────┘     │  Email (Resend)   │
                    └──────────────────┘     ┌─────────────────┐
┌─────────────┐            ▲                 │      n8n        │
│  pg_net     │────────────┘                 │  (Automation)   │
│ (DB trigger)│                              │  Artwork status │
└─────────────┘                              └─────────────────┘
```

## Data Flow

### Client → Supabase (Direct)

The React frontend communicates directly with Supabase for:
- **Authentication** — Azure AD OAuth via Supabase Auth
- **Data queries** — RPC function calls (`get_plans`, `get_campaigns`, etc.)
- **Mutations** — RPC function calls (`add_campaign_with_assets`, `create_bespoke_selection_v2`, `confirm_assets`, etc.)
- **Real-time** — Not currently used

All data access goes through **RPC functions** (not direct table access). This provides a clean API layer with built-in authorization checks.

### Client → Express Server

The client calls the Express server for:
- **Sending emails** — `/send-notification-email`, `/send-actor-email`, `/send-bulk-notification-email`
- These are fire-and-forget calls after successful RPC mutations

### External Triggers → Express Server

- **cron-job.org** — Hits `/activate-live-campaigns` daily at 8am UK time and `/process-onboarding-emails` daily
- **pg_net (DB trigger)** — When n8n updates a selection to `awaitingApproval`, a database trigger calls `/send-notification-email` via `pg_net`

### n8n (External Automation)

n8n is an external workflow automation tool that:
- Monitors the `n8n_job_queue` table for new artwork processing jobs
- Updates selection status from `inProgress` → `awaitingApproval` when artwork is ready
- Sets `markup_link` and `assets_link` on the selection

## Key Client Files

### Hooks (`client/src/hooks/`)

| File                    | Key Exports                                                                                                                    |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `notification.hooks.ts` | `useNotifications`, `useRequestAssets`, `useSubmitAssets`, `useConfirmAssets`, `useRequestRevision`, `useMarkNotificationRead` |
| `campaign.hooks.ts`     | `useUpsertCatalogCampaign`, `useAllCampaigns`, campaign mutations                                                              |
| `selection.hooks.ts`    | `useSelectionById`, `useSelections`, selection queries                                                                          |

### Models (`client/src/models/`)

| File                     | Key Types                                                    |
| ------------------------ | ------------------------------------------------------------ |
| `notification.models.ts` | `NotificationRow`, `NotificationPayload`, `NotificationType` |
| `campaign.models.ts`     | `Campaign`, `Creatives`, `Assets`, `AdminModalSelection`     |
| `selection.models.ts`    | `Selection`, `PlanRow`, `Plans`                              |
| `general.models.ts`      | `AssetItem`, `Assets`                                        |

### Shared (`client/src/shared/`)

| File               | Key Exports                                                                          |
| ------------------ | ------------------------------------------------------------------------------------ |
| `shared.models.ts` | `RPCFunctions` enum, `SelectionStatus` enum, `DatabaseTables` enum, `UserRoles` enum |
| `AuthProvider.tsx`  | Auth context, role-based access                                                      |
| `AppProvider.tsx`   | App-level state (campaigns, filters)                                                 |

### Key Components

| Component                    | Purpose                                                                         |
| ---------------------------- | ------------------------------------------------------------------------------- |
| `AdminRequestAssetsModal`    | Admin adds creatives and requests assets from practice                          |
| `PracticeRespondModal`       | Practice chooses creative and selects assets                                    |
| `PracticeApprovalModal`      | Practice confirms or leaves feedback on artwork                                 |
| `AdminReviewSubmissionModal` | Admin reviews practice's asset submission                                       |
| `AdminConfirmedModal`        | Admin sees confirmation from practice                                           |
| `AdminFeedbackModal`         | Admin sees revision request from practice                                       |
| `CampaignStatusDashboard`    | Practice-facing table of all campaigns with status, action, markup/assets links |

## Common Code Patterns

### Adding a New RPC Function

1. Create and deploy the SQL function in Supabase
2. Add the function name to `RPCFunctions` enum in `client/src/shared/shared.models.ts`
3. Create a React Query hook in the appropriate hooks file
4. Check response: `if (data && !data.success) throw new Error(data.error)`

### RPC Response Pattern

```typescript
// In SQL function — always return success/error envelope:
RETURN json_build_object(
  'success', true,
  'id', v_notification_id
);

// In hook — check the envelope:
if (data && !data.success) {
  throw new Error(data.error || "Failed to...");
}
```

### Adding a New Notification Type

1. Add the type string to `NotificationType` in `client/src/models/notification.models.ts`
2. Add a case in `useNotificationOpen.hook.tsx` to route to the correct modal
3. Create the modal component
4. Add an email template in `server/emails/`
5. Add a handler in `server/api/index.ts`
