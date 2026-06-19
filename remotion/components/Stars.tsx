import React from 'react';

interface StarsProps {
	/** Rating on a 0–`max` scale; the last star fills partially. */
	rating: number;
	max?: number;
	size: number;
	gap: number;
	color: string;
	trackColor?: string;
}

const STAR_PATH =
	'M12 1.6l2.95 6.32 6.95.78-5.16 4.7 1.42 6.83L12 17.6l-6.16 3.43 1.42-6.83L2.1 9.5l6.95-.78L12 1.6Z';

/** A five-point star with a configurable fractional fill (0–1). */
const Star: React.FC<{
	fraction: number;
	size: number;
	color: string;
	trackColor: string;
	id: string;
}> = ({ fraction, size, color, trackColor, id }) => {
	const f = Math.max(0, Math.min(1, fraction));
	return (
		<svg
			width={size}
			height={size}
			viewBox='0 0 24 24'
			style={{ display: 'block' }}
		>
			<defs>
				<linearGradient id={id} x1='0' y1='0' x2='1' y2='0'>
					<stop offset={f} stopColor={color} />
					<stop offset={f} stopColor={trackColor} />
				</linearGradient>
			</defs>
			<path d={STAR_PATH} fill={`url(#${id})`} />
		</svg>
	);
};

/** A star-rating row, mirroring the campaign asset's gold rating badge. */
export const Stars: React.FC<StarsProps> = ({
	rating,
	max = 5,
	size,
	gap,
	color,
	trackColor = 'rgba(255,255,255,0.32)',
}) => {
	return (
		<div style={{ display: 'flex', gap, alignItems: 'center' }}>
			{Array.from({ length: max }).map((_, i) => (
				<Star
					key={i}
					id={`star-${color.replace(/[^a-z0-9]/gi, '')}-${i}`}
					fraction={rating - i}
					size={size}
					color={color}
					trackColor={trackColor}
				/>
			))}
		</div>
	);
};
