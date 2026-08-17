-- =====================================================================
-- Event form revamp — Phase 0.1
-- Dedicated, data-driven deliverables catalog for the NEW event brief form.
-- Separate from `assets` (legacy) and `bespoke_deliverables` (campaigns).
--
-- Three channels: print (quantity), digital (tick), direct_comms (tick).
-- input_mode drives the form control; `disclaimer` shows inline (paid social).
--
-- Apply to STAGING first, verify, then PROD. Idempotent.
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.event_deliverables (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel     text NOT NULL CHECK (channel IN ('print', 'digital', 'direct_comms')),
  grp         text NOT NULL,
  name        text NOT NULL,
  input_mode  text NOT NULL DEFAULT 'tick' CHECK (input_mode IN ('quantity', 'tick')),
  disclaimer  text,
  sort_order  int  NOT NULL DEFAULT 0,
  active      boolean NOT NULL DEFAULT true,
  UNIQUE (channel, grp, name)
);

COMMENT ON TABLE public.event_deliverables IS
  'Deliverables catalog for the event brief form (revamp 2026-08). print=quantity, digital/direct_comms=tick. disclaimer shows inline (e.g. paid social spend).';

ALTER TABLE public.event_deliverables ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS event_deliverables_select_auth ON public.event_deliverables;
CREATE POLICY event_deliverables_select_auth ON public.event_deliverables
  FOR SELECT TO authenticated
  USING (active);

-- ---------------------------------------------------------------------
-- Seed
-- ---------------------------------------------------------------------
INSERT INTO public.event_deliverables (channel, grp, name, input_mode, disclaimer, sort_order) VALUES
  -- PRINT (quantity)
  ('print', 'Posters', 'A0', 'quantity', NULL, 10),
  ('print', 'Posters', 'A1', 'quantity', NULL, 11),
  ('print', 'Posters', 'A2', 'quantity', NULL, 12),
  ('print', 'Posters', 'A3', 'quantity', NULL, 13),
  ('print', 'Strut Cards', 'A4', 'quantity', NULL, 20),
  ('print', 'Strut Cards', 'A5', 'quantity', NULL, 21),
  -- DIGITAL (tick)
  ('digital', 'Social Media', 'Organic', 'tick', NULL, 30),
  ('digital', 'Social Media', 'Paid', 'tick',
     'Paid social costs around £150. By ticking this box you confirm you are happy with the spend and set-up. The campaign runs for 1 month in the lead-up to the event.', 31),
  ('digital', 'IPTV', 'Landscape', 'tick', NULL, 40),
  ('digital', 'IPTV', 'Portrait', 'tick', NULL, 41),
  -- DIRECT COMMUNICATIONS (tick)
  ('direct_comms', 'Direct Communications', 'Email (2 weeks before the event)', 'tick', NULL, 50),
  ('direct_comms', 'Direct Communications', 'Email (5 days before the event)', 'tick', NULL, 51),
  ('direct_comms', 'Direct Communications', 'SMS (1 day before the event)', 'tick', NULL, 52),
  ('direct_comms', 'Direct Communications', 'A6 Postal Invite with envelopes (to be sent 2-3 weeks before the event)', 'tick', NULL, 53)
ON CONFLICT (channel, grp, name) DO UPDATE
  SET input_mode = EXCLUDED.input_mode,
      disclaimer = EXCLUDED.disclaimer,
      sort_order = EXCLUDED.sort_order,
      active = true;

-- ---------------------------------------------------------------------
-- Read RPC — active catalog as an ordered jsonb array; client groups it.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_event_deliverables()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(jsonb_agg(
           jsonb_build_object(
             'id', id, 'channel', channel, 'group', grp, 'name', name,
             'input_mode', input_mode, 'disclaimer', disclaimer
           )
           ORDER BY sort_order, name
         ), '[]'::jsonb)
  FROM public.event_deliverables
  WHERE active;
$$;

GRANT EXECUTE ON FUNCTION public.get_event_deliverables() TO authenticated;
