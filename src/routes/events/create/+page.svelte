<script lang="ts">
	import EventForm from '../(components)/event-form.svelte';

	let { data } = $props();
</script>

<h2 class="text-4xl font-semibold">Create Event</h2>
<EventForm event_form={data.event_form} />
