# Selection Lifecycle

Every campaign assigned to a practice creates a **selection** — the practice's instance of that campaign with its own dates, status, assets, and chosen creative.

## Status Flow

```
draft → inProgress → awaitingApproval → confirmed → live → completed
              ↕
        feedbackRequested (revision loop)
```

::: info Lifecycle change (May 2026)
Newly-created selections skip the legacy `onPlan → requested` stages. Two new entry points apply depending on how the campaign is added:

- **Direct submit** — single catalog add and bespoke campaign/event flows configure creative + assets in one step, so the selection lands at `inProgress` immediately.
- **Draft** — bulk add flows (Quick Populate, Guided Recommendations) and Copy Practice Campaigns (when the source has no chosen creative) populate the practice's plan as `draft`. The practice then opens each draft individually, configures it, and clicks "Send to Design Team" to transition it to `inProgress`.

Drafts are practice-only — admins do not see them. Pre-cutover selections continue through the legacy `onPlan → requested → inProgress` path, documented at the bottom.
:::

## Entry points — how new selections start

| Surface | Entry status | RPC |
| --- | --- | --- |
| Single catalog campaign add (drawer) | `inProgress` | `add_campaign_with_assets` |
| Bespoke campaign creation | `inProgress` | `create_bespoke_selection_v2` |
| Bespoke event creation | `inProgress` | `create_bespoke_event_v2` |
| Copy practice campaigns (source has chosen creative) | `inProgress` | `copy_practice_campaigns_v2` |
| Quick Populate (tier-based) | `draft` | `add_campaigns_bulk` with `p_status='draft'` |
| Guided Recommendations | `draft` | `add_campaigns_bulk` with `p_status='draft'` |
| Copy practice campaigns (source has no chosen creative) | `draft` | `copy_practice_campaigns_v2` |
| Practice clicks "Send to Design Team" on a draft | `draft → inProgress` | `submit_draft_selection` |

For `inProgress` entry points: payload includes chosen creative, assets, dates, etc., and notifies admins (`audience = 'admins'`); writes a `selection_status_history` row with `from_status = NULL`. For bespoke flows the chosen creative is the default Hakim brand creative (auto-applied server-side); the design team reaches out with options later.

For `draft` entry points: no admin notification, no email. The selection sits in the practice's plan with a "Send to Design Team" CTA. When clicked, the practice picks a creative + configures asset choices via the same `SubmitChoicesModal` used elsewhere, and the RPC transitions the selection to `inProgress` (firing the standard `inProgress` notification + email).

## Step-by-Step

### 1a. Draft (Quick / Guided / no-creative copy)
- **Who:** Practice user (Quick Populate, Guided Recommendations, or Copy Practice Campaigns from a source without a chosen creative)
- **What happens:** Selections land in the practice's plan as drafts. No admin involvement.
- **Status:** `draft`
- **Notification:** None (drafts are silent until submitted)
- **Email:** None
- **Visibility:** Practice only — admin `get_plans` filters drafts out.

### 1b. Send to Design Team (draft → inProgress)
- **Who:** Practice user
- **What happens:** Practice opens a draft selection, picks a creative + configures asset choices in `SubmitChoicesModal`, clicks "Send to Design Team".
- **RPC:** `submit_draft_selection`
- **Status:** `draft` → `inProgress`
- **Notification:** Sent to admins (type: `inProgress`)
- **Email:** `AssetsSubmittedEmail` sent to admins

### 1c. Direct submit (single add / bespoke / copy with creative)
- **Who:** Practice user
- **What happens:** Practice picks dates and (for catalog adds) a creative + asset quantities, or fills out a bespoke brief. Submission goes straight to the design team in the same step.
- **RPC:** `add_campaign_with_assets`, `create_bespoke_selection_v2`, `create_bespoke_event_v2`, or `copy_practice_campaigns_v2`
- **Status:** Inserted at `inProgress`
- **Notification:** Sent to admins (type: `inProgress`)
- **Email:** `AssetsSubmittedEmail` sent to admins

### 2. Awaiting Approval
- **Who:** Design team (via Trello) → n8n (automated)
- **What happens:** A card is automatically created on a **Trello board** for the design team. Designers work on the artwork and, when finished, move the card from the "In Progress" column to the "Awaiting Approval" column. This triggers the **n8n automation**, which picks up the change, updates the selection in the database with markup/assets links, and sets the status. A database trigger then fires to create the notification and send the email.
- **Trigger:** Trello card move → n8n → DB update → DB trigger `trg_selections_awaiting_approval`
- **Status:** `inProgress` → `awaitingApproval`
- **Notification:** Sent to practice users (type: `awaitingApproval`)
- **Email:** `AwaitingApprovalEmail` sent via `pg_net` HTTP call from DB trigger

### 3a. Confirm Assets
- **Who:** Practice user
- **What happens:** Practice reviews the artwork (via markup link) and confirms
- **RPC:** `confirm_assets`
- **Status:** `awaitingApproval` → `confirmed`
- **Notification:** Sent to admins (type: `confirmed`)
- **Email:** `AssetsConfirmedEmail` sent to admins

### 3b. Request Revision (alternative to confirm)
- **Who:** Practice user
- **What happens:** Practice leaves feedback requesting changes to the artwork
- **RPC:** `request_revision`
- **Status:** `awaitingApproval` → `inProgress` (back to step 2)
- **Notification:** Sent to admins (type: `feedbackRequested`)
- **Email:** `FeedbackRequestedEmail` sent to admins

### 4. Live
- **Who:** Cron job (automated)
- **What happens:** Daily at 8am UK time, confirmed campaigns whose `from_date` matches today are activated
- **Endpoint:** `/activate-live-campaigns`
- **Status:** `confirmed` → `live`
- **No notification or email is sent for this transition**

### 5. Completed
- **Who:** Cron job (automated)
- **What happens:** The same daily cron job marks live campaigns whose `to_date` has passed as completed
- **Status:** `live` → `completed`
- **No notification or email is sent for this transition**

## Edit / remove policy by stage

The practice-side Edit drawer is **stage-aware**. Once a selection is past `draft` / `onPlan`, the design team is involved and direct mutation would lie about state, so the drawer becomes read-only.

| Stage | Edit dates | Edit notes | Remove (practice) |
| --- | --- | --- | --- |
| `draft` | ✅ | ✅ | ✅ hard delete |
| `onPlan` (legacy) | ✅ | ✅ | ✅ hard delete |
| `inProgress` | 🔒 read-only | 🔒 read-only | 🔒 hidden |
| `awaitingApproval` | 🔒 read-only | 🔒 read-only | 🔒 hidden (use Request Revision instead) |
| `confirmed` | 🔒 read-only | 🔒 read-only | 🔒 hidden |
| `live` | 🔒 read-only | 🔒 read-only | 🔒 hidden |
| `completed` | 🔒 read-only | 🔒 read-only | 🔒 hidden |

When a selection is locked, the Edit drawer renders a summary with a banner: *"Once submitted to the design team, dates and notes can't be changed here. Need to update something or pull this campaign? Contact your admin and they'll coordinate with the design team."*

Admin God Mode bypasses these locks for support cases (date extensions, late cancellations, etc.). All God Mode mutations leave a trail in `selection_status_history`.

## Legacy path

Selections created before the May 2026 cutover started life at `onPlan` and required an admin-driven asset request gate before they could move forward. The legacy path remains supported for those rows — none of the v1 RPCs (`request_assets`, `request_assets_bulk`, `submit_assets`) have been removed. New selections will not enter `onPlan` or `requested` going forward.

```
onPlan → requested → inProgress → awaitingApproval → ...
```

| From → To | Triggered by | RPC |
| --- | --- | --- |
| `onPlan` → `requested` | Admin requests assets | `request_assets` / `request_assets_bulk` |
| `requested` → `inProgress` | Practice submits choices | `submit_assets` |
