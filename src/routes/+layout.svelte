<script lang="ts">
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import { RenderScan } from 'svelte-render-scan';
	import { dev } from '$app/environment';
	import { toast, Toaster } from 'svelte-sonner';
	import AppNavbar from '@/components/app-navbar.svelte';
	import { getCurrentWindow } from '@tauri-apps/api/window';
	import { warn, debug, trace, info, error } from '@tauri-apps/plugin-log';

	function forwardConsole(
		fnName: 'log' | 'debug' | 'info' | 'warn' | 'error',
		logger: (message: string) => Promise<void>
	) {
		const original = console[fnName];
		console[fnName] = (message) => {
			original(message);
			logger(message);
		};
	}

	let { children } = $props();

	forwardConsole('log', trace);
	forwardConsole('debug', debug);
	forwardConsole('info', info);
	forwardConsole('warn', warn);
	forwardConsole('error', error);
</script>

<svelte:window
	oncontextmenu={(e) => e.preventDefault()}
	onkeydown={async (e) => {
		if (e.key === 'F5') {
			toast.info('F5 is disabled', {
				description: 'This is a system message, F5 is disabled in this application.'
			});
			e.preventDefault();
		}
		if (e.key === 'F11') {
			await getCurrentWindow().setFullscreen(
				await getCurrentWindow()
					.isFullscreen()
					.then((isFullscreen) => !isFullscreen)
			);
		}
		if (e.key === 'Escape') {
			await getCurrentWindow().setFullscreen(false);
		}
	}}
/>

<ModeWatcher />
<Toaster richColors position="top-center" />
{#if dev}
	<RenderScan />
{/if}
<AppNavbar />
<div class="flex size-full justify-center">
	<div class="flex flex-1 flex-col gap-4 p-4 pt-8 md:max-w-[80%] md:px-0">
		{@render children()}
	</div>
</div>
