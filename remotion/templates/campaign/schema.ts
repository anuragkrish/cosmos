import { z } from 'zod';
import type { FieldControl } from '../../types';

export const campaignStorySchema = z.object({
	imageSrc: z.string(),
	title: z.string(),
	description: z.string(),
	outerBgColor: z.string(),
	cardBgColor: z.string(),
	textColor: z.string(),
});

export type CampaignStoryProps = z.infer<typeof campaignStorySchema>;

export const campaignStoryDefaults: CampaignStoryProps = {
	imageSrc: '',
	title: 'Step inside the Wizarding World in Tokyo',
	description:
		'Explore iconic sets, props, and behind-the-scenes magic at the Warner Bros. Studio Tour Tokyo.',
	outerBgColor: '#d8f1ff',
	cardBgColor: '#b7e4ff',
	textColor: '#02376d',
};

export const campaignStoryFields: FieldControl[] = [
	{ key: 'title', label: 'Title', type: 'textarea', group: 'Content' },
	{
		key: 'description',
		label: 'Description',
		type: 'textarea',
		group: 'Content',
	},
	{ key: 'imageSrc', label: 'Image', type: 'image', group: 'Content' },
	{
		key: 'outerBgColor',
		label: 'Background',
		type: 'color',
		group: 'Colors',
	},
	{ key: 'cardBgColor', label: 'Card', type: 'color', group: 'Colors' },
	{ key: 'textColor', label: 'Text', type: 'color', group: 'Colors' },
];
