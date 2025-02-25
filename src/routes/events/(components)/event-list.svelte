<script lang="ts">
	import EventCard from './event-card.svelte';
	import { Timeline } from 'svelte-vertical-timeline';
	import { COLLECTIONS } from '@/db/index';
	import type { EventDetails } from '@/db/models/types';

	interface ComponentState {
		events: EventDetails[];
	}

	let comp_state = $state<ComponentState>({
		events: []
	});

	$effect(() => {
		const cursor = COLLECTIONS.EVENT_DETAILS_COLLECTION.find({});
		comp_state.events = cursor.fetch();
		return () => {
			cursor.cleanup();
		};
	});
</script>

<Timeline style="width: 100%;  padding: 0;">
	{#each comp_state.events as event}
		<EventCard {...event} />
	{/each}
</Timeline>
