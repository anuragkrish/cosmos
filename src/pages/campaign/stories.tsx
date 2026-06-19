import { StudioHeader } from '@/components/asset-studio/studio-header';

export default function CampaignStoriesPage() {
	return (
		<div
			className='flex min-h-screen flex-col'
			style={{ background: 'var(--background)' }}
		>
			<StudioHeader
				title='Campaign Stories — Asset Studio'
				action={
					<button
						disabled
						className='rounded-[var(--radius-full)] bg-[var(--color-semantic-surface-light-grey-3)] px-4 py-2 text-[15px] font-medium text-[var(--color-semantic-text-disabled)] cursor-not-allowed'
					>
						Coming soon
					</button>
				}
			/>
			<div className='flex flex-1 flex-col items-center justify-center gap-4 text-center'>
				<span className='text-[var(--color-semantic-dividers-dark)]'>
					<svg width='36' height='36' viewBox='0 0 20 20' fill='none'>
						<rect
							x='5.5'
							y='1.5'
							width='9'
							height='17'
							rx='2.5'
							stroke='currentColor'
							strokeWidth='1.4'
						/>
						<path
							d='M8 5.5h4M8 10h4'
							stroke='currentColor'
							strokeWidth='1.4'
							strokeLinecap='round'
						/>
					</svg>
				</span>
				<h1
					className='text-[18px] font-semibold text-[var(--color-semantic-surface-dark-black)]'
					style={{ fontFamily: 'var(--font-hd)' }}
				>
					Campaign Stories
				</h1>
				<p className='text-[14px] font-light text-[var(--color-semantic-text-disabled)]'>
					Assets will appear here once generated.
				</p>
			</div>
		</div>
	);
}
