<script lang="ts">
	import { Button } from '@/components/ui/button';
	import type { EventDetails } from '@/db/models/types';
	import { formatDate } from '@/utils/format';
	import { ChevronRightIcon, MapPin, UsersRound } from 'lucide-svelte';
	import {
		TimelineItem,
		TimelineSeparator,
		TimelineContent,
		TimelineOppositeContent
	} from 'svelte-vertical-timeline';

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
			<div class="flex w-full items-start justify-between">
				<div class="grid place-content-start gap-1">
					<p>4:00 PM</p>
					<h3 class="text-lg font-semibold text-gray-900 dark:text-white">{event_name}</h3>
					<div class="flex items-center gap-1 text-muted-foreground">
						<MapPin class="size-4" />
						<p>{location}</p>
					</div>

					<Button
						href="/events/20"
						class="mt-3 inline-flex items-center rounded-lg border px-4 py-2 text-sm font-medium dark:border-white/20"
					>
						See Details
						<ChevronRightIcon />
					</Button>
				</div>

				<div class="flex flex-col items-center gap-1">
					<p class="text-4xl font-semibold">100</p>

					<div class="flex items-center gap-2 text-muted-foreground">
						<UsersRound class="size-4" />
						<p class="text-sm font-medium">Participants</p>
					</div>
				</div>
			</div>
		</div>
	</TimelineContent>
</TimelineItem>
