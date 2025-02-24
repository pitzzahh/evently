<script lang="ts">
	import {
		Tooltip,
		TooltipContent,
		TooltipProvider,
		TooltipTrigger
	} from '@/components/ui/tooltip';
	import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
	import type { DateValue } from '@internationalized/date';
	import type { CalendarEvent } from '@routes/calendar/(data)/types';

	type Props = {
		event: CalendarEvent;
		date: DateValue;
		isFirstColumn: boolean;
		index: number;
	};

	let { event, date, isFirstColumn, index }: Props = $props();

	const getEventPosition = (event: CalendarEvent) => {
		const isStart = event.startDate.compare(date) === 0;
		const isEnd = event.endDate.compare(date) === 0;
		const isBetween = !isStart && !isEnd;
		const duration = event.endDate.compare(event.startDate) + 1;

		return { isStart, isEnd, isBetween, duration };
	};

	const typeColors = {
		meeting: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
		event: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
		workshop: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
	};
	const position = getEventPosition(event);
</script>

{#if position.isStart || isFirstColumn}
	<TooltipProvider>
		<Popover>
			<Tooltip>
				<div
					class="absolute left-0 w-full text-left"
					style="width: {position.duration * 100}%; z-index: {index + 1};"
				>
					<TooltipTrigger>
						<PopoverTrigger>
							<div
								class={[
									'truncate px-1.5 py-0.5 text-xs',
									typeColors[event.type],
									position.isStart && 'rounded-l',
									position.isEnd && 'rounded-r',
									position.isBetween && 'rounded-none',
									!position.isBetween && !position.isEnd && 'mr-0',
									!position.isBetween && !position.isStart && 'ml-0',
									position.isStart && position.isEnd && 'rounded'
								]}
								style="margin-top: {index * 24}px;"
							>
								{#if position.isStart}
									{event.time}
								{/if}
								{event.title}
							</div>
						</PopoverTrigger>
					</TooltipTrigger>
					<TooltipContent>
						{@render EventContent(event)}
					</TooltipContent>
					<PopoverContent>
						{@render EventContent(event)}
					</PopoverContent>
				</div>
			</Tooltip>
		</Popover>
	</TooltipProvider>
{/if}

{#snippet EventContent(event: CalendarEvent)}
	<div class="text-sm">
		<p class="font-semibold">{event.title}</p>
		<p class="text-xs text-muted-foreground">
			{event.startDate.toString()} - {event.endDate.toString()}
		</p>
		<p class="text-xs">{event.description}</p>
		<!-- Add more detailed content for popover here -->
		<div class="mt-2 space-y-1">
			<p class="text-xs">Time: {event.time || 'N/A'}</p>
			<p class="text-xs">Type: {event.type}</p>
		</div>
	</div>
{/snippet}
