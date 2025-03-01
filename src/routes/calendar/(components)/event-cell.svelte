<script lang="ts">
	import {
		Tooltip,
		TooltipContent,
		TooltipProvider,
		TooltipTrigger
	} from '@/components/ui/tooltip';
	import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
	import { getLocalTimeZone, type DateValue } from '@internationalized/date';
	import type { EventDetails } from '@/db/models/types';
	import { formatDateTime, formatDateToTimeOption } from '@/utils/format';
	import { Portal } from 'bits-ui';

	type Props = {
		event: EventDetails;
		date: DateValue;
		isFirstColumn: boolean;
		index: number;
	};

	let { event, date, isFirstColumn, index }: Props = $props();

	// Calculate the event's position characteristics
	const getEventPosition = (event: EventDetails, date: DateValue) => {
		const currentDate = date.toDate(getLocalTimeZone());
		const startDate = new Date(event.start_date);
		const endDate = new Date(event.end_date);

		// Reset times to compare just the dates
		const currentDay = new Date(
			currentDate.getFullYear(),
			currentDate.getMonth(),
			currentDate.getDate()
		);
		const startDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
		const endDay = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

		// Calculate if this cell is the start, end, or middle of the event
		const isStart = startDay.getTime() === currentDay.getTime();
		const isEnd = endDay.getTime() === currentDay.getTime();
		const isBetween =
			currentDay.getTime() > startDay.getTime() && currentDay.getTime() < endDay.getTime();

		// Calculate total event duration in days (inclusive)
		const duration =
			Math.floor((endDay.getTime() - startDay.getTime()) / (1000 * 60 * 60 * 24)) + 1;

		return { isStart, isEnd, isBetween, duration };
	};

	// Define color schemes for different event types
	const typeColors: {
		[key in EventDetails['type']]: string;
	} = {
		meeting:
			'border-blue-500 bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-100 dark:hover:bg-blue-800',
		seminar:
			'border-green-500 bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-100 dark:hover:bg-green-800',
		workshop:
			'border-red-500 bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-100 dark:hover:bg-red-800',
		conference:
			'border-purple-500 bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-100 dark:hover:bg-purple-800',
		webinar:
			'border-yellow-500 bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-100 dark:hover:bg-yellow-800',
		other:
			'border-gray-500 bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800'
	};

	const position = getEventPosition(event, date);

	// Custom width adjustments for multi-day events
	const getEventWidthStyle = () => {
		// For cells in the middle or end of multi-day events
		if (position.isBetween || position.isEnd) {
			return 'width: calc(100% + 1px);';
		}
		return '';
	};

	// Calculate event position classes
	const getPositionClasses = () => {
		const classes = [];

		if (position.isStart) {
			classes.push('rounded-l-md border-l-2 ml-1');
		} else {
			classes.push('border-l-0 -ml-1'); // Negative margin to overlap cell borders
		}

		if (position.isEnd) {
			classes.push('rounded-r-md mr-1');
		} else if (!position.isBetween) {
			// Single day event
			classes.push('rounded-r-md mr-1');
		} else {
			// Middle of multi-day event
			classes.push('border-r-0');
		}

		return classes.join(' ');
	};
</script>

<TooltipProvider>
	<Tooltip>
		<Popover>
			<div class="absolute left-0 right-0" style="z-index: {index + 1};">
				<TooltipTrigger class="w-full">
					<PopoverTrigger class="block w-full">
						<div
							class={[
								'group relative flex cursor-pointer items-center px-2 py-0.5',
								'text-xs shadow-sm transition-all duration-100',
								typeColors[event.type],
								getPositionClasses(),
								'hover:-translate-y-[1px] hover:shadow-md'
							]}
							style="margin-top: {index * 22 + 2}px; height: 20px; {getEventWidthStyle()}"
						>
							<div class="flex-1 truncate">
								{#if position.isStart}
									<span class="font-medium">{formatDateToTimeOption(event.start_date)}</span>
									<span class="mx-1">·</span>
								{/if}
								<span class={position.isBetween && !position.isStart ? 'opacity-90' : ''}>
									{event.event_name}
								</span>
							</div>
						</div>
					</PopoverTrigger>
				</TooltipTrigger>

				<Portal>
					<TooltipContent side="top" class="max-w-[300px]">
						{@render EventContent(event)}
					</TooltipContent>
				</Portal>
				<Portal>
					<PopoverContent class="w-full sm:w-80">
						{@render EventContent(event)}
					</PopoverContent>
				</Portal>
			</div>
		</Popover>
	</Tooltip>
</TooltipProvider>

{#snippet EventContent(event: EventDetails)}
	<div class="space-y-2 p-2">
		<div class="flex items-center gap-2">
			<div class={`h-3 w-3 rounded-full ${typeColors[event.type]}`}></div>
			<h4 class="font-medium">{event.event_name}</h4>
		</div>
		<div class="space-y-1 text-xs text-foreground/80 dark:text-foreground/70">
			<p class="flex items-center gap-1">
				<span class="font-medium">Time:</span>
				{formatDateToTimeOption(event.start_date)}
			</p>
			<p class="flex items-center gap-1">
				<span class="font-medium">Date:</span>
				{formatDateTime(event.start_date)} - {formatDateTime(event.end_date)}
			</p>
			{#if event.description}
				<p class="mt-2 text-xs">{event.description}</p>
			{/if}
		</div>
	</div>
{/snippet}
