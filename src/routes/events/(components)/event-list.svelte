<script lang="ts">
	import EventCard from './event-card.svelte';
	import { Timeline } from 'svelte-vertical-timeline';
	import { COLLECTIONS } from '@/db/index';
	import type { EventDetails } from '@/db/models/types';
	import { watch } from 'runed';
	import { fly } from 'svelte/transition';
	import { quartInOut } from 'svelte/easing';
	import { InfiniteLoader, loaderState } from 'svelte-infinite';
	import { Badge } from '@/components/ui/badge';
	import * as Alert from '@/components/ui/alert/index.js';
	import { CircleAlert } from '@/assets/icons';
	import Button from '@/components/ui/button/button.svelte';

	interface ComponentState {
		infinite_loader: {
			events: EventDetails[];
			limit: number;
			skip: number;
		};
	}

	export interface EventListProps {
		type: 'upcoming' | 'past';
	}

	let { type }: EventListProps = $props();

	let comp_state = $state<ComponentState>({
		infinite_loader: {
			events: [],
			limit: 20,
			skip: 20
		}
	});

	async function loadMore() {
		try {
			comp_state.infinite_loader.skip += comp_state.infinite_loader.limit;
			const skip = comp_state.infinite_loader.limit * (comp_state.infinite_loader.skip - 1);

			// If there are less results on the first page (page.server loaded data)
			// than the limit, don't keep trying to fetch more. We're done.
			if (comp_state.infinite_loader.events.length < comp_state.infinite_loader.limit) {
				loaderState.complete(); // <--- using loaderState
				return;
			}

			const events_collection_cursor = COLLECTIONS.EVENT_DETAILS_COLLECTION.find(
				{},
				{
					skip: skip,
					limit: comp_state.infinite_loader.limit
				}
			);

			// Ideally, like most paginated endpoints, this should return the data
			// you've requested for your page, as well as the total amount of data
			// available to page through

			if (!events_collection_cursor.count) {
				loaderState.error(); // <--- using loaderState

				// On errors, set the pageNumber back so we can retry
				// that page's data on the next 'loadMore' attempt
				comp_state.infinite_loader.skip -= 1;
				return;
			}
			const data = events_collection_cursor.fetch();

			// If we've successfully received data, push it to the reactive state variable
			if (data.length) {
				comp_state.infinite_loader.events.push(...data);
			}

			// If there are more (or equal) number of items loaded as are totally available
			// from the API, don't keep trying to fetch more. We're done.
			if (comp_state.infinite_loader.events.length >= data.length) {
				loaderState.complete(); // <--- using loaderState
			} else {
				loaderState.loaded(); // <--- using loaderState
			}
		} catch (error) {
			console.error(error);
			loaderState.error(); // <--- using loaderState
			comp_state.infinite_loader.skip -= 1;
		}
	}

	watch(
		() => COLLECTIONS.EVENT_DETAILS_COLLECTION.isLoading,
		() => {
			const now = new Date();
			const events_cursor = COLLECTIONS.EVENT_DETAILS_COLLECTION.find(
				{
					end_date: type === 'upcoming' ? { $gte: now } : { $lte: now }
				},
				{
					sort: {
						start_date: type === 'upcoming' ? 1 : -1
					},
					limit: comp_state.infinite_loader.limit
				}
			);
			comp_state.infinite_loader.events = events_cursor
				.fetch()
				.slice(0, comp_state.infinite_loader.skip);
			return () => events_cursor.cleanup();
		}
	);
</script>

<Timeline style="width: 100%;  padding: 0;;">
	<InfiniteLoader triggerLoad={loadMore}>
		{#each comp_state.infinite_loader.events as event, i}
			<div transition:fly={{ y: 100, duration: 400, delay: i * 100, easing: quartInOut }}>
				<EventCard {...event} />
			</div>
		{/each}

		{#snippet noData()}
			<Badge variant="secondary">Nore More Data</Badge>
		{/snippet}

		<!-- 3. There are a few optional snippets for customizing what is shown at the bottom
				 of the scroller in various states, see the 'Snippets' section for more details -->
		{#snippet loading()}
			<Badge class="text-sm">Loading...</Badge>
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
