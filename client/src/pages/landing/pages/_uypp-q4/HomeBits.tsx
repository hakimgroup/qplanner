/**
 * The one piece of hub behaviour that is not just markup.
 *
 * `CardCycle` crossfades a campaign card's creative routes. The markup ships as a
 * plain list of images, which is the correct fallback with no JavaScript or with
 * reduced motion on; only when the cycle actually starts does CSS hide the
 * inactive ones.
 *
 * `CpdSession` used to live here too. It moved to CpdSection.tsx when Related CPD
 * sessions moved off the hub onto Presbyopia.
 */
import { useEffect, useState } from "react";

const reduced = () =>
	typeof window !== "undefined" &&
	window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export function CardCycle({
	images,
	intervalMs = 5000,
	delayMs = 0,
}: {
	images: { src: string; alt: string }[];
	intervalMs?: number;
	delayMs?: number;
}) {
	const [i, setI] = useState(0);
	const cycling = images.length > 1 && !reduced();

	useEffect(() => {
		if (!cycling) return;
		let id: ReturnType<typeof setInterval>;
		const start = setTimeout(() => {
			id = setInterval(() => setI((n) => (n + 1) % images.length), intervalMs);
		}, delayMs);
		return () => {
			clearTimeout(start);
			if (id) clearInterval(id);
		};
	}, [cycling, images.length, intervalMs, delayMs]);

	return (
		<div className={`card__media${cycling ? " is-cycling" : ""}`}>
			{images.map((im, n) => (
				<img
					key={im.src}
					className={n === i ? "is-active" : ""}
					src={im.src}
					alt={im.alt}
					aria-hidden={n !== i && cycling ? true : undefined}
					loading="lazy"
				/>
			))}
		</div>
	);
}
