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

	type Props = {
		event: EventDetails;
		date: DateValue;
		isFirstColumn: boolean;
		index: number;
	};

	let { event, date, isFirstColumn, index }: Props = $props();

	const getEventPosition = (event: EventDetails) => {
		const isStart = event.start_date.getTime() === date.toDate(getLocalTimeZone()).getTime();
		const isEnd = event.end_date.getTime() === date.toDate(getLocalTimeZone()).getTime();
		const isBetween = !isStart && !isEnd;
		const duration =
			(event.end_date.getTime() - event.start_date.getTime()) / (1000 * 60 * 60 * 24) + 1;

		return { isStart, isEnd, isBetween, duration };
	};

	const typeColors: {
		[key in EventDetails['type']]: string;
	} = {
		meeting:
			'border-l-4 border-blue-500 bg-blue-50 hover:bg-blue-100 dark:border-blue-300 dark:bg-blue-900 dark:hover:bg-blue-800',
		seminar:
			'border-l-4 border-green-500 bg-green-50 hover:bg-green-100 dark:border-green-300 dark:bg-green-900 dark:hover:bg-green-800',
		workshop:
			'border-l-4 border-red-500 bg-red-50 hover:bg-red-100 dark:border-red-300 dark:bg-red-900 dark:hover:bg-red-800',
		conference:
			'border-l-4 border-purple-500 bg-purple-50 hover:bg-purple-100 dark:border-purple-300 dark:bg-purple-900 dark:hover:bg-purple-800',
		webinar:
			'border-l-4 border-yellow-500 bg-yellow-50 hover:bg-yellow-100 dark:border-yellow-300 dark:bg-yellow-900 dark:hover:bg-yellow-800',
		other:
			'border-l-4 border-gray-500 bg-gray-50 hover:bg-gray-100 dark:border-gray-300 dark:bg-gray-900 dark:hover:bg-gray-800'
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
										<span class="font-medium">{formatDateToTimeOption(event.start_date)}</span>
										<span class="mx-1">·</span>
									{/if}
									<span class={position.isStart ? '' : 'opacity-0 group-hover:opacity-100'}>
										{event.event_name}
									</span>
								</div>
							</div>
						</PopoverTrigger>
					</TooltipTrigger>

					<TooltipContent side="top" class="max-w-[300px]">
						{@render EventContent(event)}
					</TooltipContent>

					<PopoverContent class="w-full sm:w-80">
						{@render EventContent(event)}
					</PopoverContent>
				</div>
			</Popover>
		</Tooltip>
	</TooltipProvider>
{/if}

{#snippet EventContent(event: EventDetails)}
	<div class="space-y-2 p-2">
		<div class="flex items-center gap-2">
			<div
				class={`h-3 w-3 rounded-full bg-${event.type === 'meeting' ? 'blue' : event.type === 'seminar' ? 'green' : 'red'}-500 dark:bg-${event.type === 'meeting' ? 'blue' : event.type === 'conference' ? 'green' : 'red'}-300`}
			></div>
			<h4 class="font-medium">{event.event_name}</h4>
		</div>
		<div class="space-y-1 text-xs text-muted-foreground">
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
