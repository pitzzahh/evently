<script lang="ts">
	import { X } from '@/assets/icons';
	import type { Table } from '@tanstack/table-core';
	import { Button } from '@/components/ui/button';
	import { ScrollArea } from '@/components//ui/scroll-area';
	import { Input } from '@/components/ui/input/index.js';
	import {
		DataTableFacetedFilter,
		DataTableViewOptions,
		DataTableSearchFilter
	} from '@/components/custom/data-table';
	import type { FilterOption } from '@/types/filter';
	import { onDestroy } from 'svelte';
	import { convertToNormalText } from '@/utils/text';
	import type { ParticipantAttendance } from '@/db/models/types';

	export interface ParticipantDataTableToolbarProps {
		table: Table<ParticipantAttendance>;
		days_opt: FilterOption<string>[];
		setGlobalFilter: (value: string) => void;
	}
	type ComponentState = {
		search: string;
		timeout?: ReturnType<typeof setTimeout>;
	};

	let { table, days_opt, setGlobalFilter }: ParticipantDataTableToolbarProps = $props();

	let comp_state = $state<ComponentState>({
		search: '',
		timeout: undefined
	});
	const is_filtered = $derived(table.getState().columnFilters.length > 0);
	const day_col = $derived(table.getColumn('day'));

	onDestroy(() => {
		clearTimeout(comp_state.timeout);
	});
</script>

<ScrollArea orientation="horizontal" class="scrollbar-hide rounded-none">
	<div class="m-1 flex items-center justify-between space-x-2">
		<div class="flex flex-1 items-center space-x-2">
			<Input
				placeholder="Search participant"
				value={(table.getState().globalFilter as string) ?? ''}
				onchange={(e) => {
					setGlobalFilter(e.currentTarget.value);
				}}
				oninput={(e) => {
					setGlobalFilter(e.currentTarget.value);
				}}
				type="search"
				class="h-8 w-[150px] min-w-[300px] lg:w-min"
			/>
			{#if day_col && days_opt.length > 0}
				<DataTableFacetedFilter column={day_col} title="Day" options={days_opt} />
			{/if}

			{#if is_filtered}
				<Button
					variant="ghost"
					onclick={() => {
						comp_state.search = '';
						table.resetColumnFilters();
					}}
					class="h-8 px-2 lg:px-3"
				>
					Reset
					<X />
				</Button>
			{/if}
		</div>
		<DataTableViewOptions {table} />
	</div>
</ScrollArea>
