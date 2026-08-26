/**
 * Route stub for Outside Prescriptions, always on.
 *
 * The page itself lives in `_uypp-q4/pages/outside-prescriptions.tsx`, with the rest of the Q4
 * landing site — components, hooks, data and styles — in `_uypp-q4/`. This file
 * exists only so the route is registered: `registry.ts` discovers pages with
 * `import.meta.glob("./pages/*.tsx")`, a single-level glob, so a file nested in a
 * subfolder would never become a URL.
 *
 * Keeping the quarter in one folder means it can be reviewed, updated or retired
 * as a unit without touching Q3 or the shared registry.
 */
export { default, meta } from "./_uypp-q4/pages/outside-prescriptions";
