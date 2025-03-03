<script>
	import { Button } from '@/components/ui/button';
	import { ChevronLeft } from 'lucide-svelte';
	import { browser } from '$app/environment';

	let { children } = $props();
</script>

<div class="flex flex-col items-start gap-4">
	<Button
		variant="outline"
		class="h-auto p-3"
		onclick={async () => {
			if (browser) window.history.back();
		}}
	>
		<ChevronLeft class="size-8" />
	</Button>

	<div class="w-full">
		{@render children()}
	</div>
</div>
