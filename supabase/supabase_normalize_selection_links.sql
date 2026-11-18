-- Normalise selections.markup_link / assets_link on write.
--
-- Designers sometimes paste links without a scheme ("figma.com/design/...")
-- into Trello, and n8n copies them into selections as-is. Browsers treat an
-- href without a scheme as a path on our own site, so "View Markup" sent users
-- to planner.hakimgroup.co.uk/figma.com/... (Nov 2026 incident).
--
-- This BEFORE trigger fixes the value before the row is stored, whoever
-- writes it (n8n, God Mode, Studio). AFTER triggers such as
-- trg_selections_awaiting_approval read the stored row, so notification
-- payloads and emails get the corrected link too.
--
-- Rules (mirrors toExternalUrl() in the client and server):
--   NULL / blank           -> unchanged
--   already has a scheme   -> trimmed only (https:, http:, mailto:, file: ...)
--   starts with //         -> https: prefixed
--   anything else          -> https:// prefixed
-- A link that is valid but wrong (e.g. file:///C:/Users/...) can't be fixed
-- here and is left as-is. Rejecting it would also fail n8n's status update.
--
-- Schema change: apply to STAGING first, then PROD. Idempotent.

CREATE OR REPLACE FUNCTION public.normalize_external_url(p text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN p IS NULL OR btrim(p) = '' THEN p
    WHEN btrim(p) ~* '^[a-z][a-z0-9+.-]*:' THEN btrim(p)
    WHEN btrim(p) LIKE '//%' THEN 'https:' || btrim(p)
    ELSE 'https://' || btrim(p)
  END
$$;

CREATE OR REPLACE FUNCTION public.selections_normalize_links()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.markup_link := public.normalize_external_url(NEW.markup_link);
  NEW.assets_link := public.normalize_external_url(NEW.assets_link);
  RETURN NEW;
END
$$;

DROP TRIGGER IF EXISTS trg_selections_normalize_links ON public.selections;
CREATE TRIGGER trg_selections_normalize_links
  BEFORE INSERT OR UPDATE OF markup_link, assets_link ON public.selections
  FOR EACH ROW
  EXECUTE FUNCTION public.selections_normalize_links();
