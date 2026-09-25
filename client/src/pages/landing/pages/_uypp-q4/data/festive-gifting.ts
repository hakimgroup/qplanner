/**
 * Festive Focus Toolkit — gifting and gifts with purchase.
 *
 * The supplier-funded half of the toolkit. Two kinds of thing sit here and the
 * grouping keeps them apart, because what a practice has to do about them is
 * completely different:
 *
 *   Gift with purchase — a finite number of physical gifts, allocated first come
 *   first served against a qualifying order. These have forms and deadlines, and
 *   missing one means missing it entirely.
 *
 *   Brand activations — a supplier campaign run in the practice: Face a Face's
 *   festive window kit, Thea's party-season dry eye support. Some carry a sell-in
 *   requirement, and each is opted into on the supplier's own form.
 *
 * The four confirmed gift-with-purchase programmes are the same ones Festive
 * Windows carries. They are reached from both places on purpose: a practice
 * planning a window and a practice planning its gifting are the same practice
 * asking two different questions.
 */
import { img } from "../uypp-q4";
import { BRAND_ACTIVATIONS } from "../links";
import type { Campaign } from "../types";

/** Said on all four gift-with-purchase rows in the brief, so it is written once
 *  and reused rather than rephrased four times. */
const GWP_CASE =
	"<p>A free gift with the frames is a straightforward way to secure the dispense, and it can lift a lower-spend dispense into a more premium range. Run it from late November through December, when customers are already prioritising spend towards Christmas.</p><p>Display the gifts beside the relevant frames, and brief the team to offer it — including the suggestion that it saves the customer buying a gift for someone else.</p>";

/**
 * Oakley reached capacity on 25 September 2026. The team's wording, used on every
 * page that carries the Oakley row — gifting, events and Q4 Festive Windows all
 * offered the same form, and a full programme is full wherever it is reached from.
 * Spread into each row so the three cannot say different things.
 */
export const OAKLEY_CLOSED = {
	status: "closed" as const,
	offer: "Now at capacity — see the other gifting brands",
	closedNote:
		"<p>This brand activation is now at capacity. Please look at our other highlighted brand suppliers if you would like to do this gifting campaign.</p>",
};

export const FESTIVE_GIFTING: Campaign = {
	// Only the supplier-rows footer uses this now — the route sends visitors down
	// to the supplier rows instead. "Add gifting to your plan" promised a planner
	// card that does not exist: gifting is taken up on each supplier's form.
	orderLabel: "Open the Marketing Planner",
	routes: [
		{
			id: "gifting",
			name: "Gifting & gifts with purchase",
			accent: "#A8802B",
			// Frames presented as gifts, from the "jump" window concept, cropped to a
			// portrait. The landscape window shot this replaced sat in a tall empty
			// frame beside the long copy — see Route.visualFit.
			visual: img("festive-gifting-frames.jpg"),
			visualFit: "cover",
			order: {
				label: "See campaign options below",
				href: "#supplier-support",
			},
			body: `<p>December is the one month of the year when eyewear and accessories are bought for other people. Patients walk in already in a gifting mindset — the opportunity is to inspire them to tick a few stocking fillers off the list while they are with you.</p>
				<p>Two different purchases sit inside that. <strong>Accessories are the impulse buy</strong>: seen on the way past the till, picked up without much deliberation, and the easiest incremental revenue in the toolkit. <strong>Plano sun is the considered one</strong> — a fantastic gift, but a decision rather than a reflex, so it needs the conversation.</p>
				<p>On top of both, four suppliers are funding gifts with purchase this season. Each is capped, each is first come first served, and each needs a form.</p>`,
			note: `<p><strong>Accessories first.</strong> They need no sign-up, no allocation and no deadline — only a prompt and a good position in the practice. Everything else on this page is an add-on to that.</p>`,
			placements: [
				{
					key: "instore",
					label: "In practice",
					items: [
						{
							img: img("festive-gifting-frames.jpg"),
							cap: "Frames presented as gifts",
						},
						{
							img: img("festive-easy-3.jpg"),
							cap: "Gifting front and centre in the window",
						},
						{
							img: img("festive-accessory-theia-stand.jpg"),
							cap: "Theia cloths on the counter, where every patient sees them",
						},
						{
							img: img("festive-accessory-theia-bag.jpg"),
							cap: "A Theia cloth tied on as a bag charm",
						},
						{
							img: img("festive-accessory-coti.jpg"),
							cap: "COTI chains — bright, modern and practical",
						},
						// Promised by the team "as soon as possible", 25 September 2026.
						{ ph: true, cap: "Gift cards — artwork coming soon" },
					],
				},
				{
					key: "gwp",
					label: "Gift with purchase",
					items: [
						{ ph: true, cap: "Supplier gift display — artwork to come" },
						{ ph: true, cap: "Strut card — artwork to come" },
					],
				},
			],
		},
	],
	brands: [
		{
			id: "boss",
			name: "BOSS",
			logo: img("logo-boss.png"),
			group: "Gift with purchase",
			offer: "Five branded magnetic phone wallets to give away with BOSS frames",
			// Imagery for every gift with purchase sits in the Growth team's
			// "11 Christmas Gifting" folder on SharePoint, not yet on the site.
			visual: { ph: true, cap: "BOSS gift with purchase — images to come" },
			body: GWP_CASE,
			gives: ["Five BOSS branded magnetic phone wallets per qualifying practice"],
			products: ["BOSS frames"],
			howto: "<p>The first 10 practices in the group to purchase 12 pieces or more in a single order during September and October receive a BOSS gift-with-purchase set.</p><p>Opt in below to register your interest.</p><p>Final design may vary from the artwork shown.</p>",
		},
		{
			id: "oakley",
			name: "Oakley",
			logo: img("logo-oakley.png"),
			group: "Gift with purchase",
			...OAKLEY_CLOSED,
		},
		{
			id: "ted-baker",
			name: "Ted Baker",
			logo: img("logo-ted-baker.png"),
			group: "Gift with purchase",
			offer: "Ten branded re-usable coffee mugs to give away with Ted Baker frames",
			visual: { ph: true, cap: "Ted Baker gift with purchase — images to come" },
			body: GWP_CASE,
			gives: ["Ten Ted Baker branded re-useable coffee mugs per qualifying practice"],
			products: ["Ted Baker frames"],
			howto: "<p>Opt in below to join the Ted Baker gifting campaign.</p><p>Final design may vary from the artwork shown.</p>",
		},
		{
			id: "design-eyewear",
			name: "Design Eyewear Group",
			logo: img("logo-prodesign.png"),
			group: "Gift with purchase",
			offer: "A free sunglass with every optical frame purchase, on Prodesign and Face a Face",
			visual: { ph: true, cap: "Prodesign and Face a Face gifts — images to come" },
			body: "<p>Display the sunglasses, or a clearly branded &ldquo;free sunglass with every purchase&rdquo; message, beside the relevant frames.</p><p><strong>Still to be confirmed:</strong> whether Design Eyewear supply the strut cards carrying that message. The rest of the activation is confirmed and can be taken up now.</p>",
			gives: [
				"Prodesign: 10 sunglasses with any order over 20 pieces &mdash; max 25 practices, first come first served",
				"Prodesign: 10 pocket mirrors with any order over 15 pieces &mdash; max 25 practices, first come first served",
				"Face a Face: one Polaroid camera with any order over 20 pieces &mdash; max 10 practices, first come first served",
			],
			products: ["Prodesign", "Face a Face"],
			howto: "<p>Opt in to one or both campaigns using the form below.</p>",
		},
		{
			// Added in the team's amends, 25 September 2026. A window campaign
			// rather than a gift with purchase, so it sits with the activations —
			// though it is separate from the Face a Face Polaroid gift in the
			// Design Eyewear row above, and a practice can do both.
			id: "face-a-face",
			name: "Face a Face",
			logo: img("logo-face-a-face.png"),
			group: "Brand activations",
			offer: "Nights in Colour — a branded festive window, with a 20-frame sell-in",
			// Only the second option in the concept pack, "Nights in Colour" with
			// the gift boxes. The pack is on SharePoint and not yet on the site.
			visual: { ph: true, cap: "Nights in Colour window — images to come" },
			body: "<p>Celebrate the festive and party season with a branded window campaign from Face a Face! Highlighting their Nights in Colour campaign, we&rsquo;ve worked with the team to create a dedicated window across the festive season.</p>",
			requirement: "<p>20 pieces of Face a Face frames. If you have recently purchased an order, still opt in your interest and this will be at your Design Eyewear Group rep&rsquo;s discretion.</p>",
			gives: [
				"2 &times; window banners",
				"2 &times; double-sided show cards",
				"Window vinyl with the Face a Face logo",
				"Display stand",
				"Branded gift boxes",
			],
			howto: "<p>To register your interest, please opt in by filling out the form below. To get a head start, you can also book in a visit from your rep to secure your 20 frames too!</p>",
			actionLabel: "Opt in here",
		},
		{
			id: "thea",
			name: "Thea",
			logo: img("logo-thea.png"),
			group: "Brand activations",
			offer: "Dry eye through party season — product, training and a recommendation pad",
			body: "<p>Party season takes its toll on eyes. Late nights, a busy social calendar, more screen time, alcohol and heavier eye make-up all leave eyes feeling tired, dry and uncomfortable.</p><p>It is a good moment to start conversations about simple ways to stay comfortable through December — lubricating drops, warming masks, eyelid hygiene. Linking dry eye care to the realities of party season makes the conversation timely rather than clinical, and it drives incremental revenue from patients who came in for something else.</p>",
			gives: [
				"Product training for the practice team from your Thea rep",
				"A counter display unit for the test room and the retail area",
				"A recommendation pad for the optometrist or CLO to hand to the patient",
				"Step-by-step &ldquo;how to&rdquo; videos for the OA or DO to show the patient &mdash; links still to come",
			],
			products: [
				"BlephaEyeBag",
				"Blephaclean PF eyelid cleansing wipes",
				"Blephasol micellar solution",
				"Blephaderm eyelid and eye contour cream",
			],
			howto: "<p>Opt in using the form below. Your Thea rep will then be in touch with product information and training for the team.</p><p><strong>Still in development:</strong> the supporting video links and HelpHub page are not live yet.</p>",
			// The team's wording for this button, in the 25 September amends.
			actionLabel: "Opt in here",
		},
		{
			id: "silhouette",
			name: "Silhouette",
			logo: img("logo-silhouette.png"),
			group: "Brand activations",
			status: "tbc",
			offer: "Festive activation — visuals and sign-up links coming soon",
			body: `<p>Visuals of this activation are currently being worked on and will be available to view in the coming weeks. An email from <strong>${BRAND_ACTIVATIONS}</strong> will come to your inbox with this information along with the sign-up links.</p>`,
		},
		// Alcon and Bausch + Lomb were removed in the 25 September amends: neither
		// has been confirmed as happening this year.
	],
};

/**
 * Accessories, from Lorna, September 2026.
 *
 * These moved to the front of the gifting page after the team's review: COTI
 * chains had been the last bullet of a list, which put the one thing every
 * practice can act on today — no form, no allocation, no deadline — below eight
 * supplier programmes that most practices cannot take up at all.
 *
 * Held as data rather than markup because the range changes yearly and the
 * merchandising advice does not.
 */
export const ACCESSORIES: { name: string; price?: string; body: string }[] = [
	{
		name: "COTI chains",
		body: "Bright, modern and thoroughly practical. A chain is the accessory people did not know they wanted until they saw one, which is exactly what makes it an impulse purchase.",
	},
	{
		name: "Theia cleaning cloths",
		price: "£15 each",
		body: "Newly introduced, and they turn a humble accessory into a fashion statement. Bag charms are hugely popular right now, and these have all of that style with the considerable bonus of being useful. Patients see them and want to give them to friends and family.",
	},
	{
		name: "Multi-frame cases",
		body: "If you stock them, they make a genuinely good gift — practical, a bit more considered, and an easy step up in value from a chain or a cloth.",
	},
	{
		name: "Plano sun",
		body: "A fantastic gift, but usually a more considered purchase rather than an impulse one. Worth the conversation with anyone browsing, rather than relying on the display to do the work.",
	},
];

/**
 * Lorna's photographs of the accessories, supplied 25 September 2026. Shown at
 * the top of the accessories section rather than only in the carousel further
 * down: the team asked for gifting to come forward, and the photos do that
 * faster than the copy can.
 */
export const ACCESSORY_GALLERY: { img: string; cap: string }[] = [
	{
		img: img("festive-accessory-coti.jpg"),
		cap: "COTI chains: bright, modern and practical",
	},
	{
		img: img("festive-accessory-theia-stand.jpg"),
		cap: "Theia cloths on the counter, where every patient sees them",
	},
	{
		img: img("festive-accessory-theia-bag.jpg"),
		cap: "Tied on as a bag charm — useful, and a gift in its own right",
	},
];

/**
 * How to merchandise them. Also Lorna's: the products matter less than the
 * position and the prompt.
 */
export const ACCESSORY_TACTICS: { title: string; body: string }[] = [
	{
		title: "Front and centre",
		body: "Every patient should walk past them. An accessory that lives behind the dispensing desk sells to nobody — the whole category depends on being seen without being looked for.",
	},
	{
		title: "Say the word Christmas",
		body: "A prompt about gifting and stocking fillers next to the display. People are actively looking for gift solutions in December, so position accessories as one rather than leaving patients to make the leap.",
	},
	{
		title: "Try a bundle price",
		body: "Multiples drive volume. One Theia cloth is £15 — consider two for £28 or three for £36, so a patient buying for one person ends up buying for three.",
	},
];
