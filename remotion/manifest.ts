import type { z } from 'zod';
import {
	promoSchema,
	promoDefaults,
	promoFields,
} from './templates/promo/schema';
import {
	guideSchema,
	guideDefaults,
	GUIDE_SLIDE_TYPES,
} from './templates/guide/schema';
import {
	destinationsSchema,
	destinationsDefaults,
	DEST_SLIDE_TYPES,
} from './templates/destinations/schema';
import type { FieldControl } from './types';

/**
 * Pure template metadata — no React/Remotion component references.
 * This is the only file imported by the server-side render routes so they
 * never pull Remotion's browser runtime into a Server Component context.
 */
export interface SlideTypeConfig {
	type: string;
	name: string;
	fields: FieldControl[];
	makeDefault: () => Record<string, unknown>;
}

export interface TemplateMeta {
	id: string;
	name: string;
	formatLabel: string;
	width: number;
	height: number;
	/** "ads" templates export a single PNG; "posts" templates export a ZIP of slides. */
	category: 'ads' | 'posts';
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	schema: z.ZodType<any>;
	defaultProps: Record<string, unknown>;
	/** Flat field list used by the ads studio control panel. */
	fields: FieldControl[];
	/** Slide type catalogue used by the post studio "Add slide" picker. */
	slideTypes?: SlideTypeConfig[];
}

export const TEMPLATE_META: TemplateMeta[] = [
	// ── Ads ────────────────────────────────────────────────────────────────────
	{
		id: 'promo-story',
		name: 'Story',
		formatLabel: 'Story · 1080×1920',
		width: 1080,
		height: 1920,
		category: 'ads',
		schema: promoSchema,
		defaultProps: promoDefaults,
		fields: promoFields,
	},
	{
		id: 'promo-square',
		name: 'Square',
		formatLabel: 'Square · 1200×1200',
		width: 1200,
		height: 1200,
		category: 'ads',
		schema: promoSchema,
		defaultProps: promoDefaults,
		fields: promoFields,
	},
	{
		id: 'promo-landscape',
		name: 'Landscape',
		formatLabel: 'Landscape · 1200×628',
		width: 1200,
		height: 628,
		category: 'ads',
		schema: promoSchema,
		defaultProps: promoDefaults,
		fields: promoFields,
	},

	// ── Posts ───────────────────────────────────────────────────────────────────
	{
		id: 'post-guide',
		name: 'Guide',
		formatLabel: 'Guide · 1080×1350',
		width: 1080,
		height: 1350,
		category: 'posts',
		schema: guideSchema,
		defaultProps: guideDefaults as unknown as Record<string, unknown>,
		fields: [], // posts use per-slide fields from slideTypes
		slideTypes: GUIDE_SLIDE_TYPES as SlideTypeConfig[],
	},
	{
		id: 'post-destinations',
		name: 'Destinations',
		formatLabel: 'Destinations · 1080×1350',
		width: 1080,
		height: 1350,
		category: 'posts',
		schema: destinationsSchema,
		defaultProps: destinationsDefaults as unknown as Record<
			string,
			unknown
		>,
		fields: [],
		slideTypes: DEST_SLIDE_TYPES as SlideTypeConfig[],
	},
];

export const getTemplateMeta = (id: string): TemplateMeta | undefined =>
	TEMPLATE_META.find(t => t.id === id);
