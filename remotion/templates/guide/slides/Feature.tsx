import React from 'react';
import { AbsoluteFill, staticFile } from 'remotion';
import type { FeatureSlide } from '../schema';
import { IconBadge } from '../../../components/IconBadge';
import { RoundedImage } from '../../../components/RoundedImage';
import { Glow } from '../../../components/Glow';
import { DISPLAY_FONT_FAMILY, WORDMARK_FONT_FAMILY } from '../../../fonts';

const SAMPLE = staticFile('templates/sample-photo.png');

/** Blue gradient for accent text. */
const ACCENT_GRADIENT =
	'linear-gradient(122.37deg, #5480FF 11.28%, #7EA6FF 31.45%, #4172FF 71.53%)';

interface Props {
	slide: FeatureSlide;
}

export const GuideFeature: React.FC<Props> = ({ slide }) => {
	const {
		headingBefore,
		headingAccent,
		headingAfter,
		body,
		imageSrc,
		badgeSrc,
	} = slide;

	// Image: Figma — left:68, top:647, width:944.41, height:635
	const imgLeft = 68;
	const imgTop = 647;
	const imgW = 944;
	const imgH = 635;

	return (
		<AbsoluteFill>
			{/* White background with soft glow */}
			<Glow
				bgColor='#FFFFFF'
				glowColor='#C7D5FF'
				blur={200}
				spots={[
					{ cx: 1085, cy: 500, radius: 450 }, // top-right
					{ cx: 30, cy: 1400, radius: 300 }, // bottom-left
				]}
			/>

			{/* Badge */}
			<IconBadge
				src={badgeSrc || staticFile('templates/posts/badge-walk.svg')}
				top={104}
			/>

			{/* Heading block — centered around x:540 */}
			<div
				style={{
					position: 'absolute',
					left: 0,
					top: 248,
					width: 1080,
					textAlign: 'center',
					pointerEvents: 'none',
				}}
			>
				{/* Two-tone heading */}
				<div
					style={{
						fontFamily: DISPLAY_FONT_FAMILY,
						fontWeight: 500,
						fontSize: 54,
						lineHeight: '65.6px',
						color: '#001b6a',
						whiteSpace: 'pre-line',
					}}
				>
					{headingBefore || headingAccent ? (
						<span>
							{headingBefore ? (
								<span style={{ color: '#001b6a' }}>
									{headingBefore}
								</span>
							) : null}
							{headingAccent ? (
								<span
									style={{
										backgroundImage: ACCENT_GRADIENT,
										WebkitBackgroundClip: 'text',
										backgroundClip: 'text',
										color: 'transparent',
									}}
								>
									{headingAccent}
								</span>
							) : null}
							{headingAfter ? headingAfter : null}
						</span>
					) : null}
				</div>

				{/* Body text */}
				<p
					style={{
						margin: 0,
						marginTop: 24,
						fontFamily: WORDMARK_FONT_FAMILY,
						fontWeight: 400,
						fontSize: 32,
						lineHeight: '44.8px',
						color: '#001b6a',
						padding: '0 197px',
						textAlign: 'center',
					}}
				>
					{body}
				</p>
			</div>

			{/* Hero image */}
			<RoundedImage
				src={imageSrc}
				fallbackSrc={SAMPLE}
				left={imgLeft}
				top={imgTop}
				width={imgW}
				height={imgH}
				borderRadius={30}
			/>
		</AbsoluteFill>
	);
};
