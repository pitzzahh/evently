<script lang="ts">
	import { COLLECTIONS } from '@/db';
	import type { AttendanceRecord, EventSchedule, Participant } from '@/db/models/types';
	import { generateFullName } from '@/utils/text';
	import SvgQR from '@svelte-put/qr/svg/QR.svelte';
	import { watch } from 'runed';
	import { page } from '$app/state';
	import { Badge } from '@/components/ui/badge';
	import { formatDate, formatDateToTimeOption } from '@/utils/format';
	import { cn } from '@/utils';

	interface Props {
		participant: Participant;
	}

	interface ComponentState {
		event_schedules: EventSchedule[];
		participant_attendance: AttendanceRecord[];
	}

	let { participant }: Props = $props();
	let comp_state = $state<ComponentState>({
		event_schedules: [],
		participant_attendance: []
	});

	watch([() => COLLECTIONS.EVENT_SCHEDULE_COLLECTION.isLoading()], () => {
		const event_id = page.params.id;

		const event_schedule_cursor = COLLECTIONS.EVENT_SCHEDULE_COLLECTION.find({
			event_id
		});
		const participant_attendance_cursor = COLLECTIONS.ATTENDANCE_RECORDS_COLLECTION.find({
			event_id
		});

		comp_state.participant_attendance = participant_attendance_cursor.fetch();
		comp_state.event_schedules = event_schedule_cursor.fetch();

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

		<div class="h-[400px] overflow-auto">
			<div class="grid w-full gap-2">
				{#each comp_state.event_schedules as event_schedule}
					{@const participant_attendance = comp_state.participant_attendance.find(
						(p) => event_schedule.day === p.day
					)}
					<div class="grid gap-4 rounded-lg border p-4">
						<div class="flex gap-2">
							<Badge>Day {event_schedule.day}</Badge>
							<Badge variant="outline">{formatDate(event_schedule.event_date)}</Badge>
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
