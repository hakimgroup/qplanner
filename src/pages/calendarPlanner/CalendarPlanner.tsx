import "./calendarPlanner.scss";
import ProtectedWrapper from "@/shared/Protected";
import { useEffect } from "react";
import Step1 from "./steps/step1/Step1";
import Step2 from "./steps/step2/Step2";
import { useParams } from "react-router-dom";
import { useAllCampaigns, useCampaign } from "./campaign.hooks";
import Step3 from "./steps/step3/Step3";

const CalendarPlanner = () => {
	const { campaignId, stage } = useParams();

	//APIs
	const { data, refetch } = useCampaign(campaignId, false);
	const { data: allCampaigns } = useAllCampaigns();

	const STEPS = {
		undefined: <Step1 />,
		1: <Step1 />,
		2: <Step2 allCampaigns={allCampaigns} currentCampaign={data?.[0]} />,
		3: <Step3 currentCampaign={data?.[0]} />,
	};

	useEffect(() => {
		if (campaignId) {
			refetch();
		}
	}, [campaignId, stage]);

	return (
		<ProtectedWrapper>
			<div className="calendar-planner">
				<section className="step-container">{STEPS[stage]}</section>
			</div>
		</ProtectedWrapper>
	);
};

export default CalendarPlanner;
