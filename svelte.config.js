import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter(),
		alias: {
			"@/*": "./src/lib/*",
			"@routes": "./src/routes",
		},
		csp: {
			directives: {
				'script-src': ['self', 'unsafe-inline', 'http://tauri.localhost', 'http://localhost'],
				'connect-src': ['self', 'unsafe-inline', 'unsafe-eval', 'http://localhost'],
				'img-src': ['self', 'data:'],
				'style-src': ['self', 'unsafe-inline', 'http://localhost', 'http://tauri.localhost'],
			}
		}
	}
};

export default config;
