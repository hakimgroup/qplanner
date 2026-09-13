/**
 * Route stub for the Festive Focus Toolkit.
 *
 * The page itself lives in `_uypp-q4/pages/festive-toolkit.tsx`, with the rest of
 * the toolkit — components, data and the shared shell — in `_uypp-q4/`, which it
 * shares with the Q4 campaign pages. This file exists only so the route is
 * registered: `registry.ts` discovers pages with
 * `import.meta.glob("./pages/*.tsx")`, a single-level glob, so a file nested in a
 * subfolder would never become a URL.
 */
export { default, meta } from "./_uypp-q4/pages/festive-toolkit";
