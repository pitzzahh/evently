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
		meeting: 'border-l-4 border-blue-500 bg-blue-50 hover:bg-blue-100',
		event: 'border-l-4 border-green-500 bg-green-50 hover:bg-green-100',
		workshop: 'border-l-4 border-red-500 bg-red-50 hover:bg-red-100'
	};

	const position = getEventPosition(event);
</script>

{#if position.isStart || isFirstColumn}
	<TooltipProvider>
		<Tooltip>
			<Popover>
				<div
					class="absolute left-0 w-full"
					style="width: {position.duration * 100}%; z-index: {index + 1};"
				>
					<TooltipTrigger class="w-full">
						<PopoverTrigger class="w-full">
							<div
								class={[
									'group relative flex cursor-pointer items-center px-2 py-0.5',
									'text-xs transition-colors',
									typeColors[event.type],
									position.isStart ? 'ml-1 rounded-l' : 'border-l-0',
									position.isEnd ? 'mr-1 rounded-r' : '',
									position.isBetween ? '' : '',
									'hover:shadow-md'
								]}
								style="margin-top: {index * 22}px; height: 20px;"
							>
								<div class="flex-1 truncate">
									{#if position.isStart}
										<span class="font-medium">{event.time}</span>
										<span class="mx-1">·</span>
									{/if}
									<span class={position.isStart ? '' : 'opacity-0 group-hover:opacity-100'}>
										{event.title}
									</span>
								</div>
							</div>
						</PopoverTrigger>
					</TooltipTrigger>

					<TooltipContent side="top" class="max-w-[300px]">
						{@render EventContent(event)}
					</TooltipContent>

					<PopoverContent class="w-80">
						{@render EventContent(event)}
					</PopoverContent>
				</div>
			</Popover>
		</Tooltip>
	</TooltipProvider>
{/if}

{#snippet EventContent(event: CalendarEvent)}
	<div class="space-y-2 p-2">
		<div class="flex items-center gap-2">
			<div
				class={`h-3 w-3 rounded-full bg-${event.type === 'meeting' ? 'blue' : event.type === 'event' ? 'green' : 'red'}-500`}
			></div>
			<h4 class="font-medium">{event.title}</h4>
		</div>
		<div class="space-y-1 text-xs text-muted-foreground">
			<p class="flex items-center gap-1">
				<span class="font-medium">Time:</span>
				{event.time}
			</p>
			<p class="flex items-center gap-1">
				<span class="font-medium">Date:</span>
				{event.startDate.toString()} - {event.endDate.toString()}
			</p>
			{#if event.description}
				<p class="mt-2 text-xs">{event.description}</p>
			{/if}
		</div>
	</div>
{/snippet}

<style>
	/* Smooth transitions */
	.group {
		transition: all 0.2s ease;
	}

	/* Override default tooltip styles for better positioning */
	:global(.tooltip-content) {
		padding: 8px !important;
		margin-top: -4px;
	}
</style>
