import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter(),
		csp: {
			mode: "auto",
			directives: {
				"default-src": ["*"],
				"img-src": ["*"],
				"script-src": ["*"],
				"style-src": ["*"],
				"font-src": ["*"],
				"object-src": ["*"],
				"media-src": ["*"],
				"frame-src": ["*"],
				"connect-src": ["*"],
			},
		},
		alias: {
			"@/*": "./src/lib/*",
			"@routes": "./src/routes",
		},
	}
};

export default config;
