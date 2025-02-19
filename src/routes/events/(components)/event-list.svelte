<script>
	import EventCard from './event-card.svelte';
</script>

<ol class="relative ml-[200px] border-s-2 border-dashed border-gray-400 dark:border-gray-700">
	{#each [...new Array(10)] as _}
		<EventCard />
	{/each}
</ol>
