# Notification System

## How Notifications Work

Notifications are the core communication mechanism between admins and practices. Every status transition in the campaign workflow creates a notification.

### Flow

1. **Created** — An RPC function (or DB trigger) inserts a row into `notifications` with a `type`, `audience`, and `payload`
2. **Targeted** — `notification_targets` rows are created for each user who should see it (based on audience: admins or practice members)
3. **Displayed** — The client fetches notifications via `list_notifications` RPC and shows them in the notification bell and Notifications Center
4. **Actioned** — Clicking a notification opens the appropriate modal (determined by `useNotificationOpen.hook.tsx`)
5. **Emailed** — The Express server sends an email using the appropriate React Email template
6. **Read** — When a user opens a notification, `mark_notification_read` sets `read_at` on their `notification_targets` row (creates the row if it doesn't exist via upsert)

### Visibility for New Practice Members

Notifications are visible to **all current members** of a practice, not just the users who existed when the notification was sent. The `list_notifications` RPC for practice users queries by `practice_members` membership rather than `notification_targets` rows. This means:

- A user added to a practice **after** notifications were sent will still see all existing notifications for that practice
- Those notifications will appear as **unread** (since the new user has no `notification_targets` row yet)
- When the user opens a notification, `mark_notification_read` creates the `notification_targets` row automatically

### Audience

| Value      | Who Sees It                    |
| ---------- | ------------------------------ |
| `practice` | Practice users (role: `user`)  |
| `admins`   | All admin and super_admin users |

::: warning
The audience value must be exactly `'admins'` or `'practice'` — not `'admin'` (singular). There is a CHECK constraint on the column.
:::

## Notification Modals

When a user clicks a notification, the `useNotificationOpen` hook determines which modal to show:

| Notification Type     | User Role | Modal Component              |
| --------------------- | --------- | ---------------------------- |
| `requested`           | Practice  | `PracticeRespondModal`       |
| `inProgress`          | Admin     | `AdminReviewSubmissionModal` |
| `awaitingApproval`    | Practice  | `PracticeApprovalModal`      |
| `confirmed`           | Admin     | `AdminConfirmedModal`        |
| `feedbackRequested`   | Admin     | `AdminFeedbackModal`         |
| Actor types (CRUD)    | Any       | `ActorNotificationModal`     |

### Staleness Check

For `requested` and `awaitingApproval` notifications, the hook checks if the selection's **current status** still matches the notification type. If the status has changed (e.g., someone else already confirmed), a "stale notification" modal is shown instead.

## Tables

| Table                     | Purpose                                |
| ------------------------- | -------------------------------------- |
| `notifications`           | The notification event itself          |
| `notification_targets`    | Per-user delivery and read tracking    |
| `notification_emails_log` | Audit log of all emails sent           |
