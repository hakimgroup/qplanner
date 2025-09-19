import { AppState, UserTabModes, ViewModes } from "@/models/general.models";

export const Colors = {
	cream: "#f3f4f6",
};

export const statusColors = {
	requested: "orange",
	live: "green",
	inProgress: "blue",
	onPlan: "teal",
	cancelled: "red",
	confirmed: "purple",
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
