<script lang="ts">
	import { EventCalendar } from '@/components/custom/event-calendar';
	import { scale } from 'svelte/transition';
	import { watch } from 'runed';
	import { COLLECTIONS } from '@/db';
	import moment from 'moment';
	import { momentLocalizer, type Event as CalendarEvent } from 'react-big-calendar';
	import { effect } from '@maverick-js/signals';

	interface ComponentState {
		event_details: CalendarEvent[];
	}

	let comp_state = $state<ComponentState>({
		event_details: []
	});

	effect(() => {
		const event_details_cursor = COLLECTIONS.EVENT_DETAILS_COLLECTION.find(
			{},
			{ fieldTracking: true }
		);
		comp_state.event_details = event_details_cursor.fetch().map((e) => {
			const _event: CalendarEvent = {
				title: e.event_name,
				start: e.start_date,
				end: e.end_date
			};
			return _event;
		});

		$inspect(comp_state.event_details);
	});
</script>

<h2 class="mb-4 text-4xl font-semibold">Calendar of Events</h2>
<div in:scale class="min-h-dvh bg-background p-4">
	<EventCalendar localizer={momentLocalizer(moment)} events={comp_state.event_details} />
</div>
