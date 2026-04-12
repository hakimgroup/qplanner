# Notification Types

## Workflow Notifications

| Type                 | Audience   | Created By             | Description                          |
| -------------------- | ---------- | ---------------------- | ------------------------------------ |
| `requested`          | `practice` | `request_assets` RPC   | Admin has requested assets           |
| `inProgress`         | `admins`   | `submit_assets` RPC    | Practice submitted their choices     |
| `awaitingApproval`   | `practice` | DB trigger (pg_net)    | Artwork is ready for review          |
| `confirmed`          | `admins`   | `confirm_assets` RPC   | Practice confirmed the artwork       |
| `feedbackRequested`  | `admins`   | `request_revision` RPC | Practice requested changes           |

## Actor Notifications (CRUD)

| Type                  | Audience   | Description                           |
| --------------------- | ---------- | ------------------------------------- |
| `campaignAdded`       | `practice` | Catalog campaign assigned to practice |
| `campaignUpdated`     | `practice` | Campaign details updated              |
| `campaignDeleted`     | `practice` | Campaign removed from plan            |
| `bespokeAdded`        | `practice` | Bespoke campaign created              |
| `bespokeEventAdded`   | `practice` | Bespoke event created                 |

## Notification Payload

All workflow notifications include these standard fields:

| Key               | Description                                              |
| ----------------- | -------------------------------------------------------- |
| `name`            | Campaign name                                            |
| `category`        | Campaign category (Campaign / Event)                     |
| `from_date`       | Selection start date                                     |
| `to_date`         | Selection end date                                       |
| `is_bespoke`      | Boolean — true for bespoke campaigns                     |
| `campaign_id`     | Catalog campaign ID or bespoke campaign ID               |
| `assets`          | Selected assets object                                   |
| `creatives`       | Array of creative options                                |
| `chosen_creative` | URL of the creative chosen by the practice               |
| `chosen_creative_label` | Display label/name of the chosen creative (resolved from the creatives array at write time) |
| `note`            | Step-specific note from the actor                        |
| `markup_link`     | Link to markup/proofing file (from `awaitingApproval` onwards) |
| `assets_link`     | Link to assets folder (from the chosen creative or selection) |
| `reference_links` | Bespoke reference links                                  |
| `original_notes`  | Practice's notes from campaign creation                  |
| `requirements`    | Event requirements (events only)                         |
