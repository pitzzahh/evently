<script>
	import { Button } from '@/components/ui/button';
	import { ChevronLeft } from 'lucide-svelte';
	import { browser } from '$app/environment';

	let { children } = $props();
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
	{@render children()}
</div>
