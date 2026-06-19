import { loadFont as loadGoogleFont } from '@remotion/google-fonts/LexendDeca';
import { loadFont as loadLocalFont } from '@remotion/fonts';
import { staticFile } from 'remotion';

/**
 * Brand display font — matches the family name registered by @headout/eevee's
 * InlineFontFace component (Typekit, weight 500). Using the same name as eevee
 * ensures the Remotion Player preview picks up the already-loaded face.
 * The woff2 is bundled at public/fonts/halyard-display-medium.woff2 so the
 * Remotion Puppeteer renderer can load it from localhost without network access.
 */
export const DISPLAY_FONT_FAMILY = 'halyard-display';

/** Wordmark font for the "PARIS / TICKETS" brand lockup. */
const lexend = loadGoogleFont('normal', { weights: ['400', '700'] });
export const WORDMARK_FONT_FAMILY = lexend.fontFamily;

let displayFontPromise: Promise<void> | null = null;

/**
 * Idempotently registers Halyard Display. Safe to call from every composition
 * — the underlying load is cached after the first call.
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
