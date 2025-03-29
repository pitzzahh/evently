<script lang="ts">
	import { page } from '$app/state';
	import { cn } from '@/utils/styles';
	import { scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { Ticket, Calendar, Plus } from 'lucide-svelte';
	import NavbarTime from './navbar-time.svelte';
	import { toggleMode, mode } from 'mode-watcher';
	import { Sun, Moon } from '@/assets/icons';
	import { Button, buttonVariants } from '@/components/ui/button/index.js';
	import { dev } from '$app/environment';
	import { COLLECTIONS } from '@/db';
	import evently_logo from '@/assets/evently-logo.svg';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';

	const isActive = (pathname: string) => page.url.pathname === pathname;
	const routes = [
		{ pathname: '/', title: 'Events', icon: Ticket },
		{ pathname: '/calendar', title: 'Calendar', icon: Calendar }
	];
</script>

<header
	class=" sticky top-0 z-10 flex h-auto w-full shrink-0 items-center justify-between gap-8 border-b bg-clip-padding px-4
 	py-3 backdrop-blur-sm transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 md:gap-0"
>
	<a href="/" class="cursor-pointer text-lg font-bold">
		<img src={evently_logo} class="size-12" alt="evently logo" /></a
	>

	<div class="flex w-full justify-between md:max-w-[90.6%]">
		<div class="flex items-center gap-5">
			{#each routes as route}
				<a href={route.pathname}>
					<p
						class={cn('text-muted-foreground flex items-center gap-2 font-semibold opacity-50', {
							'text-inherit opacity-100 transition-colors duration-200': isActive(route.pathname)
						})}
					>
						<route.icon class="size-6" />
						{route.title}
					</p>
				</a>
			{/each}
		</div>
		<div class="flex items-center gap-4">
			<Tooltip.Provider>
				<Tooltip.Root delayDuration={0}>
					<Tooltip.Trigger
						onclick={toggleMode}
						class={cn(
							buttonVariants({ variant: 'outline', size: 'icon' }),
							'hover:bg-bg-gray-400/10 cursor-pointer !shrink-0 border-none bg-gray-400/10 backdrop-blur-md backdrop-filter dark:bg-white/10 [&_svg]:size-5'
						)}
					>
						{#if $mode === 'light'}
							<div
								class="absolute inline-flex items-center justify-center"
								transition:scale={{
									delay: 50,
									duration: 200,
									start: 0.7,
									easing: cubicOut
								}}
							>
								<Moon strokeWidth={1.5} class="size-6" aria-label="Moon" />
							</div>
						{:else}
							<div
								class="absolute inline-flex items-center justify-center"
								transition:scale={{
									delay: 50,
									duration: 200,
									start: 0.7,
									easing: cubicOut
								}}
							>
								<Sun strokeWidth={1.5} class="size-6" aria-label="Sun" />
							</div>
						{/if}
						<!-- </Button> -->
					</Tooltip.Trigger>
					<Tooltip.Content>
						<p>Toggle {$mode === 'dark' ? 'Dark' : 'Light'} Mode</p>
					</Tooltip.Content>
				</Tooltip.Root>
			</Tooltip.Provider>

			<NavbarTime />
			<Button href="/events/create"><Plus class="size-4" /> Create Event</Button>
			{#if dev}
				<Button
					size="sm"
					variant="destructive"
					onclick={() => {
						COLLECTIONS.ATTENDANCE_RECORDS_COLLECTION.removeMany({});
						COLLECTIONS.EVENT_DETAILS_COLLECTION.removeMany({});
						COLLECTIONS.PARTICIPANT_COLLECTION.removeMany({});
						COLLECTIONS.SETTINGS_COLLECTION.removeMany({});
					}}>RESET</Button
				>
			{/if}
		</div>
	</div>
</header>
