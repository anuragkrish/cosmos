/**
 * @filename: lint-staged.config.js
 * @type {import('lint-staged').Configuration}
 */
const config = {
	'*.{js,ts,jsx,tsx}': ['eslint --fix', 'prettier --write'],
	'*.css': ['prettier --write'],
};

export default config;
