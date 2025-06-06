<script lang="ts">
	import EventCard from './event-card.svelte';
	import { Timeline } from 'svelte-vertical-timeline';
	import { COLLECTIONS } from '@/db/index';
	import type { EventDetails } from '@/db/models/types';
	import { fly } from 'svelte/transition';
	import { quartInOut } from 'svelte/easing';
	import { InfiniteLoader, LoaderState } from 'svelte-infinite';
	import { Badge } from '@/components/ui/badge';
	import * as Alert from '@/components/ui/alert/index.js';
	import { CircleAlert, Plus } from '@/assets/icons';
	import { Button } from '@/components/ui/button';
	import { watch } from 'runed';
	import { Calendar, SearchXIcon } from 'lucide-svelte';

	interface ComponentState {
		refetch: boolean;
		timeout: number;
		infinite_loader: {
			loader_state: LoaderState;
			events: EventDetails[];
			limit: number;
			skip: number;
		};
	}

	export interface EventListProps {
		type: 'upcoming' | 'past';
		search_term: string;
	}

	let { type, search_term = $bindable() }: EventListProps = $props();

	let comp_state = $state<ComponentState>({
		refetch: false,
		timeout: 0,
		infinite_loader: {
			loader_state: new LoaderState(),
			events: [],
			limit: 20,
			skip: 20
		}
	});

	async function loadMore() {
		try {
			comp_state.infinite_loader.skip += comp_state.infinite_loader.limit;
			const skip = comp_state.infinite_loader.limit * comp_state.infinite_loader.skip;

			// If there are less results on the first page (page.server loaded data)
			// than the limit, don't keep trying to fetch more. We're done.
			if (comp_state.infinite_loader.events.length < comp_state.infinite_loader.limit) {
				comp_state.infinite_loader.loader_state.complete();
				return;
			}
			const events_cursor = COLLECTIONS.EVENT_DETAILS_COLLECTION.find(
				{},
				{
					skip: skip,
					limit: comp_state.infinite_loader.limit,
					sort: {
						start_date: type === 'upcoming' ? 1 : -1
					}
				}
			);

			if (!events_cursor.count) {
				comp_state.infinite_loader.loader_state.error();
				comp_state.infinite_loader.skip -= 1;
				return;
			}
			const current_date = new Date();
			const data = events_cursor.fetch().filter((e) => {
				if (type === 'upcoming') {
					return e.start_date > current_date || e.end_date > current_date;
				} else {
					return e.end_date < current_date;
				}
			});

			if (data.length) {
				comp_state.infinite_loader.events.push(...data);
			}

			if (comp_state.infinite_loader.events.length >= data.length) {
				comp_state.infinite_loader.loader_state.complete();
			} else {
				comp_state.infinite_loader.loader_state.loaded();
			}
		} catch (error) {
			console.error(error);
			comp_state.infinite_loader.loader_state.error();
			comp_state.infinite_loader.skip -= 1;
		}
	}

	watch(
		[
			() => COLLECTIONS.EVENT_DETAILS_COLLECTION.isLoading(),
			() => COLLECTIONS.EVENT_DETAILS_COLLECTION.isReady(),
			() => comp_state.refetch,
			() => search_term
		],
		() => {
			const events_cursor = COLLECTIONS.EVENT_DETAILS_COLLECTION.find(
				{
					// apply the searching when search term is truthy
					...(search_term && {
						event_name: {
							$regex: search_term,
							$options: 'i'
						}
					})
				},
				{
					limit: comp_state.infinite_loader.limit,
					sort: {
						start_date: type === 'upcoming' ? 1 : -1 // Changed sorting order
					}
				}
			);

			const current_date = new Date();
			comp_state.infinite_loader.events = events_cursor.fetch().filter((e) => {
				if (type === 'upcoming') {
					return e.start_date > current_date || e.end_date > current_date;
				} else {
					return e.end_date < current_date;
				}
			});
			clearTimeout(comp_state.timeout);
			comp_state.timeout = setTimeout(
				() => (comp_state.refetch = !comp_state.refetch),
				1000
			) as unknown as number;
			return () => {
				events_cursor.cleanup();
				clearTimeout(comp_state.timeout);
			};
		}
	);
</script>

<Timeline style="width: 100%; padding: 0;">
	<InfiniteLoader loaderState={comp_state.infinite_loader.loader_state} triggerLoad={loadMore}>
		{#each comp_state.infinite_loader.events as event, i}
			<div transition:fly={{ y: 20, duration: 200, delay: i * 100, easing: quartInOut }}>
				<EventCard {...event} />
			</div>
		{/each}

		{#if comp_state.infinite_loader.events.length === 0 && !search_term}
			<div class="grid h-[60vh] place-content-center">
				<div class="grid place-items-center gap-4">
					<Calendar class="size-[7rem] text-muted-foreground/80" />
					<div class="grid place-items-center gap-2">
						<h2 class="text-2xl font-medium text-muted-foreground">
							No {type === 'upcoming' ? 'Upcoming' : 'Past'} Events
						</h2>
						<p class="text-muted-foreground">There's no {type} events, why not add one?</p>
						<Button href="/events/create" variant="outline"
							><Plus class="size-4" /> Create One</Button
						>
					</div>
				</div>
			</div>
		{/if}

		{#if comp_state.infinite_loader.events.length === 0 && search_term}
			<div class="grid h-[60vh] place-content-center">
				<div class="grid place-items-center gap-4">
					<Calendar class="size-[7rem] text-muted-foreground/80" />
					<div class="grid place-items-center gap-2">
						<h2 class="text-2xl font-medium text-muted-foreground">No exact matches</h2>
						<p class="text-muted-foreground">There's no events found based on '{search_term}'.</p>
						<Button onclick={() => (search_term = '')} variant="outline"
							><SearchXIcon class="size-4" />Clear search</Button
						>
					</div>
				</div>
			</div>
		{/if}

		{#snippet noData()}
			{#if comp_state.infinite_loader.events.length > 0}
				<Badge class="text-sm" variant="outline">No more data</Badge>
			{/if}
		{/snippet}

		{#snippet loading()}
			<Badge class="text-sm" variant="outline">Loading Events</Badge>
		{/snippet}
		{#snippet error(load)}
			<Alert.Root variant="destructive">
				<CircleAlert class="size-4" />
				<Alert.Description>Error fetching data</Alert.Description>
				<Button onclick={load}>Retry</Button>
			</Alert.Root>
		{/snippet}
	</InfiniteLoader>
</Timeline>
