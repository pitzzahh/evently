<script lang="ts">
	import { Calendar as CalendarPrimitive, type WithoutChildrenOrChild } from 'bits-ui';
	import * as Calendar from '@/components/ui/calendar';
	import { cn } from '$lib/utils';
	import type { DateValue } from '@internationalized/date';
	import type { CalendarEvent } from '@routes/calendar/(data)/types';
	import { EventCell } from '.';

	let {
		ref = $bindable(null),
		placeholder = $bindable(),
		class: className,
		weekdayFormat = 'short',
		events,
		...restProps
	}: WithoutChildrenOrChild<
		CalendarPrimitive.RootProps & {
			events: CalendarEvent[];
		}
	> = $props();

	// Get events for a specific date
	function getDateEvents(date: DateValue) {
		return events.filter((event) => {
			const isAfterStart = date.compare(event.startDate) >= 0;
			const isBeforeEnd = date.compare(event.endDate) <= 0;
			return isAfterStart && isBeforeEnd;
		});
	}
</script>

<CalendarPrimitive.Root
	bind:ref
	bind:placeholder
	{weekdayFormat}
	class={cn('p-3', className)}
	{...restProps}
>
	{#snippet children({ months, weekdays })}
		<Calendar.Header class="px-4 py-2">
			<Calendar.PrevButton />
			<Calendar.Heading />
			<Calendar.NextButton />
		</Calendar.Header>

		<Calendar.Months>
			{#each months as month}
				<Calendar.Grid>
					<Calendar.GridHead>
						<Calendar.GridRow class="grid grid-cols-7 divide-x divide-border">
							{#each weekdays as weekday}
								<Calendar.HeadCell class="flex h-12 w-full items-center justify-center font-medium">
									{weekday}
								</Calendar.HeadCell>
							{/each}
						</Calendar.GridRow>
					</Calendar.GridHead>

					<Calendar.GridBody>
						{#each month.weeks as weekDates}
							<Calendar.GridRow class="grid grid-cols-7 divide-x divide-border">
								{#each weekDates as date}
									<div class="relative min-h-[120px] border-t p-2">
										<Calendar.Cell {date} month={month.value}>
											<div class="flex justify-between">
												<Calendar.Day />
											</div>
											{@const events = getDateEvents(date)}
											<div class="mt-2 space-y-1">
												{#each events.slice(0, 3) as event, i}
													<EventCell
														{event}
														date={event.startDate}
														isFirstColumn={date.compare(event.startDate) === 0}
														index={i}
													/>
												{/each}
												{#if events.length > 3}
													<div class="px-1.5 text-xs text-muted-foreground">
														+{events.length - 3} more
													</div>
												{/if}
											</div>
										</Calendar.Cell>
									</div>
								{/each}
							</Calendar.GridRow>
						{/each}
					</Calendar.GridBody>
				</Calendar.Grid>
			{/each}
		</Calendar.Months>
	{/snippet}
</CalendarPrimitive.Root>
