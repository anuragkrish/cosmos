'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ComponentType } from 'react';
import { Player } from '@remotion/player';
import { TEMPLATES } from '../../../remotion/registry';
import { ensureFonts } from '../../../remotion/fonts';
import { ControlPanel } from './ControlPanel';
import { StudioHeader } from './studio-header';
import { useBoundStore } from '@/stores/store';
import { buildCampaignStoryProps } from '@/lib/campaign-api';
import { extractPalette } from '@/lib/extract-palette';

const STORIES_TEMPLATES = TEMPLATES.filter(t => t.category === 'stories');
const PREVIEW_BOX = { width: 360, height: 640 };

export function StoriesStudio() {
	const searchData = useBoundStore(s => s.searchData);
	const acceptedTgIds = useBoundStore(s => s.acceptedTgIds);

	const initialProps = useMemo(() => {
		if (searchData)
			return buildCampaignStoryProps(
				searchData,
				acceptedTgIds,
			) as unknown as Record<string, unknown>;
		return STORIES_TEMPLATES[0].defaultProps;
	}, [searchData, acceptedTgIds]);

	const [props, setProps] = useState<Record<string, unknown>>(initialProps);
	const [activeId, setActiveId] = useState(STORIES_TEMPLATES[0].id);
	const [downloading, setDownloading] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		ensureFonts();
	}, []);

	// Auto-derive card palette whenever the image changes.
	// The user can still manually override via the color pickers.
	useEffect(() => {
		const url = props.imageSrc as string;
		if (!url) return;
		let cancelled = false;
		extractPalette(url).then(palette => {
			if (cancelled) return;
			setProps(prev => ({
				...prev,
				cardBgColor: palette.cardBgColor,
				textColor: palette.textColor,
				outerBgColor: palette.outerBgColor,
			}));
		});
		return () => {
			cancelled = true;
		};
	}, [props.imageSrc]);

	const active = useMemo(
		() =>
			STORIES_TEMPLATES.find(t => t.id === activeId) ??
			STORIES_TEMPLATES[0],
		[activeId],
	);

	const scale = Math.min(
		PREVIEW_BOX.width / active.width,
		PREVIEW_BOX.height / active.height,
	);

	const setField = (key: string, value: unknown) =>
		setProps(prev => ({ ...prev, [key]: value }));

	const download = async (templateId: string) => {
		setError(null);
		setDownloading(templateId);
		try {
			const res = await fetch('/api/render', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ templateId, props }),
			});
			if (!res.ok) {
				const detail = await res.json().catch(() => ({}));
				throw new Error(
					detail.error ?? `Render failed (${res.status})`,
				);
			}
			const blob = await res.blob();
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `${templateId}.png`;
			document.body.appendChild(a);
			a.click();
			a.remove();
			URL.revokeObjectURL(url);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Download failed');
		} finally {
			setDownloading(null);
		}
	};

	return (
		<div className='flex min-h-screen flex-col bg-[var(--background)]'>
			<StudioHeader
				title='Campaign Stories — Asset Studio'
				action={
					<button
						onClick={() => download(active.id)}
						disabled={downloading !== null}
						className='rounded-[var(--radius-full)] bg-[var(--color-semantic-surface-dark-black)] px-4 py-2 text-[15px] font-medium text-[var(--color-semantic-surface-light-white)] border border-[var(--color-semantic-dividers-dark)] transition-colors hover:bg-[var(--color-semantic-text-grey-1)] disabled:opacity-50 cursor-pointer'
					>
						{downloading === active.id
							? 'Rendering…'
							: `Download ${active.name}`}
					</button>
				}
			/>

			<div className='flex flex-1 flex-col gap-6 p-6 lg:flex-row'>
				{/* Editor */}
				<aside className='w-full shrink-0 lg:w-80'>
					<div className='rounded-xl border border-[var(--color-semantic-dividers-dark)] bg-[var(--color-semantic-surface-light-white)] p-5'>
						<ControlPanel
							fields={active.fields}
							values={props}
							onChange={setField}
						/>
					</div>
				</aside>

				{/* Preview */}
				<main className='flex flex-1 flex-col items-center gap-5'>
					{STORIES_TEMPLATES.length > 1 && (
						<div className='flex items-center gap-2'>
							{STORIES_TEMPLATES.map(t => (
								<button
									key={t.id}
									onClick={() => setActiveId(t.id)}
									className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors ${
										t.id === activeId
											? 'bg-[var(--color-semantic-surface-dark-black)] text-[var(--color-semantic-surface-light-white)] border-[var(--color-semantic-surface-dark-black)]'
											: 'bg-[var(--color-semantic-surface-light-white)] text-[var(--color-semantic-surface-dark-black)] border-[var(--color-semantic-dividers-dark)] hover:border-[var(--color-semantic-text-disabled)]'
									}`}
								>
									{t.formatLabel}
								</button>
							))}
						</div>
					)}

					<div
						className='flex items-center justify-center bg-[var(--color-semantic-surface-light-grey-2)] rounded-[var(--radius-16)]'
						style={{
							width: PREVIEW_BOX.width + 48,
							height: PREVIEW_BOX.height + 48,
						}}
					>
						<div
							className='overflow-hidden rounded-lg shadow-lg'
							style={{
								width: active.width * scale,
								height: active.height * scale,
							}}
						>
							<Player
								key={active.id}
								component={active.component as ComponentType}
								inputProps={props}
								durationInFrames={1}
								fps={30}
								compositionWidth={active.width}
								compositionHeight={active.height}
								style={{ width: '100%', height: '100%' }}
								controls={false}
								showVolumeControls={false}
								clickToPlay={false}
								doubleClickToFullscreen={false}
							/>
						</div>
					</div>

					<div className='flex items-center gap-3'>
						<button
							onClick={() => download(active.id)}
							disabled={downloading !== null}
							className='rounded-lg border border-[var(--color-semantic-dividers-dark)] bg-[var(--color-semantic-surface-light-white)] px-4 py-2 text-sm font-medium text-[var(--color-semantic-text-grey-3)] transition-colors hover:border-[var(--color-semantic-text-disabled)] disabled:opacity-50 shadow-sm'
						>
							{downloading === active.id
								? 'Rendering…'
								: `Download ${active.formatLabel}`}
						</button>
						<span className='text-[12px] font-light text-[var(--color-semantic-text-disabled)]'>
							Exports at full {active.width}×{active.height}
						</span>
					</div>

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
