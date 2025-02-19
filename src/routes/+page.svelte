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

<iframe
	src="http://127.0.0.1:8090"
	frameborder="0"
	class="h-full w-full"
	title="PocketBase Admin UI"
></iframe>

{#each notes as notes}
	<h2>{notes.title}</h2>
{/each}
