<script lang="ts">
	import type { EventSchedule } from '@/db/models/types';
	import { TimeComboBox } from '..';
	import { time_options } from '@/constants';
	import { formatDate, formatDateToTimeOption } from '@/utils/format';

	let {
		event_date,
		day,
		updateDateEventPeriodStartEnd,
		is_selection_disabled
	}: {
		is_selection_disabled?: boolean;
		event_date: Omit<EventSchedule, 'event_id' | 'updated' | 'created'>;
		updateDateEventPeriodStartEnd?: (params: {
			id: string;
			am_start?: string;
			am_end?: string;
			pm_start?: string;
			pm_end?: string;
		}) => void;
		day: number;
	} = $props();
	let formatted_date = $derived(formatDate(event_date.event_date));

	function getFilteredEndTimes(startTime: string) {
		const startIndex = time_options.indexOf(startTime);
		return time_options.slice(startIndex + 1);
	}

	function getFilteredTimeByPeriod(period: 'AM' | 'PM') {
		return time_options.filter((time) => time.includes(period));
	}
</script>

<div class="flex w-full gap-2 rounded-xl border p-3">
	<div
		class="flex w-full items-center gap-4 rounded-lg border bg-gray-700/10 p-4 dark:bg-[#1C1E20]"
	>
		{@render start_end_pattern()}

		<div class="flex w-full flex-col gap-2">
			<!-- AM START -->
			{@render period_time_picker({
				period_title: 'AM Start',
				time_options: getFilteredTimeByPeriod('AM'),
				selected_time: formatDateToTimeOption(event_date.am_start),
				onTimeSelect: (time) => {
					if (updateDateEventPeriodStartEnd)
						updateDateEventPeriodStartEnd({ id: event_date.id, am_start: time });
				},
				is_selection_disabled
			})}

			<!-- AM END -->
			{@render period_time_picker({
				period_title: 'AM End',
				time_options: getFilteredEndTimes(formatDateToTimeOption(event_date.am_start)),
				selected_time: formatDateToTimeOption(event_date.am_end),
				onTimeSelect: (time) => {
					if (updateDateEventPeriodStartEnd)
						updateDateEventPeriodStartEnd({ id: event_date.id, am_end: time });
				},
				is_selection_disabled
			})}
		</div>
	</div>
	<div class="grid w-[200px] place-items-center gap-1 self-center">
		<p
			class="rounded-md border border-gray-500 bg-gray-500/10 px-2 py-1 text-center text-xs font-medium dark:bg-gray-500/30"
		>
			Day {day}
		</p>
		<p class="text-center text-sm font-medium">
			{formatted_date}
		</p>
	</div>
	<div
		class="flex w-full items-center gap-4 rounded-lg border bg-gray-700/10 p-4 dark:bg-[#1C1E20]"
	>
		{@render start_end_pattern()}

		<div class="flex w-full flex-col gap-2">
			<!-- PM START -->
			{@render period_time_picker({
				period_title: 'PM Start',

				time_options: getFilteredEndTimes(formatDateToTimeOption(event_date.am_end)),
				selected_time: formatDateToTimeOption(event_date.pm_start),
				onTimeSelect: (time) => {
					if (updateDateEventPeriodStartEnd)
						updateDateEventPeriodStartEnd({ id: event_date.id, pm_start: time });
				},
				is_selection_disabled
			})}

			<!-- PM END -->
			{@render period_time_picker({
				period_title: 'PM End',
				time_options: getFilteredEndTimes(formatDateToTimeOption(event_date.pm_start)),
				selected_time: formatDateToTimeOption(event_date.pm_end),
				onTimeSelect: (time) => {
					if (updateDateEventPeriodStartEnd)
						updateDateEventPeriodStartEnd({ id: event_date.id, pm_end: time });
				},
				is_selection_disabled
			})}
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

{#snippet period_time_picker({
	onTimeSelect,
	period_title,
	time_options,
	selected_time,
	is_selection_disabled
}: {
	period_title: string;
	selected_time: string;
	time_options: string[];
	is_selection_disabled?: boolean;
	onTimeSelect: (time: string) => void;
})}
	<div class="flex w-full items-center justify-between">
		<div class="flex items-center gap-2">
			<p class="text-sm text-muted-foreground">{period_title}</p>
		</div>

		<div class="flex items-center gap-1">
			<TimeComboBox
				{time_options}
				{selected_time}
				{onTimeSelect}
				is_disabled={is_selection_disabled}
			/>
		</div>
	</div>
{/snippet}
