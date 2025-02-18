<script lang="ts" generics="TData">
	import { Settings2 } from "@/assets/icons";
	import type { Table } from "@tanstack/table-core";
	import { buttonVariants } from "@/components/ui/button/index.js";
	import * as DropdownMenu from "@/components/ui/dropdown-menu/index.js";
	import { untrack } from "svelte";
	interface Props {
		table: Table<TData>;
		default_hidden_columns?: (keyof TData)[];
	}
	let { table, default_hidden_columns = $bindable([]) }: Props = $props();

	$effect(() => {
		if (!default_hidden_columns) return;
		untrack(() => {
			table.getAllColumns().forEach((col) => {
				if (default_hidden_columns.includes(col.id as keyof TData)) {
					col.toggleVisibility(false);
				}
			});
		});
	});
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger
		class={buttonVariants({
			variant: "outline",
			size: "sm",
			class: "ml-auto h-8 flex",
		})}
	>
		<Settings2 />
		View
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		<DropdownMenu.Group>
			<DropdownMenu.GroupHeading>Toggle columns</DropdownMenu.GroupHeading>
			<DropdownMenu.Separator />
			{#each table
				.getAllColumns()
				.filter((col) => typeof col.accessorFn !== "undefined" && col.getCanHide()) as column}
				<DropdownMenu.CheckboxItem
					bind:checked={() => column.getIsVisible(),
					(v) => {
						column.toggleVisibility(!!v);
						default_hidden_columns = table
							.getAllColumns()
							.filter((col) => !col.getIsVisible())
							.map((col) => col.id as keyof TData);
					}}
					class="capitalize"
				>
					{column.id}
				</DropdownMenu.CheckboxItem>
			{/each}
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>
