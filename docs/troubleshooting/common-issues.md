# Common Issues

## Emails Not Being Sent

### Symptoms
- Practice doesn't receive notification email
- Admin doesn't receive confirmation email

### Diagnosis
1. **Check Resend dashboard** at [resend.com/emails](https://resend.com/emails) — shows all sent emails and their delivery status
2. **Check `notification_emails_log`** in Supabase — logs every email attempt from the Express server
3. **Check `TEST_EMAIL_OVERRIDE`** — if set in `server/.env`, all emails go to that address instead of real recipients

### For `awaitingApproval` Emails (triggered by DB)
These emails are triggered via pg_net (database HTTP call), not the client:
1. Check `net._http_response` table in Supabase for the HTTP response from the Express server
2. Verify the Express server is deployed and accessible at `https://qplanner-server.vercel.app`

## Notification Opens Wrong Modal

### Symptoms
- Clicking a notification shows "stale" instead of the expected modal

### Cause
The selection's current status doesn't match the notification type. This happens when:
- Another user already actioned the notification (e.g., confirmed the assets)
- The status was manually changed in the database

### Fix
This is expected behaviour — the stale modal is informational. No action needed.

## Campaign Status Shows "Available"

### Symptoms
- A campaign card shows "Available" instead of its actual status

### Cause
The `Status` component only recognises specific status values. If a selection has an unexpected status string, it falls back to "Available".

### Valid Statuses
`onPlan`, `requested`, `inProgress`, `awaitingApproval`, `confirmed`, `completed`, `live`

### Fix
Check the selection's status in the database and correct it if needed:
```sql
SELECT id, status FROM selections WHERE id = '<selection-id>';
```

## Bulk Request Skips Campaigns

### Symptoms
- Bulk request reports campaigns as "skipped"

### Possible Reasons
| Skip Reason | Meaning |
|-------------|---------|
| `skipped:not_onPlan` | Selection is not in `onPlan` status |
| `skipped:no_creatives` | No creatives configured on the campaign |
| `no_recipients` | No practice members with role `user` to receive the notification |

### Fix for `no_creatives`
- **Catalog campaigns:** Edit the campaign in Admin → Campaigns and add creatives
- **Bespoke campaigns:** Should have a default creative automatically. If missing, check `bespoke_campaigns.creatives` in the database

## User Can't See Notifications or Campaigns

### Symptoms
- User logs in but sees no notifications, no campaigns, or an empty planner
- User is assigned to practices but nothing shows up

### Cause
The user's `allowed_users.id` doesn't match their `auth.users.id` (Supabase Auth). This happens when users are bulk-imported with auto-generated UUIDs before they ever log in. The `link_current_user` RPC should sync these on login, but if it fails silently the mismatch persists.

All queries use `auth.uid()` to identify the current user, so if `practice_members.user_id` points to the old UUID, the user effectively has no practice memberships from the app's perspective.

### Diagnosis
```sql
-- Check for ID mismatch
SELECT au.id AS allowed_id, a.id AS auth_id, au.email
FROM allowed_users au
JOIN auth.users a ON LOWER(a.email) = LOWER(au.email)
WHERE au.id <> a.id;
```

### Fix
Sync the IDs. The `ON UPDATE CASCADE` FK constraints on `practice_members`, `notification_targets`, `notification_emails_log`, and `practice_onboarding_emails` will propagate the change automatically:

```sql
UPDATE allowed_users au
SET id = a.id
FROM auth.users a
WHERE LOWER(a.email) = LOWER(au.email)
  AND au.id <> a.id;
```

Ask the user to refresh the page after the fix.

## Practice Can't Log In

### Symptoms
- User sees "not authorized" or can't access the app after Microsoft login

### Diagnosis
1. Check `allowed_users` — is their email in the table?
2. Check the email matches exactly (case-sensitive)
3. Check `practice_members` — are they assigned to at least one practice?

### Fix
Add the user via Admin → People & Access, or insert directly into `allowed_users`.

## Cron Job Not Running

### Diagnosis
1. Check [cron-job.org](https://cron-job.org) job history
2. Check the Express server logs in Vercel dashboard
3. Test manually:
```bash
curl -X POST https://qplanner-server.vercel.app/activate-live-campaigns \
  -H "Authorization: Bearer <CRON_SECRET>"
```

### Common Causes
- cron-job.org subscription expired or job disabled
- `CRON_SECRET` mismatch between server env and cron-job.org header
- Express server deployment is broken
