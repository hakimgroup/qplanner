import { ButtonProps, Button } from "@mantine/core";
import cl from "./styledButton.module.scss";

const StyledButton = ({
	children,
	onClick,
	...props
}: ButtonProps & { children?: React.ReactNode; onClick?: () => void }) => (
	<Button
		className={cl["styled-button"]}
		{...props}
		radius={10}
		variant="subtle"
		color="violet"
		c="gray.9"
		style={{
			border: "1px solid #e5e7eb",
			transition: "all 0.2s",
		}}
		onClick={() => {
			onClick && onClick();
		}}
	>
		{children}
	</Button>
);

export default StyledButton;
