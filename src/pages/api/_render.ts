import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import { bundle } from '@remotion/bundler';
import {
	ensureBrowser,
	renderStill,
	selectComposition,
} from '@remotion/renderer';

let bundlePromise: Promise<string> | null = null;

export const getBundle = (): Promise<string> => {
	if (!bundlePromise) {
		bundlePromise = bundle({
			entryPoint: path.join(process.cwd(), 'remotion', 'index.ts'),
			webpackOverride: config => config,
		});
	}
	return bundlePromise;
};

export const ensureBrowserReady = async (): Promise<void> => {
	await ensureBrowser();
};

export const renderSlide = async (
	serveUrl: string,
	compositionId: string,
	inputProps: Record<string, unknown>,
): Promise<string> => {
	const output = path.join(
		os.tmpdir(),
		`cosmos-still-${crypto.randomUUID()}.png`,
	);

	const composition = await selectComposition({
		serveUrl,
		id: compositionId,
		inputProps,
	});

	await renderStill({
		composition,
		serveUrl,
		output,
		inputProps,
		imageFormat: 'png',
		scale: 1,
	});

	return output;
};

export const readAndClean = async (filePath: string): Promise<Buffer> => {
	const data = await fs.readFile(filePath);
	await fs.rm(filePath, { force: true }).catch(() => {});
	return data;
};
