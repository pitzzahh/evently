<script>
	import EventCard from './event-card.svelte';
	import { Timeline } from 'svelte-vertical-timeline';
</script>

<Timeline style="width: 100%;  padding: 0;">
	{#each { length: 10 }}
		<EventCard />
	{/each}
</Timeline>
