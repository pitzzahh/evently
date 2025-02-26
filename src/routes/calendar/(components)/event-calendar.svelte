<script lang="ts">
	import { Calendar as CalendarPrimitive, type WithoutChildrenOrChild } from 'bits-ui';
	import * as Calendar from '@/components/ui/calendar';
	import { cn } from '@/utils/styles';
	import { getLocalTimeZone, type DateValue } from '@internationalized/date';
	import { EventCell } from '.';
	import type { EventDetails } from '@/db/models/types';
	import * as Popover from '@/components/ui/popover/index.js';
	import { Label } from '@/components/ui/label/index.js';
	import { buttonVariants } from '@/components/ui/button/index.js';
	import { Input } from '@/components/ui/input/index.js';
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
		console.log(events);
		return events.filter((event) => {
			// Check if the date falls within the event's duration (inclusive)
			const currentDateTime = date.toDate(getLocalTimeZone()).getTime();
			const startDateTime = event.start_date.getTime();
			const endDateTime = event.end_date.getTime();

			return currentDateTime >= startDateTime && currentDateTime <= endDateTime;
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
													<Calendar.Day data-outside-month={true} />
												</div>
												<div class="absolute flex-1">
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
														<Popover.Root>
															<Popover.Trigger
																class={buttonVariants({
																	variant: 'outline',
																	size: 'xs',
																	className:
																		'absolute bottom-0 left-0 w-full px-2 py-0.5 text-xs text-muted-foreground hover:bg-muted'
																})}>+{events.length - 4} more</Popover.Trigger
															>
															<Popover.Content class="w-80">
																<div class="grid gap-4">
																	<div class="space-y-2">
																		<h4 class="font-medium leading-none">Dimensions</h4>
																		<p class="text-sm text-muted-foreground">
																			Set the dimensions for the layer.
																		</p>
																	</div>
																	<div class="grid gap-2">
																		<div class="grid grid-cols-3 items-center gap-4">
																			<Label for="width">Width</Label>
																			<Input id="width" value="100%" class="col-span-2 h-8" />
																		</div>
																		<div class="grid grid-cols-3 items-center gap-4">
																			<Label for="maxWidth">Max. width</Label>
																			<Input id="maxWidth" value="300px" class="col-span-2 h-8" />
																		</div>
																		<div class="grid grid-cols-3 items-center gap-4">
																			<Label for="height">Height</Label>
																			<Input id="height" value="25px" class="col-span-2 h-8" />
																		</div>
																		<div class="grid grid-cols-3 items-center gap-4">
																			<Label for="maxHeight">Max. height</Label>
																			<Input id="maxHeight" value="none" class="col-span-2 h-8" />
																		</div>
																	</div>
																</div>
															</Popover.Content>
														</Popover.Root>
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
