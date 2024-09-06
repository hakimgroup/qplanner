import { Button, List, Text } from "@mantine/core";
import "./step3.scss";
import { CampaignModel } from "@/api/campaign";
import { useState } from "react";
import { DatePicker, DatePickerProps } from "@mantine/dates";
import clsx from "clsx";
import { useNavigate } from "react-router-dom";
import { AppRoutes } from "@/shared/shared.models";
import _ from "lodash";

interface Props {
	currentCampaign: CampaignModel;
}

const Step3 = ({ currentCampaign }: Props) => {
	const navigate = useNavigate();
	const [value, setValue] = useState<[Date | null, Date | null]>([
		null,
		null,
	]);

	const isDateInRange = (
		dateRanges: string[][],
		targetDate: Date
	): boolean => {
		// Convert targetDate to time for comparison
		const targetTime = targetDate.getTime();

		// Iterate through each date range in the array
		for (let i = 0; i < dateRanges?.length; i++) {
			const [startDate, endDate] = dateRanges[i];

			// Convert startDate and endDate to Date objects if they aren't already
			const startTime = new Date(startDate).getTime();
			const endTime = new Date(endDate).getTime();

			// Check if the targetTime is within the range (inclusive)
			if (targetTime >= startTime && targetTime <= endTime) {
				return true;
			}
		}

		// If no match is found, return false
		return false;
	};

	const dayRenderer: DatePickerProps["renderDay"] = (date) => {
		const day = date.getDate();
		const isInCampaign = isDateInRange(
			currentCampaign?.campaign_plans?.map((d) => d.campaign_period),
			date
		);
		return (
			<div
				className={clsx("custom-day", isInCampaign && "strike-through")}
				onClick={(e) => e.preventDefault()}
			>
				{day}
			</div>
		);
	};

	return (
		<div className="planner-step-3">
			<div className="ps3-content">
				<Text fw={800} c="pink">
					Overview
				</Text>
				<Text fz="h1" fw={600} c="dark">
					Yearly Overview |{" "}
					<Text fz="h1" fw={600} c="blue" span>
						2025 Campaigns
					</Text>
				</Text>
				<Text size="sm" c="dimmed" maw={600}>
					Great job! You've successfully created your campaigns for
					the year. This is your yearly overview, where you can see
					all your campaigns laid out in the calendar. Review your
					schedule, make adjustments if needed, and ensure your
					campaigns are perfectly timed to achieve maximum impact
					throughout the year.
				</Text>

				<div className="campaigns-overview">
					<div className="all-campaigns">
						<Text fz="h2" fw={600} c="blue" mb="lg">
							Campaigns
						</Text>

						<List>
							{currentCampaign?.campaign_plans?.map((cp, i) => (
								<List.Item
									className="cp-list-item"
									key={i}
									onMouseEnter={() => {
										setValue([
											new Date(cp.campaign_period[0]),
											new Date(cp.campaign_period[1]),
										]);
									}}
									onMouseLeave={() => setValue([null, null])}
								>
									<Text
										size="sm"
										c="dark"
										opacity={0.95}
										fw={300}
									>
										{_.truncate(cp.campaign_name, {
											length: 20,
										})}
									</Text>
									<Text
										c="blue"
										fw={500}
										className="range"
										mt={6}
									>
										{cp.campaign_period[0]} -{" "}
										{cp.campaign_period[1]}
									</Text>
								</List.Item>
							))}
						</List>
					</div>
					<div className="full-calendar">
						<DatePicker
							type="range"
							size="xs"
							allowSingleDateInRange
							numberOfColumns={12}
							minDate={new Date(2025, 0, 1)}
							maxDate={new Date(2025, 11, 31)}
							renderDay={dayRenderer}
							value={value}
						/>
						<Button
							fullWidth
							size="lg"
							mt={50}
							style={{ position: "sticky", bottom: "10px" }}
							onClick={() => navigate(AppRoutes.MyCampaigns)}
						>
							Go To My Campaigns
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Step3;
