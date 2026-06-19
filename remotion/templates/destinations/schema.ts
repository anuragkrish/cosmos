import { z } from 'zod';
import type { FieldControl } from '../../types';

// ---------------------------------------------------------------------------
// Slide shapes
// ---------------------------------------------------------------------------

const destCoverSlideSchema = z.object({
	type: z.literal('cover'),
	coverLabel: z.string(),
	title: z.string(),
	imageSrc: z.string(),
});

const destCitySlideSchema = z.object({
	type: z.literal('city'),
	cityName: z.string(),
	description: z.string(),
	tipText: z.string(),
	imageSrc: z.string(),
});

export const destSlideSchema = z.discriminatedUnion('type', [
	destCoverSlideSchema,
	destCitySlideSchema,
]);

export const destinationsSchema = z.object({
	slides: z.array(destSlideSchema),
	slideIndex: z.number().int().min(0),
});

export type DestCoverSlide = z.infer<typeof destCoverSlideSchema>;
export type DestCitySlide = z.infer<typeof destCitySlideSchema>;
export type DestSlide = z.infer<typeof destSlideSchema>;
export type DestinationsProps = z.infer<typeof destinationsSchema>;

// ---------------------------------------------------------------------------
// Default content (Lunar New Year example)
// ---------------------------------------------------------------------------

export const destinationsDefaults: DestinationsProps = {
	slideIndex: 0,
	slides: [
		{
			type: 'cover',
			coverLabel: 'Best cities to celebrate',
			title: 'Lunar New Year',
			imageSrc: '',
		},
		{
			type: 'city',
			cityName: 'Singapore',
			description:
				'It uniquely blends tradition and modernity, with multicultural parades and festive displays set against the skyline.',
			tipText:
				"Don't miss the Gardens by the Bay's special floral display.",
			imageSrc: '',
		},
		{
			type: 'city',
			cityName: 'Shanghai, China',
			description:
				'Tradition comes alive here with glowing lanterns and temple fairs that bring Chinese heritage to life.',
			tipText: 'Catch the magic at Yuyuan Garden Lantern Festival.',
			imageSrc: '',
		},
		{
			type: 'city',
			cityName: 'Hong Kong',
			description:
				'The city dazzles with a spectacular harbour fireworks display and vibrant street parades.',
			tipText:
				'The Tsim Sha Tsui waterfront offers the best fireworks view.',
			imageSrc: '',
		},
		{
			type: 'city',
			cityName: 'San Francisco, USA',
			description:
				'Home to one of the largest Chinese New Year parades outside Asia, drawing huge crowds downtown.',
			tipText: 'Catch the dragon parade along Market Street.',
			imageSrc: '',
		},
		{
			type: 'city',
			cityName: 'Sydney, Australia',
			description:
				'Thanks to its vibrant Chinese community, it goes big with dragon boat races and the famous Lanterns Trail.',
			tipText: 'A Harbour Cruise offers the best views and food!',
			imageSrc: '',
		},
	],
};

// ---------------------------------------------------------------------------
// Editor field descriptors
// ---------------------------------------------------------------------------

export const destCoverFields: FieldControl[] = [
	{ key: 'coverLabel', label: 'Label', type: 'text', group: 'Content' },
	{ key: 'title', label: 'Title', type: 'text', group: 'Content' },
	{
		key: 'imageSrc',
		label: 'Background image',
		type: 'image',
		group: 'Content',
	},
];

export const destCityFields: FieldControl[] = [
	{ key: 'cityName', label: 'City name', type: 'text', group: 'Content' },
	{
		key: 'description',
		label: 'Description',
		type: 'textarea',
		group: 'Content',
	},
	{ key: 'tipText', label: 'Tip text', type: 'textarea', group: 'Content' },
	{
		key: 'imageSrc',
		label: 'Background image',
		type: 'image',
		group: 'Content',
	},
];

export const DEST_SLIDE_FIELDS: Record<DestSlide['type'], FieldControl[]> = {
	cover: destCoverFields,
	city: destCityFields,
};

export const DEST_SLIDE_TYPES: {
	type: DestSlide['type'];
	name: string;
	fields: FieldControl[];
	makeDefault: () => DestSlide;
}[] = [
	{
		type: 'cover',
		name: 'Cover',
		fields: destCoverFields,
		makeDefault: () => ({
			type: 'cover',
			coverLabel: 'Best places to visit',
			title: 'Your Title Here',
			imageSrc: '',
		}),
	},
	{
		type: 'city',
		name: 'City Card',
		fields: destCityFields,
		makeDefault: () => ({
			type: 'city',
			cityName: 'City Name',
			description: 'Brief description of this destination.',
			tipText: 'Local tip goes here.',
			imageSrc: '',
		}),
	},
];
