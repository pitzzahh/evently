<script lang="ts" module>
	import type { Update } from '@tauri-apps/plugin-updater';

	export type UpdaterProps = {
		dismiss: boolean;
		update: Update | null;
	};

	interface ComponentState {
		state: 'idle' | 'processing';
		progress: number;
	}
</script>

<script lang="ts">
	import * as Alert from '@/components/ui/alert';
	import { Download, AlertCircle, RefreshCw, X } from '@/assets/icons';
	import * as Tooltip from '@/components/ui/tooltip';
	import { Button, buttonVariants } from '@/components/ui/button';
	import { installUpdate } from '@/utils/update';
	import { toast } from 'svelte-sonner';
	import { Progress } from '@/components/ui/progress';

	let { dismiss = $bindable(false), update }: UpdaterProps = $props();

	let { progress, state } = $state<ComponentState>({
		state: 'processing',
		progress: 10
	});

	async function handle_update() {
		if (!update) {
			return toast.warning('No update available', {
				description: 'Please check for updates again.'
			});
		}
		state = 'processing';
		installUpdate(
			update,
			true,
			(_p) => {
				progress = _p;
				console.log('Update progress:', progress);
			},
			() => {
				state = 'idle';
				toast.success('Update installed successfully', {
					description: 'The application will now restart.'
				});
			}
		);
	}
</script>

<Alert.Root
	variant="default"
	class="flex flex-col justify-between border-amber-500 bg-amber-50 dark:border-amber-700 dark:bg-amber-500/5"
>
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-1">
			{#if state === 'idle'}
				<AlertCircle class="mb-1.5 size-4 text-amber-800 dark:text-amber-300" />
			{:else}
				<Download class="mb-1.5 size-4 text-amber-800 dark:text-amber-300" />
			{/if}
			<Alert.Title class="text-base text-amber-800 dark:text-amber-300">
				{#if state === 'idle'}
					Update Available!
				{:else}
					Downloading and installing update...
				{/if}
			</Alert.Title>
		</div>
		<Tooltip.Provider>
			<Tooltip.Root>
				<Tooltip.Trigger
					onclick={() => (dismiss = true)}
					disabled={state === 'processing'}
					class={buttonVariants({
						variant: 'outline',
						size: 'sm',
						className:
							'h-6 w-6 -translate-y-2.5 translate-x-2.5 border-amber-500 p-0 text-amber-700 hover:bg-amber-100 dark:text-amber-200 dark:hover:bg-amber-900 dark:hover:text-amber-100'
					})}
				>
					<X class="h-3 w-3" />
				</Tooltip.Trigger>
				<Tooltip.Content>
					<p>Dismiss update notification</p>
				</Tooltip.Content>
			</Tooltip.Root>
		</Tooltip.Provider>
	</div>

	<div class="flex items-center justify-between">
		<Alert.Description>
			{#if state === 'idle'}
				A new version {update?.version ?? 'N/A'} of the application is available.
			{:else}
				Please wait while the update is being installed. The application will restart automatically
				after the update is installed.
			{/if}
		</Alert.Description>
		<Button
			size="sm"
			variant="outline"
			disabled={state === 'processing'}
			onclick={handle_update}
			class="group border-amber-500 text-amber-700 hover:bg-amber-100 dark:text-amber-200 dark:hover:bg-amber-900 dark:hover:text-amber-100"
		>
			<RefreshCw class="mr-2 h-4 w-4 transition-transform duration-200 group-hover:rotate-180" />
			Update Now
		</Button>
	</div>
	{#if state === 'processing'}
		<Progress
			value={progress}
			class="mt-2 h-2 w-full rounded-full bg-amber-200 dark:bg-amber-700"
		/>
	{/if}
</Alert.Root>
