<script lang="ts">
	import { Calendar as CalendarPrimitive, type WithoutChildrenOrChild } from 'bits-ui';
	import * as Calendar from '@/components/ui/calendar';
	import { cn } from '$lib/utils';
	import type { CalendarDate, DateValue } from '@internationalized/date';
	import type { CalendarEvent } from '@routes/calendar/(data)/types';

	let {
		ref = $bindable(null),
		value = $bindable(),
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

	const eventColors = {
		meeting: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
		event: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
		workshop: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
	};
</script>

<CalendarPrimitive.Root
	bind:value={value as never}
	bind:ref
	bind:placeholder
	{weekdayFormat}
	class={cn('p-3', className)}
	{...restProps}
>
	{#snippet children({ months, weekdays })}
		<div class="border bg-background">
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
									<Calendar.HeadCell class="h-12 text-center font-medium">
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

												<div class="mt-2 space-y-1">
													{#each getDateEvents(date).slice(0, 3) as event}
														<div
															class={cn(
																'truncate rounded px-1.5 py-0.5 text-xs',
																eventColors[event.type]
															)}
															title={event.title}
														>
															{#if date.compare(event.startDate) === 0}
																{event.time}
															{/if}
															{event.title}
														</div>
													{/each}

													{#if getDateEvents(date).length > 3}
														<div class="px-1.5 text-xs text-muted-foreground">
															+{getDateEvents(date).length - 3} more
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
		</div>
	{/snippet}
</CalendarPrimitive.Root>
