# Selection Lifecycle

Every campaign assigned to a practice creates a **selection** — the practice's instance of that campaign with its own dates, status, assets, and chosen creative.

## Status Flow

```
onPlan → requested → inProgress → awaitingApproval → confirmed → live → completed
                                        ↕
                                  feedbackRequested (revision loop)
```

## Step-by-Step

### 1. On Plan
- **Who:** Practice user
- **What happens:** Practice browses the campaign catalog and selects campaigns to add to their plan, choosing their preferred dates
- **Status:** `onPlan`
- **User sees:** Campaign appears in their selections with "On Plan" badge

### 2. Request Assets
- **Who:** Admin
- **What happens:** Admin opens the "Request Assets" modal, sets creatives (artwork options) and selects which assets to request, then sends the request
- **RPC:** `request_assets` or `request_assets_bulk`
- **Status:** `onPlan` → `requested`
- **Notification:** Sent to practice users (type: `requested`)
- **Email:** `AssetsRequestedEmail` sent to practice members

### 3. Submit Assets
- **Who:** Practice user
- **What happens:** Practice opens the notification, chooses a creative (artwork), selects their preferred assets, and submits
- **RPC:** `submit_assets`
- **Status:** `requested` → `inProgress`
- **Notification:** Sent to admins (type: `inProgress`)
- **Email:** `AssetsSubmittedEmail` sent to admins

### 4. Awaiting Approval
- **Who:** Design team (via Trello) → n8n (automated)
- **What happens:** When the practice submits their choices, a card is automatically created on a **Trello board** for the design team. Designers work on the artwork and, when finished, move the card from the "In Progress" column to the "Awaiting Approval" column. This triggers the **n8n automation**, which picks up the change, updates the selection in the database with markup/assets links, and sets the status. A database trigger then fires to create the notification and send the email.
- **Trigger:** Trello card move → n8n → DB update → DB trigger `trg_selections_awaiting_approval`
- **Status:** `inProgress` → `awaitingApproval`
- **Notification:** Sent to practice users (type: `awaitingApproval`)
- **Email:** `AwaitingApprovalEmail` sent via `pg_net` HTTP call from DB trigger

### 5a. Confirm Assets
- **Who:** Practice user
- **What happens:** Practice reviews the artwork (via markup link) and confirms
- **RPC:** `confirm_assets`
- **Status:** `awaitingApproval` → `confirmed`
- **Notification:** Sent to admins (type: `confirmed`)
- **Email:** `AssetsConfirmedEmail` sent to admins

### 5b. Request Revision (alternative to confirm)
- **Who:** Practice user
- **What happens:** Practice leaves feedback requesting changes to the artwork
- **RPC:** `request_revision`
- **Status:** `awaitingApproval` → `inProgress` (back to step 4)
- **Notification:** Sent to admins (type: `feedbackRequested`)
- **Email:** `FeedbackRequestedEmail` sent to admins

### 6. Live
- **Who:** Cron job (automated)
- **What happens:** Daily at 8am UK time, confirmed campaigns whose `from_date` matches today are activated
- **Endpoint:** `/activate-live-campaigns`
- **Status:** `confirmed` → `live`
- **No notification or email is sent for this transition**

### 7. Completed
- **Who:** Cron job (automated)
- **What happens:** The same daily cron job marks live campaigns whose `to_date` has passed as completed
- **Status:** `live` → `completed`
- **No notification or email is sent for this transition**
