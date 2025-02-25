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
		View
	} from 'lucide-svelte';
	import { cn } from '@/utils';
	import AttendeesDataTable from '../(components)/attendees-data-table.svelte';
	import { nanoid } from 'nanoid';
	import EventTimePicker from '../(components)/event-time-picker.svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import ParticipantsDialog from '../(components)/participants-dialog.svelte';
	import type { EventSchedule, EventDetails } from '@/db/models/types';
	import { scale } from 'svelte/transition';
	import { COLLECTIONS } from '@/db/index';
	import type { Participant } from '@/db/models/types';
	import { formatDateTime } from '@/utils/format';

	let { data } = $props();
	const { event_id } = $derived(data);
	let see_more = $state(true);

	interface ComponentState {
		event_details: EventDetails | undefined;
		event_schedule: EventSchedule[];
		participants: Participant[];
		see_more: boolean;
	}

	let comp_state = $state<ComponentState>({
		event_details: undefined,
		event_schedule: [],
		participants: [],
		see_more: false
	});

	$effect(() => {
		const participants_cursor = COLLECTIONS.PARTICIPANT_COLLECTION.find(
			{},
			{ fieldTracking: true }
		);
		const event_schedule_cursor = COLLECTIONS.EVENT_SCHEDULE_COLLECTION.find(
			{
				event_id
			},
			{ fieldTracking: true }
		);
		comp_state.participants = participants_cursor.fetch();
		comp_state.event_schedule = event_schedule_cursor.fetch();
		comp_state.event_details = COLLECTIONS.EVENT_DETAILS_COLLECTION.findOne(
			{
				id: event_id
			},
			{ fieldTracking: true }
		);

		return () => {
			participants_cursor.cleanup();
			event_schedule_cursor.cleanup();
		};
	});
</script>

<div in:scale class="grid gap-6">
	<div class="flex items-center justify-between">
		<h2 class="text-5xl font-semibold">{comp_state.event_details?.event_name ?? 'N/A'}</h2>

		<div class="flex items-center gap-2">
			{@render StatusPill('ongoing')}

			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					<button class="rounded-md border p-3"><Settings class="size-5" /></button>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content side="bottom" align="end" sideOffset={10}>
					<DropdownMenu.Group>
						<DropdownMenu.Item><Edit class="size-4" /> Edit event</DropdownMenu.Item>
						<DropdownMenu.Item class="!text-red-600 hover:!bg-red-600/20"
							><Trash class="size-4" />Delete event</DropdownMenu.Item
						>
					</DropdownMenu.Group>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>
	</div>

	<!-- EVENT DETAILS -->
	<div class="grid gap-6 border-b-2 border-dashed pb-6">
		<div class="flex items-end justify-between">
			<div class="grid w-full gap-4">
				<div class="flex w-full justify-between gap-4">
					<div class="flex gap-5">
						<div class="flex items-center gap-3">
							<div class="rounded-md border p-3">
								<Calendar class="size-5 text-muted-foreground" />
							</div>
							<div>
								<p class="text-base font-medium">
									{formatDateTime(comp_state.event_details?.start_date)}
								</p>
								<p class="text-muted-foreground">11:30 PM - 12:30 AM</p>
							</div>
						</div>
						<div class="flex items-center gap-3">
							<div class="rounded-md border p-3">
								<UsersRound class="size-5 text-muted-foreground" />
							</div>
							<div>
								<p class="text-base font-medium">100</p>
								<p class=" text-muted-foreground">Participants</p>
							</div>
						</div>
					</div>
					<ParticipantsDialog add_participants_form={data.add_participants_form} />
				</div>

				<div class="flex items-center justify-between gap-4">
					<div class="flex items-center gap-3">
						<div class="rounded-md border p-3"><MapPin class="size-5 text-muted-foreground" /></div>
						<p class="text-base font-medium">{comp_state.event_details?.location ?? 'N/A'}</p>
					</div>

					<Button variant="ghost" onclick={() => (see_more = !see_more)}>
						{see_more ? 'See Less' : 'See More'}
					</Button>
				</div>
			</div>
		</div>
		<div
			class={cn(
				'grid gap-3 overflow-hidden rounded-lg border bg-white p-4 transition-all duration-300 dark:bg-[#1C1E20]',
				{
					'm-0 h-0 p-0 opacity-0': !see_more,
					'h-auto opacity-100': see_more
				}
			)}
		>
			<!-- EVENT STATS -->
			<div
				class={cn('transition-scale grid gap-3 rounded-lg border p-4 duration-300', {
					'origin-top scale-y-0 opacity-0': !see_more,
					'scale-y-100 opacity-100': see_more
				})}
			>
				<div class="flex items-center justify-between">
					<h3 class="text-lg font-semibold">Event Stats</h3>
					<div class="rounded-md border border-blue-500 bg-blue-500/20 p-2">
						<ChartBar class="size-5 text-blue-500" />
					</div>
				</div>

				<div class="grid gap-2 text-sm">
					<div class="flex justify-between">
						<p class="text-muted-foreground">Total Spots</p>
						<p>100</p>
					</div>
					<div class="flex justify-between">
						<p class="text-muted-foreground">Spots Remaining</p>
						<p>95</p>
					</div>
					<div class="flex justify-between">
						<p class="text-muted-foreground">Attended</p>
						<p>5</p>
					</div>
				</div>
			</div>
		</div>
	</div>

	<div class="grid gap-2">
		{#each comp_state.event_schedule as event_date, index}
			<EventTimePicker {event_date} day={index + 1} isSelectionDisabled={true} />
		{/each}
	</div>
</div>

{#snippet StatusPill(status: 'upcoming' | 'finished' | 'ongoing')}
	<p
		class={cn('rounded-lg border px-4 py-3 text-sm', {
			'border-blue-500 bg-blue-500/20': status === 'upcoming',
			'border-green-600 bg-green-600/30': status === 'ongoing'
		})}
	>
		{status.charAt(0)?.toUpperCase().concat(status.slice(1))}
	</p>
{/snippet}
