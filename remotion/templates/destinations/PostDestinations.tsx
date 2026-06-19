import React from 'react';
import { AbsoluteFill } from 'remotion';
import type { DestinationsProps } from './schema';
import { DestCover } from './slides/Cover';
import { DestCity } from './slides/City';

/**
 * Destinations carousel composition — renders one slide at a time.
 */
export const PostDestinations: React.FC<DestinationsProps> = ({
	slides,
	slideIndex,
}) => {
	const slide = slides[Math.min(Math.max(slideIndex, 0), slides.length - 1)];
	if (!slide) return <AbsoluteFill style={{ backgroundColor: '#ffecb7' }} />;

	switch (slide.type) {
		case 'cover':
			return <DestCover slide={slide} />;
		case 'city':
			return <DestCity slide={slide} />;
		default:
			return <AbsoluteFill style={{ backgroundColor: '#ffecb7' }} />;
	}
};
