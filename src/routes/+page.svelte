<script lang="ts">
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { fade } from 'svelte/transition';
	import EventList from './events/(components)/event-list.svelte';
	import { COLLECTIONS } from '@/db/index';
	import type { Participant } from '@/db/models/types';
	import { CalendarArrowDown, CalendarArrowUp } from '@/assets/icons';
	interface ComponentState {
		participants: Participant[];
		current_tab: 'upcoming' | 'past';
	}

	let comp_state = $state<ComponentState>({
		participants: [],
		current_tab: 'upcoming'
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
	<Tabs.Root bind:value={comp_state.current_tab}>
		<div class="flex items-center justify-between gap-4">
			<h2 class="text-4xl font-semibold">Events</h2>
			<Tabs.List class="grid h-auto w-full max-w-[300px] grid-cols-2">
				<Tabs.Trigger value="upcoming" class="h-auto text-base">
					<CalendarArrowUp class="md:mr-1" />
					Upcoming</Tabs.Trigger
				>
				<Tabs.Trigger value="past" class="h-auto text-base">
					<CalendarArrowDown class="md:mr-1" />
					Past</Tabs.Trigger
				>
			</Tabs.List>
		</div>

		{@const contents = ['upcoming', 'past']}
		{#each contents as content (content)}
			{#if content === comp_state.current_tab}
				<Tabs.Content value={content} class="mt-6">
					<EventList type={content as 'upcoming' | 'past'} />
				</Tabs.Content>
			{/if}
		{/each}
	</Tabs.Root>
</div>
