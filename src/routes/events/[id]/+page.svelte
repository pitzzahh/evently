<script lang="ts">
	import { Button } from '@/components/ui/button';
	import { Calendar, ChartBar, ChevronLeft, MapPin, Settings, UsersRound } from 'lucide-svelte';

	import type { PageData } from './$types';
	import { cn } from '@/utils';
	import AttendeesDataTable from '../(components)/attendees-data-table.svelte';
	import { browser } from '$app/environment';

	let { data }: { data: PageData } = $props();
	let see_more = $state(true);

	function toggleSeeMore() {
		see_more = !see_more;
	}
</script>

<div class="grid gap-6">
	<div class="flex items-center justify-between">
		<div class="flex flex-col gap-4">
			<Button
				variant="outline"
				size="icon"
				onclick={async () => {
					if (browser) window.history.back();
				}}
			>
				<ChevronLeft class="size-4" />
			</Button>
			<h2 class="text-5xl font-semibold">Teacher's Seminar</h2>
		</div>

		<div class="flex items-center gap-2">
			{@render StatusPill('finished')}
			<button class="rounded-md border p-3"><Settings class="size-5" /></button>
		</div>
	</div>

	<div class="grid gap-6 border-b-2 border-dashed pb-6">
		<div class="flex items-end justify-between">
			<div class="grid gap-4">
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
							<p class=" text-muted-foreground">Attendees</p>
						</div>
					</div>
				</div>

				<div class="flex items-center gap-3">
					<div class="rounded-md border p-3"><MapPin class="size-5 text-muted-foreground" /></div>
					<p class="text-base font-medium">Legazpi City</p>
				</div>
			</div>
			<Button variant="ghost" onclick={toggleSeeMore}>{see_more ? 'See Less' : 'See More'}</Button>
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
