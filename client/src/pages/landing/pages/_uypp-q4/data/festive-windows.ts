/**
 * Campaign data for festive-windows, ported from `window.UYPP_CAMPAIGN` in the standalone
 * build. Content comes from the Q4 creative deck; the supplier add-ons come from
 * that deck's brand-activation slides.
 */
import { img } from "../uypp-q4";
import type { Campaign } from "../types";

export const FESTIVE: Campaign = {
	"routes": [
		{
			"id": "easy",
			"name": "Festive Made Easy",
			"tagline": "Option 01",
			"accent": "#C9A227",
			"visual": img("festive-easy-1.jpg"),
			"body": "<p class='route__body'>Simple, accessible decor using readily available products. Paper stars, fairy lights, hanging fans and miniature trees, everything here can be bought off the shelf and put up by the practice team in an afternoon.</p>",
			"assets": [
				"Paper stars",
				"Fairy lights",
				"Hanging fans",
				"Miniature trees",
				"Window vinyl"
			],
			"placements": [
				{
					"key": "decor",
					"label": "Decor ideas",
					"items": [
						{
							"img": img("festive-easy-1.jpg"),
							"cap": "Stars, lights and hanging decor"
						}
					]
				},
				{
					"key": "windows",
					"label": "In-window",
					"items": [
						{
							"img": img("festive-easy-2.jpg"),
							"cap": "Window display example"
						},
						{
							"img": img("festive-easy-3.jpg"),
							"cap": "Window display example"
						}
					]
				}
			]
		},
		{
			"id": "spark",
			"name": "The Spark",
			"tagline": "Option 02",
			"accent": "#AA9278",
			"visual": img("festive-spark.jpg"),
			"body": "<p class='route__body'>More considered, bespoke display pieces designed to create standout impact. A step up in production value, sculptural frames, gift displays and village scenes that reward a second look from the pavement.</p>",
			"assets": [
				"Bespoke display pieces",
				"Frame sculptures",
				"Gift displays",
				"Village scenes"
			],
			"placements": [
				{
					"key": "pieces",
					"label": "Display pieces",
					"items": [
						{
							"img": img("festive-spark.jpg"),
							"cap": "Bespoke display pieces"
						}
					]
				}
			]
		},
		{
			"id": "storytelling",
			"name": "Window Storytelling",
			"tagline": "Option 03",
			"accent": "#8C6C55",
			"visual": img("festive-storytelling.jpg"),
			"body": "<p class='route__body'>Bring in a local illustrator, visual merchandiser or window dresser to create a fully bespoke festive installation. The biggest commitment of the three, and the one most likely to get your practice talked about locally.</p>",
			"assets": [
				"Local illustrator",
				"Visual merchandiser",
				"Window dresser",
				"Bespoke installation"
			],
			"placements": [
				{
					"key": "install",
					"label": "Installation",
					"items": [
						{
							"img": img("festive-storytelling.jpg"),
							"cap": "Fully bespoke festive installation"
						}
					]
				}
			]
		}
	],
	"brands": [
		{
			"id": "boss",
			"name": "BOSS",
			"logo": img("logo-boss.png"),
			"group": "Gift with purchase",
			"offer": "Five branded magnetic phone wallets to give away with BOSS frames",
			"body": "<p>A free gift with the frames is a straightforward way to secure the dispense, and it can push a lower-spend dispense into a more premium range. Best run from late November through December, when customers are already prioritising spend towards Christmas.</p><p>Display the gifts next to the BOSS frames, and brief the team to offer it — including the suggestion that it saves the customer buying a gift for someone else.</p>",
			"gives": [
				"Five BOSS branded magnetic phone wallets per qualifying practice"
			],
			"products": [
				"BOSS frames"
			],
			"howto": "<p>The first 10 practices in the group to purchase 12 pieces or more in a single order during September and October receive a BOSS gift-with-purchase set.</p><p>Final design may vary from the artwork shown.</p>",
			"cta": "How to qualify"
		},
		{
			"id": "oakley",
			"name": "Oakley",
			"logo": img("logo-oakley.png"),
			"group": "Gift with purchase",
			"offer": "Ten Oakley baseball caps to give away with Oakley frames",
			"body": "<p>Same mechanic as the other gift-with-purchase activations: run it from late November through December, display the caps beside the Oakley frames, and brief the team to use it to secure the dispense.</p>",
			"gives": [
				"Ten Oakley baseball caps per selected practice"
			],
			"products": [
				"Oakley frames"
			],
			"howto": "<p>Only selected practices can opt in. An email arrives from <a href=\"mailto:brand.activations@hakimgroup.co.uk\">brand.activations@hakimgroup.co.uk</a> if your practice has been chosen.</p><p>Artwork for this one is still to come from Luxottica.</p>",
			"cta": "How selection works"
		},
		{
			"id": "ted-baker",
			"name": "Ted Baker",
			"logo": img("logo-ted-baker.png"),
			"group": "Gift with purchase",
			"offer": "Ten branded re-usable coffee cups to give away with Ted Baker frames",
			"body": "<p>A free gift with the frames is a straightforward way to secure the dispense, and it can push a lower-spend dispense into a more premium range. Best run from late November through December, when customers are already prioritising spend towards Christmas.</p><p>Display the gifts next to the Ted Baker frames, and brief the team to offer it — including the suggestion that it saves the customer buying a gift for someone else.</p>",
			"gives": [
				"Ten Ted Baker branded re-useable coffee cups per qualifying practice"
			],
			"products": [
				"Ted Baker frames"
			],
			"howto": "<p>The first 40 practices in the group to sign up will receive their gift-with-purchase set.</p><p>The sign-up form that collects your details for the supplier is being set up. Until it is live this button opens an email to the marketing team, who will add you to the list.</p><p>Final design may vary from the artwork shown.</p>",
			"cta": "Sign up"
		},
		{
			"id": "design-eyewear",
			"name": "Design Eyewear Group",
			"logo": img("logo-prodesign.png"),
			"group": "Gift with purchase",
			"offer": "A free sunglass with every optical frame purchase, on Prodesign and Face a Face",
			"body": "<p>Display the sunglasses, or a clearly branded &ldquo;free sunglass with every purchase&rdquo; message, next to the relevant frames.</p><p><strong>Still to be confirmed:</strong> whether Design Eyewear supply the strut cards carrying that message. The rest of the activation is confirmed and can be taken up now.</p>",
			"gives": [
				"Prodesign: 10 sunglasses with any order over 20 pieces &mdash; max 25 practices, first come first served",
				"Prodesign: 10 pocket mirrors with any order over 15 pieces &mdash; max 25 practices, first come first served",
				"Face a Face: one Polaroid camera with any order over 20 pieces &mdash; max 10 practices, first come first served"
			],
			"products": [
				"Prodesign",
				"Face a Face"
			],
			"howto": "<p>Qualifying is order-based and first come, first served — see the allocations above.</p>",
			"cta": "How to qualify"
		},
		{
			"id": "thea",
			"name": "Thea",
			"logo": img("logo-thea.png"),
			"group": "Product and training support",
			"offer": "Party-season dry eye conversations, counter display and how-to videos",
			"body": "<p>Party season takes its toll on eyes. Late nights, a busy social calendar, more screen time, alcohol and heavier eye make-up all leave eyes feeling tired, dry and uncomfortable.</p><p>Linking dry eye care to the realities of December makes the conversation timely rather than clinical, and creates an opportunity for incremental revenue.</p>",
			"gives": [
				"Counter display unit for the test room and the retail area",
				"Thea recommendation pad, handed to the patient by the optometrist or CLO",
				"Step-by-step how-to videos to show patients"
			],
			"products": [
				"BlephaEyeBag",
				"Blephaclean PF Eyelid Cleansing Wipes",
				"Blephasol Micellar Solution",
				"Blephaderm Eyelid and Eye Contour Cream"
			],
			"howto": "<p>Contact your Thea rep for information and product training.</p>",
			"cta": "Contact your rep"
		},
		{
			"id": "silhouette",
			"name": "Silhouette",
			"logo": img("logo-silhouette.png"),
			"group": "Product and training support",
			"status": "tbc",
			"offer": "Christmas window support, held for the Festive Focus Toolkit",
			"body": "<p>Silhouette are supporting Christmas windows, but it has been held back to launch with the wider Festive Focus Toolkit rather than with this campaign.</p>"
		},
		{
			"id": "alcon",
			"name": "Alcon",
			"logo": img("logo-alcon.png"),
			"group": "Product and training support",
			"status": "tbc",
			"offer": "Promotion detail not yet available",
			"body": "<p>Listed against this campaign in the Q4 brief with no mechanics attached yet.</p>"
		},
		{
			"id": "bausch-lomb",
			"name": "Bausch + Lomb",
			"logo": img("logo-bausch-lomb.png"),
			"group": "Product and training support",
			"status": "tbc",
			"offer": "Still to be confirmed",
			"body": "<p>Listed against this campaign in the Q4 brief, marked to be confirmed.</p>"
		}
	]
};
