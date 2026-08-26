/**
 * The two pieces of hub behaviour that are not just markup.
 *
 * `CardCycle` crossfades a campaign card's creative routes. The markup ships as a
 * plain list of images, which is the correct fallback with no JavaScript or with
 * reduced motion on; only when the cycle actually starts does CSS hide the
 * inactive ones.
 *
 * `CpdSession` is the collapsed row used by Related CPD sessions. It is the same
 * control as the Supplier support rows on the campaign pages, kept as a separate
 * component because the hub and the campaign pages do not otherwise share code.
 * Keep the two in step if either changes.
 */
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";

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

export function CpdSession({
	id,
	name,
	by,
	points,
	children,
}: {
	id: string;
	name: string;
	by: string;
	points: string;
	children: ReactNode;
}) {
	const [open, setOpen] = useState(false);
	const [targeted, setTargeted] = useState(false);
	const el = useRef<HTMLElement>(null);
	const { hash } = useLocation();

	/** A link straight to a session opens it on the way in, rather than landing on
	 *  a closed row you then have to notice and click. */
	useEffect(() => {
		if (hash !== `#cpd-${id}`) return;
		setOpen(true);
		setTargeted(true);
		requestAnimationFrame(() =>
			el.current?.scrollIntoView({ block: "center", behavior: "smooth" })
		);
	}, [hash, id]);

	return (
		<article className={`cpd reveal${targeted ? " cpd--targeted" : ""}`} id={`cpd-${id}`} ref={el}>
			<h3 className="cpd__head">
				<button
					className="cpd__btn"
					type="button"
					aria-expanded={open}
					aria-controls={`cpdpanel-${id}`}
					onClick={() => setOpen((o) => !o)}
				>
					<span className="cpd__lede">
						<span className="cpd__name">{name}</span>
						<span className="cpd__by">{by}</span>
					</span>
					<span className="cpd__points">{points}</span>
					<span className="cpd__chev" aria-hidden="true" />
				</button>
			</h3>
			<div className="cpd__panel" id={`cpdpanel-${id}`} hidden={!open}>
				<div className="cpd__panel-in">{children}</div>
			</div>
		</article>
	);
}
