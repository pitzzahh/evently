<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
	import { Button } from '@/components/ui/button';
	// TODO: Change to the correct import path from assets
	import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-svelte';
	import { today, getLocalTimeZone, CalendarDate } from '@internationalized/date';
	import type { CalendarEvent } from '@routes/calendar/(data)/types';
	import { CalendarCell } from '.';

	type Props = {
		events: CalendarEvent[];
	};

	let { events }: Props = $props();

	// Current date state
	let currentDate = $state(today(getLocalTimeZone()));

	// Days headers
	const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

	// Get calendar dates
	const getCalendarDates = () => {
		const dates = [];
		const firstDay = new CalendarDate(currentDate.year, currentDate.month, 1);
		const startDay = firstDay.subtract({ days: firstDay.dayOfWeek });

		for (let i = 0; i < 42; i++) {
			dates.push(startDay.add({ days: i }));
		}

		return dates;
	};

	// Get events for a specific date
	const getDateEvents = (date: CalendarDate) => {
		return events.filter((event) => {
			const isAfterStart = date.compare(event.startDate) >= 0;
			const isBeforeEnd = date.compare(event.endDate) <= 0;
			return isAfterStart && isBeforeEnd;
		});
	};

	// Navigation
	const prevMonth = () => {
		currentDate = currentDate.subtract({ months: 1 });
	};

	const nextMonth = () => {
		currentDate = currentDate.add({ months: 1 });
	};

	// Format month and year
	const formatMonthYear = (date: CalendarDate) => {
		return new Intl.DateTimeFormat('en-US', {
			month: 'long',
			year: 'numeric'
		}).format(date.toDate(getLocalTimeZone()));
	};
</script>

<div class="flex items-center justify-center">
	<div class="flex items-center gap-4">
		<Button variant="outline" size="icon" onclick={prevMonth}>
			<ChevronLeftIcon class="h-4 w-4" />
		</Button>
		<span class="text-lg font-semibold">
			{formatMonthYear(currentDate)}
		</span>
		<Button variant="outline" size="icon" onclick={nextMonth}>
			<ChevronRightIcon class="h-4 w-4" />
		</Button>
	</div>
</div>
<!-- Calendar Grid -->
<div class="grid grid-cols-7 gap-px bg-muted">
	<!-- Week days -->
	{#each weekDays as day}
		<div class="bg-background p-3 text-center font-semibold">
			{day}
		</div>
	{/each}

	<!-- Calendar days -->
	{#each getCalendarDates() as date}
		<CalendarCell {date} currentMonth={currentDate.month} events={getDateEvents(date)} />
	{/each}
</div>
