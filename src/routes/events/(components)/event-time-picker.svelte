<script lang="ts">
	import type { EventDateTime } from './event-form.svelte';
	import TimeComboBox from './time-combo-box.svelte';
	import { time_options } from '@/constants';

	let { event_date }: { event_date: EventDateTime } = $props();
	let formatted_date = formatDate(event_date.date);

	function formatDate(date: Date): string {
		return date.toLocaleDateString('en-US', {
			weekday: 'short',
			month: 'short',
			day: 'numeric'
		});
	}

	// TODO: PUT THE UPDATED START AND END TIME IN THE ARRAY STATE OF EVENT DATES
	let am_start_time = $state('8:00 AM');
	let am_end_time = $state('12:00 PM');
	let pm_start_time = $state('1:00 PM');
	let pm_end_time = $state('5:00 PM');

	function getFilteredEndTimes(startTime: string) {
		const startIndex = time_options.indexOf(startTime);
		return time_options.slice(startIndex + 1);
	}

	// automatically change the end time if theres some changes in start time
	$effect(() => {
		am_end_time = getFilteredEndTimes(am_start_time).at(0) as string;
		pm_end_time = getFilteredEndTimes(pm_start_time).at(0) as string;
	});
</script>

<div class="flex w-full gap-2">
	<div class="flex w-full items-center gap-2 rounded-lg bg-gray-700/10 p-4 dark:bg-white/10">
		{@render start_end_pattern()}

		<div class="flex w-full flex-col gap-1">
			<!-- AM START -->
			<div class="flex items-center justify-between">
				<p class="text-sm text-muted-foreground">AM Start</p>
				<div class="flex items-center gap-1">
					<p class="w-[100px] rounded-bl-sm rounded-tl-sm bg-background p-2 text-center text-sm">
						{formatted_date}
					</p>
					<TimeComboBox {time_options} bind:selected_time={am_start_time} />
				</div>
			</div>
			<!-- AM END -->
			<div class="flex items-center justify-between">
				<p class="text-sm text-muted-foreground">AM End</p>

				<div class="flex items-center gap-1">
					<p class="w-[100px] rounded-bl-sm rounded-tl-sm bg-background p-2 text-center text-sm">
						{formatted_date}
					</p>
					<TimeComboBox
						time_options={getFilteredEndTimes(am_start_time)}
						bind:selected_time={am_end_time}
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
				<p class="text-sm text-muted-foreground">PM Start</p>
				<div class="flex items-center gap-1">
					<p class="w-[100px] rounded-bl-sm rounded-tl-sm bg-background p-2 text-center text-sm">
						{formatted_date}
					</p>
					<TimeComboBox {time_options} bind:selected_time={pm_start_time} />
				</div>
			</div>
			<!-- PM END -->
			<div class="flex items-center justify-between">
				<p class="text-sm text-muted-foreground">PM End</p>

				<div class="flex items-center gap-1">
					<p class="w-[100px] rounded-bl-sm rounded-tl-sm bg-background p-2 text-center text-sm">
						{formatted_date}
					</p>
					<TimeComboBox
						time_options={getFilteredEndTimes(pm_start_time)}
						bind:selected_time={pm_end_time}
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
