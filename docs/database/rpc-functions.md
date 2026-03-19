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
| `copy_practice_campaigns`     | Clone campaign selections between practices |

## Campaigns & Selections

| Function                    | Purpose                                         |
| --------------------------- | ----------------------------------------------- |
| `get_campaigns`             | Fetch catalog campaigns with filters            |
| `get_guided_campaigns`      | AI-guided campaign recommendations              |
| `get_plans`                 | Fetch selections with filters (main admin query) |
| `add_campaigns_bulk`        | Bulk add selections to a practice               |
| `create_bespoke_selection`  | Create a custom campaign + selection             |
| `create_bespoke_event`      | Create a custom event + selection                |
| `delete_selection`          | Remove a selection                               |

## Asset Workflow

| Function              | Purpose                                     |
| --------------------- | ------------------------------------------- |
| `get_assets`          | Fetch asset definitions                     |
| `request_assets`      | Admin requests assets from practice (individual) |
| `request_assets_bulk` | Admin requests assets for multiple selections at once |
| `submit_assets`       | Practice submits chosen creative + assets   |
| `confirm_assets`      | Practice confirms/approves artwork          |
| `request_revision`    | Practice requests changes (sends feedback)  |

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
