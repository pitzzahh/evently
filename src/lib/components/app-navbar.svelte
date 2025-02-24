<script lang="ts">
	import { Button } from './ui/button';
	import { page } from '$app/state';
	import { cn } from '@/utils';
	import { Ticket, Calendar, Plus, Computer } from 'lucide-svelte';
	import NavbarTime from './navbar-time.svelte';
	import Sun from 'lucide-svelte/icons/sun';
	import Moon from 'lucide-svelte/icons/moon';

	import { resetMode, setMode } from 'mode-watcher';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';

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
	<a href="/"><p class="text-lg font-bold">evently</p></a>
	<div class="flex w-full justify-between md:max-w-[80.6%]">
		<div class="flex items-center gap-5">
			{#each routes as route}
				<a href={route.pathname}>
					<p
						class={cn('flex items-center gap-2 font-semibold text-muted-foreground opacity-50', {
							'opacity-1 text-inherit': isActive(route.pathname)
						})}
					>
						<route.icon class="size-6" />
						{route.title}
					</p>
				</a>
			{/each}
		</div>
		<div class="flex items-center gap-4">
			<DropdownMenu.Root>
				<DropdownMenu.Trigger class={buttonVariants({ variant: 'outline', size: 'icon' })}>
					<Sun
						class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
					/>
					<Moon
						class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
					/>
					<span class="sr-only">Toggle theme</span>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content align="end">
					<DropdownMenu.Item onclick={() => setMode('light')}>
						<Sun class="size-4" /> Light
					</DropdownMenu.Item>
					<DropdownMenu.Item onclick={() => setMode('dark')}>
						<Moon class="size-4" />Dark</DropdownMenu.Item
					>
					<DropdownMenu.Item onclick={() => resetMode()}>
						<Computer class="size-4" />System</DropdownMenu.Item
					>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
			<NavbarTime />
			<Button href="/events/create">Create Event <Plus class="size-4" /></Button>
		</div>
	</div>
</header>
