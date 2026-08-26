/**
 * Campaign data for eye-exams-available, ported from `window.UYPP_CAMPAIGN` in the standalone
 * build. Content comes from the Q4 creative deck; the supplier add-ons come from
 * that deck's brand-activation slides.
 */
import { img } from "../uypp-q4";
import type { Campaign } from "../types";

export const EYE_EXAMS: Campaign = {
	"routes": [
		{
			"id": "eye-exams",
			"name": "Eye Exams Available",
			"accent": "#9E1F3D",
			"placements": [
				{
					"key": "aboard",
					"label": "A-board",
					"items": [
						{
							"img": img("evergreen-eye-exams-aboard-situ.jpg"),
							"cap": "A-board outside the practice"
						}
					]
				},
				{
					"key": "poster",
					"label": "Poster",
					"items": [
						{
							"img": img("evergreen-eye-exams-assets.jpg"),
							"cap": "In-practice poster"
						}
					]
				},
				{
					"key": "title",
					"label": "Campaign card",
					"items": [
						{
							"img": img("evergreen-eye-exams-title.jpg"),
							"cap": "Campaign title card"
						}
					]
				}
			]
		}
	]
};
