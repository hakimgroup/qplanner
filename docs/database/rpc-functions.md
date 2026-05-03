# RPC Functions

All data access in QPlanner goes through Supabase RPC functions. These are PostgreSQL functions called from the client via `supabase.rpc()`.

## User & Auth

| Function                                   | Purpose                                   |
| ------------------------------------------ | ----------------------------------------- |
| `link_current_user`                        | Links auth user to `allowed_users` on login |
| `is_admin`                                 | Returns true if current user is admin     |
| `is_super_admin`                           | Returns true if current user is super admin |
| `user_current_role`                        | Returns the current user's role           |
| `get_users`                                | Fetch all users with practice info        |
| `update_user`                              | Update user details                       |
| `bulk_upsert_allowed_users_with_practices` | Bulk import users with practice assignments |

## Practices

| Function                      | Purpose                           |
| ----------------------------- | --------------------------------- |
| `assign_user_to_practice`     | Add user to a practice            |
| `unassign_user_from_practice` | Remove user from a practice       |
| `copy_practice_campaigns_v2`  | Clone campaign selections between practices. Catalog rows with a chosen creative go to `inProgress` (with notification); bespoke rows always go to `inProgress`; catalog rows without a chosen creative go to `onPlan`. |
| `copy_practice_campaigns`     | Legacy v1 — clones at `onPlan`. Retained for backward compatibility. |

## Campaigns & Selections

| Function                    | Purpose                                         |
| --------------------------- | ----------------------------------------------- |
| `get_campaigns`             | Fetch catalog campaigns with filters            |
| `get_guided_campaigns`      | AI-guided campaign recommendations              |
| `get_plans`                 | Fetch selections with filters (main admin query) |
| `add_campaign_with_assets`  | Add a single catalog campaign at `inProgress` with chosen creative + configured assets. Used by the practice's drawer "Continue → Submit" flow. |
| `create_bespoke_selection_v2` | Create a bespoke campaign + selection at `inProgress`. Auto-applies default brand creative when `p_chosen_creative` is null. |
| `create_bespoke_event_v2`   | Create a bespoke event + selection at `inProgress`. Auto-applies default brand creative when `p_chosen_creative` is null. |
| `submit_draft_selection`    | Transitions an existing selection from `draft` → `inProgress`. Practice supplies chosen creative + configured assets via `SubmitChoicesModal`. Creates the standard `inProgress` admin notification. |
| `add_campaigns_bulk`        | Bulk insert selections. Now used in the drafts model — Quick Populate / Guided Recommendations call this with `p_status='draft'`. |
| `delete_selection`          | Remove a selection                               |
| `create_bespoke_selection`  | Legacy v1 — creates at `onPlan`. Retained for backward compatibility. |
| `create_bespoke_event`      | Legacy v1 — creates at `onPlan`. Retained for backward compatibility. |

## Asset Workflow

| Function              | Purpose                                     |
| --------------------- | ------------------------------------------- |
| `get_assets`          | Fetch asset definitions                     |
| `confirm_assets`      | Practice confirms/approves artwork          |
| `request_revision`    | Practice requests changes (sends feedback)  |
| `request_assets`      | Legacy admin gate — fires for pre-cutover selections still in `onPlan` |
| `request_assets_bulk` | Legacy admin gate (bulk variant) — same caveat as above |
| `submit_assets`       | Legacy — practice submits choices for a `requested` selection. New selections collect choices at add-time so this rarely fires. |

## Notifications

| Function                          | Purpose                          |
| --------------------------------- | -------------------------------- |
| `list_notifications`              | Fetch notifications with filters |
| `mark_notification_read`          | Mark single notification as read |
| `queue_practice_onboarding_email` | Queue a welcome email            |

## Helper Functions

| Function                    | Purpose                                           |
| --------------------------- | ------------------------------------------------- |
| `is_member_of(practice_id)` | Check if current user is a member of a practice   |
| `assets_requested_subset`   | Extract only the requested assets from a full asset object |
