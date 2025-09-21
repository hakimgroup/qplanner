import { AppState, UserTabModes, ViewModes } from "@/models/general.models";

export const Colors = {
	cream: "#f3f4f6",
};

export const statusColors = {
	requested: "#ff7f50",
	live: "#2ed573",
	inProgress: "#1e90ff",
	onPlan: "#10ac84",
	cancelled: "#ff4757",
	confirmed: "#5352ed",
};

export const appStateDefault: AppState = {
	filters: {
		viewMode: ViewModes.Cards,
		dateRange: {
			from: null,
			to: null,
		},
		categories: [],
		objectives: [],
		topics: [],
		hideSelected: false,
		userSelectedTab: UserTabModes.Browse,
	},
	allCampaigns: {
		loading: false,
		data: [],
	},
};
