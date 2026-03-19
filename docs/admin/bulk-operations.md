# Bulk Operations

## Bulk Request Assets

Send asset requests to multiple practices at once. Available from **Admin** → **Plans**.

### How To
1. Go to **Admin** → **Plans**
2. Select multiple rows using the checkboxes
3. Click **Bulk Request Assets** in the toolbar
4. The system calls `request_assets_bulk` which processes each selection

### What Gets Sent
- For **catalog campaigns**: creatives from `campaigns_catalog.creatives` and assets from the catalog template
- For **bespoke campaigns**: the default creative (`Bespoke - {title}`) from `bespoke_campaigns.creatives`

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
4. Confirm — all `onPlan` selections from the source are cloned to the current practice

### RPC
`copy_practice_campaigns`
