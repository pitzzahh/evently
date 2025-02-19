import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [vitePreprocess()],
	kit: {
		adapter: adapter(),
		csp: {
			directives: {
				"default-src": ["*", "unsafe-inline"],
				"style-src": ["self", "unsafe-inline"],
				"img-src": [
					"self",
					"githubusercontent.com",
					"*.githubusercontent.com",
					"data:"
				],
				"connect-src": ["self", "http://127.0.0.1:8090"],
			},
		},
		alias: {
			"@/*": "./src/lib/*",
		},
	},

	extensions: ['.svelte']
};

export default config;
