<script lang="ts">
	import EventCard from './event-card.svelte';
	import { Timeline } from 'svelte-vertical-timeline';
	import { COLLECTIONS } from '@/db/index';
	import type { EventDetails } from '@/db/models/types';
	import { watch } from 'runed';

	interface ComponentState {
		events: EventDetails[];
	}

	export interface EventListProps {
		type: 'upcoming' | 'past';
	}

	let { type }: EventListProps = $props();

	let comp_state = $state<ComponentState>({
		events: []
	});

	watch(
		() => COLLECTIONS.EVENT_DETAILS_COLLECTION.isLoading,
		() => {
			const now = new Date();
			const events = COLLECTIONS.EVENT_DETAILS_COLLECTION.find(
				{
					start_date: type === 'upcoming' ? { $gte: now } : { $lt: now }
				},
				{
					sort: {
						start_date: type === 'upcoming' ? 1 : -1
					}
				}
			);
			comp_state.events = events.fetch();
			console.log('comp_state.events', comp_state.events);
		}
	);
</script>

<Timeline style="width: 100%;  padding: 0;">
	{#each comp_state.events as event}
		<EventCard {...event} />
	{/each}
</Timeline>
