<script lang="ts" module>
	interface ComponentState {
		event_details: EventDetails | undefined;
		event_schedules: EventSchedule[];
		participants: Participant[];
		last_scanned_participant: Participant | null;
		scanned_attendance: any | null;
		current_day_participants_attendance: ParticipantAttendance[];
		all_participants_attendance: ParticipantAttendance[];
		qr_code: string;
		timeout: number | null;
		workers: {
			pdf: {
				qr_code_worker: Worker | null;
				daily_attendance_report_worker: Worker | null;
				full_attendance_report_worker: Worker | null;
			};
			excel: {
				full_attendance_report_worker: Worker | null;
			};
			email: {
				send_qr_code_worker: Worker | null;
			};
		};
		hardware_scanner_enabled: boolean;
	}

	function download_document(url: string, file_name: string, extension: 'pdf' | 'xlsx' = 'pdf') {
		const a = document.createElement('a');
		a.href = url;
		a.download = `${file_name}.${extension}`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	}

	export async function getParticipantsWithQRCode(
		participants: Participant[],
		event_details: EventDetails
	) {
		try {
			if (!event_details) {
				toast.error('Event details not available', {
					description: "Couldn't find event details required to generate QR codes"
				});
				return [];
			}

			const CLOUDINARY_API_URL = await getEnv('CLOUDINARY_API_URL');
			const CLOUD_NAME = await getEnv('CLOUD_NAME');
			const UPLOAD_PRESET = await getEnv('UPLOAD_PRESET');

			if (!CLOUDINARY_API_URL || !CLOUD_NAME || !UPLOAD_PRESET) {
				toast.error('Cloudinary API URL, Cloud Name or Upload Preset not found', {
					description: 'Please check your environment variables'
				});
				return [];
			}

			const participants_with_qr = await Promise.all(
				participants.map(async (participant) => {
					const upload_file = await uploadFile(CLOUDINARY_API_URL, {
						cloud_name: CLOUD_NAME,
						upload_preset: UPLOAD_PRESET,
						file: dataURLtoFile(
							await createQrPngDataUrl({
								data: participant.id,
								width: 500,
								height: 500,
								shape: 'circle',
								backgroundFill: '#fff'
							}),
							`qr-${participant.id}.png`
						),
						event_name: event_details?.event_name!
					});
					return {
						...participant,
						qr: upload_file.url
					};
				})
			);

			console.log({ participants_with_qr });

			return participants_with_qr;
		} catch (error) {
			toast.error('Failed to generate QR codes', {
				description: 'An error occurred while generating QR codes for participants'
			});
			return [];
		}
	}
</script>

<script lang="ts">
	import { buttonVariants } from '@/components/ui/button';
	import { Check, Clock, FileOutput, ScanBarcode, ScanQrCode, UsersRound, X } from 'lucide-svelte';
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
	import { quartInOut } from 'svelte/easing';
	import { StatusPill } from '@/components/snippets/events.svelte';
	import { cn } from '@/utils';
	import * as DropdownMenu from '@/components/ui/dropdown-menu';
	import { QRCode, SquareCheckBig } from '@/assets/icons';
	import type { HelperResponse } from '@/types/generic';
	import QrCodeScannerDialog from '@routes/events/(components)/(participant)/qr-code-scanner-dialog.svelte';
	import { getPopulatedAttendanceRecords } from '../(utils)';
	import * as Popover from '$lib/components/ui/popover';
	import Button from '@/components/ui/button/button.svelte';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { getEnv } from '@/utils/security';
	import { createQrPngDataUrl } from '@svelte-put/qr';
	import { SendEmailToParticipantsDialog } from '@routes/events/(components)/(participant)';
	import { uploadFile } from '@/utils/upload';
	import { dataURLtoFile } from '@/utils/file';

	let { data } = $props();

	let {
		event_details,
		event_schedules,
		participants,
		last_scanned_participant,
		scanned_attendance,
		current_day_participants_attendance,
		all_participants_attendance,
		qr_code,
		timeout,
		workers: { pdf, excel, email },
		hardware_scanner_enabled
	} = $state<ComponentState>({
		event_details: undefined,
		event_schedules: [],
		participants: [],
		last_scanned_participant: null,
		scanned_attendance: null,
		current_day_participants_attendance: [],
		all_participants_attendance: [],
		qr_code: '',
		timeout: null,
		workers: {
			pdf: {
				qr_code_worker: null,
				daily_attendance_report_worker: null,
				full_attendance_report_worker: null
			},
			excel: {
				full_attendance_report_worker: null
			},
			email: {
				send_qr_code_worker: null
			}
		},
		hardware_scanner_enabled: true
	});

	const event_status = $derived(
		checkEventStatus(event_details?.start_date, event_details?.end_date)
	);

	const current_event_day = $derived(
		event_details
			? getEventDayInfo(
					event_details.start_date,
					event_details.end_date,
					new Date()
				).currentDay.toString()
			: null
	);

	/**
	 * Process a qr_code scan and record participant attendance
	 * @param participant_id The ID of the scanned participant
	 */
	function handleScanParticipant(participant_id: string) {
		if (!event_details) {
			toast.error('Event details not available');
			return;
		}

		try {
			const now = new Date();
			const period = now.getHours() < 12 ? 'AM' : 'PM';

			// Get fresh event data
			const event = COLLECTIONS.EVENT_DETAILS_COLLECTION.findOne({
				id: event_details.id
			});

			if (!event) {
				toast.error('Event not found');
				return;
			}

			const start_of_event_day = new Date(event.start_date);
			// Set the time to 12:00 AM (start of the day)
			start_of_event_day.setHours(0, 0, 0, 0);

			// Validate event timing
			if (now < start_of_event_day) {
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
				day: current_event_day!
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
						last_scanned_participant = participant;
						scanned_attendance = existing_attendance;
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
						last_scanned_participant = participant;
						scanned_attendance = existing_attendance;
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
					day: current_event_day!,
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
			last_scanned_participant = participant;
			scanned_attendance = attendance_record;

			// Display success message
			const fullName = `${participant.first_name} ${participant.last_name}`;
			toast.success(`${fullName} ${action_taken}`);

			// Refresh the attendance records display
			if (current_event_day) {
				current_day_participants_attendance = getPopulatedAttendanceRecords(
					event.id,
					{
						attendance_records_collection: COLLECTIONS.ATTENDANCE_RECORDS_COLLECTION,
						participant_collection: COLLECTIONS.PARTICIPANT_COLLECTION,
						event_schedules_collection: COLLECTIONS.EVENT_SCHEDULE_COLLECTION
					},
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

			if (!hardware_scanner_enabled) {
				return toast.error('Hardware scanning is disbaled');
			}

			if (qr_code && qr_code.length > 5) {
				handleScanParticipant(qr_code);
			}

			qr_code = '';
			return;
		}

		if (timeout) {
			clearTimeout(timeout);
			timeout = null;
		}

		qr_code += event.key;

		// reset if no input received for a while
		timeout = setTimeout(() => {
			if (qr_code.length < 5) {
				qr_code = '';
			}
			timeout = null;
		}, 500) as unknown as number;
	}

	async function load_pdf_daily_attendance_report_worker() {
		if (pdf.daily_attendance_report_worker) {
			pdf.daily_attendance_report_worker.terminate();
		}
		const DailyAttendanceWorker = await import(
			'$lib/workers/exports/pdf/pdf-daily-attendance-worker?worker'
		);
		pdf.daily_attendance_report_worker = new DailyAttendanceWorker.default();
		pdf.daily_attendance_report_worker.onmessage = (
			message: MessageEvent<HelperResponse<string | null>>
		) => {
			if (message.data.status !== 200 || message.data.data === null) {
				return toast.warning('Failed to generate daily attendance report', {
					description: message.data.message
				});
			}
			if (message.data.data) {
				const file_name = `${event_details?.event_name} Daily Attendance Report`;
				download_document(message.data.data, file_name);
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

	async function load_pdf_qr_code_worker() {
		if (pdf.qr_code_worker) {
			pdf.qr_code_worker.terminate();
		}
		const QRCodeWorker = await import('$lib/workers/exports/pdf/pdf-qr-codes-worker?worker');
		pdf.qr_code_worker = new QRCodeWorker.default();
		pdf.qr_code_worker.onmessage = (message: MessageEvent<HelperResponse<string | null>>) => {
			if (message.data.status !== 200 || message.data.data === null) {
				return toast.warning('Failed to generate QR codes', {
					description: message.data.message
				});
			}
			if (message.data.data) {
				const file_name = `${event_details?.event_name} QR Codes`;
				download_document(message.data.data, file_name);
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

	async function load_pdf_full_attendance_report_worker() {
		if (pdf.full_attendance_report_worker) {
			pdf.full_attendance_report_worker.terminate();
		}
		const FullAttendanceWorker = await import(
			'$lib/workers/exports/pdf/pdf-full-attendance-worker?worker'
		);
		pdf.full_attendance_report_worker = new FullAttendanceWorker.default();
		pdf.full_attendance_report_worker.onmessage = (
			message: MessageEvent<HelperResponse<string | null>>
		) => {
			if (message.data.status !== 200 || message.data.data === null) {
				return toast.warning('Failed to generate full attendance report', {
					description: message.data.message
				});
			}
			if (message.data.data) {
				const file_name = `${event_details?.event_name} Full Attendance Report`;
				download_document(message.data.data, file_name);
				toast.success('Full attendance report generated successfully', {
					description: 'The full attendance report has been generated and is ready for download'
				});
			} else {
				toast.error('Failed to generate full attendance report', {
					description: 'No data received from the worker'
				});
			}
		};
	}

	async function load_excel_full_attendance_report_worker() {
		if (excel.full_attendance_report_worker) {
			excel.full_attendance_report_worker.terminate();
		}
		const FullAttendanceWorker = await import(
			'$lib/workers/exports/excel/excel-full-attendance-worker?worker'
		);
		excel.full_attendance_report_worker = new FullAttendanceWorker.default();
		excel.full_attendance_report_worker.onmessage = (
			message: MessageEvent<HelperResponse<string | null>>
		) => {
			if (message.data.status !== 200 || message.data.data === null) {
				return toast.warning('Failed to generate full attendance report', {
					description: message.data.message
				});
			}
			if (message.data.data) {
				const file_name = `${event_details?.event_name} Full Attendance Report`;
				download_document(message.data.data, file_name, 'xlsx');
				toast.success('Full attendance report generated successfully', {
					description: 'The full attendance report has been generated and is ready for download'
				});
			} else {
				toast.error('Failed to generate full attendance report', {
					description: 'No data received from the worker'
				});
			}
		};
	}

	async function load_send_qr_code_worker() {
		if (email.send_qr_code_worker) {
			email.send_qr_code_worker.terminate();
		}
		const SendQRWorker = await import('$lib/workers/email/send-qr-code-worker?worker');
		email.send_qr_code_worker = new SendQRWorker.default();
		email.send_qr_code_worker.onmessage = (
			message: MessageEvent<HelperResponse<string | null>>
		) => {
			if (message.data.status !== 200 || message.data.data === null) {
				return toast.warning('Failed to send QR codes', {
					description: message.data.message
				});
			}
			if (message.data.data || message.data.status === 200) {
				toast.success(
					`QR codes sent successfully to ${message.data.data} ${Number(message.data.data) > 1 ? 'participants' : 'participant'}`,
					{
						description: message.data.message
					}
				);
			} else {
				toast.error('Failed to send QR codes', {
					description: 'No data received from the worker'
				});
			}
		};
	}

	function handleToggleHardwareScannerState() {
		const state = !hardware_scanner_enabled;
		hardware_scanner_enabled = state;

		if (state) {
			toast.success('Hardware scanner enabled. Please make sure the device is plugged in');
		} else toast.info('Hardware scanner disabled');
	}

	async function handle_email_send(show_toast_if_no_participants: boolean = true) {
		if (event_status === 'finished') {
			return toast.warning('Emailing QR codes is disabled since the event has concluded');
		}

		if (!event_details) {
			return toast.warning('Event details not available', {
				description: "Couldn't find event details required to generate QR codes"
			});
		}

		if (!email.send_qr_code_worker) {
			return toast.error('Send qr code email worker not available', {
				description: 'Please refresh the page and try again'
			});
		}

		if (participants.length === 0) {
			if (!show_toast_if_no_participants) return;
			return toast.warning('No participants found', {
				description: 'Please add participants to the event before sending QR codes'
			});
		}

		toast.info(`Sending QR codes to participants`, {
			description: 'This may take a few moments. You can continue using the application.'
		});

		if (!event_details) {
			toast.error('Event details not available', {
				description: "Couldn't find event details required to generate QR codes"
			});
		}

		const participants_with_qr = await getParticipantsWithQRCode(participants, event_details);

		if (participants_with_qr.length === 0) return;

		email.send_qr_code_worker.postMessage(
			JSON.stringify({
				participants: participants_with_qr,
				PLUNK_API: await getEnv('PLUNK_API'),
				PLUNK_SK: await getEnv('PLUNK_SK'),
				event_details: {
					event_name: event_details.event_name,
					event_date: event_details.start_date.toISOString(),
					event_location: event_details.location
				}
			})
		);
	}

	function get_event_details_and_participants(event_id: string) {
		const _event_details = COLLECTIONS.EVENT_DETAILS_COLLECTION.findOne({
			id: event_id
		});
		const event_status = checkEventStatus(_event_details?.start_date, _event_details?.end_date);

		const participants_cursor = COLLECTIONS.PARTICIPANT_COLLECTION.find(
			{
				event_id
			},
			{
				sort: {
					created: -1
				}
			}
		);
		const _participants = participants_cursor.fetch().map((participant) => {
			const event_days = _event_details?.difference_in_days;
			const total_days_attended = all_participants_attendance.reduce(
				(acc, participant_attendance) => {
					if (
						participant_attendance.participant_id === participant.id &&
						participant_attendance.am_time_in &&
						participant_attendance.pm_time_in
					) {
						return acc + 1;
					}
					return acc;
				},
				0
			);

			const attendance_status =
				total_days_attended === event_days
					? 'complete'
					: event_days && total_days_attended > 0 && total_days_attended < event_days
						? 'incomplete'
						: 'absent';

			return {
				...participant,
				attendance_status: event_status === 'finished' ? attendance_status : undefined
			};
		});

		return {
			event_details: _event_details as EventDetails,
			participants: _participants as Participant[]
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
			const event_schedule_cursor = COLLECTIONS.EVENT_SCHEDULE_COLLECTION.find({
				event_id: data.event_id
			});

			event_schedules = event_schedule_cursor.fetch();

			const { event_details: _event_details, participants: _participants } =
				get_event_details_and_participants(data.event_id);

			event_details = _event_details;
			participants = _participants;

			if (current_event_day) {
				current_day_participants_attendance = getPopulatedAttendanceRecords(
					data.event_id,
					{
						attendance_records_collection: COLLECTIONS.ATTENDANCE_RECORDS_COLLECTION,
						participant_collection: COLLECTIONS.PARTICIPANT_COLLECTION,
						event_schedules_collection: COLLECTIONS.EVENT_SCHEDULE_COLLECTION
					},
					current_event_day
				) as ParticipantAttendance[];
			}

			all_participants_attendance = getPopulatedAttendanceRecords(data.event_id, {
				attendance_records_collection: COLLECTIONS.ATTENDANCE_RECORDS_COLLECTION,
				participant_collection: COLLECTIONS.PARTICIPANT_COLLECTION,
				event_schedules_collection: COLLECTIONS.EVENT_SCHEDULE_COLLECTION
			}) as ParticipantAttendance[];

			return () => {
				event_schedule_cursor.cleanup();
			};
		}
	);

	watch(
		() => last_scanned_participant,
		() => {
			let timeout: number;
			if (last_scanned_participant) {
				timeout = setTimeout(() => {
					last_scanned_participant = null;
				}, 5000) as unknown as number;
			}
			return () => timeout;
		}
	);

	onMount(() => {
		load_pdf_daily_attendance_report_worker();
		load_pdf_qr_code_worker();
		load_pdf_full_attendance_report_worker();
		load_excel_full_attendance_report_worker();
		load_send_qr_code_worker();
		return () => {
			if (timeout) clearTimeout(timeout);
		};
	});
</script>

<svelte:document onkeydown={handleKeydown} />

<div in:fly={{ y: 20 }} class="grid gap-6">
	<!-- PAGE HEADER -->
	<div class="flex items-center justify-between">
		<!-- EVENT NAME -->
		<div class="grid place-items-start gap-6">
			<h2 class="text-5xl font-semibold">
				{event_details?.event_name ?? 'N/A'}'s Participants
			</h2>

			{#if event_details && event_status === 'ongoing'}
				<Badge variant="outline" class="text-md font-semibold">
					Day {current_event_day}
				</Badge>
			{/if}
		</div>
		<!-- END OF EVENT NAME -->

		<div class="flex flex-col items-end gap-2">
			<div class="flex items-center gap-2">
				{@render StatusPill(event_status)}
				<AddParticipantsDialog
					add_participants_form={data.add_participants_form}
					is_event_finished={event_status === 'finished'}
					event_id={event_details?.id ?? 'N/A'}
				/>
			</div>

			<SendEmailToParticipantsDialog
				is_event_finished={event_status === 'finished'}
				handleSendEmail={handle_email_send}
			/>
		</div>
	</div>
	<!-- END OF PAGE HEADER -->

	<Tabs.Root value="participants">
		<div class="flex justify-between">
			<Tabs.List
				class={cn('grid h-auto w-full max-w-[600px] grid-cols-2', {
					'max-w-[700px] grid-cols-3': event_status === 'ongoing'
				})}
			>
				<Tabs.Trigger value="participants" class="h-auto text-[0.98rem]">
					<UsersRound class="mr-2 size-4" />
					All participants</Tabs.Trigger
				>
				<Tabs.Trigger value="all-time-in-and-out" class="h-auto text-[0.98rem]">
					<Clock class="mr-2 size-4" />
					All time in and out
				</Tabs.Trigger>
				{#if event_status === 'ongoing'}
					<Tabs.Trigger value="time-in-and-out" class="h-auto text-[0.98rem]">
						<Clock class="mr-2 size-4" />
						Today's time in and out
					</Tabs.Trigger>
				{/if}
			</Tabs.List>

			<!-- ACTIONS -->
			<div class="justify flex items-center gap-1">
				<DropdownMenu.Root>
					<DropdownMenu.Trigger class={buttonVariants({ variant: 'outline' })}
						><FileOutput class="size-4" />Export Data</DropdownMenu.Trigger
					>
					<DropdownMenu.Content align="end">
						<DropdownMenu.Group>
							<DropdownMenu.GroupHeading class="text-center"
								>Export Options</DropdownMenu.GroupHeading
							>
							<DropdownMenu.Sub>
								<DropdownMenu.SubTrigger>PDF Export</DropdownMenu.SubTrigger>
								<DropdownMenu.SubContent>
									<DropdownMenu.Item
										onclick={() => {
											if (!event_details) {
												return toast.warning('Event details not available', {
													description: "Couldn't find event details required to generate QR codes"
												});
											}

											if (!pdf.qr_code_worker) {
												return toast.error('QR code worker not available', {
													description: 'Please refresh the page and try again'
												});
											}

											const { event_details: _event_details, participants: _participants } =
												get_event_details_and_participants(data.event_id);

											pdf.qr_code_worker.postMessage({
												info: {
													creator: 'Evently',
													title: `${event_details.event_name} QR Codes`,
													subject: 'QR Codes',
													producer: 'Evently'
												},
												_event_details: JSON.stringify(_event_details),
												_participants: JSON.stringify(_participants)
											});

											toast.info('Generating QR codes', {
												description:
													'Please wait while we generate the QR codes, or feel free to do other things'
											});
										}}><QRCode />Participants QR codes</DropdownMenu.Item
									>
									<DropdownMenu.Separator />
									<DropdownMenu.Item
										onclick={() => {
											if (!event_details) {
												return toast.warning('Event details not available', {
													description: "Couldn't find event details required to generate QR codes"
												});
											}

											if (!pdf.daily_attendance_report_worker) {
												return toast.error('QR code worker not available', {
													description: 'Please refresh the page and try again'
												});
											}
											const { event_details: _event_details, participants: _participants } =
												get_event_details_and_participants(data.event_id);
											pdf.daily_attendance_report_worker.postMessage({
												info: {
													creator: 'Evently',
													title: `${event_details.event_name} Daily Attendance Report`,
													subject: 'Daily Attendance Report',
													producer: 'Evently'
												},
												_event_details: JSON.stringify(_event_details),
												_participants: JSON.stringify(_participants)
											});
											toast.info('Generating daily attendance report', {
												description:
													'Please wait while we generate the report, or feel free to do other things'
											});
										}}><SquareCheckBig />Daily Attendance Report</DropdownMenu.Item
									>
									<DropdownMenu.Separator />
									<DropdownMenu.Item
										onclick={() => {
											if (!event_details) {
												return toast.warning('Event details not available', {
													description:
														"Couldn't find event details required to generate full attendance report"
												});
											}
											if (!pdf.full_attendance_report_worker) {
												return toast.error('Full attendance report worker not available', {
													description: 'Please refresh the page and try again'
												});
											}

											const { event_details: _event_details, participants: _participants } =
												get_event_details_and_participants(data.event_id);

											pdf.full_attendance_report_worker.postMessage({
												info: {
													creator: 'Evently',
													title: `${event_details.event_name} Full Attendance Report`,
													subject: 'Full Attendance Report',
													producer: 'Evently'
												},
												_event_details: JSON.stringify(_event_details),
												_participants: JSON.stringify(_participants)
											});
											toast.info('Generating event full attendance report', {
												description:
													'Please wait while we generate the report, or feel free to do other things'
											});
										}}><SquareCheckBig />Event Full Attendance Report</DropdownMenu.Item
									>
								</DropdownMenu.SubContent>
							</DropdownMenu.Sub>
							<DropdownMenu.Sub>
								<DropdownMenu.SubTrigger>Excel Export</DropdownMenu.SubTrigger>
								<DropdownMenu.SubContent>
									<DropdownMenu.Item
										onclick={() => {
											if (!event_details) {
												return toast.warning('Event details not available', {
													description: "Couldn't find event details required to generate QR codes"
												});
											}
											if (!excel.full_attendance_report_worker) {
												return toast.error('Full attendance report worker not available', {
													description: 'Please refresh the page and try again'
												});
											}

											const { event_details: _event_details, participants: _participants } =
												get_event_details_and_participants(data.event_id);

											excel.full_attendance_report_worker.postMessage({
												info: {
													creator: 'Evently',
													title: `${event_details.event_name} Full Attendance Report`,
													subject: 'Full Attendance Report',
													producer: 'Evently'
												},
												_event_details: JSON.stringify(_event_details),
												_participants: JSON.stringify(_participants)
											});

											toast.info('Generating QR codes', {
												description:
													'Please wait while we generate the QR codes, or feel free to do other things'
											});
										}}><QRCode />Full Attendance Report</DropdownMenu.Item
									>
								</DropdownMenu.SubContent>
							</DropdownMenu.Sub>
						</DropdownMenu.Group>
					</DropdownMenu.Content>
				</DropdownMenu.Root>

				<Tooltip.Provider delayDuration={100}>
					<Tooltip.Root>
						<Tooltip.Trigger>
							<Popover.Root>
								<Popover.Trigger
									class={cn(
										buttonVariants({ size: 'icon', variant: 'outline' }),
										hardware_scanner_enabled && 'border-green-600'
									)}
								>
									<ScanQrCode class="size-4" />
								</Popover.Trigger>
								<Popover.Content class="w-auto" side="left">
									<p class="text-muted-foreground mb-2 text-sm">Choose which scanner to use</p>
									<div class="flex items-center gap-1">
										<QrCodeScannerDialog handleScan={handleScanParticipant} />
										<Button
											size="sm"
											variant="outline"
											class={cn(hardware_scanner_enabled && 'border-green-600')}
											onclick={handleToggleHardwareScannerState}
										>
											<ScanBarcode class="size-4" /> Scan with Hardware Scanner
											{#if hardware_scanner_enabled}
												<Check class="size-3 rounded-full bg-green-600 p-1 text-white" />
											{/if}
										</Button>
									</div>
								</Popover.Content>
							</Popover.Root>
						</Tooltip.Trigger>
						<Tooltip.Content>
							<p>Scan</p>
						</Tooltip.Content>
					</Tooltip.Root>
				</Tooltip.Provider>
			</div>
			<!-- END OF  ACTIONS -->
		</div>

		<Tabs.Content value="participants" class="mt-4">
			<div class="grid gap-2 overflow-x-auto">
				{#if COLLECTIONS.PARTICIPANT_COLLECTION.isPulling()}
					<TableSkeleton />
				{:else}
					{#key event_status}
						<ParticipantDataTable
							participant_form={data.participant_form}
							{participants}
							{event_status}
							event_details={event_details!}
						/>
					{/key}
				{/if}
			</div>
		</Tabs.Content>

		<Tabs.Content value="all-time-in-and-out" class="mt-4">
			<div class="grid gap-2">
				{#if COLLECTIONS.ATTENDANCE_RECORDS_COLLECTION.isPulling()}
					<TableSkeleton />
				{:else}
					<ParticipantAttendanceDataTable
						event_days={event_details?.difference_in_days}
						participants_attendance={all_participants_attendance}
					/>
				{/if}
			</div>
		</Tabs.Content>

		{#if event_status === 'ongoing'}
			<Tabs.Content value="time-in-and-out" class="mt-4">
				<div class="grid gap-2">
					{#if COLLECTIONS.ATTENDANCE_RECORDS_COLLECTION.isPulling()}
						<TableSkeleton />
					{:else}
						<ParticipantAttendanceDataTable
							participants_attendance={current_day_participants_attendance}
						/>
					{/if}
				</div>
			</Tabs.Content>
		{/if}
	</Tabs.Root>
</div>

{#if last_scanned_participant}
	<div
		transition:fly={{ y: -20, duration: 200, easing: quartInOut }}
		class="fixed top-10 right-8 z-[9999]"
	>
		<Card.Root class="relative w-[400px]">
			<button class="absolute top-4 right-4" onclick={() => (last_scanned_participant = null)}>
				<X class="size-4" />
			</button>
			<Card.Header>
				<Card.Title class="text-xl">Scan Result</Card.Title>
				<Card.Description>Participant information</Card.Description>
			</Card.Header>
			<Card.Content class="flex w-full justify-between">
				<div>
					<h5 class="font-semibold">
						{last_scanned_participant.first_name}
						{last_scanned_participant.middle_name ? last_scanned_participant.middle_name + ' ' : ''}
						{last_scanned_participant.last_name}
					</h5>
					<p class="text-muted-foreground">{last_scanned_participant.email}</p>
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
					{(scanned_attendance.am_time_in && !scanned_attendance.am_time_out) ||
					(scanned_attendance.pm_time_in && !scanned_attendance.pm_time_out)
						? 'Time in: '
						: 'Time out: '}
					{scanned_attendance.latest_time_scanned.toLocaleTimeString([], {
						hour: '2-digit',
						minute: '2-digit'
					})}
				</Badge>
			</Card.Footer>
		</Card.Root>
	</div>
{/if}
