/**
 * Campaign data for outside-prescriptions, ported from `window.UYPP_CAMPAIGN` in the standalone
 * build. Content comes from the Q4 creative deck; the supplier add-ons come from
 * that deck's brand-activation slides.
 */
import { img } from "../uypp-q4";
import type { Campaign } from "../types";

export const OUTSIDE_RX: Campaign = {
	"routes": [
		{
			"id": "outside-rx",
			"name": "Outside Prescriptions Welcome",
			"accent": "#D6322B",
			"placements": [
				{
					"key": "aboard",
					"label": "A-board",
					"items": [
						{
							"img": img("evergreen-outside-rx-aboard-situ.jpg"),
							"cap": "A-board outside the practice"
						}
					]
				},
				{
					"key": "poster",
					"label": "Poster",
					"items": [
						{
							"img": img("evergreen-outside-rx-assets.jpg"),
							"cap": "In-practice poster"
						}
					]
				},
				{
					"key": "title",
					"label": "Campaign card",
					"items": [
						{
							"img": img("evergreen-outside-rx-title.jpg"),
							"cap": "Campaign title card"
						}
					]
				}
			]
		}
	]
};
