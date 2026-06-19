interface ShimmerBarProps {
	width?: string;
	height?: number;
}

function ShimmerBar({ width = 'w-full', height = 36 }: ShimmerBarProps) {
	return (
		<div
			className={`${width} rounded-lg bg-[var(--color-semantic-surface-light-grey-2)]`}
			style={{ height }}
		/>
	);
}

interface ShimmerFieldsProps {
	/** Which studio layout to mimic */
	variant: 'ads' | 'stories';
}

export function ShimmerFields({ variant }: ShimmerFieldsProps) {
	return (
		<div className='animate-pulse space-y-4'>
			<div className='h-3 w-20 rounded bg-[var(--color-semantic-surface-light-grey-2)]' />

			{variant === 'ads' ? (
				<>
					{/* Title textarea */}
					<ShimmerBar height={72} />
					{/* Brand line 1 */}
					<ShimmerBar height={36} />
					{/* Brand line 2 */}
					<ShimmerBar height={36} />
					{/* Image */}
					<ShimmerBar height={36} />
					{/* Rating */}
					<ShimmerBar height={36} />
					{/* CTA */}
					<ShimmerBar height={36} />
				</>
			) : (
				<>
					{/* Title textarea */}
					<ShimmerBar height={72} />
					{/* Description textarea */}
					<ShimmerBar height={88} />
					{/* Image */}
					<ShimmerBar height={36} />
				</>
			)}
		</div>
	);
}
