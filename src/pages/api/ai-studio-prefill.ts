import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

export type StudioType = 'ads' | 'stories';

export interface AiStudioPrefillRequest {
	studioType: StudioType;
	query: string;
	campaignSummary: string;
}

export interface AdsPrefill {
	title: string;
	ctaLabel: string;
	brandLine1: string;
	brandLine2: string;
}

export interface StoriesPrefill {
	title: string;
	description: string;
}

export type AiStudioPrefillResponse =
	| { studioType: 'ads'; fields: AdsPrefill }
	| { studioType: 'stories'; fields: StoriesPrefill };

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const ADS_PROMPT = `You are a social media ad copywriter for Headout, a travel experiences platform.

Given a campaign, generate compelling short-form ad copy for these fields:
- title: A punchy product headline (≤ 55 chars). Specific to the campaign — NOT generic filler.
- ctaLabel: A short action CTA (≤ 12 chars). Examples: "Book Now", "Grab Tickets", "Explore Now".
- brandLine1: First brand lockup line — typically the CITY or key noun in uppercase (≤ 12 chars).
- brandLine2: Second brand lockup line — typically the product type in uppercase (≤ 12 chars). Examples: TICKETS, PASSES, TOURS, EXPERIENCES.

Return JSON exactly:
{
  "title": "...",
  "ctaLabel": "...",
  "brandLine1": "...",
  "brandLine2": "..."
}`;

const STORIES_PROMPT = `You are a social media story copywriter for Headout, a travel experiences platform.

Given a campaign, generate engaging copy for an Instagram/WhatsApp story card:
- title: A short, punchy hook headline (≤ 35 chars). Use sentence case. Specific to the campaign.
- description: An engaging 1–2 sentence caption (≤ 110 chars). Create urgency or excitement — not generic.

Return JSON exactly:
{
  "title": "...",
  "description": "..."
}`;

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<AiStudioPrefillResponse | { error: string }>,
) {
	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method not allowed' });
	}

	const { studioType, query, campaignSummary } =
		req.body as AiStudioPrefillRequest;

	if (!studioType || !query) {
		return res
			.status(400)
			.json({ error: 'studioType and query are required' });
	}

	const systemPrompt = studioType === 'ads' ? ADS_PROMPT : STORIES_PROMPT;

	const response = await openai.chat.completions.create({
		model: 'gpt-4o',
		response_format: { type: 'json_object' },
		messages: [
			{ role: 'system', content: systemPrompt },
			{
				role: 'user',
				content: `Campaign: "${query}"\nContext: ${campaignSummary}`,
			},
		],
	});

	const raw = response.choices[0]?.message?.content ?? '{}';
	try {
		const parsed = JSON.parse(raw);
		if (studioType === 'ads') {
			return res.status(200).json({
				studioType: 'ads',
				fields: {
					title: String(parsed.title ?? ''),
					ctaLabel: String(parsed.ctaLabel ?? ''),
					brandLine1: String(parsed.brandLine1 ?? ''),
					brandLine2: String(parsed.brandLine2 ?? ''),
				},
			});
		} else {
			return res.status(200).json({
				studioType: 'stories',
				fields: {
					title: String(parsed.title ?? ''),
					description: String(parsed.description ?? ''),
				},
			});
		}
	} catch {
		return res.status(500).json({ error: 'Failed to parse AI response' });
	}
}
