<script lang="ts">
	import { Calendar as CalendarPrimitive, type WithoutChildrenOrChild } from 'bits-ui';
	import * as Calendar from '@/components/ui/calendar';
	import { cn } from '$lib/utils';
	import { getLocalTimeZone, type DateValue } from '@internationalized/date';
	import { EventCell } from '.';
	import type { EventDetails } from '@/db/models/types';

	let {
		ref = $bindable(null),
		placeholder = $bindable(),
		class: className,
		weekdayFormat = 'short',
		events,
		...restProps
	}: WithoutChildrenOrChild<
		CalendarPrimitive.RootProps & {
			events: EventDetails[];
		}
	> = $props();

	// Get events for a specific date
	function getDateEvents(date: DateValue) {
		return events.filter((event) => {
			const isAfterStart = date.toDate(getLocalTimeZone()).getTime() >= event.start_date.getTime();
			const isBeforeEnd = date.toDate(getLocalTimeZone()).getTime() <= event.end_date.getTime();
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
								<Calendar.HeadCell
									class="flex h-12 w-full items-center justify-center rounded-none  font-medium"
								>
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
											{@const events = getDateEvents(date)}
											<div class="flex h-full flex-col">
												<div class="flex justify-between p-1">
													<Calendar.Day />
												</div>
												<div class="relative flex-1">
													{#each events.slice(0, 4) as event, i}
														<EventCell
															{event}
															{date}
															isFirstColumn={date.toDate(getLocalTimeZone()).getTime() <
																event.start_date.getTime()}
															index={i}
														/>
													{/each}
													{#if events.length > 4}
														<button
															class="absolute bottom-0 left-0 w-full px-2 py-0.5 text-xs text-muted-foreground hover:bg-muted"
														>
															+{events.length - 4} more
														</button>
													{/if}
												</div>
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
