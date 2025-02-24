<script lang="ts">
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { fade } from 'svelte/transition';
	import EventList from './events/(components)/event-list.svelte';
	import { COLLECTIONS } from '@/db/index';
	import type { Participant } from '@/db/models/types';

	let comp_state = $state({
		count: 50
	});

	let items: Participant[] = $state.raw([]);

	$effect(() => {
		const cursor = COLLECTIONS.PARTICIPANT_COLLECTION.find({});
		items = cursor.fetch();
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

		<Tabs.Content value="upcoming" class="mt-6">
			<EventList />
		</Tabs.Content>

		<Tabs.Content value="past" class="mt-6">Some past events</Tabs.Content>
	</Tabs.Root>
</div>

<button
	onclick={() => {
		for (let i = 0; i <= comp_state.count; i++) {
			COLLECTIONS.PARTICIPANT_COLLECTION.insert({
				first_name: 'John',
				last_name: 'Doe: ' + i
			});
		}
	}}
>
	Add Post
</button>

<input type="number" bind:value={comp_state.count} />

<button
	onclick={() => {
		COLLECTIONS.PARTICIPANT_COLLECTION.removeMany({});
		items = [];
	}}
>
	Remove All
</button>
<ul>
	{#each items as post}
		<li>
			<strong>{post.first_name}</strong> by {post.last_name}
			<button
				onclick={() =>
					COLLECTIONS.PARTICIPANT_COLLECTION.removeOne({
						id: post.id
					})}>Delete</button
			>
		</li>
	{/each}
</ul>
