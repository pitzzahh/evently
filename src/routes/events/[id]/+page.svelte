<script lang="ts">
	import { Button } from '@/components/ui/button';
	import {
		Calendar,
		ChartBar,
		MapPin,
		Settings,
		UsersRound,
		Edit,
		Trash,
		View,
		Clock
	} from '@/assets/icons';
	import * as Avatar from '@/components/ui/avatar';
	import { cn } from '@/utils/styles';
	import { EventTimePicker } from '@routes/events/(components)';
	import * as DropdownMenu from '@/components/ui/dropdown-menu/index.js';
	import type { EventSchedule, EventDetails } from '@/db/models/types';
	import { fly, slide } from 'svelte/transition';
	import { COLLECTIONS } from '@/db/index';
	import type { Participant } from '@/db/models/types';
	import { formatDateTime, formatDateToTimeOption } from '@/utils/format';
	import { watch } from 'runed';
	import { StatusPill } from '@/components/snippets';
	import { goto } from '$app/navigation';
	import { checkEventStatus, getEventDayInfo } from '../utils/index.js';
	import * as Dialog from '@/components/ui/dialog';
	import { onMount } from 'svelte';
	import { Image } from 'lucide-svelte';
	import { quartInOut } from 'svelte/easing';
	import Badge from '@/components/ui/badge/badge.svelte';
	import Separator from '@/components/ui/separator/separator.svelte';
	import PhotoPreviewer from '@/components/custom/photo-previewer/photo-previewer.svelte';

	let { data } = $props();

	interface ComponentState {
		event_details: EventDetails | undefined;
		event_schedules: EventSchedule[];
		participants: Participant[];
		see_more: boolean;
		confimation_open: boolean;
		num_of_absents: number;
		num_of_presents: number;
		num_of_incomplete_attendance: number;
	}

	let comp_state = $state<ComponentState>({
		event_details: undefined,
		event_schedules: [],
		participants: [],
		see_more: true,
		confimation_open: false,
		num_of_absents: 0,
		num_of_incomplete_attendance: 0,
		num_of_presents: 0
	});

	const event_status = $derived(
		checkEventStatus(comp_state.event_details?.start_date, comp_state.event_details?.end_date)
	);
	const current_event_day = $derived(
		comp_state.event_details
			? getEventDayInfo(
					comp_state.event_details.start_date,
					comp_state.event_details.end_date,
					new Date()
				).currentDay
			: null
	);

	function getCountByAttendanceStatus(
		attendance_status: 'complete' | 'incomplete' | 'absent',
		event_days: number
	) {
		const participants_cursor = COLLECTIONS.PARTICIPANT_COLLECTION.find({
			event_id: data.event_id
		});
		const all_participants_attendance_cursor = COLLECTIONS.ATTENDANCE_RECORDS_COLLECTION.find({
			event_id: data.event_id
		});

		const total_num = participants_cursor.fetch().reduce((acc, participant) => {
			const total_days_attended = all_participants_attendance_cursor
				.fetch()
				.reduce((acc, participant_attendance) => {
					if (
						participant_attendance.participant_id === participant.id &&
						participant_attendance.am_time_in &&
						participant_attendance.pm_time_in
					) {
						return acc + 1;
					}
					return acc;
				}, 0);

			switch (attendance_status) {
				case 'complete':
					if (event_days === total_days_attended) {
						return acc + 1;
					}
					break;
				case 'incomplete':
					if (event_days && event_days < total_days_attended) {
						return acc + 1;
					}
					break;
				case 'absent':
					if (total_days_attended === 0) {
						return acc + 1;
					}
					break;
				default:
					return acc;
			}
			return acc;
		}, 0);

		return total_num;
	}

	watch(
		[
			() => COLLECTIONS.PARTICIPANT_COLLECTION.isLoading(),
			() => COLLECTIONS.EVENT_SCHEDULE_COLLECTION.isLoading(),
			() => COLLECTIONS.EVENT_DETAILS_COLLECTION.isLoading(),
			() => COLLECTIONS.ATTENDANCE_RECORDS_COLLECTION.isLoading()
		],
		() => {
			const participants_cursor = COLLECTIONS.PARTICIPANT_COLLECTION.find({
				event_id: data.event_id
			});
			const event_schedule_cursor = COLLECTIONS.EVENT_SCHEDULE_COLLECTION.find({
				event_id: data.event_id
			});

			comp_state.event_details = COLLECTIONS.EVENT_DETAILS_COLLECTION.findOne({
				id: data.event_id
			});

			comp_state.participants = participants_cursor.fetch();
			comp_state.event_schedules = event_schedule_cursor.fetch();

			if (comp_state.event_details) {
				// event stats data
				comp_state.num_of_absents = getCountByAttendanceStatus(
					'absent',
					comp_state.event_details?.difference_in_days
				);
				comp_state.num_of_presents = getCountByAttendanceStatus(
					'complete',
					comp_state.event_details.difference_in_days
				);
				comp_state.num_of_incomplete_attendance = getCountByAttendanceStatus(
					'incomplete',
					comp_state.event_details.difference_in_days
				);
			}

			$inspect(
				comp_state.event_details?.start_date && comp_state.event_details.start_date > new Date()
			);
			return () => {
				participants_cursor.cleanup();
				event_schedule_cursor.cleanup();
			};
		}
	);

	onMount(() => {
		if (!comp_state.event_details) {
			const error_content = {
				status: 404,
				message: 'Event not found'
			};
			goto(`/events/${data.event_id}?error_content=${JSON.stringify(error_content)}`);
		}
	});

	function handleDeleteEvent() {
		if (comp_state.event_details) {
			const id = comp_state.event_details.id;

			goto('/');

			COLLECTIONS.EVENT_DETAILS_COLLECTION.removeOne({
				id
			});
			COLLECTIONS.PARTICIPANT_COLLECTION.removeMany({
				event_id: id
			});
			COLLECTIONS.ATTENDANCE_RECORDS_COLLECTION.removeMany({
				event_id: id
			});
			COLLECTIONS.EVENT_SCHEDULE_COLLECTION.removeMany({
				event_id: id
			});

			comp_state.confimation_open = false;
		}
	}
</script>

<div in:fly={{ y: 20 }} class="grid gap-4">
	<div class="flex items-start gap-6 border-b-2 border-dashed pb-6">
		<PhotoPreviewer image_src={comp_state.event_details?.cover!} />

		<div class="flex w-full flex-1 flex-col gap-4">
			<div class="flex w-full items-start justify-between gap-4">
				<h2 class="text-4xl font-semibold xl:text-5xl">
					{comp_state.event_details?.event_name ?? 'N/A'}
				</h2>
				<div class="grid gap-2">
					<div class="flex items-center gap-2">
						<Button
							size="lg"
							href={`/events/participants/${comp_state.event_details?.id}`}
							class="rounded-lg border px-4 py-3 text-sm"
						>
							<View class="size-5" />
							View Participants
						</Button>
						<Dialog.Root
							open={comp_state.confimation_open}
							onOpenChange={(value) => (comp_state.confimation_open = value)}
						>
							<DropdownMenu.Root>
								<DropdownMenu.Trigger>
									<button class="rounded-md border p-3"><Settings class="size-5" /></button>
								</DropdownMenu.Trigger>
								<DropdownMenu.Content side="bottom" align="end" sideOffset={10}>
									<DropdownMenu.Group>
										<DropdownMenu.Item
											onclick={() => {
												if (comp_state.event_details?.id) {
													goto(`/events/edit/${comp_state.event_details?.id}`);
												}
											}}><Edit class="size-4" /> Edit event</DropdownMenu.Item
										>
										<DropdownMenu.Item
											onclick={() => (comp_state.confimation_open = true)}
											class="!text-red-600 hover:!bg-red-600/20"
											><Trash class="size-4" />Delete event</DropdownMenu.Item
										>
									</DropdownMenu.Group>
								</DropdownMenu.Content>
							</DropdownMenu.Root>

							<Dialog.Content>
								<Dialog.Header>
									<Dialog.Title>Remove Event</Dialog.Title>
									<Dialog.Description>
										This action cannot be undone. Are you sure you want to permanently delete this
										event?
									</Dialog.Description>
								</Dialog.Header>
								<Dialog.Footer>
									<Button class="bg-red-600 hover:!bg-red-600/80" onclick={handleDeleteEvent}
										>Delete</Button
									>
									<Button variant="outline" onclick={() => (comp_state.confimation_open = false)}
										>Cancel</Button
									>
								</Dialog.Footer>
							</Dialog.Content>
						</Dialog.Root>
					</div>
					{@render StatusPill(event_status)}
				</div>
			</div>

			<!-- EVENT DETAILS -->
			<div class="grid w-full grid-cols-2 grid-rows-2 gap-4">
				<div class="flex items-center gap-3">
					<div class="rounded-md border p-3">
						<Calendar class="size-5 text-muted-foreground" />
					</div>

					<div class="flex gap-4">
						<!-- START DATE -->
						<div>
							<p class="text-base font-medium">
								{formatDateTime(comp_state.event_details?.start_date)}
							</p>
							<p class="text-sm text-muted-foreground">
								{formatDateToTimeOption(comp_state.event_schedules.at(0)?.am_start)} - {formatDateToTimeOption(
									comp_state.event_schedules.at(0)?.pm_end
								)}
							</p>
						</div>

						<Separator orientation="vertical" />

						<!-- END DATE -->
						<div>
							<p class="text-base font-medium">
								{formatDateTime(comp_state.event_details?.end_date)}
							</p>
							<p class="text-sm text-muted-foreground">
								{formatDateToTimeOption(comp_state.event_schedules.at(-1)?.am_start)} - {formatDateToTimeOption(
									comp_state.event_schedules.at(-1)?.pm_end
								)}
							</p>
						</div>
					</div>
				</div>

				<div class="flex items-center gap-3">
					<div class="rounded-md border p-3">
						<Clock class="size-5 text-muted-foreground" />
					</div>

					<div>
						<p class="text-base font-medium">
							{comp_state.event_details?.difference_in_days}
							{comp_state.event_details?.difference_in_days &&
							comp_state.event_details?.difference_in_days > 1
								? 'days'
								: 'day'} event
						</p>
						<p class="text-sm text-muted-foreground">Duration</p>
					</div>
				</div>

				<div class="flex items-center gap-3">
					<div class="rounded-md border p-3">
						<UsersRound class="size-5 text-muted-foreground" />
					</div>
					<div>
						<p class="text-base font-medium">{comp_state.participants.length}</p>
						<p class="text-sm text-muted-foreground">
							Participant{comp_state.participants.length > 1 ? 's' : ''}
						</p>
					</div>
				</div>

				<div class="flex items-center gap-3">
					<div class="rounded-md border p-3">
						<MapPin class="size-5 text-muted-foreground" />
					</div>
					<div>
						<p class="text-base font-medium">{comp_state.event_details?.location ?? 'N/A'}</p>
						<p class="text-sm text-muted-foreground">Location</p>
					</div>
				</div>
			</div>
		</div>
	</div>

	<div
		class="grid w-full gap-2 overflow-hidden rounded-lg border bg-white/40 p-2 backdrop-blur-lg backdrop-filter transition-all duration-300 dark:bg-[#151e28]/20"
	>
		<p
			class="h-auto w-full rounded-tl-md rounded-tr-md border bg-white px-3 py-2 text-sm font-medium dark:bg-[#151e28]"
		>
			Description
		</p>
		<div class="px-3 py-2">
			<p class={cn('text-muted-foreground', !!!comp_state.event_details?.description && 'italic')}>
				{comp_state.event_details?.description || 'No description'}
			</p>
		</div>
	</div>

	<Button
		variant="outline"
		class="place-self-end"
		onclick={() => (comp_state.see_more = !comp_state.see_more)}
	>
		{comp_state.see_more ? 'See Less' : 'See More'}
	</Button>

	{#if comp_state.see_more}
		<div
			transition:slide={{ axis: 'y', duration: 400, easing: quartInOut }}
			class={cn(
				'grid gap-3 overflow-hidden rounded-lg border bg-white p-4 transition-all duration-300 dark:bg-[#151e28]',
				{
					hidden: !comp_state.see_more,
					block: comp_state.see_more
				}
			)}
		>
			<!-- EVENT STATS -->
			<div class="transition-scale grid gap-3 rounded-lg border p-4 duration-300">
				<div class="flex items-center justify-between">
					<h3 class="text-lg font-semibold">Event Stats</h3>
					<div class="rounded-md border border-blue-500 bg-blue-500/20 p-2">
						<ChartBar class="size-5 text-blue-500" />
					</div>
				</div>

				<div class="grid gap-2 text-sm">
					<div class="flex justify-between">
						<p class="text-muted-foreground">Complete Attendance</p>
						{#if event_status !== 'finished'}
							<Badge variant="outline">--:--</Badge>
						{:else}
							<p>{comp_state.num_of_presents}</p>
						{/if}
					</div>
					<div class="flex justify-between">
						<p class="text-muted-foreground">Incomplete Attendance</p>
						{#if event_status !== 'finished'}
							<Badge variant="outline">--:--</Badge>
						{:else}
							<p>{comp_state.num_of_incomplete_attendance}</p>
						{/if}
					</div>
					<div class="flex justify-between">
						<p class="text-muted-foreground">Absents</p>
						{#if event_status !== 'finished'}
							<Badge variant="outline">--:--</Badge>
						{:else}
							<p>{comp_state.num_of_absents}</p>
						{/if}
					</div>
				</div>
			</div>
		</div>
	{/if}
	<div
		class="duration-400 flex max-h-[400px] flex-col gap-2 overflow-y-auto pr-1 transition ease-in-out"
	>
		{#each comp_state.event_schedules as event_date, index}
			<EventTimePicker
				{current_event_day}
				{event_date}
				day={index + 1}
				is_selection_disabled={true}
			/>
		{/each}
	</div>
</div>
