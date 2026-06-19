import React from 'react';
import { AbsoluteFill, staticFile } from 'remotion';
import type { ImageListSlide } from '../schema';
import { IconBadge } from '../../../components/IconBadge';
import { RoundedImage } from '../../../components/RoundedImage';
import { Glow } from '../../../components/Glow';
import { DISPLAY_FONT_FAMILY, WORDMARK_FONT_FAMILY } from '../../../fonts';

const SAMPLE = staticFile('templates/sample-photo.png');

const ACCENT_GRADIENT =
	'linear-gradient(130.71deg, #5480FF 11.28%, #7EA6FF 31.45%, #4172FF 71.53%)';

interface Props {
	slide: ImageListSlide;
}

export const GuideImageList: React.FC<Props> = ({ slide }) => {
	const {
		headingBefore,
		headingAccent,
		headingAfter,
		subtext,
		items,
		badgeSrc,
	} = slide;

	// Row layout (Figma): images at left:128, heights:199, gap 26px (795-569-199=27)
	// Rows: y=569, y=795, y=1021. Width:355, height:199 each.
	const ROW_LEFT = 128;
	const ROW_W = 355;
	const ROW_H = 199;
	const ROW_GAP = 27;
	const ROW_TOP_START = 569;
	const LABEL_LEFT = 535; // text right of image

	return (
		<AbsoluteFill>
			<Glow
				bgColor='#FFFFFF'
				glowColor='#C7D5FF'
				blur={200}
				spots={[
					{ cx: -344 + 402, cy: 318 + 373, radius: 400 }, // top-left
					{ cx: 720 + 292, cy: 949 + 271, radius: 280 }, // bottom-right
				]}
			/>

			{/* Badge */}
			<IconBadge
				src={
					badgeSrc || staticFile('templates/posts/badge-sparkles.svg')
				}
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

				{subtext ? (
					<p
						style={{
							margin: 0,
							marginTop: 16,
							fontFamily: WORDMARK_FONT_FAMILY,
							fontWeight: 400,
							fontSize: 32,
							lineHeight: '44.8px',
							color: '#001b6a',
						}}
					>
						{subtext}
					</p>
				) : null}
			</div>

			{/* Image + label rows */}
			{items.slice(0, 3).map((item, i) => {
				const rowTop = ROW_TOP_START + i * (ROW_H + ROW_GAP);
				return (
					<React.Fragment key={i}>
						<RoundedImage
							src={item.imageSrc}
							fallbackSrc={SAMPLE}
							left={ROW_LEFT}
							top={rowTop}
							width={ROW_W}
							height={ROW_H}
							borderRadius={25}
						/>
						<p
							style={{
								position: 'absolute',
								left: LABEL_LEFT,
								top: rowTop + (ROW_H - 45) / 2,
								width: 370,
								margin: 0,
								fontFamily: WORDMARK_FONT_FAMILY,
								fontWeight: 400,
								fontSize: 42,
								lineHeight: '44.8px',
								color: '#001b6a',
							}}
						>
							{item.label}
						</p>
					</React.Fragment>
				);
			})}
		</AbsoluteFill>
	);
};
