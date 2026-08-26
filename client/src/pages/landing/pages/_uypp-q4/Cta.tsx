/**
 * Every ordering button on the Q4 pages, in one component.
 *
 * Three shapes of destination and each behaves differently:
 *   - a real destination — a planner deep link (`/dashboard?campaign=…`) or an
 *     external URL — opens in a new tab, so the visitor keeps the campaign page
 *     they were reading. These pages are a browsing surface: someone comparing
 *     creative routes should be able to order one and carry on reading rather
 *     than lose their place and have to navigate back.
 *   - a mailto opens the mail client, and must NOT carry target="_blank" or it
 *     leaves an empty tab behind once the client takes over;
 *   - nothing at all renders a button with no href, so it looks right and simply
 *     does nothing. With href="#" it would jump the page to the top, which reads
 *     as broken.
 *
 * Planner links deliberately do NOT route in-app through React Router. A
 * <Link> would keep the SPA warm but replace the landing page, which is the
 * behaviour this is meant to avoid. The new tab costs one app boot; the
 * visitor's session carries over, since it is the same origin.
 */
import type { ReactNode } from "react";
import { isMail } from "./links";

export function Cta({
	href,
	children,
	className = "",
	onClick,
}: {
	href: string | null;
	children: ReactNode;
	className?: string;
	onClick?: () => void;
}) {
	const cls = `btn ${className}`.trim();

	if (!href) {
		return (
			<a
				className={`${cls} is-todo-link`}
				aria-disabled="true"
				data-todo="destination to be supplied"
			>
				{children}
			</a>
		);
	}
	if (isMail(href)) {
		return (
			<a className={cls} href={href} onClick={onClick}>
				{children}
			</a>
		);
	}
	return (
		<a className={cls} href={href} target="_blank" rel="noopener noreferrer" onClick={onClick}>
			{children}
		</a>
	);
}
