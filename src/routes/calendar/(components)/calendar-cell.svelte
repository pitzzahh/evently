<script lang="ts">
	import {
		Tooltip,
		TooltipContent,
		TooltipProvider,
		TooltipTrigger
	} from '@/components/ui/tooltip';
	import { Badge } from '@/components/ui/badge';
	import type { CalendarDate } from '@internationalized/date';
	import type { CalendarEvent } from '@routes/calendar/(data)/types';

	type Props = {
		date: CalendarDate;
		currentMonth: number;
		events: CalendarEvent[];
	};

	let { date, currentMonth, events }: Props = $props();

	const isCurrentMonth = $derived(() => date.month === currentMonth);

	// Determine event position (start/middle/end)
	const getEventPosition = (event: CalendarEvent) => {
		const isStart = event.startDate.compare(date) === 0;
		const isEnd = event.endDate.compare(date) === 0;
		return {
			isStart,
			isEnd,
			isMiddle: !isStart && !isEnd
		};
	};

	const typeColors = {
		meeting: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
		event: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
		workshop: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
	};
</script>

<div
	class={['min-h-[120px] border-b border-r bg-background p-2', !isCurrentMonth && 'bg-muted/50']}
>
	<div class={['mb-1 font-medium', !isCurrentMonth && 'text-muted-foreground']}>
		{date.day}
	</div>

	<div class="space-y-1">
		{#each events.slice(0, 3) as event}
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger class="w-full text-left">
						{@const position = getEventPosition(event)}
						<div
							class={[
								'truncate px-1.5 py-0.5 text-xs',
								typeColors[event.type],
								position.isStart && 'rounded-l',
								position.isEnd && 'rounded-r',
								position.isMiddle && 'rounded-none',
								!position.isMiddle && !position.isEnd && 'mr-0 pr-4',
								!position.isMiddle && !position.isStart && 'ml-0 pl-4',
								position.isStart && position.isEnd && 'rounded'
							]}
						>
							{#if position.isStart}
								{event.time}
							{/if}
							{event.title}
						</div>
					</TooltipTrigger>
					<TooltipContent>
						<div class="text-sm">
							<p class="font-semibold">{event.title}</p>
							<p class="text-xs text-muted-foreground">
								{event.startDate.toString()} - {event.endDate.toString()}
							</p>
							<p class="text-xs">{event.description}</p>
						</div>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		{/each}

		{#if events.length > 3}
			<div class="px-1.5 text-xs text-muted-foreground">
				+{events.length - 3} more
			</div>
		{/if}
	</div>
</div>
