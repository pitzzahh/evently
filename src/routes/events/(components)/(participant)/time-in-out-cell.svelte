<script lang="ts">
	import { Badge } from '@/components/ui/badge';
	let { time_in, time_out }: { time_in: string; time_out: string } = $props();
</script>

<div class="flex items-start">
	<div class="flex items-center gap-3 self-start rounded-xl border-2 border-dashed px-3 py-2">
		<div class="flex items-center gap-1">
			<p class="text-sm font-semibold">In:</p>
			<Badge variant="secondary" class="whitespace-nowrap">{time_in}</Badge>
		</div>
		<div class="flex items-center gap-1">
			<p class="text-sm font-semibold">Out:</p>
			<Badge variant="secondary" class="whitespace-nowrap">{time_out}</Badge>
		</div>
	</div>
</div>
