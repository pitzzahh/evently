<script lang="ts">
	import { slide } from 'svelte/transition';
	import { EventForm } from '@routes/events/(components)';

	let { data } = $props();
</script>

<div in:slide>
	<h2 class="mb-4 text-4xl font-semibold">Create Event</h2>
	<EventForm event_form={data.event_form} />
</div>
