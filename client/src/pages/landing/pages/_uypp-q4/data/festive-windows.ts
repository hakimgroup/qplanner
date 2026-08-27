/**
 * Campaign data for festive-windows, ported from `window.UYPP_CAMPAIGN` in the standalone
 * build. Content comes from the Q4 creative deck; the supplier add-ons come from
 * that deck's brand-activation slides.
 */
import { img } from "../uypp-q4";
import type { Campaign } from "../types";

export const FESTIVE: Campaign = {
	"orderLabel": "Order Festive posters",
	"routes": [
		{
			"id": "easy",
			"name": "Festive Made Easy",
			"tagline": "Option 01",
			"note": "<p class='route__note'>To find out more about how to deliver a window like this, please get in touch with marketing, or have a look below at the festive posters you can order.</p>",
			"contactSubject": "Festive Windows - Festive Made Easy",
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
					"key": "posters",
					"label": "Festive posters",
					"items": [
						{
							"img": img("festive-poster-sleigh.jpg"),
							"cap": "Seeing is Believing — A4 poster"
						},
						{
							"img": img("festive-poster-cookies.jpg"),
							"cap": "Even Santa needs a clear view — A4 poster"
						},
						{
							"img": img("festive-aboard-sleigh.jpg"),
							"cap": "Seeing is Believing on an A-board"
						},
						{
							"img": img("festive-aboard-cookies.jpg"),
							"cap": "Even Santa needs a clear view on an A-board"
						}
					]
				}
			]
		},
		{
			"id": "spark",
			"name": "The Spark",
			"tagline": "Option 02",
			"note": "<p class='route__note'>To find out more about how to deliver a window like this, please get in touch with marketing, or have a look below at the festive posters you can order.</p>",
			"contactSubject": "Festive Windows - The Spark",
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
					"key": "posters",
					"label": "Festive posters",
					"items": [
						{
							"img": img("festive-poster-sleigh.jpg"),
							"cap": "Seeing is Believing — A4 poster"
						},
						{
							"img": img("festive-poster-cookies.jpg"),
							"cap": "Even Santa needs a clear view — A4 poster"
						},
						{
							"img": img("festive-aboard-sleigh.jpg"),
							"cap": "Seeing is Believing on an A-board"
						},
						{
							"img": img("festive-aboard-cookies.jpg"),
							"cap": "Even Santa needs a clear view on an A-board"
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
			"howto": "<p>The first 10 practices in the group to purchase 12 pieces or more in a single order during September and October receive a BOSS gift-with-purchase set.</p><p>Sign up below to register your interest.</p><p>Final design may vary from the artwork shown.</p>"
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
			"howto": "<p>Only selected practices can successfully opt in. You will have received an email from <a href=\"mailto:brand.activations@hakimgroup.co.uk\">brand.activations@hakimgroup.co.uk</a> if you have been pre-selected. If you have received this email, please sign up below.</p><p>For any queries please email the brand activations inbox.</p><p>Artwork for this one is still to come from Luxottica.</p>"
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
			"howto": "<p>The first 40 practices in the group to sign up will receive their gift-with-purchase set.</p><p>Final design may vary from the artwork shown.</p>"
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
			"howto": "<p>Qualifying is order-based and first come, first served — see the allocations above.</p><p>Sign up below to register your interest.</p>"
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
			"howto": "<p>Contact your Thea rep for information and product training.</p>"
		}
	]
};
