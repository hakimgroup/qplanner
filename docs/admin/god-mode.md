# God Mode

::: warning Super Admin Only
God Mode is a "break glass" admin override panel restricted to **super admins only**. Every action is logged to the `god_mode_log` table for audit purposes.
::: 

God Mode lets super admins search any selection across all practices and override almost anything about it at any stage of the workflow. It's the answer to the recurring "can you fix X for this practice" requests.

## Access

- **Route:** `/admin/god-mode`
- **Sidebar:** Look for the lightning bolt icon (⚡) under "Super Admin" section
- **Visible to:** `super_admin` role only

## What You Can Do

### Phase 1 — Read & Audit ✅

- **Search** selections by campaign name, practice name, or selection ID
- **Filter** by status and date range
- **View full selection details:**
  - Overview — selection, campaign/bespoke, practice, members
  - Assets & Creatives — full asset and creative breakdown
  - Notification Payloads — every notification payload (read-only for now)
  - History — status transitions, emails sent, prior God Mode actions
  - Workflow Actions — placeholder for Phase 3
  - Danger Zone — placeholder for Phase 4

### Phase 2 (current) — Edit Selection & Bespoke ✅

- **Edit Selection** — change status, from/to dates, markup_link, assets_link, self_print flag, notes. Live in the Overview tab "Edit" button on the Selection section.
- **Edit Bespoke Campaign** (bespoke only) — name, description, category, event_type, requirements, objectives, topics. Lives in the Overview tab "Edit" button on the Bespoke Campaign section.
- **Edit Assets** — full editor for printed/digital/external assets with tabs, plus the chosen creative URL and asset note. Lives in the Assets & Creatives tab "Edit" button on each asset section.
- **Edit Creatives** (bespoke only) — add/remove/edit the bespoke campaign's creative options (URL, label, assets_link, custom question). Lives in the Assets & Creatives tab "Edit" button on the Creatives section. Catalog campaigns are read-only (no catalog edits in God Mode).

**How edits work:**
1. Click "Edit" on the section you want to change
2. Make your changes in the modal form
3. Click "Review Changes" to see a field-by-field before/after diff
4. Optionally add a reason ("Why are you making this change?")
5. Click "Save Changes" — the RPC applies the patch and writes to `god_mode_log`

**What's NOT triggered by Phase 2 edits:** No notifications, no emails. Edits are pure data updates. Workflow actions that DO trigger notifications (resend email, force status with notification, etc.) come in Phase 3.

### Phase 3 (current) — Workflow Actions ✅

All workflow actions live in the **Workflow Actions** tab of the detail drawer. Each action opens a focused modal, supports an optional reason field, and is logged to `god_mode_log`.

- **Force Status Transition** — Force the selection's status to any value. By default it runs in **silent mode** (no notifications, no emails) and writes to `selection_status_history` with a `god_mode = true` flag. There's an opt-in toggle to **also create a notification** for the new stage (for stages that normally have one). Even with the toggle on, no email is automatically sent — use Resend Email separately if you want one.
- **Update Notification Payloads** — Pick one or more notification stages on the selection (e.g. `requested`, `awaitingApproval`), then patch any subset of payload fields (name, dates, markup_link, assets_link, chosen_creative, etc.). The patch is merged into each selected notification's payload. This is how you fix UI displaying stale data inside notification modals.
- **Edit Payload JSON** (in the **Notification Payloads** tab) — For full control, every notification has an "Edit JSON" button that opens a raw JSON editor. The editor validates that the input parses as a JSON object and **fully replaces** the payload on save. The previous payload is captured in the God Mode log.
- **Resend Email** — Pick a notification + a list of recipients, and the Express server sends the corresponding email template using the notification's saved payload. Recipients can be picked from current practice members and/or added as free-form email addresses. The send uses a `recipientEmailsOverride` parameter on `/send-notification-email` so notification_targets is bypassed entirely.
- **Recreate Notification** — Creates a brand-new notification + targets for a chosen stage and audience using the current selection state. Useful when a notification was never fired or got deleted. **No email is sent** automatically.
- **Force Mark As Read** — Marks `notification_targets.read_at` for all targets of the chosen notification (or all notifications on the selection). Useful when a stuck notification can't be dismissed by the user.

**`god_mode` actor flag:** Status transitions made via Force Status are recorded in `selection_status_history` with `god_mode = true`. This lets future audits distinguish forced changes from normal workflow transitions.

### Phase 4 (current) — Danger Zone ✅

All danger-zone actions live in the **Danger Zone** tab of the detail drawer. They are restricted, explicitly confirmed, and logged.

- **Reassign Practice** — Moves the selection to a different practice. Updates `selections.practice_id`. If the selection is bespoke, also updates `bespoke_campaigns.practice_id`. For each existing notification on the selection, updates `notifications.practice_id`, deletes old `notification_targets`, and recreates new targets for the destination practice's members (or admins for admin-audience notifications). The full audit trail moves with the selection.
- **Archive Selection** — Snapshots the entire selection row into `archived_selections`, then deletes the selection along with its notifications, notification targets, and email logs. `selection_status_history` and `god_mode_log` rows survive (their `selection_id` is set to NULL via the existing FK rule). Useful for "remove from active views but keep the data".
- **Delete Selection** — Permanently deletes the selection along with all its notifications, notification targets, and email logs. Status history and God Mode log entries survive. Requires typing **DELETE** to confirm. The full selection snapshot (including notifications and email logs) is captured in `god_mode_log.before_value` so the data is technically recoverable from the audit log.

After Delete or Archive succeeds, the detail drawer automatically closes since the selection no longer exists.

## Audit Trail

Every God Mode action writes to the `god_mode_log` table with:

| Field | Description |
|-------|-------------|
| `actor_user_id` | Who performed the action |
| `selection_id` | What selection was affected |
| `action_type` | The kind of action (e.g., `update_selection`, `force_status`, `resend_email`) |
| `target` | What specifically was changed |
| `before_value` / `after_value` | Full diff (JSONB) |
| `reason` | Optional reason text the admin provided |
| `silent` | Whether the action was performed in silent mode |
| `created_at` | Timestamp |

The God Mode log is visible inside the detail drawer's **History** tab under "God Mode Log".

## Why "God Mode"

Notification payloads are **snapshots** at the time of creation — the UI reads from these snapshots when showing modals to users. So if you edit the underlying selection but not the payloads, modals show stale data. The **stage selector** in Phase 3 lets you push payload updates to one or multiple notification stages so the UI stays consistent.

## RPC Functions (super_admin gated)

| RPC | Phase | Purpose |
|-----|-------|---------|
| `god_mode_search_selections` | 1 ✅ | Search/filter selections |
| `god_mode_get_selection_details` | 1 ✅ | Get full details for one selection |
| `god_mode_log_action` | 2 ✅ | Internal helper: write to `god_mode_log` |
| `god_mode_update_selection` | 2 ✅ | Update selection fields with diff logging |
| `god_mode_update_bespoke_campaign` | 2 ✅ | Update bespoke campaign details with diff logging |
| `god_mode_force_status` | 3 ✅ | Force status transition with `god_mode` flag in history |
| `god_mode_update_notification_payloads` | 3 ✅ | Patch payloads for one or more notification stages |
| `god_mode_recreate_notification` | 3 ✅ | Recreate missing notification with full payload + targets |
| `god_mode_force_mark_read` | 3 ✅ | Mark notifications as read for all targets |
| `god_mode_log_resend` | 3 ✅ | Internal: log a resend action (paired with Express call) |
| `god_mode_reassign_practice` | 4 ✅ | Move selection (and bespoke ownership) to a different practice; rebuild notification targets |
| `god_mode_delete_selection` | 4 ✅ | Permanent delete with explicit cleanup; full snapshot in audit log |
| `god_mode_archive_selection` | 4 ✅ | Snapshot to archived_selections, then delete |
| `god_mode_list_practices` | 4 ✅ | Helper: list all practices for the reassign picker |
| `god_mode_replace_notification_payload` | 4 ✅ | Replace a single notification's full payload from the JSON editor in the Notification Payloads tab |
