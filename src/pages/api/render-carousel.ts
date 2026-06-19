import fs from 'node:fs/promises';
import JSZip from 'jszip';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getTemplateMeta } from '../../../remotion/manifest';
import { getBundle, ensureBrowserReady, renderSlide } from './_render';

export const config = {
	api: {
		responseLimit: false,
	},
};

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method not allowed' });
	}

	const body = req.body as {
		templateId?: string;
		props?: Record<string, unknown>;
	};

	const template = body.templateId
		? getTemplateMeta(body.templateId)
		: undefined;
	if (!template) {
		return res
			.status(404)
			.json({ error: `Unknown template: ${body.templateId}` });
	}

	if (template.category !== 'posts') {
		return res
			.status(400)
			.json({ error: 'render-carousel is only for post templates' });
	}

	const slides = Array.isArray(
		(body.props as Record<string, unknown> | undefined)?.slides,
	)
		? ((body.props as Record<string, unknown>).slides as unknown[])
		: [];

	if (slides.length === 0) {
		return res.status(422).json({ error: 'No slides to render' });
	}

	const tmpFiles: string[] = [];
	try {
		await ensureBrowserReady();
		const serveUrl = await getBundle();
		const zip = new JSZip();

		for (let i = 0; i < slides.length; i++) {
			const inputProps = { ...body.props, slideIndex: i };

			const parsed = template.schema.safeParse(inputProps);
			if (!parsed.success) {
				return res
					.status(422)
					.json({
						error: 'Invalid props',
						issues: parsed.error.issues,
					});
			}

			const outputPath = await renderSlide(
				serveUrl,
				template.id,
				parsed.data as Record<string, unknown>,
			);
			tmpFiles.push(outputPath);

			const fileData = await fs.readFile(outputPath);
			const padded = String(i + 1).padStart(2, '0');
			zip.file(`slide-${padded}.png`, fileData);
		}

		const zipBuffer = await zip.generateAsync({
			type: 'nodebuffer',
			compression: 'DEFLATE',
		});

		res.setHeader('Content-Type', 'application/zip');
		res.setHeader(
			'Content-Disposition',
			`attachment; filename="${template.id}.zip"`,
		);
		res.setHeader('Cache-Control', 'no-store');
		res.status(200).send(zipBuffer);
	} catch (err) {
		console.error('[render-carousel] failed', err);
		res.status(500).json({
			error: err instanceof Error ? err.message : 'Render failed',
		});
	} finally {
		await Promise.all(
			tmpFiles.map(f => fs.rm(f, { force: true }).catch(() => {})),
		);
	}
}
