import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import type { ClosingSlide } from '../schema';
import { ArchCard } from '../../../components/ArchCard';
import { IconBadge } from '../../../components/IconBadge';
import { DISPLAY_FONT_FAMILY, WORDMARK_FONT_FAMILY } from '../../../fonts';

const HEADOUT_LOGO = staticFile('templates/posts/icon-headout.svg');

const BG_GRADIENT = 'linear-gradient(199.07deg, #4377F0 0.61%, #1148D6 89.16%)';

const TEXT_GRADIENT =
	'linear-gradient(139.93deg, #5480FF 11.28%, #7EA6FF 31.45%, #4172FF 71.53%)';

// Pill layout (Figma): left:109, height:200, width:862, borderRadius:40
// Pill tops: 565, 795, 1025
const PILL_LEFT = 109;
const PILL_W = 862;
const PILL_H = 200;
const PILL_TOPS = [565, 795, 1025];
const PILL_COLOR = '#85A7FF';
const PILL_RADIUS = 40;
const ICON_LEFT = 152;
const ICON_SIZE = 96;
const TEXT_LEFT = 290;

interface Props {
	slide: ClosingSlide;
}

export const GuideClosing: React.FC<Props> = ({ slide }) => {
	const { heading, badgeSrc, pills } = slide;

	return (
		<AbsoluteFill>
			{/* Blue gradient background */}
			<AbsoluteFill style={{ background: BG_GRADIENT }} />

			{/* Arch card */}
			<ArchCard />

			{/* Badge */}
			<IconBadge
				src={
					badgeSrc || staticFile('templates/posts/badge-closing.svg')
				}
				top={128}
			/>

			{/* Heading (gradient, centered) */}
			<div
				style={{
					position: 'absolute',
					left: 0,
					top: 354,
					width: 1080,
					textAlign: 'center',
					pointerEvents: 'none',
				}}
			>
				<p
					style={{
						margin: 0,
						fontFamily: DISPLAY_FONT_FAMILY,
						fontWeight: 500,
						fontSize: 54,
						lineHeight: '65.6px',
						backgroundImage: TEXT_GRADIENT,
						WebkitBackgroundClip: 'text',
						backgroundClip: 'text',
						color: 'transparent',
					}}
				>
					{heading}
				</p>
			</div>

			{/* Info pills */}
			{pills.slice(0, 3).map((pill, i) => {
				const pillTop =
					PILL_TOPS[i] ?? PILL_TOPS[2] + i * (PILL_H + 30);
				const iconTop = pillTop + (PILL_H - ICON_SIZE) / 2;
				const textTop = pillTop + (PILL_H - 55) / 2;

				return (
					<React.Fragment key={i}>
						{/* Pill background */}
						<div
							style={{
								position: 'absolute',
								left: PILL_LEFT,
								top: pillTop,
								width: PILL_W,
								height: PILL_H,
								backgroundColor: PILL_COLOR,
								borderRadius: PILL_RADIUS,
							}}
						/>

						{/* Icon */}
						<div
							style={{
								position: 'absolute',
								left: ICON_LEFT,
								top: iconTop,
								width: ICON_SIZE,
								height: ICON_SIZE,
							}}
						>
							<Img
								src={
									pill.iconSrc ||
									staticFile(
										'templates/posts/icon-calendar.svg',
									)
								}
								style={{ width: '100%', height: '100%' }}
							/>
						</div>

						{/* Text (and optional headout logo) */}
						<div
							style={{
								position: 'absolute',
								left: TEXT_LEFT,
								top: textTop,
								width: PILL_W - (TEXT_LEFT - PILL_LEFT) - 40,
							}}
						>
							<p
								style={{
									margin: 0,
									fontFamily: WORDMARK_FONT_FAMILY,
									fontWeight: 400,
									fontSize: 40,
									lineHeight: '54.8px',
									color: '#FFFFFF',
									whiteSpace: 'pre-wrap',
								}}
							>
								{pill.text}
								{pill.showHeadoutLogo ? ' ' : ''}
							</p>
							{pill.showHeadoutLogo ? (
								<div style={{ marginTop: 4 }}>
									<Img
										src={HEADOUT_LOGO}
										style={{ height: 28, width: 'auto' }}
									/>
								</div>
							) : null}
						</div>
					</React.Fragment>
				);
			})}
		</AbsoluteFill>
	);
};
