/**
 * Campaign data for outside-prescriptions, ported from `window.UYPP_CAMPAIGN` in the standalone
 * build. Content comes from the Q4 creative deck; the supplier add-ons come from
 * that deck's brand-activation slides.
 */
import { img } from "../uypp-q4";
import type { Campaign } from "../types";

/* The festive artwork as individual pieces, replacing the composite deck renders and
   the plain title card these carousels started with. Same files as the Festive Focus
   Toolkit's volume drivers page — one set of posters, reached from two places. */
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
							"img": img("festive-outside-rx-red-aboard.jpg"),
							"cap": "Red A-board"
						},
						{
							"img": img("festive-outside-rx-frames-aboard.jpg"),
							"cap": "Frames A-board"
						}
					]
				},
				{
					"key": "window",
					"label": "Window",
					"items": [
						{
							"img": img("festive-outside-rx-red-window.jpg"),
							"cap": "Red poster in the window"
						},
						{
							"img": img("festive-outside-rx-frames-window.jpg"),
							"cap": "Frames poster in the window"
						}
					]
				},
				{
					"key": "poster",
					"label": "Poster",
					"items": [
						{
							"img": img("festive-outside-rx-red-poster.jpg"),
							"cap": "Red poster artwork"
						},
						{
							"img": img("festive-outside-rx-frames-poster.jpg"),
							"cap": "Frames poster artwork"
						}
					]
				},
				{
					"key": "social",
					"label": "Social",
					"items": [
						{
							"img": img("festive-outside-rx-red-social.jpg"),
							"cap": "Red social post"
						},
						{
							"img": img("festive-outside-rx-frames-social.jpg"),
							"cap": "Frames social post"
						}
					]
				}
			]
		}
	]
};
