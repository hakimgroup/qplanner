# Email Templates

Emails are sent via **Resend** using **React Email** templates. The Express server handles all email sending.

## Workflow Emails

| Notification Type   | Email Template           | Sent To   | Trigger                         |
| ------------------- | ------------------------ | --------- | ------------------------------- |
| `requested`         | `AssetsRequestedEmail`   | Practice  | Admin requests assets           |
| `inProgress`        | `AssetsSubmittedEmail`   | Admins    | Practice submits choices        |
| `awaitingApproval`  | `AwaitingApprovalEmail`  | Practice  | n8n completes artwork (via pg_net) |
| `confirmed`         | `AssetsConfirmedEmail`   | Admins    | Practice confirms artwork       |
| `feedbackRequested` | `FeedbackRequestedEmail` | Admins    | Practice requests revision      |

## Actor Emails (CRUD)

These are sent when campaigns are added/updated/deleted:

| Action              | Template               |
| ------------------- | ---------------------- |
| Campaign added      | `CampaignAddedEmail`   |
| Bespoke added       | `CampaignAddedEmail`   |
| Bespoke event added | `CampaignAddedEmail`   |

## Other Emails

| Endpoint                         | Template / Purpose              |
| -------------------------------- | ------------------------------- |
| `/process-onboarding-emails`     | Welcome email for new practices |
| `/send-planner-overview-emails`  | Periodic overview summary       |

## Express Server Endpoints

| Endpoint                             | Purpose                          |
| ------------------------------------ | -------------------------------- |
| `POST /send-notification-email`      | Send a single workflow email     |
| `POST /send-bulk-notification-email` | Send consolidated bulk emails    |
| `POST /send-actor-email`             | Send CRUD confirmation emails    |
| `POST /send-planner-overview-emails` | Send periodic overview emails    |
| `POST /process-onboarding-emails`    | Process queued welcome emails    |

## Email Template Location

All templates are in `server/emails/`:
```
server/emails/
├── AssetsRequestedEmail.tsx
├── AssetsSubmittedEmail.tsx
├── AwaitingApprovalEmail.tsx
├── AssetsConfirmedEmail.tsx
├── FeedbackRequestedEmail.tsx
├── CampaignAddedEmail.tsx
└── ...
```

## From Address

All emails are sent from: `Team@planner.hakimgroup.io`

## Test Email Override

For testing, set `TEST_EMAIL_OVERRIDE` in `server/.env` to redirect **all** emails to a single address. Remove or comment out this variable for production.

## Troubleshooting Email Delivery

1. **Check Resend dashboard** — [resend.com/emails](https://resend.com/emails) shows all sent emails with delivery status
2. **Check `notification_emails_log`** — The database table logs every email attempt
3. **Check pg_net responses** — For `awaitingApproval` emails triggered by the DB trigger, check `net._http_response` in Supabase
