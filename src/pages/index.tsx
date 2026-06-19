import { useState, useCallback, useRef, KeyboardEvent } from 'react';
import { ProductTable } from '@/components/product-table';
import { CampaignEntryCards } from '@/components/campaign-entry-cards';
import { AppHeader } from '@/components/app-header';
import { MOCK_PRODUCTS } from '@/lib/mock-data';
import type { RelatedProduct } from '@/lib/types';

const PRODUCTS = MOCK_PRODUCTS as unknown as RelatedProduct[];

const SUGGESTIONS = [
	'Vatican Museums, Rome',
	'Disneyland Paris tickets',
	'Burj Khalifa At The Top',
	'Summer in Barcelona',
];

type Screen = 'chat' | 'results';

export default function Home() {
	const [screen, setScreen] = useState<Screen>('chat');
	const [input, setInput] = useState('');
	const [query, setQuery] = useState('');
	const [acceptedIds, setAcceptedIds] = useState<number[]>([]);
	const [assetsRevealed, setAssetsRevealed] = useState(false);
	const assetsRef = useRef<HTMLDivElement>(null);

	const submit = () => {
		const trimmed = input.trim();
		if (!trimmed) return;
		setQuery(trimmed);
		setScreen('results');
		setAssetsRevealed(false);
	};

	const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			submit();
		}
	};

	const handleDecisions = useCallback(
		(accepted: number[], _declined: number[]) => {
			setAcceptedIds(accepted);
		},
		[],
	);

	const goChat = () => {
		setScreen('chat');
		setAssetsRevealed(false);
	};

	const confirmProducts = () => {
		setAssetsRevealed(true);
		setTimeout(
			() =>
				assetsRef.current?.scrollIntoView({
					behavior: 'smooth',
					block: 'start',
				}),
			80,
		);
	};

	if (screen === 'chat') {
		return (
			<div
				className='flex min-h-screen flex-col relative overflow-hidden'
				style={{ background: 'var(--background)' }}
			>
				{/* Ambient orbs — eevee purps palette */}
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

				<AppHeader
					label='COSMOS'
					action={
						<button
							className='
                text-[15px] font-medium text-[var(--color-semantic-surface-light-white)]
                bg-[var(--color-semantic-surface-dark-black)]
                rounded-[var(--radius-full)]
                px-4 py-2
                border border-[var(--color-semantic-dividers-dark)]
                cursor-pointer
                hover:bg-[var(--color-semantic-text-grey-1)]
                transition-colors
              '
							onClick={goChat}
						>
							New campaign
						</button>
					}
				/>

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
							placeholder='Ask anything…  e.g. Skip-the-line Vatican tickets for summer travelers'
							value={input}
							onChange={e => setInput(e.target.value)}
							onKeyDown={handleKeyDown}
							rows={1}
							style={{ height: 52, overflow: 'hidden' }}
						/>
						<button
							className='flex h-[42px] w-[42px] flex-none items-center justify-center rounded-[var(--radius-12)] border border-[var(--color-semantic-dividers-dark)] bg-[var(--color-semantic-surface-dark-black)] text-[var(--color-semantic-surface-light-white)] cursor-pointer transition-opacity hover:opacity-80'
							onClick={submit}
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
									setQuery(s);
									setScreen('results');
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

	return (
		<div
			className='flex min-h-screen flex-col'
			style={{ background: 'var(--background)' }}
		>
			<AppHeader
				sticky
				label='COSMOS'
				action={
					<button
						onClick={goChat}
						className='text-[14px] font-light text-[var(--color-semantic-surface-dark-black)] cursor-pointer hover:opacity-70 transition-opacity'
					>
						＋ New brief
					</button>
				}
			/>

			<div
				className='mx-auto w-full max-w-[1200px] px-8 pb-[140px] pt-[36px]'
				style={{ animation: 'fadeIn 0.35s ease both' }}
			>
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

				<p
					className='mb-[48px] text-center text-[14px] font-light italic text-[var(--color-semantic-text-disabled)]'
					style={{ fontFamily: 'var(--font-serif)' }}
				>
					Campaign assembled — {PRODUCTS.length} related products
					matched to your brief.
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
					products={PRODUCTS}
					onDecisionsChange={handleDecisions}
				/>

				{/* Confirm products CTA — shown until confirmed */}
				{!assetsRevealed && (
					<div className='mt-[40px] flex items-center justify-between rounded-[var(--radius-12)] border border-[var(--color-semantic-dividers-dark)] bg-[var(--color-semantic-surface-light-grey-1)] px-6 py-4'>
						<div>
							<p className='text-[14px] font-medium text-[var(--color-semantic-text-grey-1)]'>
								{acceptedIds.length > 0
									? `${acceptedIds.length} product${acceptedIds.length !== 1 ? 's' : ''} selected`
									: 'No products selected yet'}
							</p>
							<p className='mt-0.5 text-[13px] font-light text-[var(--color-semantic-text-grey-3)]'>
								Accept the products you want to promote, then
								confirm to generate campaign assets.
							</p>
						</div>
						<button
							onClick={confirmProducts}
							disabled={acceptedIds.length === 0}
							className='ml-6 flex-none rounded-[var(--radius-full)] border border-[var(--color-semantic-dividers-dark)] bg-[var(--color-semantic-surface-dark-black)] px-5 py-2.5 text-[14px] font-medium text-[var(--color-semantic-surface-light-white)] cursor-pointer transition-opacity hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed'
						>
							Confirm products →
						</button>
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
								{acceptedIds.length !== 1 ? 's' : ''} included
							</span>
						</div>
						<p className='mb-[28px] text-[14px] font-light text-[var(--color-semantic-text-grey-3)]'>
							Three creative sets generated from your brief. Open
							any to edit, or preview the campaign page.
						</p>
						<CampaignEntryCards prompt={query} />
					</div>
				)}
			</div>
		</div>
	);
}
