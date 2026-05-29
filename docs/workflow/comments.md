# Comments

Practices and admins can hold a threaded conversation against each selection — to discuss feedback, approvals, questions, or anything else without leaving the planner.

## Where the conversation lives

- **Drawer thread** — every selection past `draft` shows a "Conversation" section inside the selection drawer (`View.tsx`). Posts, edits, and deletes happen here.
- **Chat icon in the topbar** — `CommentBell` sits next to the notification bell. Unread count appears as a violet badge. Clicking it opens the latest 10 inbox preview rows; clicking any row deep-links to a drawer focused on that conversation.

Comments are **flat** — there are no replies to individual posts. The audience routes by side: a practice user's comment notifies the admin side; an admin's comment notifies the practice's user-members.

## Permissions

| Role | Can post | Can edit | Can delete |
| --- | --- | --- | --- |
| Practice user (member of the selection's practice) | yes | own only | own only |
| Admin / Super admin | on any selection | own only | own only |

Status gate: comments are **not** allowed on `draft` selections (the practice hasn't submitted, so there's nothing to discuss). Every other status (`onPlan`, `requested`, `inProgress`, `awaitingApproval`, `confirmed`, `live`, `completed`) accepts comments — including `completed`, so past-campaign Q&A is still possible.

Body limit: **2000 characters** per comment, enforced by both the client composer and the SQL constraint.

## Channel separation from workflow notifications

Comments are **deliberately** not written to the `notifications` / `notification_targets` tables. They live in their own pair (`selection_comments` + `comment_targets`) so chat chatter doesn't drown the workflow bell. The dedicated chat icon surfaces them.

## Schema

```sql
CREATE TABLE selection_comments (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  selection_id    uuid NOT NULL REFERENCES selections(id) ON DELETE CASCADE,
  author_user_id  uuid NOT NULL REFERENCES allowed_users(id) ON DELETE SET NULL,
  body            text NOT NULL,                 -- length 1..2000
  edited_at       timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE comment_targets (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id  uuid NOT NULL REFERENCES selection_comments(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES allowed_users(id) ON DELETE CASCADE,
  practice_id uuid REFERENCES practices(id) ON DELETE CASCADE,
  read_at     timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (comment_id, user_id)
);
```

Cascade on `selection_comments → comment_targets` means deleting a comment wipes everyone's unread target row — no orphans, no stale badge counts.

## RPCs

| RPC | Purpose |
| --- | --- |
| `add_selection_comment(selection_id, body)` | Insert, fan out targets to the counterpart audience, return `{comment_id, targets_count, author_role}` |
| `edit_selection_comment(comment_id, body)` | Author only. Sets `edited_at = now()`. No re-notify. |
| `delete_selection_comment(comment_id)` | Author only. Hard delete (cascade removes targets). |
| `list_selection_comments(selection_id)` | Returns the full thread ordered ASC with author display fields. |
| `list_my_comment_inbox(limit)` | Caller's latest N targeted comments joined with selection + campaign context. Drives the bell dropdown. |
| `mark_comment_read(comment_id)` | Sets `read_at` on the caller's target row only. Idempotent. |
| `mark_all_comments_read()` | Bulk version for the "Mark all read" link. |
| `unread_comment_count()` | Single int — drives the badge. |

All RPCs are `SECURITY DEFINER` with access checks inside. Direct table writes are blocked by RLS.

## Audience routing

Inside `add_selection_comment`:

| Author role | Targets created |
| --- | --- |
| `admin` / `super_admin` | All `practice_members` of the selection's practice whose role is `user` |
| `user` | All `practice_members` of the selection's practice whose role is `admin` + all `allowed_users` whose role is `super_admin` |

The author themselves is always excluded — you don't get notified about your own comment.

## Email

Every comment fires both an in-app target row and an email. The Express server route `/send-comment-email` pulls the recipient list from `comment_targets`, renders `CommentAddedEmail`, and ships via Resend. Admin-side recipients honour the existing `email_notifications_enabled` opt-out flag; practice users always receive (matches the workflow email policy).

Email body shows the author name + role, campaign + practice context, the comment body in a quote-style block, and a CTA that deep-links to `/notifications-center?selectionId=<id>&focus=comments`.

## Deep-linking from the bell

Clicking a row in `CommentBell` does three things:

1. Calls `mark_comment_read(comment_id)` (optimistic UI clears the violet dot).
2. Closes the dropdown.
3. Navigates to `/notifications-center?selectionId=<id>&focus=comments`.

`CommentDeepLinkDrawer` (mounted at the App root) watches the URL, opens a focused drawer with the campaign header + `CommentsSection`, and strips the query so refresh/back don't reopen it.

## Polling

- `unread_comment_count` and `list_my_comment_inbox` are stale after 15 seconds, refetch on window focus, and the count also polls every 30 seconds.
- No realtime subscriptions in v1. Cross-user updates appear on focus or after the next poll tick.

## Files touched

| Layer | Files |
| --- | --- |
| SQL | `supabase_selection_comments.sql` (two tables + RLS + 8 RPCs) |
| Server | `server/api/index.ts` (new `/send-comment-email` route) + `server/emails/CommentAddedEmail.tsx` |
| Client enums/models | `shared/shared.models.ts`, `models/comment.models.ts` |
| Client hooks | `hooks/comment.hooks.ts` |
| Client UI | `components/comments/CommentsSection.tsx`, `components/comments/CommentBell.tsx`, `components/comments/CommentDeepLinkDrawer.tsx`, `components/nav/Nav.tsx` (mount), `components/campaignSelector/View.tsx` (mount), `App.tsx` (mount the deep-link drawer) |

## Open follow-ups

- Realtime updates via Supabase channels — switch from polling to live `INSERT` subscriptions on `comment_targets` filtered to `user_id = me`.
- Mark-as-read on scroll (rather than only on click) for inline drawer reads.
- `@mention` support — would route notifications outside the default counterpart audience.
- File attachments / image uploads.
