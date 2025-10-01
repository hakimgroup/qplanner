import { Button, createTheme } from "@mantine/core";

export const theme = createTheme({
	cursorType: "pointer",
	fontFamily: "Inter, sans-serif",
	black: "#363D49",
	colors: {
		blue: [
			"#ebecff",
			"#d3d4ff",
			"#a3a5f9",
			"#6467f2",
			"#4649ee",
			"#2b2eec",
			"#1c21ec",
			"#0e15d2",
			"#0511bd",
			"#000da7",
		],
		red: [
			"#ffe9f8",
			"#fed3e9",
			"#f6a5cf",
			"#ef74b4",
			"#e9479a",
			"#e6318e",
			"#e62187",
			"#cc1174",
			"#b70667",
			"#a20059",
		],
		gray: [
			"#f3f4f6",
			"#e6e6e6",
			"#cacbcd",
			"#abaeb4",
			"#91969f",
			"#808793",
			"#777f8e",
			"#656d7b",
			"#59616f",
			"#363d49",
		],
	},
	components: {
		Badge: {
			styles: {
				root: {
					textTransform: "unset", // 👈 applies to all badges
				},
			},
		},
		Button: {
			defaultProps: {
				color: "blue.3",
			},
			styles: {
				root: {
					borderRadius: 10,
				},
			},
		},
	},
	shadows: {
		xs: "0px 1px 5px 0px rgba(139, 0, 255, 0.08)",
	},
	breakpoints: {
		xs: "36em",
		sm: "48em",
		md: "62em",
		lg: "80em",
		xl: "88em",
	},
});
