/**
 * The closing bar, on every Q4 page.
 *
 * One component rather than a copy per page: the wording was already identical
 * across six campaign pages and drifted from the hub the moment the hub changed.
 * Anything said here is said once.
 *
 * It replaced a "Tell us what you think" heading whose button went back to the
 * campaign overview — an invitation to give feedback with nowhere to give it.
 * Each campaign page still carries a back link in its hero, so nothing is lost
 * by the bottom one going.
 */
import { FEEDBACK_FORM } from "./links";

export function FeedbackSection({ id }: { id?: string }) {
	return (
		<section className="cta" id={id}>
			<div className="wrap cta__inner reveal">
				<h2 className="display cta__title">
					Let us know what you think
				</h2>
				<p>
					We've changed how Unlock Your Practice Potential works this quarter. We'd like to know what's working, what isn't, and how it could be better.
				</p>
				<a
					className="btn"
					href={FEEDBACK_FORM}
					data-cta="feedback"
					target="_blank"
					rel="noopener noreferrer"
				>
					Share your feedback
				</a>
			</div>
		</section>
	);
}
