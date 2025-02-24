<script lang="ts">
	import { EventCalendar } from '@routes/calendar/(components)';
	import { today, getLocalTimeZone, CalendarDate } from '@internationalized/date';
	import type { CalendarEvent, EventType } from './types';

	const eventTitles = [
		'Team Meeting',
		'Product Launch',
		'Workshop',
		'Client Presentation',
		'Sprint Planning',
		'Design Review',
		'Hackathon',
		'Training Session',
		'Project Deadline',
		'Code Review'
	];

	const eventDescriptions = [
		'Weekly team sync',
		'New feature release',
		'Training session for new features',
		'Presenting to key stakeholders',
		'Planning next sprint goals',
		'Review design implementations',
		'Innovation event',
		'Learning and development',
		'Project milestone completion',
		'Code quality assessment'
	];

	const eventTypes: EventType[] = ['meeting', 'event', 'workshop'];

	export function generateSampleEvents(count: number): CalendarEvent[] {
		const events: CalendarEvent[] = [];
		const baseDate = today(getLocalTimeZone());

		for (let i = 0; i < count; i++) {
			const randomDays = Math.floor(Math.random() * 30); // Random day within next 30 days
			const duration = Math.floor(Math.random() * 3); // Random duration 0-2 days
			const startDate = baseDate.add({ days: randomDays });
			const endDate = startDate.add({ days: duration });

			events.push({
				id: (i + 1).toString(),
				title: eventTitles[Math.floor(Math.random() * eventTitles.length)],
				description: eventDescriptions[Math.floor(Math.random() * eventDescriptions.length)],
				type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
				startDate,
				endDate,
				time: `${Math.floor(Math.random() * 12 + 1)}:00 ${Math.random() < 0.5 ? 'AM' : 'PM'}`
			});
		}

		return events;
	}
	const events = $state(generateSampleEvents(100));
</script>

<div class="min-h-dvh bg-background p-4">
	<EventCalendar {events} />
</div>
