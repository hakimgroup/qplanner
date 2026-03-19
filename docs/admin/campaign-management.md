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
4. Changes affect the **template** — existing selections that have already progressed past `onPlan` keep their snapshot of assets/creatives

### How to Set Creatives on a Campaign

Creatives are the artwork options that practices choose from. Each creative has:
- **Name** — Display label (e.g., "Modern Professional")
- **Image URL** — Link to the artwork image
- **Assets Link** — Optional link to the assets folder for this creative
- **Custom Question** — Optional question to ask the practice (e.g., "What colour frame do you prefer?")

To set creatives:
1. Open the campaign in the admin panel
2. Or use the **Request Assets** action on a selection — creatives set here are sent directly to the practice

### How to Assign Campaigns to Practices

#### Individual
1. Go to the practice dashboard or admin plans view
2. Browse campaigns and add them to the practice's plan

#### Bulk
1. Use the **Copy Practice Campaigns** feature to clone one practice's selections to another
2. Or use `add_campaigns_bulk` RPC for programmatic bulk assignment

## Bespoke Campaigns

Bespoke campaigns are created by practices for their specific needs. See [Bespoke Campaigns](../workflow/bespoke-campaigns) for full details.

### Key Differences from Catalog

| Aspect | Catalog | Bespoke |
|--------|---------|---------|
| Created by | Admin | Practice |
| Stored in | `campaigns_catalog` | `bespoke_campaigns` |
| Available to | All practices | Single practice |
| Default creative | Set by admin | Auto-generated (`Bespoke - {title}`) |
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
