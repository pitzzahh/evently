<script lang="ts">
	import { EventCalendar } from '@routes/calendar/(components)';
	import type { CalendarEvent } from '@routes/calendar/(data)/types';
	import { scale } from 'svelte/transition';
	import type { EventSchedule } from '@/db/models/types';
	import { watch } from 'runed';
	import { COLLECTIONS } from '@/db';
	import { CalendarDate } from '@internationalized/date';

	interface ComponentState {
		calendar_events: CalendarEvent[];
		event_schedules: EventSchedule[];
	}

	let comp_state = $state<ComponentState>({
		event_schedules: [],
		calendar_events: []
	});

	watch([() => COLLECTIONS.EVENT_SCHEDULE_COLLECTION.isLoading], () => {
		const event_schedule_cursor = COLLECTIONS.EVENT_SCHEDULE_COLLECTION.find(
			{},
			{ fieldTracking: true }
		);
		comp_state.event_schedules = event_schedule_cursor.fetch();
		// console.log(comp_state.event_schedules);
		comp_state.calendar_events = comp_state.event_schedules.map((event_schedule) => {
			const event_cursor = COLLECTIONS.EVENT_DETAILS_COLLECTION.findOne(
				{ id: event_schedule.event_id },
				{ fieldTracking: true }
			);

			if (!event_cursor)
				return {
					id: event_schedule.event_id,
					type: 'other',
					title: 'N/A',
					startDate: new CalendarDate(1900, 0, 1),
					endDate: new CalendarDate(1900, 0, 1)
				};

			console.log(event_cursor.start_date.getFullYear());

			return {
				id: event_schedule.event_id,
				type: event_cursor?.type ?? 'other',
				title: event_cursor?.event_name ?? 'N/A',
				startDate: new CalendarDate(
					event_cursor.start_date.getFullYear(),
					event_cursor.start_date.getMonth(),
					event_cursor.start_date.getDay()
				),
				endDate: new CalendarDate(
					event_cursor.end_date.getUTCFullYear(),
					event_cursor.end_date.getMonth(),
					event_cursor.end_date.getDay()
				)
			} as CalendarEvent;
		});
		return () => {
			event_schedule_cursor.cleanup();
		};
	});
</script>

<div in:scale class="min-h-dvh bg-background p-4">
	<EventCalendar type="single" events={comp_state.calendar_events} />
</div>
