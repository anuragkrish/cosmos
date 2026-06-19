import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import type { DestCoverSlide } from '../schema';
import { DISPLAY_FONT_FAMILY } from '../../../fonts';

const SAMPLE = staticFile('templates/sample-photo.png');
// Arch+circles mask group (downloaded from Figma node 27:9345)
const ARCH_MASK = staticFile('templates/posts/dest-cover-arch.svg');
// Bottom gradient overlay
const OVERLAY = staticFile('templates/posts/dest-cover-overlay.svg');
// Headout badge (subtract/logo shape)
const BADGE = staticFile('templates/posts/dest-cover-badge.svg');

interface Props {
	slide: DestCoverSlide;
}

/**
 * Destinations cover slide (1080×1350).
 *
 * Layout (from Figma 27:9342):
 * - Cream background (#ffecb7)
 * - Full-bleed photo (1448×1931 at -235,-426 — bleeds outside canvas)
 * - Orange rounded-rect frame (#ffa17e, centered, top:218, h:927, w:856)
 * - Arch-masked photo inside the frame
 * - Gradient overlay (bottom portion)
 * - Headout badge at (454, 723, 143×143)
 * - Subtitle + title text overlaid at bottom of card
 */
export const DestCover: React.FC<Props> = ({ slide }) => {
	const { coverLabel, title, imageSrc } = slide;

	// Photo overflows: 1448×1931 placed at (-235, -426)
	const photoLeft = -235;
	const photoTop = -426;
	const photoW = 1448;
	const photoH = 1931;

	// Orange frame (centered):
	// centerX = 1080/2 + 6.02 = 546.02; left = 546.02 - 856/2 ≈ 118
	const frameLeft = 118;
	const frameTop = 218;
	const frameW = 856;
	const frameH = 927;
	const frameRadius = 22;

	// Arch mask group fills the frame area
	const archLeft = 118;
	const archTop = 218;
	const archW = 856;
	const archH = 927;

	// Overlay positioned within the mask area
	const overlayLeft = 149;
	const overlayTop = 208;
	const overlayW = 799;
	const overlayH = 905;

	// Headout badge
	const badgeLeft = 454;
	const badgeTop = 723;
	const badgeSize = 143;

	// Text: centered at 1080/2 ≈ 540, bottom-of-card area
	// Subtitle top ≈ 68.37% of 1350 = 923, title top ≈ 72.44% of 1350 = 978
	const subtitleTop = 923;
	const titleTop = 978;

	return (
		<AbsoluteFill>
			{/* Cream background */}
			<AbsoluteFill style={{ backgroundColor: '#ffecb7' }} />

			{/* Full-bleed background photo */}
			<div
				style={{
					position: 'absolute',
					left: photoLeft,
					top: photoTop,
					width: photoW,
					height: photoH,
				}}
			>
				<Img
					src={imageSrc || SAMPLE}
					style={{
						width: '100%',
						height: '100%',
						objectFit: 'cover',
					}}
				/>
			</div>

			{/* Orange frame background */}
			<div
				style={{
					position: 'absolute',
					left: frameLeft,
					top: frameTop,
					width: frameW,
					height: frameH,
					backgroundColor: '#FFA17E',
					borderRadius: frameRadius,
				}}
			/>

			{/* Arch-masked photo inside frame */}
			<div
				style={{
					position: 'absolute',
					left: archLeft,
					top: archTop,
					width: archW,
					height: archH,
				}}
			>
				<Img
					src={ARCH_MASK}
					style={{ width: '100%', height: '100%' }}
				/>
			</div>

			{/* Gradient overlay (bottom dark gradient for text readability) */}
			<div
				style={{
					position: 'absolute',
					left: overlayLeft,
					top: overlayTop,
					width: overlayW,
					height: overlayH,
				}}
			>
				<Img src={OVERLAY} style={{ width: '100%', height: '100%' }} />
			</div>

			{/* Headout badge */}
			<div
				style={{
					position: 'absolute',
					left: badgeLeft,
					top: badgeTop,
					width: badgeSize,
					height: badgeSize,
				}}
			>
				<Img src={BADGE} style={{ width: '100%', height: '100%' }} />
			</div>

			{/* Subtitle */}
			<p
				style={{
					position: 'absolute',
					left: 0,
					top: subtitleTop,
					width: 1080,
					textAlign: 'center',
					margin: 0,
					fontFamily: DISPLAY_FONT_FAMILY,
					fontWeight: 500,
					fontSize: 49.55,
					lineHeight: '1.1',
					color: '#FFFFFF',
					pointerEvents: 'none',
				}}
			>
				{coverLabel}
			</p>

			{/* Title */}
			<p
				style={{
					position: 'absolute',
					left: 0,
					top: titleTop,
					width: 1080,
					textAlign: 'center',
					margin: 0,
					fontFamily: DISPLAY_FONT_FAMILY,
					fontWeight: 500,
					fontSize: 96,
					lineHeight: '1.1',
					color: '#FFFFFF',
					pointerEvents: 'none',
				}}
			>
				{title}
			</p>
		</AbsoluteFill>
	);
};
