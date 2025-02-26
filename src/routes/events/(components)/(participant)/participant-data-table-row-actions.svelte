<script lang="ts">
	import { Copy, Ellipsis } from '@/assets/icons';
	import type { Row } from '@tanstack/table-core';
	import * as DropdownMenu from '@/components/ui/dropdown-menu/index.js';
	import Button from '@/components/ui/button/button.svelte';
	import { recursiveDropdown } from '@/components/custom/snippets';
	import type { Participant } from '@/db/models/types';

	let { row }: { row: Row<Participant> } = $props();
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="ghost" class="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
				<Ellipsis />
				<span class="sr-only">Open Menu</span>
			</Button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content class="w-auto" align="end">
		{@const current_archive = row.original}
		<DropdownMenu.Separator />
		<DropdownMenu.Sub>
			<DropdownMenu.SubTrigger>
				<Copy />
				Copy</DropdownMenu.SubTrigger
			>
			<DropdownMenu.SubContent class="w-auto">
				{#each Object.entries(current_archive) as [key, value]}
					{@render recursiveDropdown({ value, key })}
				{/each}
			</DropdownMenu.SubContent>
		</DropdownMenu.Sub>
		<DropdownMenu.Separator />
		<DropdownMenu.Separator />
	</DropdownMenu.Content>
</DropdownMenu.Root>
