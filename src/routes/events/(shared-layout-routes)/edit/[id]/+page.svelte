<script lang="ts">
	import { Button } from '@/components/ui/button';
	import EventForm from '../../../(components)/event-form.svelte';
	import { ChevronLeft } from 'lucide-svelte';
	import { browser } from '$app/environment';

	let { data } = $props();
</script>

<div class="flex flex-col gap-4">
	<Button
		variant="outline"
		size="icon"
		onclick={async () => {
			if (browser) window.history.back();
		}}
	>
		<ChevronLeft class="size-4" />
	</Button>
	<h2 class="text-4xl font-semibold">Edit Event</h2>
</div>

<EventForm event_form={data.event_form} />
