<script lang="ts">
	import { EventCalendar } from '@routes/calendar/(components)';
	import { today, getLocalTimeZone } from '@internationalized/date';
	import type { CalendarEvent, EventType } from '@routes/calendar/(data)/types';
	import { scale } from 'svelte/transition';

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
			// Generate random hour (0-23) and minute (0-59)
			const hour = Math.floor(Math.random() * 24);
			const minute = Math.floor(Math.random() * 4) * 15; // 15-minute intervals

			// Generate random day within next 90 days for better distribution
			const randomDays = Math.floor(Math.random() * 90);
			const duration = Math.max(1, Math.floor(Math.random() * 4)); // 1-3 days duration
			const startDate = baseDate.add({ days: randomDays });
			const endDate = startDate.add({ days: duration });

			events.push({
				id: crypto.randomUUID(),
				title: eventTitles[Math.floor(Math.random() * eventTitles.length)],
				description: eventDescriptions[Math.floor(Math.random() * eventDescriptions.length)],
				type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
				startDate,
				endDate,
				time: `${hour % 12 || 12}:${minute.toString().padStart(2, '0')} ${hour < 12 ? 'AM' : 'PM'}`
			});
		}

		return events;
	}
	const events = $state(generateSampleEvents(50));
</script>

<div in:scale class="min-h-dvh bg-background p-4">
	<EventCalendar type="single" {events} />
</div>
