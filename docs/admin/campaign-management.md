# Campaign Management

## Catalog Campaigns

Catalog campaigns are the pre-built marketing campaigns available to all practices (e.g., "Summer Sale 2026"). They live in the `campaigns_catalog` table.

### How to Add a Catalog Campaign

1. Go to **Admin** → **Campaigns**
2. Click **Add Campaign**
3. Fill in: name, description, category, tier, objectives, topics
4. Optionally add creatives (artwork options) and assets (printed/digital)
5. Save

### How to Edit a Catalog Campaign

1. Go to **Admin** → **Campaigns**
2. Click the edit icon on the campaign row
3. Make changes and save
4. Changes affect the **template** — existing selections keep their own snapshot of assets/creatives, captured at the moment the practice added the campaign.

### How to Set Creatives on a Campaign

Creatives are the artwork options that practices choose from at the moment they add the campaign. Each creative has:
- **Name** — Display label (e.g., "Modern Professional")
- **Image URL** — Link to the artwork image
- **Assets Link** — Optional link to the assets folder for this creative
- **Custom Question** — Optional question to ask the practice (e.g., "What colour frame do you prefer?")

To set creatives, open the campaign in the admin panel and edit the creatives list. Catalog rows with no creatives still work — practices will see an alert that the design team will produce one for them, and selection goes to `inProgress` without a `chosen_creative` URL.

::: tip "Request Assets" is now a legacy gate
Since the May 2026 cutover, practices pick creatives and assets at the moment they add a campaign, so admins generally don't need to send "Request Assets" anymore. The action is still available for any pre-cutover selections that started life at `onPlan` and need an admin to push them forward.
:::

### How to Assign Campaigns to Practices

#### Individual
1. Practice browses the catalog and adds a campaign — they pick a creative + asset choices in the same step.
2. Selection lands at `inProgress` immediately. Admins are notified and a Trello card is created.

#### Bulk
1. Practice uses **Quick Populate** (tier-based) or **Guided Recommendations** — system creates selections as `draft`. Practice configures and submits each one when ready via "Send to Design Team".
2. Or use the **Copy Practice Campaigns** feature from the Calendar view (rows with a chosen creative on source go straight to `inProgress`; rows without go to `draft`).

## Bespoke Campaigns

Bespoke campaigns are created by practices for their specific needs. See [Bespoke Campaigns](../workflow/bespoke-campaigns) for full details.

### Key Differences from Catalog

| Aspect | Catalog | Bespoke |
|--------|---------|---------|
| Created by | Admin | Practice |
| Stored in | `campaigns_catalog` | `bespoke_campaigns` |
| Available to | All practices | Single practice |
| Default creative | Set by admin (per catalog row) | Hakim brand creative auto-applied at submit; design team follows up with options |
| Tier | Good/Better/Best | None |

## Campaign Categories

Campaigns are categorised as either:
- **Campaign** — Standard marketing campaigns
- **Event** — Event-specific campaigns (bespoke only)

## Tiers

Catalog campaigns have tiers that determine the level of assets available:
- **Good** — Basic asset set
- **Better** — Extended asset set
- **Best** — Full asset set
