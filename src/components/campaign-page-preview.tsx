'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import dynamic from 'next/dynamic';
import type { TCampaignCollectionPageProps } from '@headout/espeon/components/CampaignCollectionPage';
import {
	buildPreviewPropsFromCollection,
	buildUpsertPayload,
	createCollectionContent,
	getCampaignData,
	SUPPORTED_LANGS,
	type SearchContentBanner,
	type SupportedLang,
	type CampaignDataResponse,
} from '@/lib/campaign-api';
import { useBoundStore } from '@/stores/store';

const CampaignCollectionPage = dynamic(
	() =>
		import('@headout/espeon/components/CampaignCollectionPage').then(
			m => m.CampaignCollectionPage,
		),
	{ ssr: false },
);

const PRODUCT_CARD_LABELS: TCampaignCollectionPageProps['productCardLabels'] = {
	new: 'New',
	from: 'From',
	offPercentage: '{0}% off',
	cashbackText: 'Cashback',
	priceVariesByGroupSize: 'Price varies by group size',
};

// ── Types ──────────────────────────────────────────────────────────────────

type EditableField = 'headerBanner.title' | 'headerBanner.subtitle';

type EditedValues = Partial<Record<EditableField, string>>;

// ── Preview card ───────────────────────────────────────────────────────────

interface CampaignPagePreviewCardProps {
	prompt: string;
}

export function CampaignPagePreviewCard({
	prompt,
}: CampaignPagePreviewCardProps) {
	const [open, setOpen] = useState(false);
	const [hovered, setHovered] = useState(false);

	return (
		<>
			<div
				onMouseEnter={() => setHovered(true)}
				onMouseLeave={() => setHovered(false)}
				style={{
					display: 'flex',
					flexDirection: 'column',
					gap: '16px',
					borderRadius: 'var(--radius-16)',
					border: `1px solid ${hovered ? 'var(--colors-core-grey-400)' : 'var(--color-semantic-dividers-dark)'}`,
					background: 'var(--color-semantic-surface-light-white)',
					padding: '20px',
					boxShadow: hovered
						? '0 4px 16px rgba(0,0,0,0.08)'
						: '0 1px 4px rgba(0,0,0,0.04)',
					transition:
						'border-color 0.15s, box-shadow 0.15s, transform 0.15s',
					transform: hovered ? 'translateY(-2px)' : 'none',
				}}
			>
				{/* Thumbnail */}
				<div
					style={{
						position: 'relative',
						width: '100%',
						borderRadius: 'var(--radius-12)',
						overflow: 'hidden',
						background:
							'linear-gradient(135deg, var(--colors-core-grey-50) 0%, var(--colors-core-grey-100) 100%)',
						border: '1px solid var(--color-semantic-dividers-dark)',
						aspectRatio: '16 / 9',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					<div
						style={{
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							gap: '6px',
							padding: '0 16px',
							textAlign: 'center',
						}}
					>
						<div
							style={{
								width: '32px',
								height: '32px',
								borderRadius: 'var(--radius-full)',
								background: 'var(--colors-core-grey-200)',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
							}}
						>
							<svg
								width='16'
								height='16'
								viewBox='0 0 16 16'
								fill='none'
								style={{
									color: 'var(--color-semantic-text-grey-3)',
								}}
							>
								<rect
									x='1'
									y='3'
									width='14'
									height='10'
									rx='1.5'
									stroke='currentColor'
									strokeWidth='1.3'
								/>
								<path
									d='M1 6h14'
									stroke='currentColor'
									strokeWidth='1.3'
								/>
								<rect
									x='3'
									y='8.5'
									width='4'
									height='2.5'
									rx='0.5'
									fill='currentColor'
									opacity='0.4'
								/>
								<rect
									x='9'
									y='8.5'
									width='4'
									height='1'
									rx='0.5'
									fill='currentColor'
									opacity='0.3'
								/>
								<rect
									x='9'
									y='10'
									width='2.5'
									height='1'
									rx='0.5'
									fill='currentColor'
									opacity='0.3'
								/>
							</svg>
						</div>
						<span
							style={{
								fontSize: '10px',
								color: 'var(--color-semantic-text-disabled)',
								fontWeight: 500,
							}}
						>
							Campaign Page
						</span>
					</div>

					<button
						onClick={() => setOpen(true)}
						style={{
							position: 'absolute',
							inset: 0,
							display: 'flex',
							alignItems: 'flex-end',
							justifyContent: 'center',
							paddingBottom: '12px',
							opacity: hovered ? 1 : 0,
							transition: 'opacity 0.15s',
							cursor: 'pointer',
							background: 'transparent',
							border: 'none',
						}}
					>
						<span
							style={{
								fontSize: '12px',
								background: 'rgba(34,34,34,0.82)',
								color: '#fff',
								padding: '6px 12px',
								borderRadius: 'var(--radius-8)',
								fontWeight: 500,
								backdropFilter: 'blur(6px)',
							}}
						>
							Preview
						</span>
					</button>
				</div>

				{/* Card footer */}
				<div
					style={{
						display: 'flex',
						alignItems: 'flex-start',
						justifyContent: 'space-between',
					}}
				>
					<div
						style={{
							display: 'flex',
							flexDirection: 'column',
							gap: '4px',
						}}
					>
						<span
							style={{
								fontSize: '14px',
								fontWeight: 600,
								color: 'var(--color-semantic-text-grey-1)',
							}}
						>
							Campaign Page
						</span>
						<span
							style={{
								fontSize: '12px',
								color: 'var(--color-semantic-text-disabled)',
								lineHeight: 1.5,
							}}
						>
							See how your products look on the collection page
							template
						</span>
					</div>
					<button
						onClick={() => setOpen(true)}
						style={{
							flexShrink: 0,
							marginTop: '2px',
							fontSize: '12px',
							color: 'var(--color-semantic-text-grey-3)',
							background:
								'var(--color-semantic-surface-light-white)',
							border: '1px solid var(--color-semantic-dividers-dark)',
							padding: '4px 10px',
							borderRadius: 'var(--radius-8)',
							cursor: 'pointer',
							fontWeight: 500,
							transition: 'border-color 0.12s, color 0.12s',
						}}
					>
						Preview
					</button>
				</div>
			</div>

			{open && (
				<CampaignPagePreviewModal onClose={() => setOpen(false)} />
			)}
		</>
	);
}

// ── Preview modal ──────────────────────────────────────────────────────────

interface CampaignPagePreviewModalProps {
	onClose: () => void;
}

const LANG_LABELS: Record<SupportedLang, string> = {
	en: 'EN',
	fr: 'FR',
	it: 'IT',
};
const SIDEBAR_WIDTH = 260;

function CampaignPagePreviewModal({ onClose }: CampaignPagePreviewModalProps) {
	const collectionData = useBoundStore(s => s.collectionData);
	const campaignData = useBoundStore(s => s.campaignData);
	const searchData = useBoundStore(s => s.searchData);
	const acceptedTgIds = useBoundStore(s => s.acceptedTgIds);

	const bannerImages: string[] = useMemo(() => {
		const raw = searchData?.banner?.images;
		return Array.isArray(raw) ? raw.filter(Boolean) : [];
	}, [searchData]);

	const [lang, setLang] = useState<SupportedLang>('en');
	const [localCampaignData, setLocalCampaignData] =
		useState<CampaignDataResponse | null>(campaignData);
	const [isLangLoading, setIsLangLoading] = useState(false);
	const [selectedImageUrl, setSelectedImageUrl] = useState<string>(
		bannerImages[0] ?? '',
	);
	const [editedValues, setEditedValues] = useState<EditedValues>({});
	const [isSaving, setIsSaving] = useState(false);
	const [saveError, setSaveError] = useState<string | null>(null);
	const [saveSuccess, setSaveSuccess] = useState(false);

	// Refetch campaign data when language changes
	useEffect(() => {
		if (!collectionData) return;
		const collectionId = collectionData.collectionId ?? collectionData.id;
		if (!collectionId) return;
		if (lang === 'en') {
			setLocalCampaignData(campaignData);
			return;
		}
		setIsLangLoading(true);
		getCampaignData(collectionId, lang)
			.then(data => setLocalCampaignData(data))
			.catch(() => setLocalCampaignData(campaignData))
			.finally(() => setIsLangLoading(false));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [lang]);

	const pageProps = useMemo(() => {
		if (!collectionData || !localCampaignData) return null;
		return buildPreviewPropsFromCollection(
			collectionData,
			localCampaignData,
			lang,
		);
	}, [collectionData, localCampaignData, lang]);

	const status = pageProps ? 'ready' : 'error';

	// Close on Escape
	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose();
		};
		window.addEventListener('keydown', handler);
		return () => window.removeEventListener('keydown', handler);
	}, [onClose]);

	// Lock body scroll
	useEffect(() => {
		const prev = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = prev;
		};
	}, []);

	const onValueChange = useCallback(
		(field: EditableField) => (value: string) => {
			setEditedValues(prev => ({ ...prev, [field]: value }));
			setSaveSuccess(false);
		},
		[],
	);

	const mergedProps = pageProps
		? {
				...pageProps,
				headerBanner: {
					...pageProps.headerBanner,
					title:
						editedValues['headerBanner.title'] ??
						pageProps.headerBanner.title,
					subtitle:
						editedValues['headerBanner.subtitle'] ??
						pageProps.headerBanner.subtitle,
					image: {
						...pageProps.headerBanner.image,
						imageUrl:
							selectedImageUrl ||
							pageProps.headerBanner.image.imageUrl,
					},
				},
			}
		: null;

	const editConfig: TCampaignCollectionPageProps['editConfig'] = {
		headerBanner: {
			chipText: { editable: false },
			title: {
				editable: true,
				onValueChange: onValueChange('headerBanner.title'),
			},
			subtitle: {
				editable: true,
				onValueChange: onValueChange('headerBanner.subtitle'),
			},
			ctaText: { editable: false },
		},
	};

	const hasChanges =
		Object.keys(editedValues).length > 0 ||
		(bannerImages[0] !== undefined && selectedImageUrl !== bannerImages[0]);

	const handleSave = useCallback(async () => {
		if (!searchData || !collectionData) return;
		setIsSaving(true);
		setSaveError(null);
		setSaveSuccess(false);
		try {
			const existingBanner: SearchContentBanner = (() => {
				try {
					return collectionData.content
						? (JSON.parse(
								collectionData.content as string,
							) as SearchContentBanner)
						: searchData.banner;
				} catch {
					return searchData.banner;
				}
			})();

			const updatedTitle = (() => {
				const edited = editedValues['headerBanner.title'];
				if (!edited) return existingBanner.title;
				const t = existingBanner.title;
				if (typeof t === 'string') return edited;
				return { ...t, [lang]: edited };
			})();

			const updatedDescription = (() => {
				const edited = editedValues['headerBanner.subtitle'];
				if (!edited) return existingBanner.description;
				const d = existingBanner.description;
				if (typeof d === 'string') return edited;
				return { ...d, [lang]: edited };
			})();

			const updatedBanner: SearchContentBanner = {
				...existingBanner,
				title: updatedTitle,
				description: updatedDescription,
			};

			const payload = buildUpsertPayload(
				searchData,
				acceptedTgIds,
				updatedBanner,
				selectedImageUrl || bannerImages[0] || '',
			);

			await createCollectionContent(payload);
			setSaveSuccess(true);
			setEditedValues({});
		} catch (e) {
			setSaveError(e instanceof Error ? e.message : 'Save failed');
		} finally {
			setIsSaving(false);
		}
	}, [
		searchData,
		collectionData,
		acceptedTgIds,
		editedValues,
		selectedImageUrl,
		bannerImages,
		lang,
	]);

	return createPortal(
		<div
			style={{
				position: 'fixed',
				inset: 0,
				zIndex: 50,
				display: 'flex',
				flexDirection: 'column',
				background: 'rgba(0,0,0,0.6)',
			}}
		>
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					background: 'var(--color-semantic-surface-light-white)',
					width: '100%',
					height: '100%',
				}}
				onClick={e => e.stopPropagation()}
			>
				{/* Top bar */}
				<div
					style={{
						flexShrink: 0,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						padding: '12px 20px',
						background: 'rgba(255,255,255,0.92)',
						backdropFilter: 'blur(8px)',
						borderBottom:
							'1px solid var(--color-semantic-surface-light-grey-3)',
					}}
				>
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: '10px',
						}}
					>
						<div
							style={{
								width: '8px',
								height: '8px',
								borderRadius: 'var(--radius-full)',
								background: 'var(--colors-core-grey-700)',
							}}
						/>
						<span
							style={{
								fontSize: '14px',
								fontWeight: 600,
								color: 'var(--color-semantic-text-grey-1)',
							}}
						>
							Campaign Page Preview
						</span>
						{status === 'ready' && (
							<span
								style={{
									fontSize: '12px',
									color: 'var(--color-semantic-text-disabled)',
									fontWeight: 400,
								}}
							>
								· Double-click banner text to edit
							</span>
						)}
					</div>
					<button
						onClick={onClose}
						style={{
							width: '28px',
							height: '28px',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							borderRadius: 'var(--radius-8)',
							color: 'var(--color-semantic-text-disabled)',
							background: 'transparent',
							border: 'none',
							cursor: 'pointer',
						}}
					>
						<svg
							width='14'
							height='14'
							viewBox='0 0 14 14'
							fill='none'
						>
							<path
								d='M2 2l10 10M12 2L2 12'
								stroke='currentColor'
								strokeWidth='1.5'
								strokeLinecap='round'
							/>
						</svg>
					</button>
				</div>

				{/* Body: sidebar + scrollable content */}
				<div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
					{/* Sidebar */}
					<div
						style={{
							width: SIDEBAR_WIDTH,
							flexShrink: 0,
							display: 'flex',
							flexDirection: 'column',
							borderRight:
								'1px solid var(--color-semantic-surface-light-grey-3)',
							background:
								'var(--color-semantic-surface-light-grey-1)',
							overflowY: 'auto',
						}}
					>
						{/* Language switcher */}
						<div
							style={{
								padding: '16px',
								borderBottom:
									'1px solid var(--color-semantic-dividers-dark)',
							}}
						>
							<span
								style={{
									fontSize: '10px',
									fontWeight: 600,
									color: 'var(--color-semantic-text-disabled)',
									textTransform: 'uppercase',
									letterSpacing: '0.06em',
								}}
							>
								Language
							</span>
							<div
								style={{
									display: 'flex',
									gap: '6px',
									marginTop: '8px',
								}}
							>
								{SUPPORTED_LANGS.map(l => (
									<button
										key={l}
										onClick={() => {
											setLang(l);
											setEditedValues({});
										}}
										style={{
											flex: 1,
											fontSize: '12px',
											fontWeight: lang === l ? 700 : 500,
											color:
												lang === l
													? 'var(--color-semantic-surface-dark-black)'
													: 'var(--color-semantic-text-grey-3)',
											background:
												lang === l
													? '#fff'
													: 'transparent',
											border:
												lang === l
													? '1px solid var(--color-semantic-dividers-dark)'
													: '1px solid transparent',
											borderRadius: 'var(--radius-8)',
											padding: '6px 0',
											cursor: 'pointer',
											transition: 'all 0.12s',
											boxShadow:
												lang === l
													? '0 1px 3px rgba(0,0,0,0.08)'
													: 'none',
										}}
									>
										{LANG_LABELS[l]}
									</button>
								))}
							</div>
							{isLangLoading && (
								<div
									style={{
										display: 'flex',
										alignItems: 'center',
										gap: '6px',
										marginTop: '8px',
									}}
								>
									<div
										style={{
											width: '12px',
											height: '12px',
											borderRadius: '50%',
											border: '2px solid var(--color-semantic-dividers-dark)',
											borderTopColor:
												'var(--color-semantic-text-grey-2)',
											animation:
												'spin 0.7s linear infinite',
										}}
									/>
									<span
										style={{
											fontSize: '11px',
											color: 'var(--color-semantic-text-disabled)',
										}}
									>
										Loading…
									</span>
								</div>
							)}
						</div>

						{/* Hero image picker */}
						{bannerImages.length > 0 && (
							<div style={{ padding: '16px', flex: 1 }}>
								<span
									style={{
										fontSize: '10px',
										fontWeight: 600,
										color: 'var(--color-semantic-text-disabled)',
										textTransform: 'uppercase',
										letterSpacing: '0.06em',
									}}
								>
									Hero Image
								</span>
								<div
									style={{
										display: 'flex',
										flexDirection: 'column',
										gap: '8px',
										marginTop: '10px',
									}}
								>
									{bannerImages.map((url, i) => {
										const isSelected =
											selectedImageUrl === url;
										return (
											<button
												key={i}
												onClick={() =>
													setSelectedImageUrl(url)
												}
												style={{
													position: 'relative',
													width: '100%',
													aspectRatio: '16 / 9',
													borderRadius:
														'var(--radius-8)',
													overflow: 'hidden',
													border: isSelected
														? '2px solid var(--color-semantic-surface-dark-black)'
														: '2px solid transparent',
													padding: 0,
													cursor: 'pointer',
													background:
														'var(--colors-core-grey-100)',
													transition:
														'border-color 0.12s',
													flexShrink: 0,
												}}
											>
												{/* eslint-disable-next-line @next/next/no-img-element */}
												<img
													src={url}
													alt={`Banner image ${i + 1}`}
													style={{
														width: '100%',
														height: '100%',
														objectFit: 'cover',
														display: 'block',
													}}
												/>
												{isSelected && (
													<div
														style={{
															position:
																'absolute',
															top: '6px',
															right: '6px',
															width: '18px',
															height: '18px',
															borderRadius: '50%',
															background:
																'var(--color-semantic-surface-dark-black)',
															display: 'flex',
															alignItems:
																'center',
															justifyContent:
																'center',
														}}
													>
														<svg
															width='10'
															height='10'
															viewBox='0 0 10 10'
															fill='none'
														>
															<path
																d='M2 5l2.5 2.5L8 3'
																stroke='#fff'
																strokeWidth='1.5'
																strokeLinecap='round'
																strokeLinejoin='round'
															/>
														</svg>
													</div>
												)}
											</button>
										);
									})}
								</div>
							</div>
						)}

						{/* Save button */}
						<div
							style={{
								padding: '16px',
								borderTop:
									'1px solid var(--color-semantic-dividers-dark)',
								flexShrink: 0,
							}}
						>
							{saveError && (
								<span
									style={{
										display: 'block',
										fontSize: '11px',
										color: 'var(--colors-core-red-500)',
										marginBottom: '8px',
									}}
								>
									{saveError}
								</span>
							)}
							{saveSuccess && (
								<span
									style={{
										display: 'block',
										fontSize: '11px',
										color: 'var(--colors-core-okaygreen-600)',
										marginBottom: '8px',
									}}
								>
									Saved successfully
								</span>
							)}
							<button
								onClick={handleSave}
								disabled={isSaving || !hasChanges}
								style={{
									width: '100%',
									fontSize: '13px',
									fontWeight: 600,
									color: '#fff',
									background: isSaving
										? 'var(--color-semantic-text-disabled)'
										: 'var(--color-semantic-surface-dark-black)',
									border: 'none',
									borderRadius: 'var(--radius-8)',
									padding: '10px 0',
									cursor:
										isSaving || !hasChanges
											? 'not-allowed'
											: 'pointer',
									opacity: !hasChanges && !isSaving ? 0.4 : 1,
									transition:
										'opacity 0.12s, background 0.12s',
								}}
							>
								{isSaving ? 'Saving…' : 'Save changes'}
							</button>
						</div>
					</div>

					{/* Campaign page content */}
					<div style={{ flex: 1, overflowY: 'auto' }}>
						{status === 'error' && (
							<div
								style={{
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									height: '256px',
								}}
							>
								<div
									style={{
										display: 'flex',
										flexDirection: 'column',
										alignItems: 'center',
										gap: '8px',
										textAlign: 'center',
									}}
								>
									<span
										style={{
											fontSize: '14px',
											fontWeight: 500,
											color: 'var(--color-semantic-text-grey-1)',
										}}
									>
										Failed to load preview
									</span>
									<span
										style={{
											fontSize: '12px',
											color: 'var(--color-semantic-text-disabled)',
										}}
									>
										Could not fetch campaign data from the
										API
									</span>
									<button
										onClick={onClose}
										style={{
											marginTop: '8px',
											fontSize: '12px',
											color: 'var(--color-semantic-text-grey-3)',
											textDecoration: 'underline',
											background: 'none',
											border: 'none',
											cursor: 'pointer',
										}}
									>
										Close
									</button>
								</div>
							</div>
						)}

						{status === 'ready' && mergedProps && (
							<CampaignCollectionPage
								{...mergedProps}
								isMobile={false}
								currencyList={[]}
								productCardLabels={PRODUCT_CARD_LABELS}
								editConfig={editConfig}
								onProductCardClick={(product: {
									urlSlug?: string;
								}) => {
									if (product?.urlSlug) {
										window.open(
											`https://www.headout.com${product.urlSlug}`,
											'_blank',
										);
									}
								}}
							/>
						)}
					</div>
				</div>
			</div>
		</div>,
		document.body,
	);
}
