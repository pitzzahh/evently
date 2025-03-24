<script lang="ts">
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import { RenderScan } from 'svelte-render-scan';
	import { dev } from '$app/environment';
	import { toast, Toaster } from 'svelte-sonner';
	import AppNavbar from '@/components/app-navbar.svelte';
	import { getCurrentWindow } from '@tauri-apps/api/window';
	import NewAppVerAlert from '@/components/new-app-ver-alert.svelte';

	let { children } = $props();
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
	<div class="flex flex-1 flex-col gap-4 p-4 md:max-w-[80%] md:px-0">
		<NewAppVerAlert />
		{@render children()}
	</div>
</div>
