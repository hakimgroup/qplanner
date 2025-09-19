import { ButtonProps, Button } from "@mantine/core";
import cl from "./styledButton.module.scss";

interface StyledButtonProps extends ButtonProps {
	link?: string;
	children?: React.ReactNode;
	onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

const StyledButton = ({
	link,
	children,
	onClick,
	...props
}: StyledButtonProps) => {
	const commonProps = {
		className: cl["styled-button"],
		radius: 10,
		variant: "subtle" as const,
		color: "violet",
		c: "gray.9",
		style: {
			border: "1px solid #e5e7eb",
			transition: "all 0.2s",
		},
		...props,
	};

	return link ? (
		<Button {...commonProps} component="a" href={link} target="_blank">
			{children}
		</Button>
	) : (
		<Button
			{...commonProps}
			onClick={(e) => {
				onClick?.(e);
			}}
		>
			{children}
		</Button>
	);
};

export default StyledButton;
