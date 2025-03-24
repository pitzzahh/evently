<script lang="ts">
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import { RenderScan } from 'svelte-render-scan';
	import { dev } from '$app/environment';
	import { toast, Toaster } from 'svelte-sonner';
	import AppNavbar from '@/components/app-navbar.svelte';
	import { getCurrentWindow } from '@tauri-apps/api/window';
	import type { Update } from '@tauri-apps/plugin-updater';
	import { Updater } from '@/components/custom/updater';

	interface ComponentState {
		update: Update | null;
		dismiss_update_notification: boolean;
	}

	let comp_state = $state<ComponentState>({
		update: null,
		dismiss_update_notification: false
	});

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

{#if comp_state.update && !comp_state.dismiss_update_notification}
	<Updater
		title="Update Available"
		description="A new version of the app is available. Please restart the app to update."
		bind:dismiss={comp_state.dismiss_update_notification}
	/>
{/if}
<Updater
	title="Update Available"
	description="A new version of the app is available. Please restart the app to update."
	bind:dismiss={comp_state.dismiss_update_notification}
/>
<AppNavbar />
<div class="flex size-full justify-center">
	<div class="flex flex-1 flex-col gap-4 p-4 pt-8 md:max-w-[80%] md:px-0">
		{@render children()}
	</div>
</div>
