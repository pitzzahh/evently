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
      middle_initials: FilterOption<string>[];
		last_names: FilterOption<string>[];
		emails: FilterOption<string>[];
	}
	type ComponentState = {
		search: string;
		where_to_search: keyof Participant;
		timeout?: number;
	};

	let {
		table,
		first_names,
		middle_initials,
		last_names,
		emails
	}: ParticipantDataTableToolbarProps = $props();

	let comp_state = $state<ComponentState>({
		search: '',
		where_to_search: 'first_name'
	});
	const is_filtered = $derived(table.getState().columnFilters.length > 0);
	const first_name_col = $derived(table.getColumn('first_name'));
	const middle_initial_col = $derived(table.getColumn('middle_initial'));
	const last_name_col = $derived(table.getColumn('last_name'));
	const email_col = $derived(table.getColumn('email'));

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
			{#if first_name_col}
				<DataTableFacetedFilter column={first_name_col} title="First Name" options={first_names} />
			{/if}
			{#if middle_initial_col}
				<DataTableFacetedFilter
					column={middle_initial_col}
					title="Middle Initial"
					options={middle_initials}
				/>
			{/if}
			{#if last_name_col}
				<DataTableFacetedFilter column={last_name_col} title="Last Name" options={last_names} />
			{/if}
			{#if email_col}
				<DataTableFacetedFilter column={email_col} title="Email" options={emails} />
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
