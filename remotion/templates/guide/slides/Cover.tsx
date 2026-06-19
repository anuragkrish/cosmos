import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import type { CoverSlide } from '../schema';
import { ArchCard } from '../../../components/ArchCard';
import { IconBadge } from '../../../components/IconBadge';
import { DISPLAY_FONT_FAMILY } from '../../../fonts';

/** Arch-mask for the hero image clipped to the lower portion of the arch card. */
const ARCH_MASK = staticFile('templates/posts/arch-mask.svg');
const SAMPLE = staticFile('templates/sample-photo.png');

/** Blue gradient used on cover and closing slides. */
const BG_GRADIENT = 'linear-gradient(199.07deg, #4377F0 0.61%, #1148D6 89.16%)';

/** Blue gradient for accent/title text. */
const TEXT_GRADIENT =
	'linear-gradient(141.83deg, #5480FF 11.28%, #7EA6FF 31.45%, #4172FF 71.53%)';

interface Props {
	slide: CoverSlide;
}

export const GuideCover: React.FC<Props> = ({ slide }) => {
	const { labelLine1, labelLine2, title, imageSrc, badgeSrc } = slide;

	// Hero image: positioned via Figma measurements (canvas 1080×1350)
	// bottom: 99.57px, height: 639.43px, width: 1009.54px, centered
	const imgW = 1009.54;
	const imgH = 639.43;
	const imgBottom = 99.57;
	const imgLeft = (1080 - imgW) / 2; // ≈35

	return (
		<AbsoluteFill>
			{/* Blue gradient background */}
			<AbsoluteFill style={{ background: BG_GRADIENT }} />

			{/* Arch card (shadow + outline + white fill) */}
			<ArchCard />

			{/* Badge */}
			<IconBadge
				src={badgeSrc || staticFile('templates/posts/badge-arrow.svg')}
				top={128}
			/>

			{/* Text block — centered in card */}
			<div
				style={{
					position: 'absolute',
					left: 0,
					top: 285,
					width: 1080,
					textAlign: 'center',
					pointerEvents: 'none',
				}}
			>
				{/* Subtitle (two-line label) */}
				<p
					style={{
						margin: 0,
						fontFamily: DISPLAY_FONT_FAMILY,
						fontWeight: 500,
						fontSize: 54,
						lineHeight: '65.6px',
						color: '#001b6a',
						whiteSpace: 'pre-line',
					}}
				>
					{labelLine1}
					{'\n'}
					{labelLine2}
				</p>

				{/* Title (gradient) */}
				<p
					style={{
						margin: 0,
						marginTop: 0,
						fontFamily: DISPLAY_FONT_FAMILY,
						fontWeight: 500,
						fontSize: 87.69,
						lineHeight: '78.623px',
						backgroundImage: TEXT_GRADIENT,
						WebkitBackgroundClip: 'text',
						backgroundClip: 'text',
						color: 'transparent',
					}}
				>
					{title}
				</p>
			</div>

			{/* Hero image — masked to arch shape */}
			<div
				style={{
					position: 'absolute',
					left: imgLeft,
					bottom: imgBottom,
					width: imgW,
					height: imgH,
					WebkitMaskImage: `url("${ARCH_MASK}")`,
					maskImage: `url("${ARCH_MASK}")`,
					WebkitMaskSize: '876px 589px',
					maskSize: '876px 589px',
					WebkitMaskPosition: '67px 31px',
					maskPosition: '67px 31px',
					WebkitMaskRepeat: 'no-repeat',
					maskRepeat: 'no-repeat',
					overflow: 'hidden',
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
		</AbsoluteFill>
	);
};
