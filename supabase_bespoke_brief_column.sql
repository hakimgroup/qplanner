-- =====================================================================
-- Bespoke form revamp — Phase 0.2
-- Structured brief blob on bespoke_campaigns. Holds the new narrative
-- fields + uploaded file references + "other deliverable" free text.
--
-- Deliverable *selections with quantities* stay in `assets` (unchanged
-- shape, so get_plans keeps rendering them). `notes` stays the
-- "Additional Notes" home. `description` keeps a composed, human-readable
-- version of the brief for back-compat with existing surfaces.
--
-- Shape:
-- {
--   "purpose","audience","audience_notes",
--   "offers_cta","look_and_feel","what_to_avoid",
--   "has_content": bool, "content_files":[{name,url}],
--   "has_imagery": bool, "imagery_files":[{name,url}],
--   "has_examples": bool,"example_files":[{name,url}],
--   "other_deliverable": text
-- }
--
-- Apply to STAGING first, verify, then PROD. Idempotent.
-- =====================================================================

ALTER TABLE public.bespoke_campaigns
  ADD COLUMN IF NOT EXISTS brief jsonb NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.bespoke_campaigns.brief IS
  'Structured bespoke brief (revamp 2026-08): narrative fields + uploaded file refs + other-deliverable text. Mirrored into notifications.payload.brief for Trello/n8n.';
