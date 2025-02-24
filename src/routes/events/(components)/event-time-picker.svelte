<script lang="ts">
	import type { EventDateTime } from './event-form.svelte';
	import TimeComboBox from './time-combo-box.svelte';
	import { time_options } from '@/constants';

	let {
		event_date,
		day,
		updateDateEventPeriodStartEnd
	}: {
		event_date: EventDateTime;
		updateDateEventPeriodStartEnd: (params: {
			id: string;
			am_start?: string;
			am_end?: string;
			pm_start?: string;
			pm_end?: string;
		}) => void;
		day: number;
	} = $props();
	let formatted_date = formatDate(event_date.date);

	function formatDate(date: Date): string {
		return date.toLocaleDateString('en-US', {
			weekday: 'short',
			month: 'short',
			day: 'numeric'
		});
	}

	function getFilteredEndTimes(startTime: string) {
		const startIndex = time_options.indexOf(startTime);
		return time_options.slice(startIndex + 1);
	}
</script>

<div class="flex w-full gap-2">
	<div class="flex w-full items-center gap-2 rounded-lg bg-gray-700/10 p-4 dark:bg-white/10">
		{@render start_end_pattern()}

		<div class="flex w-full flex-col gap-1">
			<!-- AM START -->
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-2">
					<p class="text-sm text-muted-foreground">AM Start</p>
					<p class="rounded-sm border bg-primary px-3 py-1 text-xs">Day {day}</p>
				</div>

				<div class="flex items-center gap-1">
					<p
						class="w-[120px] rounded-bl-sm rounded-tl-sm border bg-background p-2 text-center text-sm"
					>
						{formatted_date}
					</p>
					<TimeComboBox
						{time_options}
						selected_time={event_date.am_start}
						onTimeSelect={(time) => {
							updateDateEventPeriodStartEnd({ id: event_date.id, am_start: time });
						}}
					/>
				</div>
			</div>
			<!-- AM END -->
			<div class="flex items-center justify-between">
				<p class="text-sm text-muted-foreground">AM End</p>

				<div class="flex items-center gap-1">
					<p
						class="w-[120px] rounded-bl-sm rounded-tl-sm border bg-background p-2 text-center text-sm"
					>
						{formatted_date}
					</p>
					<TimeComboBox
						time_options={getFilteredEndTimes(event_date.am_start)}
						selected_time={event_date.am_end}
						onTimeSelect={(time) => {
							updateDateEventPeriodStartEnd({ id: event_date.id, am_end: time });
						}}
					/>
				</div>
			</div>
		</div>
	</div>
	<div class="flex w-full items-center gap-2 rounded-lg bg-gray-700/10 p-4 dark:bg-white/10">
		{@render start_end_pattern()}

		<div class="flex w-full flex-col gap-1">
			<!-- PM START -->
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-2">
					<p class="text-sm text-muted-foreground">PM Start</p>
					<p class="rounded-sm border bg-primary px-3 py-1 text-xs">Day {day}</p>
				</div>
				<div class="flex items-center gap-1">
					<p
						class="w-[120px] rounded-bl-sm rounded-tl-sm border bg-background p-2 text-center text-sm"
					>
						{formatted_date}
					</p>
					<TimeComboBox
						{time_options}
						selected_time={event_date.pm_start}
						onTimeSelect={(time) => {
							updateDateEventPeriodStartEnd({ id: event_date.id, pm_start: time });
						}}
					/>
				</div>
			</div>
			<!-- PM END -->
			<div class="flex items-center justify-between">
				<p class="text-sm text-muted-foreground">PM End</p>

				<div class="flex items-center gap-1">
					<p
						class="w-[120px] rounded-bl-sm rounded-tl-sm border bg-background p-2 text-center text-sm"
					>
						{formatted_date}
					</p>
					<TimeComboBox
						time_options={getFilteredEndTimes(event_date.pm_start)}
						selected_time={event_date.pm_end}
						onTimeSelect={(time) => {
							updateDateEventPeriodStartEnd({ id: event_date.id, pm_end: time });
						}}
					/>
				</div>
			</div>
		</div>
	</div>
</div>

{#snippet start_end_pattern()}
	<div class="flex flex-col items-center gap-1">
		<div class="size-3 rounded-full border bg-gray-400"></div>
		<div class="h-6 border-s-2 border-dashed border-gray-400"></div>
		<div class="size-3 rounded-full border border-gray-400"></div>
	</div>
{/snippet}
