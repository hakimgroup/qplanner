export enum AppRoutes {
	Home = "/",
	Login = "/login",
	Dashboard = "/dashboard",
	Admin = "/admin",
}

export enum DatabaseTables {
	Users = "users",
	Campaigns = "campaigns",
	CampaignsCatalog = "campaigns_catalog",
	Selections = "selections",
	Practices = "practices",
	Allowed_Users = "allowed_users",
	BespokeCampaigns = "bespoke_campaigns",
}

export enum RPCFunctions {
	LinkUser = "link_current_user",
	AssignUserToPractice = "assign_user_to_practice",
	UnAssignUserFromPractice = "unassign_user_from_practice",
	GetCampaigns = "get_campaigns",
	CreateBespokeSelection = "create_bespoke_selection",
	AddCampaignsBulk = "add_campaigns_bulk",
}

export enum SelectionStatus {
	Requested = "requested",
	Live = "live",
	InProgress = "inProgress",
	OnPlan = "onPlan",
	Cancelled = "cancelled",
	Confirmed = "confirmed",
}
