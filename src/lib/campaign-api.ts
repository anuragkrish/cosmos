import type {
	TCampaignCollectionPageProps,
	TCampaignDiscountBanner,
} from '@headout/espeon/components/CampaignCollectionPage';

const BASE_URL = 'https://poc-shv.api.dev-headout.com/api/v6/ai';

export const SUPPORTED_LANGS = ['en', 'fr', 'it'] as const;
export type SupportedLang = (typeof SUPPORTED_LANGS)[number];

export interface SearchContentBanner {
	title: string | Record<string, string>;
	description: string | Record<string, string>;
	images: string[];
}

export function resolveLocalized(
	value: string | Record<string, string> | undefined,
	lang: string,
): string {
	if (!value) return '';
	if (typeof value === 'string') return value;
	return value[lang] ?? value['en'] ?? Object.values(value)[0] ?? '';
}

export interface SearchContentLocation {
	cityCode: string;
	cityName: string;
	countryCode: string;
	countryName: string;
}

export interface SearchContentTourGroup {
	id: number;
	displayName: string;
	language: string;
	urlSlug: string;
	ratings: { count: number; value: number };
	descriptors: Array<{
		code: string;
		name: string;
		displayName?: string;
		iconUrl?: string;
		description?: string;
		type?: string;
	}>;
	medias: Array<{
		url: string;
		type: string;
		metadata?: {
			altText?: string;
			videoDuration?: null;
			uploadDate?: string;
		};
	}>;
	listingPrice: {
		currencyCode: string;
		originalPrice: number;
		finalPrice: number;
		minimumPayablePrice: number;
		type: string;
		otherPricesExist: boolean;
		bestDiscount: number;
		cashbackValue: number;
		cashbackType: string;
		tourId: number;
	};
	primaryCollection?: { id: number; displayName: string };
	primaryCategory?: { id: number; displayName: string };
	primarySubCategory?: { id: number; displayName: string };
	primaryCity?: { code: string; displayName: string };
	combo?: boolean;
	multiVariant?: boolean;
	flowType?: string;
	schedule?: unknown;
	personas?: unknown[];
	itineraries?: unknown[];
	content?: unknown;
	minDuration?: number | null;
	maxDuration?: number | null;
	guestCount?: number;
	source?: string;
}

export interface SearchContentApiResponse {
	location: SearchContentLocation;
	tourGroups: SearchContentTourGroup[];
	meta: Record<string, unknown>;
	banner: SearchContentBanner;
	themeColor: string;
	priceData: Record<string, unknown>;
	cities: unknown[];
	error: string | null;
}

export async function fetchCampaignContent(
	prompt: string,
): Promise<SearchContentApiResponse> {
	const res = await fetch(`${BASE_URL}/search-content`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ prompt }),
	});
	if (!res.ok) throw new Error(`Search content API error: ${res.status}`);
	return res.json();
}

export interface CreateCollectionPayload {
	name: string;
	displayName: string;
	city: string;
	content: string;
	contentDescription: string;
	tourGroups: number[];
	urlSlug: string;
	heroImageUrl: string;
	cardImageUrl: string;
	iconId: number;
}

export interface CreateCollectionResponse {
	id?: number | string;
	collectionId?: number | string;
	[key: string]: unknown;
}

export async function createCollectionContent(
	payload: CreateCollectionPayload,
): Promise<CreateCollectionResponse> {
	const res = await fetch(`${BASE_URL}/collection-content`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload),
	});
	if (!res.ok) throw new Error(`Collection content API error: ${res.status}`);
	return res.json();
}

export interface CollectionContentResponse {
	id?: number;
	collectionId?: number;
	content?: string;
	[key: string]: unknown;
}

export async function getCollectionContent(
	collectionId: number | string,
): Promise<CollectionContentResponse> {
	const res = await fetch(`${BASE_URL}/collection-content/${collectionId}`, {
		headers: { 'Content-Type': 'application/json' },
	});
	if (!res.ok) throw new Error(`Get collection API error: ${res.status}`);
	return res.json();
}

export interface CampaignDataResponse {
	tourGroups?: SearchContentTourGroup[];
	[key: string]: unknown;
}

export async function getCampaignData(
	collectionId: number | string,
	language: SupportedLang = 'en',
): Promise<CampaignDataResponse> {
	const res = await fetch(
		`${BASE_URL}/campaign-data/collection/${collectionId}?language=${language}`,
		{ headers: { 'Content-Type': 'application/json' } },
	);
	if (!res.ok) throw new Error(`Get campaign data API error: ${res.status}`);
	return res.json();
}

export interface CollectionSummary {
	id: number | string;
	collectionId?: number | string;
	name?: string;
	displayName?: string;
	urlSlug?: string;
	city?: string;
	heroImageUrl?: string;
	cardImageUrl?: string;
	[key: string]: unknown;
}

export async function getCollections(): Promise<CollectionSummary[]> {
	const res = await fetch(`${BASE_URL}/collections`, {
		headers: { 'Content-Type': 'application/json' },
	});
	if (!res.ok) throw new Error(`Get collections API error: ${res.status}`);
	return res.json();
}

export async function deleteCollection(
	collectionId: number | string,
): Promise<void> {
	const res = await fetch(`${BASE_URL}/collections/${collectionId}`, {
		method: 'DELETE',
		headers: { 'Content-Type': 'application/json' },
	});
	if (!res.ok) throw new Error(`Delete collection API error: ${res.status}`);
}

export function buildPreviewPropsFromCollection(
	collectionResponse: CollectionContentResponse,
	campaignDataResponse: CampaignDataResponse,
	lang: SupportedLang = 'en',
): Omit<
	TCampaignCollectionPageProps,
	'currencyList' | 'productCardLabels' | 'isMobile'
> {
	// Parse banner from the stringified content field.
	// Content may be { banner, meta } (new shape) or a bare banner object (legacy).
	let banner: SearchContentBanner = {
		title: '',
		description: '',
		images: [],
	};
	try {
		if (collectionResponse.content) {
			const parsed = JSON.parse(collectionResponse.content);
			banner = parsed?.banner ?? parsed;
		}
	} catch {
		// keep default empty banner
	}

	const bannerTitle = resolveLocalized(banner.title, lang);
	const bannerDescription = resolveLocalized(banner.description, lang);

	const allProducts = (campaignDataResponse.tourGroups ??
		[]) as SearchContentTourGroup[];

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const toProductCard = (tg: SearchContentTourGroup): any => ({
		id: tg.id,
		displayName: tg.displayName,
		language: tg.language,
		urlSlug: tg.urlSlug,
		ratings: tg.ratings,
		descriptors:
			tg.descriptors?.map(d => ({
				code: d.code,
				name: d.name,
				displayName: d.displayName,
				iconUrl: d.iconUrl,
				description: d.description,
				type: d.type,
			})) ?? [],
		medias: tg.medias,
		listingPrice: tg.listingPrice,
		primaryCollection: tg.primaryCollection ?? { id: 0, displayName: '' },
		primaryCategory: tg.primaryCategory ?? { id: 0, displayName: '' },
		primarySubCategory: tg.primarySubCategory ?? { id: 0, displayName: '' },
		primaryCity: tg.primaryCity ?? { code: '', displayName: '' },
		combo: tg.combo ?? false,
		multiVariant: tg.multiVariant ?? false,
		flowType: tg.flowType,
		schedule: tg.schedule,
		personas: tg.personas,
		itineraries: tg.itineraries,
		content: tg.content,
		minDuration: tg.minDuration,
		maxDuration: tg.maxDuration,
		guestCount: tg.guestCount,
		verticalImageUrl: tg.medias?.[0]?.url,
	});

	const usedIds = new Set<number>();

	// Weighted rating score: value scaled by log of review count to reward
	// products with more reviews without completely ignoring high-score newcomers.
	const ratingScore = (p: SearchContentTourGroup) => {
		const value = p.ratings?.value ?? 0;
		const count = p.ratings?.count ?? 0;
		return value * Math.log10(Math.max(count, 1) + 1);
	};

	// Step 1: Top Experiences — highest discounted products, max 6, min 4.
	// Pad with highest-rated (by weighted score) non-discounted products if needed.
	const discountedSorted = [...allProducts]
		.filter(p => (p.listingPrice?.bestDiscount ?? 0) > 0)
		.sort(
			(a, b) =>
				(b.listingPrice?.bestDiscount ?? 0) -
				(a.listingPrice?.bestDiscount ?? 0),
		);
	const topExperienceRaw = discountedSorted.slice(0, 6);
	if (topExperienceRaw.length < 4) {
		const selectedIds = new Set(topExperienceRaw.map(p => p.id));
		const extras = [...allProducts]
			.filter(p => !selectedIds.has(p.id))
			.sort((a, b) => ratingScore(b) - ratingScore(a));
		topExperienceRaw.push(...extras.slice(0, 4 - topExperienceRaw.length));
	}
	topExperienceRaw.forEach(p => usedIds.add(p.id));

	// Step 2: Top Rated — from remaining pool, sorted by weighted rating score
	// (value × log(count)) so review volume is factored in. Max 6, min 4.
	const remainingAfterTopExp = allProducts.filter(p => !usedIds.has(p.id));
	const ratedSorted = [...remainingAfterTopExp]
		.filter(p => (p.ratings?.value ?? 0) > 0 && (p.ratings?.count ?? 0) > 0)
		.sort((a, b) => ratingScore(b) - ratingScore(a));
	const topRatedRaw = ratedSorted.slice(0, 6);
	if (topRatedRaw.length < 4) {
		const ratedIds = new Set(ratedSorted.map(p => p.id));
		const extras = remainingAfterTopExp
			.filter(p => !ratedIds.has(p.id))
			.sort(
				(a, b) =>
					(b.listingPrice?.bestDiscount ?? 0) -
					(a.listingPrice?.bestDiscount ?? 0),
			);
		topRatedRaw.push(...extras.slice(0, 4 - topRatedRaw.length));
	}
	topRatedRaw.forEach(p => usedIds.add(p.id));

	// Step 3: Upto 30% — from remaining pool, any product with a discount,
	// sorted descending by discount. Show section only if ≥4 qualify.
	const remainingAfterTopRated = allProducts.filter(p => !usedIds.has(p.id));
	const upto30Candidates = [...remainingAfterTopRated]
		.filter(p => (p.listingPrice?.bestDiscount ?? 0) > 0)
		.sort(
			(a, b) =>
				(b.listingPrice?.bestDiscount ?? 0) -
				(a.listingPrice?.bestDiscount ?? 0),
		);
	const upto30Raw = upto30Candidates.slice(0, 6);
	const showUpto30 = upto30Raw.length >= 4;
	if (showUpto30) upto30Raw.forEach(p => usedIds.add(p.id));

	// Step 4: More Offers — all remaining products
	const moreOffersRaw = allProducts.filter(p => !usedIds.has(p.id));

	const discountBanners: TCampaignDiscountBanner[] = [];
	if (showUpto30) {
		const maxDiscount =
			Math.ceil(
				Math.max(
					...upto30Raw.map(p => p.listingPrice?.bestDiscount ?? 0),
				) / 5,
			) * 5;
		discountBanners.push({
			preText: 'Upto',
			discountLabel: `${maxDiscount}% off`,
			products: upto30Raw.map(toProductCard),
		});
	}
	if (moreOffersRaw.length > 0) {
		discountBanners.push({
			preText: '',
			discountLabel: 'More Offers',
			products: moreOffersRaw.map(toProductCard),
		});
	}
	// Fallback: if both sections are empty, surface all products in More Offers
	if (discountBanners.length === 0) {
		discountBanners.push({
			preText: '',
			discountLabel: 'More Offers',
			products: allProducts.map(toProductCard),
		});
	}

	return {
		lang,
		headerBanner: {
			backgroundColor: '#1A1A2E',
			chipText: '',
			title: bannerTitle,
			subtitle: bannerDescription,
			ctaText: 'Explore Deals',
			ctaHref: '#',
			image: {
				imageUrl: banner.images?.[0] ?? '',
				shapeIndex: 0,
			},
		},
		topOffers: {
			title: 'Top Experiences',
			products: topExperienceRaw.map(toProductCard),
		},
		topRated: {
			title: 'Top Rated',
			products: topRatedRaw.map(toProductCard),
		},
		discountBanners,
	};
}

function toKebabCase(str: string): string {
	return str
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, '')
		.trim()
		.replace(/\s+/g, '-');
}

export function buildCollectionPayload(
	data: SearchContentApiResponse,
	acceptedTgIds: number[],
): CreateCollectionPayload {
	const metaSlug = data.meta?.urlSlug as string | undefined;
	const derivedSlug = toKebabCase(
		resolveLocalized(data.banner?.title, 'en') || 'campaign',
	);
	const urlSlug = metaSlug ?? derivedSlug;

	return {
		name: urlSlug,
		displayName: resolveLocalized(data.banner?.title, 'en') || 'Campaign',
		city: data.location?.cityCode ?? '',
		content: JSON.stringify({ banner: data.banner, meta: data.meta }),
		contentDescription: resolveLocalized(data.banner?.description, 'en'),
		tourGroups: acceptedTgIds,
		urlSlug,
		heroImageUrl: data.banner?.images?.[0] ?? '',
		cardImageUrl:
			data.banner?.images?.[1] ?? data.banner?.images?.[0] ?? '',
		iconId: 5,
	};
}

export function buildUpsertPayload(
	searchData: SearchContentApiResponse,
	acceptedTgIds: number[],
	updatedBanner: SearchContentBanner,
	heroImageUrl: string,
): CreateCollectionPayload {
	const base = buildCollectionPayload(searchData, acceptedTgIds);
	return {
		...base,
		heroImageUrl,
		cardImageUrl: heroImageUrl,
		content: JSON.stringify({
			banner: updatedBanner,
			meta: searchData.meta,
		}),
		displayName:
			resolveLocalized(updatedBanner.title, 'en') || base.displayName,
		contentDescription: resolveLocalized(updatedBanner.description, 'en'),
	};
}

// ─── Studio prop builders ────────────────────────────────────────────────────

export interface PromoStudioProps {
	brandLine1: string;
	brandLine2: string;
	showByHeadout: boolean;
	title: string;
	rating: number;
	showRating: boolean;
	ctaLabel: string;
	showCta: boolean;
	imageSrc: string;
	bgColor: string;
	glowColor: string;
	accentColor: string;
	textColor: string;
}

export function buildPromoProps(
	data: SearchContentApiResponse,
	acceptedTgIds: number[],
): PromoStudioProps {
	const accepted = data.tourGroups.filter(tg =>
		acceptedTgIds.includes(tg.id),
	);
	const first = accepted[0] ?? data.tourGroups[0];
	const cityWords = (data.location?.cityName ?? '').toUpperCase().split(' ');

	return {
		brandLine1: cityWords[0] ?? data.location?.cityCode ?? '',
		brandLine2: cityWords.slice(1).join(' ') || 'TICKETS',
		showByHeadout: true,
		title: first?.displayName ?? data.banner?.title ?? '',
		rating: first?.ratings?.value ?? 0,
		showRating: (first?.ratings?.value ?? 0) > 0,
		ctaLabel: 'Book now',
		showCta: true,
		imageSrc: first?.medias?.[0]?.url ?? data.banner?.images?.[0] ?? '',
		bgColor: data.themeColor || '#330066',
		glowColor: data.themeColor || '#8C12C9',
		accentColor: '#FFBC00',
		textColor: '#FFFFFF',
	};
}

export interface CampaignStoryStudioProps {
	imageSrc: string;
	title: string;
	description: string;
	outerBgColor: string;
	cardBgColor: string;
	textColor: string;
}

export function buildCampaignStoryProps(
	data: SearchContentApiResponse,
	acceptedTgIds: number[],
): CampaignStoryStudioProps {
	const accepted = data.tourGroups.filter(tg =>
		acceptedTgIds.includes(tg.id),
	);
	const first = accepted[0] ?? data.tourGroups[0];

	return {
		imageSrc: first?.medias?.[0]?.url ?? data.banner?.images?.[0] ?? '',
		title:
			resolveLocalized(data.banner?.title, 'en') ||
			first?.displayName ||
			'',
		description: resolveLocalized(data.banner?.description, 'en') || '',
		outerBgColor: '#d8f1ff',
		cardBgColor: '#b7e4ff',
		textColor: '#02376d',
	};
}

export interface DestSlideData {
	type: 'cover' | 'city';
	[key: string]: unknown;
}

export function buildDestinationsProps(
	data: SearchContentApiResponse,
	acceptedTgIds: number[],
): { slides: DestSlideData[]; slideIndex: number } {
	const accepted = data.tourGroups.filter(tg =>
		acceptedTgIds.includes(tg.id),
	);
	const products =
		accepted.length > 0 ? accepted : data.tourGroups.slice(0, 5);

	const coverSlide: DestSlideData = {
		type: 'cover',
		coverLabel: data.location?.cityName ?? '',
		title: data.banner?.title ?? '',
		imageSrc: data.banner?.images?.[0] ?? '',
	};

	const citySlides: DestSlideData[] = products.slice(0, 6).map(tg => ({
		type: 'city',
		cityName: tg.displayName,
		description: '',
		tipText: '',
		imageSrc: tg.medias?.[0]?.url ?? '',
	}));

	return { slides: [coverSlide, ...citySlides], slideIndex: 0 };
}

// Maps the API response to the props shape CampaignCollectionPage expects.
// currencyList and productCardLabels are injected by the caller since they
// are display-only in the preview context.
export function mapApiToCampaignProps(
	data: SearchContentApiResponse,
	lang = 'en',
): Omit<
	TCampaignCollectionPageProps,
	'currencyList' | 'productCardLabels' | 'isMobile'
> {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const products: any[] = data.tourGroups.map(tg => ({
		id: tg.id,
		displayName: tg.displayName,
		language: tg.language,
		urlSlug: tg.urlSlug,
		ratings: tg.ratings,
		descriptors: tg.descriptors.map(d => ({
			code: d.code,
			name: d.name,
			displayName: d.displayName,
			iconUrl: d.iconUrl,
			description: d.description,
			type: d.type,
		})),
		medias: tg.medias,
		listingPrice: tg.listingPrice,
		primaryCollection: tg.primaryCollection ?? { id: 0, displayName: '' },
		primaryCategory: tg.primaryCategory ?? { id: 0, displayName: '' },
		primarySubCategory: tg.primarySubCategory ?? { id: 0, displayName: '' },
		primaryCity: tg.primaryCity ?? { code: '', displayName: '' },
		combo: tg.combo ?? false,
		multiVariant: tg.multiVariant ?? false,
		flowType: tg.flowType,
		schedule: tg.schedule,
		personas: tg.personas,
		itineraries: tg.itineraries,
		content: tg.content,
		minDuration: tg.minDuration,
		maxDuration: tg.maxDuration,
		guestCount: tg.guestCount,
		verticalImageUrl: tg.medias?.[0]?.url,
	}));

	const half = Math.ceil(products.length / 2);

	const discounted = products.filter(p => p.listingPrice?.bestDiscount > 0);
	const bannerProducts = discounted.length > 0 ? discounted : products;

	const discountBanners: TCampaignDiscountBanner[] = [
		{ preText: 'Upto', discountLabel: '30% off', products: bannerProducts },
		{ preText: 'Upto', discountLabel: '20% off', products: bannerProducts },
		{ preText: 'Upto', discountLabel: '10% off', products: bannerProducts },
	];

	return {
		lang,
		headerBanner: {
			backgroundColor: data.themeColor || '#E67E22',
			chipText: data.location?.cityName ?? '',
			title: resolveLocalized(data.banner?.title, lang) || 'Campaign',
			subtitle: resolveLocalized(data.banner?.description, lang),
			ctaText: 'Explore Deals',
			ctaHref: '#',
			image: {
				imageUrl: data.banner?.images?.[0] ?? '',
				shapeIndex: 0,
			},
		},
		topOffers: {
			title: 'Top Offers',
			products: products.slice(0, half),
		},
		topRated:
			products.length > half
				? { title: 'Top Rated', products: products.slice(half) }
				: undefined,
		discountBanners,
	};
}
