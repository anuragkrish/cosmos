import { z } from 'zod';
import type { FieldControl } from '../../types';

/**
 * Shared data model for the promo campaign assets. All three formats (story,
 * square, landscape) are driven by this single typed config; each format only
 * differs in how it lays the fields out.
 */
export const promoSchema = z.object({
	brandLine1: z.string(),
	brandLine2: z.string(),
	showByHeadout: z.boolean(),
	title: z.string(),
	rating: z.number().min(0).max(5),
	showRating: z.boolean(),
	ctaLabel: z.string(),
	showCta: z.boolean(),
	imageSrc: z.string(),
	bgColor: z.string(),
	glowColor: z.string(),
	accentColor: z.string(),
	textColor: z.string(),
});

export type PromoProps = z.infer<typeof promoSchema>;

export const promoDefaults: PromoProps = {
	brandLine1: 'PARIS',
	brandLine2: 'TICKETS',
	showByHeadout: true,
	title: 'Disneyland Paris tickets and passes',
	rating: 4.4,
	showRating: true,
	ctaLabel: 'Book now',
	showCta: true,
	// Empty → the composition falls back to the bundled sample photo
	// (resolved via staticFile inside the renderer/browser context).
	imageSrc: '',
	bgColor: '#330066',
	glowColor: '#8C12C9',
	accentColor: '#FFBC00',
	textColor: '#FFFFFF',
};

/** Editor controls shared by every promo format. */
export const promoFields: FieldControl[] = [
	{ key: 'title', label: 'Title', type: 'textarea', group: 'Content' },
	{
		key: 'brandLine1',
		label: 'Brand line 1',
		type: 'text',
		group: 'Content',
	},
	{
		key: 'brandLine2',
		label: 'Brand line 2',
		type: 'text',
		group: 'Content',
	},
	{ key: 'imageSrc', label: 'Image', type: 'image', group: 'Content' },
	{
		key: 'rating',
		label: 'Rating',
		type: 'number',
		min: 0,
		max: 5,
		step: 0.1,
		group: 'Content',
	},
	{ key: 'ctaLabel', label: 'CTA label', type: 'text', group: 'Content' },
	{
		key: 'showByHeadout',
		label: 'Show “by headout”',
		type: 'boolean',
		group: 'Toggles',
	},
	{
		key: 'showRating',
		label: 'Show rating',
		type: 'boolean',
		group: 'Toggles',
	},
	{
		key: 'showCta',
		label: 'Show CTA button',
		type: 'boolean',
		group: 'Toggles',
	},
	{ key: 'bgColor', label: 'Background', type: 'color', group: 'Colors' },
	{ key: 'glowColor', label: 'Glow', type: 'color', group: 'Colors' },
	{ key: 'accentColor', label: 'Accent', type: 'color', group: 'Colors' },
	{ key: 'textColor', label: 'Text', type: 'color', group: 'Colors' },
];
