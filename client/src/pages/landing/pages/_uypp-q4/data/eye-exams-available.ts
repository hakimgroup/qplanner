/**
 * Campaign data for eye-exams-available, ported from `window.UYPP_CAMPAIGN` in the standalone
 * build. Content comes from the Q4 creative deck; the supplier add-ons come from
 * that deck's brand-activation slides.
 */
import { img } from "../uypp-q4";
import type { Campaign } from "../types";

/* The festive artwork as individual pieces, replacing the composite deck renders and
   the plain title card these carousels started with. Same files as the Festive Focus
   Toolkit's volume drivers page — one set of posters, reached from two places. */
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
							"img": img("festive-eye-exams-stitch-aboard.jpg"),
							"cap": "Cross-stitch A-board"
						},
						{
							"img": img("festive-eye-exams-star-aboard.jpg"),
							"cap": "Star A-board"
						}
					]
				},
				{
					"key": "window",
					"label": "Window",
					"items": [
						{
							"img": img("festive-eye-exams-stitch-window.jpg"),
							"cap": "Cross-stitch poster in the window"
						},
						{
							"img": img("festive-eye-exams-star-window.jpg"),
							"cap": "Star poster in the window"
						}
					]
				},
				{
					"key": "poster",
					"label": "Poster",
					"items": [
						{
							"img": img("festive-eye-exams-stitch-poster.jpg"),
							"cap": "Cross-stitch poster artwork"
						},
						{
							"img": img("festive-eye-exams-star-poster.jpg"),
							"cap": "Star poster artwork"
						}
					]
				},
				{
					"key": "social",
					"label": "Social",
					"items": [
						{
							"img": img("festive-eye-exams-stitch-social.jpg"),
							"cap": "Cross-stitch social post"
						},
						{
							"img": img("festive-eye-exams-star-social.jpg"),
							"cap": "Star social post"
						}
					]
				}
			]
		}
	]
};
