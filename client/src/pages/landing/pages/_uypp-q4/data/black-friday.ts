/**
 * Campaign data for black-friday, ported from `window.UYPP_CAMPAIGN` in the standalone
 * build. Content comes from the Q4 creative deck; the supplier add-ons come from
 * that deck's brand-activation slides.
 */
import { img } from "../uypp-q4";
import type { Campaign } from "../types";

export const BLACK_FRIDAY: Campaign = {
	"routes": [
		{
			"id": "strip",
			"name": "Strip",
			"tagline": "Treatment 01",
			"accent": "#17141A",
			"visual": img("bf-strip.jpg"),
			"body": "<p class='route__body'>A banded layout that stacks the offer across the poster, the loudest of the three from a distance, and the easiest to read through a window at speed.</p>",
			"assets": [
				"Window poster",
				"Poster",
				"Social"
			],
			"placements": [
				{
					"key": "poster",
					"label": "Poster",
					"items": [
						{
							"img": img("bf-strip-window-situ.jpg"),
							"cap": "Window poster in practice"
						},
						{
							"img": img("bf-strip.jpg"),
							"cap": "Poster artwork"
						}
					]
				},
				{
					"key": "social",
					"label": "Social",
					"items": [
						{
							"img": img("bf-strip-social.png"),
							"cap": "Instagram post"
						}
					]
				}
			]
		},
		{
			"id": "arrow",
			"name": "Arrow",
			"tagline": "Treatment 02",
			"accent": "#17141A",
			"visual": img("bf-arrow.jpg"),
			"body": "<p class='route__body'>A directional treatment that drives the eye straight to the offer. Works hard on an A-board or anywhere you need to pull people in off the pavement.</p>",
			"assets": [
				"Window poster",
				"Poster",
				"Social"
			],
			"placements": [
				{
					"key": "poster",
					"label": "Poster",
					"items": [
						{
							"img": img("bf-arrow-window-situ.jpg"),
							"cap": "Window poster in practice"
						},
						{
							"img": img("bf-arrow.jpg"),
							"cap": "Poster artwork"
						}
					]
				},
				{
					"key": "social",
					"label": "Social",
					"items": [
						{
							"img": img("bf-arrow-social.png"),
							"cap": "Instagram post"
						}
					]
				}
			]
		},
		{
			"id": "block",
			"name": "Block",
			"tagline": "Treatment 03",
			"accent": "#17141A",
			"visual": img("bf-block.jpg"),
			"body": "<p class='route__body'>The most typographic of the three, a solid block treatment that gives the offer the whole poster. Best where the discount itself is the headline.</p>",
			"assets": [
				"Window poster",
				"Poster",
				"Social"
			],
			"placements": [
				{
					"key": "poster",
					"label": "Poster",
					"items": [
						{
							"img": img("bf-block-window-situ.jpg"),
							"cap": "Window poster in practice"
						},
						{
							"img": img("bf-block.jpg"),
							"cap": "Poster artwork"
						}
					]
				},
				{
					"key": "social",
					"label": "Social",
					"items": [
						{
							"img": img("bf-block-social.png"),
							"cap": "Instagram post"
						}
					]
				}
			]
		}
	],
	"brands": [
		{
			"id": "scope",
			"name": "Scope",
			"logo": img("logo-scope.png"),
			"status": "tbc",
			"offer": "Supporting Black Friday — promotion details to follow",
			"body": "<p>Scope are backing this campaign. The promotion mechanics have not been shared yet, so there is nothing to opt into at the moment.</p>"
		}
	]
};
