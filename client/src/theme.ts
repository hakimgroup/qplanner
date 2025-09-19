import { Button, createTheme } from "@mantine/core";

export const theme = createTheme({
	cursorType: "pointer",
	fontFamily: "Inter, sans-serif",
	black: "#363D49",
	colors: {
		blue: [
			"#ebecff",
			"#d3d4ff",
			"#a3a5f8",
			"#7476f3",
			"#4648ee",
			"#2c2eec",
			"#1d20eb",
			"#0f14d2",
			"#0611bc",
			"#000ca6",
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
});
