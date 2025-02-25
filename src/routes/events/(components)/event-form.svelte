<script module lang="ts">
	interface Props {
		event_form: SuperValidated<EventSchema>;
	}
</script>

<script lang="ts">
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import Textarea from '@/components/ui/textarea/textarea.svelte';
	import { eventSchema, type EventSchema } from '@/schema/event';
	import { MapPin, Ticket } from 'lucide-svelte';
	import SuperDebug, { type SuperValidated, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { nanoid } from 'nanoid';
	import EventTimePicker from './event-time-picker.svelte';
	import CalendarIcon from 'lucide-svelte/icons/calendar';

	import { CalendarDate, type DateValue, getLocalTimeZone } from '@internationalized/date';
	import { cn } from '$lib/utils.js';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import { RangeCalendar } from '$lib/components/ui/range-calendar/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { time_options } from '@/constants';
	import { toast } from 'svelte-sonner';
	import { COLLECTIONS } from '@/db/index';
	import type { EventSchedule } from '@/db/models/types';
	import {
		createDate,
		extractHoursAndMinutes,
		formatDateToTimeOption,
		monthFormatter
	} from '@/utils/format';
	import { dev } from '$app/environment';
	import { hasRequiredData } from '@/utils/validation';
	import { Label } from '@/components/ui/label';
	import { goto } from '$app/navigation';

	interface ComponentState {
		start_value: DateValue | undefined;
		date_range: {
			start: CalendarDate;
			end: CalendarDate;
		};
		event_dates: Omit<EventSchedule, 'event_id' | 'updated' | 'created'>[];
	}

	let { event_form }: Props = $props();

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

			const added_event_details_id = COLLECTIONS.EVENT_DETAILS_COLLECTION.insert({
				event_name: $formData.title,
				location: $formData.location,
				description: $formData.description,
				is_multi_day: difference_in_days > 1,
				difference_in_days,
				start_date: $formData.start_date,
				end_date: $formData.end_date,
				type: "other"
			});

			goto(`/events/${added_event_details_id}`);
			console.log('added_event_details', added_event_details_id);
			toast.success(`Event is added and has ${difference_in_days} days`);
		}
	});
	const { form: formData, enhance } = form;

	const current_date = new Date();

	let comp_state = $state<ComponentState>({
		start_value: undefined,
		date_range: {
			start: new CalendarDate(
				current_date.getFullYear(),
				current_date.getMonth() + 1,
				current_date.getDate()
			),
			end: new CalendarDate(
				current_date.getFullYear(),
				current_date.getMonth() + 1,
				current_date.getDate()
			)
		},
		event_dates: []
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
			comp_state.event_dates = getDatesInRange(start_date, end_date).map((date) => ({
				id: nanoid(),
				event_date: date,
				am_start: new Date(`1970-01-01T08:00:00`),
				am_end: new Date('1970-01-01T12:00:00'),
				pm_start: new Date('1970-01-01T13:00:00'),
				pm_end: new Date('1970-01-01T16:00:00')
			}));
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
			const selected_pm_start_idx = time_options.findIndex((o) => o === pm_start);
			const current_am_end_idx = time_options.findIndex(
				(o) => o === formatDateToTimeOption(event.am_end)
			);
			const current_pm_end_idx = time_options.findIndex(
				(o) => o === formatDateToTimeOption(event.pm_end)
			);

			let adjusted_am_end = formatDateToTimeOption(event.am_end);
			let adjusted_pm_end = formatDateToTimeOption(event.pm_end);

			if (am_start && selected_am_start_idx !== -1) {
				console.log(am_start && selected_am_start_idx !== -1);
				console.log({
					current_am_end_idx,
					selected_am_start_idx
				});
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
			console.log('adjusted_am_end', adjusted_am_end);
			console.log('adjusted_pm_end', adjusted_pm_end);
			const am_start_extract = am_start ? extractHoursAndMinutes(am_start) : event.am_start;
			const am_end_extract = extractHoursAndMinutes(adjusted_am_end);
			const pm_start_extract = pm_start ? extractHoursAndMinutes(pm_start) : event.pm_start;
			const pm_end_extract = extractHoursAndMinutes(adjusted_pm_end);

			console.log({
				am_start_extract,
				am_end_extract,
				pm_start_extract,
				pm_end_extract
			});

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

			console.log('returned_data', returned_data);

			return returned_data;
		});
	}
</script>

<form method="POST" use:enhance class="flex flex-col gap-1">
	<Form.Field {form} name="title">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label class="flex items-center gap-1"><Ticket class="size-4" /> Event Name</Form.Label
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
				<Form.Label class="flex items-center gap-1"><MapPin class="size-4" />Location</Form.Label>
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

	<Form.Field {form} name="description">
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

	<div class="mb-3 grid gap-2">
		<p class="text-sm">Event Date</p>
		<Popover.Root>
			<Popover.Trigger
				disabled={!hasRequiredData($formData, ['title', 'location', 'description'])}
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
	</div>

	<div
		class={cn({
			hidden: !hasRequiredData($formData, ['title', 'location', 'description'])
		})}
	>
		<Label>Time</Label>
		<div class="max-h-[400px] overflow-y-auto">
			<div class="flex flex-col gap-2 pr-1">
				{#each comp_state.event_dates as event_date, index}
					<EventTimePicker {event_date} day={index + 1} {updateDateEventPeriodStartEnd} />
				{/each}
			</div>
		</div>
	</div>
	<Form.Button
		disabled={!hasRequiredData($formData, [
			'title',
			'location',
			'description',
			'start_date',
			'end_date'
		])}>Add</Form.Button
	>
</form>

{#if dev}
	<SuperDebug data={$formData} />
{/if}
