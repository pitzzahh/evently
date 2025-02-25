<script lang="ts">
	import { page } from '$app/state';
	import { cn } from '@/utils/style/utils';
	import { scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { Ticket, Calendar, Plus } from 'lucide-svelte';
	import NavbarTime from './navbar-time.svelte';
	import { toggleMode, mode } from 'mode-watcher';
	import { Sun, Moon } from '@/assets/icons';
	import { Button } from '@/components/ui/button/index.js';
	import { dev } from '$app/environment';
	import { COLLECTIONS } from '@/db';

	const isActive = (pathname: string) => page.url.pathname === pathname;
	const routes = [
		{ pathname: '/', title: 'Events', icon: Ticket },
		{ pathname: '/calendar', title: 'Calendar', icon: Calendar }
	];
</script>

<header
	class="bg-gray-1100/50 sticky top-0 z-10 flex h-auto w-full shrink-0 items-center justify-between gap-8 border-b bg-clip-padding px-4 py-3
 	backdrop-blur-md backdrop-filter transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 md:gap-0"
>
	<a href="/" class="cursor-pointer text-lg font-bold">evently</a>

	<div class="flex w-full justify-between md:max-w-[90.6%]">
		<div class="flex items-center gap-5">
			{#each routes as route}
				<a href={route.pathname}>
					<p
						class={cn('flex items-center gap-2 font-semibold text-muted-foreground opacity-50', {
							'opacity-1 text-inherit transition-colors duration-200': isActive(route.pathname)
						})}
					>
						<route.icon class="size-6" />
						{route.title}
					</p>
				</a>
			{/each}
		</div>
		<div class="flex items-center gap-4">
			<Button
				onclick={toggleMode}
				role="switch"
				variant="outline"
				size="icon"
				aria-label="Light Switch"
				aria-checked={$mode === 'light'}
				class="!shrink-0 [&_svg]:size-5"
				title="Toggle {$mode === 'dark' ? 'Dark' : 'Light'} Mode"
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
			</Button>
			<NavbarTime />
			<Button href="/events/create">Create Event <Plus class="size-4" /></Button>
			{#if dev}
				<Button
					size="sm"
					variant="destructive"
					onclick={() => {
						COLLECTIONS.ATTENDANCE_RECORDS_COLLECTION.removeMany({});
						COLLECTIONS.EVENT_DETAILS_COLLECTION.removeMany({});
						COLLECTIONS.PARTICIPANT_COLLECTION.removeMany({});
						COLLECTIONS.QRCODE_COLLECTION.removeMany({});
					}}>RESET</Button
				>
			{/if}
		</div>
	</div>
</header>
