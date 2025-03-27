<script lang="ts">
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { EventList } from '@routes/events/(components)';
	import { CalendarArrowDown, CalendarArrowUp } from '@/assets/icons';
	import { Input } from '@/components/ui/input';
	import { Search } from 'lucide-svelte';

	interface ComponentState {
		current_tab: 'upcoming' | 'past';
		search_term: string;
	}

	let comp_state = $state<ComponentState>({
		current_tab: 'upcoming',
		search_term: ''
	});
</script>

<Tabs.Root bind:value={comp_state.current_tab}>
	<div class="flex items-center justify-between gap-4">
		<h2 class="text-4xl font-semibold">Events</h2>

		<div class="flex items-center gap-2">
			<div class="group relative">
				<Search
					class="absolute left-3 top-3 size-4 text-muted-foreground group-hover:text-black dark:group-hover:text-white"
				/>
				<Input
					bind:value={comp_state.search_term}
					placeholder="Search an event"
					type="text"
					class="h-10 border-none bg-gray-400/10 pl-10 dark:bg-white/10 "
				/>
			</div>
			<Tabs.List class="grid h-auto w-full max-w-[300px] grid-cols-2">
				<Tabs.Trigger value="upcoming" class="h-auto text-base">
					<CalendarArrowUp class="mr-2 size-[18px]" />
					Upcoming</Tabs.Trigger
				>
				<Tabs.Trigger value="past" class="h-auto text-base">
					<CalendarArrowDown class="mr-2 size-[18px]" />
					Past</Tabs.Trigger
				>
			</Tabs.List>
		</div>
	</div>

	{@const contents = ['upcoming', 'past']}
	{#each contents as content (content)}
		{#if comp_state.current_tab === content}
			<Tabs.Content value={content} class="mt-10">
				<EventList
					type={content as 'upcoming' | 'past'}
					bind:search_term={comp_state.search_term}
				/>
			</Tabs.Content>
		{/if}
	{/each}
</Tabs.Root>
