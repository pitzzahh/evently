<script lang="ts">
	import { COLLECTIONS } from '@/db/index';
	import type { ParticipantCollection } from '@/db/models';
	import { watch } from 'runed';

	let comp_state = $state({
		count: 50
	});

	let items: ParticipantCollection[] = $state.raw([]);

	$effect(() => {
		const cursor = COLLECTIONS.PARTICIPANT_COLLECTION.find({});
		items = cursor.fetch();
		return () => {
			cursor.cleanup();
		};
	});
</script>

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
