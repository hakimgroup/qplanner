import type { ComponentType } from "react";

/**
 * Public metadata each landing page must export.
 *
 *   export const meta: LandingPageMeta = {
 *     slug: "welcome-to-summer",
 *     title: "Welcome to the Summer Campaign",
 *     description: "Practice-facing summer launch.",
 *   };
 *
 * `slug` MUST match the filename (without extension) — it's the URL path.
 * `publishedAt` is optional ISO string for sorting on the index.
 * `thumbnail` is optional — if omitted, the index auto-extracts the first
 * image URL it finds in the page source (Hero/Split/Image/img).
 */
export interface LandingPageMeta {
	slug: string;
	title: string;
	description: string;
	publishedAt?: string;
	/** Explicit override for the index card thumbnail. */
	thumbnail?: string;
	/** When true the page renders at its URL but is hidden from the /landing index.
	 *  Use for internal-reference pages and pattern examples that aren't real campaigns. */
	hidden?: boolean;
}

export interface LandingPageEntry {
	meta: LandingPageMeta;
	Component: ComponentType;
	/** Resolved thumbnail (explicit meta.thumbnail wins; otherwise auto-scanned). */
	thumbnail: string | null;
}

interface ModuleShape {
	default: ComponentType;
	meta?: LandingPageMeta;
}

// Vite's import.meta.glob discovers every .tsx file under ./pages at build time.
// `eager: true` means each module is bundled immediately (these are small pages
// and we want them all in one chunk so the index renders instantly).
const modules = import.meta.glob<ModuleShape>("./pages/*.tsx", { eager: true });

// Same files imported as raw source text so we can scan for image URLs without
// rendering. Vite resolves `?raw` at build time — no runtime cost.
const sources = import.meta.glob<string>(
	"./pages/*.tsx",
	{ query: "?raw", import: "default", eager: true },
);

/**
 * Pull the first plausible image URL out of a page's source code. Looks at the
 * common shapes — Hero's `image=…`, Split's `image=…`, `<Image src=…>`, and raw
 * `<img src=…>` — in roughly that order of likelihood. Returns null if none
 * match.
 *
 * Intentionally doesn't match `<Video src=…>` (those are YouTube/MP4 URLs, not
 * thumbnail-able) and excludes obvious non-image URLs (youtube/vimeo/mp4).
 */
function extractFirstImageUrl(source: string): string | null {
	// 1. Anything with an `image="…"` prop (Hero, Split, and any future shell
	//    block that follows the same naming convention).
	const imageProp = source.match(/\bimage\s*=\s*["']([^"']+)["']/);
	if (imageProp && isImageLike(imageProp[1])) return imageProp[1];

	// 2. <Image … src="…"> from the shell block.
	const imageComponent = source.match(
		/<Image\b[^>]*\bsrc\s*=\s*["']([^"']+)["']/s,
	);
	if (imageComponent && isImageLike(imageComponent[1])) return imageComponent[1];

	// 3. Raw <img src="…"> tags.
	const rawImg = source.match(/<img\b[^>]*\bsrc\s*=\s*["']([^"']+)["']/s);
	if (rawImg && isImageLike(rawImg[1])) return rawImg[1];

	return null;
}

function isImageLike(url: string): boolean {
	if (!url) return false;
	const lower = url.toLowerCase();
	// Filter out video / non-image URLs that might appear in src= attributes.
	if (/youtube\.com|youtu\.be|vimeo\.com/.test(lower)) return false;
	if (/\.(mp4|webm|ogg|mov)(\?|$)/.test(lower)) return false;
	return true;
}

function buildRegistry(): Record<string, LandingPageEntry> {
	const out: Record<string, LandingPageEntry> = {};

	for (const [path, mod] of Object.entries(modules)) {
		// "./pages/welcome-to-summer.tsx" -> "welcome-to-summer"
		const fallbackSlug = path
			.replace(/^\.\/pages\//, "")
			.replace(/\.tsx$/, "");

		const meta = mod.meta;
		if (!meta) {
			console.warn(
				`[landing-pages] ${path} is missing a \`meta\` export. Skipping.`,
			);
			continue;
		}
		if (!mod.default) {
			console.warn(
				`[landing-pages] ${path} is missing a default React export. Skipping.`,
			);
			continue;
		}

		const slug = meta.slug || fallbackSlug;
		const sourceText = sources[path];
		const autoThumbnail = sourceText
			? extractFirstImageUrl(sourceText)
			: null;

		out[slug] = {
			meta: { ...meta, slug },
			Component: mod.default,
			thumbnail: meta.thumbnail ?? autoThumbnail,
		};
	}

	return out;
}

const registry = buildRegistry();

export function getLandingPage(slug: string): LandingPageEntry | null {
	return registry[slug] ?? null;
}

export function listLandingPages(): LandingPageEntry[] {
	return Object.values(registry)
		.filter((entry) => !entry.meta.hidden)
		.sort((a, b) => {
			// Most-recent published first; fallback to alphabetical title.
			const aDate = a.meta.publishedAt ? Date.parse(a.meta.publishedAt) : 0;
			const bDate = b.meta.publishedAt ? Date.parse(b.meta.publishedAt) : 0;
			if (aDate !== bDate) return bDate - aDate;
			return a.meta.title.localeCompare(b.meta.title);
		});
}
