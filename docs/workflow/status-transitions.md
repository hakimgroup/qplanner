# Status Transitions

## Transition Table

| From             | To               | Triggered By                  | RPC / Mechanism                               |
| ---------------- | ---------------- | ----------------------------- | --------------------------------------------- |
| —                | `onPlan`         | Practice selects campaign     | `add_campaigns_bulk` / bespoke creation RPCs  |
| `onPlan`         | `requested`      | Admin requests assets         | `request_assets` / `request_assets_bulk`      |
| `requested`      | `inProgress`     | Practice submits choices      | `submit_assets`                               |
| `inProgress`     | `awaitingApproval` | n8n automation              | DB trigger `trg_selections_awaiting_approval` |
| `awaitingApproval` | `confirmed`    | Practice confirms             | `confirm_assets`                              |
| `awaitingApproval` | `inProgress`   | Practice requests revision    | `request_revision`                            |
| `confirmed`      | `live`           | Cron job (8am UK daily)       | `/activate-live-campaigns`                    |
| `live`           | `completed`      | Cron job (8am UK daily)       | `/activate-live-campaigns`                    |

## Status Descriptions

| Status             | Meaning                                                    |
| ------------------ | ---------------------------------------------------------- |
| `onPlan`           | Campaign is planned but assets haven't been requested yet  |
| `requested`        | Admin has requested assets; waiting for practice response   |
| `inProgress`       | Practice has submitted choices; artwork being produced      |
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
