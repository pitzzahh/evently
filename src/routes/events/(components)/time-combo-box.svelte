<script lang="ts">
	import { Check, Clock } from '@/assets/icons';
	import { tick } from 'svelte';
	import * as Command from '@/components/ui/command';
	import * as Popover from '@/components/ui/popover';
	import { cn } from '@/utils/styles';

	let {
		time_options,
		selected_time,
		onTimeSelect,
		is_disabled
	}: {
		time_options: string[];
		selected_time: string;
		onTimeSelect: (new_time: string) => void;
		is_disabled?: boolean;
	} = $props();

	let open = $state(false);
	let triggerRef = $state<HTMLButtonElement>(null!);

	// We want to refocus the trigger button when the user selects
	// an item from the list so users can continue navigating the
	// rest of the form with the keyboard.
	function closeAndFocusTrigger() {
		open = false;
		tick().then(() => {
			triggerRef.focus();
		});
	}
</script>

<Popover.Root bind:open>
	<Popover.Trigger bind:ref={triggerRef} disabled={is_disabled}>
		{#snippet child({ props })}
			<button
				class={cn(
					'flex w-[120px] items-center justify-center gap-2 rounded-sm border bg-primary p-2 px-3 py-1 text-sm text-white active:scale-95 active:opacity-60 dark:border-white/20',
					is_disabled && 'cursor-not-allowed'
				)}
				{...props}
			>
				{selected_time}
				<Clock class="size-4" />
			</button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content class="w-[200px] p-0">
		<Command.Root>
			<Command.Input placeholder="Search time..." />
			<Command.List>
				<Command.Empty>No time found</Command.Empty>
				<Command.Group>
					{#each time_options as time}
						<Command.Item
							value={time}
							onSelect={() => {
								onTimeSelect(time);
								closeAndFocusTrigger();
							}}
						>
							<Check class={cn('mr-2 size-4', selected_time !== time && 'text-transparent')} />
							{time}
						</Command.Item>
					{/each}
				</Command.Group>
			</Command.List>
		</Command.Root>
	</Popover.Content>
</Popover.Root>
