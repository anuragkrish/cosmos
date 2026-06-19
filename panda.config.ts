import { defineConfig } from '@pandacss/dev';

import Preset from '@headout/eevee/tokens';

import { animations } from '@headout/eevee/animations';

export default defineConfig({
	lightningcss: true,
	preflight: false,
	presets: [Preset],
	logLevel: 'error',
	include: [
		'./src/components/**/*.{js,jsx,ts,tsx}',
		'./src/pages/**/*.{js,jsx,ts,tsx}',
		'./node_modules/@headout/eevee/dist/**/*.{js,jsx,ts,tsx}',
		'./node_modules/@headout/espeon/dist/**/*.{js,jsx,ts,tsx}',
	],
	exclude: [
		'**/*.d.ts',
		'**/*/(types|interface|constants|utils).{js,jsx,ts,tsx}',
		'**/*.test.{js,jsx,ts,tsx}',
		'./pages/api/**/*.{js,jsx,ts,tsx}',
		'./node_modules/@headout/eevee/dist/tokens/**/*.{js,jsx,ts,tsx}',
		'./node_modules/@headout/espeon/dist/types/**/*.{js,jsx,ts,tsx}',
	],
	theme: {
		extend: {
			keyframes: {
				...animations,
			},
		},
	},
	conditions: {
		extend: {
			mobile: '@media (max-width: 768px)',
			desktop: '@media (min-width: 768px)',
		},
	},
	outdir: 'styled-system',
	importMap: ['@headout/pixie'],
	jsxFramework: 'react',
	staticCss: {
		css: [
			{
				properties: {
					WebkitLineClamp: ['1', '2', '3', '4', '5', '6', '7'],
				},
			},
		],
	},
});
