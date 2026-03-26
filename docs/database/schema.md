# Database Schema

The database is hosted on **Supabase** (PostgreSQL). Access it via the [Supabase Dashboard](https://supabase.com/dashboard/project/ehcqfyyctzmggfyhsbyc).

## Core Tables

### User & Access

| Table              | Purpose                                   | Key Columns                                                                    |
| ------------------ | ----------------------------------------- | ------------------------------------------------------------------------------ |
| `allowed_users`    | Whitelist of users who can access the app | `email` (PK), `id`, `role` (user/admin/super_admin), `first_name`, `last_name` |
| `practices`        | Optical practices/stores                  | `id`, `name`, `address`, `phone`, `email`, `buddy`                             |
| `practice_members` | Links users to practices                  | `practice_id` + `email` (composite PK), `user_id`, `role`                      |

### Campaigns

| Table                 | Purpose                            | Key Columns                                                                                   |
| --------------------- | ---------------------------------- | --------------------------------------------------------------------------------------------- |
| `campaigns_catalog`   | Master campaign templates          | `id`, `name`, `description`, `objectives`, `topics`, `assets`, `creatives`, `tiers`, `category` |
| `bespoke_campaigns`   | Custom practice-specific campaigns | `id`, `practice_id`, `name`, `event_type`, `requirements`, `creatives`, `reference_links`      |
| `selections`          | Practice's selected campaigns      | `id`, `practice_id`, `campaign_id`, `bespoke_campaign_id`, `from_date`, `to_date`, `status`, `assets`, `bespoke`, `markup_link`, `assets_link` |
| `archived_selections` | Historical/archived selections     | Same structure as `selections`                                                                  |

### Notifications

| Table                      | Purpose                            | Key Columns                                                                                                                 |
| -------------------------- | ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `notifications`            | Notification events                | `id`, `type`, `selection_id`, `practice_id`, `actor_user_id`, `audience` ('admins'/'practice'), `payload` (JSONB)           |
| `notification_targets`     | Per-user delivery/read state       | `id`, `notification_id`, `user_id`, `read_at`                                                                                |
| `notification_emails_log`  | Audit log of emails sent           | Various tracking fields                                                                                                     |
| `selection_status_history` | Audit trail for status transitions | `selection_id`, `from_status`, `to_status`, `actor_user_id`, `note`, `message`, `recipient`, `practice`                     |

### System

| Table                        | Purpose                                   |
| ---------------------------- | ----------------------------------------- |
| `assets`                     | Asset type definitions (printed, digital) |
| `practice_onboarding_emails` | Tracks first-time welcome emails          |
| `n8n_job_queue`              | Webhook job queue for n8n automation      |
| `n8n_processing_log`         | Processing audit log                      |

## Important JSONB Structures

### Creatives (`campaigns_catalog.creatives` / `bespoke_campaigns.creatives`)

```json
[
  {
    "url": "https://image-url.jpg",
    "label": "Modern Professional",
    "assets_link": "https://link-to-assets-folder",
    "question": "What colour frame do you prefer?"
  }
]
```

### Assets (`selections.assets`)

```json
{
  "printedAssets": [
    {
      "name": "A4 Poster",
      "price": 25,
      "quantity": 2,
      "suffix": "per unit",
      "type": "default",
      "userSelected": true
    }
  ],
  "digitalAssets": [...],
  "externalPlacements": [...],
  "creative": "https://chosen-creative-url.jpg",
  "note": "Practice's note about their choices"
}
```

### Notification Payload (`notifications.payload`)

```json
{
  "name": "Campaign Name",
  "category": "Campaign",
  "from_date": "2026-03-01",
  "to_date": "2026-06-30",
  "is_bespoke": false,
  "campaign_id": "uuid",
  "assets": { ... },
  "creatives": [ ... ],
  "chosen_creative": "https://...",
  "markup_link": "https://...",
  "assets_link": "https://...",
  "note": "Step-specific note",
  "reference_links": [ ... ],
  "original_notes": "Practice's creation notes",
  "requirements": "Event requirements text"
}
```

## Database Constraints

### `notifications.audience`
- Valid values: `'admins'` or `'practice'`
- **NOT** `'admin'` (singular) — this will fail the CHECK constraint

### `notifications.campaign_id`
- Foreign key to `campaigns_catalog(id)`
- Must be `NULL` for bespoke campaigns (bespoke IDs are in a different table)

### `allowed_users.id`
- Must match `auth.users.id` for the same email — the `link_current_user` RPC syncs this on login
- Referenced by `practice_members`, `notification_targets`, `notification_emails_log`, `practice_onboarding_emails` — all with `ON UPDATE CASCADE`
- If bulk-importing users, the ID will be a placeholder until the user first logs in

### `allowed_users.role`
- Valid values: `'user'`, `'admin'`, `'super_admin'`
