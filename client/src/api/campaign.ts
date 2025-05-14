import { DatabaseTables } from "@/shared/shared.models";
import { supabase } from "./supabase";
import { toast } from "sonner";
import api from "./express";

export interface CampaignPlan {
	campaign_name: string;
	campaign_id: string;
	campaign_link: string;
	campaign_period: string[];
	campaign_note?: string;
}

export interface CampaignModel {
	creator_id: string;
	created_at?: any;
	campaign_id?: string;
	personal_details?: {
		name?: string;
		practiceName?: string;
		email?: string;
		strategyName?: string;
	};
	campaign_plans?: CampaignPlan[];
}

export interface CampaignsModel {
	campaign_id?: string;
	campaign_type: string;
	campaign_name: string;
	campaign_availability: string[];
	campaign_link: string;
	campaign_tags: string[];
	campaign_description: string;
}

export interface EmailModel {
	to: string;
	subject: string;
	html: any;
}

export const getCampaign = async (
	user_id: string,
	campaign_id: string,
	onSuccess?: () => void
) => {
	let query = supabase.from(DatabaseTables.Campaigns).select();

	if (campaign_id) {
		query = query.eq("campaign_id", campaign_id);
	}

	if (user_id) {
		query = query.eq("creator_id", user_id);
	}

	const { data, error } = await query;

	if (onSuccess) onSuccess();

	if (error) {
		throw new Error(error.message);
	}

	if (!data) {
		toast.error("Something went wrong", { position: "top-center" });
		throw new Error("Something went wrong");
	}

	return data;
};

export const createCampaign = async (campaign: CampaignModel) => {
	const { data, error } = await supabase
		.from(DatabaseTables.Campaigns)
		.insert(campaign)
		.select()
		.single();

	if (error) {
		toast.error("Unable to create a campaign. Please try again.", {
			position: "top-center",
		});
		throw error;
	}

	return data as CampaignModel;
};

export const updateCampaign = async (campaign: CampaignModel) => {
	const { data, error } = await supabase
		.from(DatabaseTables.Campaigns)
		.update({ ...campaign })
		.eq("campaign_id", campaign.campaign_id)
		.select()
		.single();

	if (error) {
		toast.error(
			"Something went wrong. Please check your details and try again.",
			{ position: "top-center" }
		);
		throw new Error(error.message);
	}

	return data as CampaignModel;
};

export const getAllCampaigns = async (
	campaign_id?: string,
	onSuccess?: () => void
) => {
	let query = supabase.from(DatabaseTables.CampaignsList).select();

	if (campaign_id) {
		query = query.eq("campaign_id", campaign_id);
	}

	const { data, error } = await query;

	if (onSuccess) onSuccess();

	if (error) {
		throw new Error(error.message);
	}

	if (!data) {
		toast.error("Something went wrong", { position: "top-center" });
		throw new Error("Something went wrong");
	}

	return data as CampaignsModel[];
};

export const addCampaignAdmin = async (campaign: CampaignsModel) => {
	const { data, error } = await supabase
		.from(DatabaseTables.CampaignsList)
		.insert(campaign)
		.select()
		.single();

	if (error) {
		toast.error("Unable to add this campaign. Please try again.", {
			position: "top-center",
		});
		throw error;
	}

	return data as CampaignsModel;
};

export const editCampaignInList = async (campaign: CampaignsModel) => {
	const { data, error } = await supabase
		.from(DatabaseTables.CampaignsList)
		.update(campaign)
		.eq("campaign_id", campaign.campaign_id)
		.select()
		.single();

	if (error) {
		toast.error(
			"Something went wrong. Please check your details and try again.",
			{ position: "top-center" }
		);
		throw new Error(error.message);
	}

	return data;
};

export const sendEmail = async (emailDetails: EmailModel) => {
	const { data } = await api.post(`/send_email`, emailDetails);
	return data;
};
