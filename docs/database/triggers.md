# Database Triggers

## `trg_selections_awaiting_approval`

**Table:** `selections`
**Fires:** `AFTER UPDATE` when `status` changes to `awaitingApproval`
**Function:** `on_selection_awaiting_approval()`

### What It Does

1. Creates a notification (audience: `practice`, type: `awaitingApproval`)
2. Creates `notification_targets` for practice users
3. Logs the status transition in `selection_status_history`
4. Calls the Express server via `pg_net` HTTP POST to send the email notification

### Why a Trigger?

The `inProgress → awaitingApproval` transition is triggered by **n8n** (external automation), not the client. Since n8n updates the database directly, a trigger is the only way to create notifications and send emails for this transition.

### pg_net Call

The trigger uses `net.http_post()` (pg_net v0.8.0) to call:
```
https://qplanner-server.vercel.app/send-notification-email
```

With body:
```json
{ "notificationId": "<uuid>" }
```

::: info
pg_net calls are asynchronous — the trigger completes without waiting for the HTTP response. Check the `net._http_response` table in Supabase if you need to debug delivery failures.
:::

## How n8n Triggers This

1. n8n picks up a job from `n8n_job_queue`
2. Processes the artwork (external system)
3. Updates the selection:
   ```sql
   UPDATE selections
   SET status = 'awaitingApproval',
       markup_link = '...',
       assets_link = '...'
   WHERE id = '<selection-id>';
   ```
4. The trigger fires automatically on this UPDATE
