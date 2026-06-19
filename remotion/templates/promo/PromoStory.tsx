import React from 'react';
import { AbsoluteFill } from 'remotion';
import type { PromoProps } from './schema';
import { Glow } from '../../components/Glow';
import { PentagonImage } from '../../components/PentagonImage';
import { BrandLockup } from '../../components/BrandLockup';
import { Stars } from '../../components/Stars';
import { DISPLAY_FONT_FAMILY } from '../../fonts';
import { MASK, SAMPLE_IMAGE } from './masks';

/** Promo — Instagram/TikTok story, 1080×1920. */
export const PromoStory: React.FC<PromoProps> = ({
	brandLine1,
	brandLine2,
	title,
	rating,
	showRating,
	imageSrc,
	bgColor,
	glowColor,
	accentColor,
	textColor,
}) => {
	return (
		<AbsoluteFill>
			<Glow
				bgColor={bgColor}
				glowColor={glowColor}
				blur={90}
				spots={[
					{ cx: 184, cy: 1753, radius: 251 },
					{ cx: 839, cy: 894, radius: 251 },
				]}
			/>

			{/* Headline block */}
			<div
				style={{
					position: 'absolute',
					left: 86,
					top: 220,
					width: 909,
					display: 'flex',
					flexDirection: 'column',
					gap: 48,
				}}
			>
				<BrandLockup
					line1={brandLine1}
					line2={brandLine2}
					color={textColor}
					showByHeadout={false}
					parisSize={58.987}
					ticketsSize={40.027}
					ticketsTracking={2.0013}
					lineHeight={46.347}
					logoHeight={0}
					gap={0}
				/>
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						gap: 36,
					}}
				>
					<p
						style={{
							margin: 0,
							fontFamily: DISPLAY_FONT_FAMILY,
							fontWeight: 500,
							fontSize: 94.258,
							lineHeight: 1.1,
							letterSpacing: 1.1782,
							color: textColor,
						}}
					>
						{title}
					</p>
					{showRating ? (
						<div
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: 16,
							}}
						>
							<Stars
								rating={rating}
								size={40.16}
								gap={6}
								color={accentColor}
							/>
							<span
								style={{
									fontFamily: DISPLAY_FONT_FAMILY,
									fontWeight: 500,
									fontSize: 46,
									letterSpacing: 0.276,
									color: accentColor,
								}}
							>
								{rating.toFixed(1)}
							</span>
						</div>
					) : null}
				</div>
			</div>

			{/* Hero image */}
			<div style={{ position: 'absolute', left: 95, top: 745 }}>
				<PentagonImage
					src={imageSrc || SAMPLE_IMAGE}
					maskSrc={MASK.story}
					width={889}
					height={978}
				/>
			</div>
		</AbsoluteFill>
	);
};
