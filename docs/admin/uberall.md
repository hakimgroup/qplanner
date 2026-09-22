# Uberall Integration

The Planner is the **source of truth** for which Uberall business listings each user can access. It creates and maintains an Uberall user account for every Planner user, keeps each user's accessible Uberall **Locations** in sync with their practice access, and lets a user open Uberall from the Planner with no separate login.

Users never see or manage their Uberall credentials — the Planner handles everything behind the scenes.

## Core concepts

| Planner | Uberall |
| --- | --- |
| A **practice** | a **Location** (the "Hakim Group" business holds all ~570 Locations) |
| A **user's practice access** (`practice_members`) | the set of Locations that user can manage (`managedLocations`) |
| `practices.uberall_business_id` | the human-entered Location **identifier** |
| `practices.uberall_location_id` | the resolved numeric Location **id** (what the API needs) |
| `allowed_users.uberall_user_id` | the user's numeric Uberall id |

A practice is only included if it has a resolved `uberall_location_id` — practices without one are silently skipped.

::: warning Access is per-Location, not per-listing
A user scoped to a Location sees **all** of that Location's directory listings (Google, Facebook, etc.). You cannot grant "the Google listing but not the Facebook listing."
:::

## How it works

Everything runs **server-side** (Express). The Uberall account private key lives only in `server/.env` (`UBERALL_API_KEY`) and never reaches the browser. The Planner ↔ Uberall user mapping is keyed on **email** (so it survives the login-time `allowed_users.id` rewrite).

### 1. Provisioning

When a user is added to the Planner, an Uberall account is created for them (`POST /uberall/provision-user`, idempotent):

- Role `LOCATION_MANAGER`, `status=CREATED` (no invite email), scoped to their current Locations.
- If a user **already exists** in Uberall (e.g. a staff member with a prior account), the Planner **adopts** it — it links the mapping but **never overwrites** their existing role/scope.
- Existing users are backfilled via the `/uberall/backfill` endpoint (dry-run by default).

### 2. Access sync

A user's Locations always track their current practice access — **adds and removes**:

- **Instant** — a trigger on `practice_members` fires `/uberall/sync-user` whenever access changes (covers every assign/unassign/update path).
- **On open** — opening Uberall re-syncs the user's scope first, so the dashboard always reflects current access.
- **Daily reconcile** — the safety net (see below).

The Planner only manages the scope of accounts it **created**. Adopted (pre-existing) accounts are never re-scoped.

### 3. Opening Uberall

The **Open Uberall** button (in the nav, all users) calls `/uberall/sso`: the server verifies the user's session, refreshes their scope, mints a short-lived Uberall login token, and opens the dashboard already authenticated. Super-admins can open another user's Uberall for support.

Gated by the `VITE_UBERALL_ENABLED` build flag.

### 4. Deprovisioning

When a user is deleted in the Planner, a trigger on `allowed_users` deactivates their Uberall account (`status=INACTIVE`, reversible). Only accounts the Planner created are deactivated — adopted accounts are left alone.

## Uberall Health page

**Admin → Uberall Health** (super-admin only) shows:

- **Counters** — users (total / linked / created / adopted / failed / unprovisioned) and practices/sync activity (resolved / unresolved / synced / skipped / failed).
- **Run reconcile** — a dry-run toggle + button. The reconcile provisions missing users, retries failures, and fixes scope drift (this is what guarantees removals land even for users who never open Uberall).
- **Unresolved practices** — practices whose stored Uberall identifier doesn't match any Location; a data-cleanup list for the team.
- **Recent activity** — the `uberall_sync_log` audit trail.

## Data model

- `allowed_users.uberall_user_id`, `uberall_provision_status` (`created` / `adopted` / `adopted_admin` / `failed`), `uberall_synced_at`.
- `practices.uberall_business_id` (human identifier) + `practices.uberall_location_id` (resolved numeric id).
- `uberall_sync_log` — every provision / sync / deprovision / sso attempt (super-admin read).

## Configuration

Server (`server/.env`, and both Vercel server projects):

```
UBERALL_BASE_URL=https://uberall.com/api
UBERALL_API_KEY=<account private key>
UBERALL_PUBLIC_KEY=<account public key>
```

Client (Vercel, per environment):

```
VITE_UBERALL_ENABLED=true
```

The daily reconcile is scheduled on cron-job.org: `GET /reconcile-uberall` with `Authorization: Bearer <CRON_SECRET>` (same pattern as the other crons).

::: tip Environment isolation
Staging points at the same Uberall account but is constrained to test Locations, and the sync/deprovision triggers post to the environment's own server URL — swap the URL and the `CRON_SECRET` placeholder when applying the trigger SQL to production.
:::

## Known limitations & decisions

- **Adopted accounts are not scope-managed.** Users who already had an Uberall account (e.g. admins) are linked but their access is left untouched, to avoid wiping manually-curated Locations. Whether the Planner should take those over is a product decision.
- **Seat allowance.** Uberall enforces a per-contract user-seat cap; confirm it covers the full user base before a bulk backfill.
- **Unresolved identifiers.** Practices whose stored identifier doesn't resolve to a Location are skipped and surfaced on the Health page for cleanup.
- **Sandbox has no directory connectivity**, so end-to-end listing behaviour is only fully verifiable in production.
