import { z } from 'zod';
import type { FieldControl } from '../../types';

// ---------------------------------------------------------------------------
// Slide shapes
// ---------------------------------------------------------------------------

const coverSlideSchema = z.object({
	type: z.literal('cover'),
	labelLine1: z.string(),
	labelLine2: z.string(),
	title: z.string(),
	imageSrc: z.string(),
	badgeSrc: z.string(),
});

const featureSlideSchema = z.object({
	type: z.literal('feature'),
	/** Plain text before the gradient accent word(s). */
	headingBefore: z.string(),
	/** Gradient-coloured accent portion of the heading. */
	headingAccent: z.string(),
	/** Plain text after the accent (may start with "\n"). */
	headingAfter: z.string(),
	body: z.string(),
	imageSrc: z.string(),
	badgeSrc: z.string(),
});

const imageListSlideSchema = z.object({
	type: z.literal('imageList'),
	headingBefore: z.string(),
	headingAccent: z.string(),
	headingAfter: z.string(),
	subtext: z.string(),
	items: z.array(z.object({ label: z.string(), imageSrc: z.string() })),
	badgeSrc: z.string(),
});

const featureListSlideSchema = z.object({
	type: z.literal('featureList'),
	headingBefore: z.string(),
	headingAccent: z.string(),
	headingAfter: z.string(),
	items: z.array(
		z.object({
			title: z.string(),
			description: z.string(),
			imageSrc: z.string(),
		}),
	),
	badgeSrc: z.string(),
});

const closingPillSchema = z.object({
	iconSrc: z.string(),
	text: z.string(),
	showHeadoutLogo: z.boolean(),
});

const closingSlideSchema = z.object({
	type: z.literal('closing'),
	heading: z.string(),
	badgeSrc: z.string(),
	pills: z.array(closingPillSchema),
});

export const guideSlideSchema = z.discriminatedUnion('type', [
	coverSlideSchema,
	featureSlideSchema,
	imageListSlideSchema,
	featureListSlideSchema,
	closingSlideSchema,
]);

export const guideSchema = z.object({
	slides: z.array(guideSlideSchema),
	slideIndex: z.number().int().min(0),
});

export type CoverSlide = z.infer<typeof coverSlideSchema>;
export type FeatureSlide = z.infer<typeof featureSlideSchema>;
export type ImageListSlide = z.infer<typeof imageListSlideSchema>;
export type FeatureListSlide = z.infer<typeof featureListSlideSchema>;
export type ClosingPill = z.infer<typeof closingPillSchema>;
export type ClosingSlide = z.infer<typeof closingSlideSchema>;
export type GuideSlide = z.infer<typeof guideSlideSchema>;
export type GuideProps = z.infer<typeof guideSchema>;

// ---------------------------------------------------------------------------
// Default content (Disneyland Paris / World of Frozen example)
// ---------------------------------------------------------------------------

const BADGE_ARROW = '';
const BADGE_WALK = '';
const BADGE_SPARKLES = '';
const BADGE_CLOSING = '';
const ICON_CALENDAR = '';
const ICON_PIN = '';
const ICON_TICKET = '';

export const guideDefaults: GuideProps = {
	slideIndex: 0,
	slides: [
		{
			type: 'cover',
			labelLine1: 'What to expect at',
			labelLine2: "Disneyland® Paris'",
			title: 'World of Frozen',
			imageSrc: '',
			badgeSrc: BADGE_ARROW,
		},
		{
			type: 'feature',
			headingBefore: 'A full ',
			headingAccent: 'Arendelle',
			headingAfter: '\nyou can walk through',
			body: 'Step into the Kingdom of Arendelle, with village streets, fjords, and Nordic-inspired architecture all around you.',
			imageSrc: '',
			badgeSrc: BADGE_WALK,
		},
		{
			type: 'feature',
			headingBefore: '',
			headingAccent: 'Frozen Ever After',
			headingAfter: '\n(main attraction)',
			body: "A musical boat ride through Arendelle's fjords taking you to Elsa's Ice Palace with Anna, Elsa & Olaf along the way.",
			imageSrc: '',
			badgeSrc: BADGE_WALK,
		},
		{
			type: 'feature',
			headingBefore: "North Mountain + Elsa's Ice Palace",
			headingAccent: '',
			headingAfter: '',
			body: "The land is anchored by a 36m snow-capped mountain with Elsa's Ice Palace at the top — visible across the area.",
			imageSrc: '',
			badgeSrc: BADGE_WALK,
		},
		{
			type: 'feature',
			headingBefore: 'Meet ',
			headingAccent: 'Anna & Elsa',
			headingAfter: '',
			body: 'Meet them inside Arendelle Castle — a dedicated royal encounter experience.',
			imageSrc: '',
			badgeSrc: BADGE_WALK,
		},
		{
			type: 'imageList',
			headingBefore: '',
			headingAccent: 'Characters + story moments',
			headingAfter: '\naround you',
			subtext: 'As you explore, you may run into:',
			items: [
				{ label: 'Oaken (shopkeeper)', imageSrc: '' },
				{ label: 'Mossie (baby troll)', imageSrc: '' },
				{ label: 'More familiar faces from the film', imageSrc: '' },
			],
			badgeSrc: BADGE_SPARKLES,
		},
		{
			type: 'featureList',
			headingBefore: '',
			headingAccent: 'Dining + shopping',
			headingAfter: '',
			items: [
				{
					title: 'Nordic Crowns Tavern',
					description: 'that serves traditional Nordic food',
					imageSrc: '',
				},
				{
					title: 'Arendelle Boutique & Fjord View Shop',
					description:
						'where you can get toys, merch and interactive souvenirs',
					imageSrc: '',
				},
			],
			badgeSrc: BADGE_WALK,
		},
		{
			type: 'closing',
			heading: 'Know before you go',
			badgeSrc: BADGE_CLOSING,
			pills: [
				{
					iconSrc: ICON_CALENDAR,
					text: 'Opened on March 29, 2026',
					showHeadoutLogo: false,
				},
				{
					iconSrc: ICON_PIN,
					text: 'Located inside Disney Adventure World (formally Walt Disney Studios Park)',
					showHeadoutLogo: false,
				},
				{
					iconSrc: ICON_TICKET,
					text: 'Included with your regular park ticket when you book with',
					showHeadoutLogo: true,
				},
			],
		},
	],
};

// ---------------------------------------------------------------------------
// Editor field descriptors per slide type
// ---------------------------------------------------------------------------

export const coverSlideFields: FieldControl[] = [
	{
		key: 'labelLine1',
		label: 'Label line 1',
		type: 'text',
		group: 'Content',
	},
	{
		key: 'labelLine2',
		label: 'Label line 2',
		type: 'text',
		group: 'Content',
	},
	{ key: 'title', label: 'Title', type: 'text', group: 'Content' },
	{ key: 'imageSrc', label: 'Hero image', type: 'image', group: 'Content' },
	{ key: 'badgeSrc', label: 'Badge icon', type: 'image', group: 'Style' },
];

export const featureSlideFields: FieldControl[] = [
	{
		key: 'headingBefore',
		label: 'Heading (before accent)',
		type: 'text',
		group: 'Heading',
	},
	{
		key: 'headingAccent',
		label: 'Heading (accent)',
		type: 'text',
		group: 'Heading',
	},
	{
		key: 'headingAfter',
		label: 'Heading (after accent)',
		type: 'text',
		group: 'Heading',
	},
	{ key: 'body', label: 'Body text', type: 'textarea', group: 'Content' },
	{ key: 'imageSrc', label: 'Image', type: 'image', group: 'Content' },
	{ key: 'badgeSrc', label: 'Badge icon', type: 'image', group: 'Style' },
];

export const imageListSlideFields: FieldControl[] = [
	{
		key: 'headingBefore',
		label: 'Heading (before accent)',
		type: 'text',
		group: 'Heading',
	},
	{
		key: 'headingAccent',
		label: 'Heading (accent)',
		type: 'text',
		group: 'Heading',
	},
	{
		key: 'headingAfter',
		label: 'Heading (after accent)',
		type: 'text',
		group: 'Heading',
	},
	{ key: 'subtext', label: 'Subtext', type: 'text', group: 'Content' },
	{
		key: 'items',
		label: 'Items',
		type: 'list',
		itemLabel: 'Item',
		itemFields: [
			{ key: 'label', label: 'Label', type: 'text' },
			{ key: 'imageSrc', label: 'Image', type: 'image' },
		],
		group: 'Content',
	},
	{ key: 'badgeSrc', label: 'Badge icon', type: 'image', group: 'Style' },
];

export const featureListSlideFields: FieldControl[] = [
	{
		key: 'headingBefore',
		label: 'Heading (before accent)',
		type: 'text',
		group: 'Heading',
	},
	{
		key: 'headingAccent',
		label: 'Heading (accent)',
		type: 'text',
		group: 'Heading',
	},
	{
		key: 'headingAfter',
		label: 'Heading (after accent)',
		type: 'text',
		group: 'Heading',
	},
	{
		key: 'items',
		label: 'Items',
		type: 'list',
		itemLabel: 'Item',
		itemFields: [
			{ key: 'title', label: 'Title', type: 'text' },
			{ key: 'description', label: 'Description', type: 'textarea' },
			{ key: 'imageSrc', label: 'Image', type: 'image' },
		],
		group: 'Content',
	},
	{ key: 'badgeSrc', label: 'Badge icon', type: 'image', group: 'Style' },
];

export const closingSlideFields: FieldControl[] = [
	{ key: 'heading', label: 'Heading', type: 'text', group: 'Content' },
	{
		key: 'pills',
		label: 'Info pills',
		type: 'list',
		itemLabel: 'Pill',
		itemFields: [
			{ key: 'iconSrc', label: 'Icon', type: 'image' },
			{ key: 'text', label: 'Text', type: 'textarea' },
			{
				key: 'showHeadoutLogo',
				label: 'Show Headout logo',
				type: 'boolean',
			},
		],
		group: 'Content',
	},
	{ key: 'badgeSrc', label: 'Badge icon', type: 'image', group: 'Style' },
];

/** Map from slide type → its fields. Used by the editor to show per-slide controls. */
export const GUIDE_SLIDE_FIELDS: Record<GuideSlide['type'], FieldControl[]> = {
	cover: coverSlideFields,
	feature: featureSlideFields,
	imageList: imageListSlideFields,
	featureList: featureListSlideFields,
	closing: closingSlideFields,
};

/** Slide type catalogue for the "Add slide" picker. */
export const GUIDE_SLIDE_TYPES: {
	type: GuideSlide['type'];
	name: string;
	fields: FieldControl[];
	makeDefault: () => GuideSlide;
}[] = [
	{
		type: 'cover',
		name: 'Cover',
		fields: coverSlideFields,
		makeDefault: () => ({
			type: 'cover',
			labelLine1: 'What to expect at',
			labelLine2: 'Your destination',
			title: 'Slide Title',
			imageSrc: '',
			badgeSrc: BADGE_ARROW,
		}),
	},
	{
		type: 'feature',
		name: 'Feature',
		fields: featureSlideFields,
		makeDefault: () => ({
			type: 'feature',
			headingBefore: '',
			headingAccent: 'Feature Heading',
			headingAfter: '',
			body: 'Description text goes here.',
			imageSrc: '',
			badgeSrc: BADGE_WALK,
		}),
	},
	{
		type: 'imageList',
		name: 'Image List',
		fields: imageListSlideFields,
		makeDefault: () => ({
			type: 'imageList',
			headingBefore: '',
			headingAccent: 'List Heading',
			headingAfter: '',
			subtext: 'Subtext goes here:',
			items: [
				{ label: 'Item one', imageSrc: '' },
				{ label: 'Item two', imageSrc: '' },
			],
			badgeSrc: BADGE_SPARKLES,
		}),
	},
	{
		type: 'featureList',
		name: 'Feature List',
		fields: featureListSlideFields,
		makeDefault: () => ({
			type: 'featureList',
			headingBefore: '',
			headingAccent: 'Feature List',
			headingAfter: '',
			items: [
				{
					title: 'Option A',
					description: 'Description of option A.',
					imageSrc: '',
				},
				{
					title: 'Option B',
					description: 'Description of option B.',
					imageSrc: '',
				},
			],
			badgeSrc: BADGE_WALK,
		}),
	},
	{
		type: 'closing',
		name: 'Closing',
		fields: closingSlideFields,
		makeDefault: () => ({
			type: 'closing',
			heading: 'Know before you go',
			badgeSrc: BADGE_CLOSING,
			pills: [
				{
					iconSrc: ICON_CALENDAR,
					text: 'Add opening date here',
					showHeadoutLogo: false,
				},
				{
					iconSrc: ICON_PIN,
					text: 'Location details here',
					showHeadoutLogo: false,
				},
				{
					iconSrc: ICON_TICKET,
					text: 'Ticket info — book with',
					showHeadoutLogo: true,
				},
			],
		}),
	},
];
