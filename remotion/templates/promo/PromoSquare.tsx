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

/** Promo — square social post, 1200×1200. */
export const PromoSquare: React.FC<PromoProps> = ({
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
					{ cx: 949, cy: 267, radius: 251 },
					{ cx: 949, cy: 834, radius: 251 },
					{ cx: 115, cy: 349, radius: 251 },
				]}
			/>

			{/* Brand lockup */}
			<div style={{ position: 'absolute', left: 85, top: 64 }}>
				<BrandLockup
					line1={brandLine1}
					line2={brandLine2}
					color={textColor}
					showByHeadout={showByHeadout}
					parisSize={43.12}
					ticketsSize={29.26}
					ticketsTracking={1.463}
					lineHeight={33.88}
					logoHeight={64.996}
					gap={15.091}
				/>
			</div>

			{/* Hero image */}
			<div style={{ position: 'absolute', left: 85, top: 168.77 }}>
				<PentagonImage
					src={imageSrc || SAMPLE_IMAGE}
					maskSrc={MASK.square}
					width={1034}
					height={769.23}
				/>
			</div>

			{/* Footer: title + rating on the left, CTA on the right */}
			<div
				style={{
					position: 'absolute',
					left: 84,
					top: 996,
					width: 1032,
					display: 'flex',
					alignItems: 'flex-end',
					justifyContent: 'space-between',
					gap: 114,
				}}
			>
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						gap: 20,
						width: 693,
					}}
				>
					<p
						style={{
							margin: 0,
							width: 800,
							fontFamily: DISPLAY_FONT_FAMILY,
							fontWeight: 500,
							fontSize: 52,
							lineHeight: 1.2,
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
								gap={5.6}
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
				{showCta ? <CTAButton label={ctaLabel} /> : null}
			</div>
		</AbsoluteFill>
	);
};
