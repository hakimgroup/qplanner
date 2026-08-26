/**
 * Campaign data for menopause-dry-eye, ported from `window.UYPP_CAMPAIGN` in the standalone
 * build. Content comes from the Q4 creative deck; the supplier add-ons come from
 * that deck's brand-activation slides.
 */
import { img } from "../uypp-q4";
import type { Campaign } from "../types";

export const DRY_EYE: Campaign = {
	"routes": [
		{
			"id": "prickly",
			"name": "The Prickly Truth",
			"tagline": "Route 01",
			"accent": "#D94E8F",
			"visual": img("meno-prickly-posters.jpg"),
			"body": "<p class='route__body'>Using distinctive floral illustrations that naturally evoke dryness, irritation and discomfort, the campaign creates an immediate visual metaphor for the symptoms many women experience.</p><p class='route__body'>We combine bold visuals with conversational copy and simple educational facts, creating standout creative that encourages recognition, starts a conversation and reassures patients that support is available through their local independent optician.</p>",
			"assets": [
				"Poster A0–A5",
				"A-board",
				"Window decal",
				"Strut card",
				"A5 leaflet",
				"IPTV",
				"Social",
				"Email",
				"Event"
			],
			"placements": [
				{
					"key": "posters",
					"label": "Posters",
					"items": [
						{
							"img": img("meno-prickly-posters-situ.jpg"),
							"cap": "A0–A5"
						},
						{
							"img": img("meno-prickly-poster-1.jpg"),
							"cap": "Dry"
						},
						{
							"img": img("meno-prickly-poster-2.jpg"),
							"cap": "Irritated"
						},
						{
							"img": img("meno-prickly-poster-3.jpg"),
							"cap": "Gritty"
						}
					]
				},
				{
					"key": "aboard",
					"label": "A-board",
					"items": [
						{
							"img": img("meno-prickly-aboard-situ.jpg"),
							"cap": "A-board outside the practice"
						}
					]
				},
				{
					"key": "window",
					"label": "Window",
					"items": [
						{
							"img": img("meno-prickly-window.jpg"),
							"cap": "Window decal"
						}
					]
				},
				{
					"key": "strut",
					"label": "Strut card",
					"items": [
						{
							"img": img("meno-prickly-strut-situ.jpg"),
							"cap": "Strut card on the counter"
						}
					]
				},
				{
					"key": "leaflet",
					"label": "Leaflet",
					"items": [
						{
							"img": img("meno-prickly-doordrop-situ.jpg"),
							"cap": "A5 leaflet"
						}
					]
				},
				{
					"key": "iptv",
					"label": "IPTV",
					"items": [
						{
							"img": img("meno-prickly-iptv-landscape-anim.gif"),
							"cap": "IPTV loop",
							"badge": "Animated"
						}
					]
				},
				{
					"key": "social",
					"label": "Social",
					"items": [
						{
							"img": img("meno-prickly-carousel-anim.gif"),
							"cap": "Carousel posts",
							"badge": "Animated"
						},
						{
							"img": img("meno-prickly-story.jpg"),
							"cap": "Story posts"
						}
					]
				},
				{
					"key": "email",
					"label": "Email",
					"items": [
						{
							"img": img("meno-prickly-email.jpg"),
							"cap": "Email template"
						}
					]
				},
				{
					"key": "event",
					"label": "Event",
					"items": [
						{
							"img": img("meno-prickly-event-situ.jpg"),
							"cap": "Event assets"
						}
					]
				}
			]
		},
		{
			"id": "ripple",
			"name": "The Ripple Effect",
			"tagline": "Route 02",
			"accent": "#F08050",
			"visual": img("meno-ripple-keyvisual.jpg"),
			"body": "<p class='route__body'>Menopause reaches further than many women realise, with hormonal changes creating a ripple effect throughout the body, including the eyes.</p><p class='route__body'>Building on this ‘ripple effect’ idea, we created a distinctive pattern, relatable lifestyle imagery and conversational messaging to help women recognise an often-overlooked symptom and understand they don't simply have to live with it. The campaign also positions independent opticians as trusted experts, offering reassurance, guidance and straightforward treatment options.</p>",
			"assets": [
				"Window display",
				"A-board",
				"IPTV",
				"A5 leaflet",
				"In-practice collateral",
				"Social",
				"Event"
			],
			"placements": [
				{
					"key": "window",
					"label": "Window",
					"items": [
						{
							"img": img("meno-ripple-practicefront-situ.jpg"),
							"cap": "Practice frontage"
						},
						{
							"img": img("meno-ripple-window.jpg"),
							"cap": "Window display"
						}
					]
				},
				{
					"key": "aboard",
					"label": "A-board",
					"items": [
						{
							"img": img("meno-ripple-aboard-situ.jpg"),
							"cap": "A-board outside the practice"
						}
					]
				},
				{
					"key": "event",
					"label": "Event",
					"items": [
						{
							"img": img("meno-ripple-event.jpg"),
							"cap": "Event artwork"
						}
					]
				},
				{
					"key": "leaflet",
					"label": "Leaflet",
					"items": [
						{
							"img": img("meno-ripple-doordrop-situ.jpg"),
							"cap": "A5 leaflet"
						}
					]
				},
				{
					"key": "strut",
					"label": "Strut card",
					"items": [
						{
							"img": img("meno-ripple-strut-situ.jpg"),
							"cap": "Strut card on the counter"
						},
						{
							"img": img("meno-ripple-instore.jpg"),
							"cap": "In-practice collateral and strut card"
						}
					]
				},
				{
					"key": "iptv",
					"label": "IPTV",
					"items": [
						{
							"img": img("meno-ripple-iptv.jpg"),
							"cap": "IPTV screen in practice"
						}
					]
				},
				{
					"key": "social",
					"label": "Social",
					"items": [
						{
							"img": img("meno-ripple-social.jpg"),
							"cap": "Social posts"
						},
						{
							"img": img("meno-ripple-carousel-anim.gif"),
							"cap": "Dry eye carousel",
							"badge": "Animated"
						},
						{
							"img": img("meno-ripple-carousel-situ-anim.gif"),
							"cap": "Carousel on device",
							"badge": "Animated"
						},
						{
							"img": img("meno-ripple-story-anim.gif"),
							"cap": "Story post",
							"badge": "Animated"
						}
					]
				}
			]
		}
	],
	"brands": [
		{
			"id": "body-doctor",
			"name": "The Body Doctor",
			"logo": img("logo-body-doctor.png"),
			"offer": "Buy 8, get 2 free through October on three hero products",
			"body": "<p>Many patients, particularly those going through menopause, don't recognise that dry eye symptoms can be linked to hormonal changes, or that effective over-the-counter solutions exist.</p><p>Focusing on three hero products keeps the conversation simple, supports the patient's dry eye and generates incremental OTC sales. The three follow The Body Doctor's recommended heat, cleanse, revive routine.</p>",
			"gives": [
				"Buy 8, get 2 free throughout October",
				"Staff training deck on talking about menopause in practice",
				"Social media assets",
				"Patient email headers and templates"
			],
			"products": [
				"The Eye Doctor Premium Antibacterial Compress",
				"The Eye Doctor Hypochlorous Eyelid Cleansing Spray",
				"The Eye Doctor Advanced Triple Action Eye Drops"
			],
			"howto": "<p>Opt in through The Body Doctor's form. The link is still to be supplied.</p>",
			"cta": "Opt in"
		},
		{
			"id": "thea",
			"name": "Thea",
			"logo": img("logo-thea.png"),
			"offer": "Dry eye awareness assets, counter display and a CPD webinar",
			"body": "<p>Dry eye products give effective relief and comfort, letting many patients manage their symptoms without more advanced or invasive treatment.</p><p>Making dry eye part of a more holistic approach to eyecare improves patient comfort and creates an opportunity for incremental retail spend.</p>",
			"gives": [
				"Point of sale, and a counter display unit for the test room",
				"Product overview counter mat",
				"CPD webinar, &ldquo;Let's Talk Menopause &mdash; Understanding the Impact on Your Patients&rdquo;, on demand via Thea Academy",
				"Patient how-to-use guides"
			],
			"products": [
				"BLEPHACLEAN&reg; PF",
				"BLEPHADERM&reg;",
				"THEALOZ DUO&reg; or THEALOZ DUO GEL"
			],
			"howto": "<p>Contact your Thea Area Sales Manager.</p>",
			"cta": "Contact your ASM"
		}
	]
};
