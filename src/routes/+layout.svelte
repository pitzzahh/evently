<script lang="ts">
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import { RenderScan } from 'svelte-render-scan';
	import { dev, browser } from '$app/environment';
	import AppSidebar from '@/components/app-sidebar.svelte';
	import { Toaster } from 'svelte-sonner';
	// import * as Breadcrumb from '@/components/ui/breadcrumb/index.js';
	// import { Separator } from '@/components/ui/separator/index.js';
	// import * as Sidebar from '@/components/ui/sidebar/index.js';
	import { warn, debug, trace, info, error } from '@tauri-apps/plugin-log';
	// import { Button } from '@/components/ui/button';
	import AppNavbar from '@/components/app-navbar.svelte';

	let { children } = $props();

	// function forwardConsole(
	// 	fnName: 'log' | 'debug' | 'info' | 'warn' | 'error',
	// 	logger: (message: string) => Promise<void>
	// ) {
	// 	const original = console[fnName];
	// 	console[fnName] = (message) => {
	// 		original(message);
	// 		logger(message);
	// 	};
	// }

	// forwardConsole('log', trace);
	// forwardConsole('debug', debug);
	// forwardConsole('info', info);
	// forwardConsole('warn', warn);
	// forwardConsole('error', error);

	// intercept innerHTML invocation and remove style before div is added to dom
	$effect(() => {
		if (browser) {
			const originalInnerHTML = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');

			Object.defineProperty(Element.prototype, 'innerHTML', {
				set(value: string) {
					if (value.includes('id="svelte-announcer"')) {
						const safeValue = value.replace(/style=".*?"/i, '');
						originalInnerHTML?.set?.call(this, safeValue);
					} else {
						originalInnerHTML?.set?.call(this, value);
					}
				}
			});
		}
	});

	// add styles back in non-CSP violating way
	$effect(() => {
		if (document) {
			const observer = new MutationObserver((mutations) => {
				for (const mutation of mutations) {
					for (const node of mutation.addedNodes) {
						if (node instanceof HTMLDivElement && node.id === 'svelte-announcer') {
							node.style.position = 'absolute';
							node.style.left = '0';
							node.style.top = '0';
							node.style.clip = 'rect(0 0 0 0)';
							node.style.clipPath = 'inset(50%)';
							node.style.overflow = 'hidden';
							node.style.whiteSpace = 'nowrap';
							node.style.width = '1px';
							node.style.height = '1px';
						}
					}
				}
			});

			observer.observe(document, {
				childList: true,
				subtree: true
			});
		}
	});
</script>

<ModeWatcher />
<Toaster richColors position="top-right" />
{#if dev}
	<RenderScan />
{/if}
<!-- <Sidebar.Provider>
	<AppSidebar />
	<Sidebar.Inset> -->
<AppNavbar />
<div class="flex size-full justify-center">
	<div class="flex flex-1 flex-col gap-4 p-4 pt-8 md:max-w-[80%] md:px-0">
		{@render children()}
	</div>
</div>
