import { mdsvex } from 'mdsvex';
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [vitePreprocess(), mdsvex()],
	kit: {
		adapter: adapter(),
		router: {
			type: 'hash'
		},
		output: {
			bundleStrategy: 'inline'
		},
		csp: {
			directives: {
				'default-src': ['self', 'unsafe-inline'],
				'script-src': ['self', 'unsafe-inline'],
				'style-src': ['self', 'unsafe-inline'],
				'img-src': ['self', 'data:', 'blob:'],
				'font-src': ['self']
			}
		},
		alias: {
			"@/*": "./src/lib/*",
		},
	},

	extensions: ['.svelte', '.svx']
};

export default config;
