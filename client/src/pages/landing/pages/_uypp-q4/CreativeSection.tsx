/**
 * "Three creative directions" — the route tabs and the route panel.
 *
 * A single-route campaign hides the tabs automatically. The route's `tagline` is
 * deliberately not rendered: it only ever held "Route 01" and the like, which the
 * route name already says.
 */
import { useState } from "react";
import { useCampaign } from "./CampaignShell";
import { campaignLink } from "./links";
import { Cta } from "./Cta";
import { Lightbox } from "./Lightbox";

export function CreativeSection({
	title = "Three creative directions",
	lead,
}: {
	title?: string;
	lead?: React.ReactNode;
}) {
	const { routes, active, setActive, id, multi, orderLabel } = useCampaign();
	const [zoomed, setZoomed] = useState(false);

	return (
		<section className="section section--tint" id="creative">
			<div className="wrap">
				<div className="section-head reveal">
					<div>
						<h2 className="display section-head__title">{title}</h2>
						{lead ? <p className="lead">{lead}</p> : null}
					</div>
				</div>

				{multi ? (
					<div className="routes__tabs" id="routeTabs" role="tablist" aria-label="Creative routes">
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

				<div className="route" id="routePanel">
					<figure
						className={`route__media${
							active.visualFit === "cover" ? " route__media--cover" : ""
						}`}
					>
						{active.visual ? (
							// The CSS has labelled this "Click to enlarge" since Q4 launched;
							// this is the click it was promising.
							<img
								src={active.visual}
								alt={`${active.name} creative route`}
								style={
									active.visualPosition
										? { objectPosition: active.visualPosition }
										: undefined
								}
								onClick={() => setZoomed(true)}
							/>
						) : (
							<div className="ph-block">
								<span>Creative to come</span>
							</div>
						)}
					</figure>
					<div className="route__body">
						<h3 className="display route__title">{active.name}</h3>
						{active.body ? (
							<div dangerouslySetInnerHTML={{ __html: active.body }} />
						) : null}
						{active.note ? (
							<div dangerouslySetInnerHTML={{ __html: active.note }} />
						) : null}
						<div className="route__actions">
							{/* A route may name its own destination — see Route.order. Falls back
							    to the campaign's, which is how every Q4 campaign works. */}
							<Cta href={active.order?.href ?? campaignLink(id)}>
								{active.order?.label ?? orderLabel}
							</Cta>
							{active.action ? (
								<Cta href={active.action.href} className="btn--ghost">
									{active.action.label}
								</Cta>
							) : null}
						</div>
					</div>
				</div>
			</div>

			{zoomed && active.visual ? (
				<Lightbox
					src={active.visual}
					cap={active.name}
					onClose={() => setZoomed(false)}
				/>
			) : null}
		</section>
	);
}
