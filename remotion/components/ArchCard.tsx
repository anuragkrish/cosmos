import React from 'react';
import { Img, staticFile } from 'remotion';

/**
 * The arch-card shape used in Guide cover and closing slides.
 * Three stacked PNG layers (shadow → outline → white fill) recreate the
 * exact Figma appearance. All coordinates are in the 1080×1350 canvas.
 */
export const ArchCard: React.FC = () => {
	// Box dimensions (Figma: left:73, top:78, width:934, height:1184)
	const L = 73;
	const T = 78;
	const W = 934;
	const H = 1184;

	// Shadow bleeds out by 3.73% vertically / 4.71% horizontally
	const shadowBleedX = Math.round(W * 0.0471); // ≈44
	const shadowBleedY = Math.round(H * 0.0373); // ≈44

	// Outline bleeds out by 2.03% / 2.57%
	const outlineBleedX = Math.round(W * 0.0257); // ≈24
	const outlineBleedY = Math.round(H * 0.0203); // ≈24

	return (
		<>
			{/* Shadow layer */}
			<div
				style={{
					position: 'absolute',
					left: L - shadowBleedX,
					top: T - shadowBleedY,
					width: W + 2 * shadowBleedX,
					height: H + 2 * shadowBleedY,
					pointerEvents: 'none',
				}}
			>
				<Img
					src={staticFile('templates/posts/arch-card-shadow.svg')}
					style={{ width: '100%', height: '100%' }}
				/>
			</div>

			{/* Outline layer */}
			<div
				style={{
					position: 'absolute',
					left: L - outlineBleedX,
					top: T - outlineBleedY,
					width: W + 2 * outlineBleedX,
					height: H + 2 * outlineBleedY,
					pointerEvents: 'none',
				}}
			>
				<Img
					src={staticFile('templates/posts/arch-card-outline.svg')}
					style={{ width: '100%', height: '100%' }}
				/>
			</div>

			{/* White fill */}
			<div
				style={{
					position: 'absolute',
					left: L,
					top: T,
					width: W,
					height: H,
					pointerEvents: 'none',
				}}
			>
				<Img
					src={staticFile('templates/posts/arch-card-fill.svg')}
					style={{ width: '100%', height: '100%' }}
				/>
			</div>
		</>
	);
};
