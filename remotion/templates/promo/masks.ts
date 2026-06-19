import { staticFile } from 'remotion';

/** Per-format pentagon mask SVGs, resolved from public/templates. */
export const MASK = {
	story: staticFile('templates/mask-promo-story.svg'),
	square: staticFile('templates/mask-promo-square.svg'),
	landscape: staticFile('templates/mask-promo-landscape.svg'),
};

/** Fallback hero image used when no image is supplied. */
export const SAMPLE_IMAGE = staticFile('templates/sample-photo.png');
