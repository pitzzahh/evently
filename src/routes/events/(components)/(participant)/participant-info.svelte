<script lang="ts">
	import { COLLECTIONS } from '@/db';
	import type {
		AttendanceRecord,
		EventDetails,
		EventSchedule,
		Participant
	} from '@/db/models/types';
	import { generateFullName } from '@/utils/text';
	import SvgQR from '@svelte-put/qr/svg/QR.svelte';
	import { watch } from 'runed';
	import { page } from '$app/state';
	import { Badge } from '@/components/ui/badge';
	import { formatDate, formatDateToTimeOption } from '@/utils/format';
	import { cn } from '@/utils';
	import { checkEventStatus, getEventDayInfo } from '@routes/events/utils';
	import { tick } from 'svelte';
	import * as RadioGroup from '$lib/components/ui/radio-group/index.js';
	import { effect } from '@maverick-js/signals';

	interface ParticipantInfoProps {
		participant: Participant;
		event_details: EventDetails;
	}

	let filter_attendance_statuses = [
		{ label: 'All', value: 'all' },
		{ label: 'Complete', value: 'complete' },
		{ label: 'Incomplete', value: 'incomplete' },
		{ label: 'Absent', value: 'complete' }
	] as const;

	interface ComponentState {
		event_schedules: EventSchedule[];
		participant_attendance: AttendanceRecord[];
		filtered_attendance_status: (typeof filter_attendance_statuses)[number]['value'];
	}

	let { participant, event_details }: ParticipantInfoProps = $props();
	let comp_state = $state<ComponentState>({
		event_schedules: [],
		participant_attendance: [],
		filtered_attendance_status: 'all'
	});

	effect(() => {
		const event_id = page.params.id;

		const event_schedule_cursor = COLLECTIONS.EVENT_SCHEDULE_COLLECTION.find({
			event_id
		});
		const participant_attendance_cursor = COLLECTIONS.ATTENDANCE_RECORDS_COLLECTION.find({
			participant_id: participant.id,
			event_id
		});

		comp_state.participant_attendance = participant_attendance_cursor.fetch();
		comp_state.event_schedules = event_schedule_cursor.fetch();
		tick().then(() => {
			const currentDay = getEventDayInfo(
				event_details.start_date,
				event_details.end_date,
				new Date()
			).currentDay;
			const current_day_card = document.getElementById(`day_${currentDay}`);
			current_day_card?.scrollIntoView({ behavior: 'smooth' });
			setTimeout(() => current_day_card?.focus(), 500);
		});
		$inspect(comp_state.participant_attendance);
	});
</script>

<div class="flex items-center gap-4">
	<div class="bg-white p-2">
		<SvgQR
			data={participant.id}
			logoRatio={107 / 128}
			shape="circle"
			width="250"
			height="250"
			color="black"
		/>
	</div>

	<div class="grid w-full gap-4">
		<div>
			<h4 class="text-lg font-medium">
				{generateFullName(
					{
						first_name: participant.first_name,
						last_name: participant.last_name,
						middle_name: participant.middle_name
					},
					{ include_last_name: true }
				)}
			</h4>

			<p class="text-sm text-muted-foreground">
				{participant.email}
			</p>
		</div>

		<div class="w-full border-t-2 border-dashed"></div>

		<div class="grid h-[400px] gap-4 overflow-auto">
			<!-- FILTERS -->
			<fieldset class="space-y-4">
				<RadioGroup.Root value="all" name="spacing" class="grid grid-cols-4 gap-2">
					{#each filter_attendance_statuses as f, idx}
						<label
							for={`${idx}-${f.value}`}
							class="has-data-[state=checked]:border-ring shadow-xs has-data-disabled:cursor-not-allowed has-data-disabled:opacity-50 relative flex cursor-pointer flex-col items-center gap-3 rounded-md border border-input px-2 py-3 text-center outline-none transition-[color,box-shadow] focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50"
						>
							<RadioGroup.Item
								id={`${idx}-${f.value}`}
								value={f.value}
								class="sr-only after:absolute after:inset-0"
							/>
							<p class="text-sm font-medium leading-none text-foreground">{f.label}</p>
						</label>
					{/each}
				</RadioGroup.Root>
			</fieldset>

			<div class="grid w-full gap-2">
				{#each comp_state.event_schedules as event_schedule}
					{@const participant_attendance = comp_state.participant_attendance.find(
						(p) => event_schedule.day.toString() === p.day
					)}
					{@const event_day_status = checkEventStatus(
						event_schedule.am_start,
						event_schedule.pm_end
					)}
					{@const attendance_status =
						participant_attendance?.am_time_in && participant_attendance.pm_time_in
							? 'complete'
							: participant_attendance?.am_time_in || participant_attendance?.pm_time_in
								? 'incomplete'
								: 'absent'}
					<div
						class="grid gap-4 rounded-lg border p-4"
						id="day_{event_schedule.day}"
						aria-label="Day {event_schedule.day} attendance details"
						tabindex="-1"
					>
						<div class="flex items-center justify-between">
							<div class="flex gap-2">
								<Badge>Day {event_schedule.day}</Badge>
								<Badge variant="outline">{formatDate(event_schedule.event_date)}</Badge>
							</div>
							{#if event_day_status === 'finished'}
								<Badge
									class={cn('bg-green-600 hover:bg-green-600/90', {
										'bg-yellow-600 hover:bg-yellow-600/90': attendance_status === 'incomplete',
										'bg-red-600 hover:bg-red-600/90': attendance_status === 'absent'
									})}
									>{attendance_status === 'absent'
										? 'Absent'
										: attendance_status === 'complete'
											? 'Complete Attendance'
											: 'Incomplete Attendance'}
								</Badge>
							{/if}
						</div>

						<div class="grid gap-4">
							{@render time_period_panel({
								event_period_start: event_schedule?.am_start,
								event_period_end: event_schedule?.am_end,
								time_in: participant_attendance?.am_time_in,
								time_out: participant_attendance?.am_time_out,
								period: 'AM'
							})}

							{@render time_period_panel({
								event_period_start: event_schedule?.pm_start,
								event_period_end: event_schedule?.pm_end,
								time_in: participant_attendance?.pm_time_in,
								time_out: participant_attendance?.pm_time_out,
								period: 'PM'
							})}
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>

{#snippet time_period_panel({
	event_period_start,
	event_period_end,
	time_in,
	time_out,
	period
}: {
	event_period_start?: Date;
	event_period_end?: Date;
	time_in?: Date;
	time_out?: Date;
	period: 'AM' | 'PM';
})}
	<div class="grid gap-2">
		<p class="font-semibold">{period} Time</p>
		<div class="flex items-center justify-between gap-4">
			<div class="grid w-full gap-1 rounded-lg border-2 border-dashed p-4">
				<p class="text-sm font-medium">In</p>

				<div class="flex gap-2">
					<p class="text-sm text-muted-foreground">Scheduled Time</p>
					<Badge variant="outline">{formatDateToTimeOption(event_period_start)}</Badge>
				</div>

				<div class="flex gap-2">
					<p class="text-sm text-muted-foreground">Time In</p>

					<Badge
						variant="outline"
						class={cn({
							'text-red-500': !time_in
						})}
					>
						{time_in ? formatDateToTimeOption(time_in) : 'No time in'}
					</Badge>
				</div>
			</div>

			<div class="grid w-full gap-1 rounded-lg border-2 border-dashed p-4">
				<p class="text-sm font-medium">Out</p>

				<div class="flex gap-2">
					<p class="text-sm text-muted-foreground">Scheduled Time</p>
					<Badge variant="outline">{formatDateToTimeOption(event_period_end)}</Badge>
				</div>

				<div class="flex gap-2">
					<p class="text-sm text-muted-foreground">Time Out</p>

					<Badge
						variant="outline"
						class={cn({
							'text-red-500': !time_out
						})}
					>
						{time_out ? formatDateToTimeOption(time_out) : 'No time out'}
					</Badge>
				</div>
			</div>
		</div>
	</div>
{/snippet}
