<script lang="ts">
	import { StatusPill } from '@/components/snippets';
	import { Button } from '@/components/ui/button';
	import { COLLECTIONS } from '@/db';
	import type { EventDetails } from '@/db/models/types';
	import { formatDate } from '@/utils/format';
	import { ChevronRightIcon, MapPin, UsersRound } from 'lucide-svelte';
	import { watch } from 'runed';
	import {
		TimelineItem,
		TimelineSeparator,
		TimelineContent,
		TimelineOppositeContent
	} from 'svelte-vertical-timeline';

	interface ComponentState {
		number_of_participants: number;
	}

	let {
		id,
		event_name,
		location,
		description,
		created,
		difference_in_days,
		is_multi_day,
		end_date,
		start_date,
		updated
	}: EventDetails = $props();

	let comp_state = $state<ComponentState>({
		number_of_participants: 0
	});

	watch(
		() => COLLECTIONS.PARTICIPANT_COLLECTION.isLoading(),
		() => {
			comp_state.number_of_participants =
				COLLECTIONS.EVENT_DETAILS_COLLECTION.getNumberOfParticipants(id);
		}
	);
</script>

<TimelineItem>
	<TimelineOppositeContent slot="opposite-content" style="flex: 0; margin: 0;">
		<div class="sticky top-[5rem] mb-[3rem] flex w-[200px] flex-col items-start gap-2">
			<p class="text-lg font-semibold leading-none">{formatDate(start_date)}</p>
			<p class="text-lg font-semibold leading-none text-muted-foreground/80">Tuesday</p>
		</div>
	</TimelineOppositeContent>
	<TimelineSeparator>
		<div
			class="sticky top-[5rem] mb-[4.9rem] h-3 w-3 rounded-full border border-white bg-gray-400 dark:border-gray-900 dark:bg-gray-700"
		></div>
		<div
			class="absolute h-full border-s-2 border-dashed border-gray-400 dark:border-gray-700"
		></div>
	</TimelineSeparator>
	<TimelineContent style="margin: 0;">
		<div
			class="mb-10 ms-4 rounded-xl border bg-white p-4 transition duration-500 ease-in-out hover:border-black/50 dark:bg-[#1C1E20] dark:hover:border-white/50"
		>
			<div class="relative flex w-full items-start justify-between">
				<div class="grid place-content-start gap-1">
					<p>
						{difference_in_days}
						{difference_in_days > 1 ? 'days' : 'day'} event
					</p>
					<h3 class="text-lg font-semibold text-gray-900 dark:text-white">{event_name}</h3>
					<div class="flex items-center gap-1 text-muted-foreground">
						<MapPin class="size-4" />
						<p>{location}</p>
					</div>

					<Button
						href="/events/{id}"
						class="mt-3 inline-flex items-center rounded-lg border px-4 py-2 text-sm font-medium dark:border-white/20"
					>
						See Details
						<ChevronRightIcon />
					</Button>
				</div>
				<div class="absolute -right-6 -top-10">
					{@render StatusPill(
						start_date &&
							end_date &&
							new Date() >= new Date(start_date) &&
							new Date() <= new Date(end_date)
							? 'ongoing'
							: end_date && new Date() > new Date(end_date)
								? 'finished'
								: 'upcoming',
						'sm'
					)}
				</div>
				<div class="flex flex-col items-center gap-1">
					<p class="text-4xl font-semibold">{comp_state.number_of_participants}</p>

					<div class="flex items-center gap-2 text-muted-foreground">
						<UsersRound class="size-4" />
						<p class="text-sm font-medium">
							Participant{comp_state.number_of_participants > 1 ? 's' : ''}
						</p>
					</div>
				</div>
			</div>
		</div>
	</TimelineContent>
</TimelineItem>
