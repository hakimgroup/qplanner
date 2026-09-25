/**
 * The full-size artwork viewer.
 *
 * Lived inside ArtworkSection until the route panel needed it too. The route
 * image had carried a "Click to enlarge" label since Q4 launched with nothing
 * behind it — the CSS advertised a lightbox that only the placements strip
 * actually had. One component now, so the two cannot behave differently.
 *
 * Render it as a direct child of a section, never inside `.route`: the route
 * panel animates in with a transform, and a transformed ancestor turns
 * `position: fixed` into "fixed to that box", which would trap the overlay
 * inside the panel instead of covering the page.
 */
import { useEffect, useRef } from "react";

export function Lightbox({
	src,
	cap,
	onClose,
}: {
	src: string;
	cap: string;
	onClose: () => void;
}) {
	// Held in a ref so a parent passing a fresh arrow function each render does
	// not tear the listeners down and rebuild them on every keystroke.
	const close = useRef(onClose);
	close.current = onClose;

	// Escape closes it, and the page behind must not scroll while it is open.
	useEffect(() => {
		const onKey = (e: KeyboardEvent) => e.key === "Escape" && close.current();
		document.addEventListener("keydown", onKey);
		const prev = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.removeEventListener("keydown", onKey);
			document.body.style.overflow = prev;
		};
	}, []);

	return (
		<div
			className="lb is-open"
			role="dialog"
			aria-modal="true"
			aria-label="Artwork, full size"
			onClick={(e) => {
				if (e.target === e.currentTarget) onClose();
			}}
		>
			<button className="lb__close" type="button" aria-label="Close" onClick={onClose}>
				×
			</button>
			<figure className="lb__figure">
				<div className="lb__media">
					<img src={src} alt={cap} />
				</div>
				<p className="lb__cap">{cap}</p>
			</figure>
		</div>
	);
}
