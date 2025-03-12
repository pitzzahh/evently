<script lang="ts">
	import { buttonVariants } from '@/components/ui/button';
	import { Check, Clock, FileOutput, UsersRound, X } from 'lucide-svelte';
	import { AddParticipantsDialog, ParticipantDataTable } from '@routes/events/(components)';
	import type { EventSchedule, EventDetails, ParticipantAttendance } from '@/db/models/types';
	import { fly } from 'svelte/transition';
	import { COLLECTIONS } from '@/db/index';
	import type { Participant } from '@/db/models/types';
	import { watch } from 'runed';
	import { TableSkeleton } from '@/components/custom/skeleton';
	import * as Tabs from '@/components/ui/tabs';
	import * as Card from '@/components/ui/card';
	import { Badge } from '@/components/ui/badge';
	import { toast } from 'svelte-sonner';
	import { onMount } from 'svelte';
	import ParticipantAttendanceDataTable from '@routes/events/(components)/(participant)/participant-attendance-data-table.svelte';
	import { checkEventStatus, getEventDayInfo } from '@routes/events/utils';
	import { cubicIn, cubicOut, quartInOut } from 'svelte/easing';
	import { StatusPill } from '@/components/snippets/events.svelte';
	import { ImportParticipantDialog } from '@routes/events/(components)/(participant)';
	import { cn } from '@/utils';
	import * as DropdownMenu from '@/components/ui/dropdown-menu';
	import { QRCode, SquareCheckBig } from '@/assets/icons';
	import type { HelperResponse } from '@/types/generic/index.js';
	import { newWebViewWindow } from '@/utils/windows/index.js';

	interface ComponentState {
		event_details: EventDetails | undefined;
		event_schedules: EventSchedule[];
		participants: Participant[];
		see_more: boolean;
		last_scanned_participant: Participant | null;
		scanned_attendance: any | null;
		current_day_participants_attendance: ParticipantAttendance[];
		all_participants_attendance: ParticipantAttendance[];
		barcode: string;
		timeout: number | null;
		workers: {
			qr_code_worker: Worker | null;
			daily_attendance_report_worker: Worker | null;
		};
	}

	let { data } = $props();

	let comp_state = $state<ComponentState>({
		event_details: undefined,
		event_schedules: [],
		participants: [],
		see_more: true,
		last_scanned_participant: null,
		scanned_attendance: null,
		current_day_participants_attendance: [],
		all_participants_attendance: [],
		barcode: '',
		timeout: null,
		workers: {
			qr_code_worker: null,
			daily_attendance_report_worker: null
		}
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

	function getPopulatedAttendanceRecords(eventId: string, current_event_day?: number) {
		const attendance_records = COLLECTIONS.ATTENDANCE_RECORDS_COLLECTION.find({
			event_id: eventId,
			...(current_event_day && { day: current_event_day })
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
	 * Process a barcode scan and record participant attendance
	 * @param participant_id The ID of the scanned participant
	 */
	function handleScanParticipant(participant_id: string) {
		if (!comp_state.event_details) {
			toast.error('Event details not available');
			return;
		}

		try {
			const now = new Date();
			const period = now.getHours() < 12 ? 'AM' : 'PM';

			// Get fresh event data
			const event = COLLECTIONS.EVENT_DETAILS_COLLECTION.findOne({
				id: comp_state.event_details.id
			});

			if (!event) {
				toast.error('Event not found');
				return;
			}

			// Validate event timing
			if (now < event.start_date) {
				toast.error('Event has not started yet. Attendance cannot be recorded.');
				return;
			}

			// Set end date to end of the day
			const end_of_eventDay = new Date(event.end_date);
			end_of_eventDay.setHours(23, 59, 59, 999);

			if (now > end_of_eventDay) {
				toast.error('Event has concluded. Attendance records are now finalized.');
				return;
			}

			// Find the participant
			const participant = COLLECTIONS.PARTICIPANT_COLLECTION.findOne({
				id: participant_id
			});

			if (!participant) {
				toast.error('Invalid QR Code - No matching participant found');
				return;
			}

			// Check for existing attendance record for this day
			const existing_attendance = COLLECTIONS.ATTENDANCE_RECORDS_COLLECTION.findOne({
				participant_id: participant.id,
				event_id: event.id,
				day: current_event_day as number
			});

			// Prepare response message variables
			let action_taken = '';
			let attendance_record;

			if (existing_attendance) {
				// Update existing attendance record based on period and current state
				if (period === 'AM') {
					if (!existing_attendance.am_time_in) {
						// First AM scan - record time in
						COLLECTIONS.ATTENDANCE_RECORDS_COLLECTION.updateOne(
							{ id: existing_attendance.id },
							{
								$set: {
									am_time_in: now,
									latest_time_scanned: now
								}
							}
						);
						action_taken = 'signed in for morning session';
					} else if (!existing_attendance.am_time_out) {
						// Second AM scan - record time out
						COLLECTIONS.ATTENDANCE_RECORDS_COLLECTION.updateOne(
							{ id: existing_attendance.id },
							{
								$set: {
									am_time_out: now,
									latest_time_scanned: now
								}
							}
						);
						action_taken = 'signed out from morning session';
					} else {
						// AM already has both time in and out
						toast.info(`${participant.first_name} already has complete morning attendance`);
						comp_state.last_scanned_participant = participant;
						comp_state.scanned_attendance = existing_attendance;
						return;
					}
				} else {
					// Period is PM
					if (!existing_attendance.pm_time_in) {
						// First PM scan - record time in
						COLLECTIONS.ATTENDANCE_RECORDS_COLLECTION.updateOne(
							{ id: existing_attendance.id },
							{
								$set: {
									pm_time_in: now,
									latest_time_scanned: now
								}
							}
						);
						action_taken = 'signed in for PM session';
					} else if (!existing_attendance.pm_time_out) {
						// Second PM scan - record time out
						COLLECTIONS.ATTENDANCE_RECORDS_COLLECTION.updateOne(
							{ id: existing_attendance.id },
							{
								$set: {
									pm_time_out: now,
									latest_time_scanned: now
								}
							}
						);
						action_taken = 'signed out from PM session';
					} else {
						// PM already has both time in and out
						toast.info(`${participant.first_name} already has complete PM attendance`);
						comp_state.last_scanned_participant = participant;
						comp_state.scanned_attendance = existing_attendance;
						return;
					}
				}

				// Get the updated attendance record
				attendance_record = COLLECTIONS.ATTENDANCE_RECORDS_COLLECTION.findOne({
					id: existing_attendance.id
				});
			} else {
				// Create new attendance record
				const attendanceId = COLLECTIONS.ATTENDANCE_RECORDS_COLLECTION.insert({
					event_id: event.id,
					participant_id: participant.id,
					day: current_event_day as number,
					am_time_in: period === 'AM' ? now : undefined,
					pm_time_in: period === 'PM' ? now : undefined,
					latest_time_scanned: now,
					created: new Date(),
					updated: new Date()
				});

				attendance_record = COLLECTIONS.ATTENDANCE_RECORDS_COLLECTION.findOne({
					id: attendanceId
				});

				action_taken =
					period === 'AM' ? 'signed in for morning session' : 'signed in for afternoon session';
			}

			// Update component state with scan results
			comp_state.last_scanned_participant = participant;
			comp_state.scanned_attendance = attendance_record;

			// Display success message
			const fullName = `${participant.first_name} ${participant.last_name}`;
			toast.success(`${fullName} ${action_taken}`);

			// Refresh the attendance records display
			if (current_event_day) {
				comp_state.current_day_participants_attendance = getPopulatedAttendanceRecords(
					event.id,
					current_event_day
				) as ParticipantAttendance[];
			}
		} catch (error) {
			console.error('Error processing attendance scan:', error);
			toast.error('An error occurred while processing the scan');
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			event.preventDefault();
			event.stopPropagation();

			if (comp_state.barcode && comp_state.barcode.length > 5) {
				handleScanParticipant(comp_state.barcode);
			}

			comp_state.barcode = '';
			return;
		}

		if (comp_state.timeout) {
			clearTimeout(comp_state.timeout);
			comp_state.timeout = null;
		}

		comp_state.barcode += event.key;

		// reset if no input received for a while
		comp_state.timeout = setTimeout(() => {
			if (comp_state.barcode.length < 5) {
				comp_state.barcode = '';
			}
			comp_state.timeout = null;
		}, 500) as unknown as number;
	}

	async function load_daily_attendance_report_worker() {
		if (comp_state.workers.daily_attendance_report_worker) {
			comp_state.workers.daily_attendance_report_worker.terminate();
		}
		const DailyAttendanceWorker = await import(
			'$lib/workers/generate-daily-attendance.worker?worker'
		);
		comp_state.workers.daily_attendance_report_worker = new DailyAttendanceWorker.default();
		comp_state.workers.daily_attendance_report_worker.onmessage = (
			message: MessageEvent<HelperResponse<string | null>>
		) => {
			if (message.data.status !== 200 || message.data.data === null) {
				return toast.error('Failed to generate daily attendance report', {
					description: message.data.message
				});
			}
			if (message.data.data) {
				const file_name = `${comp_state.event_details?.event_name} Daily Attendance Report`;
				const a = document.createElement('a');
				a.href = message.data.data;
				a.download = `${file_name}.pdf`;
				document.body.appendChild(a);
				a.click();
				newWebViewWindow(file_name, {
					url: message.data.data
				});
				document.body.removeChild(a);
				toast.success('Daily attendance report generated successfully', {
					description: 'The daily attendance report has been generated and is ready for download'
				});
			} else {
				toast.error('Failed to generate daily attendance report', {
					description: 'No data received from the worker'
				});
			}
		};
	}

	async function load_qr_code_worker() {
		if (comp_state.workers.qr_code_worker) {
			comp_state.workers.qr_code_worker.terminate();
		}
		const QRCodeWorker = await import('$lib/workers/generate-qr-codes.worker?worker');
		comp_state.workers.qr_code_worker = new QRCodeWorker.default();
		comp_state.workers.qr_code_worker.onmessage = (
			message: MessageEvent<HelperResponse<string | null>>
		) => {
			if (message.data.status !== 200 || message.data.data === null) {
				return toast.error('Failed to generate QR codes', {
					description: message.data.message
				});
			}
			if (message.data.data) {
				const file_name = `${comp_state.event_details?.event_name} QR Codes`;
				const a = document.createElement('a');
				a.href = message.data.data;
				a.download = `${file_name}.pdf`;
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
				toast.success('QR codes generated successfully', {
					description: 'The QR codes have been generated and are ready for download'
				});
			} else {
				toast.error('Failed to generate QR codes', {
					description: 'No data received from the worker'
				});
			}
		};
	}

	watch(
		[
			() => COLLECTIONS.PARTICIPANT_COLLECTION.isLoading(),
			() => COLLECTIONS.EVENT_SCHEDULE_COLLECTION.isLoading(),
			() => COLLECTIONS.EVENT_DETAILS_COLLECTION.isLoading(),
			() => COLLECTIONS.ATTENDANCE_RECORDS_COLLECTION.isLoading()
		],
		() => {
			const participants_cursor = COLLECTIONS.PARTICIPANT_COLLECTION.find(
				{
					event_id: data.event_id
				},
				{
					sort: {
						created: -1
					}
				}
			);
			const event_schedule_cursor = COLLECTIONS.EVENT_SCHEDULE_COLLECTION.find({
				event_id: data.event_id
			});

			comp_state.event_schedules = event_schedule_cursor.fetch();
			comp_state.event_details = COLLECTIONS.EVENT_DETAILS_COLLECTION.findOne({
				id: data.event_id
			});

			if (current_event_day) {
				comp_state.current_day_participants_attendance = getPopulatedAttendanceRecords(
					data.event_id,
					current_event_day
				) as ParticipantAttendance[];
			}

			comp_state.all_participants_attendance = getPopulatedAttendanceRecords(
				data.event_id
			) as ParticipantAttendance[];

			comp_state.participants = participants_cursor.fetch().map((participant) => {
				const event_days = comp_state.event_details?.difference_in_days;
				const total_days_attended = comp_state.all_participants_attendance.reduce(
					(acc, participant_attendance) => {
						if (
							participant_attendance.participant_id === participant.id &&
							participant_attendance.am_time_in &&
							participant_attendance.pm_time_in
						) {
							return (acc += 1);
						}
						return (acc += 0);
					},
					0
				);

				const attendance_status =
					event_days === total_days_attended
						? 'complete'
						: event_days && event_days < total_days_attended
							? 'incomplete'
							: 'absent';

				return {
					...participant,
					attendance_status: event_status === 'finished' ? attendance_status : undefined
				};
			});

			return () => {
				participants_cursor.cleanup();
				event_schedule_cursor.cleanup();
			};
		}
	);

	onMount(() => {
		window.addEventListener('keydown', handleKeydown);
		load_daily_attendance_report_worker();
		load_qr_code_worker();
		return () => {
			if (comp_state.timeout) clearTimeout(comp_state.timeout);
			window.removeEventListener('keydown', handleKeydown);
		};
	});

	watch(
		() => comp_state.last_scanned_participant,
		() => {
			let timeout: number;
			if (comp_state.last_scanned_participant) {
				timeout = setTimeout(() => {
					comp_state.last_scanned_participant = null;
				}, 5000) as unknown as number;
			}
			return () => timeout;
		}
	);
</script>

<div in:fly={{ y: 20 }} class="grid gap-6">
	<div class="flex items-center justify-between">
		<div class="grid place-items-start gap-6">
			<h2 class="text-5xl font-semibold">
				{comp_state.event_details?.event_name ?? 'N/A'}'s Participants
			</h2>

			{#if comp_state.event_details && event_status === 'ongoing'}
				<Badge variant="outline" class="text-md font-semibold">
					Day {current_event_day}
				</Badge>
			{/if}
		</div>

		<div class="flex flex-col items-end gap-2">
			<div class="flex items-center gap-2">
				<ImportParticipantDialog event_id={comp_state.event_details?.id ?? 'N/A'} />
				<DropdownMenu.Root>
					<DropdownMenu.Trigger class={buttonVariants({ variant: 'outline' })}
						><FileOutput class="size-4" />Export</DropdownMenu.Trigger
					>
					<DropdownMenu.Content>
						<DropdownMenu.Group>
							<DropdownMenu.GroupHeading class="text-center"
								>Export Options</DropdownMenu.GroupHeading
							>
							<DropdownMenu.Separator />
							<DropdownMenu.Item
								onclick={() => {
									new Promise(() => {
										if (!comp_state.event_details) {
											return toast.warning('Event details not available', {
												description: "Couldn't find event details required to generate QR codes"
											});
										}

										if (!comp_state.workers.qr_code_worker) {
											return toast.error('QR code worker not available', {
												description: 'Please refresh the page and try again'
											});
										}

										comp_state.workers.qr_code_worker.postMessage({
											info: {
												creator: 'Evently',
												title: `${comp_state.event_details.event_name} QR Codes`,
												subject: 'QR Codes',
												producer: 'Evently'
											},
											event_details: JSON.stringify(comp_state.event_details),
											participants: JSON.stringify(comp_state.participants)
										});
									});
									toast.info('Generating QR codes', {
										description: 'Please wait while we generate the QR codes'
									});
								}}><QRCode />Participants QR codes</DropdownMenu.Item
							>

							<DropdownMenu.Item
								onclick={() => {
									if (!comp_state.event_details) {
										return toast.warning('Event details not available', {
											description: "Couldn't find event details required to generate QR codes"
										});
									}

									if (!comp_state.workers.daily_attendance_report_worker) {
										return toast.error('QR code worker not available', {
											description: 'Please refresh the page and try again'
										});
									}
									comp_state.workers.daily_attendance_report_worker.postMessage({
										info: {
											creator: 'Evently',
											title: `${comp_state.event_details.event_name} Daily Attendance Report`,
											subject: 'Daily Attendance Report',
											producer: 'Evently'
										},
										event_details: JSON.stringify(comp_state.event_details),
										participants: JSON.stringify(comp_state.participants)
									});
									toast.info('Generating daily attendance report', {
										description: 'Please wait while we generate the report'
									});
								}}><SquareCheckBig />Daily Attendance Report</DropdownMenu.Item
							>
						</DropdownMenu.Group>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
				<AddParticipantsDialog
					disabled={false}
					add_participants_form={data.add_participants_form}
					event_id={comp_state.event_details?.id ?? 'N/A'}
				/>
			</div>
			{@render StatusPill(event_status)}
		</div>
	</div>

	<Tabs.Root value="participants">
		<Tabs.List
			class={cn('grid h-auto w-full max-w-[600px] grid-cols-2', {
				'max-w-[800px]  grid-cols-3': event_status === 'ongoing'
			})}
		>
			<Tabs.Trigger value="participants" class="h-auto text-base">
				<UsersRound class="mr-2 size-4" />
				All participants</Tabs.Trigger
			>
			<Tabs.Trigger value="all-time-in-and-out" class="h-auto text-base">
				<Clock class="mr-2 size-4" />
				All time in and out
			</Tabs.Trigger>
			{#if event_status === 'ongoing'}
				<Tabs.Trigger value="time-in-and-out" class="h-auto text-base">
					<Clock class="mr-2 size-4" />
					Today's time in and out
				</Tabs.Trigger>
			{/if}
		</Tabs.List>

		<Tabs.Content value="participants" class="mt-4">
			<div class="grid gap-2">
				{#if COLLECTIONS.PARTICIPANT_COLLECTION.isPulling()}
					<TableSkeleton />
				{:else}
					{#key event_status}
						<ParticipantDataTable
							participant_form={data.participant_form}
							participants={comp_state.participants}
							{event_status}
						/>
					{/key}
				{/if}
			</div>
		</Tabs.Content>

		{#if event_status === 'ongoing'}
			<Tabs.Content value="time-in-and-out" class="mt-4">
				<div class="flex items-start gap-4">
					<div class="grid flex-1 gap-2">
						{#if COLLECTIONS.ATTENDANCE_RECORDS_COLLECTION.isPulling()}
							<TableSkeleton />
						{:else}
							<ParticipantAttendanceDataTable
								participants_attendance={comp_state.current_day_participants_attendance}
							/>
						{/if}
					</div>
				</div>
			</Tabs.Content>
		{/if}

		<Tabs.Content value="all-time-in-and-out" class="mt-4">
			<div class="flex items-start gap-4">
				<div class="grid flex-1 gap-2">
					{#if COLLECTIONS.ATTENDANCE_RECORDS_COLLECTION.isPulling()}
						<TableSkeleton />
					{:else}
						<ParticipantAttendanceDataTable
							event_days={comp_state.event_details?.difference_in_days}
							participants_attendance={comp_state.all_participants_attendance}
						/>
					{/if}
				</div>
			</div>
		</Tabs.Content>
	</Tabs.Root>
</div>

{#if comp_state.last_scanned_participant}
	<div
		transition:fly={{ y: -20, duration: 200, easing: quartInOut }}
		class="fixed right-8 top-10 z-20"
	>
		<Card.Root class="relative w-[400px]">
			<button
				class="absolute right-4 top-4"
				onclick={() => (comp_state.last_scanned_participant = null)}
			>
				<X class="size-4" />
			</button>
			<Card.Header>
				<Card.Title class="text-xl">Scan Result</Card.Title>
				<Card.Description>Participant information</Card.Description>
			</Card.Header>
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
				<Badge variant="outline">
					Date: {new Date().toLocaleDateString()}
				</Badge>
				<Badge>
					{(comp_state.scanned_attendance.am_time_in &&
						!comp_state.scanned_attendance.am_time_out) ||
					(comp_state.scanned_attendance.pm_time_in && !comp_state.scanned_attendance.pm_time_out)
						? 'Time in: '
						: 'Time out: '}
					{comp_state.scanned_attendance.latest_time_scanned.toLocaleTimeString([], {
						hour: '2-digit',
						minute: '2-digit'
					})}
				</Badge>
			</Card.Footer>
		</Card.Root>
	</div>
{/if}
