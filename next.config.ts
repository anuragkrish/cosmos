import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
	output: 'standalone',
	reactStrictMode: true,
	turbopack: { root: path.resolve('.') },
	transpilePackages: [
		'@headout/eevee',
		'@headout/pixie',
		'@headout/onix',
		'@headout/espeon',
	],
	serverExternalPackages: ['@remotion/bundler', '@remotion/renderer'],
	images: {
		remotePatterns: [
			{ protocol: 'https', hostname: 'cdn-imgix.headout.com' },
			{ protocol: 'https', hostname: 'cdn-imgix-open.headout.com' },
		],
	},
};

export default nextConfig;
