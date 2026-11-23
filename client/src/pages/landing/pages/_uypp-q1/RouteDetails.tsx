/**
 * "Bringing it to life" — the practical half of each brief slide.
 *
 * Every activity in the Q1 brief ends the same way: steps to take, products to
 * include, who it is for, and a line of supporting information. The route panel
 * higher up the page carries the argument; this carries the instructions, for
 * whichever activity is selected there.
 *
 * It repeats the tabs rather than relying on the ones above. By this point the
 * reader is a screen or two below them, and a block that silently changed with a
 * control they can no longer see would read as the wrong activity's steps. The
 * tabs here drive the same state, so the two stay in step in both directions.
 *
 * Built from the shared stylesheet's existing blocks — tabs, panels, the bullet
 * list — so it adds no CSS.
 */
import { useCampaign } from "../_uypp-q4/CampaignShell";

export interface RouteDetail {
	/** "Volume and conversion" */
	kpi?: string;
	/** "February half term" */
	period?: string;
	steps: string[];
	products?: string[];
	audience?: string[];
	/** Plain text. */
	support?: string;
}

export function RouteDetails({
	details,
	tint = false,
	lead,
}: {
	/** Keyed by route id. A route with no entry renders nothing. */
	details: Record<string, RouteDetail>;
	/** Band tone. No two neighbouring bands may share one, and what sits above
	 *  this differs by page — see the note in FestivePage. */
	tint?: boolean;
	lead?: string;
}) {
	const { routes, active, setActive, multi } = useCampaign();
	const d = details[active.id];
	if (!d) return null;

	const facts: { title: string; items?: string[]; text?: string }[] = [];
	if (d.products?.length) facts.push({ title: "Products to include", items: d.products });
	if (d.audience?.length) facts.push({ title: "Audience", items: d.audience });
	if (d.support) facts.push({ title: "Supporting information", text: d.support });

	const meta = [d.kpi ? `Core KPI · ${d.kpi}` : null, d.period ?? null]
		.filter(Boolean)
		.join("  ·  ");

	return (
		<section className={`section${tint ? " section--tint" : ""}`} id="details">
			<div className="wrap">
				<div className="section-head reveal">
					<div>
						<h2 className="display section-head__title">Bringing it to life</h2>
						{lead ? <p className="lead">{lead}</p> : null}
					</div>
				</div>

				{multi ? (
					<div className="routes__tabs" role="tablist" aria-label="Choose an activity">
						{routes.map((r) => (
							<button
								key={r.id}
								className={`rtab${r === active ? " rtab--active" : ""}`}
								type="button"
								role="tab"
								aria-selected={r === active}
								onClick={() => setActive(r)}
							>
								{r.name}
							</button>
						))}
					</div>
				) : null}

				{/* Keyed by route so switching tab mounts fresh nodes: the reveal
				    observer only animates elements it has not already shown. */}
				<div className="panel panel--flag panel--wide reveal" key={`steps-${active.id}`}>
					{meta ? <span className="panel__no">{meta}</span> : null}
					<h3 className="panel__title">{active.name}</h3>
					<ul className="intro__points">
						{d.steps.map((s) => (
							<li key={s}>{s}</li>
						))}
					</ul>
				</div>

				{facts.length ? (
					<div
						className={
							facts.length === 1
								? undefined
								: `panels${facts.length === 2 ? " panels--four" : ""}`
						}
						key={`facts-${active.id}`}
					>
						{facts.map((f) => (
							<article className="panel reveal" key={f.title}>
								<h3 className="panel__title">{f.title}</h3>
								{f.items ? (
									<ul>
										{f.items.map((i) => (
											<li key={i}>{i}</li>
										))}
									</ul>
								) : (
									<p>{f.text}</p>
								)}
							</article>
						))}
					</div>
				) : null}
			</div>
		</section>
	);
}
