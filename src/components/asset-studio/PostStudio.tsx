'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ComponentType } from 'react';
import { Player } from '@remotion/player';
import { TEMPLATES } from '../../../remotion/registry';
import { ensureFonts } from '../../../remotion/fonts';
import { ControlPanel } from './ControlPanel';
import { SlideListEditor } from './SlideListEditor';
import { StudioHeader } from './studio-header';
import { useBoundStore } from '@/stores/store';
import { buildDestinationsProps } from '@/lib/campaign-api';

const POST_TEMPLATES = TEMPLATES.filter(t => t.category === 'posts');

// Scale 1080×1350 to a comfortable preview size.
const PREVIEW_W = 405; // 1080 × 0.375

export function PostStudio() {
	const searchData = useBoundStore(s => s.searchData);
	const acceptedTgIds = useBoundStore(s => s.acceptedTgIds);

	// The destinations template (index 1) gets seeded from campaign data;
	// the guide template (index 0) uses its own defaults.
	const destinationsInitialProps = useMemo(() => {
		if (searchData)
			return buildDestinationsProps(searchData, acceptedTgIds) as Record<
				string,
				unknown
			>;
		return (
			POST_TEMPLATES.find(t => t.id === 'post-destinations')
				?.defaultProps ?? POST_TEMPLATES[0].defaultProps
		);
	}, [searchData, acceptedTgIds]);

	const getInitialProps = (id: string) => {
		if (id === 'post-destinations') return destinationsInitialProps;
		return (
			POST_TEMPLATES.find(t => t.id === id)?.defaultProps ??
			POST_TEMPLATES[0].defaultProps
		);
	};

	const [templateId, setTemplateId] = useState(POST_TEMPLATES[0].id);
	const [props, setProps] = useState<Record<string, unknown>>(
		getInitialProps(POST_TEMPLATES[0].id),
	);
	const [activeSlideIndex, setActiveSlideIndex] = useState(0);
	const [downloading, setDownloading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		ensureFonts();
	}, []);

	const template = useMemo(
		() => TEMPLATES.find(t => t.id === templateId)!,
		[templateId],
	);

	const handleTemplateChange = (id: string) => {
		const tpl = TEMPLATES.find(t => t.id === id);
		if (!tpl) return;
		setTemplateId(id);
		setProps(getInitialProps(id));
		setActiveSlideIndex(0);
	};

	const slides = useMemo(
		() => (props.slides ?? []) as Record<string, unknown>[],
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[props.slides],
	);

	const currentSlide = slides[activeSlideIndex] ?? {};
	const slideTypeConfig = template.slideTypes?.find(
		st => st.type === (currentSlide.type as string),
	);
	const slideFields = slideTypeConfig?.fields ?? [];

	const scale = PREVIEW_W / template.width;
	const previewH = Math.round(template.height * scale);

	const previewProps = useMemo(
		() => ({ ...props, slideIndex: activeSlideIndex }),
		[props, activeSlideIndex],
	);

	const onSlideFieldChange = (key: string, value: unknown) => {
		setProps(prev => {
			const slidesCopy = [
				...((prev.slides ?? []) as Record<string, unknown>[]),
			];
			slidesCopy[activeSlideIndex] = {
				...slidesCopy[activeSlideIndex],
				[key]: value,
			};
			return { ...prev, slides: slidesCopy };
		});
	};

	const handleSlidesChange = (newSlides: Record<string, unknown>[]) => {
		setProps(prev => ({ ...prev, slides: newSlides }));
	};

	const downloadZip = async () => {
		setError(null);
		setDownloading(true);
		try {
			const res = await fetch('/api/render-carousel', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ templateId, props }),
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
			a.download = `${templateId}.zip`;
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

	return (
		<div className='flex min-h-screen flex-col bg-[var(--background)]'>
			<StudioHeader
				title='Campaign Posts — Asset Studio'
				action={
					<button
						onClick={downloadZip}
						disabled={downloading}
						className='rounded-[var(--radius-full)] bg-[var(--color-semantic-surface-dark-black)] px-4 py-2 text-[15px] font-medium text-[var(--color-semantic-surface-light-white)] border border-[var(--color-semantic-dividers-dark)] transition-colors hover:bg-[var(--color-semantic-text-grey-1)] disabled:opacity-50 cursor-pointer'
					>
						{downloading
							? 'Rendering…'
							: `Download all (${slides.length} slides)`}
					</button>
				}
			/>

			{/* Main layout */}
			<div className='flex flex-1 flex-col gap-6 p-6 lg:flex-row'>
				{/* ── Left sidebar ─────────────────────────────────────────────── */}
				<aside className='w-full shrink-0 lg:w-80'>
					<div className='flex flex-col gap-4'>
						{/* Template picker */}
						<div className='rounded-xl border border-[var(--color-semantic-dividers-dark)] bg-[var(--color-semantic-surface-light-white)] p-4'>
							<h2 className='mb-3 text-[11px] font-semibold uppercase tracking-[0.8px] text-[var(--color-semantic-text-disabled)]'>
								Template
							</h2>
							<div className='flex flex-wrap gap-2'>
								{POST_TEMPLATES.map(t => (
									<button
										key={t.id}
										onClick={() =>
											handleTemplateChange(t.id)
										}
										className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors ${
											t.id === templateId
												? 'bg-[var(--color-semantic-surface-dark-black)] text-[var(--color-semantic-surface-light-white)] border-[var(--color-semantic-surface-dark-black)]'
												: 'bg-[var(--color-semantic-surface-light-white)] text-[var(--color-semantic-text-grey-3)] border-[var(--color-semantic-dividers-dark)] hover:border-[var(--color-semantic-text-disabled)]'
										}`}
									>
										{t.name}
									</button>
								))}
							</div>
						</div>

						{/* Slide list */}
						<div className='rounded-xl border border-[var(--color-semantic-dividers-dark)] bg-[var(--color-semantic-surface-light-white)] p-4'>
							<h2 className='mb-3 text-[11px] font-semibold uppercase tracking-[0.8px] text-[var(--color-semantic-text-disabled)]'>
								Slides
							</h2>
							<SlideListEditor
								slides={slides}
								activeIndex={activeSlideIndex}
								slideTypes={template.slideTypes ?? []}
								onSelect={setActiveSlideIndex}
								onChange={handleSlidesChange}
							/>
						</div>

						{/* Current slide fields */}
						{slideFields.length > 0 ? (
							<div className='rounded-xl border border-[var(--color-semantic-dividers-dark)] bg-[var(--color-semantic-surface-light-white)] p-4'>
								<h2 className='mb-3 text-[11px] font-semibold uppercase tracking-[0.8px] text-[var(--color-semantic-text-disabled)]'>
									Slide {activeSlideIndex + 1}
									{slideTypeConfig ? (
										<span className='ml-1.5 font-normal normal-case text-[var(--color-semantic-icon-grey-disabled-2)]'>
											— {slideTypeConfig.name}
										</span>
									) : null}
								</h2>
								<ControlPanel
									fields={slideFields}
									values={currentSlide}
									onChange={onSlideFieldChange}
								/>
							</div>
						) : null}
					</div>
				</aside>

				{/* ── Preview ──────────────────────────────────────────────────── */}
				<main className='flex flex-1 flex-col items-center gap-5'>
					{/* Canvas */}
					<div
						className='flex items-center justify-center bg-[var(--color-semantic-surface-light-grey-2)] rounded-[var(--radius-16)]'
						style={{
							width: PREVIEW_W + 48,
							height: previewH + 48,
						}}
					>
						<div
							className='overflow-hidden rounded-lg shadow-lg'
							style={{ width: PREVIEW_W, height: previewH }}
						>
							<Player
								key={template.id}
								component={template.component as ComponentType}
								inputProps={previewProps}
								durationInFrames={1}
								fps={30}
								compositionWidth={template.width}
								compositionHeight={template.height}
								style={{ width: '100%', height: '100%' }}
								controls={false}
								showVolumeControls={false}
								clickToPlay={false}
								doubleClickToFullscreen={false}
							/>
						</div>
					</div>

					{/* Slide navigation */}
					<div className='flex items-center gap-4'>
						<button
							onClick={() =>
								setActiveSlideIndex(i => Math.max(0, i - 1))
							}
							disabled={activeSlideIndex === 0}
							className='rounded-lg border border-[var(--color-semantic-dividers-dark)] bg-[var(--color-semantic-surface-light-white)] px-3 py-1.5 text-xs font-medium text-[var(--color-semantic-text-grey-3)] hover:border-[var(--color-semantic-text-disabled)] disabled:opacity-40'
						>
							← Prev
						</button>
						<span className='text-xs text-[var(--color-semantic-text-disabled)]'>
							{activeSlideIndex + 1} / {slides.length}
						</span>
						<button
							onClick={() =>
								setActiveSlideIndex(i =>
									Math.min(slides.length - 1, i + 1),
								)
							}
							disabled={activeSlideIndex === slides.length - 1}
							className='rounded-lg border border-[var(--color-semantic-dividers-dark)] bg-[var(--color-semantic-surface-light-white)] px-3 py-1.5 text-xs font-medium text-[var(--color-semantic-text-grey-3)] hover:border-[var(--color-semantic-text-disabled)] disabled:opacity-40'
						>
							Next →
						</button>
					</div>

					<span className='text-[12px] font-light text-[var(--color-semantic-text-disabled)]'>
						Preview at {Math.round(scale * 100)}% · Exports at full{' '}
						{template.width}×{template.height}
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
