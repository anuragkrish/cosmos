import { loadFont as loadGoogleFont } from '@remotion/google-fonts/LexendDeca';
import { loadFont as loadLocalFont } from '@remotion/fonts';
import { staticFile } from 'remotion';

/**
 * Brand display font (titles, rating, CTA). Halyard Display Medium is a
 * licensed Typekit face shipped with the Headout design system; the Medium
 * (weight 500) cut is bundled locally so both the live preview and the
 * server-side Still render resolve it without a network round-trip.
 */
export const DISPLAY_FONT_FAMILY = 'Halyard Display';

/** Wordmark font for the "PARIS / TICKETS" brand lockup. */
const lexend = loadGoogleFont('normal', { weights: ['400', '700'] });
export const WORDMARK_FONT_FAMILY = lexend.fontFamily;

let displayFontPromise: Promise<void> | null = null;

/**
 * Idempotently registers the bundled Halyard Display face. Safe to call from
 * every composition render — the underlying load is cached after the first call.
 */
export const ensureFonts = (): Promise<void> => {
	if (!displayFontPromise) {
		displayFontPromise = loadLocalFont({
			family: DISPLAY_FONT_FAMILY,
			url: staticFile('fonts/halyard-display-medium.woff2'),
			weight: '500',
			format: 'woff2',
		});
	}
	return Promise.all([displayFontPromise, lexend.waitUntilDone()]).then(
		() => undefined,
	);
};
