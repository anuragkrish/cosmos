import fs from 'node:fs/promises';
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

	const parsed = template.schema.safeParse({
		...template.defaultProps,
		...(body.props ?? {}),
	});
	if (!parsed.success) {
		return res
			.status(422)
			.json({ error: 'Invalid props', issues: parsed.error.issues });
	}

	let outputPath: string | null = null;
	try {
		await ensureBrowserReady();
		const serveUrl = await getBundle();
		outputPath = await renderSlide(
			serveUrl,
			template.id,
			parsed.data as Record<string, unknown>,
		);
		const file = await fs.readFile(outputPath);
		res.setHeader('Content-Type', 'image/png');
		res.setHeader(
			'Content-Disposition',
			`attachment; filename="${template.id}.png"`,
		);
		res.setHeader('Cache-Control', 'no-store');
		res.status(200).send(file);
	} catch (err) {
		console.error('[render] failed', err);
		res.status(500).json({
			error: err instanceof Error ? err.message : 'Render failed',
		});
	} finally {
		if (outputPath)
			await fs.rm(outputPath, { force: true }).catch(() => {});
	}
}
