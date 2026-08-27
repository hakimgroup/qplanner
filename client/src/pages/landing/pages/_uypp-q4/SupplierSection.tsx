/**
 * "Supplier support" — the brand add-ons that attach to this campaign.
 *
 * One expandable row per supplier: collapsed to a logo and a single line saying
 * what is on offer; expanded to what the supplier provides, the products, and how
 * to take it up. Only what differs from the parent campaign appears here.
 *
 * This replaced a three-logo strip that was identical on all seven standalone
 * pages — Hoya, CooperVision and Bausch + Lomb everywhere — whichever suppliers
 * actually backed the campaign you were looking at.
 *
 * Classes are `.supplier*`, never `.brand*`: `.brand` is the Hakim Group logo
 * lockup in the header and footer, and reusing it put a white card round the logo.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useCampaign } from "./CampaignShell";
import { brandLink, campaignLink } from "./links";
import { Cta } from "./Cta";
import type { Brand } from "./types";

export function SupplierSection({ lead }: { lead?: React.ReactNode }) {
	const { campaign, id, orderLabel } = useCampaign();
	const brands = campaign.brands ?? [];
	const [open, setOpen] = useState<Record<string, boolean>>({});
	const [targeted, setTargeted] = useState<string | null>(null);
	const root = useRef<HTMLDivElement>(null);
	const { hash } = useLocation();

	/** Group only where the data asks for it. Festive Windows carries eight add-ons
	 *  and they divide cleanly; three or fewer read better as a plain list. */
	const groups = useMemo(() => {
		const order: string[] = [];
		const bucket: Record<string, Brand[]> = {};
		brands.forEach((b) => {
			const g = b.group ?? "";
			if (!bucket[g]) {
				bucket[g] = [];
				order.push(g);
			}
			bucket[g].push(b);
		});
		return order.map((g) => ({ title: g, items: bucket[g] }));
	}, [brands]);

	/** Arriving from the hub's Brand assets index, which links straight to a
	 *  supplier. Open it on the way in rather than landing on a closed row. */
	useEffect(() => {
		const m = /^#brand-([\w-]+)$/.exec(hash || "");
		if (!m) return;
		const brandId = m[1];
		if (!brands.some((b) => b.id === brandId)) return;
		setOpen((o) => ({ ...o, [brandId]: true }));
		setTargeted(brandId);
		requestAnimationFrame(() => {
			root.current
				?.querySelector(`#brand-${brandId}`)
				?.scrollIntoView({ block: "center", behavior: "smooth" });
		});
	}, [hash, brands]);

	if (!brands.length) return null;

	return (
		<section className="section" id="supplier-support">
			<div className="wrap">
				<div className="section-head reveal">
					<div>
						<h2 className="display section-head__title">Supplier support</h2>
						<p className="lead">
							{lead ??
								"Brand assets are an add-on to this campaign, funded by the supplier, who provides the artwork, the training and the offer itself. Open one to see what it includes and how to take it up."}
						</p>
					</div>
				</div>

				<div className="suppliers" ref={root}>
					{groups.map((g) => (
						<section className="suppliers__group reveal" key={g.title || "_"}>
							{g.title ? <h3 className="suppliers__grouptitle">{g.title}</h3> : null}
							<div className="suppliers__rows">
								{g.items.map((b) => {
									const isOpen = !!open[b.id];
									const tbc = b.status === "tbc";
									const href = brandLink(id, b.id);
									return (
										<article
											className={`supplier${tbc ? " supplier--tbc" : ""}${
												targeted === b.id ? " supplier--targeted" : ""
											}`}
											id={`brand-${b.id}`}
											key={b.id}
										>
											<h3 className="supplier__head">
												<button
													className="supplier__btn"
													type="button"
													aria-expanded={isOpen}
													aria-controls={`brandpanel-${b.id}`}
													onClick={() => setOpen((o) => ({ ...o, [b.id]: !o[b.id] }))}
												>
													<span className="supplier__logo">
														<img src={b.logo} alt={b.name} loading="lazy" />
													</span>
													<span className="supplier__lede">
														<span className="supplier__name">{b.name}</span>
														<span className="supplier__offer">{b.offer ?? ""}</span>
													</span>
													{tbc ? <span className="supplier__chip">TBC</span> : null}
													<span className="supplier__chev" aria-hidden="true" />
												</button>
											</h3>
											<div className="supplier__panel" id={`brandpanel-${b.id}`} hidden={!isOpen}>
												<div className="supplier__panel-in">
													{b.body ? <div dangerouslySetInnerHTML={{ __html: b.body }} /> : null}
													{b.gives?.length || b.products?.length ? (
														<div className="supplier__cols">
															{b.gives?.length ? (
																<div className="supplier__col">
																	<h4 className="supplier__coltitle">What the supplier provides</h4>
																	<ul>
																		{b.gives.map((g2, i) => (
																			<li key={i} dangerouslySetInnerHTML={{ __html: g2 }} />
																		))}
																	</ul>
																</div>
															) : null}
															{b.products?.length ? (
																<div className="supplier__col">
																	<h4 className="supplier__coltitle">Products to include</h4>
																	<ul>
																		{b.products.map((p, i) => (
																			<li key={i} dangerouslySetInnerHTML={{ __html: p }} />
																		))}
																	</ul>
																</div>
															) : null}
														</div>
													) : null}
													{b.howto ? (
														<div className="supplier__how">
															<h4 className="supplier__coltitle">How to take it up</h4>
															<div dangerouslySetInnerHTML={{ __html: b.howto }} />
														</div>
													) : null}
													<div className="supplier__actions">
														{tbc ? (
															<p className="supplier__tbc">
																Details still to be confirmed by the supplier.
															</p>
														) : (
															<Cta href={href} className="btn--sm">
																{b.cta ?? "Take up this add-on"}
															</Cta>
														)}
													</div>
												</div>
											</div>
										</article>
									);
								})}
							</div>
						</section>
					))}
				</div>

				{/* One campaign-level CTA at the foot rather than repeating it in all eight
				    rows. The add-on attaches to the campaign, so this is the other half. */}
				<div className="suppliers__foot reveal">
					<p className="suppliers__foot-text">
						Brand assets sit on top of the campaign, they do not replace it. Order the
						campaign itself in your Marketing Planner, then take up any supplier add-on
						alongside it.
					</p>
					<Cta href={campaignLink(id)} className="btn--ghost">
						{orderLabel}
					</Cta>
				</div>
			</div>
		</section>
	);
}
