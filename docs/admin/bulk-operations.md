# Bulk Operations

## Practice-side bulk add (Quick Populate / Guided)

Practices can populate their plan with multiple campaigns at once via:
- **Quick Populate** — choose a tier (Good / Better / Best); the system adds the tier's curated campaign list.
- **Guided Recommendations** — answer a short questionnaire; the system recommends a campaign mix.

### Behaviour
Both surfaces call `add_campaigns_bulk` with `p_status='draft'`. Selections land in the practice's plan as drafts — **no admin notification, no email, no Trello card**. The practice then opens each draft individually, configures it (creative + asset choices) via `SubmitChoicesModal`, and clicks "Send to Design Team" to transition the selection to `inProgress`.

This separates planning from production: a tier batch of 10 draft selections doesn't generate any noise until the practice deliberately submits them.

### Email behaviour
- One `bulk_added` actor email goes to the practice on the bulk add itself.
- No admin emails fire on draft creation. Each subsequent draft submission fires the standard `inProgress` admin notification + email at the practice's pace.

### Visibility
Drafts are practice-only. The admin `get_plans` view filters them out — admins start seeing the selection only once the practice submits it (`inProgress`).

## Bulk Request Assets (legacy admin gate)

::: warning Legacy
This is the pre-cutover admin gate, retained for any selections still in `onPlan` status. New selections never enter `onPlan`, so this action is rarely needed going forward.
:::

Send asset requests to multiple practices at once. Available from **Admin** → **Plans**.

### How To
1. Go to **Admin** → **Plans**
2. Select multiple rows using the checkboxes
3. Click **Bulk Request Assets** in the toolbar
4. The system calls `request_assets_bulk` which processes each selection

### What Gets Sent
- For **catalog campaigns**: creatives from `campaigns_catalog.creatives` and assets from the catalog template
- For **bespoke campaigns**: the default creative from `bespoke_campaigns.creatives`

### What Gets Skipped
- Selections not in `onPlan` status
- Selections with no creatives configured
- Selections where the practice has no members with role `user` (no one to receive the notification)

### Results
The RPC returns a summary:
- `success` — number of requests sent
- `failed` — number of failures
- `results` — details per selection (ok or skipped with reason)
- `errors` — details of any errors

## Bulk User Upload

Import users via CSV from **Admin** → **People & Access**.

### CSV Format
```
email,first_name,last_name,role,practice_id
john@example.com,John,Smith,user,<practice-uuid>
```

### Behaviour
- Existing users are updated (upsert)
- Practice assignments are created automatically
- Uses `bulk_upsert_allowed_users_with_practices` RPC

## Bulk Practice Upload

Import practices via CSV from **Admin** → **Practices**.

### CSV Format
Refer to the upload modal for the expected columns (name, address, phone, email, buddy, etc.)

## Copy Practice Campaigns

Clone one practice's campaign selections to another. Available from the **Calendar view** on the practice dashboard.

### How To
1. Switch to the **Selections** tab → **Calendar** view
2. Click **Copy Practice Campaigns**
3. Select the source practice
4. Confirm

### Behaviour (post-cutover)
The hook calls `copy_practice_campaigns_v2`. Per source row:

- **Catalog campaigns** with a chosen creative on source → cloned at `inProgress` with the creative + asset choices preserved. An `inProgress` admin notification is created.
- **Catalog campaigns** without a chosen creative on source → cloned at `draft`. Practice configures and clicks "Send to Design Team" to advance.
- **Bespoke campaigns** → always cloned at `inProgress` with the default brand creative auto-applied.

### Email behaviour
The actor `campaigns_copied` email goes to the practice. **No** per-campaign admin email is fired for the cloned `inProgress` notifications (same trade-off as Quick Populate — would storm inboxes). Admins discover via the in-app bell.

### RPC
`copy_practice_campaigns_v2` (current). `copy_practice_campaigns` v1 is retained but unused by the client.
