<script lang="ts" generics="TData">
	import {
		ChevronRight,
		ChevronLeft,
		ChevronsRight,
		ChevronsLeft,
		RefreshCw,
	} from "@/assets/icons";
	import type { Table } from "@tanstack/table-core";
	import * as Select from "@/components/ui/select/index.js";
	import { ScrollArea } from "@/components//ui/scroll-area";
	import { Separator } from "@/components/ui/separator";
	import { Button } from "@/components/ui/button/index.js";
	import { Badge } from "@/components/ui/badge/index.js";
	export interface DataTablePaginationProps<TData> {
		table: Table<TData>;
		fetching?: boolean;
	}
	let { table, fetching = $bindable(false) }: DataTablePaginationProps<TData> =
		$props();
</script>

<ScrollArea orientation="horizontal">
	<div class="flex items-center gap-4 px-2 py-2">
		<div class="text-muted-foreground text-sm whitespace-nowrap">
			{table.getFilteredSelectedRowModel().rows.length} of
			{table.getFilteredRowModel().rows.length} row(s) selected.
		</div>
		{#if fetching}
			<Badge class="whitespace-nowrap text-ellipsis"
				><RefreshCw class="mr-2 h-4 w-4 animate-spin" /> Fetching more data...</Badge
			>
		{/if}
		<Separator orientation="vertical" />
		<div class="flex items-center gap-4 ml-auto">
			<div class="flex items-center space-x-2">
				<p class="text-sm font-medium shrink-0">Rows per page</p>
				<Select.Root
					allowDeselect={false}
					type="single"
					value={`${table.getState().pagination.pageSize}`}
					onValueChange={(value) => {
						table.setPageSize(Number(value));
					}}
				>
					<Select.Trigger class="h-8 w-[70px]">
						{String(table.getState().pagination.pageSize)}
					</Select.Trigger>
					<Select.Content side="top" class="max-h-md">
						{#each [5, 10, 25, Math.round(table.getRowCount() / 4), Math.round(table.getRowCount() / 2)]
							.filter((size, i, arr) => size > 0 && arr.indexOf(size) === i)
							.sort((a, b) => a - b) as pageSize (pageSize)}
							<Select.Item value={`${pageSize}`}>
								{pageSize}
							</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>
			<div
				class="flex items-center justify-center text-sm font-medium shrink-0"
			>
				Page {table.getState().pagination.pageIndex + 1} of
				{table.getPageCount()}
			</div>
			<div class="flex items-center space-x-2">
				<Button
					variant="outline"
					class="hidden size-8 p-0 lg:flex"
					onclick={() => table.setPageIndex(0)}
					disabled={!table.getCanPreviousPage()}
				>
					<span class="sr-only">Go to first page</span>
					<ChevronsLeft />
				</Button>
				<Button
					variant="outline"
					class="size-8 p-0"
					onclick={() => table.previousPage()}
					disabled={!table.getCanPreviousPage()}
				>
					<span class="sr-only">Go to previous page</span>
					<ChevronLeft />
				</Button>
				<Button
					variant="outline"
					class="size-8 p-0"
					onclick={() => table.nextPage()}
					disabled={!table.getCanNextPage()}
				>
					<span class="sr-only">Go to next page</span>
					<ChevronRight />
				</Button>
				<Button
					variant="outline"
					class="hidden size-8 p-0 lg:flex"
					onclick={() => table.setPageIndex(table.getPageCount() - 1)}
					disabled={!table.getCanNextPage()}
				>
					<span class="sr-only">Go to last page</span>
					<ChevronsRight />
				</Button>
			</div>
		</div>
	</div>
</ScrollArea>
