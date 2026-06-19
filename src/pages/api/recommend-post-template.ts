import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

interface CardInfo {
	id: string;
	templateName: string;
	slideTypeName: string;
	description: string;
	defaultSlide: Record<string, unknown>;
	charLimits: Record<string, number>;
}

interface RecommendPostTemplateRequest {
	query: string;
	campaignSummary: string;
	cards: CardInfo[];
}

interface GeneratedCard {
	cardId: string;
	reason: string;
	generatedSlide: Record<string, unknown>;
}

export interface RecommendPostTemplateResponse {
	recommendations: GeneratedCard[];
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<RecommendPostTemplateResponse | { error: string }>,
) {
	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method not allowed' });
	}

	const { query, campaignSummary, cards } =
		req.body as RecommendPostTemplateRequest;

	if (!query || !Array.isArray(cards) || cards.length === 0) {
		return res.status(400).json({ error: 'query and cards are required' });
	}

	const cardsDescription = cards
		.map(
			c => `• ${c.id} (${c.templateName} › ${c.slideTypeName})
    Purpose: ${c.description}
    Fields & char limits: ${Object.entries(c.charLimits)
		.map(([k, v]) => `${k} ≤ ${v} chars`)
		.join(', ')}
    Example structure: ${JSON.stringify(c.defaultSlide)}`,
		)
		.join('\n\n');

	const response = await openai.chat.completions.create({
		model: 'gpt-4o',
		response_format: { type: 'json_object' },
		messages: [
			{
				role: 'system',
				content: `You are a social media content creator for Headout, a travel experiences platform.

Campaign prompt: "${query}"
Campaign context: ${campaignSummary}

Available post templates:
${cardsDescription}

Your task: pick the best 1–2 templates for this campaign and generate compelling, on-brand copy.

Rules:
- Choose only templates that genuinely suit the campaign theme
- "generatedSlide" must include ALL keys from the example structure — never omit any
- STRICTLY respect character limits — count carefully, do NOT exceed them
- "imageSrc" and "badgeSrc": always keep as empty string ""
- For array fields (items/pills): keep the same array length and structure, only update text
- Content must be specific to the campaign, not generic filler
- "reason": one concise sentence (≤ 15 words) on why this template fits

Return JSON exactly:
{
  "recommendations": [
    {
      "cardId": "<one of the card ids above>",
      "reason": "<one sentence>",
      "generatedSlide": { /* all fields from the example structure */ }
    }
  ]
}`,
			},
			{
				role: 'user',
				content: `Generate post templates for: "${query}"`,
			},
		],
	});

	const raw = response.choices[0]?.message?.content ?? '{}';
	try {
		const parsed = JSON.parse(raw) as {
			recommendations?: GeneratedCard[];
		};
		const recs = Array.isArray(parsed.recommendations)
			? parsed.recommendations.filter(r =>
					cards.some(c => c.id === r.cardId),
				)
			: [];
		return res.status(200).json({ recommendations: recs });
	} catch {
		return res.status(200).json({ recommendations: [] });
	}
}
