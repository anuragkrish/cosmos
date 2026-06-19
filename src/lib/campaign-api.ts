import type {
	TCampaignCollectionPageProps,
	TCampaignDiscountBanner,
} from '@headout/espeon/components/CampaignCollectionPage';

export interface SearchContentBanner {
	title: string;
	description: string;
	images: string[];
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
	const res = await fetch(
		'https://poc-shv.api.dev-headout.com/api/v6/ai/search-content',
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ prompt }),
		},
	);
	if (!res.ok) throw new Error(`Search content API error: ${res.status}`);
	return res.json();
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
		descriptors: tg.descriptors.map(d => ({ code: d.code, name: d.name })),
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
			title: data.banner?.title ?? 'Campaign',
			subtitle: data.banner?.description ?? '',
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
