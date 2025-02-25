<script lang="ts" generics="TData, TValue, FilterType = string">
	import { CirclePlus, Check } from '@/assets/icons';
	import type { Column } from '@tanstack/table-core';
	import { SvelteSet } from 'svelte/reactivity';
	import * as Command from '@/components/ui/command/index.js';
	import * as Popover from '@/components/ui/popover/index.js';
	import { Button } from '@/components/ui/button/index.js';
	import { cn } from '@/utils/style/utils';
	import { Separator } from '@/components/ui/separator/index.js';
	import { Badge } from '@/components/ui/badge/index.js';
	import type { FilterOption } from '@/types/filter';
	import { InfiniteLoader, loaderState } from 'svelte-infinite';

	export type DataTableFacetedFilterProps<TData, TValue, FilterType> = {
		column: Column<TData, TValue>;
		title: string;
		options: FilterOption<FilterType>[];
	};

	type ComponentState = {
		root_element: HTMLElement | undefined;
		loaded_data: number;
		all_items: DataTableFacetedFilterProps<TData, TValue, FilterType>['options'];
		processing: boolean;
	};

	let { column, title, options }: DataTableFacetedFilterProps<TData, TValue, FilterType> = $props();

	const LOAD_LIMIT = 20;
	const facets = $derived(column?.getFacetedUniqueValues());
	const selectedValues = $derived(new SvelteSet(column?.getFilterValue() as FilterType[]));

	let comp_state = $state<ComponentState>({
		root_element: undefined,
		loaded_data: LOAD_LIMIT,
		all_items: options.slice(0, LOAD_LIMIT),
		processing: false
	});

	async function loadMore() {
		try {
			const SKIP = comp_state.loaded_data;
			const TAKE = SKIP + LOAD_LIMIT;

			// If there are less results on the first page than the limit, we're done
			if (comp_state.all_items.length < LOAD_LIMIT) {
				return loaderState.complete();
			}

			// Slice the data from options based on the current comp_state.loaded_data
			const newItems = options.slice(SKIP, TAKE);
			comp_state.all_items.push(...newItems);
			comp_state.loaded_data += LOAD_LIMIT;

			if (SKIP >= options.length) {
				return loaderState.complete();
			} else {
				loaderState.loaded();
			}
		} catch (error) {
			console.error(error);
			loaderState.error();
		}
	}
</script>

<Popover.Root>
	<Popover.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="outline" size="sm" class="h-8 border-dashed">
				<CirclePlus />
				{title}
				{#if comp_state.all_items.some((opt) => selectedValues.has(opt.value))}
					<Separator orientation="vertical" class="mx-2 h-4" />
					<Badge variant="secondary" class="rounded-sm px-1 font-normal lg:hidden">
						{selectedValues.size}
					</Badge>
					<div class="hidden space-x-1 lg:flex">
						{#if selectedValues.size > 5}
							<Badge variant="secondary" class="rounded-sm px-1 font-normal">
								{selectedValues.size} selected
							</Badge>
						{:else}
							{#each comp_state.all_items.filter((opt) => selectedValues.has(opt.value)) as option}
								<Badge variant="secondary" class="rounded-sm px-1 font-normal">
									{option.label}
								</Badge>
							{/each}
						{/if}
					</div>
				{/if}
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content class="w-auto p-0" align="start">
		<Command.Root>
			<Command.Input placeholder="Search {title}	" />
			<Command.List>
				<Command.Empty>No results found.</Command.Empty>
				<Command.Group>
					<div bind:this={comp_state.root_element}>
						<InfiniteLoader
							triggerLoad={loadMore}
							loopDetectionTimeout={2500}
							intersectionOptions={{
								root: comp_state.root_element
							}}
						>
							{#each comp_state.all_items.filter((f) => facets?.get(f.value)) as option}
								{@const isSelected = selectedValues.has(option.value)}
								<Command.Item
									onSelect={() => {
										if (isSelected) {
											selectedValues.delete(option.value);
										} else {
											selectedValues.add(option.value);
										}
										const filterValues = Array.from(selectedValues);
										column?.setFilterValue(filterValues.length ? filterValues : undefined);
									}}
								>
									<div
										class={cn(
											'mr-2 flex size-4 items-center justify-center rounded-sm border border-primary',
											isSelected
												? 'bg-primary text-primary-foreground'
												: 'opacity-50 [&_svg]:invisible'
										)}
									>
										<Check class="size-4" />
									</div>
									{#if option.icon}
										{@const Icon = option.icon}
										<Icon class="text-muted-foreground" />
									{/if}

									<span>{option.label}</span>
									{#if facets?.get(option.value)}
										<span class="ml-auto flex size-4 items-center justify-center font-mono text-xs">
											{facets.get(option.value)}
										</span>
									{/if}
								</Command.Item>
							{/each}
							{#snippet loading()}
								Loading...
							{/snippet}
							{#snippet error(load)}
								<div>Error fetching data</div>
								<button onclick={load}>Retry</button>
							{/snippet}
							{#snippet noData()}
								<span class="text-xs text-muted-foreground">No more {title}</span>
							{/snippet}
							{#snippet coolingOff()}
								<span class="max-w-[10rem] break-words text-center text-xs text-muted-foreground"
									>Loop detected while loading more {title}, fixing... please wait and try again</span
								>
							{/snippet}
						</InfiniteLoader>
					</div>
				</Command.Group>
			</Command.List>
			{#if selectedValues.size > 0}
				<Command.Separator />
				<Command.Group>
					<Command.Item
						onSelect={() => column?.setFilterValue(undefined)}
						class="justify-center text-center"
					>
						Clear filters
					</Command.Item>
				</Command.Group>
			{/if}
		</Command.Root>
	</Popover.Content>
</Popover.Root>
