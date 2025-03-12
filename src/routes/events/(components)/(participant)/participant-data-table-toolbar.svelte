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
	import type { Participant } from '@/db/models/types';

	export interface ParticipantDataTableToolbarProps {
		table: Table<Participant>;
		first_names: FilterOption<string>[];
		middle_names: FilterOption<string>[];
		last_names: FilterOption<string>[];
		emails: FilterOption<string>[];
	}
	type ComponentState = {
		search: string;
		where_to_search: keyof Participant;
		timeout?: number;
	};

	let { table, first_names, middle_names, last_names, emails }: ParticipantDataTableToolbarProps =
		$props();

	let comp_state = $state<ComponentState>({
		search: '',
		where_to_search: 'first_name'
	});
	const is_filtered = $derived(table.getState().columnFilters.length > 0);
	const over_attendance_status_col = $derived(table.getColumn('attendance_status'));

	onDestroy(() => {
		clearTimeout(comp_state.timeout);
	});
</script>

<ScrollArea orientation="horizontal" class="scrollbar-hide rounded-none">
	<div class="m-1 flex items-center justify-between space-x-2">
		<div class="flex flex-1 items-center space-x-2">
			<Input
				placeholder="Filter position by {convertToNormalText(comp_state.where_to_search)}..."
				bind:value={
					() => comp_state.search,
					(v) => {
						clearTimeout(comp_state.timeout);
						comp_state.search = v;
						comp_state.timeout = setTimeout(() => {
							table.getColumn(comp_state.where_to_search)?.setFilterValue(v);
						}, 500);
					}
				}
				type="search"
				class="h-8 w-[150px] min-w-[300px] lg:w-min"
			/>
			<DataTableSearchFilter {table} bind:where_to_search={comp_state.where_to_search} />
			{#if over_attendance_status_col}
				<DataTableFacetedFilter
					column={over_attendance_status_col}
					title="Overall Attendance Status"
					options={[
						{
							label: 'Complete',
							value: 'complete'
						},
						{
							label: 'Incomplete',
							value: 'icomplete'
						},
						{
							label: 'Absent',
							value: 'asbent'
						}
					]}
				/>
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
