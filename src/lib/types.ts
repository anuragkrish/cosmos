export interface ListingPrice {
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
}

export interface Ratings {
	count: number;
	value: number;
}

export interface CancellationPolicy {
	cancellable: boolean;
	cancellableUpTo: string | null;
}

export interface AvailabilityInfo {
	date: string;
	remaining: number;
	availability: 'LIMITED' | 'UNLIMITED' | 'SOLD_OUT';
}

export interface ListingAvailability {
	nextAvailableDate: AvailabilityInfo | null;
}

export interface RelatedProduct {
	id: number;
	displayName: string;
	language: string;
	urlSlug: string;
	ratings: Ratings;
	listingPrice: ListingPrice;
	primaryCategory: { id: number; displayName: string };
	primarySubCategory: { id: number; displayName: string };
	primaryCity: { code: string; displayName: string };
	source: 'MAIN_PRODUCT' | 'RANKED_PRODUCTS' | 'CITY_PRODUCTS';
	flowType: string;
	combo: boolean;
	multiVariant: boolean;
	cancellationPolicy: CancellationPolicy;
	listingAvailability: ListingAvailability;
}

export type ProductDecision = 'accepted' | 'pending';
