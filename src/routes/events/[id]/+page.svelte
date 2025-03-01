<script lang="ts">
	import { Button } from '@/components/ui/button';
	import { Calendar, ChartBar, MapPin, Settings, UsersRound, Edit, Trash } from 'lucide-svelte';
	import { cn } from '@/utils/styles';
	import { EventTimePicker, ParticipantDialog } from '@routes/events/(components)';
	import * as DropdownMenu from '@/components/ui/dropdown-menu/index.js';
	import type { EventSchedule, EventDetails } from '@/db/models/types';
	import { fly } from 'svelte/transition';
	import { COLLECTIONS } from '@/db/index';
	import type { Participant } from '@/db/models/types';
	import { formatDateTime } from '@/utils/format';
	import { watch } from 'runed';
	import { StatusPill } from '@/components/snippets';

	let { data } = $props();

	interface ComponentState {
		event_details: EventDetails | undefined;
		event_schedules: EventSchedule[];
		participants: Participant[];
		see_more: boolean;
	}

	let comp_state = $state<ComponentState>({
		event_details: undefined,
		event_schedules: [],
		participants: [],
		see_more: true
	});

	const event_status = $derived(
		comp_state.event_details?.start_date &&
			comp_state.event_details?.end_date &&
			new Date() >= new Date(comp_state.event_details.start_date) &&
			new Date() <= new Date(comp_state.event_details.end_date)
			? 'ongoing'
			: comp_state.event_details?.end_date &&
				  new Date() > new Date(comp_state.event_details.end_date)
				? 'finished'
				: 'upcoming'
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
			comp_state.participants = participants_cursor.fetch();
			comp_state.event_schedules = event_schedule_cursor.fetch();
			comp_state.event_details = COLLECTIONS.EVENT_DETAILS_COLLECTION.findOne({
				id: data.event_id
			});

			$inspect(
				comp_state.event_details?.start_date && comp_state.event_details.start_date > new Date()
			);

			return () => {
				participants_cursor.cleanup();
				event_schedule_cursor.cleanup();
			};
		}
	);
</script>

<div in:fly={{ y: 20 }} class="grid gap-6">
	<div class="flex items-center justify-between">
		<h2 class="text-5xl font-semibold">{comp_state.event_details?.event_name ?? 'N/A'}</h2>

		<div class="flex items-center gap-2">
			{@render StatusPill(event_status)}

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
								<p class="text-base font-medium">{comp_state.participants.length}</p>
								<p class=" text-muted-foreground">
									Participant{comp_state.participants.length > 1 ? 's' : ''}
								</p>
							</div>
						</div>
					</div>
					<ParticipantDialog
						participant_form={data.participant_form}
						add_participants_form={data.add_participants_form}
						event_details={comp_state.event_details}
						disable_add_participants={event_status === 'finished' || event_status === 'ongoing'}
					/>
				</div>

				<div class="flex items-center justify-between gap-4">
					<div class="flex items-center gap-3">
						<div class="rounded-md border p-3"><MapPin class="size-5 text-muted-foreground" /></div>
						<p class="text-base font-medium">{comp_state.event_details?.location ?? 'N/A'}</p>
					</div>

					<Button variant="ghost" onclick={() => (comp_state.see_more = !comp_state.see_more)}>
						{comp_state.see_more ? 'See Less' : 'See More'}
					</Button>
				</div>
			</div>
		</div>
		<div
			class={cn(
				'grid gap-3 overflow-hidden rounded-lg border bg-white p-4 transition-all duration-300 dark:bg-[#1C1E20]',
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
	</div>
	<div class="flex max-h-[400px] flex-col gap-2 overflow-y-auto pr-1">
		{#each comp_state.event_schedules as event_date, index}
			<EventTimePicker {event_date} day={index + 1} is_selection_disabled={true} />
		{/each}
	</div>
</div>
