# Bug Reports

An in-app bug tracker for the admin team. Any admin (role `admin` or `super_admin`) can file a bug with attachments; a ticket is emailed to the digital team inbox on creation and tracked on the page until it's closed.

Route: **`/admin/bug-reports`** (sidebar → System → Bug Reports). Visible to all admins.

## Filing a bug

1. Click **Report a Bug**.
2. Fill in a **title**, pick a **severity** (Low / Medium / High / Critical), and write a **description** (what happened, expected behaviour, steps to reproduce).
3. Optionally drag in **attachments** — screenshots, screen recordings, logs, or any file up to **200 MB** each.
4. Submit. The files upload to a private Supabase Storage bucket, the ticket is created, and an email is sent to the digital team inbox.

## The ticket tracker

- A **filter** (Open / Closed / All) and counter tiles (Total / Open / Closed) sit above the table.
- Each row shows severity, title (+ attachment count), status, reporter, and created date.
- Click a row (or **View**) to open the detail drawer: full description, attachment previews (images and video play inline; other files download), and the close/reopen controls.

### Closing / reopening / deleting

- **Close** a ticket from the drawer with an optional resolution note (what was the fix). It records who closed it and when.
- **Reopen** a closed ticket if it turns out it wasn't fixed — this clears the resolution note and closed metadata.
- **Delete** a ticket from the drawer (inline confirm). This removes the row *and* its storage attachments — irreversible.

### Attachment size limit

The bucket accepts up to **200 MB per file**, but this is capped by the project-wide **Upload file size limit** (Supabase Dashboard → Project Settings → Storage). That global limit defaults to 50 MB — raise it to ≥ 200 MB on **both** staging and prod, otherwise large uploads (e.g. `.mov` screen recordings) fail with a size error.

## Storage & privacy

Attachments live in a **private** `bug-attachments` bucket. They are never publicly reachable:

- The detail drawer mints short-lived (1-hour) signed URLs on demand for previews.
- The notification email embeds longer-lived (30-day) signed URLs. If those expire, open the ticket in the planner for fresh links.

Storage RLS restricts upload / read / delete on the bucket to admins (`public.is_admin()`).

## Where the email goes

New-bug emails go to the digital team inbox, **`digital@hakimgroup.co.uk`**. The recipient is controlled solely by the dedicated **`BUG_REPORT_EMAIL`** env var (falling back to `digital@hakimgroup.co.uk` when unset). It is deliberately **independent of `TEST_EMAIL_OVERRIDE`** — the general staging email redirect never diverts bug reports.

Because of that independence, **`BUG_REPORT_EMAIL` must be set to a test inbox on staging** (and on any local dev server), otherwise staging/local test bugs would reach the real digital team. On prod, set it to `digital@hakimgroup.co.uk` (or leave it unset to use the built-in default).

## Data model

```sql
CREATE TABLE bug_reports (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title           text NOT NULL,
  description     text NOT NULL,
  severity        text NOT NULL DEFAULT 'medium',   -- low | medium | high | critical
  status          text NOT NULL DEFAULT 'open',     -- open | closed
  attachments     jsonb NOT NULL DEFAULT '[]',       -- [{ path, name, type, size }]
  created_by      uuid REFERENCES allowed_users(id),
  created_at      timestamptz NOT NULL DEFAULT now(),
  closed_by       uuid REFERENCES allowed_users(id),
  closed_at       timestamptz,
  resolution_note text
);
```

## RPCs

| RPC | Purpose |
| --- | --- |
| `create_bug_report(title, description, severity, attachments)` | Insert a ticket (admin-gated). |
| `list_bug_reports(status)` | List tickets (open first), joined with reporter/closer names. `status` NULL returns all. |
| `close_bug_report(id, resolution_note)` | Mark closed, record closer + note. |
| `reopen_bug_report(id)` | Reopen a closed ticket, clear closed metadata. |
| `delete_bug_report(id)` | Delete the ticket row (admin-gated). Storage attachments are removed client-side first. |

## Files

| Layer | Files |
| --- | --- |
| SQL | `supabase_bug_reports.sql` (bucket + storage RLS + table + RLS + 4 RPCs) |
| Server | `server/api/index.ts` (`/send-bug-report-email`) + `server/emails/BugReportEmail.tsx` |
| Client hooks/models | `hooks/bugReport.hooks.ts`, `models/bug.models.ts` |
| Client UI | `pages/admin/adminPages/bugReports/` — `BugReports.tsx`, `BugReportFormModal.tsx`, `BugReportsTable.tsx`, `BugReportDetailDrawer.tsx` |
