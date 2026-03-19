# Cron Jobs

Cron jobs are scheduled via **[cron-job.org](https://cron-job.org)** (not Vercel cron). They hit the Express server endpoints.

## Authentication

All cron endpoints require the header:
```
Authorization: Bearer <CRON_SECRET>
```

The `CRON_SECRET` is stored in `server/.env`.

## Activate Live Campaigns

**Endpoint:** `/activate-live-campaigns`
**Schedule:** Daily at 8:00 AM UK time
**What it does:**

1. Gets today's date in UK timezone
2. **Activates:** Finds selections where `status = 'confirmed'` AND `from_date = today` → updates to `live`
3. **Completes:** Finds selections where `status = 'live'` AND `to_date < today` → updates to `completed`
4. Logs transitions in `selection_status_history`

**No notifications or emails** are sent for these transitions.

### How to Check It's Running

1. Go to [cron-job.org](https://cron-job.org) and check the job history
2. Look at `selection_status_history` for recent entries with `actor_user_id = '00000000-0000-0000-0000-000000000000'` (the cron job's "user")

### How to Run It Manually

```bash
curl -X POST https://qplanner-server.vercel.app/activate-live-campaigns \
  -H "Authorization: Bearer <CRON_SECRET>"
```

Or via the browser/Postman with the same URL and header.

## Process Onboarding Emails

**Endpoint:** `/process-onboarding-emails`
**Schedule:** Daily
**What it does:**

1. Checks the `practice_onboarding_emails` table for queued welcome emails
2. Sends each queued email via Resend
3. Marks them as sent

## cron-job.org Configuration

| Job | URL | Schedule | Method |
|-----|-----|----------|--------|
| Activate Live Campaigns | `https://qplanner-server.vercel.app/activate-live-campaigns` | 08:00 UK daily | POST |
| Process Onboarding Emails | `https://qplanner-server.vercel.app/process-onboarding-emails` | Daily | POST |

Both jobs have the `Authorization: Bearer <CRON_SECRET>` header configured.

::: tip
The Express server handles both `/endpoint` and `/api/endpoint` paths for cron endpoints. External callers should use the path **without** the `/api/` prefix.
:::
