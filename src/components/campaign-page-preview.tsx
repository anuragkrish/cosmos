'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import dynamic from 'next/dynamic';
import type { TCampaignCollectionPageProps } from '@headout/espeon/components/CampaignCollectionPage';
import { buildPreviewPropsFromCollection } from '@/lib/campaign-api';
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

type EditableField =
	| 'headerBanner.chipText'
	| 'headerBanner.title'
	| 'headerBanner.subtitle'
	| 'headerBanner.ctaText'
	| 'topOffers.title'
	| 'topRated.title'
	| 'discountBanners.0.preText'
	| 'discountBanners.0.discountLabel'
	| 'discountBanners.1.preText'
	| 'discountBanners.1.discountLabel';

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

					{/* Preview overlay on hover */}
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

function CampaignPagePreviewModal({ onClose }: CampaignPagePreviewModalProps) {
	const collectionData = useBoundStore(s => s.collectionData);
	const campaignData = useBoundStore(s => s.campaignData);

	const pageProps = useMemo(() => {
		if (!collectionData || !campaignData) return null;
		return buildPreviewPropsFromCollection(collectionData, campaignData);
	}, [collectionData, campaignData]);

	const status = pageProps ? 'ready' : 'error';

	const [editedValues, setEditedValues] = useState<EditedValues>({});
	const containerRef = useRef<HTMLDivElement>(null);
	const [cacheBust] = useState(() => Date.now());

	const hasChanges = Object.keys(editedValues).length > 0;
	const changesCount = Object.keys(editedValues).length;

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
		},
		[],
	);

	const mergedProps = pageProps
		? {
				...pageProps,
				headerBanner: {
					...pageProps.headerBanner,
					chipText:
						editedValues['headerBanner.chipText'] ??
						pageProps.headerBanner.chipText,
					title:
						editedValues['headerBanner.title'] ??
						pageProps.headerBanner.title,
					subtitle:
						editedValues['headerBanner.subtitle'] ??
						pageProps.headerBanner.subtitle,
					ctaText:
						editedValues['headerBanner.ctaText'] ??
						pageProps.headerBanner.ctaText,
					image: {
						...pageProps.headerBanner.image,
						imageUrl: `${pageProps.headerBanner.image.imageUrl}?_t=${cacheBust}`,
					},
				},
				topOffers: {
					...pageProps.topOffers,
					title:
						editedValues['topOffers.title'] ??
						pageProps.topOffers.title,
				},
				topRated: pageProps.topRated
					? {
							...pageProps.topRated,
							title:
								editedValues['topRated.title'] ??
								pageProps.topRated.title,
						}
					: undefined,
				discountBanners: pageProps.discountBanners?.map(
					(banner, i) => ({
						...banner,
						preText:
							editedValues[
								`discountBanners.${i}.preText` as EditableField
							] ?? banner.preText,
						discountLabel:
							editedValues[
								`discountBanners.${i}.discountLabel` as EditableField
							] ?? banner.discountLabel,
					}),
				),
			}
		: null;

	const editConfig: TCampaignCollectionPageProps['editConfig'] = {
		headerBanner: {
			chipText: {
				editable: true,
				onValueChange: onValueChange('headerBanner.chipText'),
			},
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
		topOffers: {
			title: {
				editable: true,
				onValueChange: onValueChange('topOffers.title'),
			},
		},
		topRated: {
			title: {
				editable: true,
				onValueChange: onValueChange('topRated.title'),
			},
		},
		discountBanners: [0, 1].map(i => ({
			preText: {
				editable: true,
				onValueChange: onValueChange(
					`discountBanners.${i}.preText` as EditableField,
				),
			},
			discountLabel: {
				editable: true,
				onValueChange: onValueChange(
					`discountBanners.${i}.discountLabel` as EditableField,
				),
			},
		})),
	};

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
				ref={containerRef}
				style={{
					position: 'relative',
					display: 'flex',
					flexDirection: 'column',
					background: 'var(--color-semantic-surface-light-white)',
					width: '100%',
					height: '100%',
					overflowY: 'auto',
				}}
				onClick={e => e.stopPropagation()}
			>
				{/* Top bar */}
				<div
					style={{
						position: 'sticky',
						top: 0,
						zIndex: 10,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						padding: '12px 20px',
						background: 'rgba(255,255,255,0.92)',
						backdropFilter: 'blur(8px)',
						borderBottom:
							'1px solid var(--color-semantic-surface-light-grey-3)',
						flexShrink: 0,
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
								· Double-click any text to edit
							</span>
						)}
					</div>
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: '8px',
						}}
					>
						{hasChanges && (
							<span
								style={{
									fontSize: '12px',
									fontWeight: 500,
									color: 'var(--color-semantic-text-grey-2)',
									background:
										'var(--color-semantic-surface-light-grey-2)',
									padding: '4px 10px',
									borderRadius: 'var(--radius-8)',
									border: '1px solid var(--color-semantic-dividers-dark)',
								}}
							>
								{changesCount} unsaved change
								{changesCount !== 1 ? 's' : ''}
							</span>
						)}
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
								transition: 'background 0.12s, color 0.12s',
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
				</div>

				{/* Content */}
				<div style={{ flex: 1 }}>
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
									Could not fetch campaign data from the API
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
						<div style={{ paddingTop: '56px' }}>
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
						</div>
					)}
				</div>

				{/* Save changes bottom banner */}
				<div
					style={{
						position: 'sticky',
						bottom: 0,
						left: 0,
						right: 0,
						zIndex: 10,
						transform: hasChanges
							? 'translateY(0)'
							: 'translateY(100%)',
						opacity: hasChanges ? 1 : 0,
						pointerEvents: hasChanges ? 'auto' : 'none',
						transition: 'transform 0.25s ease, opacity 0.25s ease',
					}}
				>
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'space-between',
							padding: '12px 20px',
							background:
								'var(--color-semantic-surface-dark-black)',
							color: '#fff',
							boxShadow: '0 -2px 12px rgba(0,0,0,0.18)',
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
									width: '6px',
									height: '6px',
									borderRadius: 'var(--radius-full)',
									background:
										'var(--colors-core-okaygreen-400)',
									animation:
										'pulse 1.5s ease-in-out infinite',
								}}
							/>
							<span style={{ fontSize: '14px', fontWeight: 500 }}>
								You have unsaved changes
							</span>
							<span
								style={{
									fontSize: '12px',
									color: 'var(--color-semantic-icon-grey-disabled-2)',
								}}
							>
								{changesCount} field
								{changesCount !== 1 ? 's' : ''} edited
							</span>
						</div>
						<div
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: '8px',
							}}
						>
							<button
								onClick={() => setEditedValues({})}
								style={{
									fontSize: '12px',
									color: 'var(--color-semantic-icon-grey-disabled-2)',
									background: 'transparent',
									border: 'none',
									cursor: 'pointer',
									padding: '6px 12px',
									transition: 'color 0.12s',
								}}
							>
								Discard
							</button>
							<button
								style={{
									fontSize: '12px',
									background:
										'var(--color-semantic-surface-light-white)',
									color: 'var(--color-semantic-surface-dark-black)',
									padding: '6px 16px',
									borderRadius: 'var(--radius-8)',
									fontWeight: 600,
									border: 'none',
									cursor: 'pointer',
									transition: 'opacity 0.12s',
								}}
								onClick={() => {
									console.log(
										'[campaign-preview] save changes:',
										editedValues,
									);
								}}
							>
								Save changes
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>,
		document.body,
	);
}
