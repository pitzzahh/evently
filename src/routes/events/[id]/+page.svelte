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

	import { type PageData } from './$types';
	import { cn } from '@/utils';
	import AttendeesDataTable from '../(components)/attendees-data-table.svelte';
	import { nanoid } from 'nanoid';
	import type { EventDateTime } from '../(components)/event-form.svelte';
	import EventTimePicker from '../(components)/event-time-picker.svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import ParticipantsDialog from '../(components)/participants-dialog.svelte';

	let { data }: { data: PageData } = $props();
	let see_more = $state(true);

	function toggleSeeMore() {
		see_more = !see_more;
	}

	const event_dates: EventDateTime[] = [
		{
			id: nanoid(),
			date: new Date(2025, 1, 24), // February 24, 2025
			am_start: '8:00 AM',
			am_end: '12:00 PM',
			pm_start: '1:00 PM',
			pm_end: '5:00 PM'
		},
		{
			id: nanoid(),
			date: new Date(2025, 1, 25), // February 25, 2025
			am_start: '9:00 AM',
			am_end: '12:30 PM',
			pm_start: '1:30 PM',
			pm_end: '6:00 PM'
		},
		{
			id: nanoid(),
			date: new Date(2025, 1, 26), // February 26, 2025
			am_start: '7:30 AM',
			am_end: '11:30 AM',
			pm_start: '12:30 PM',
			pm_end: '4:30 PM'
		}
	];
</script>

<div class="grid gap-6">
	<div class="flex items-center justify-between">
		<h2 class="text-5xl font-semibold">Teacher's Seminar</h2>

		<div class="flex items-center gap-2">
			{@render StatusPill('finished')}

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
								<p class="text-base font-medium">Wednesday, November 20, 2024</p>
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
					<ParticipantsDialog />
				</div>

				<div class="flex items-center justify-between gap-4">
					<div class="flex items-center gap-3">
						<div class="rounded-md border p-3"><MapPin class="size-5 text-muted-foreground" /></div>
						<p class="text-base font-medium">Legazpi City</p>
					</div>

					<Button variant="ghost" onclick={toggleSeeMore}>
						{see_more ? 'See Less' : 'See More'}
					</Button>
				</div>
			</div>
		</div>

		<!-- EVENT STATS -->
		{#if see_more}
			<div class="grid gap-3 rounded-lg border bg-white p-4 dark:bg-[#1C1E20]">
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
		{/if}
	</div>

	<div class="grid gap-2">
		{#each event_dates as event_date, index}
			<EventTimePicker {event_date} day={index + 1} isSelectionDisabled={true} />
		{/each}
	</div>

	<!-- TODO: ADD ATTENDEES TABLE HERE -->
	<div class="grid gap-4">
		<h4 class="text-lg font-medium">Attendees</h4>
		<AttendeesDataTable />
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
