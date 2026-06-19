import { loadFont as loadGoogleFont } from '@remotion/google-fonts/LexendDeca';
import { loadFont as loadLocalFont } from '@remotion/fonts';

/**
 * Brand display font — matches the family name registered by @headout/eevee's
 * InlineFontFace component (Typekit, weight 500). Using the same name as eevee
 * ensures the Remotion Player preview picks up the already-loaded face.
 */
export const DISPLAY_FONT_FAMILY = 'halyard-display';

/** Wordmark font for the "PARIS / TICKETS" brand lockup. */
const lexend = loadGoogleFont('normal', { weights: ['400', '700'] });
export const WORDMARK_FONT_FAMILY = lexend.fontFamily;

let displayFontPromise: Promise<void> | null = null;

// Typekit woff2 URL for halyard-display medium (500) — same as eevee InlineFontFace.
const HALYARD_DISPLAY_URL =
	'https://use.typekit.net/af/165087/00000000000000007735adc0/30/l?primer=f592e0a4b9356877842506ce344308576437e4f677d7c9b78ca2162e6cad991a&fvd=n5&v=3';

/**
 * Idempotently registers Halyard Display from Typekit. In the browser the font
 * is already injected by eevee's InlineFontFace, so this is a no-op. In the
 * Remotion server-side renderer (Puppeteer) the font is fetched from Typekit.
 */
export const ensureFonts = (): Promise<void> => {
	if (!displayFontPromise) {
		displayFontPromise = loadLocalFont({
			family: DISPLAY_FONT_FAMILY,
			url: HALYARD_DISPLAY_URL,
			weight: '500',
			format: 'woff2',
		});
	}
	return Promise.all([displayFontPromise, lexend.waitUntilDone()]).then(
		() => undefined,
	);
};
