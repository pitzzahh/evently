<script lang="ts">
	import { EventCalendar } from '@routes/calendar/(components)';
	import { scale } from 'svelte/transition';
	import type { EventDetails, EventSchedule } from '@/db/models/types';
	import { watch } from 'runed';
	import { COLLECTIONS } from '@/db';

	interface ComponentState {
		event_details: EventDetails[];
		event_schedules: EventSchedule[];
	}

	let comp_state = $state<ComponentState>({
		event_details: [],
		event_schedules: []
	});

	watch([() => COLLECTIONS.EVENT_DETAILS_COLLECTION.isLoading], () => {
		const event_details_cursor = COLLECTIONS.EVENT_DETAILS_COLLECTION.find(
			{},
			{ fieldTracking: true }
		);
		comp_state.event_details = event_details_cursor.fetch();
		return () => {
			event_details_cursor.cleanup();
		};
	});
</script>

<div in:scale class="min-h-dvh bg-background p-4">
	<EventCalendar type="single" events={comp_state.event_details} />
</div>
