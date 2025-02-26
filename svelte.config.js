import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			precompress: true,
			strict: false,
			fallback: 'index.html'
		}),
		output: {
			bundleStrategy: 'single'
		},
		alias: {
			"@/*": "./src/lib/*",
			"@routes": "./src/routes",
		},
	}
};

export default config;
