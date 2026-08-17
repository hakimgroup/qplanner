-- =====================================================================
-- Bespoke form revamp — Phase 0.1
-- Dedicated, data-driven deliverables catalog for the NEW bespoke brief
-- form. Kept SEPARATE from the shared `assets` table so the (not-yet-
-- revamped) Event form is unaffected.
--
-- Taxonomy from "Bespoke Campaign Brief 2" doc. New items ship
-- quantity-only (price NULL / options []); only the two leaflet items
-- carry over their existing print-run pricing. Admin-editable later.
--
-- Apply to STAGING first, verify, then PROD. Idempotent.
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.bespoke_deliverables (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel     text NOT NULL CHECK (channel IN ('print', 'digital')),
  grp         text NOT NULL,                 -- Posters / Strut Cards / Stationery / Leaflets / Social Media / IPTV / Recall Communication Update
  name        text NOT NULL,                 -- A0 / A5 Double Sided / Landscape ...
  price       numeric,                       -- NULL = quantity-only
  options     jsonb NOT NULL DEFAULT '[]'::jsonb,   -- [{label,value}] print-run pricing
  sort_order  int  NOT NULL DEFAULT 0,
  active      boolean NOT NULL DEFAULT true,
  UNIQUE (channel, grp, name)
);

COMMENT ON TABLE public.bespoke_deliverables IS
  'Deliverables catalog for the bespoke brief form (revamp 2026-08). Separate from public.assets (which still feeds the legacy Event form). price NULL = quantity-only.';

ALTER TABLE public.bespoke_deliverables ENABLE ROW LEVEL SECURITY;

-- Any authenticated user (practices included) may read the active catalog.
DROP POLICY IF EXISTS bespoke_deliverables_select_auth ON public.bespoke_deliverables;
CREATE POLICY bespoke_deliverables_select_auth ON public.bespoke_deliverables
  FOR SELECT TO authenticated
  USING (active);

-- ---------------------------------------------------------------------
-- Seed (idempotent: unique (channel,grp,name) + ON CONFLICT refresh)
-- ---------------------------------------------------------------------
INSERT INTO public.bespoke_deliverables (channel, grp, name, price, options, sort_order) VALUES
  -- PRINT · Posters
  ('print', 'Posters', 'A0', NULL, '[]', 10),
  ('print', 'Posters', 'A1', NULL, '[]', 11),
  ('print', 'Posters', 'A2', NULL, '[]', 12),
  ('print', 'Posters', 'A3', NULL, '[]', 13),
  ('print', 'Posters', 'A4', NULL, '[]', 14),
  -- PRINT · Strut Cards
  ('print', 'Strut Cards', 'A4', NULL, '[]', 20),
  ('print', 'Strut Cards', 'A5', NULL, '[]', 21),
  -- PRINT · Stationery Files
  ('print', 'Stationery Files', 'Business Cards (85mm x 55mm)', NULL, '[]', 30),
  ('print', 'Stationery Files', 'Folded Business Cards', NULL, '[]', 31),
  ('print', 'Stationery Files', 'Letterhead', NULL, '[]', 32),
  ('print', 'Stationery Files', 'Compliment Slips', NULL, '[]', 33),
  ('print', 'Stationery Files', 'Appointment Cards', NULL, '[]', 34),
  ('print', 'Stationery Files', 'Prescription Wallet', NULL, '[]', 35),
  -- PRINT · Leaflets  (A5 D/S + DL carry existing print-run pricing)
  ('print', 'Leaflets', 'A5 Single Sided', NULL, '[]', 40),
  ('print', 'Leaflets', 'A5 Double Sided', NULL,
     '[{"label":"500","value":38.95},{"label":"1000","value":46.22}]', 41),
  ('print', 'Leaflets', 'Z-Fold', NULL, '[]', 42),
  ('print', 'Leaflets', 'C-Fold', NULL, '[]', 43),
  ('print', 'Leaflets', 'DL', NULL,
     '[{"label":"500","value":33.69},{"label":"1000","value":42.52}]', 44),
  -- DIGITAL
  ('digital', 'Social Media', 'Social Media', NULL, '[]', 50),
  ('digital', 'IPTV', 'Landscape', NULL, '[]', 60),
  ('digital', 'IPTV', 'Portrait', NULL, '[]', 61),
  ('digital', 'Recall Communication Update', 'Email', NULL, '[]', 70),
  ('digital', 'Recall Communication Update', 'Letter', NULL, '[]', 71)
ON CONFLICT (channel, grp, name) DO UPDATE
  SET price = EXCLUDED.price,
      options = EXCLUDED.options,
      sort_order = EXCLUDED.sort_order,
      active = true;

-- ---------------------------------------------------------------------
-- Read RPC — returns the active catalog as an ordered jsonb array.
-- Client groups by channel -> grp for rendering.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_bespoke_deliverables()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(jsonb_agg(
           jsonb_build_object(
             'id', id, 'channel', channel, 'group', grp,
             'name', name, 'price', price, 'options', options
           )
           ORDER BY channel DESC, sort_order, name   -- print before digital
         ), '[]'::jsonb)
  FROM public.bespoke_deliverables
  WHERE active;
$$;

GRANT EXECUTE ON FUNCTION public.get_bespoke_deliverables() TO authenticated;
