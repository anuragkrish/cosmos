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

const COMPETITORS = ['getyourguide.com', 'klook.com', 'viator.com'];

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractText(response: any): string {
	return (response.output ?? [])
		.filter((b: { type: string }) => b.type === 'message')
		.flatMap((b: { type: string; content?: unknown[] }) => b.content ?? [])
		.filter((c: { type: string }) => c.type === 'output_text')
		.map((c: { type: string; text?: string }) => c.text ?? '')
		.join('\n')
		.trim();
}

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

	// Step 1: run traveller intent search + competitor research in parallel
	const [travellersResponse, competitorResponse] = await Promise.all([
		// What do travellers love for this event/destination?
		openai.responses.create({
			model: 'gpt-4o',
			tools: [{ type: 'web_search_preview' }],
			input: `You are a travel trends researcher. The user is building a marketing campaign with the prompt: "${query}".
Search the web to find what experiences, activities, and attractions travellers most enjoy for this type of event/destination.
Return a concise summary (150-200 words) of the top keywords, themes, and specific experiences travellers seek.
Focus on things like event names, landmark activities, popular categories, and seasonal highlights.`,
		}),

		// What are the top competitor OTAs featuring for this query?
		openai.responses.create({
			model: 'gpt-4o',
			tools: [{ type: 'web_search_preview' }],
			input: `You are a travel market analyst. Search ${COMPETITORS.join(', ')} for experiences and activities related to: "${query}".
Look at what these competitor platforms are currently featuring, promoting, or ranking highly.
Summarise in 150-200 words:
- Which experience categories appear most (tours, cruises, tickets, etc.)
- Specific product types or named attractions that appear across multiple platforms
- Any pricing tiers or experience formats (small group, skip-the-line, night experiences, etc.) that dominate
This reveals what the market considers the most commercially viable products for this campaign.`,
		}),
	]);

	const travellersContext =
		extractText(travellersResponse) || 'No traveller context found.';
	const competitorContext =
		extractText(competitorResponse) || 'No competitor context found.';
	const searchContext = `TRAVELLER INTENT:\n${travellersContext}\n\nCOMPETITOR MARKET SIGNALS:\n${competitorContext}`;

	// Step 2: rank products using both signals
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

You have two research signals to guide your selection:

1. TRAVELLER INTENT — what travellers are searching for and want to experience:
${travellersContext}

2. COMPETITOR MARKET SIGNALS — what GetYourGuide, Klook, and Viator are featuring for this query:
${competitorContext}

Use both signals together. Competitor data tells you which experience types have proven commercial demand.
Traveller intent tells you what emotional and practical needs to address.

Your job: from the product list below, pick the top 15 products that best match the campaign.
Consider: category alignment with competitor bestsellers, relevance to traveller intent, rating quality.

Return a JSON object with this exact shape:
{
  "recommendations": [
    { "id": <product id>, "reason": "<one concise sentence explaining why this product fits — reference a specific signal>" },
    ...
  ]
}

Rules:
- Only include IDs that exist in the product list
- Return at most 15 items, ranked best first
- Each reason must be specific — mention the event/vibe/competitor category it aligns with
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
