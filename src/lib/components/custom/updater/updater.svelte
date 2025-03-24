<script lang="ts" module>
	import type { Update } from '@tauri-apps/plugin-updater';

	export type UpdaterProps = {
		title: string;
		dismiss: boolean;
		description: string;
	};

	interface ComponentState {
		update: Update | null;
	}
</script>

<script lang="ts">
	import * as Alert from '$lib/components/ui/alert';
	import { AlertCircle, RefreshCw, X } from '@/assets/icons';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { Button, buttonVariants } from '@/components/ui/button';

	let { title, dismiss = $bindable(false), description }: UpdaterProps = $props();

	let { update } = $state<ComponentState>({
		update: null
	});
</script>

<Alert.Root
	variant="default"
	class="flex flex-col justify-between border-amber-500 bg-amber-50 dark:border-amber-700 dark:bg-amber-500/5"
>
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-1">
			<AlertCircle class="mb-1.5 size-4 text-amber-800 dark:text-amber-300" />
			<Alert.Title class="text-base text-amber-800 dark:text-amber-300"
				>Update Available!</Alert.Title
			>
		</div>
		<Tooltip.Provider>
			<Tooltip.Root>
				<Tooltip.Trigger
					onclick={() => (dismiss = !dismiss)}
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
					<p>Add to library</p>
				</Tooltip.Content>
			</Tooltip.Root>
		</Tooltip.Provider>
	</div>

	<div class="flex items-center justify-between">
		<Alert.Description>A new version 1.23.4 of the application is available.</Alert.Description>
		<Button
			size="sm"
			variant="outline"
			class="border-amber-500 text-amber-700 hover:bg-amber-100 dark:text-amber-200 dark:hover:bg-amber-900 dark:hover:text-amber-100"
		>
			<RefreshCw className="mr-2 h-4 w-4" />
			Update Now
		</Button>
	</div>
</Alert.Root>
