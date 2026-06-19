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

export interface CompetitorSource {
	url: string;
	title: string;
}

export interface RecommendResponse {
	recommendedIds: number[];
	reasons: Record<number, string>;
	sources: Record<number, CompetitorSource>;
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

// Pulls url_citation annotations from the competitor response.
// These are the actual pages the model read, grounded in real search results.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractSources(response: any): CompetitorSource[] {
	const seen = new Set<string>();
	const sources: CompetitorSource[] = [];

	for (const block of response.output ?? []) {
		if (block.type !== 'message') continue;
		for (const content of block.content ?? []) {
			if (content.type !== 'output_text') continue;
			for (const annotation of content.annotations ?? []) {
				if (annotation.type !== 'url_citation') continue;
				const { url, title } = annotation as {
					url: string;
					title: string;
				};
				if (!url || seen.has(url)) continue;
				// Only keep URLs from the three competitor domains
				const isCompetitor = COMPETITORS.some(domain =>
					url.includes(domain),
				);
				if (!isCompetitor) continue;
				seen.add(url);
				sources.push({ url, title: title ?? url });
			}
		}
	}

	return sources;
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

	// Step 1: traveller intent + competitor research in parallel
	const [travellersResponse, competitorResponse] = await Promise.all([
		openai.responses.create({
			model: 'gpt-4o',
			tools: [{ type: 'web_search_preview' }],
			input: `You are a travel trends researcher. The user is building a marketing campaign with the prompt: "${query}".
Search the web to find what experiences, activities, and attractions travellers most enjoy for this type of event/destination.
Return a concise summary (150-200 words) of the top keywords, themes, and specific experiences travellers seek.
Focus on things like event names, landmark activities, popular categories, and seasonal highlights.`,
		}),

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

	// Extract grounded competitor URLs from the web search annotations
	const competitorSources = extractSources(competitorResponse);
	const sourcesBlock =
		competitorSources.length > 0
			? `\nCOMPETITOR SOURCE URLS (use these exact URLs only — do not invent any):\n${competitorSources
					.map((s, i) => `[${i + 1}] ${s.title} — ${s.url}`)
					.join('\n')}`
			: '';

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

You have two research signals:

1. TRAVELLER INTENT — what travellers are searching for and want to experience:
${travellersContext}

2. COMPETITOR MARKET SIGNALS — what GetYourGuide, Klook, and Viator are featuring:
${competitorContext}
${sourcesBlock}

Use both signals together. Competitor data shows proven commercial demand; traveller intent shows emotional fit.

Your job: pick the top 15 products from the list below that best match the campaign.

Return a JSON object with this exact shape:
{
  "recommendations": [
    {
      "id": <product id>,
      "reason": "<one concise sentence — if competitor-inspired, say so explicitly>",
      "sourceIndex": <number from the source list above, or null if not competitor-inspired>
    },
    ...
  ]
}

Rules:
- Only include IDs that exist in the product list
- Return at most 15 items, ranked best first
- reason must be ≤20 words and specific — name the event/vibe/category it aligns with
- sourceIndex must be a number from the COMPETITOR SOURCE URLS list, or null
- Never invent URLs or sourceIndex values outside the provided list`,
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
	let sources: Record<number, CompetitorSource> = {};
	try {
		const parsed = JSON.parse(raw) as {
			recommendations?: {
				id: number;
				reason: string;
				sourceIndex?: number | null;
			}[];
		};
		const recs = Array.isArray(parsed.recommendations)
			? parsed.recommendations.filter(r =>
					products.some(p => p.id === r.id),
				)
			: [];
		recommendedIds = recs.map(r => r.id);
		reasons = Object.fromEntries(recs.map(r => [r.id, r.reason]));
		sources = Object.fromEntries(
			recs
				.filter(
					r =>
						r.sourceIndex != null &&
						competitorSources[r.sourceIndex - 1] != null,
				)
				.map(r => [r.id, competitorSources[r.sourceIndex! - 1]]),
		);
	} catch {
		// return empty list — UI handles gracefully
	}

	return res
		.status(200)
		.json({ recommendedIds, reasons, sources, searchContext });
}
