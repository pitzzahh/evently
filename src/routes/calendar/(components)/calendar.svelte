<script lang="ts">
	import type { Day, CalendarItem } from '../+page.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card'; // Importing Card components

	let {
		headers,
		days,
		items,
		headerClick,
		dayClick,
		itemClick
	}: {
		headers: string[];
		days: Day[];
		items: CalendarItem[];
		headerClick: (header: string) => void;
		dayClick: (day: Day) => void;
		itemClick: (item: CalendarItem) => void;
	} = $props();
</script>

<div class="grid w-full auto-rows-[120px] grid-cols-7 gap-1 overflow-auto">
	{#each headers as header}
		<Button variant="ghost" onclick={() => headerClick(header)}>
			{header}
		</Button>
	{/each}

	{#each days as day}
		<Button
			variant="outline"
			class={day.enabled ? '' : 'cursor-not-allowed opacity-50'}
			onclick={() => dayClick(day)}
			disabled={!day.enabled}
		>
			{day.name}
		</Button>
	{/each}

	{#each items as item}
		<Button
			variant={item.className === 'task--primary' ? 'default' : 'ghost'}
			onclick={() => itemClick(item)}
			style="grid-column: {item.startCol} / span {item.len};
				   grid-row: {item.startRow};
				   align-self: {item.isBottom ? 'end' : 'center'};"
		>
			{item.title}

			{#if item.detailHeader}
				<Card.Root class="absolute left-0 top-[calc(100%+8px)] z-10">
					<Card.Header>
						<Card.Title class="text-sm text-pink-900">{item.detailHeader}</Card.Title>
						<Card.Description class="mt-1 text-xs font-medium text-gray-600/70"
							>{item.detailContent}</Card.Description
						>
					</Card.Header>
					<Card.Content>
						<p>{item.detailContent}</p>
					</Card.Content>
					<Card.Footer>
						<p class="text-sm text-gray-500">Footer Information</p>
						<!-- Example Footer -->
					</Card.Footer>
				</Card.Root>
			{/if}
		</Button>
	{/each}
</div>
