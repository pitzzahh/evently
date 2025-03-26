<script lang="ts" generics="TData, TValue">
	import {
		type ColumnDef,
		type ColumnFiltersState,
		type PaginationState,
		type RowSelectionState,
		type SortingState,
		type VisibilityState,
		getCoreRowModel,
		getFacetedRowModel,
		getFacetedUniqueValues,
		getFilteredRowModel,
		getPaginationRowModel,
		getSortedRowModel
	} from '@tanstack/table-core';
	import { DataTablePagination } from '.';
	import { createSvelteTable } from '@/components/ui/data-table/data-table.svelte.js';
	import { FlexRender } from '@/components/ui/data-table';
	import * as DataTable from '@/components/ui/table/index.js';
	import type { Snippet } from 'svelte';
	import type { Table } from '@tanstack/table-core';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';

	interface DataTableProps {
		columns: ColumnDef<TData, TValue>[];
		data: TData[];
		data_table_toolbar?: Snippet<
			[{ table: Table<TData>; setGlobalFilter: (value: string) => void }]
		>;
		floating_bar?: Snippet<[{ table: Table<TData> }]>;
		fetching?: boolean;
	}

	let {
		columns,
		data,
		data_table_toolbar,
		fetching = $bindable(false),
		floating_bar
	}: DataTableProps = $props();

	let rowSelection = $state<RowSelectionState>({});
	let columnVisibility = $state<VisibilityState>({});
	let columnFilters = $state<ColumnFiltersState>([]);
	let sorting = $state<SortingState>([]);
	let pagination = $state<PaginationState>({ pageIndex: 0, pageSize: 10 });
	let globalFilter = $state('');

	const table = createSvelteTable({
		get data() {
			return data;
		},
		state: {
			get globalFilter() {
				return globalFilter;
			},
			get sorting() {
				return sorting;
			},
			get columnVisibility() {
				return columnVisibility;
			},
			get rowSelection() {
				return rowSelection;
			},
			get columnFilters() {
				return columnFilters;
			},
			get pagination() {
				return pagination;
			}
		},
		columns,
		enableRowSelection: true,
		onRowSelectionChange: (updater) => {
			if (typeof updater === 'function') {
				rowSelection = updater(rowSelection);
			} else {
				rowSelection = updater;
			}
		},
		onSortingChange: (updater) => {
			if (typeof updater === 'function') {
				sorting = updater(sorting);
			} else {
				sorting = updater;
			}
		},
		onColumnFiltersChange: (updater) => {
			if (typeof updater === 'function') {
				columnFilters = updater(columnFilters);
			} else {
				columnFilters = updater;
			}
		},
		onColumnVisibilityChange: (updater) => {
			if (typeof updater === 'function') {
				columnVisibility = updater(columnVisibility);
			} else {
				columnVisibility = updater;
			}
		},
		onPaginationChange: (updater) => {
			if (typeof updater === 'function') {
				pagination = updater(pagination);
			} else {
				pagination = updater;
			}
		},
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFacetedRowModel: getFacetedRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValues()
	});
</script>

{#if data_table_toolbar}
	{@render data_table_toolbar?.({ table, setGlobalFilter: (value) => (globalFilter = value) })}
{/if}

{#if floating_bar && table.getFilteredSelectedRowModel().rows.length > 0}
	{@render floating_bar({ table })}
{/if}

<ScrollArea class="grid h-full w-full grid-cols-1 overflow-auto">
	<div class="rounded-md border">
		<DataTable.Root>
			<DataTable.Header>
				{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
					<DataTable.Row>
						{#each headerGroup.headers as header (header.id)}
							<DataTable.Head colspan={header.colSpan}>
								{#if !header.isPlaceholder}
									<FlexRender
										content={header.column.columnDef.header}
										context={header.getContext()}
									/>
								{/if}
							</DataTable.Head>
						{/each}
					</DataTable.Row>
				{/each}
			</DataTable.Header>
			<DataTable.Body>
				{#each table.getRowModel().rows as row (row.id)}
					<DataTable.Row data-state={row.getIsSelected() && 'selected'}>
						{#each row.getVisibleCells() as cell (cell.id)}
							<DataTable.Cell>
								<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
							</DataTable.Cell>
						{/each}
					</DataTable.Row>
				{:else}
					<DataTable.Row>
						<DataTable.Cell colspan={columns.length} class="h-24 text-center">
							No results.
						</DataTable.Cell>
					</DataTable.Row>
				{/each}
			</DataTable.Body>
		</DataTable.Root>

		<DataTablePagination {table} bind:fetching />
	</div>
</ScrollArea>
