<script lang="ts">
	import { EventCalendar } from '@/components/custom/event-calendar';
	import { scale } from 'svelte/transition';
	import { watch } from 'runed';
	import { COLLECTIONS } from '@/db';
	import type { CalendarEvent } from '@/components/custom/react-event-calendar/components';
	import { checkEventStatus } from '@routes/events/utils';
	import { goto } from '$app/navigation';

	interface ComponentState {
		event_details: CalendarEvent[];
	}

	let comp_state = $state<ComponentState>({
		event_details: []
	});

	const event_colors = ['sky', 'amber', 'violet', 'rose', 'emerald', 'orange'] as const;

	watch([() => COLLECTIONS.EVENT_DETAILS_COLLECTION.isLoading], () => {
		const event_details_cursor = COLLECTIONS.EVENT_DETAILS_COLLECTION.find(
			{},
			{ fieldTracking: true }
		);
		comp_state.event_details = event_details_cursor.fetch().map((e) => {
			return {
				id: e.id,
				title: e.event_name,
				description: e.description,
				start: e.start_date,
				end: e.end_date,
				location: e.location,
				color: event_colors.at(Math.random() * event_colors.length),
				eventImage: e.cover,
				eventStatus: checkEventStatus(e.start_date, e.end_date),
				eventDuration: e.difference_in_days
			};
		});

		$inspect(comp_state.event_details);
		return () => event_details_cursor.cleanup();
	});
</script>

<h2 class="mb-4 text-4xl font-semibold">Calendar of Events</h2>
<div in:scale class="min-h-dvh p-4">
	<EventCalendar
		events={comp_state.event_details}
		onViewEvent={(event_id: string) => {
			goto(`/events/${event_id}`, { replaceState: true });
		}}
	/>
</div>
