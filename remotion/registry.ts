import type React from 'react';
import { TEMPLATE_META, type TemplateMeta } from './manifest';
import { PromoStory } from './templates/promo/PromoStory';
import { PromoSquare } from './templates/promo/PromoSquare';
import { PromoLandscape } from './templates/promo/PromoLandscape';
import { PostGuide } from './templates/guide/PostGuide';
import { PostDestinations } from './templates/destinations/PostDestinations';
import { CampaignStory } from './templates/campaign/CampaignStory';

/**
 * Couples each template's metadata (from the pure manifest) with its React
 * component. Importing this module pulls in Remotion's browser runtime, so it
 * is used only by the preview/editor and the Remotion entry — never the route.
 */
export interface Template extends TemplateMeta {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	component: React.FC<any>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const COMPONENTS: Record<string, React.FC<any>> = {
	'promo-story': PromoStory,
	'promo-square': PromoSquare,
	'promo-landscape': PromoLandscape,
	'post-guide': PostGuide,
	'post-destinations': PostDestinations,
	'campaign-story': CampaignStory,
};

export const TEMPLATES: Template[] = TEMPLATE_META.map(meta => ({
	...meta,
	component: COMPONENTS[meta.id],
}));

export const getTemplate = (id: string): Template | undefined =>
	TEMPLATES.find(t => t.id === id);
