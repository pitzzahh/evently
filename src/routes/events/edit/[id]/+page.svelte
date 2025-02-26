<script lang="ts">
	import { Button } from '@/components/ui/button';
	import { EventForm } from '@routes/events/(components)';
	import { ChevronLeft } from '@/assets/icons';
	import { browser } from '$app/environment';

	let { data } = $props();
</script>

<h2 class="mb-4 text-4xl font-semibold">Edit Event</h2>
<EventForm event_form={data.event_form} />
