import { createClient } from "@supabase/supabase-js";
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

// Christmas artworks (from the version with artworks)
const christmasCreatives: Creative[] = [
	{ url: "https://cdn.hakimgroup.io/digE8/lERiSElI92.jpg/raw", label: "Creative 1" },
	{ url: "https://cdn.hakimgroup.io/digE8/qISUJofo26.jpg/raw", label: "Creative 2" },
	{ url: "https://cdn.hakimgroup.io/digE8/dicequCI62.jpg/raw", label: "Creative 3" },
	{ url: "https://cdn.hakimgroup.io/digE8/faTUDobA15.jpg/raw", label: "Creative 4" },
];

// Summer of Sport artworks (from the version with artworks)
const summerOfSportCreatives: Creative[] = [
	{ url: "https://cdn.hakimgroup.io/digE8/wiCOfovO19.jpg/raw", label: "Creative 1" },
	{ url: "https://cdn.hakimgroup.io/digE8/doJUsEsU10.jpg/raw", label: "Creative 2" },
	{ url: "https://cdn.hakimgroup.io/digE8/PExAdonA80.jpg/raw", label: "Creative 3" },
	{ url: "https://cdn.hakimgroup.io/digE8/TarUsEWE76.jpg/raw", label: "Creative 4" },
	{ url: "https://cdn.hakimgroup.io/digE8/NiZAsIMi57.jpg/raw", label: "Creative 5" },
	{ url: "https://cdn.hakimgroup.io/digE8/DILUqeCo49.jpg//raw", label: "Creative 6" },
	{ url: "https://cdn.hakimgroup.io/digE8/QIGOkAwe40.jpg/raw", label: "Creative 7" },
];

async function fixDuplicateCreatives() {
	console.log("🔍 Finding campaigns with duplicate names...\n");

	// Find all Christmas campaigns
	const { data: christmasCampaigns, error: christmasError } = await supabase
		.from("campaigns_catalog")
		.select("id, name, category")
		.ilike("name", "Christmas");

	if (christmasError) {
		console.error("❌ Error finding Christmas campaigns:", christmasError.message);
	} else if (christmasCampaigns) {
		console.log(`Found ${christmasCampaigns.length} "Christmas" campaign(s):`);
		christmasCampaigns.forEach((c) => {
			console.log(`  - ID: ${c.id}, Category: ${c.category || "N/A"}`);
		});

		// Update all Christmas campaigns with the creatives
		for (const campaign of christmasCampaigns) {
			const { error: updateError } = await supabase
				.from("campaigns_catalog")
				.update({ creatives: christmasCreatives })
				.eq("id", campaign.id);

			if (updateError) {
				console.error(`❌ Error updating Christmas (${campaign.id}):`, updateError.message);
			} else {
				console.log(`✅ Updated Christmas (${campaign.category || "N/A"}) with ${christmasCreatives.length} creatives`);
			}
		}
	}

	console.log("\n");

	// Find all Summer of Sport campaigns
	const { data: summerCampaigns, error: summerError } = await supabase
		.from("campaigns_catalog")
		.select("id, name, category")
		.ilike("name", "Summer of Sport");

	if (summerError) {
		console.error("❌ Error finding Summer of Sport campaigns:", summerError.message);
	} else if (summerCampaigns) {
		console.log(`Found ${summerCampaigns.length} "Summer of Sport" campaign(s):`);
		summerCampaigns.forEach((c) => {
			console.log(`  - ID: ${c.id}, Category: ${c.category || "N/A"}`);
		});

		// Update all Summer of Sport campaigns with the creatives
		for (const campaign of summerCampaigns) {
			const { error: updateError } = await supabase
				.from("campaigns_catalog")
				.update({ creatives: summerOfSportCreatives })
				.eq("id", campaign.id);

			if (updateError) {
				console.error(`❌ Error updating Summer of Sport (${campaign.id}):`, updateError.message);
			} else {
				console.log(`✅ Updated Summer of Sport (${campaign.category || "N/A"}) with ${summerOfSportCreatives.length} creatives`);
			}
		}
	}

	console.log("\n✨ Done!");
}

// Run the script
fixDuplicateCreatives()
	.then(() => {
		process.exit(0);
	})
	.catch((error) => {
		console.error("\n💥 Fatal error:", error);
		process.exit(1);
	});
