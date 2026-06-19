import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import type { SearchContentTourGroup } from '@/lib/campaign-api';

interface RecommendRequest {
	query: string;
	products: Pick<
		SearchContentTourGroup,
		| 'id'
		| 'displayName'
		| 'primaryCity'
		| 'primaryCategory'
		| 'primarySubCategory'
		| 'descriptors'
		| 'ratings'
	>[];
}

export interface RecommendResponse {
	recommendedIds: number[];
	reasons: Record<number, string>;
	searchContext: string;
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<RecommendResponse | { error: string }>,
) {
	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method not allowed' });
	}

	const { query, products } = req.body as RecommendRequest;

	if (!query || !products?.length) {
		return res
			.status(400)
			.json({ error: 'query and products are required' });
	}

	// Step 1: web search to understand what travellers love for this campaign
	const searchResponse = await openai.responses.create({
		model: 'gpt-4o',
		tools: [{ type: 'web_search_preview' }],
		input: `You are a travel trends researcher. The user is building a marketing campaign with the prompt: "${query}".
Search the web to find what experiences, activities, and attractions travellers most enjoy for this type of event/destination.
Return a concise summary (150-200 words) of the top keywords, themes, and specific experiences travellers seek.
Focus on things like event names, landmark activities, popular categories, and seasonal highlights.`,
	});

	const searchContext =
		searchResponse.output
			.filter(b => b.type === 'message')
			.flatMap(b => (b.type === 'message' ? b.content : []))
			.filter(c => c.type === 'output_text')
			.map(c => (c.type === 'output_text' ? c.text : ''))
			.join('\n')
			.trim() || 'No additional context found.';

	// Step 2: rank products using the search context
	const slim = products.map(p => ({
		id: p.id,
		name: p.displayName,
		city: p.primaryCity?.displayName ?? '',
		category: p.primaryCategory?.displayName ?? '',
		subCategory: p.primarySubCategory?.displayName ?? '',
		duration:
			p.descriptors?.find(d => d.code === 'DURATION')?.description ?? '',
		rating: p.ratings?.value ?? 0,
		reviews: p.ratings?.count ?? 0,
	}));

	const rankResponse = await openai.chat.completions.create({
		model: 'gpt-4o',
		response_format: { type: 'json_object' },
		messages: [
			{
				role: 'system',
				content: `You are a travel marketing expert helping curate the best products for a campaign.
Campaign prompt: "${query}"

Web research context about what travellers love for this campaign:
${searchContext}

Your job: from the product list below, pick the top 15 products that best match the campaign theme and traveller interests.
Consider: relevance to the event/destination, category fit, rating quality, and alignment with researched traveller preferences.

Return a JSON object with this exact shape:
{
  "recommendations": [
    { "id": <product id>, "reason": "<one concise sentence explaining why this product fits the campaign>" },
    ...
  ]
}

Rules:
- Only include IDs that exist in the product list
- Return at most 15 items, ranked best first
- Each reason should be specific to that product and the campaign — mention the event, vibe, or traveller intent it matches
- Keep each reason under 20 words`,
			},
			{
				role: 'user',
				content: JSON.stringify(slim),
			},
		],
	});

	const raw = rankResponse.choices[0]?.message?.content ?? '{}';
	let recommendedIds: number[] = [];
	let reasons: Record<number, string> = {};
	try {
		const parsed = JSON.parse(raw) as {
			recommendations?: { id: number; reason: string }[];
		};
		const recs = Array.isArray(parsed.recommendations)
			? parsed.recommendations.filter(r =>
					products.some(p => p.id === r.id),
				)
			: [];
		recommendedIds = recs.map(r => r.id);
		reasons = Object.fromEntries(recs.map(r => [r.id, r.reason]));
	} catch {
		// return empty list — UI handles gracefully
	}

	return res.status(200).json({ recommendedIds, reasons, searchContext });
}
