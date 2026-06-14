# Landing Pages — Author Guide

Marketing landing pages that live inside the planner. They sit behind the same Microsoft sign-in the rest of the app uses — anyone who can log into the planner can open any landing page URL.

## The loop in 30 seconds

1. Drop a `.tsx` file under `pages/` (this folder).
2. `npm run dev` from `client/` and open `http://localhost:5173/landing/<slug>`.
3. `git push`. Vercel rebuilds the planner and the new page is live at `https://planner.hakimgroup.co.uk/landing/<slug>`.
4. Paste the live URL into your campaign email CTA.

No routing config to edit. No build steps to wire. The file appearing in `pages/` is the deploy.

## File shape

Every landing page is a single `.tsx` file with two exports:

```tsx
// pages/spring-eyecare.tsx
import { LandingPageShell, Hero, Section, CTA, Card } from "../shell";
import type { LandingPageMeta } from "../registry";

export const meta: LandingPageMeta = {
  slug: "spring-eyecare",                    // MUST match the filename
  title: "Spring Eye-Care Push",
  description: "Two-week brand activation across all practices.",
  publishedAt: "2026-03-01",                 // optional, used for index ordering
};

export default function SpringEyecare() {
  return (
    <LandingPageShell title={meta.title}>
      <Hero
        eyebrow="Spring 2026"
        headline="Refreshed look, same trusted care."
        subheadline="A two-week practice activation with new POS and digital assets."
      />
      <Section title="What's included">
        <p>Bullet copy as plain JSX text.</p>
      </Section>
      <CTA href="/dashboard">Open my plan</CTA>
    </LandingPageShell>
  );
}
```

That's the whole pattern. The `slug` becomes the URL path, `title` sets the browser tab, and `description` shows on the `/landing` index card.

## Shell components

Import from `../shell`. The shell is a palette — use what you need, skip the rest.

### Structure

| Component | What it's for |
| --- | --- |
| `LandingPageShell` | Outer wrapper. Sets the page background, hides the planner nav, renders the HG logo + wordmark header, adds a back-to-planner button, sets the browser tab title. Every shell-based page wraps its content in this. |
| `Hero` | Big top section — `eyebrow` + `headline` + `subheadline` + optional `image` background. Goes immediately inside `LandingPageShell`. |
| `Section` | Body block with optional `eyebrow` / `title` / `subtitle` header, then any children. Use one per topic. |
| `CTA` | Primary call-to-action row near the bottom. Internal `/` hrefs route through React Router; external hrefs open in a new tab. Optional `secondary` button and `caption`. |

### Content blocks (drop these inside `Section` or directly between sections)

| Component | What it's for |
| --- | --- |
| `Card` | Info card — `title`, optional `icon`, `accent` colour. Drop a few into a Mantine `SimpleGrid`. |
| `Image` | Inline image block with optional `caption`. Defaults to rounded corners + soft shadow. Tune via `rounded`, `shadow`, `align`, `maxWidth`, `height`, `fit`. |
| `Split` | Image + text side-by-side. Pass `image` + `imageAlt`, set `imageSide` to `"left"` or `"right"` to alternate down the page. Collapses to single-column on mobile. |
| `Video` | Embed YouTube / Vimeo / direct `.mp4`. Pass any of these as `src` and it figures out the right embed shape. Optional `caption`, `aspectRatio`. |
| `Quote` | Pull-quote / testimonial. Children = the quote body, plus optional `attribution` + `role` + `avatar`. |
| `Stats` | Row of proof-point numbers — pass `items: [{ value, label, hint? }]`. Keep to 2–4 items. |

### Anything else is fair game

Inside `Section` (or any of the blocks that accept `children`), you can drop **any** Mantine or React component. Mantine `SimpleGrid`, `Accordion`, `Table`, `Badge`, `Timeline`, `List`, third-party libs — all work. The shell is just a sensible default, not a cage.

### When the shell doesn't fit

Drop it entirely and write whatever you want — see `pages/custom-example.tsx`. Mantine and React are fully available. Use this for microsites, takeover pages, or anything off-pattern.

## Naming

- Filename = slug. Use kebab-case: `summer-2026-launch.tsx`, not `Summer2026Launch.tsx`.
- The `meta.slug` field MUST match the filename. If they disagree the filename wins.
- The slug becomes the URL: `/landing/summer-2026-launch`.

## Linking back to the planner

Internal links via `<Link to="/dashboard">` (react-router) or by passing internal paths to `CTA`:

```tsx
<CTA href="/dashboard">Open my plan</CTA>
<CTA href="/notifications-center">See pending requests</CTA>
```

External links open in a new tab automatically:

```tsx
<CTA href="https://hakimgroup.co.uk" external>Visit our site</CTA>
```

## Thumbnails on the index card

The `/landing` index card automatically uses the **first image URL** it finds in your page source as the card thumbnail. It scans for `image="…"` (Hero/Split props), then `<Image src="…">`, then raw `<img src="…">`. Video URLs are ignored.

If no image is found, the card falls back to the brand gradient strip.

Override the auto-detection by setting `meta.thumbnail` explicitly:

```tsx
export const meta: LandingPageMeta = {
  slug: "winter-bundles",
  title: "Winter Bundles",
  description: "…",
  thumbnail: "/landing-assets/winter-thumb.jpg", // wins over auto-detection
};
```

## Images & media

For static assets owned by the planner, drop files in `client/public/landing-assets/` and reference them as `/landing-assets/<filename>`. They're served by Vercel directly from the planner deploy.

For external images, paste the URL straight into `src` — `<Image>`, `<Split>`, and `<Hero image>` all accept full URLs (CDNs, Unsplash, S3, anything).

For video, paste a YouTube watch URL (`https://youtu.be/...` or `https://youtube.com/watch?v=...`), a Vimeo URL (`https://vimeo.com/...`), or a direct `.mp4`/`.webm` link — `<Video>` converts to the right embed shape automatically.

```tsx
<Image src="/landing-assets/summer-hero.jpg" alt="..." caption="Last year's launch event." />
<Video src="https://youtu.be/dQw4w9WgXcQ" caption="Walkthrough of the planner workflow." />
```

## Asking Claude Code to build one

The shorter your prompt, the more Claude has to guess. The richer it is, the closer the first draft is to what you'd ship. Use the template below — keep what helps, delete what doesn't.

### The template

> **Goal.** Add a new landing page at `client/src/pages/landing/pages/<slug>.tsx` for **<campaign / topic>**.
>
> **Who reads it.** <e.g. "Practice managers who got our launch email" / "Optometrists at independent practices we're courting" / "Existing super-admins doing onboarding">. Tone: <warm + confident / playful / clinical>.
>
> **Outcome we want.** After reading, they should <e.g. "click through to /dashboard and add the campaign to their plan" / "book a 15-minute call" / "download the asset pack">.
>
> **Structure.**
>   1. `Hero` — eyebrow "<season / category>", headline "<one strong line>", subheadline "<one supporting line>".
>   2. `Stats` row — <e.g. "200+ practices", "3 campaigns", "12 weeks">.
>   3. `Split` (image left) — pitch the first campaign with a <type of photo> image.
>   4. `Split` (image right) — pitch the second campaign with a <type of photo> image.
>   5. `Quote` — testimonial from <name, role> about <impact metric>.
>   6. `Section` — three-step "what you do" using a `<ol>`.
>   7. `CTA` — primary "<button label>" → `/dashboard`, secondary "<label>" → `/notifications-center`.
>
> **Voice / constraints.** First-person plural ("we", "our"). British English. Keep paragraphs to two sentences. No emoji.
>
> **Reference.** Mirror the file shape and import style of `client/src/pages/landing/pages/welcome-to-summer.tsx`. Set `meta.slug` to `<slug>` (matching the filename), `meta.title` and `meta.description` accordingly. Include `publishedAt` as today's date.

Claude will produce a working file on the first try if you fill in the angle-bracket placeholders. You can always run another prompt after — "tighten the hero copy", "swap the second Split for an Image with a caption", "add a Video between the Quote and the Section".

### Worked examples

**A) Campaign launch — straightforward announcement.**

> Add a new landing page at `client/src/pages/landing/pages/autumn-eye-tests.tsx` announcing the Autumn 2026 Eye Tests campaign for practice managers. Tone: warm + confident. After reading, the manager should add the campaign to their plan via `/dashboard`. Use `Hero` (eyebrow "Autumn 2026", headline "Eye tests, with a head start on winter"), one `Split` with an autumnal-practice photo, a `Stats` row with three figures, a `Quote` from "Dr. Anna Reid, Optometrist", and a CTA to `/dashboard`. British English, paragraphs of two sentences, no emoji. Mirror the file shape of `welcome-to-summer.tsx`. `meta.publishedAt` = today.

**B) Practice success story — narrative-led.**

> Add a new landing page at `client/src/pages/landing/pages/brighton-vision-story.tsx` telling the story of how Brighton Vision Care doubled bookings after running our spring campaign. Audience: other practice owners considering joining the campaign rota. Use `Hero` with a hero photo of the practice, then alternate two `Split` blocks (image left then image right) walking through "before" and "after", a `Stats` row with the lift numbers, a `Quote` from the practice owner, then a CTA to `/dashboard` labelled "Add my practice to the next round". `publishedAt` = today. Keep it under ~500 words.

**C) Onboarding / explainer — instructional.**

> Add a landing page at `client/src/pages/landing/pages/welcome-new-admin.tsx` for newly-added super-admins, walking them through the planner. Use `Hero` ("Welcome to the planner"), then four `Card`s in a `SimpleGrid` (Plans, Notifications, God Mode, Email Health), an embedded `Video` from `https://youtu.be/<id>` showing the 90-second tour, and a CTA to `/admin/plans`. No `Quote` or `Stats` — keep it task-focused. Mirror `welcome-to-summer.tsx`.

### Things worth telling Claude up-front

- **Which blocks to use.** "Use Hero + two Splits + a Stats + a CTA" beats "build me a page".
- **The audience.** "Practice managers" gives Claude voice, length, and reading-level cues.
- **The action.** "After reading, they should click X" steers the CTA copy and where the secondary button points.
- **The references.** Naming `welcome-to-summer.tsx` and the shell components (`Hero`, `Section`, `CTA`, etc.) means Claude reads them first and copies the import paths exactly.
- **Where the assets live.** If photos are in `client/public/landing-assets/`, say so. If they're URLs, paste them.
- **The mood.** "Warm and confident" / "clinical and precise" / "playful" — one word goes a long way.

## Reference

- `pages/welcome-to-summer.tsx` — canonical shell-based example.
- `pages/custom-example.tsx` — freeform escape hatch (no shell).
- `/landing` (in the running app) — index page listing every registered landing page with copy-link buttons.
