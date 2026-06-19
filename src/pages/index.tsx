import { useState, useCallback, useRef, KeyboardEvent } from 'react';
import { ProductTable } from '@/components/product-table';
import { CampaignEntryCards } from '@/components/campaign-entry-cards';
import { AppHeader } from '@/components/app-header';
import {
	fetchCampaignContent,
	createCollectionContent,
	getCollectionContent,
	getCampaignData,
	buildCollectionPayload,
	type SearchContentApiResponse,
} from '@/lib/campaign-api';
import { useBoundStore } from '@/stores/store';

const SUGGESTIONS = [
	'July 4th campaign for New York',
	'Disneyland Paris tickets',
	'Burj Khalifa At The Top',
	'Summer in Barcelona',
];

type Screen = 'chat' | 'results';

// ─── Thinking animation dots ──────────────────────────────────────────────────
function ThinkingDots() {
	return (
		<span
			className='inline-flex items-end gap-[3px]'
			style={{ height: 16 }}
			aria-hidden
		>
			{[0, 1, 2].map(i => (
				<span
					key={i}
					style={{
						width: 5,
						height: 5,
						borderRadius: '50%',
						background: 'var(--color-semantic-text-grey-3)',
						display: 'inline-block',
						animation: `thinkingBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
					}}
				/>
			))}
		</span>
	);
}

export default function Home() {
	const setCampaignContext = useBoundStore(s => s.setCampaignContext);
	const clearCampaign = useBoundStore(s => s.clearCampaign);
	const storedQuery = useBoundStore(s => s.query);
	const storedSearchData = useBoundStore(s => s.searchData);
	const storedAcceptedTgIds = useBoundStore(s => s.acceptedTgIds);

	// Restore results screen if campaign data exists in store (e.g. navigating back from studio)
	const hasStoredCampaign = storedSearchData !== null && storedQuery !== '';

	const [screen, setScreen] = useState<Screen>(
		hasStoredCampaign ? 'results' : 'chat',
	);
	const [input, setInput] = useState(storedQuery);
	const [query, setQuery] = useState(storedQuery);

	// API state
	const [isLoading, setIsLoading] = useState(false);
	const [apiError, setApiError] = useState<string | null>(null);
	const [apiResponse, setApiResponse] =
		useState<SearchContentApiResponse | null>(storedSearchData);

	// Selection & submission state
	const [acceptedIds, setAcceptedIds] =
		useState<number[]>(storedAcceptedTgIds);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitStep, setSubmitStep] = useState<'create' | 'fetch'>('create');
	const [submitError, setSubmitError] = useState<string | null>(null);
	const [assetsRevealed, setAssetsRevealed] = useState(hasStoredCampaign);
	const [lastSubmittedIds, setLastSubmittedIds] =
		useState<number[]>(storedAcceptedTgIds);
	const [campaignUrls, setCampaignUrls] = useState<
		{ label: string; url: string }[]
	>([]);

	const selectionChanged =
		assetsRevealed &&
		(acceptedIds.length !== lastSubmittedIds.length ||
			acceptedIds.some(id => !lastSubmittedIds.includes(id)));

	const assetsRef = useRef<HTMLDivElement>(null);

	const submit = async (overrideInput?: string) => {
		const trimmed = (overrideInput ?? input).trim();
		if (!trimmed) return;
		setQuery(trimmed);
		setScreen('results');
		setAssetsRevealed(false);
		setAcceptedIds([]);
		setApiResponse(null);
		setApiError(null);
		setIsLoading(true);
		try {
			const data = await fetchCampaignContent(trimmed);
			setApiResponse(data);
		} catch (err) {
			setApiError(
				err instanceof Error ? err.message : 'Something went wrong.',
			);
		} finally {
			setIsLoading(false);
		}
	};

	const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			void submit();
		}
	};

	const handleDecisions = useCallback((accepted: number[]) => {
		setAcceptedIds(accepted);
		setSubmitError(null);
	}, []);

	const goChat = () => {
		setScreen('chat');
		setAssetsRevealed(false);
		setApiResponse(null);
		setApiError(null);
		clearCampaign();
	};

	const confirmProducts = async () => {
		if (!apiResponse || acceptedIds.length === 0) return;
		setIsSubmitting(true);
		setSubmitStep('create');
		setSubmitError(null);
		try {
			// Step 1: create the collection
			const payload = buildCollectionPayload(apiResponse, acceptedIds);
			const createRes = await createCollectionContent(payload);

			// Step 2: fetch the collection using the returned ID
			const collectionId = createRes.collectionId;
			if (collectionId == null)
				throw new Error('No collection ID returned from create API.');

			setSubmitStep('fetch');
			// Fetch both in parallel
			const [collectionData, campaignData] = await Promise.all([
				getCollectionContent(collectionId),
				getCampaignData(collectionId),
			]);

			// Persist to store so preview + studio pages can seed their props
			setCampaignContext(
				query,
				apiResponse,
				acceptedIds,
				collectionData,
				campaignData,
			);

			const BASE = 'https://poc-shv.deimos.dev-headout.com';
			const urls: { label: string; url: string }[] = [
				{
					label: 'Collection page',
					url: `${BASE}/${payload.urlSlug}-c-${collectionId}`,
				},
			];

			const firstProductSlug = apiResponse.tourGroups.find(tg =>
				acceptedIds.includes(tg.id),
			)?.urlSlug;
			if (firstProductSlug) {
				urls.push({
					label: 'Product page',
					url: `${BASE}${firstProductSlug}`,
				});
			}

			const rawCity = apiResponse.location?.cityCode;
			if (rawCity) {
				const citySlug = rawCity.toLowerCase().replace(/[_\s]+/g, '-');
				urls.push({
					label: 'City page',
					url: `${BASE}/things-to-do-city-${citySlug}`,
				});
			}

			setCampaignUrls(urls);
			setLastSubmittedIds(acceptedIds);
			setAssetsRevealed(true);
			setTimeout(
				() =>
					assetsRef.current?.scrollIntoView({
						behavior: 'smooth',
						block: 'start',
					}),
				80,
			);
		} catch (err) {
			setSubmitError(
				err instanceof Error
					? err.message
					: 'Failed to create collection.',
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	// ─── Chat screen ──────────────────────────────────────────────────────────
	if (screen === 'chat') {
		return (
			<div
				className='flex min-h-screen flex-col relative overflow-hidden'
				style={{ background: 'var(--background)' }}
			>
				{/* Ambient orbs */}
				<div
					aria-hidden
					className='pointer-events-none absolute'
					style={{
						bottom: -344,
						right: 299,
						width: 600,
						height: 600,
						borderRadius: '50%',
						background:
							'radial-gradient(circle at center, rgba(140,18,201,1) 0%, rgba(197,34,174,1) 27.5%, rgba(254,51,148,1) 55%, rgba(254,56,112,0.75) 66%, rgba(255,61,76,0.5) 77%, rgba(255,71,4,0) 100%)',
						filter: 'blur(80px)',
						opacity: 0.16,
						animation: 'orbDrift 14s ease-in-out infinite',
					}}
				/>
				<div
					aria-hidden
					className='pointer-events-none absolute'
					style={{
						bottom: -344,
						left: 'calc(50% - 222px)',
						width: 600,
						height: 600,
						borderRadius: '50%',
						background:
							'radial-gradient(circle at center, rgba(128,0,255,1) 0%, rgba(160,13,228,1) 15%, rgba(191,26,202,1) 30%, rgba(254,51,148,1) 60%, rgba(254,51,148,0) 74%)',
						filter: 'blur(104px)',
						opacity: 0.12,
						animation: 'orbDrift 18s ease-in-out infinite reverse',
					}}
				/>

				<AppHeader label='COSMOS' />

				<div className='relative z-[1] flex flex-1 flex-col items-center justify-center px-6 pb-30 pt-10'>
					<div className='mb-[18px] text-[12px] font-medium uppercase tracking-[0.4px] text-[var(--color-semantic-text-grey-2)]'>
						Campaign brief
					</div>

					<h1
						className='mb-[14px] max-w-[720px] text-center text-[48px] font-medium leading-[1.1] tracking-[0.4px] text-[var(--color-semantic-text-grey-1)]'
						style={{ fontFamily: 'var(--font-hd)' }}
					>
						What are we promoting today?
					</h1>

					<p className='mb-[38px] max-w-[560px] text-center text-[17px] font-light leading-[1.65] text-[var(--color-semantic-text-grey-1)]'>
						Describe a destination, experience, or audience — and
						we'll surface the right products and assemble the
						campaign creatives.
					</p>

					<div
						className='flex w-full max-w-[720px] items-center gap-3 rounded-[var(--radius-12)] bg-[var(--color-semantic-surface-light-white)] px-[22px] py-2 pr-2'
						style={{ boxShadow: '0 0 0 1px rgba(226,226,226,0.5)' }}
					>
						<textarea
							className='chat-input flex-1 resize-none border-none bg-transparent py-[14px] text-[15px] font-light leading-[1.6] text-[var(--color-semantic-text-grey-2)] outline-none'
							placeholder='Ask anything…  e.g. July 4th campaign for New York'
							value={input}
							onChange={e => setInput(e.target.value)}
							onKeyDown={handleKeyDown}
							rows={1}
							style={{ height: 52, overflow: 'hidden' }}
						/>
						<button
							className='flex h-[42px] w-[42px] flex-none items-center justify-center rounded-[var(--radius-12)] border border-[var(--color-semantic-dividers-dark)] bg-[var(--color-semantic-surface-dark-black)] text-[var(--color-semantic-surface-light-white)] cursor-pointer transition-opacity hover:opacity-80'
							onClick={() => submit()}
							aria-label='Send'
						>
							<svg
								width='18'
								height='18'
								viewBox='0 0 24 24'
								fill='none'
								stroke='currentColor'
								strokeWidth='2'
								strokeLinecap='round'
								strokeLinejoin='round'
							>
								<line x1='12' y1='19' x2='12' y2='5' />
								<polyline points='5 12 12 5 19 12' />
							</svg>
						</button>
					</div>

					<div className='mt-[22px] flex max-w-[720px] flex-wrap justify-center gap-[10px]'>
						{SUGGESTIONS.map(s => (
							<button
								key={s}
								onClick={() => {
									setInput(s);
									submit(s);
								}}
								className='rounded-[var(--radius-full)] border border-[var(--color-semantic-dividers-dark)] bg-[var(--color-semantic-surface-light-grey-1)] px-4 py-[9px] text-[14px] font-medium text-[var(--color-semantic-text-grey-1)] cursor-pointer hover:bg-[var(--color-semantic-surface-light-grey-2)] transition-colors'
							>
								{s}
							</button>
						))}
					</div>
				</div>
			</div>
		);
	}

	// ─── Results screen ───────────────────────────────────────────────────────
	const products = apiResponse?.tourGroups ?? [];
	const bannerTitle = apiResponse?.banner?.title;

	return (
		<div
			className='flex min-h-screen flex-col'
			style={{ background: 'var(--background)' }}
		>
			<style>{`
        @keyframes thinkingBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>

			<AppHeader
				sticky
				label='COSMOS'
				action={
					<button
						onClick={goChat}
						className='text-[14px] font-light text-[var(--color-semantic-surface-dark-black)] cursor-pointer hover:opacity-70 transition-opacity'
					>
						＋ New campaign
					</button>
				}
			/>

			<div
				className='mx-auto w-full max-w-[1200px] px-8 pb-[140px] pt-[36px]'
				style={{ animation: 'fadeIn 0.35s ease both' }}
			>
				{/* Query display */}
				<div className='mb-[14px] flex justify-center'>
					<div className='flex w-full max-w-[720px] items-center gap-3 rounded-[var(--radius-12)] bg-[var(--color-semantic-surface-light-grey-2)] px-[22px] py-2 pr-2'>
						<span className='flex-1 py-3 text-[15px] font-light text-[var(--color-semantic-text-grey-2)]'>
							{query}
						</span>
						<button
							onClick={goChat}
							className='flex h-[38px] w-[38px] flex-none items-center justify-center rounded-[var(--radius-8)] border border-[var(--color-semantic-dividers-dark)] bg-[var(--color-semantic-surface-light-grey-2)] text-[var(--color-semantic-text-grey-3)] cursor-pointer hover:bg-[var(--color-semantic-surface-light-grey-3)] transition-colors'
							aria-label='Edit query'
						>
							<svg
								width='15'
								height='15'
								viewBox='0 0 24 24'
								fill='none'
								stroke='currentColor'
								strokeWidth='2'
								strokeLinecap='round'
							>
								<path d='M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7' />
								<path d='M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z' />
							</svg>
						</button>
					</div>
				</div>

				{/* Loading / thinking state */}
				{isLoading && (
					<div
						className='flex flex-col items-center justify-center py-[80px] gap-4'
						style={{ animation: 'fadeIn 0.3s ease both' }}
					>
						<ThinkingDots />
						<p
							className='text-[15px] font-light text-[var(--color-semantic-text-grey-3)]'
							style={{ fontFamily: 'var(--font-serif)' }}
						>
							Searching for the best experiences for{' '}
							<em>"{query}"</em>…
						</p>
					</div>
				)}

				{/* Error state */}
				{apiError && !isLoading && (
					<div
						className='mx-auto max-w-[480px] rounded-[var(--radius-12)] border border-[#FCA5A5] bg-[#FEF2F2] px-6 py-4 text-center'
						style={{ animation: 'fadeIn 0.3s ease both' }}
					>
						<p className='text-[14px] font-medium text-[#DC2626]'>
							Failed to load results
						</p>
						<p className='mt-1 text-[13px] font-light text-[#EF4444]'>
							{apiError}
						</p>
						<button
							onClick={() => void submit()}
							className='mt-3 text-[13px] font-medium text-[#DC2626] underline cursor-pointer'
						>
							Try again
						</button>
					</div>
				)}

				{/* Results */}
				{!isLoading && !apiError && apiResponse && (
					<>
						<p
							className='mb-[48px] text-center text-[14px] font-light italic text-[var(--color-semantic-text-disabled)]'
							style={{ fontFamily: 'var(--font-serif)' }}
						>
							{bannerTitle
								? `"${bannerTitle}" — ${products.length} related products matched.`
								: `Campaign assembled — ${products.length} related products matched.`}
						</p>

						<div className='mb-1 flex items-end justify-between'>
							<h2
								className='text-[21px] font-semibold text-[var(--color-semantic-text-grey-1)]'
								style={{ fontFamily: 'var(--font-hd)' }}
							>
								Related products
							</h2>
						</div>
						<p className='mb-[16px] text-[14px] font-light text-[var(--color-semantic-text-grey-3)]'>
							Review and accept or decline each suggestion.
						</p>

						<ProductTable
							products={products}
							onDecisionsChange={handleDecisions}
						/>

						{/* Confirm / Update CTA */}
						{(!assetsRevealed || selectionChanged) && (
							<div
								className='mt-[40px] rounded-[var(--radius-12)] border bg-[var(--color-semantic-surface-light-grey-1)]'
								style={{
									borderColor: submitError
										? '#FCA5A5'
										: 'var(--color-semantic-dividers-dark)',
								}}
							>
								{/* Error banner */}
								{submitError && (
									<div className='flex items-center justify-between gap-4 border-b border-[#FCA5A5] bg-[#FEF2F2] px-6 py-3 rounded-t-[var(--radius-12)]'>
										<p className='text-[13px] font-medium text-[#DC2626]'>
											{submitError}
										</p>
										<button
											onClick={() =>
												void confirmProducts()
											}
											className='flex-none text-[13px] font-semibold text-[#DC2626] underline cursor-pointer whitespace-nowrap hover:opacity-80 transition-opacity'
										>
											Retry
										</button>
									</div>
								)}

								<div className='flex items-center justify-between px-6 py-4'>
									<div>
										<p className='text-[14px] font-medium text-[var(--color-semantic-text-grey-1)]'>
											{acceptedIds.length > 0
												? `${acceptedIds.length} product${acceptedIds.length !== 1 ? 's' : ''} selected`
												: 'No products selected yet'}
										</p>
										<p className='mt-0.5 text-[13px] font-light text-[var(--color-semantic-text-grey-3)]'>
											{selectionChanged
												? 'Your selection changed — update the campaign to apply.'
												: 'Accept the products you want to promote, then confirm to generate campaign assets.'}
										</p>
									</div>
									<button
										onClick={() => void confirmProducts()}
										disabled={
											acceptedIds.length === 0 ||
											isSubmitting
										}
										className='ml-6 flex-none rounded-[var(--radius-full)] border border-[var(--color-semantic-dividers-dark)] bg-[var(--color-semantic-surface-dark-black)] px-5 py-2.5 text-[14px] font-medium text-[var(--color-semantic-surface-light-white)] cursor-pointer transition-opacity hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed inline-flex items-center gap-2'
									>
										{isSubmitting ? (
											<>
												<span
													style={{
														width: 14,
														height: 14,
														border: '2px solid rgba(255,255,255,0.4)',
														borderTopColor: '#fff',
														borderRadius: '50%',
														display: 'inline-block',
														animation:
															'spin 0.7s linear infinite',
													}}
												/>
												{submitStep === 'create'
													? 'Updating campaign…'
													: 'Loading collection…'}
											</>
										) : submitError ? (
											'Try again →'
										) : selectionChanged ? (
											'Update campaign →'
										) : (
											'Confirm products →'
										)}
									</button>
								</div>
							</div>
						)}

						{/* Campaign assets — revealed after confirmation */}
						{assetsRevealed && (
							<div
								ref={assetsRef}
								className='mt-[72px]'
								style={{ animation: 'fadeIn 0.4s ease both' }}
							>
								<div className='mb-1 flex items-end justify-between'>
									<h2
										className='text-[21px] font-semibold text-[var(--color-semantic-text-grey-1)]'
										style={{ fontFamily: 'var(--font-hd)' }}
									>
										Campaign assets
									</h2>
									<span className='text-[13px] font-light text-[var(--color-semantic-text-grey-3)]'>
										{acceptedIds.length} product
										{acceptedIds.length !== 1
											? 's'
											: ''}{' '}
										included
									</span>
								</div>
								<p className='mb-[20px] text-[14px] font-light text-[var(--color-semantic-text-grey-3)]'>
									Three creative sets generated from your
									brief. Open any to edit, or preview the
									campaign page.
								</p>
								{campaignUrls.length > 0 && (
									<div className='mb-[28px] rounded-[var(--radius-8)] border border-[var(--color-semantic-dividers-dark)] bg-[var(--color-semantic-surface-light-grey-1)] overflow-hidden'>
										{campaignUrls.map((item, i) => (
											<div
												key={item.label}
												className={`flex items-center gap-3 px-4 py-3 ${i < campaignUrls.length - 1 ? 'border-b border-[var(--color-semantic-dividers-dark)]' : ''}`}
											>
												<span className='w-[110px] shrink-0 text-[12px] font-medium text-[var(--color-semantic-text-grey-3)]'>
													{item.label}
												</span>
												<a
													href={item.url}
													target='_blank'
													rel='noopener noreferrer'
													className='flex-1 truncate text-[13px] font-medium text-[var(--color-semantic-text-grey-1)] hover:underline'
												>
													{item.url}
												</a>
												<a
													href={item.url}
													target='_blank'
													rel='noopener noreferrer'
													className='shrink-0 inline-flex items-center gap-1.5 rounded-[var(--radius-6)] border border-[var(--color-semantic-dividers-dark)] bg-[var(--color-semantic-surface-light-white)] px-3 py-1.5 text-[12px] font-medium text-[var(--color-semantic-text-grey-2)] cursor-pointer hover:bg-[var(--color-semantic-surface-light-grey-2)] transition-colors no-underline'
												>
													<svg
														width='12'
														height='12'
														viewBox='0 0 12 12'
														fill='none'
														stroke='currentColor'
														strokeWidth='1.5'
														strokeLinecap='round'
														strokeLinejoin='round'
													>
														<path d='M7 1h4v4M11 1L5.5 6.5M4.5 2H2a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V8.5' />
													</svg>
													View
												</a>
											</div>
										))}
									</div>
								)}
								<CampaignEntryCards prompt={query} />
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
}
