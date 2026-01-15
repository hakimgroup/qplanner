import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const supabase = createClient(
	process.env.SUPABASE_URL!,
	process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface Creative {
	url: string;
	label: string;
}

interface CampaignRow {
	campaign: string;
	activity: string;
	artworks: string[];
}

// Parse CSV file
function parseCSV(filePath: string): CampaignRow[] {
	const content = fs.readFileSync(filePath, "utf-8");
	const lines = content.split("\n");

	// Skip header row
	const campaigns: CampaignRow[] = [];

	for (let i = 1; i < lines.length; i++) {
		const line = lines[i].trim();
		if (!line) continue;

		// Split by comma, handling quoted values
		const values = line.split(",");

		const campaign = values[0]?.trim();
		const activity = values[1]?.trim();

		// Skip if no campaign name
		if (!campaign) continue;

		// Collect all artwork URLs (columns 2 onwards)
		const artworks: string[] = [];
		for (let j = 2; j < values.length; j++) {
			const artwork = values[j]?.trim();
			if (artwork && artwork.startsWith("http")) {
				artworks.push(artwork);
			}
		}

		campaigns.push({ campaign, activity, artworks });
	}

	return campaigns;
}

// Update campaigns_catalog with creatives
async function updateCampaignCreatives() {
	const csvPath = "/Users/bratuaseimodei/Downloads/HG Planner - Campaign Artwork.csv";

	console.log("📖 Reading CSV file...");
	const campaignRows = parseCSV(csvPath);

	console.log(`✅ Found ${campaignRows.length} campaigns in CSV\n`);

	let updated = 0;
	let notFound = 0;
	let errors = 0;

	for (const row of campaignRows) {
		try {
			// Skip if no artworks
			if (row.artworks.length === 0) {
				console.log(`⏭️  Skipping "${row.campaign}" (no artworks)`);
				continue;
			}

			// Create creatives array
			const creatives: Creative[] = row.artworks.map((url, index) => ({
				url: url,
				label: `Creative ${index + 1}`,
			}));

			// Find campaign in database by name (case-insensitive)
			const { data: campaigns, error: searchError } = await supabase
				.from("campaigns_catalog")
				.select("id, name")
				.ilike("name", row.campaign);

			if (searchError) {
				console.error(`❌ Error searching for "${row.campaign}":`, searchError.message);
				errors++;
				continue;
			}

			if (!campaigns || campaigns.length === 0) {
				console.log(`⚠️  Campaign not found: "${row.campaign}"`);
				notFound++;
				continue;
			}

			// If multiple matches, use the first one
			const campaign = campaigns[0];

			// Update the campaign with creatives
			const { error: updateError } = await supabase
				.from("campaigns_catalog")
				.update({ creatives: creatives })
				.eq("id", campaign.id);

			if (updateError) {
				console.error(`❌ Error updating "${row.campaign}":`, updateError.message);
				errors++;
				continue;
			}

			console.log(`✅ Updated "${row.campaign}" with ${creatives.length} creative(s)`);
			updated++;
		} catch (error: any) {
			console.error(`❌ Unexpected error for "${row.campaign}":`, error.message);
			errors++;
		}
	}

	console.log("\n" + "=".repeat(60));
	console.log("📊 Summary:");
	console.log(`   ✅ Updated: ${updated}`);
	console.log(`   ⚠️  Not found: ${notFound}`);
	console.log(`   ❌ Errors: ${errors}`);
	console.log("=".repeat(60));
}

// Run the script
updateCampaignCreatives()
	.then(() => {
		console.log("\n🎉 Done!");
		process.exit(0);
	})
	.catch((error) => {
		console.error("\n💥 Fatal error:", error);
		process.exit(1);
	});
