<script lang="ts">
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { LocateIcon, MapPin, Pin, Users, UsersRound } from 'lucide-svelte';

	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div>
	<Tabs.Root value="upcoming">
		<div class="flex items-center justify-between gap-4">
			<p class="text-4xl font-semibold">Event</p>
			<Tabs.List class="grid h-auto w-full max-w-[200px] grid-cols-2">
				<Tabs.Trigger value="upcoming" class="h-auto text-base">Upcoming</Tabs.Trigger>
				<Tabs.Trigger value="past" class="h-auto text-base">Past</Tabs.Trigger>
			</Tabs.List>
		</div>

		<Tabs.Content value="upcoming" class="mt-6">
			<ol class="relative ml-[200px] border-s-2 border-dashed border-gray-400 dark:border-gray-700">
				{#each [...new Array(10)] as _}
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

								<a
									href="#"
									class="mt-3 inline-flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:text-blue-700 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700"
									>Learn more <svg
										class="ms-2 h-3 w-3 rtl:rotate-180"
										aria-hidden="true"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 14 10"
									>
										<path
											stroke="currentColor"
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M1 5h12m0 0L9 1m4 4L9 9"
										/>
									</svg></a
								>
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
				{/each}
			</ol>
		</Tabs.Content>
		<Tabs.Content value="past" class="mt-6">
			<ol class="relative ml-[200px] border-s-2 border-dashed border-gray-400 dark:border-gray-700">
				{#each [...new Array(10)] as _}
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

								<a
									href="#"
									class="mt-3 inline-flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:text-blue-700 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700"
									>Learn more <svg
										class="ms-2 h-3 w-3 rtl:rotate-180"
										aria-hidden="true"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 14 10"
									>
										<path
											stroke="currentColor"
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M1 5h12m0 0L9 1m4 4L9 9"
										/>
									</svg></a
								>
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
				{/each}
			</ol>
		</Tabs.Content>
	</Tabs.Root>
</div>
