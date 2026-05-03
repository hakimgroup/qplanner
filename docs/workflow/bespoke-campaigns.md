# Bespoke Campaigns & Events

Practices can create custom campaigns and events that aren't in the catalog.

## Types

| Type | Category | Description |
|------|----------|-------------|
| Bespoke Campaign | `Campaign` | Custom marketing campaign with flexible objectives and topics |
| Bespoke Event | `Event` | Event-specific campaign with event type and requirements fields |

## Creation Flow

1. Practice opens the "Bespoke Campaign" or "Bespoke Event" modal from the dashboard
2. **Step 1 — Brief**: title, description, dates (must be 30+ days in the future), objectives, topics, the asset names they want, reference links, notes. Events also collect: event type and requirements.
3. Click **Continue** → opens the shared **Submit Choices** modal showing only the assets the practice picked, pre-selected with quantity 1, alongside a read-only preview of the default brand creative.
4. **Step 2 — Configure**: practice tweaks quantities and pricing options for each chosen asset, optionally adds a final note, and submits.
5. On submit, two records are created:
   - `bespoke_campaigns` row — the campaign template
   - `selections` row — practice instance with dates, configured assets, and status `inProgress`
6. The default brand creative URL is applied server-side (the v2 RPCs accept `null` for `p_chosen_creative` and substitute the constant).
7. An `inProgress` notification is created for admins; an actor confirmation notification is created for the practice.
8. If the practice is onboarded, an actor email is sent.

## Default Creative

All bespoke campaigns get a default creative applied server-side. The URL is hardcoded in `create_bespoke_selection_v2` / `create_bespoke_event_v2` and mirrored on the client at `client/src/shared/shared.const.ts` (`DEFAULT_BESPOKE_CREATIVE`). Keep both in sync if it ever changes.

- **Image URL:** `https://cdn.hakimgroup.io/digE8/LEquQaPE75.png/raw`
- **Label:** `Hakim Brand Creative` (client side) / `Bespoke - {Campaign Title}` (server side)
- **Behaviour:** Practice sees a read-only preview card in the submit modal that says the design team will be in touch with creative options to choose from.

## Status Workflow

Bespoke campaigns enter the lifecycle directly at `inProgress`, same as catalog campaigns added via the new flow:

```
inProgress → awaitingApproval → confirmed → live → completed
     ↕
feedbackRequested (revision loop)
```

See [Selection Lifecycle](./selection-lifecycle) for the full flow.

## Database Tables

- **`bespoke_campaigns`** — Stores the campaign template (name, description, category, objectives, topics, assets, creatives, reference_links, requirements, event_type)
- **`selections`** — Linked via `bespoke_campaign_id`, carries dates, status, and `bespoke = true`

## RPC Functions

| Function | Purpose |
|----------|---------|
| `create_bespoke_selection_v2` | Creates a bespoke campaign + selection at `inProgress` with chosen creative + configured assets |
| `create_bespoke_event_v2` | Creates a bespoke event + selection at `inProgress` |
| `create_bespoke_selection` | Legacy (pre-May 2026) — creates at `onPlan`. Retained for backward compatibility. |
| `create_bespoke_event` | Legacy (pre-May 2026) — creates at `onPlan`. Retained for backward compatibility. |

## Notification Payload

All workflow notifications for bespoke campaigns include:
- `is_bespoke: true`
- `reference_links` — from the bespoke campaign or selection
- `original_notes` — the practice's notes from creation
- `requirements` — event requirements (events only)
