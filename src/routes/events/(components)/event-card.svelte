<script>
	import { Button } from '@/components/ui/button';
	import { ChevronRightIcon, MapPin, UsersRound } from 'lucide-svelte';
</script>

<li
	class="mb-10 ms-4 rounded-xl border bg-white p-4 transition duration-500 ease-in-out hover:border-black/50 dark:bg-[#1C1E20] dark:hover:border-white/50"
>
	<div class="sticky-date absolute -start-[12.5rem] mt-1.5 grid gap-1">
		<p class=" text-lg font-semibold leading-none">February 24, 2022</p>
		<p class=" text-lg font-semibold leading-none text-muted-foreground/80">Tuesday</p>
	</div>

	<div
		class="absolute -start-1.5 mt-1.5 h-3 w-3 rounded-full border border-white bg-gray-400 dark:border-gray-900 dark:bg-gray-700"
	></div>

	<div class="flex w-full items-start justify-between">
		<div class="grid place-content-start gap-1">
			<p>4:00 PM</p>
			<h3 class="text-lg font-semibold text-gray-900 dark:text-white">Seminar</h3>
			<div class="flex items-center gap-1 text-muted-foreground">
				<MapPin class="size-4" />
				<p>Legazpi City</p>
			</div>

			<Button
				href="/events/20"
				class="mt-3 inline-flex items-center rounded-lg border px-4 py-2 text-sm font-medium dark:border-white/20 "
			>
				See Details
				<ChevronRightIcon />
			</Button>
		</div>

		<div class="flex flex-col items-center gap-1">
			<p class="text-4xl font-semibold">100</p>

			<div class="flex items-center gap-2 text-muted-foreground">
				<UsersRound class="size-4" />
				<p class="text-sm font-medium">Attendees</p>
			</div>
		</div>
	</div>
</li>
