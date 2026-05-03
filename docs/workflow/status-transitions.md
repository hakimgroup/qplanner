# Status Transitions

## Transition Table

### Current path (May 2026 onwards)

| From             | To               | Triggered By                  | RPC / Mechanism                               |
| ---------------- | ---------------- | ----------------------------- | --------------------------------------------- |
| —                | `draft`          | Quick Populate (tier-based)   | `add_campaigns_bulk` with `p_status='draft'`  |
| —                | `draft`          | Guided Recommendations         | `add_campaigns_bulk` with `p_status='draft'`  |
| —                | `draft`          | Copy practice campaigns (catalog rows without a chosen creative) | `copy_practice_campaigns_v2` |
| `draft`          | `inProgress`     | Practice clicks "Send to Design Team" | `submit_draft_selection`              |
| —                | `inProgress`     | Practice adds a catalog campaign with asset choices | `add_campaign_with_assets`                    |
| —                | `inProgress`     | Practice creates a bespoke campaign | `create_bespoke_selection_v2`                 |
| —                | `inProgress`     | Practice creates a bespoke event | `create_bespoke_event_v2`                     |
| —                | `inProgress`     | Copy practice campaigns (when source has a chosen creative) | `copy_practice_campaigns_v2`                  |
| `inProgress`     | `awaitingApproval` | n8n automation              | DB trigger `trg_selections_awaiting_approval` |
| `awaitingApproval` | `confirmed`    | Practice confirms             | `confirm_assets`                              |
| `awaitingApproval` | `inProgress`   | Practice requests revision    | `request_revision`                            |
| `confirmed`      | `live`           | Cron job (8am UK daily)       | `/activate-live-campaigns`                    |
| `live`           | `completed`      | Cron job (8am UK daily)       | `/activate-live-campaigns`                    |

### Legacy path (pre-cutover selections only)

These transitions only apply to selections created before the May 2026 cutover. The v1 RPCs remain live so existing rows can finish their flow.

| From             | To               | Triggered By                  | RPC / Mechanism                               |
| ---------------- | ---------------- | ----------------------------- | --------------------------------------------- |
| —                | `onPlan`         | Practice selects campaign (legacy) | `add_campaigns_bulk` / `create_bespoke_selection` / `create_bespoke_event` |
| `onPlan`         | `requested`      | Admin requests assets         | `request_assets` / `request_assets_bulk`      |
| `requested`      | `inProgress`     | Practice submits choices      | `submit_assets`                               |

## Status Descriptions

| Status             | Meaning                                                    |
| ------------------ | ---------------------------------------------------------- |
| `draft`            | Practice planning — added via Quick Populate, Guided Recommendations, or copy. Practice-only (admins do not see drafts). Practice clicks "Send to Design Team" to advance to `inProgress`. |
| `onPlan`           | Legacy only — campaign planned but assets not yet requested. New selections no longer enter this state. |
| `requested`        | Legacy only — admin has requested assets; waiting for practice response. New selections no longer enter this state. |
| `inProgress`       | Practice has submitted choices (or made them at add-time); artwork being produced |
| `awaitingApproval` | Artwork is ready for practice to review and approve        |
| `confirmed`        | Practice has approved the artwork                          |
| `live`             | Campaign start date has arrived; campaign is active        |
| `completed`        | Campaign end date has passed; campaign is finished         |
| `feedbackRequested`| Practice requested changes (not a selection status — it's a notification type that moves status back to `inProgress`) |

## Status History

Every status transition is logged in the `selection_status_history` table with:
- `from_status` / `to_status`
- `actor_user_id` — who triggered it
- `note` — any message from the actor
- `message` — human-readable description
- `recipient` — JSON array of who was notified
- `practice` — JSON with practice id and name

## How to Manually Change a Status

::: warning
Only do this if you understand the implications. Changing status skips notifications and emails.
:::

Via Supabase Dashboard:
1. Go to **Table Editor** → `selections`
2. Find the selection by ID or practice name
3. Edit the `status` column
4. Update `updated_at` to `now()`

Via SQL:
```sql
UPDATE selections
SET status = 'confirmed', updated_at = NOW()
WHERE id = '<selection-id>';
```

Remember to also add a history entry if you want an audit trail:
```sql
INSERT INTO selection_status_history (selection_id, from_status, to_status, actor_user_id, message)
VALUES ('<selection-id>', '<old-status>', '<new-status>', '00000000-0000-0000-0000-000000000000', 'Manual status change');
```
