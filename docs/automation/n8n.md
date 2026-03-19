# n8n Integration

[n8n](https://n8n.io) is an external workflow automation tool that handles artwork processing — the step between a practice submitting their asset choices and the artwork being ready for review.

## How It Works

The design workflow uses a **Trello board** with columns representing each stage. When a practice submits their asset choices, a Trello card is created automatically for the design team. Designers produce the artwork and, when finished, move the card from the "In Progress" column to the "Awaiting Approval" column.

n8n watches for this Trello column change and then:

1. Picks up the card move event
2. Updates the selection in the database:
   - Sets `status` to `awaitingApproval`
   - Sets `markup_link` (link to proofing/markup file)
   - Sets `assets_link` (link to final assets folder)

## Database Tables

| Table              | Purpose                                            |
| ------------------ | -------------------------------------------------- |
| `n8n_job_queue`    | Queue of jobs for n8n to process                   |
| `n8n_processing_log` | Audit log of processed jobs                      |

## What Happens After n8n Updates

When n8n sets a selection's status to `awaitingApproval`, the database trigger `trg_selections_awaiting_approval` fires automatically and:

1. Creates a notification for the practice
2. Sends an email via pg_net → Express server
3. Logs the status transition

See [Triggers](../database/triggers) for full details.

## Troubleshooting

### Artwork stuck in "In Progress"

If a selection has been `inProgress` for too long:
1. Check `n8n_job_queue` — is there a pending job for this selection?
2. Check `n8n_processing_log` — was it processed but failed?
3. Check the n8n dashboard for workflow errors
4. If needed, manually update the selection status (see [Status Transitions](../workflow/status-transitions#how-to-manually-change-a-status))
