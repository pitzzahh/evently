<script lang="ts">
	import * as Calendar from '$lib/components/ui/calendar';
	import { today, getLocalTimeZone, CalendarDate } from '@internationalized/date';
	import type { CalendarEvent } from '@routes/calendar/(data)/types';
	import { EventCell } from '.';

	type Props = {
		events: CalendarEvent[];
	};

	let { events }: Props = $props();

	// Calendar state
	const currentDate = $state(today(getLocalTimeZone()));
	let value = $state<CalendarDate>();

	// Get events for a specific date
	const getDateEvents = (date: CalendarDate) => {
		return events.filter((event) => {
			const isAfterStart = date.compare(event.startDate) >= 0;
			const isBeforeEnd = date.compare(event.endDate) <= 0;
			return isAfterStart && isBeforeEnd;
		});
	};
</script>

<Calendar.Root bind:value class="rounded-md border">
	{#snippet children({ months, weekdays })}
		<Calendar.Header>
			<Calendar.PrevButton />
			<Calendar.Heading />
			<Calendar.NextButton />
		</Calendar.Header>
		<Calendar.Months>
			{#each months as month}
				<Calendar.Grid>
					<Calendar.GridHead>
						<Calendar.GridRow>
							{#each weekdays as weekday}
								<Calendar.HeadCell>
									{weekday}
								</Calendar.HeadCell>
							{/each}
						</Calendar.GridRow>
					</Calendar.GridHead>
					<Calendar.GridBody>
						{#each month.weeks as weekDates, weekIndex}
							<Calendar.GridRow>
								{#each weekDates as date}
									<div
										class="min-h-[120px] border-t p-2 first:border-l [&:not(:last-child)]:border-r"
									>
										<div class="text-sm font-medium">
											<Calendar.Day {date} month={month.value} />
										</div>
										<div class="mt-2">
											{#each getDateEvents(date).slice(0, 3) as event, index}
												<EventCell {event} {date} isFirstColumn={weekIndex === 0} {index} />
											{/each}
											{#if getDateEvents(date).length > 3}
												<div class="mt-1 text-xs text-muted-foreground">
													+{getDateEvents(date).length - 3} more
												</div>
											{/if}
										</div>
									</div>
								{/each}
							</Calendar.GridRow>
						{/each}
					</Calendar.GridBody>
				</Calendar.Grid>
			{/each}
		</Calendar.Months>
	{/snippet}
</Calendar.Root>
