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
	import { fly } from 'svelte/transition';
	import { COLLECTIONS } from '@/db/index';
	import type { Participant } from '@/db/models/types';
	import { formatDateTime, formatDateToTimeOption } from '@/utils/format';
	import { watch } from 'runed';
	import { StatusPill } from '@/components/snippets';
	import { goto } from '$app/navigation';
	import { checkEventStatus, getEventDayInfo } from '../utils/index.js';
	import * as Dialog from '@/components/ui/dialog';
	import { onMount } from 'svelte';

	let { data } = $props();

	interface ComponentState {
		event_details: EventDetails | undefined;
		event_schedules: EventSchedule[];
		participants: Participant[];
		see_more: boolean;
		confimation_open: boolean;
	}

	let comp_state = $state<ComponentState>({
		event_details: undefined,
		event_schedules: [],
		participants: [],
		see_more: true,
		confimation_open: false
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

	watch(
		[
			() => COLLECTIONS.PARTICIPANT_COLLECTION.isLoading(),
			() => COLLECTIONS.EVENT_SCHEDULE_COLLECTION.isLoading(),
			() => COLLECTIONS.EVENT_DETAILS_COLLECTION.isLoading()
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
		<Avatar.Root
			class={cn(
				'aspect-square h-[280px] w-[280px] rounded-md ring-2 ring-accent ring-offset-2 ring-offset-background '
			)}
		>
			<Avatar.Image src={comp_state.event_details?.cover} />
			<Avatar.Fallback class="aspect-square h-[280px] w-[280px] rounded-md"
				>EVENT COVER</Avatar.Fallback
			>
		</Avatar.Root>

		<div class="flex w-full flex-1 flex-col gap-4">
			<div class="flex w-full items-center justify-between">
				<h2 class="text-5xl font-semibold">{comp_state.event_details?.event_name ?? 'N/A'}</h2>
				<div class="flex items-center gap-2">
					{@render StatusPill(event_status)}
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
			</div>

			<!-- EVENT DETAILS -->
			<div class="grid grid-cols-2 grid-rows-2 gap-4">
				<div class="flex items-center gap-3">
					<div class="rounded-md border p-3">
						<Calendar class="size-5 text-muted-foreground" />
					</div>
					<div>
						<p class="text-base font-medium">
							{formatDateTime(comp_state.event_details?.start_date)}
						</p>
						<p class="text-muted-foreground">
							{formatDateToTimeOption(comp_state.event_schedules.at(0)?.am_start)} - {formatDateToTimeOption(
								comp_state.event_schedules.at(0)?.pm_end
							)}
						</p>
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
						<p class=" text-muted-foreground">Duration</p>
					</div>
				</div>

				<div class="flex items-center gap-3">
					<div class="rounded-md border p-3">
						<UsersRound class="size-5 text-muted-foreground" />
					</div>
					<div>
						<p class="text-base font-medium">{comp_state.participants.length}</p>
						<p class=" text-muted-foreground">
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
						<p class=" text-muted-foreground">Location</p>
					</div>
				</div>
			</div>
		</div>
	</div>

	<Button
		variant="outline"
		class="place-self-end"
		onclick={() => (comp_state.see_more = !comp_state.see_more)}
	>
		{comp_state.see_more ? 'See Less' : 'See More'}
	</Button>
	<div
		class={cn(
			'grid gap-3 overflow-hidden rounded-lg border bg-white p-4 transition-all duration-300 dark:bg-[#151e28]',
			{
				'm-0 h-0 p-0 opacity-0': !comp_state.see_more,
				'h-auto opacity-100': comp_state.see_more
			}
		)}
	>
		<!-- EVENT STATS -->
		<div
			class={cn('transition-scale grid gap-3 rounded-lg border p-4 duration-300', {
				'origin-top scale-y-0 opacity-0': !comp_state.see_more,
				'scale-y-100 opacity-100': comp_state.see_more
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
					<p class="text-muted-foreground">
						{#if event_status === 'upcoming' || event_status === 'ongoing'}
							Attending
						{:else if event_status === 'finished'}
							Attended
						{/if}
					</p>
					<p>{comp_state.participants.length}</p>
				</div>
			</div>
		</div>
	</div>
	<div class="flex max-h-[400px] flex-col gap-2 overflow-y-auto pr-1">
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
