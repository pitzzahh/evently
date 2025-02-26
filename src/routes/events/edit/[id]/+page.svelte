<script lang="ts">
	import type { EventDetails, EventSchedule } from '@/db/models/types.js';
	import { EventForm } from '@routes/events/(components)';
	let { data } = $props();

	let comp_state: { event_to_edit: EventDetails | null; event_schedules: EventSchedule[] } = $state(
		{
			event_schedules: [],
			event_to_edit: null
		}
	);


	// $effect(() => ({

	// }))
</script>

<h2 class="mb-4 text-4xl font-semibold">Edit Event</h2>
<EventForm
	event_form={data.event_form}

/>
<!-- 
event_to_edit={data.event_to_edit}
event_schedules={data.event_schedules} -->