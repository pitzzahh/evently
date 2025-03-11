<script lang="ts">
	import * as Form from '@/components/ui/form';
	import { Input } from '@/components/ui/input';
	import Textarea from '@/components/ui/textarea/textarea.svelte';
	import { eventSchema, type EventSchema } from '@/schema/event';
	import { Info, MapPin, Ticket } from 'lucide-svelte';
	import { type SuperValidated, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { nanoid } from 'nanoid';
	import { EventTimePicker } from '..';
	import CalendarIcon from 'lucide-svelte/icons/calendar';
	import { CalendarDate, type DateValue, getLocalTimeZone } from '@internationalized/date';
	import { cn } from '@/utils/styles';
	import { buttonVariants } from '@/components/ui/button';
	import { RangeCalendar } from '@/components/ui/range-calendar';
	import * as Popover from '@/components/ui/popover';
	import { time_options } from '@/constants';
	import { toast } from 'svelte-sonner';
	import { COLLECTIONS } from '@/db/index';
	import type { EventDetails, EventSchedule } from '@/db/models/types';
	import { createDate, formatDateToTimeOption, monthFormatter } from '@/utils/format';
	import { hasRequiredData } from '@/utils/validation';
	import { Label } from '@/components/ui/label';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import * as ImageCropper from '@/components/custom/image-cropper';
	import { watch } from 'runed';
	import { checkEventStatus } from '@routes/events/utils';

	interface EventFormProps {
		event_to_edit?: EventDetails;
		event_schedules?: EventSchedule[];
		event_form: SuperValidated<EventSchema>;
	}

	interface ComponentState {
		start_value: DateValue | undefined;
		date_range: {
			start: CalendarDate;
			end: CalendarDate;
		};
		event_dates: Omit<EventSchedule, 'event_id' | 'updated' | 'created'>[];
	}

	let { event_form, event_schedules, event_to_edit }: EventFormProps = $props();
	const event_status = $derived(
		checkEventStatus(event_to_edit?.start_date, event_to_edit?.end_date)
	);

	const form = superForm(event_form, {
		SPA: true,
		validators: zodClient(eventSchema),
		onUpdate: async ({ form, cancel }) => {
			// toast the values
			if (!form.valid) {
				toast.error('Form is invalid');
				return;
			}
			const difference_in_time =
				comp_state.date_range?.start && comp_state.date_range.end
					? new Date(comp_state.date_range.end.toString()).getTime() -
						new Date(comp_state.date_range.start.toString()).getTime()
					: 0;
			const difference_in_days = Math.round(difference_in_time / (1000 * 3600 * 24)) + 1;

			const added_settings_id = COLLECTIONS.SETTINGS_COLLECTION.insert({
				allow_add_participants_while_ongoing_event: false
			});

			let event_details_id = event_to_edit?.id || '';

			if (event_to_edit) {
				COLLECTIONS.EVENT_DETAILS_COLLECTION.updateOne(
					{ id: event_details_id },
					{
						$set: {
							event_name: $formData.title,
							type: 'other',
							location: $formData.location,
							description: $formData.description,
							is_multi_day: difference_in_days > 1,
							difference_in_days,
							start_date: comp_state.event_dates.at(0)?.am_start as Date,
							end_date: comp_state.event_dates.at(-1)?.pm_end as Date,
							updated: new Date()
						}
					}
				);

				if (event_status === 'upcoming') {
					COLLECTIONS.EVENT_SCHEDULE_COLLECTION.removeMany({
						event_id: event_details_id
					});

					COLLECTIONS.EVENT_SCHEDULE_COLLECTION.insertMany(
						comp_state.event_dates.map((event) => ({
							...event,
							event_id: event_details_id
						}))
					);
				}
			} else {
				event_details_id = COLLECTIONS.EVENT_DETAILS_COLLECTION.insert({
					event_name: $formData.title,
					type: 'other',
					settings_id: added_settings_id,
					location: $formData.location,
					description: $formData.description,
					is_multi_day: difference_in_days > 1,
					difference_in_days,
					start_date: comp_state.event_dates.at(0)?.am_start as Date,
					end_date: comp_state.event_dates.at(-1)?.pm_end as Date
				});

				COLLECTIONS.EVENT_SCHEDULE_COLLECTION.insertMany(
					comp_state.event_dates.map((event) => ({
						...event,
						event_id: event_details_id
					}))
				);
			}

			await goto(`/events/${event_details_id}`);
			console.log('added_event_details', event_details_id);
			toast.success(`Event is added and has ${difference_in_days} days`);
		}
	});
	const { form: formData, enhance, capture, restore } = form;

	export const snapshot = { capture, restore };

	const current_date = new Date();

	let comp_state = $state<ComponentState>({
		start_value: undefined,
		date_range: {
			start: event_to_edit?.start_date
				? new CalendarDate(
						event_to_edit.start_date.getFullYear(),
						event_to_edit.start_date.getMonth() + 1,
						event_to_edit.start_date.getDate()
					)
				: new CalendarDate(
						current_date.getFullYear(),
						current_date.getMonth() + 1,
						current_date.getDate()
					),
			end: event_to_edit?.end_date
				? new CalendarDate(
						event_to_edit.end_date.getFullYear(),
						event_to_edit.end_date.getMonth() + 1,
						event_to_edit.end_date.getDate()
					)
				: new CalendarDate(
						current_date.getFullYear(),
						current_date.getMonth() + 1,
						current_date.getDate()
					)
		},
		event_dates: event_schedules as any
	});

	function getDatesInRange(start: Date, end: Date): Date[] {
		const date_arr = [];
		let currentDate = new Date(start);

		while (currentDate <= end) {
			date_arr.push(new Date(currentDate));
			currentDate.setDate(currentDate.getDate() + 1);
		}

		return date_arr;
	}

	function handleGenerateEventDates() {
		if (!comp_state.date_range?.end && !comp_state.date_range?.start) {
			comp_state.event_dates = [];
		}

		if (comp_state.date_range?.start) {
			const start_date = new Date(comp_state.date_range.start.toString());
			const end_date = new Date(
				comp_state.date_range.end?.toString() || comp_state.date_range.start.toString()
			);

			console.log(getDatesInRange(start_date, end_date));
			comp_state.event_dates = getDatesInRange(start_date, end_date).map((date, index) => {
				const am_start = new Date(date);
				am_start.setHours(8, 0, 0, 0);
				const am_end = new Date(date);
				am_end.setHours(12, 0, 0, 0);
				const pm_start = new Date(date);
				pm_start.setHours(13, 0, 0, 0);
				const pm_end = new Date(date);
				pm_end.setHours(16, 0, 0, 0);

				const day = index + 1;
				const existing_event_sched = event_schedules?.at(index);

				if (existing_event_sched?.event_date.toLocaleDateString() === date.toLocaleDateString()) {
					console.log('existing', existing_event_sched?.event_date.toLocaleDateString());
					console.log(date.toLocaleDateString());
					return {
						id: nanoid(),
						event_date: date,
						event_id: '',
						day,
						am_start: existing_event_sched.am_start,
						am_end: existing_event_sched.am_end,
						pm_start: existing_event_sched.pm_start,
						pm_end: existing_event_sched.pm_end
					};
				}
				return {
					id: nanoid(),
					event_date: date,
					event_id: '',
					day,
					am_start,
					am_end,
					pm_start,
					pm_end
				};
			});
		}
	}

	function updateDateEventPeriodStartEnd({
		id,
		am_start,
		am_end,
		pm_start,
		pm_end
	}: {
		id: string;
		am_start?: string;
		am_end?: string;
		pm_start?: string;
		pm_end?: string;
	}) {
		console.log({ id, am_start, am_end, pm_start, pm_end });
		comp_state.event_dates = comp_state.event_dates.map((event) => {
			// $state.snapshot(event);
			if (event.id !== id) return event;

			const selected_am_start_idx = time_options.findIndex((o) => o === am_start);
			const selected_am_end_idx = time_options.findIndex((o) => o === am_end);
			const selected_pm_start_idx = time_options.findIndex((o) => o === pm_start);

			const current_am_end_idx = time_options.findIndex(
				(o) => o === formatDateToTimeOption(event.am_end)
			);
			const current_pm_end_idx = time_options.findIndex(
				(o) => o === formatDateToTimeOption(event.pm_end)
			);
			const current_pm_start_idx = time_options.findIndex(
				(o) => o === formatDateToTimeOption(event.pm_start)
			);

			let adjusted_am_end = formatDateToTimeOption(event.am_end);
			let adjusted_pm_end = formatDateToTimeOption(event.pm_end);

			if (selected_am_end_idx >= current_pm_start_idx) {
				toast.error('The selected AM end time has conflict with the current PM start time');
				return event;
			}

			if (am_start && selected_am_start_idx !== -1) {
				if (current_am_end_idx === -1 || selected_am_start_idx >= current_am_end_idx) {
					adjusted_am_end =
						time_options[selected_am_start_idx + 2] || formatDateToTimeOption(event.am_end);
				}
			}

			if (pm_start && selected_pm_start_idx !== -1) {
				if (current_pm_end_idx === -1 || selected_pm_start_idx >= current_pm_end_idx) {
					adjusted_pm_end =
						time_options[selected_pm_start_idx + 2] || formatDateToTimeOption(event.pm_end);
				}
			}

			const returned_data = {
				...event,
				am_start: am_start
					? createDate(event.event_date, am_start, formatDateToTimeOption(event.am_start))
					: event.am_start,
				am_end: am_end
					? createDate(event.event_date, am_end, formatDateToTimeOption(event.am_end))
					: createDate(event.event_date, adjusted_am_end, formatDateToTimeOption(event.am_end)),
				pm_start: pm_start
					? createDate(event.event_date, pm_start, formatDateToTimeOption(event.pm_start))
					: event.pm_start,
				pm_end: pm_end
					? createDate(event.event_date, pm_end, formatDateToTimeOption(event.pm_end))
					: createDate(event.event_date, adjusted_pm_end, formatDateToTimeOption(event.pm_end))
			};

			return returned_data;
		});
	}

	onMount(() => {
		handleGenerateEventDates();
		$formData.start_date = comp_state.date_range.start.toDate(getLocalTimeZone());
		$formData.end_date = comp_state.date_range.end.toDate(getLocalTimeZone());
	});

	watch([() => event_to_edit], () => {
		if (event_to_edit) {
			($formData.description = event_to_edit.description || ''),
				($formData.title = event_to_edit.event_name || ''),
				($formData.is_multi_day_event = event_to_edit.is_multi_day || false),
				($formData.location = event_to_edit.location || '');

			comp_state.date_range = {
				start: new CalendarDate(
					event_to_edit.start_date.getFullYear(),
					event_to_edit.start_date.getMonth() + 1,
					event_to_edit.start_date.getDate()
				),
				end: new CalendarDate(
					event_to_edit.end_date.getFullYear(),
					event_to_edit.end_date.getMonth() + 1,
					event_to_edit.end_date.getDate()
				)
			};

			comp_state.event_dates = event_schedules as any;
		}
	});
</script>

<form method="POST" use:enhance class="flex flex-col gap-1">
	<div class="flex gap-4">
		<div class="flex w-full flex-1 flex-col gap-4">
			<Form.Field {form} name="title" class="w-full">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label class="flex items-center gap-1"
							><Ticket class="size-4" /> Event Name</Form.Label
						>
						<Input
							{...props}
							class="bg-gray-700/10 dark:bg-white/10"
							bind:value={$formData.title}
							placeholder="Enter a clear, descriptive name (e.g., '2024 Annual Teachers Conference')"
							aria-label="Event name"
						/>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field {form} name="location" class="w-full">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label class="flex items-center gap-1"
							><MapPin class="size-4" />Location</Form.Label
						>
						<Input
							{...props}
							class="w-full bg-gray-700/10 dark:bg-white/10"
							bind:value={$formData.location}
							placeholder="Physical address"
							aria-label="Event location"
						/>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<div class="mb-3 grid gap-2">
				<p class="text-sm">Event Date</p>
				<div>
					<Popover.Root>
						<Popover.Trigger
							disabled={!hasRequiredData($formData, ['title', 'location']) ||
								(event_to_edit && event_status !== 'upcoming')}
							class={cn(
								buttonVariants({
									variant: 'outline',
									class: 'w-auto justify-start place-self-start text-left font-normal'
								}),
								!comp_state.date_range && 'text-muted-foreground'
							)}
						>
							<CalendarIcon />
							{#if comp_state.date_range && comp_state.date_range.start}
								{#if comp_state.date_range.end}
									{monthFormatter.format(comp_state.date_range.start.toDate(getLocalTimeZone()))} - {monthFormatter.format(
										comp_state.date_range.end.toDate(getLocalTimeZone())
									)}
								{:else}
									{monthFormatter.format(comp_state.date_range.start.toDate(getLocalTimeZone()))}
								{/if}
							{:else if comp_state.start_value}
								{monthFormatter.format(comp_state.start_value.toDate(getLocalTimeZone()))}
							{:else}
								Pick a date
							{/if}
						</Popover.Trigger>
						<Popover.Content class="w-auto p-0" align="start">
							<RangeCalendar
								bind:value={comp_state.date_range}
								onStartValueChange={(v) => {
									comp_state.start_value = v;
								}}
								onValueChange={(v) => {
									const { start, end } = v;
									if (!start || !end) return;
									handleGenerateEventDates();
									$formData.start_date = start?.toDate(getLocalTimeZone());
									$formData.end_date = end?.toDate(getLocalTimeZone());
								}}
								numberOfMonths={2}
							/>
						</Popover.Content>
					</Popover.Root>
					{#if event_status !== 'upcoming'}
						<div class="mt-2 flex gap-2">
							<Info class="size-4 text-yellow-500" />
							<p class="text-xs text-yellow-500">
								You cannot edit the date ranger picker as this event is already {event_status}
							</p>
						</div>
					{/if}
				</div>
			</div>
		</div>
		<ImageCropper.Root>
			<ImageCropper.UploadTrigger>
				<ImageCropper.Preview class="h-64 w-64 rounded-md" />
			</ImageCropper.UploadTrigger>
			<ImageCropper.Dialog>
				<ImageCropper.Cropper cropShape="rect" />
				<ImageCropper.Controls>
					<ImageCropper.Cancel />
					<ImageCropper.Crop />
				</ImageCropper.Controls>
			</ImageCropper.Dialog>
		</ImageCropper.Root>
	</div>
	<Form.Field {form} name="description" class="w-full">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Description</Form.Label>
				<Textarea
					{...props}
					bind:value={$formData.description}
					rows={5}
					class="bg-gray-700/10 dark:bg-white/10"
					placeholder="Provide details about the event, including agenda, speakers, or any special requirements"
					aria-label="Event description"
				/>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<div class="mt-4">
		<div class="mb-2 flex items-center justify-between">
			<Label>Event Time Schedules</Label>
			{#if event_status !== 'upcoming'}
				<div class="flex gap-2">
					<Info class="size-4 text-yellow-500" />
					<p class="text-xs text-yellow-500">
						You cannot edit the event time schedules this event is already {event_status}
					</p>
				</div>
			{/if}
		</div>

		<div class="max-h-[400px] overflow-y-auto">
			<div class="flex flex-col gap-4 pr-2">
				{#each comp_state.event_dates as event_date}
					<EventTimePicker
						is_selection_disabled={!hasRequiredData($formData, ['title', 'location']) ||
							(event_to_edit && event_status !== 'upcoming')}
						{event_date}
						day={event_date.day}
						{updateDateEventPeriodStartEnd}
					/>
				{/each}
			</div>
		</div>
	</div>

	<Form.Button
		disabled={!hasRequiredData($formData, ['title', 'location', 'start_date', 'end_date'])}
		class="mt-3">{event_to_edit ? 'Save Changes' : 'Submit'}</Form.Button
	>
</form>
