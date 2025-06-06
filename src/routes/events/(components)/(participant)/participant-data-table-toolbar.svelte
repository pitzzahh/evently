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
		setGlobalFilter: (value: string) => void;
	}
	type ComponentState = {
		search: string;
		where_to_search: keyof Participant;
		timeout?: ReturnType<typeof setTimeout>;
	};

	let { table, setGlobalFilter }: ParticipantDataTableToolbarProps = $props();

	let comp_state = $state<ComponentState>({
		search: '',
		where_to_search: 'first_name',
		timeout: undefined
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
							value: 'incomplete'
						},
						{
							label: 'Absent',
							value: 'absent'
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
