<script lang="ts">
	import { Button } from './ui/button';
	import { page } from '$app/state';
	import { cn } from '@/utils';
	import { Ticket, Calendar } from 'lucide-svelte';

	const isActive = (pathname: string) => page.url.pathname === pathname;
	const routes = [
		{ pathname: '/events', title: 'Events', icon: Ticket },
		{ pathname: '/calendar', title: 'Calendar', icon: Calendar }
	];
</script>

<header
	class="bg-gray-1100/50 sticky z-10 top-0 flex h-auto w-full shrink-0 items-center justify-between gap-8 border-b bg-clip-padding px-4 py-3
 	backdrop-blur-md backdrop-filter transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 md:gap-0"
>
	<p class="text-lg font-bold">evently</p>

	<div class="flex w-full justify-between md:max-w-[80.6%]">
		<div class="flex items-center gap-5">
			{#each routes as route}
				<a href={route.pathname}>
					<p
						class={cn('flex items-center gap-2 font-semibold text-muted-foreground', {
							'text-inherit': isActive(route.pathname)
						})}
					>
						<route.icon class="size-6" />
						{route.title}
					</p>
				</a>
			{/each}
		</div>
		<div class="flex items-center gap-4">
			<p class="text-sm font-semibold text-muted-foreground">9:08 AM GMT+8</p>
			<Button>Create Event</Button>
		</div>
	</div>
</header>
