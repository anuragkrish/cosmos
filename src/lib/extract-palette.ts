/** Converts RGB (0–255 each) to HSL (each 0–1). */
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
	const rn = r / 255,
		gn = g / 255,
		bn = b / 255;
	const max = Math.max(rn, gn, bn),
		min = Math.min(rn, gn, bn);
	const l = (max + min) / 2;
	if (max === min) return [0, 0, l];
	const d = max - min;
	const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
	let h: number;
	if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
	else if (max === gn) h = ((bn - rn) / d + 2) / 6;
	else h = ((rn - gn) / d + 4) / 6;
	return [h, s, l];
}

/** Converts HSL (each 0–1) to a CSS hex string. */
function hslToHex(h: number, s: number, l: number): string {
	const a = s * Math.min(l, 1 - l);
	const ch = (n: number) => {
		const k = (n + h * 12) % 12;
		const val = l - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)));
		return Math.round(255 * Math.max(0, Math.min(1, val)))
			.toString(16)
			.padStart(2, '0');
	};
	return `#${ch(0)}${ch(8)}${ch(4)}`;
}

export interface ImagePalette {
	/** Light tint for the card background. */
	cardBgColor: string;
	/** Darker shade of same hue for text — readable on the card bg. */
	textColor: string;
	/** Very light tint for the outer canvas backdrop. */
	outerBgColor: string;
}

const FALLBACK: ImagePalette = {
	cardBgColor: '#b7e4ff',
	textColor: '#02376d',
	outerBgColor: '#d8f1ff',
};

/**
 * Extracts a harmonious palette from an image URL using a hidden canvas.
 * Samples a 50×50 downscale, averages hue/saturation from mid-tone chromatic
 * pixels, then derives light/dark variations for the three design tokens.
 *
 * Falls back to the default blue palette if the image is cross-origin blocked
 * or contains no usable chromatic pixels.
 */
export async function extractPalette(imageUrl: string): Promise<ImagePalette> {
	if (!imageUrl) return FALLBACK;

	return new Promise(resolve => {
		const img = new Image();
		img.crossOrigin = 'anonymous';

		img.onerror = () => resolve(FALLBACK);

		img.onload = () => {
			try {
				const SIZE = 50;
				const canvas = document.createElement('canvas');
				canvas.width = SIZE;
				canvas.height = SIZE;
				const ctx = canvas.getContext('2d');
				if (!ctx) return resolve(FALLBACK);
				ctx.drawImage(img, 0, 0, SIZE, SIZE);

				const { data } = ctx.getImageData(0, 0, SIZE, SIZE);

				let sumH = 0,
					sumS = 0,
					count = 0;
				for (let i = 0; i < data.length; i += 4) {
					const [h, s, l] = rgbToHsl(
						data[i],
						data[i + 1],
						data[i + 2],
					);
					// Skip near-black, near-white, and near-gray pixels
					if (l < 0.08 || l > 0.92 || s < 0.12) continue;
					sumH += h;
					sumS += s;
					count++;
				}

				if (count === 0) return resolve(FALLBACK);

				const h = sumH / count;
				const s = sumS / count;

				resolve({
					// Card bg: soft tint — high lightness, gentle saturation
					cardBgColor: hslToHex(h, Math.min(s * 0.55, 0.45), 0.87),
					// Text: deep shade of same hue — high contrast on the light bg
					textColor: hslToHex(h, Math.min(s * 0.9, 0.75), 0.17),
					// Outer canvas: even lighter wash behind the card
					outerBgColor: hslToHex(h, Math.min(s * 0.35, 0.35), 0.93),
				});
			} catch {
				// Canvas tainted (cross-origin without CORS headers) → default
				resolve(FALLBACK);
			}
		};

		img.src = imageUrl;
	});
}
