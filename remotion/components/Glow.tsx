import React from 'react';
import { AbsoluteFill } from 'remotion';

export interface GlowSpot {
	/** Glow centre, in composition pixels. */
	cx: number;
	cy: number;
	/** Radius of the coloured core before the soft falloff, in px. */
	radius: number;
}

interface GlowProps {
	bgColor: string;
	glowColor: string;
	spots: GlowSpot[];
	/** Softness of the blur, in px. */
	blur?: number;
}

/**
 * The shared brand backdrop: a flat fill overlaid with soft radial colour
 * glows. Recreated with CSS gradients (rather than baked PNGs) so the glow and
 * base colours stay fully configurable.
 */
export const Glow: React.FC<GlowProps> = ({
	bgColor,
	glowColor,
	spots,
	blur = 70,
}) => {
	return (
		<AbsoluteFill style={{ backgroundColor: bgColor, overflow: 'hidden' }}>
			{spots.map((spot, i) => {
				const size = spot.radius * 2;
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: spot.cx - spot.radius,
							top: spot.cy - spot.radius,
							width: size,
							height: size,
							borderRadius: '50%',
							background: `radial-gradient(circle, ${glowColor} 0%, transparent 62%)`,
							filter: `blur(${blur}px)`,
						}}
					/>
				);
			})}
		</AbsoluteFill>
	);
};
