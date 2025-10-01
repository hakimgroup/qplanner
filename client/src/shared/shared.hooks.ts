import { Nav_Presets } from "@/components/nav/nav.config";
import { useMediaQuery } from "@mantine/hooks";
import { useLayoutEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { AppRoutes } from "./shared.models";

export function useBreakpoints() {
	const [isClient, setIsClient] = useState(false);

	const breakpoints = {
		isXs: useMediaQuery("(max-width: 640px)"),
		isSm: useMediaQuery("(min-width: 641px) and (max-width: 768px)"),
		isMd: useMediaQuery("(min-width: 769px) and (max-width: 1024px)"),
		isLg: useMediaQuery("(min-width: 1025px)"),
		active: "SSR",
	};

	useLayoutEffect(() => {
		if (typeof window !== "undefined") setIsClient(true);
	}, []);

	if (isClient && breakpoints.isXs) breakpoints.active = "xs";
	if (isClient && breakpoints.isSm) breakpoints.active = "sm";
	if (isClient && breakpoints.isMd) breakpoints.active = "md";
	if (isClient && breakpoints.isLg) breakpoints.active = "lg";

	return breakpoints;
}

export function useNavPreset() {
	const { pathname } = useLocation();

	// If you’re on /admin or any /admin/child → use the Admin preset
	const key =
		pathname === AppRoutes.Admin ||
		pathname.startsWith(`${AppRoutes.Admin}/`)
			? AppRoutes.Admin
			: pathname;

	return Nav_Presets[key] ?? { title: "", description: "" };
}
