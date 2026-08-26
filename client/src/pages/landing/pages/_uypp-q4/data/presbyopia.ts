/**
 * Campaign data for presbyopia, ported from `window.UYPP_CAMPAIGN` in the standalone
 * build. Content comes from the Q4 creative deck; the supplier add-ons come from
 * that deck's brand-activation slides.
 */
import { img } from "../uypp-q4";
import type { Campaign } from "../types";

export const PRESBYOPIA: Campaign = {
	"routes": [
		{
			"id": "adapt",
			"name": "Everyday Adaptations",
			"tagline": "Route 01",
			"accent": "#E58538",
			"visual": img("pres-adapt-posters.jpg"),
			"body": "<p class='route__body'>When close-up vision starts to change, people often develop small habits to cope without even realising it. This route brings those familiar behaviours to life, creating an instant moment of recognition.</p><p class='route__body'>Bold colour, cut-out imagery and conversational messaging keep the creative relatable and engaging, helping people recognise the signs in their own lives. It then gives them a clear next step, encouraging them to speak to their local optician about their changing vision.</p>",
			"assets": [
				"Posters",
				"A-board",
				"Window",
				"Door drop leaflet",
				"IPTV",
				"Email",
				"Social"
			],
			"placements": [
				{
					"key": "posters",
					"label": "Posters",
					"items": [
						{
							"img": img("pres-adapt-posters-situ.jpg"),
							"cap": "A0–A4"
						},
						{
							"img": img("pres-adapt-poster-1.jpg"),
							"cap": "Poster 1"
						},
						{
							"img": img("pres-adapt-poster-2.jpg"),
							"cap": "Poster 2"
						},
						{
							"img": img("pres-adapt-poster-3.jpg"),
							"cap": "Poster 3"
						}
					]
				},
				{
					"key": "aboard",
					"label": "A-board",
					"items": [
						{
							"img": img("pres-adapt-aboard-situ.jpg"),
							"cap": "A-board outside the practice"
						}
					]
				},
				{
					"key": "leaflet",
					"label": "Leaflet",
					"items": [
						{
							"img": img("pres-adapt-leaflet.jpg"),
							"cap": "Leaflet, front and back"
						}
					]
				},
				{
					"key": "iptv",
					"label": "IPTV",
					"items": [
						{
							"img": img("pres-adapt-iptv-anim.gif"),
							"cap": "IPTV loop",
							"badge": "Animated"
						}
					]
				},
				{
					"key": "email",
					"label": "Email",
					"items": [
						{
							"img": img("pres-adapt-email-situ.jpg"),
							"cap": "Email template"
						}
					]
				},
				{
					"key": "social",
					"label": "Social",
					"items": [
						{
							"img": img("pres-adapt-social.jpg"),
							"cap": "Story post and Facebook ad"
						}
					]
				}
			]
		},
		{
			"id": "type",
			"name": "Type in Focus",
			"tagline": "Route 02",
			"accent": "#DB4E9C",
			"visual": img("pres-type-posters.jpg"),
			"body": "<p class='route__body'>Rather than simply telling people what changing close-up vision feels like, this route lets them experience it.</p><p class='route__body'>Bold typography, bright colour and intentionally challenging layouts recreate the frustration of struggling with small print, creating an instant connection with the audience. The messaging then shifts from frustration to reassurance, showing that these changes are common, manageable and worth talking about with an eye care professional.</p>",
			"assets": [
				"Posters",
				"A-board",
				"Window",
				"Tent card",
				"Leaflet",
				"IPTV",
				"Social"
			],
			"placements": [
				{
					"key": "posters",
					"label": "Posters",
					"items": [
						{
							"img": img("pres-type-posters-situ.jpg"),
							"cap": "A0–A4"
						},
						{
							"img": img("pres-type-poster-1.jpg"),
							"cap": "Poster 1"
						},
						{
							"img": img("pres-type-poster-2.jpg"),
							"cap": "Poster 2"
						},
						{
							"img": img("pres-type-poster-3.jpg"),
							"cap": "Poster 3"
						}
					]
				},
				{
					"key": "aboard",
					"label": "A-board",
					"items": [
						{
							"img": img("pres-type-aboard-situ.jpg"),
							"cap": "A-board outside the practice"
						}
					]
				},
				{
					"key": "tentcard",
					"label": "Tent card",
					"items": [
						{
							"img": img("pres-type-tentcard-situ.jpg"),
							"cap": "A5 tent card on the counter"
						}
					]
				},
				{
					"key": "iptv",
					"label": "IPTV",
					"items": [
						{
							"img": img("pres-type-iptv-anim.gif"),
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
							"img": img("pres-type-social.jpg"),
							"cap": "Social carousel and Facebook post"
						},
						{
							"img": img("pres-type-carousel-anim.gif"),
							"cap": "Social carousel",
							"badge": "Animated"
						}
					]
				}
			]
		},
		{
			"id": "bigger",
			"name": "When Bigger Isn’t Better",
			"tagline": "Route 03",
			"accent": "#3FA9DD",
			"visual": img("pres-bigger-keyvisual.jpg"),
			"body": "<p class='route__body'>Making the text bigger can feel like the obvious answer when close-up vision becomes harder, but it doesn’t address what’s really changing.</p><p class='route__body'>This route takes that familiar workaround and pushes it to the extreme, using oversized, disrupted typography to create a playful “that’s me” moment. By challenging the habit of simply zooming in and carrying on, the campaign encourages people to take the next step and have their vision checked.</p>",
			"assets": [
				"External signage",
				"Window",
				"A-board",
				"Shelf wobbler",
				"Mirror decal",
				"IPTV",
				"Social",
				"CRM"
			],
			"placements": [
				{
					"key": "posters",
					"label": "Posters",
					"items": [
						{
							"img": img("pres-bigger-keyvisual.jpg"),
							"cap": "A0–A4"
						}
					]
				},
				{
					"key": "aboard",
					"label": "A-board",
					"items": [
						{
							"img": img("pres-bigger-aboard-situ.jpg"),
							"cap": "A-board outside the practice"
						}
					]
				},
				{
					"key": "window",
					"label": "Window",
					"items": [
						{
							"img": img("pres-bigger-window-situ.jpg"),
							"cap": "Window decal"
						}
					]
				},
				{
					"key": "wobbler",
					"label": "Wobbler",
					"items": [
						{
							"img": img("pres-bigger-wobbler.jpg"),
							"cap": "Shelf wobbler"
						}
					]
				},
				{
					"key": "decal",
					"label": "Indoor decal",
					"items": [
						{
							"img": img("pres-bigger-decal.jpg"),
							"cap": "Mirror decal"
						}
					]
				},
				{
					"key": "iptv",
					"label": "IPTV",
					"items": [
						{
							"img": img("pres-bigger-iptv-anim.gif"),
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
							"img": img("pres-bigger-insta-anim.gif"),
							"cap": "Instagram and Facebook posts",
							"badge": "Animated"
						},
						{
							"img": img("pres-bigger-story-anim.gif"),
							"cap": "Story post",
							"badge": "Animated"
						},
						{
							"img": img("pres-bigger-social-anim.gif"),
							"cap": "Social cut-down",
							"badge": "Animated"
						}
					]
				},
				{
					"key": "email",
					"label": "Email",
					"items": [
						{
							"img": img("pres-bigger-email-crm.jpg"),
							"cap": "Email template"
						},
						{
							"img": img("pres-bigger-email-anim.gif"),
							"cap": "Email banner",
							"badge": "Animated"
						}
					]
				},
				{
					"key": "sms",
					"label": "SMS",
					"items": [
						{
							"img": img("pres-bigger-sms.jpg"),
							"cap": "SMS message"
						}
					]
				}
			]
		}
	],
	"brands": [
		{
			"id": "hoya",
			"name": "HOYA",
			"logo": img("logo-hoya.png"),
			"offer": "Varifocal awareness assets, built around first-time, risk-free wear",
			"body": "<p>Hoya back the campaign with marketing materials and digital assets focused on first-time, risk-free varifocal wear — aimed at the same 40+ patient the campaign is already talking to, at the point they are deciding whether to act.</p>",
			"gives": [
				"Marketing materials and digital assets",
				"Social media templates to drive varifocal awareness",
				"Product training, and help tailoring the message to your patients"
			],
			"howto": "<p>Select it in your Marketing Planner, where it is listed as <strong>HOYA Presbyopia</strong>. Your branded assets are requested with it.</p><p>This is not a discount campaign and there is no promotion attached — it is awareness, the same as the campaign it sits on.</p>",
			"cta": "Request via the planner"
		},
		{
			"id": "coopervision",
			"name": "CooperVision",
			"logo": img("logo-coopervision.png"),
			"offer": "Multifocal contact lens portfolio, team training and commercial support",
			"body": "<p>70% of single-vision contact lens wearers who drop out aged 40 and over have never had multifocals discussed with them, and only 6% of presbyopic glasses wearers are offered a free multifocal trial.</p><p>Cooper's research shows multifocal wearers stay in contact lenses significantly longer, and more than 2.5 times as many also buy varifocal spectacles. The portfolio covers up to 99.7% of presbyopic prescriptions.</p>",
			"gives": [
				"Digital assets and social media templates",
				"Training on making the most of the presbyopia opportunity",
				"Commercial information, and supporting brand campaigns"
			],
			"products": [
				"Biofinity&reg; multifocal",
				"Biofinity&reg; toric multifocal",
				"MyDay&reg; multifocal",
				"clariti&reg; 1 day multifocal 3 add"
			],
			"howto": "<p>Contact your CooperVision BDM for advice and training across the Cooper brands.</p>",
			"cta": "Contact your BDM"
		},
		{
			"id": "bausch-lomb",
			"name": "Bausch + Lomb",
			"logo": img("logo-bausch-lomb.png"),
			"offer": "Multifocal contact lens event support, October to 31 December",
			"body": "<p>Fitting more multifocal contact lenses improves satisfaction and retention — patients happy in their lenses don't want to stop wearing them when they become presbyopic — and grows recurring practice revenue.</p><p>B+L pricing is developed and approved for the independent channel first, ahead of the multiples and the internet.</p>",
			"gives": [
				"POS to raise awareness of the event",
				"Patient letter templates",
				"Trial stock",
				"Buy 6 months' supply, get 1 month free, for practices running an event"
			],
			"products": [
				"B+L Ultra 1 Day Multifocal"
			],
			"howto": "<p>Contact your local BDM to plan the event and collect the assets, and link in with the HG Events team and the <em>Events Made Easy</em> local events toolkit.</p>",
			"cta": "Contact your BDM"
		}
	]
};
