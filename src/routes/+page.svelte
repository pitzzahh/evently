<script lang="ts">
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { fade } from 'svelte/transition';
	import EventList from './events/(components)/event-list.svelte';
	import { COLLECTIONS } from '@/db/index';
	import type { Participant } from '@/db/models/types';

	interface ComponentState {
		participants: Participant[];
	}

	let comp_state = $state<ComponentState>({
		participants: []
	});

	$effect(() => {
		const cursor = COLLECTIONS.PARTICIPANT_COLLECTION.find({});
		comp_state.participants = cursor.fetch();
		return () => {
			cursor.cleanup();
		};
	});
</script>

<div in:fade>
	<Tabs.Root value="upcoming">
		<div class="flex items-center justify-between gap-4">
			<h2 class="text-4xl font-semibold">Events</h2>
			<Tabs.List class="grid h-auto w-full max-w-[300px] grid-cols-2">
				<Tabs.Trigger value="upcoming" class="h-auto text-base">Upcoming</Tabs.Trigger>
				<Tabs.Trigger value="past" class="h-auto text-base">Past</Tabs.Trigger>
			</Tabs.List>
		</div>

		{@const contents = ['upcoming', 'past']}
		{#each contents as content (content)}
			<Tabs.Content value={content} class="mt-6">
				<EventList type={content as 'upcoming' | 'past'} />
			</Tabs.Content>
		{/each}
	</Tabs.Root>
</div>
