<script module lang="ts">
	interface Props {
		event_form: SuperValidated<EventSchema>;
	}

	export interface EventDateTime {
		id: string;
		date: Date;
		am_start: string;
		am_end: string;
		pm_start: string;
		pm_end: string;
	}
</script>

<script lang="ts">
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Switch } from '@/components/ui/switch';
	import Textarea from '@/components/ui/textarea/textarea.svelte';
	import { eventSchema, type EventSchema } from '@/schema/event';
	import { Circle, Dot, MapPin, Ticket } from 'lucide-svelte';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { nanoid } from 'nanoid';

	import CalendarIcon from 'lucide-svelte/icons/calendar';
	import type { DateRange } from 'bits-ui';
	import {
		CalendarDate,
		DateFormatter,
		type DateValue,
		getLocalTimeZone
	} from '@internationalized/date';
	import { cn } from '$lib/utils.js';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import { RangeCalendar } from '$lib/components/ui/range-calendar/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import EventTimePicker from './event-time-picker.svelte';
	import { time_options } from '@/constants';

	let { event_form }: Props = $props();
	const form = superForm(event_form, {
		SPA: true,
		validators: zodClient(eventSchema)
	});
	const { form: formData, enhance } = form;

	const current_date = new Date();
	const df = new DateFormatter('en-US', {
		dateStyle: 'medium'
	});
	let start_value = $state<DateValue | undefined>(undefined);
	let date_range = $state<DateRange | undefined>({
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
	});
	// let difference_in_time = $derived(
	// 	date_range?.start && date_range.end
	// 		? new Date(date_range.end.toString()).getTime() -
	// 				new Date(date_range.start.toString()).getTime()
	// 		: 0
	// );
	// let difference_in_days = $derived(Math.round(difference_in_time / (1000 * 3600 * 24)) + 1);
	let event_dates: EventDateTime[] = $state([]);

	function getDatesInRange(start: Date, end: Date): Date[] {
		const date_arr = [];
		let currentDate = new Date(start);

		while (currentDate <= end) {
			date_arr.push(new Date(currentDate));
			currentDate.setDate(currentDate.getDate() + 1);
		}

		return date_arr;
	}

	$effect(() => {
		if (!date_range?.end && !date_range?.start) {
			event_dates = [];
		}

		if (date_range?.start) {
			const start_date = new Date(date_range.start.toString());
			const end_date = new Date(date_range.end?.toString() || date_range.start.toString());
			event_dates = getDatesInRange(start_date, end_date).map((date) => ({
				id: nanoid(),
				date,
				am_start: '8:00 AM',
				am_end: '12:00 AM',
				pm_start: '1:00 PM',
				pm_end: '4:00 PM'
			}));
		}
	});

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
		event_dates = event_dates.map((event) => {
			if (event.id !== id) return event;

			const selected_am_start_idx = time_options.findIndex((o) => o === am_start);
			const selected_pm_start_idx = time_options.findIndex((o) => o === pm_start);
			const current_am_end_idx = time_options.findIndex((o) => o === event.am_end);
			const current_pm_end_idx = time_options.findIndex((o) => o === event.pm_end);

			let adjusted_am_end = event.am_end;
			let adjusted_pm_end = event.pm_end;

			if (am_start && selected_am_start_idx !== -1) {
				if (current_am_end_idx === -1 || selected_am_start_idx >= current_am_end_idx) {
					adjusted_am_end = time_options[selected_am_start_idx + 1] || event.am_end;
				}
			}

			if (pm_start && selected_pm_start_idx !== -1) {
				if (current_pm_end_idx === -1 || selected_pm_start_idx >= current_pm_end_idx) {
					adjusted_pm_end = time_options[selected_pm_start_idx + 1] || event.pm_end;
				}
			}

			return {
				...event,
				am_start: am_start || event.am_start,
				am_end: am_end || adjusted_am_end,
				pm_start: pm_start || event.pm_start,
				pm_end: pm_end || adjusted_pm_end
			};
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

	<Form.Field {form} name="description" class="w-full">
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
				class={cn(
					buttonVariants({
						variant: 'outline',
						class: 'w-[300px] justify-start text-left font-normal'
					}),
					!date_range && 'text-muted-foreground'
				)}
			>
				<CalendarIcon />
				{#if date_range && date_range.start}
					{#if date_range.end}
						{df.format(date_range.start.toDate(getLocalTimeZone()))} - {df.format(
							date_range.end.toDate(getLocalTimeZone())
						)}
					{:else}
						{df.format(date_range.start.toDate(getLocalTimeZone()))}
					{/if}
				{:else if start_value}
					{df.format(start_value.toDate(getLocalTimeZone()))}
				{:else}
					Pick a date
				{/if}
			</Popover.Trigger>
			<Popover.Content class="w-auto p-0" align="start">
				<RangeCalendar
					bind:value={date_range}
					onStartValueChange={(v) => {
						start_value = v;
					}}
					numberOfMonths={2}
				/>
			</Popover.Content>
		</Popover.Root>
	</div>

	<Form.Field {form} name="description">
		<Form.Control>
			{#snippet children({ props })}
				<div class="flex justify-between">
					<Form.Label>Time</Form.Label>
				</div>

				<div class="max-h-[400px] overflow-y-auto">
					<div class="flex flex-col gap-2">
						{#each event_dates as event_date, index}
							<EventTimePicker {event_date} day={index + 1} {updateDateEventPeriodStartEnd} />
						{/each}
					</div>
				</div>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Button>Submit</Form.Button>
</form>
