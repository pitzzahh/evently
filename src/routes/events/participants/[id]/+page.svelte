<script lang="ts">
	import { Button } from '@/components/ui/button';
	import { Check, Clock, Download, UsersRound } from 'lucide-svelte';
	import {
		AddParticipantsDialog,
		ParticipantDataTable,
		EventTimePicker
	} from '@routes/events/(components)';
	import type { EventSchedule, EventDetails } from '@/db/models/types';
	import { fly } from 'svelte/transition';
	import { COLLECTIONS } from '@/db/index';
	import type { Participant } from '@/db/models/types';
	import { watch } from 'runed';
	import { TableSkeleton } from '@/components/custom/skeleton/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '@/components/ui/badge';

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

	// TODO: ADD PARTICIPANT TIME IN AND OUT DATA
</script>

<div in:fly={{ y: 20 }} class="grid gap-6">
	<div class="flex items-center justify-between">
		<h2 class="text-5xl font-semibold">
			{comp_state.event_details?.event_name ?? 'N/A'}'s Participants
		</h2>

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
		<Tabs.List class="grid h-auto w-full max-w-[600px]  grid-cols-2">
			<Tabs.Trigger value="participants" class="h-auto text-base">
				<UsersRound class="mr-2 size-4" />
				All participants</Tabs.Trigger
			>
			<Tabs.Trigger value="recent" class="h-auto text-base">
				<Clock class="mr-2 size-4" />
				Time in and out</Tabs.Trigger
			>
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

		<Tabs.Content value="recent" class="mt-4">
			<div class=" flex gap-4">
				<Card.Root class="w-[450px]">
					<Card.Header>
						<Card.Title class="text-xl">Scan Result</Card.Title>
						<Card.Description>Participant information</Card.Description>
					</Card.Header>
					<Card.Content class="flex w-full justify-between">
						<div>
							<h5 class="font-semibold">Peter John Arao</h5>
							<p class="text-muted-foreground">test@test.com</p>
						</div>

						<div class="flex size-8 items-center justify-center rounded-full bg-green-200">
							<Check class="size-4 text-green-600" />
						</div>
					</Card.Content>
					<Card.Footer class="flex justify-between">
						<Badge variant="outline">Date: Feb 20, 2025</Badge>
						<Badge>Time in: 8:50 AM</Badge>
					</Card.Footer>
				</Card.Root>

				<div class="grid flex-1 gap-2">
					{#if COLLECTIONS.PARTICIPANT_COLLECTION.isPulling()}
						<TableSkeleton />
					{:else}
						<ParticipantDataTable
							participant_form={data.participant_form}
							participants={comp_state.participants}
						/>
					{/if}
				</div>
			</div>
		</Tabs.Content>
	</Tabs.Root>
</div>
