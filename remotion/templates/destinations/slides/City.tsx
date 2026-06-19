import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import type { DestCitySlide } from '../schema';
import { DISPLAY_FONT_FAMILY, WORDMARK_FONT_FAMILY } from '../../../fonts';

const SAMPLE = staticFile('templates/sample-photo.png');
const TIP_ICON = staticFile('templates/posts/icon-tip.svg');

interface Props {
	slide: DestCitySlide;
}

/**
 * Destinations city slide (1080×1350).
 *
 * Layout (from Figma 27:9385 Singapore example):
 * - Full-bleed photo (object-cover)
 * - Dark gradient overlay on top portion (h:846) for text legibility
 * - City name: left:68, top:56, font:90px Halyard Medium, color:#a7d3ff
 * - Description: left:68, top:177, font:30px, text-white, w:585
 * - Tip label "Tip": left:100, top:331, font:32px SemiBold white
 * - Tip icon: left:60, top:330, 39×39
 * - Tip body: left:68, top:381, font:30px, rgba(white,0.8), w:415
 */
export const DestCity: React.FC<Props> = ({ slide }) => {
	const { cityName, description, tipText, imageSrc } = slide;

	return (
		<AbsoluteFill>
			{/* Full-bleed photo */}
			<AbsoluteFill>
				<Img
					src={imageSrc || SAMPLE}
					style={{
						width: '100%',
						height: '100%',
						objectFit: 'cover',
					}}
				/>
			</AbsoluteFill>

			{/* Dark gradient overlay on top ~846px */}
			<div
				style={{
					position: 'absolute',
					left: 0,
					top: 0,
					width: 1080,
					height: 846,
					background:
						'linear-gradient(to bottom, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.0) 100%)',
				}}
			/>

			{/* City name */}
			<p
				style={{
					position: 'absolute',
					left: 68,
					top: 56,
					margin: 0,
					fontFamily: DISPLAY_FONT_FAMILY,
					fontWeight: 500,
					fontSize: 90,
					lineHeight: '98.939px',
					color: '#a7d3ff',
				}}
			>
				{cityName}
			</p>

			{/* Description */}
			<p
				style={{
					position: 'absolute',
					left: 68,
					top: 177,
					width: 585,
					margin: 0,
					fontFamily: WORDMARK_FONT_FAMILY,
					fontWeight: 400,
					fontSize: 30,
					lineHeight: '1.4',
					color: '#FFFFFF',
				}}
			>
				{description}
			</p>

			{/* Tip icon */}
			<div
				style={{
					position: 'absolute',
					left: 60,
					top: 330,
					width: 39,
					height: 39,
				}}
			>
				<Img src={TIP_ICON} style={{ width: '100%', height: '100%' }} />
			</div>

			{/* Tip label */}
			<p
				style={{
					position: 'absolute',
					left: 110,
					top: 331,
					margin: 0,
					fontFamily: WORDMARK_FONT_FAMILY,
					fontWeight: 700,
					fontSize: 32,
					lineHeight: '1.4',
					color: '#FFFFFF',
				}}
			>
				Tip
			</p>

			{/* Tip body */}
			<p
				style={{
					position: 'absolute',
					left: 68,
					top: 381,
					width: 415,
					margin: 0,
					fontFamily: WORDMARK_FONT_FAMILY,
					fontWeight: 400,
					fontSize: 30,
					lineHeight: '1.4',
					color: 'rgba(255,255,255,0.8)',
				}}
			>
				{tipText}
			</p>
		</AbsoluteFill>
	);
};
