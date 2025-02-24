<script lang="ts">
	import { Button } from './ui/button';
	import { page } from '$app/state';
	import { cn } from '@/utils';
	import { Ticket, Calendar, Plus } from 'lucide-svelte';
	import NavbarTime from './navbar-time.svelte';

	const isActive = (pathname: string) => page.url.pathname === pathname;
	const routes = [
		{ pathname: '/events', title: 'Events', icon: Ticket },
		{ pathname: '/calendar', title: 'Calendar', icon: Calendar }
	];
</script>

<header
	class="bg-gray-1100/50 sticky top-0 z-10 flex h-auto w-full shrink-0 items-center justify-between gap-8 border-b bg-clip-padding px-4 py-3
 	backdrop-blur-md backdrop-filter transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 md:gap-0"
>
	<a href="/" class="cursor-pointer text-lg font-bold">evently</a>

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
			<NavbarTime />
			<Button href="/events/create">Create Event <Plus class="size-4" /></Button>
		</div>
	</div>
</header>
