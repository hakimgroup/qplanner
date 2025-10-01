import { ButtonProps, Button } from "@mantine/core";
import cl from "./styledButton.module.scss";

interface StyledButtonProps extends ButtonProps {
	link?: string;
	borderWidth?: number;
	alignLeft?: boolean;
	children?: React.ReactNode;
	onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

const StyledButton = ({
	link,
	borderWidth = 1,
	alignLeft,
	children,
	onClick,
	...props
}: StyledButtonProps) => {
	const commonProps = {
		className: cl["styled-button"],
		radius: 10,
		color: "#fff",
		c: "gray.9",
		style: {
			border: `${borderWidth}px solid #e5e7eb`,
			transition: "all 0.2s",
		},
		styles: {
			...(alignLeft && {
				inner: {
					justifyContent: "flex-start",
				},
			}),
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
