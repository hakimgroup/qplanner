# Bespoke Campaigns & Events

Practices can create custom campaigns and events that aren't in the catalog.

## Types

| Type | Category | Description |
|------|----------|-------------|
| Bespoke Campaign | `Campaign` | Custom marketing campaign with flexible objectives and topics |
| Bespoke Event | `Event` | Event-specific campaign with event type and requirements fields |

## Creation Flow

1. Practice opens the "Bespoke Campaign" or "Bespoke Event" modal from the dashboard
2. Fills in: title, description, dates (must be 30+ days in the future), objectives, topics, assets, reference links, notes
3. Events also collect: event type and requirements
4. On submit, two records are created:
   - `bespoke_campaigns` row — the campaign template
   - `selections` row — the practice's instance with dates and status (`onPlan`)
5. A **default creative** is automatically set: `Bespoke - {Campaign Title}` with a standard placeholder image
6. If the practice is onboarded, an actor notification email is sent

## Default Creative

All bespoke campaigns are created with a default creative:
- **Name:** `Bespoke - {Campaign Title}`
- **Image URL:** `https://cdn.hakimgroup.io/digE8/LEquQaPE75.png/raw`
- **Assets Link:** None
- **Custom Question:** None

This means admins can immediately use **bulk request assets** on bespoke campaigns without needing to manually set creatives first. Admins can still override the creative by opening the individual "Request Assets" modal.

## Status Workflow

Bespoke campaigns follow the **same status workflow** as catalog campaigns:

```
onPlan → requested → inProgress → awaitingApproval → confirmed → live → completed
```

See [Selection Lifecycle](./selection-lifecycle) for the full flow.

## Database Tables

- **`bespoke_campaigns`** — Stores the campaign template (name, description, category, objectives, topics, assets, creatives, reference_links, requirements, event_type)
- **`selections`** — Linked via `bespoke_campaign_id`, carries dates, status, and `bespoke = true`

## RPC Functions

| Function | Purpose |
|----------|---------|
| `create_bespoke_selection` | Creates a bespoke campaign + selection |
| `create_bespoke_event` | Creates a bespoke event + selection |

## Notification Payload

All workflow notifications for bespoke campaigns include:
- `is_bespoke: true`
- `reference_links` — from the bespoke campaign or selection
- `original_notes` — the practice's notes from creation
- `requirements` — event requirements (events only)
