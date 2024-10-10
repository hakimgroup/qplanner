import { Html, Button } from "@react-email/components";

interface Props {
	url?: string;
}

const CampaignSummary = (props: Props) => {
	const { url } = props;

	return (
		<Html lang="en">
			<Button href={url}>Click me</Button>
		</Html>
	);
};

export default CampaignSummary;
