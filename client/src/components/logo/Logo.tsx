import { Center, Text } from "@mantine/core";
import cl from "./logo.module.scss";

const Logo = ({ isSmall = false, text = "HG" }) => {
	const size = isSmall ? 32 : 64;
	const fontSize = isSmall ? "h6" : "h3";
	const fontWeight = isSmall ? 800 : 700;

	return (
		<Center
			className={cl.logo}
			w={size}
			h={size}
			style={{ borderRadius: isSmall ? "35%" : "15%" }}
		>
			<Text fw={fontWeight} c={"white"} fz={fontSize}>
				{text}
			</Text>
		</Center>
	);
};

export default Logo;
