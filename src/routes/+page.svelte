<script lang="ts">
	import PocketBase from 'pocketbase';

	let { data } = $props();
	const { POCKETBASE_INSTANCE } = data;
	const notes = $state(data.notes);

	const pb = new PocketBase(POCKETBASE_INSTANCE!);

	$effect(() => {
		console.log(import.meta.env.VITE_POCKETBASE_INSTANCE);
		pb.collection('notes').subscribe('*', (e) => {
			console.log('action', e.action);
			console.log('record', e.record);
			if (e.action === 'delete') {
				notes.splice(
					notes.findIndex((note) => note.id === e.record.id),
					1
				);
				return;
			}
			notes.push(e.record);
		});
	});
</script>

<h1>Welcome to SvelteKit</h1>
<p>
	Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation.
</p>

{#each notes as notes}
	<h2>{notes.title}</h2>
{/each}
