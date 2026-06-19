import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
	output: 'standalone',
	reactStrictMode: true,
	turbopack: { root: path.resolve('.') },
	transpilePackages: ['@headout/eevee', '@headout/pixie', '@headout/onix'],
};

export default nextConfig;
