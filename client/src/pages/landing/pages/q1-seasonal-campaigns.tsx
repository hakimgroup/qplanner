/**
 * Route stub for the seasonal Q1 campaigns.
 *
 * The page itself lives in `_uypp-q1/pages/q1-seasonal-campaigns.tsx`, with the rest of the Q1
 * 2027 Focus Toolkit — its config, data and pages — in `_uypp-q1/`. This file
 * exists only so the route is registered: `registry.ts` discovers pages with
 * `import.meta.glob("./pages/*.tsx")`, a single-level glob, so a file nested in a
 * subfolder would never become a URL.
 *
 * Q1 shares its components and stylesheets with Q4 and the Festive Focus Toolkit
 * (`_uypp-q4/`); only its content is its own.
 */
export { default, meta } from "./_uypp-q1/pages/q1-seasonal-campaigns";
