import React from 'react';
import { AbsoluteFill } from 'remotion';
import type { PromoProps } from './schema';
import { Glow } from '../../components/Glow';
import { PentagonImage } from '../../components/PentagonImage';
import { BrandLockup } from '../../components/BrandLockup';
import { Stars } from '../../components/Stars';
import { CTAButton } from '../../components/CTAButton';
import { DISPLAY_FONT_FAMILY } from '../../fonts';
import { MASK, SAMPLE_IMAGE } from './masks';

/** Promo — landscape banner, 1200×628. */
export const PromoLandscape: React.FC<PromoProps> = ({
	brandLine1,
	brandLine2,
	showByHeadout,
	title,
	rating,
	showRating,
	ctaLabel,
	showCta,
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
				blur={70}
				spots={[
					{ cx: 111, cy: 758, radius: 251 },
					{ cx: 949, cy: 256, radius: 251 },
				]}
			/>

			{/* Left column */}
			<div
				style={{
					position: 'absolute',
					left: 58,
					top: 56,
					width: 517,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'flex-start',
					gap: 48,
				}}
			>
				<BrandLockup
					line1={brandLine1}
					line2={brandLine2}
					color={textColor}
					showByHeadout={showByHeadout}
					parisSize={32.895}
					ticketsSize={22.322}
					ticketsTracking={1.1161}
					lineHeight={25.846}
					logoHeight={50.72}
					gap={11.777}
				/>
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						gap: 20,
					}}
				>
					<p
						style={{
							margin: 0,
							width: 469,
							fontFamily: DISPLAY_FONT_FAMILY,
							fontWeight: 500,
							fontSize: 60,
							lineHeight: 1.1,
							letterSpacing: 0.6701,
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
								gap: 12,
							}}
						>
							<Stars
								rating={rating}
								size={28.84}
								gap={3.95}
								color={accentColor}
							/>
							<span
								style={{
									fontFamily: DISPLAY_FONT_FAMILY,
									fontWeight: 500,
									fontSize: 36.419,
									letterSpacing: 0.2185,
									color: accentColor,
								}}
							>
								{rating.toFixed(1)}
							</span>
						</div>
					) : null}
				</div>
				{showCta ? <CTAButton label={ctaLabel} scale={0.85} /> : null}
			</div>

			{/* Hero image */}
			<div style={{ position: 'absolute', left: 544, top: 67.12 }}>
				<PentagonImage
					src={imageSrc || SAMPLE_IMAGE}
					maskSrc={MASK.landscape}
					width={597.02}
					height={494}
				/>
			</div>
		</AbsoluteFill>
	);
};
