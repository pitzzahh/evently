<script lang="ts">
	import { Button } from '@/components/ui/button';
	import EventForm from '../../(components)/event-form.svelte';
	import { ChevronLeft } from 'lucide-svelte';
	import { browser } from '$app/environment';

	let { data } = $props();
</script>

<h2 class="text-4xl font-semibold">Create Event</h2>
<EventForm event_form={data.event_form} />
