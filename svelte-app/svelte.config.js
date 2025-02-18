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
			mode: "nonce",
			directives: {
				"default-src": ["'self'", "*", "data:", "blob:", "'unsafe-inline'", "'unsafe-eval'"],
				"style-src": ["'self'", "*", "'unsafe-inline'"],
				"script-src": ["'self'", "*", "'unsafe-inline'", "'unsafe-eval'"],
				"img-src": ["'self'", "*", "data:", "blob:", "avatars.githubusercontent.com"],
				"font-src": ["'self'", "*", "data:"],
				"connect-src": ["'self'", "*"],
				"media-src": ["'self'", "*"]
			},
		},
		alias: {
			"@/*": "./src/lib/*",
		},
	},

	extensions: ['.svelte', '.svx']
};

export default config;
