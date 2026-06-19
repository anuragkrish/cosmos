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
	getCollectionContent,
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
	prompt: _prompt,
}: CampaignPagePreviewCardProps) {
	const [open, setOpen] = useState(false);
	const [hovered, setHovered] = useState(false);

	return (
		<>
			<button
				onClick={() => setOpen(true)}
				onMouseEnter={() => setHovered(true)}
				onMouseLeave={() => setHovered(false)}
				style={{
					position: 'relative',
					borderRadius: '24px',
					overflow: 'hidden',
					cursor: 'pointer',
					height: '430px',
					display: 'block',
					width: '100%',
					border: 'none',
					padding: 0,
					background:
						'linear-gradient(135deg, #0d1117 0%, #1a1f35 50%, #0f1923 100%)',
					transform: hovered ? 'translateY(-2px)' : 'none',
					transition: 'transform 0.15s',
				}}
			>
				{/* Icon */}
				<div
					style={{
						position: 'absolute',
						inset: 0,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						opacity: hovered ? 0.5 : 0.35,
						transition: 'opacity 0.15s',
					}}
				>
					<svg width='64' height='50' viewBox='0 0 64 50' fill='none'>
						<rect
							x='1'
							y='1'
							width='62'
							height='48'
							rx='5'
							stroke='white'
							strokeWidth='2'
							opacity='0.6'
						/>
						<path
							d='M1 10h62'
							stroke='white'
							strokeWidth='2'
							opacity='0.4'
						/>
						<circle
							cx='8'
							cy='5.5'
							r='2'
							fill='white'
							opacity='0.5'
						/>
						<circle
							cx='15'
							cy='5.5'
							r='2'
							fill='white'
							opacity='0.5'
						/>
						<circle
							cx='22'
							cy='5.5'
							r='2'
							fill='white'
							opacity='0.5'
						/>
						<rect
							x='6'
							y='16'
							width='52'
							height='8'
							rx='2'
							fill='white'
							opacity='0.2'
						/>
						<rect
							x='6'
							y='28'
							width='24'
							height='14'
							rx='2'
							fill='white'
							opacity='0.15'
						/>
						<rect
							x='34'
							y='28'
							width='24'
							height='6'
							rx='2'
							fill='white'
							opacity='0.1'
						/>
						<rect
							x='34'
							y='36'
							width='15'
							height='6'
							rx='2'
							fill='white'
							opacity='0.1'
						/>
					</svg>
				</div>

				{/* Gradient overlay */}
				<div
					style={{
						position: 'absolute',
						inset: 0,
						background:
							'linear-gradient(to top, rgba(12,8,5,0.92) 0%, rgba(12,8,5,0.55) 34%, rgba(12,8,5,0.05) 60%, rgba(12,8,5,0) 100%)',
					}}
				/>

				{/* Badge */}
				<span
					style={{
						position: 'absolute',
						top: '18px',
						left: '18px',
						zIndex: 2,
						fontSize: '11px',
						fontWeight: 600,
						letterSpacing: '0.6px',
						textTransform: 'uppercase',
						color: '#fff',
						background: 'rgba(255,255,255,0.12)',
						backdropFilter: 'blur(6px)',
						border: '1px solid rgba(255,255,255,0.2)',
						borderRadius: '9999px',
						padding: '5px 12px',
					}}
				>
					04
				</span>

				{/* Hover CTA */}
				<div
					style={{
						position: 'absolute',
						top: '18px',
						right: '18px',
						zIndex: 2,
						opacity: hovered ? 1 : 0,
						transition: 'opacity 0.15s',
						fontSize: '12px',
						background: 'rgba(255,255,255,0.15)',
						color: '#fff',
						padding: '5px 12px',
						borderRadius: '9999px',
						fontWeight: 500,
						backdropFilter: 'blur(6px)',
						border: '1px solid rgba(255,255,255,0.2)',
					}}
				>
					Preview →
				</div>

				{/* Title + description */}
				<div
					style={{
						position: 'absolute',
						left: '24px',
						right: '24px',
						bottom: '24px',
						zIndex: 2,
						textAlign: 'left',
					}}
				>
					<p
						style={{
							fontFamily: 'var(--font-hd)',
							fontWeight: 600,
							fontSize: '25px',
							color: '#fff',
							margin: 0,
						}}
					>
						Campaign Page
					</p>
					<p
						style={{
							fontSize: '14px',
							fontWeight: 300,
							lineHeight: 1.5,
							color: 'rgba(255,255,255,0.75)',
							marginTop: '6px',
							marginBottom: 0,
						}}
					>
						Live preview of the collection page your audience will
						see.
					</p>
				</div>
			</button>

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
	const storedQuery = useBoundStore(s => s.query);
	const setCampaignContext = useBoundStore(s => s.setCampaignContext);

	const bannerImages: string[] = useMemo(() => {
		const raw = searchData?.banner?.images;
		if (!Array.isArray(raw)) return [];
		return [...new Set(raw.filter(Boolean))];
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
					if (!collectionData.content) return searchData.banner;
					const parsed = JSON.parse(collectionData.content as string);
					return parsed?.banner ?? parsed;
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

			// Refetch collection data to reflect the saved changes in the store
			const collectionId =
				collectionData.collectionId ?? collectionData.id;
			if (collectionId && searchData && campaignData) {
				const freshCollection =
					await getCollectionContent(collectionId);
				setCampaignContext(
					storedQuery,
					searchData,
					acceptedTgIds,
					freshCollection,
					campaignData,
				);
			}

			setSaveSuccess(true);
			setEditedValues({});
		} catch (e) {
			setSaveError(e instanceof Error ? e.message : 'Save failed');
		} finally {
			setIsSaving(false);
		}
	}, [
		storedQuery,
		searchData,
		collectionData,
		campaignData,
		acceptedTgIds,
		editedValues,
		selectedImageUrl,
		bannerImages,
		lang,
		setCampaignContext,
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
											`https://poc-shv.deimos.dev-headout.com${product.urlSlug}`,
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
