<script lang="ts">
	import Check from 'lucide-svelte/icons/check';
	import { tick } from 'svelte';
	import * as Command from '$lib/components/ui/command/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { cn } from '$lib/utils.js';

	let {
		time_options,
		selected_time = $bindable()
	}: { time_options: string[]; selected_time: string } = $props();

	let open = $state(false);
	let triggerRef = $state<HTMLButtonElement>(null!);

	$effect(() => {
		console.log(selected_time);
	});

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
	<Popover.Trigger bind:ref={triggerRef}>
		{#snippet child({ props })}
			<button
				class="w-[100px] rounded-br-sm rounded-tr-sm bg-background p-2 text-sm active:scale-95 active:opacity-60"
				{...props}
			>
				{selected_time}
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
								selected_time = time;
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
