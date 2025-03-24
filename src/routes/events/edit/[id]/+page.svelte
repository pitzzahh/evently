<script lang="ts">
	import type { EventDetails, EventSchedule } from '@/db/models/types.js';
	import { EventForm } from '@routes/events/(components)';
	import { watch } from 'runed';
	import { fly } from 'svelte/transition';
	import { COLLECTIONS } from '@/db';
	import { checkEventStatus } from '@routes/events/utils/index.js';

	let { data } = $props();

	let comp_state: {
		event_details_to_edit: EventDetails | undefined;
		event_schedules: EventSchedule[];
	} = $state({
		event_schedules: [],
		event_details_to_edit: undefined
	});

	
	watch(
		[
			() => COLLECTIONS.EVENT_SCHEDULE_COLLECTION.isLoading(),
			() => COLLECTIONS.EVENT_DETAILS_COLLECTION.isLoading()
		],
		() => {
			const event_schedule_cursor = COLLECTIONS.EVENT_SCHEDULE_COLLECTION.find({
				event_id: data.event_id
			});

			comp_state.event_schedules = event_schedule_cursor.fetch();
			comp_state.event_details_to_edit = COLLECTIONS.EVENT_DETAILS_COLLECTION.findOne({
				id: data.event_id
			});

			$inspect(
				comp_state.event_details_to_edit?.start_date &&
					comp_state.event_details_to_edit.start_date > new Date()
			);

			return () => {
				event_schedule_cursor.cleanup();
			};
		}
	);
</script>

<div in:fly={{ y: 20 }}>
	<h2 class="mb-4 text-4xl font-semibold">Edit Event</h2>
	<EventForm
		event_form={data.event_form}
		event_to_edit={comp_state.event_details_to_edit}
		event_schedules={comp_state.event_schedules}
	/>
</div>
