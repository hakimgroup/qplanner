-- Marketing print costs — October 2026 update.
-- Source: PO spreadsheet "marketing-costs_planner_oct26.xlsx" (prices ex. VAT).
--
-- Patches the standard printed items, matched by name, in:
--   1. public.assets ("Printed Assets" row)       — template for new campaigns
--   2. public.campaigns_catalog.assets.printedAssets — every catalog campaign
--      (draft/onPlan selections read these live via get_plans)
--   3. public.bespoke_deliverables (leaflet print runs) — bespoke form pricing
--
-- Only price-related keys change; each campaign's curation flags
-- (userSelected / adminRequested / quantity) and item order are preserved.
-- Submitted selections keep the prices they were ordered at.
-- Idempotent: safe to re-run.

BEGIN;

CREATE TEMP TABLE _cost_patch (
  match_names text[] NOT NULL,
  patch       jsonb  NOT NULL,          -- merged over the existing item
  drop_keys   text[] NOT NULL DEFAULT '{}'
) ON COMMIT DROP;

INSERT INTO _cost_patch (match_names, patch, drop_keys) VALUES
  ('{"A0 Poster"}', '{"price": 30.5}', '{}'),
  ('{"A1 Poster"}', '{"price": 21}',   '{}'),
  ('{"A2 Poster"}', '{"price": 16.5}', '{}'),
  ('{"A3 Poster"}', '{"price": 16.5}', '{}'),
  ('{"A4 Poster"}', '{"price": 16.5}', '{}'),
  ('{"A4 Strut Card"}', '{"options": [{"label": "MOQ 5", "value": 19.5}]}', '{}'),
  ('{"A5 Strut Card"}', '{"options": [{"label": "MOQ 5", "value": 15}]}',   '{}'),
  ('{"A5 Leaflet (double sided, silk, 170gsm)"}',
   '{"options": [{"label": "100", "value": 25}, {"label": "250", "value": 30}, {"label": "500", "value": 40.5}]}', '{}'),
  -- DL leaflet stock moves to 200gsm, so the name (which carries the spec) is updated too.
  ('{"DL Leaflet (double sided, silk, 170gsm)", "DL Leaflet (double sided, silk, 200gsm)"}',
   '{"name": "DL Leaflet (double sided, silk, 200gsm)", "options": [{"label": "100", "value": 22.5}, {"label": "250", "value": 26}, {"label": "500", "value": 35}]}', '{}'),
  ('{"Business Cards"}',
   '{"options": [{"label": "100", "value": 16}, {"label": "250", "value": 20}, {"label": "500", "value": 25}]}', '{}'),
  ('{"Postcards"}',
   '{"options": [{"label": "100", "value": 25}, {"label": "250", "value": 34}, {"label": "500", "value": 52}]}', '{}'),
  -- Roller banner: single £75 estimate -> three priced styles (per unit).
  -- The old "midrange estimate" note no longer applies, so it is dropped.
  ('{"Roller Banner"}',
   '{"type": "card", "price": null, "options": [{"label": "Standard", "value": 36}, {"label": "Premium", "value": 84}, {"label": "Double-sided", "value": 108}]}',
   '{"note"}');

CREATE FUNCTION pg_temp.apply_cost_patch(items jsonb) RETURNS jsonb
LANGUAGE sql STABLE AS $$
  SELECT COALESCE(
           jsonb_agg(
             CASE WHEN p.patch IS NULL THEN t.e
                  ELSE (t.e - p.drop_keys) || p.patch END
             ORDER BY t.ord),
           '[]'::jsonb)
  FROM jsonb_array_elements(items) WITH ORDINALITY AS t(e, ord)
  LEFT JOIN _cost_patch p ON (t.e->>'name') = ANY (p.match_names)
$$;

-- 1. Asset template
UPDATE public.assets
SET content = pg_temp.apply_cost_patch(content)
WHERE type = 'Printed Assets'
  AND content IS DISTINCT FROM pg_temp.apply_cost_patch(content);

-- 2. Catalog campaigns
UPDATE public.campaigns_catalog
SET assets = jsonb_set(assets, '{printedAssets}', pg_temp.apply_cost_patch(assets->'printedAssets'))
WHERE jsonb_typeof(assets->'printedAssets') = 'array'
  AND assets->'printedAssets' IS DISTINCT FROM pg_temp.apply_cost_patch(assets->'printedAssets');

-- 3. Bespoke form leaflet print runs
UPDATE public.bespoke_deliverables
SET options = '[{"label": "100", "value": 25}, {"label": "250", "value": 30}, {"label": "500", "value": 40.5}]'
WHERE channel = 'print' AND grp = 'Leaflets' AND name = 'A5 Double Sided';

UPDATE public.bespoke_deliverables
SET options = '[{"label": "100", "value": 22.5}, {"label": "250", "value": 26}, {"label": "500", "value": 35}]'
WHERE channel = 'print' AND grp = 'Leaflets' AND name = 'DL';

COMMIT;

-- Verify: one row per distinct item definition across the template + catalog.
SELECT a->>'name' AS name, a->>'type' AS type, a->>'price' AS price,
       a->'options' AS options, a ? 'note' AS has_note, count(*) AS n
FROM (
  SELECT jsonb_array_elements(content) AS a FROM public.assets WHERE type = 'Printed Assets'
  UNION ALL
  SELECT jsonb_array_elements(assets->'printedAssets') FROM public.campaigns_catalog
  WHERE jsonb_typeof(assets->'printedAssets') = 'array'
) x
WHERE a->>'name' ~ '^(A[0-4] Poster|A[45] Strut Card|A5 Leaflet|DL Leaflet|Business Cards|Postcards|Roller Banner)'
GROUP BY 1, 2, 3, 4, 5
ORDER BY 1;

SELECT grp, name, options FROM public.bespoke_deliverables WHERE options <> '[]' ORDER BY sort_order;
