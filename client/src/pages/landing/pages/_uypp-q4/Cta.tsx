/**
 * Every ordering button on the Q4 pages, in one component.
 *
 * Three shapes of destination and each behaves differently:
 *   - a planner path (`/dashboard?campaign=…`) routes in-app through React Router,
 *     so the visitor stays inside the planner rather than reloading it;
 *   - a mailto opens the mail client, and must NOT carry target="_blank" or it
 *     leaves an empty tab behind once the client takes over;
 *   - nothing at all renders a button with no href, so it looks right and simply
 *     does nothing. With href="#" it would jump the page to the top, which reads
 *     as broken.
 */
import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import { isExternal, isMail } from "./links";

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
	if (isExternal(href)) {
		return (
			<a className={cls} href={href} target="_blank" rel="noopener noreferrer" onClick={onClick}>
				{children}
			</a>
		);
	}
	return (
		<Link className={cls} to={href} onClick={onClick}>
			{children}
		</Link>
	);
}
