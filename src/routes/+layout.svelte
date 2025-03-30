<script lang="ts">
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import { RenderScan } from 'svelte-render-scan';
	import { dev, browser } from '$app/environment';
	import { toast, Toaster } from 'svelte-sonner';
	import AppNavbar from '@/components/app-navbar.svelte';
	import { getCurrentWindow } from '@tauri-apps/api/window';
	import { Update } from '@tauri-apps/plugin-updater';
	import { Updater } from '@/components/custom/updater';
	import { checkForUpdates } from '@/utils/update';
	import { onMount, tick } from 'svelte';
	import { afterNavigate } from '$app/navigation';

	interface ComponentState {
		div_ref: HTMLDivElement;
		update: Update | null;
		dismiss_update: boolean;
	}

	let { children } = $props();

	let { div_ref, update, dismiss_update } = $state<ComponentState>({
		div_ref: null!,
		update: null,
		dismiss_update: false
	});

	afterNavigate(async () => {
		if (!browser) return;
		await tick();
		div_ref?.scrollTo(0, 0);
	});

	onMount(() => {
		async function check_for_updates() {
			console.log('Checking for updates...');
			update = await checkForUpdates();
			if (update) {
				toast.info('Update available', {
					description: 'Update to latest version for new features and improvements.'
				});
			}
		}
		check_for_updates();
	});
</script>

<svelte:window
	oncontextmenu={(e) => e.preventDefault()}
	onkeydown={async (e) => {
		if (e.key === 'F5') {
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

<div class="flex max-h-screen flex-col">
	<div
		class="to-background fixed top-0 left-0 -z-20 h-[50vh] w-full bg-gradient-to-b from-cyan-200/50 via-pink-100/30 dark:from-sky-700/25 dark:via-pink-600/10"
	></div>
	<ModeWatcher />
	<Toaster richColors position="top-center" />
	{#if dev}
		<RenderScan />
	{/if}
	<AppNavbar />
	<div bind:this={div_ref} class="flex h-full w-full flex-1 justify-center overflow-y-auto">
		<div class="flex h-full flex-1 flex-col gap-4 px-4 py-8 md:max-w-[80%] md:px-0">
			{#if update && !dismiss_update}
				<Updater bind:dismiss={dismiss_update} {update} />
			{/if}
			{@render children()}
		</div>
	</div>
</div>
