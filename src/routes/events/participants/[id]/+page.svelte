<script lang="ts">
	import { Button } from '@/components/ui/button';
	import { Check, Clock, Download, UsersRound } from 'lucide-svelte';
	import {
		AddParticipantsDialog,
		ParticipantDataTable,
		EventTimePicker
	} from '@routes/events/(components)';
	import type { EventSchedule, EventDetails, ParticipantAttendance } from '@/db/models/types';
	import { fly } from 'svelte/transition';
	import { COLLECTIONS } from '@/db/index';
	import type { Participant } from '@/db/models/types';
	import { watch } from 'runed';
	import { TableSkeleton } from '@/components/custom/skeleton/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '@/components/ui/badge';
	import { toast } from 'svelte-sonner';
	import { onMount } from 'svelte';
	import { generateFullName } from '@/utils/text/index.js';
	import ParticipantAttendanceDataTable from '@routes/events/(components)/(participant)/participant-attendance-data-table.svelte';
	import ParticipantAttendanceDataTableToolbar from '@routes/events/(components)/(participant)/participant-attendance-data-table-toolbar.svelte';
	import { getEventDayInfo } from '@routes/events/utils/index.js';

	let { data } = $props();

	interface ComponentState {
		event_details: EventDetails | undefined;
		event_schedules: EventSchedule[];
		participants: Participant[];
		see_more: boolean;
		last_scanned_participant: Participant | null;
		scanned_attendance: any | null;
		participants_attendance: ParticipantAttendance[];
	}

	let comp_state = $state<ComponentState>({
		event_details: undefined,
		event_schedules: [],
		participants: [],
		see_more: true,
		last_scanned_participant: null,
		scanned_attendance: null,
		participants_attendance: []
	});

	let barcode = $state('');
	let timeout = $state<number | null>(null);

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

			comp_state.participants_attendance = getPopulatedAttendanceRecords(
				data.event_id
			) as ParticipantAttendance[];
			comp_state.participants = participants_cursor.fetch();
			comp_state.event_schedules = event_schedule_cursor.fetch();
			comp_state.event_details = COLLECTIONS.EVENT_DETAILS_COLLECTION.findOne({
				id: data.event_id
			});

			return () => {
				participants_cursor.cleanup();
				event_schedule_cursor.cleanup();
			};
		}
	);

	function getPopulatedAttendanceRecords(eventId: string) {
		const attendance_records = COLLECTIONS.ATTENDANCE_RECORDS_COLLECTION.find({
			event_id: eventId
		}).fetch();

		const participantIds = [...new Set(attendance_records.map((record) => record.participant_id))];

		const participants = COLLECTIONS.PARTICIPANT_COLLECTION.find({
			id: { $in: participantIds }
		}).fetch();

		const participant_map = new Map(
			participants.map((participant) => [participant.id, participant])
		);

		// return new combined objects without modifying originals
		return attendance_records
			.map((record) => {
				const participant = participant_map.get(record.participant_id);
				return {
					...record,
					first_name: participant?.first_name,
					middle_name: participant?.middle_name,
					last_name: participant?.last_name,
					email: participant?.email,
					participant
				};
			})
			.sort(
				(a, b) => (b.latest_time_scanned?.getTime() ?? 0) - (a.latest_time_scanned?.getTime() ?? 0)
			);
	}

	/**
	 * Process a completed barcode scan
	 */
	function handleScanParticipant(participant_id: string) {
		if (!comp_state.event_details) {
			toast.error('Event details not available');
			return;
		}

		const now = new Date();
		const period = now.getHours() < 12 ? 'AM' : 'PM';

		const event = COLLECTIONS.EVENT_DETAILS_COLLECTION.findOne({
			id: comp_state.event_details.id
		});

		if (!event) {
			toast.error('Event not found');
			return;
		}

		// validate the event's start date schedule
		if (now < event.start_date) {
			toast.error('Unable to scan - The event has not started yet.');
			return;
		}

		// validate the event's end date schedule
		if (
			now >=
			new Date(
				event.end_date.getFullYear(),
				event.end_date.getMonth(),
				event.end_date.getDate() + 1
			)
		) {
			toast.error('Unable to scan - The event has concluded.');
			return;
		}

		const participant = COLLECTIONS.PARTICIPANT_COLLECTION.findOne({
			id: participant_id
		});

		if (!participant) {
			toast.error('Invalid QR Code - No matching participant found');
			return;
		}

		const exact_matches = COLLECTIONS.EVENT_SCHEDULE_COLLECTION.find({
			event_id: event.id
		}).fetch();

		console.log('exact matches', exact_matches);

		// Check for existing attendance record today
		const existingAttendance = COLLECTIONS.ATTENDANCE_RECORDS_COLLECTION.findOne({
			participant_id: participant.id,
			event_id: comp_state.event_details.id
		});

		if (existingAttendance) {
			// If already has attendance for this period, update time_out
			COLLECTIONS.ATTENDANCE_RECORDS_COLLECTION.updateOne(
				{ id: existingAttendance.id },
				{
					$set: {
						am_time_out: period === 'AM' ? now : undefined,
						pm_time_out: period === 'PM' ? now : undefined,
						latest_time_scanned: now,
						updated: new Date()
					}
				}
			);

			const updatedAttendance = COLLECTIONS.ATTENDANCE_RECORDS_COLLECTION.findOne({
				id: existingAttendance.id
			});

			comp_state.scanned_attendance = updatedAttendance;
			toast.success(`${participant.first_name} ${participant.last_name} signed out successfully`);
		} else {
			const attendance_id = COLLECTIONS.ATTENDANCE_RECORDS_COLLECTION.insert({
				event_id: comp_state.event_details.id,
				am_time_in: period === 'AM' ? now : undefined,
				pm_time_in: period === 'PM' ? now : undefined,
				participant_id: participant.id,
				latest_time_scanned: now,
				created: new Date(),
				updated: new Date()
			});

			const attendance = COLLECTIONS.ATTENDANCE_RECORDS_COLLECTION.findOne({
				id: attendance_id
			});

			comp_state.scanned_attendance = { ...attendance };
			toast.success(`${participant.first_name} ${participant.last_name} signed in successfully`);
		}

		// Update UI with the scanned participant
		comp_state.last_scanned_participant = participant;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			event.preventDefault();
			event.stopPropagation();

			if (barcode && barcode.length > 5) {
				console.log('Complete barcode scanned:', barcode);
				handleScanParticipant(barcode);
			}

			barcode = '';
			return;
		}

		if (timeout) {
			clearTimeout(timeout);
			timeout = null;
		}

		barcode += event.key;

		// reset if no input received for a while
		timeout = setTimeout(() => {
			if (barcode.length < 5) {
				barcode = '';
			}
			timeout = null;
		}, 500) as unknown as number;
	}

	onMount(() => {
		window.addEventListener('keydown', handleKeydown);

		return () => {
			if (timeout) clearTimeout(timeout);
			window.removeEventListener('keydown', handleKeydown);
		};
	});
</script>

<div in:fly={{ y: 20 }} class="grid gap-6">
	<div class="flex items-center justify-between">
		<div class="grid gap-2 place-items-start">
			<h2 class="text-5xl font-semibold">
				{comp_state.event_details?.event_name ?? 'N/A'}'s Participants
			</h2>

			{#if comp_state.event_details}
				<Badge variant="outline" class="font-semibold text-md">
					Day {getEventDayInfo(
						comp_state.event_details.start_date,
						comp_state.event_details.end_date,
						new Date()
					).currentDay}
				</Badge>
			{/if}
		</div>

		<div class="flex items-center gap-2">
			<AddParticipantsDialog
				disabled={false}
				add_participants_form={data.add_participants_form}
				event_id={comp_state.event_details?.id ?? 'N/A'}
			/>
			<Button variant="outline"><Download class="size-4" /> Export QR Codes</Button>
		</div>
	</div>

	<Tabs.Root value="participants">
		<Tabs.List class="grid h-auto w-full max-w-[600px] grid-cols-2">
			<Tabs.Trigger value="participants" class="h-auto text-base">
				<UsersRound class="mr-2 size-4" />
				All participants</Tabs.Trigger
			>
			<Tabs.Trigger value="time-in-and-out" class="h-auto text-base">
				<Clock class="mr-2 size-4" />
				Time in and out
			</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="participants" class="mt-4">
			<div class="grid gap-2">
				{#if COLLECTIONS.PARTICIPANT_COLLECTION.isPulling()}
					<TableSkeleton />
				{:else}
					<ParticipantDataTable
						participant_form={data.participant_form}
						participants={comp_state.participants}
					/>
				{/if}
			</div>
		</Tabs.Content>

		<Tabs.Content value="time-in-and-out" class="mt-4">
			<div class="flex items-start gap-4">
				<Card.Root class="w-[400px]">
					<Card.Header>
						<Card.Title class="text-xl">Scan Result</Card.Title>
						<Card.Description>Participant information</Card.Description>
					</Card.Header>

					{#if comp_state.last_scanned_participant}
						<Card.Content class="flex w-full justify-between">
							<div>
								<h5 class="font-semibold">
									{comp_state.last_scanned_participant.first_name}
									{comp_state.last_scanned_participant.middle_name
										? comp_state.last_scanned_participant.middle_name + ' '
										: ''}
									{comp_state.last_scanned_participant.last_name}
								</h5>
								<p class="text-muted-foreground">{comp_state.last_scanned_participant.email}</p>
							</div>

							<div class="flex size-8 items-center justify-center rounded-full bg-green-200">
								<Check class="size-4 text-green-600" />
							</div>
						</Card.Content>
						<Card.Footer class="flex justify-between">
							{#if comp_state.scanned_attendance}
								<Badge variant="outline">
									Date: {new Date().toLocaleDateString()}
								</Badge>
								<Badge>
									{(comp_state.scanned_attendance.am_time_in &&
										!comp_state.scanned_attendance.am_time_out) ||
									(comp_state.scanned_attendance.pm_time_in &&
										!comp_state.scanned_attendance.pm_time_out)
										? 'Time in: '
										: 'Time out: '}
									{comp_state.scanned_attendance.latest_time_scanned.toLocaleTimeString([], {
										hour: '2-digit',
										minute: '2-digit'
									})}
								</Badge>
							{:else}
								<Badge>No attendance record</Badge>
							{/if}
						</Card.Footer>
					{:else}
						<Card.Content class="py-8 text-center text-muted-foreground">
							Scan a participant's QR code to see their information
						</Card.Content>
					{/if}
				</Card.Root>

				<div class="grid flex-1 gap-2">
					{#if COLLECTIONS.ATTENDANCE_RECORDS_COLLECTION.isPulling()}
						<TableSkeleton />
					{:else}
						<ParticipantAttendanceDataTable
							participants_attendance={comp_state.participants_attendance}
						/>
					{/if}
				</div>
			</div>
		</Tabs.Content>
	</Tabs.Root>
</div>
