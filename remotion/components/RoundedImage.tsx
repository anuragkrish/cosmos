import React from 'react';
import { Img } from 'remotion';

interface RoundedImageProps {
	src: string;
	fallbackSrc: string;
	width: number;
	height: number;
	left?: number;
	top?: number;
	borderRadius?: number;
	objectPosition?: string;
}

/**
 * An image clipped to a rounded rectangle. Used in Guide slides for hero
 * images, image-list thumbnails, and feature-list thumbnails.
 */
export const RoundedImage: React.FC<RoundedImageProps> = ({
	src,
	fallbackSrc,
	width,
	height,
	left = 0,
	top = 0,
	borderRadius = 30,
	objectPosition = 'center',
}) => {
	return (
		<div
			style={{
				position: 'absolute',
				left,
				top,
				width,
				height,
				borderRadius,
				overflow: 'hidden',
				flexShrink: 0,
			}}
		>
			<Img
				src={src || fallbackSrc}
				style={{
					width: '100%',
					height: '100%',
					objectFit: 'cover',
					objectPosition,
				}}
			/>
		</div>
	);
};
