/**
 * The collapsed row used by Related CPD sessions.
 *
 * Same control as the Supplier support rows it now sits beneath: collapsed to the
 * title, who is presenting and the CPD points, with the detail behind a click.
 * Kept as its own component rather than folded into SupplierSection because the
 * two carry different content — a supplier has assets to order, a session has a
 * date and a registration link — and only the interaction is shared. Keep the two
 * visually in step if either changes.
 *
 * Lived in HomeBits.tsx until the section moved off the hub onto Presbyopia.
 * Self-contained React: the toggle is component state, so it needs neither app.js
 * nor detail.js and would work on any page in the quarter.
 */
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";

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
