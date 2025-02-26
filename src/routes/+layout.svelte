<script lang="ts">
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import { RenderScan } from 'svelte-render-scan';
	import { dev } from '$app/environment';
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
</script>

<ModeWatcher />
<Toaster richColors position="top-center" />
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
