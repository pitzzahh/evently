<script lang="ts">
	import {EventCalendar} from "@routes/calendar/(components)";
	import { today, getLocalTimeZone, CalendarDate } from "@internationalized/date";
	import type { CalendarEvent } from "@routes/calendar/(data)/types";

	// Mock events data
	const events: CalendarEvent[] = $state([
		{
			id: "1",
			title: "Team Meeting",
			description: "Weekly team sync",
			date: today(getLocalTimeZone()),
			time: "09:00 AM",
			type: "meeting",
		},
		{
			id: "2",
			title: "Product Launch",
			description: "New feature release",
			date: today(getLocalTimeZone()).add({ days: 2 }),
			time: "02:00 PM",
			type: "event",
		},
		{
			id: "3",
			title: "Client Workshop",
			description: "Training session",
			date: today(getLocalTimeZone()).add({ days: 5 }),
			time: "10:00 AM",
			type: "workshop",
		},
	]);
</script>

<div class="min-h-dvh bg-background p-4">
	<EventCalendar {events} />
</div>
