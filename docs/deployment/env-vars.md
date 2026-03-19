# Environment Variables

::: danger
Never commit actual secret values to the repository or this documentation. The values below show the variable names and descriptions only.
:::

## Client (`client/.env`)

| Variable                   | Description                                      |
| -------------------------- | ------------------------------------------------ |
| `VITE_SUPABASE_URL`       | Supabase project URL                             |
| `VITE_SUPABASE_ANON_KEY`  | Supabase anonymous (public) API key              |
| `VITE_APP_BASE_URL`       | Client app URL (e.g., `https://planner.hakimgroup.co.uk`) |
| `VITE_EXPRESS_URL`        | Express server URL (e.g., `https://qplanner-server.vercel.app`) |
| `VITE_TEST_EMAIL_OVERRIDE`| (Optional) Redirect all client-triggered emails to this address |

## Server (`server/.env`)

| Variable                   | Description                                      |
| -------------------------- | ------------------------------------------------ |
| `PORT`                     | Express server port (default: `3100`)            |
| `FROM_EMAIL`              | Sender address for all emails                    |
| `RESEND_API_KEY`          | API key for Resend email service                 |
| `SUPABASE_URL`            | Supabase project URL                             |
| `SUPABASE_SERVICE_ROLE_KEY`| Supabase service role key (full DB access)      |
| `CRON_SECRET`             | Secret for authenticating cron job requests       |
| `APP_URL`                 | Client app URL (used in email templates for links)|
| `TEST_EMAIL_OVERRIDE`     | (Optional) Redirect **all** server emails to this address |

## Where to Find Values

- **Supabase keys:** Supabase Dashboard → Project Settings → API
- **Resend key:** [resend.com/api-keys](https://resend.com/api-keys)
- **Cron secret:** Generate any secure random string; must match cron-job.org header config

## Test Email Override

Both client and server support a `TEST_EMAIL_OVERRIDE` variable. When set:
- **All emails** are sent to this single address instead of the actual recipients
- Useful for testing email flows without spamming real users
- **Remove this variable in production**

## Vercel Environment Variables

The same variables are configured in the Vercel dashboard for each project:
1. Go to the Vercel project → Settings → Environment Variables
2. Add each variable for the appropriate environment (Production / Preview / Development)
