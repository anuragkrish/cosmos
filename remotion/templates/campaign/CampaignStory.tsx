import React from 'react';
import { AbsoluteFill, Img } from 'remotion';
import type { CampaignStoryProps } from './schema';
import { MASK, SAMPLE_IMAGE } from './masks';
import { PentagonImage } from '../../components/PentagonImage';
import { DISPLAY_FONT_FAMILY } from '../../fonts';

/**
 * Campaign Story — 1080×1920.
 *
 * Layout:
 *   • Full-canvas blurred hero image as backdrop
 *   • Rounded-rectangle card floating over the backdrop
 *   • Hero image clipped to an octagon mask at the top of the card
 *   • Title + description in the lower card area
 */
export const CampaignStory: React.FC<CampaignStoryProps> = ({
	imageSrc,
	title,
	description,
	outerBgColor,
	cardBgColor,
	textColor,
}) => {
	const src = imageSrc || SAMPLE_IMAGE;

	return (
		<AbsoluteFill style={{ backgroundColor: outerBgColor }}>
			{/* Blurred full-canvas backdrop */}
			<div
				style={{
					position: 'absolute',
					inset: 0,
					overflow: 'hidden',
				}}
			>
				<Img
					src={src}
					style={{
						width: '100%',
						height: '100%',
						objectFit: 'cover',
						// Scale slightly outward so blurred edges don't show white fringe
						transform: 'scale(1.08)',
						filter: 'blur(42px) brightness(0.9)',
					}}
				/>
			</div>

			{/* Card — height grows with content */}
			<div
				style={{
					position: 'absolute',
					left: 97,
					top: 211,
					width: 886,
					borderRadius: 59.577,
					backgroundColor: cardBgColor,
					display: 'flex',
					flexDirection: 'column',
				}}
			>
				{/* Octagon-masked hero image */}
				<div style={{ padding: '44px 45px 0 45px' }}>
					<PentagonImage
						src={src}
						maskSrc={MASK.campaignStory}
						width={796}
						height={750}
					/>
				</div>

				{/* Text section — stacks below image, no overlap */}
				<div
					style={{
						padding: '24px 45px 60px 67px',
						display: 'flex',
						flexDirection: 'column',
						gap: 20,
					}}
				>
					<p
						style={{
							margin: 0,
							fontFamily: DISPLAY_FONT_FAMILY,
							fontWeight: 600,
							fontSize: 72,
							lineHeight: 1.2,
							color: textColor,
							wordBreak: 'break-word',
						}}
					>
						{title}
					</p>
					<p
						style={{
							margin: 0,
							maxWidth: 707,
							fontFamily: DISPLAY_FONT_FAMILY,
							fontWeight: 400,
							fontSize: 42,
							lineHeight: 1.4,
							color: textColor,
							wordBreak: 'break-word',
						}}
					>
						{description}
					</p>
				</div>
			</div>
		</AbsoluteFill>
	);
};
