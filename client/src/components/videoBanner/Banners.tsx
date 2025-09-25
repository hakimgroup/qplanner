import AppContext from "@/shared/AppContext";
import { useContext, useEffect, useState, useCallback } from "react";
import LargeVideoBanner from "./LargeVideoBanner";
import VideoBanner from "./VideoBanner";

const SMALL_KEY = "mp_small_banner_dismissed";
const LARGE_KEY = "mp_large_banner_dismissed";

/**
 * Persist a boolean flag in localStorage, SSR-safe and cross-tab synced.
 */
function useStoredFlag(key: string, defaultValue = false) {
	const safeGet = useCallback(() => {
		try {
			if (typeof window === "undefined") return defaultValue;
			const v = window.localStorage.getItem(key);
			return v === null ? defaultValue : v === "true";
		} catch {
			return defaultValue;
		}
	}, [key, defaultValue]);

	const [value, setValue] = useState<boolean>(safeGet);

	// Read once on mount (covers hydration mismatches)
	useEffect(() => {
		setValue(safeGet());
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [safeGet]);

	// Cross-tab sync
	useEffect(() => {
		const onStorage = (e: StorageEvent) => {
			if (e.key === key) {
				setValue(e.newValue === "true");
			}
		};
		if (typeof window !== "undefined") {
			window.addEventListener("storage", onStorage);
			return () => window.removeEventListener("storage", onStorage);
		}
	}, [key]);

	const setTrue = useCallback(() => {
		try {
			if (typeof window !== "undefined") {
				window.localStorage.setItem(key, "true");
			}
		} catch {}
		setValue(true);
	}, [key]);

	const setFalse = useCallback(() => {
		try {
			if (typeof window !== "undefined") {
				window.localStorage.setItem(key, "false");
			}
		} catch {}
		setValue(false);
	}, [key]);

	return { value, setTrue, setFalse };
}

export default function Banners() {
	const {
		state: { allCampaigns },
	} = useContext(AppContext);

	const hasPlans = !!allCampaigns?.hasPlans;

	const small = useStoredFlag(SMALL_KEY, false);
	const large = useStoredFlag(LARGE_KEY, false);

	const showLarge = !hasPlans && !large.value;
	const showSmall = !showLarge && !small.value;

	const dismissLarge = large.setTrue;
	const dismissSmall = small.setTrue;

	return (
		<>
			{showLarge && <LargeVideoBanner closeBanner={dismissLarge} />}
			{showSmall && <VideoBanner onDismiss={dismissSmall} />}
		</>
	);
}
