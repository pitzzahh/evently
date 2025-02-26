<script lang="ts">
	import EventCard from './event-card.svelte';
	import { Timeline } from 'svelte-vertical-timeline';
	import { COLLECTIONS } from '@/db/index';
	import type { EventDetails } from '@/db/models/types';
	import { fly } from 'svelte/transition';
	import { quartInOut } from 'svelte/easing';
	import { InfiniteLoader, loaderState } from 'svelte-infinite';
	import { Badge } from '@/components/ui/badge';
	import * as Alert from '@/components/ui/alert/index.js';
	import { CircleAlert } from '@/assets/icons';
	import { Button } from '@/components/ui/button';
	import type { Selector } from '@signaldb/core';
	import { watch } from 'runed';

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
			const skip = comp_state.infinite_loader.limit * comp_state.infinite_loader.skip;

			// If there are less results on the first page (page.server loaded data)
			// than the limit, don't keep trying to fetch more. We're done.
			if (comp_state.infinite_loader.events.length < comp_state.infinite_loader.limit) {
				loaderState.complete();
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
				loaderState.error();
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
				loaderState.complete();
			} else {
				loaderState.loaded();
			}
		} catch (error) {
			console.error(error);
			loaderState.error();
			comp_state.infinite_loader.skip -= 1;
		}
	}

	watch(
		[
			() => COLLECTIONS.EVENT_DETAILS_COLLECTION.isLoading(),
			() => COLLECTIONS.EVENT_DETAILS_COLLECTION.isReady()
		],
		() => {
			const events_cursor = COLLECTIONS.EVENT_DETAILS_COLLECTION.find(
				{},
				{
					limit: comp_state.infinite_loader.limit,
					sort: {
						start_date: type === 'upcoming' ? -1 : 1
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

			$inspect(comp_state.infinite_loader.events);
			return () => events_cursor.cleanup();
		}
	);
</script>

<Timeline style="width: 100%;  padding: 0;">
	<InfiniteLoader triggerLoad={loadMore}>
		{#each comp_state.infinite_loader.events as event, i}
			<div transition:fly={{ y: 100, duration: 400, delay: i * 100, easing: quartInOut }}>
				<EventCard {...event} />
			</div>
		{/each}

		{#snippet noData()}
			<Badge variant="secondary">Nore More Data</Badge>
		{/snippet}

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
