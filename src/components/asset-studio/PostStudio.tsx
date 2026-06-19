'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ComponentType } from 'react';
import { Player } from '@remotion/player';
import { TEMPLATES } from '../../../remotion/registry';
import { GUIDE_SLIDE_TYPES } from '../../../remotion/templates/guide/schema';
import { DEST_SLIDE_TYPES } from '../../../remotion/templates/destinations/schema';
import { ensureFonts } from '../../../remotion/fonts';
import { ControlPanel } from './ControlPanel';
import { StudioHeader } from './studio-header';
import { useBoundStore } from '@/stores/store';
import type { FieldControl } from '../../../remotion/types';
import type { RecommendPostTemplateResponse } from '@/pages/api/recommend-post-template';

// ─────────────────────────────────────────────────────────────────────────────
// Types & card catalogue
// ─────────────────────────────────────────────────────────────────────────────

interface PostSlideCard {
	id: string;
	templateId: string;
	slideType: string;
	slideTypeName: string;
	templateName: string;
	defaultSlide: Record<string, unknown>;
	fields: FieldControl[];
	description: string;
	charLimits: Record<string, number>;
}

const POST_SLIDE_CARDS: PostSlideCard[] = [
	{
		id: 'dest-cover',
		templateId: 'post-destinations',
		slideType: 'cover',
		slideTypeName: 'Cover',
		templateName: 'Destinations',
		defaultSlide: DEST_SLIDE_TYPES.find(
			s => s.type === 'cover',
		)!.makeDefault() as Record<string, unknown>,
		fields: DEST_SLIDE_TYPES.find(s => s.type === 'cover')!.fields,
		description:
			'Full-bleed cover card for a destinations campaign — great for announcing a city list or travel theme',
		charLimits: { coverLabel: 35, title: 20 },
	},
	{
		id: 'dest-city',
		templateId: 'post-destinations',
		slideType: 'city',
		slideTypeName: 'City Card',
		templateName: 'Destinations',
		defaultSlide: DEST_SLIDE_TYPES.find(
			s => s.type === 'city',
		)!.makeDefault() as Record<string, unknown>,
		fields: DEST_SLIDE_TYPES.find(s => s.type === 'city')!.fields,
		description:
			'City spotlight — ideal for highlighting a single destination, attraction, or experience',
		charLimits: { cityName: 20, description: 120, tipText: 80 },
	},
	{
		id: 'guide-cover',
		templateId: 'post-guide',
		slideType: 'cover',
		slideTypeName: 'Guide Cover',
		templateName: 'Guide',
		defaultSlide: GUIDE_SLIDE_TYPES.find(
			s => s.type === 'cover',
		)!.makeDefault() as Record<string, unknown>,
		fields: GUIDE_SLIDE_TYPES.find(s => s.type === 'cover')!.fields,
		description:
			'"What to expect" guide intro — perfect for attraction or event preview content',
		charLimits: { labelLine1: 30, labelLine2: 30, title: 20 },
	},
	{
		id: 'guide-feature',
		templateId: 'post-guide',
		slideType: 'feature',
		slideTypeName: 'Feature',
		templateName: 'Guide',
		defaultSlide: GUIDE_SLIDE_TYPES.find(
			s => s.type === 'feature',
		)!.makeDefault() as Record<string, unknown>,
		fields: GUIDE_SLIDE_TYPES.find(s => s.type === 'feature')!.fields,
		description:
			'Highlight a single attraction or feature with a bold gradient heading and body copy',
		charLimits: {
			headingBefore: 20,
			headingAccent: 20,
			headingAfter: 20,
			body: 120,
		},
	},
	{
		id: 'guide-imageList',
		templateId: 'post-guide',
		slideType: 'imageList',
		slideTypeName: 'Image List',
		templateName: 'Guide',
		defaultSlide: GUIDE_SLIDE_TYPES.find(
			s => s.type === 'imageList',
		)!.makeDefault() as Record<string, unknown>,
		fields: GUIDE_SLIDE_TYPES.find(s => s.type === 'imageList')!.fields,
		description:
			'Showcase a list of characters, activities, or items with images and labels',
		charLimits: {
			headingBefore: 20,
			headingAccent: 25,
			headingAfter: 20,
			subtext: 55,
		},
	},
	{
		id: 'guide-featureList',
		templateId: 'post-guide',
		slideType: 'featureList',
		slideTypeName: 'Feature List',
		templateName: 'Guide',
		defaultSlide: GUIDE_SLIDE_TYPES.find(
			s => s.type === 'featureList',
		)!.makeDefault() as Record<string, unknown>,
		fields: GUIDE_SLIDE_TYPES.find(s => s.type === 'featureList')!.fields,
		description:
			'Dining, shopping, or product comparison — side-by-side list of offerings',
		charLimits: { headingBefore: 20, headingAccent: 25, headingAfter: 20 },
	},
	{
		id: 'guide-closing',
		templateId: 'post-guide',
		slideType: 'closing',
		slideTypeName: 'Closing',
		templateName: 'Guide',
		defaultSlide: GUIDE_SLIDE_TYPES.find(
			s => s.type === 'closing',
		)!.makeDefault() as Record<string, unknown>,
		fields: GUIDE_SLIDE_TYPES.find(s => s.type === 'closing')!.fields,
		description:
			'"Know before you go" closing card with info pills — great for practical logistics',
		charLimits: { heading: 30 },
	},
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildCampaignSummary(searchData: any, query: string): string {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const products = (searchData?.tourGroups ?? []).slice(0, 5) as any[];
	const location = (searchData?.location?.cityName as string) ?? '';
	const productNames = products
		.map((p: { displayName: string }) => p.displayName)
		.join(', ');
	return `Campaign: "${query}". Location: ${location || 'N/A'}. Top products: ${productNames || 'N/A'}.`;
}

const EDITOR_PREVIEW_W = 405;

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function PostStudio() {
	const searchData = useBoundStore(s => s.searchData);
	const query = useBoundStore(s => s.query);

	const [view, setView] = useState<'grid' | 'editor'>('grid');
	const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
	const [cardSlides, setCardSlides] = useState<
		Record<string, Record<string, unknown>>
	>(() =>
		Object.fromEntries(
			POST_SLIDE_CARDS.map(c => [c.id, { ...c.defaultSlide }]),
		),
	);
	const [aiRecommended, setAiRecommended] = useState<string[]>([]);
	const [aiReasons, setAiReasons] = useState<Record<string, string>>({});
	const [aiLoading, setAiLoading] = useState(false);
	const [downloading, setDownloading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		ensureFonts();
	}, []);

	// AI recommendation — runs once when campaign data is available
	useEffect(() => {
		if (!searchData || !query) return;
		setAiLoading(true);

		fetch('/api/recommend-post-template', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				query,
				campaignSummary: buildCampaignSummary(searchData, query),
				cards: POST_SLIDE_CARDS.map(c => ({
					id: c.id,
					templateName: c.templateName,
					slideTypeName: c.slideTypeName,
					description: c.description,
					defaultSlide: c.defaultSlide,
					charLimits: c.charLimits,
				})),
			}),
		})
			.then(r =>
				r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)),
			)
			.then((data: RecommendPostTemplateResponse) => {
				const recs = data.recommendations ?? [];
				setAiRecommended(recs.map(r => r.cardId));
				setAiReasons(
					Object.fromEntries(recs.map(r => [r.cardId, r.reason])),
				);
				const updates: Record<string, Record<string, unknown>> = {};
				for (const rec of recs) {
					if (
						rec.generatedSlide &&
						Object.keys(rec.generatedSlide).length > 0
					) {
						const card = POST_SLIDE_CARDS.find(
							c => c.id === rec.cardId,
						);
						updates[rec.cardId] = {
							...card?.defaultSlide,
							...rec.generatedSlide,
						};
					}
				}
				if (Object.keys(updates).length > 0) {
					setCardSlides(prev => ({ ...prev, ...updates }));
				}
			})
			.catch(() => {})
			.finally(() => setAiLoading(false));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const selectedCard = useMemo(
		() => POST_SLIDE_CARDS.find(c => c.id === selectedCardId),
		[selectedCardId],
	);

	const selectedTemplate = useMemo(
		() =>
			selectedCard
				? TEMPLATES.find(t => t.id === selectedCard.templateId)
				: null,
		[selectedCard],
	);

	const handleCardClick = (cardId: string) => {
		setSelectedCardId(cardId);
		setView('editor');
		setError(null);
	};

	const handleBackToGrid = () => {
		setView('grid');
		setError(null);
	};

	const onFieldChange = (key: string, value: unknown) => {
		if (!selectedCardId) return;
		setCardSlides(prev => ({
			...prev,
			[selectedCardId]: { ...prev[selectedCardId], [key]: value },
		}));
	};

	const downloadPng = async () => {
		if (!selectedCard) return;
		setError(null);
		setDownloading(true);
		try {
			const slideData =
				cardSlides[selectedCard.id] ?? selectedCard.defaultSlide;
			const res = await fetch('/api/render', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					templateId: selectedCard.templateId,
					props: { slides: [slideData], slideIndex: 0 },
				}),
			});
			if (!res.ok) {
				const detail = await res.json().catch(() => ({}));
				throw new Error(
					(detail as { error?: string }).error ??
						`Render failed (${res.status})`,
				);
			}
			const blob = await res.blob();
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `${selectedCard.id}.png`;
			document.body.appendChild(a);
			a.click();
			a.remove();
			URL.revokeObjectURL(url);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Download failed');
		} finally {
			setDownloading(false);
		}
	};

	// ─── Grid view ─────────────────────────────────────────────────────────────

	if (view === 'grid') {
		return (
			<div className='flex min-h-screen flex-col bg-[var(--background)]'>
				<StudioHeader title='Campaign Posts' />

				<div className='flex flex-1 flex-col px-8 py-6 gap-6'>
					{/* Section header */}
					<div className='flex items-center justify-between'>
						<div>
							<h2
								className='text-[22px] font-semibold text-[var(--color-semantic-text-grey-1)]'
								style={{ fontFamily: 'var(--font-hd)' }}
							>
								Choose a template
							</h2>
							<p className='mt-1 text-[13px] text-[var(--color-semantic-text-grey-3)]'>
								Each template is a single-image Instagram post
							</p>
						</div>

						{/* AI status pill */}
						{aiLoading && (
							<div className='flex items-center gap-2 rounded-full border border-[var(--color-semantic-dividers-dark)] bg-[var(--color-semantic-surface-light-grey-2)] px-4 py-2'>
								<span className='text-[12px] text-[var(--color-semantic-text-grey-3)]'>
									AI is choosing templates…
								</span>
								<span
									className='inline-block h-3 w-3 rounded-full border-2 border-t-transparent border-[var(--color-semantic-text-grey-3)]'
									style={{
										animation: 'spin 0.8s linear infinite',
									}}
								/>
							</div>
						)}
						{!aiLoading && aiRecommended.length > 0 && (
							<div className='flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2'>
								<span className='text-[13px]'>✨</span>
								<span className='text-[12px] font-medium text-amber-700'>
									AI picked {aiRecommended.length} template
									{aiRecommended.length > 1 ? 's' : ''} for
									your campaign
								</span>
							</div>
						)}
					</div>

					{/* Template grid */}
					<div className='grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4'>
						{POST_SLIDE_CARDS.map(card => {
							const template = TEMPLATES.find(
								t => t.id === card.templateId,
							);
							if (!template) return null;

							const isRecommended = aiRecommended.includes(
								card.id,
							);
							const slideData =
								cardSlides[card.id] ?? card.defaultSlide;
							const previewProps = {
								slides: [slideData],
								slideIndex: 0,
							};

							return (
								<button
									key={card.id}
									onClick={() => handleCardClick(card.id)}
									className={`group relative flex flex-col rounded-2xl border-2 bg-[var(--color-semantic-surface-light-white)] text-left transition-all duration-200 hover:shadow-lg ${
										isRecommended
											? 'border-amber-400 shadow-md shadow-amber-100'
											: 'border-[var(--color-semantic-dividers-dark)] hover:border-[var(--color-semantic-text-disabled)]'
									}`}
								>
									{/* AI pick badge */}
									{isRecommended && (
										<div className='absolute -top-3 left-4 z-10 flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm'>
											<span>✨</span>
											<span>AI Pick</span>
										</div>
									)}

									{/* Remotion preview */}
									<div
										className='w-full overflow-hidden rounded-t-[14px] bg-[var(--color-semantic-surface-light-grey-2)]'
										style={{
											aspectRatio: `${template.width}/${template.height}`,
										}}
									>
										<Player
											key={card.id}
											component={
												template.component as ComponentType
											}
											inputProps={previewProps}
											durationInFrames={1}
											fps={30}
											compositionWidth={template.width}
											compositionHeight={template.height}
											style={{
												width: '100%',
												height: '100%',
											}}
											controls={false}
											showVolumeControls={false}
											clickToPlay={false}
											doubleClickToFullscreen={false}
										/>
									</div>

									{/* Card info */}
									<div className='px-4 py-3'>
										<p className='text-[11px] font-medium uppercase tracking-[0.6px] text-[var(--color-semantic-text-disabled)]'>
											{card.templateName}
										</p>
										<p className='mt-0.5 text-[14px] font-semibold text-[var(--color-semantic-text-grey-1)]'>
											{card.slideTypeName}
										</p>
										{isRecommended &&
											aiReasons[card.id] && (
												<p className='mt-1.5 text-[11px] leading-snug text-amber-600'>
													{aiReasons[card.id]}
												</p>
											)}
									</div>
								</button>
							);
						})}
					</div>
				</div>

				<style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
			</div>
		);
	}

	// ─── Editor view ───────────────────────────────────────────────────────────

	if (!selectedCard || !selectedTemplate) return null;

	const slideData = cardSlides[selectedCard.id] ?? selectedCard.defaultSlide;
	const previewProps = { slides: [slideData], slideIndex: 0 };
	const scale = EDITOR_PREVIEW_W / selectedTemplate.width;
	const previewH = Math.round(selectedTemplate.height * scale);

	return (
		<div className='flex min-h-screen flex-col bg-[var(--background)]'>
			<StudioHeader
				title={`${selectedCard.templateName} — ${selectedCard.slideTypeName}`}
				onBack={handleBackToGrid}
				backLabel='Templates'
				action={
					<button
						onClick={downloadPng}
						disabled={downloading}
						className='rounded-[var(--radius-full)] bg-[var(--color-semantic-surface-dark-black)] px-4 py-2 text-[15px] font-medium text-[var(--color-semantic-surface-light-white)] border border-[var(--color-semantic-dividers-dark)] transition-colors hover:bg-[var(--color-semantic-text-grey-1)] disabled:opacity-50 cursor-pointer'
					>
						{downloading ? 'Rendering…' : 'Download PNG'}
					</button>
				}
			/>

			<div className='flex flex-1 flex-col gap-6 p-6 lg:flex-row'>
				{/* ── Sidebar ──────────────────────────────────────────────── */}
				<aside className='w-full shrink-0 lg:w-80'>
					<div className='rounded-xl border border-[var(--color-semantic-dividers-dark)] bg-[var(--color-semantic-surface-light-white)] p-4'>
						<h2 className='mb-3 text-[11px] font-semibold uppercase tracking-[0.8px] text-[var(--color-semantic-text-disabled)]'>
							Edit content
						</h2>
						<ControlPanel
							fields={selectedCard.fields}
							values={slideData}
							onChange={onFieldChange}
						/>
					</div>
				</aside>

				{/* ── Preview ──────────────────────────────────────────────── */}
				<main className='flex flex-1 flex-col items-center gap-5'>
					<div
						className='flex items-center justify-center rounded-[var(--radius-16)] bg-[var(--color-semantic-surface-light-grey-2)]'
						style={{
							width: EDITOR_PREVIEW_W + 48,
							height: previewH + 48,
						}}
					>
						<div
							className='overflow-hidden rounded-lg shadow-lg'
							style={{
								width: EDITOR_PREVIEW_W,
								height: previewH,
							}}
						>
							<Player
								key={selectedCard.id}
								component={
									selectedTemplate.component as ComponentType
								}
								inputProps={previewProps}
								durationInFrames={1}
								fps={30}
								compositionWidth={selectedTemplate.width}
								compositionHeight={selectedTemplate.height}
								style={{ width: '100%', height: '100%' }}
								controls={false}
								showVolumeControls={false}
								clickToPlay={false}
								doubleClickToFullscreen={false}
							/>
						</div>
					</div>

					<span className='text-[12px] font-light text-[var(--color-semantic-text-disabled)]'>
						Preview at {Math.round(scale * 100)}% · Exports at full{' '}
						{selectedTemplate.width}×{selectedTemplate.height}
					</span>

					{error ? (
						<p className='max-w-md text-center text-xs text-red-500'>
							{error}
						</p>
					) : null}
				</main>
			</div>
		</div>
	);
}
