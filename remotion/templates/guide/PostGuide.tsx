import React from 'react';
import { AbsoluteFill } from 'remotion';
import type { GuideProps } from './schema';
import { GuideCover } from './slides/Cover';
import { GuideFeature } from './slides/Feature';
import { GuideImageList } from './slides/ImageList';
import { GuideFeatureList } from './slides/FeatureList';
import { GuideClosing } from './slides/Closing';

/**
 * Guide carousel composition — renders one slide at a time.
 * The `slideIndex` prop selects which slide to render; the carousel API
 * loops over all indices to produce a ZIP of PNGs.
 */
export const PostGuide: React.FC<GuideProps> = ({ slides, slideIndex }) => {
	const slide = slides[Math.min(Math.max(slideIndex, 0), slides.length - 1)];
	if (!slide) return <AbsoluteFill style={{ backgroundColor: '#1148D6' }} />;

	switch (slide.type) {
		case 'cover':
			return <GuideCover slide={slide} />;
		case 'feature':
			return <GuideFeature slide={slide} />;
		case 'imageList':
			return <GuideImageList slide={slide} />;
		case 'featureList':
			return <GuideFeatureList slide={slide} />;
		case 'closing':
			return <GuideClosing slide={slide} />;
		default:
			return <AbsoluteFill style={{ backgroundColor: '#1148D6' }} />;
	}
};
