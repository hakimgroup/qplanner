# Practices of Interest

::: warning Super Admin Only
Practices of Interest (POI) is restricted to **super_admin** users (typically marketing execs). Regular `admin` users never see the toggle, the management page, or the star column.
:::

POI lets a super-admin maintain a personal saved list of practices they manage. A global toggle in the admin sidebar — "All practices" vs "Mine" — switches between viewing every practice and only the ones on the user's POI list. The list is per-user and persists across sessions.

## What POI mode does (hard scope)

When a super-admin flips the sidebar toggle to **Mine**:

- **Plans** (`/admin/plans`) — query auto-scopes to POI practice IDs when no specific practices are picked; practice filter dropdown only lists POI practices.
- **Notifications** (`/admin/notifications`) — same; non-POI rows are dropped from the table.
- **Email Health** (`/admin/email-health`) — log rows for non-POI practices are filtered out.
- **God Mode** (`/admin/god-mode`) — search RPC is invoked with `p_practice_ids` set to the POI list, so server-side results are scoped.
- **Notification bell + `/notifications-center`** — `list_notifications` is invoked with `p_practice_ids` set to the POI list.

This is a **hard scope** — non-POI practices are invisible everywhere except the practices directory (see below).

## What POI mode doesn't affect

- **`/admin/practices`** (the practices directory) — always shows every practice. This is the one exception so admins can always discover practices to star, and the star column itself wouldn't make sense if rows were filtered.
- **`/admin/campaigns`** (the catalog) — no per-practice scope to apply.
- **`/admin/people-and-access`** — user management is global.
- **Practice-side surfaces** — practice users are never affected; POI is admin-only.

## Empty state

If the user toggles to Mine but their list is empty, each affected screen shows a violet/blue gradient card with a star icon and a "Manage Practices of Interest" CTA. The toggle does NOT auto-revert to "All" — it's deliberate, the user has to either add practices or flip the toggle back themselves.

## Persistence

The chosen view mode is stored in `localStorage` under the key `poi.viewMode`. It persists across reloads on the same device. The POI list itself lives in the `practices_of_interest` table in Supabase, so it follows the user across browsers.

## Adding and removing practices

Two surfaces support managing the list:

### Dedicated page — `/admin/practices-of-interest`

- MultiSelect at the top with search-as-you-type — pick a practice to add, click the chip's × to remove.
- "My Practices" card below shows each entry with name + address + "Added {date}" badge and an explicit Remove button.
- Empty state when the list is empty.

### Star column on `/admin/practices`

- A yellow star column is pinned to the left of the practices directory table (super-admins only).
- Filled yellow star = starred / on your POI list. Outline gray star = not on your list.
- Click the icon to toggle. The toggle calls the same RPCs as the dedicated page.
- Default sort puts starred practices at the top.

## Data model

```sql
CREATE TABLE practices_of_interest (
  user_id     uuid REFERENCES allowed_users(id) ON DELETE CASCADE,
  practice_id uuid REFERENCES practices(id)     ON DELETE CASCADE,
  added_at    timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, practice_id)
);
```

Many-to-many: a practice can be on many super-admins' lists; a super-admin has many POI practices. RLS limits each user to managing only their own rows.

## RPC functions

| RPC | Purpose |
| --- | --- |
| `list_practices_of_interest()` | Returns the caller's POI list, joined with practice details (name, address, post_code, added_at). |
| `add_practice_of_interest(p_practice_id)` | Idempotent. Adds the practice to the caller's POI list. Gated to super_admin. |
| `remove_practice_of_interest(p_practice_id)` | Removes the practice from the caller's POI list. Gated to super_admin. |

Downstream RPCs that gained an array-of-practices parameter to support POI scoping:

| RPC | New parameter |
| --- | --- |
| `get_plans` | `p_practice_ids uuid[]` (already existed) |
| `list_notifications` | `p_practice_ids uuid[]` (added) |
| `god_mode_search_selections` | `p_practice_ids uuid[]` (added) |

## Client architecture

- **`PracticesOfInterestProvider`** wraps the admin tree. Exposes `poi`, `poiPracticeIds`, `poiPracticeIdSet`, `viewMode`, `setViewMode`, `addPractice`, `removePractice`, `isEnabled` (true only for super_admins).
- **`useScopedPractices()`** helper hook returns `{ practices, isPoiActive, isPoiEmpty }` — admin screens use it instead of `usePractice().practices` to get the auto-filtered list.
- **`<PoiEmptyState />`** shared component for the empty-list CTA.

## Operational notes

- The POI list is invisible to non-super-admin users by design.
- If a user loses super_admin role while in POI mode, the provider auto-resets `viewMode` to "all" so they're not stuck with a stale filter.
- If a practice on someone's POI is deleted, the foreign key cascade removes the POI row automatically (no orphans).
