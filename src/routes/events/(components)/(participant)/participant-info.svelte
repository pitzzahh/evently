<script lang="ts">
	import { COLLECTIONS } from '@/db';
	import type {
		AttendanceRecord,
		EventDetails,
		EventSchedule,
		Participant,
		ParticipantAttendance
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
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Calendar, ListFilter } from 'lucide-svelte';
	import { Button, buttonVariants } from '@/components/ui/button';
	// import PhotoPreviewer from '@/components/custom/photo-previewer/photo-previewer.svelte';

	// import { createQrPngDataUrl } from '@svelte-put/qr';
	// import { onMount } from 'svelte';

	interface ParticipantInfoProps {
		participant: Participant;
		event_details: EventDetails;
	}

	let filter_attendance_statuses = [
		{ label: 'All', value: 'all' },
		{ label: 'Complete', value: 'complete' },
		{ label: 'Incomplete', value: 'incomplete' },
		{ label: 'Absent', value: 'absent' }
	] as const;

	interface ComponentState {
		event_schedules: EventSchedule[];
		participant_attendance: AttendanceRecord[];
		filtered_attendance_status: (typeof filter_attendance_statuses)[number]['value'];
		qr_src: string;
	}

	let { participant, event_details }: ParticipantInfoProps = $props();
	let comp_state = $state<ComponentState>({
		event_schedules: [],
		participant_attendance: [],
		filtered_attendance_status: 'all',
		qr_src: ''
	});

	watch(
		[
			() => COLLECTIONS.EVENT_SCHEDULE_COLLECTION.isLoading(),
			() => COLLECTIONS.ATTENDANCE_RECORDS_COLLECTION.isLoading(),
			() => comp_state.filtered_attendance_status
		],
		() => {
			const event_id = page.params.id;

			const event_schedule_cursor = COLLECTIONS.EVENT_SCHEDULE_COLLECTION.find({
				event_id
			});
			const participant_attendance_cursor = COLLECTIONS.ATTENDANCE_RECORDS_COLLECTION.find({
				participant_id: participant.id,
				event_id
			});

			comp_state.participant_attendance = participant_attendance_cursor.fetch();

			comp_state.event_schedules = event_schedule_cursor.fetch().filter((event_sched) => {
				const event_day_status = checkEventStatus(event_sched.am_start, event_sched.pm_end);
				const is_finished = event_day_status === 'finished';

				if (comp_state.filtered_attendance_status === 'all') {
					return true;
				}

				const participant_attendance = comp_state.participant_attendance.find(
					(p) => event_sched.day.toString() === p.day.toString()
				);

				if (!participant_attendance && is_finished) {
					return comp_state.filtered_attendance_status === 'absent';
				}

				return (
					is_finished &&
					getAttendanceStatus(participant_attendance) === comp_state.filtered_attendance_status
				);
			});

			$inspect(comp_state.participant_attendance);

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

			return () => {
				participant_attendance_cursor.cleanup();
				event_schedule_cursor.cleanup();
			};
		}
	);

	function getAttendanceStatus(participant_attendance?: ParticipantAttendance) {
		return participant_attendance?.am_time_in && participant_attendance?.pm_time_in
			? 'complete'
			: participant_attendance?.am_time_in || participant_attendance?.pm_time_in
				? 'incomplete'
				: 'absent';
	}

	function getTimeDifference(date1: Date, date2: Date) {
		// Truncate seconds and milliseconds by setting them to 0
		const truncatedDate1 = new Date(date1);
		truncatedDate1.setSeconds(0, 0);

		const truncatedDate2 = new Date(date2);
		truncatedDate2.setSeconds(0, 0);

		// Calculate the absolute difference in milliseconds
		const diffMs = Math.abs(truncatedDate1.getTime() - truncatedDate2.getTime());

		// Convert to minutes
		const diffMinutes = Math.floor(diffMs / (1000 * 60));

		// Calculate hours and remaining minutes
		const hours = Math.floor(diffMinutes / 60);
		const minutes = diffMinutes % 60;

		if (!minutes && !hours) {
			return;
		}

		// Return formatted string
		return `${hours ? `${hours} hour${hours > 1 ? 's' : ''} ` : ''}${minutes} minute${minutes > 1 ? 's' : ''}`;
	}

	// onMount(async () => {
	// 	comp_state.qr_src = await createQrPngDataUrl({
	// 		data: participant.id,
	// 		shape: 'circle',
	// 		width: 250,
	// 		height: 250,
	// 		backgroundFill: '#fff'
	// 	});
	// });
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
		<div class="flex justify-between">
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

			<!-- FILTERS -->
			<Popover.Root>
				<Popover.Trigger
					class={cn(
						'relative',
						buttonVariants({ size: 'icon', variant: 'outline' }),
						comp_state.filtered_attendance_status !== 'all' && 'border-blue-500'
					)}
				>
					{#if comp_state.filtered_attendance_status !== 'all'}
						<div class="absolute -right-1 -top-1 size-3 rounded-full bg-blue-500"></div>
					{/if}
					<ListFilter class="size-4" />
				</Popover.Trigger>
				<Popover.Content class="w-auto" side="left">
					<p class="mb-1 text-sm font-medium">Filters</p>
					<fieldset class="sticky top-0 space-y-4 bg-background">
						<RadioGroup.Root
							bind:value={comp_state.filtered_attendance_status}
							name="spacing"
							class="grid grid-cols-4 gap-2"
						>
							{#each filter_attendance_statuses as f, idx}
								<label
									for={`${idx}-${f.value}`}
									class="[&:has([data-state=checked])>div>p]:text-white [&:has([data-state=checked])>div]:border-primary [&:has([data-state=checked])>div]:bg-primary"
								>
									<RadioGroup.Item
										id={`${idx}-${f.value}`}
										value={f.value}
										class="sr-only after:absolute after:inset-0"
									/>
									<div
										class="relative flex cursor-pointer flex-col items-center rounded-full border px-2 py-1 text-center"
									>
										<p class="text-xs font-medium text-foreground">{f.label}</p>
									</div>
								</label>
							{/each}
						</RadioGroup.Root>
					</fieldset>
				</Popover.Content>
			</Popover.Root>
		</div>

		<div class="w-full border-t-2 border-dashed"></div>

		<div class="relative grid h-[400px] gap-4 overflow-auto">
			{#if comp_state.event_schedules.length === 0 && comp_state.filtered_attendance_status !== 'all'}
				<div class="grid h-[350px] place-content-center">
					<div class="grid place-items-center gap-2">
						<Calendar class="size-[4rem] text-muted-foreground/80" />
						<div class="grid place-items-center gap-1">
							<h2 class="text-xl font-medium text-muted-foreground">No event day found</h2>
							<p class="text-sm text-muted-foreground">
								{#if comp_state.filtered_attendance_status === 'complete'}
									No days with complete attendance records found.
								{:else if comp_state.filtered_attendance_status === 'incomplete'}
									No days with incomplete attendance records found.
								{:else if comp_state.filtered_attendance_status === 'absent'}
									No days with absence records found.
								{:else}
									No attendance records match the selected filter.
								{/if}
							</p>
						</div>
						<Button
							variant="outline"
							size="sm"
							onclick={() => (comp_state.filtered_attendance_status = 'all')}>Reset filter</Button
						>
					</div>
				</div>
			{/if}
			<div class="grid w-full gap-2">
				{#each comp_state.event_schedules as event_schedule}
					{@const participant_attendance = comp_state.participant_attendance.find(
						(p) => event_schedule.day.toString() === p.day.toString()
					)}
					{@const event_day_status = checkEventStatus(
						event_schedule.am_start,
						event_schedule.pm_end
					)}
					{@const attendance_status = getAttendanceStatus(participant_attendance)}
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
								time_late:
									participant_attendance?.am_time_in && event_schedule.am_start
										? getTimeDifference(participant_attendance?.am_time_in, event_schedule.am_start)
										: undefined,
								time_out: participant_attendance?.am_time_out,
								period: 'AM'
							})}

							{@render time_period_panel({
								event_period_start: event_schedule?.pm_start,
								event_period_end: event_schedule?.pm_end,
								time_in: participant_attendance?.pm_time_in,
								time_late:
									participant_attendance?.pm_time_in && event_schedule.pm_start
										? getTimeDifference(participant_attendance?.pm_time_in, event_schedule.pm_start)
										: undefined,
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
	time_late,
	period
}: {
	event_period_start?: Date;
	event_period_end?: Date;
	time_in?: Date;
	time_out?: Date;
	time_late?: string;
	period: 'AM' | 'PM';
})}
	<div class="grid gap-2">
		<p class="font-semibold">{period} Time</p>
		<div class="flex items-start justify-between gap-4">
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

				{#if time_late}
					<div class="flex gap-2">
						<p class="text-sm text-muted-foreground">Time Late</p>
						<Badge variant="outline" class="text-yellow-500">
							{time_late}
						</Badge>
					</div>
				{/if}
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
