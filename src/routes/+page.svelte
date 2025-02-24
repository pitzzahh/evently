<script lang="ts">
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import type { PageData } from './$types';
	import EventList from './events/(components)/event-list.svelte';

	let { data }: { data: PageData } = $props();
</script>

<div>
	<Tabs.Root value="upcoming">
		<div class="flex items-center justify-between gap-4">
			<h2 class="text-4xl font-semibold">Events</h2>
			<Tabs.List class="grid h-auto w-full max-w-[300px] grid-cols-2">
				<Tabs.Trigger value="upcoming" class="h-auto text-base">Upcoming</Tabs.Trigger>
				<Tabs.Trigger value="past" class="h-auto text-base">Past</Tabs.Trigger>
			</Tabs.List>
		</div>

		<Tabs.Content value="upcoming" class="mt-6">
			<EventList />
		</Tabs.Content>
		<Tabs.Content value="past" class="mt-6">
			<EventList />
		</Tabs.Content>
	</Tabs.Root>
</div>
