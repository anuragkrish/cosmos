import React from 'react';
import { AbsoluteFill, staticFile } from 'remotion';
import type { FeatureListSlide } from '../schema';
import { IconBadge } from '../../../components/IconBadge';
import { RoundedImage } from '../../../components/RoundedImage';
import { Glow } from '../../../components/Glow';
import { DISPLAY_FONT_FAMILY, WORDMARK_FONT_FAMILY } from '../../../fonts';

const SAMPLE = staticFile('templates/sample-photo.png');

const ACCENT_GRADIENT =
	'linear-gradient(130.71deg, #5480FF 11.28%, #7EA6FF 31.45%, #4172FF 71.53%)';

interface Props {
	slide: FeatureListSlide;
}

export const GuideFeatureList: React.FC<Props> = ({ slide }) => {
	const { headingBefore, headingAccent, headingAfter, items, badgeSrc } =
		slide;

	// Row layout (Figma): images at left:122, y:472 / y:867, width:355, height:353
	const ROW_LEFT = 122;
	const ROW_W = 355;
	const ROW_H = 353;
	const ROW_TOPS = [472, 867];
	const TEXT_LEFT = 529; // text right of image

	return (
		<AbsoluteFill>
			<Glow
				bgColor='#FFFFFF'
				glowColor='#C7D5FF'
				blur={200}
				spots={[
					{ cx: 766 + 402, cy: 410 + 373, radius: 400 }, // top-right
					{ cx: -270 + 292, cy: 713 + 271, radius: 280 }, // bottom-left
				]}
			/>

			{/* Badge */}
			<IconBadge
				src={badgeSrc || staticFile('templates/posts/badge-walk.svg')}
				top={104}
			/>

			{/* Heading */}
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
				</div>
			</div>

			{/* Image + text rows */}
			{items.slice(0, 2).map((item, i) => {
				const rowTop = ROW_TOPS[i] ?? ROW_TOPS[1] + i * (ROW_H + 20);
				const textTop = rowTop + 30;
				return (
					<React.Fragment key={i}>
						<RoundedImage
							src={item.imageSrc}
							fallbackSrc={SAMPLE}
							left={ROW_LEFT}
							top={rowTop}
							width={ROW_W}
							height={ROW_H}
							borderRadius={30}
						/>
						<div
							style={{
								position: 'absolute',
								left: TEXT_LEFT,
								top: textTop,
								width: 449,
							}}
						>
							<p
								style={{
									margin: 0,
									fontFamily: DISPLAY_FONT_FAMILY,
									fontWeight: 500,
									fontSize: 42,
									lineHeight: '52px',
									color: '#001b6a',
								}}
							>
								{item.title}
							</p>
							{item.description ? (
								<p
									style={{
										margin: 0,
										marginTop: 12,
										fontFamily: WORDMARK_FONT_FAMILY,
										fontWeight: 400,
										fontSize: 32,
										lineHeight: '44.8px',
										color: '#001b6a',
									}}
								>
									{item.description}
								</p>
							) : null}
						</div>
					</React.Fragment>
				);
			})}
		</AbsoluteFill>
	);
};
