/**
 * "Choose your direction" — the closing block. A card per creative direction,
 * offering the only two things a practice can do with it: order that direction, or
 * go back up and look at its artwork properly.
 *
 * "See the visuals" is a real anchor to #artwork, not a scripted scroll — the
 * browser then handles the sticky-header offset and reduced-motion for free. The
 * click handler only switches route first, so the placements are already showing
 * the right direction by the time the jump lands.
 */
import { useCampaign } from "./CampaignShell";
import { campaignLink, isMail } from "./links";
import { Cta } from "./Cta";
import { isPlaceholder } from "./types";
import type { Route } from "./types";

/** First real image in a route's placements, ignoring empty slots. The evergreen
 *  campaigns have real artwork but no route-level `visual`, so fall back to this
 *  rather than captioning a finished page "Creative to come". */
function firstImage(r: Route): string | null {
	for (const group of r.placements ?? []) {
		for (const item of group.items) {
			if (!isPlaceholder(item)) return item.img;
		}
	}
	return null;
}

export function OrderSection() {
	const { routes, setActive, id, multi } = useCampaign();
	const href = campaignLink(id);
	// A campaign whose destination is an email has no planner entry yet, so the
	// closing line must not promise one. Festive Windows is in that state.
	const byMail = isMail(href);
	const hasCarousel = routes.some((r) => (r.placements ?? []).length > 0);

	return (
		<section className="section section--order" id="order">
			<div className="wrap">
				<div className="section-head reveal">
					<div>
						<h2 className="display section-head__title">
							{multi ? "Choose your direction" : "Get this campaign"}
						</h2>
						<p className="lead">
							{byMail
								? multi
									? "Pick the direction you want to run and email it over — this campaign is still being set up in the Marketing Planner. Not decided? Take another look at the artwork first."
									: "Email the marketing team to order it — this campaign is still being set up in the Marketing Planner."
								: multi
								? "Pick the direction you want to run and we'll take you straight to it in your Marketing Planner, where you confirm print choices. Not decided? Take another look at the artwork first."
								: "Order it in your Marketing Planner, where you confirm print choices. Artwork follows shortly after."}
						</p>
					</div>
				</div>

				<div className="order__grid" data-count={routes.length > 3 ? "3" : String(routes.length)}>
					{routes.map((r) => {
						const shot = r.visual ?? firstImage(r);
						return (
							<article className="order__card reveal" key={r.id}>
								<div className="order__media">
									{shot ? (
										<img src={shot} alt={r.name} loading="lazy" />
									) : (
										<div className="ph-block">
											<span>Creative to come</span>
										</div>
									)}
								</div>
								<div className="order__body">
									<h3 className="order__title">{r.name}</h3>
									<div className="order__actions">
										<Cta href={href} className="btn--block">
											{multi ? "Select this direction" : "Select this campaign"}
										</Cta>
										{hasCarousel ? (
											<a
												className="btn btn--ghost-light btn--block"
												href="#artwork"
												onClick={() => setActive(r)}
											>
												See the visuals
											</a>
										) : null}
									</div>
								</div>
							</article>
						);
					})}
				</div>

				<div className="order__foot reveal">
					{byMail ? (
						<>
							<p className="order__foot-text">
								This campaign is being set up in the Marketing Planner. Until it is there,
								email the marketing team and they will get it onto your plan.
							</p>
							<Cta href={href} className="btn--ghost-light">
								Email the marketing team
							</Cta>
						</>
					) : (
						<>
							<p className="order__foot-text">
								Already know what you want? Go straight to this campaign in your Marketing
								Planner.
							</p>
							<Cta href={href} className="btn--ghost-light">
								Open in the planner
							</Cta>
							<p className="fineprint">
								Trouble connecting? Email{" "}
								<a href="mailto:marketing@hakimgroup.co.uk">marketing@hakimgroup.co.uk</a>
							</p>
						</>
					)}
				</div>
			</div>
		</section>
	);
}
