import React from 'react';
import { Img } from 'remotion';

interface PentagonImageProps {
	src: string;
	/** Mask SVG (from public/), defining the rounded-pentagon silhouette. */
	maskSrc: string;
	width: number;
	height: number;
	objectPosition?: string;
	style?: React.CSSProperties;
}

/**
 * An image clipped to the campaign's signature rounded-pentagon silhouette.
 * The mask is supplied as an SVG so each format can ship its own exactly-tuned
 * shape while the fill image stays swappable.
 */
export const PentagonImage: React.FC<PentagonImageProps> = ({
	src,
	maskSrc,
	width,
	height,
	objectPosition = 'center',
	style,
}) => {
	const mask = `url("${maskSrc}")`;
	return (
		<div style={{ width, height, position: 'relative', ...style }}>
			<Img
				src={src}
				style={{
					width: '100%',
					height: '100%',
					objectFit: 'cover',
					objectPosition,
					WebkitMaskImage: mask,
					maskImage: mask,
					WebkitMaskSize: '100% 100%',
					maskSize: '100% 100%',
					WebkitMaskRepeat: 'no-repeat',
					maskRepeat: 'no-repeat',
				}}
			/>
		</div>
	);
};
