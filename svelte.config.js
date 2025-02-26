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
		csp: {
			directives: {
				'default-src': ['self'],
				'script-src': ['self', 'unsafe-inline', 'unsafe-eval'],
				'style-src': ['self', 'unsafe-inline'],
				'base-uri': ['self'],
				'form-action': ['self'],
				'img-src': ['self', 'data:', 'blob:']
			}
		},
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
