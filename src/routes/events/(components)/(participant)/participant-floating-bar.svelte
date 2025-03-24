<script lang="ts">
	import type { Table } from '@tanstack/table-core';
	import type { Participant } from '@/db/models/types';
	import { Separator } from '@/components/ui/separator';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { Trash, X } from '@/assets/icons';
	import { fly } from 'svelte/transition';
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { COLLECTIONS } from '@/db';

	export interface ParticipantDataTableToolbarProps {
		table: Table<Participant>;
	}
	type ComponentState = {
		dialog_open: boolean;
	};

	let { table }: ParticipantDataTableToolbarProps = $props();

	let comp_state = $state<ComponentState>({
		dialog_open: false
	});

	const selected_rows = $derived(table.getFilteredSelectedRowModel().rows);

	function handleDeleteSelectedRows() {
		selected_rows.forEach((row) => {
			const participant_id = row.original.id;
			COLLECTIONS.PARTICIPANT_COLLECTION.removeOne({
				id: participant_id
			});

			COLLECTIONS.ATTENDANCE_RECORDS_COLLECTION.removeMany({
				participant_id
			});
		});
		comp_state.dialog_open = false;
		table.toggleAllRowsSelected(false);
	}
</script>

<svelte:document
	onkeydown={(e) => {
		if (e.key === 'Escape') {
			table.toggleAllRowsSelected(false);
		}
	}}
/>

<div
	in:fly={{ y: 20 }}
	out:fly={{ y: 20 }}
	class="fixed inset-x-0 bottom-6 z-50 mx-auto w-fit rounded-lg border bg-background p-3"
>
	<div class="flex gap-2">
		<div class="flex h-10 items-center rounded-md border-2 border-dashed pl-4 pr-2">
			<span class="whitespace-nowrap text-xs">
				{selected_rows.length} selected
			</span>
			<Separator orientation="vertical" class="ml-2 mr-1" />

			<Tooltip.Provider>
				<Tooltip.Root>
					<Tooltip.Trigger
						onclick={() => table.toggleAllRowsSelected(false)}
						class={buttonVariants({
							variant: 'ghost',
							size: 'icon',
							class: 'size-5 hover:border'
						})}
					>
						<X class="size-3.5 shrink-0" aria-hidden="true" /></Tooltip.Trigger
					>
					<Tooltip.Content
						class="font-mediun flex items-center border bg-accent px-2 py-1 text-foreground dark:bg-zinc-900"
					>
						<p class="mr-2">Clear selection</p>
						<kbd class={buttonVariants({ variant: 'outline', size: 'sm' })}>Esc</kbd>
					</Tooltip.Content>
				</Tooltip.Root>
			</Tooltip.Provider>
		</div>

		<Separator orientation="vertical" class="ml-2 mr-1" />

		<div>
			<Button
				size="icon"
				class=" text-red-600 hover:bg-red-600/20 hover:text-red-600"
				variant="ghost"
				onclick={() => (comp_state.dialog_open = true)}
				><Trash />
			</Button>
		</div>
	</div>
</div>

<Dialog.Root
	open={comp_state.dialog_open}
	onOpenChange={(value) => (comp_state.dialog_open = value)}
>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Are you sure?</Dialog.Title>
			<Dialog.Description>
				This action cannot be undone. This will permanently delete participant/s data in the
				application
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (comp_state.dialog_open = false)}>Cancel</Button>
			<Button
				variant="default"
				class="bg-red-600 text-white hover:bg-red-600/90 hover:text-white"
				onclick={handleDeleteSelectedRows}>Delete</Button
			>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
