<script lang="ts">
	import { Badge } from '@/components/ui/badge';
	import { cn } from '@/utils';
	import { InfoIcon } from 'lucide-svelte';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';

	let {
		time_in,
		time_out,
		late_time_in_duration
	}: { time_in: string; time_out: string; late_time_in_duration?: string } = $props();
</script>

<div class="flex items-start">
	<div class="flex items-center gap-3 self-start rounded-xl border border-black/25 dark:border-white/25 border-dashed px-3 py-2">
		<div class="flex items-center gap-1">
			<p class="text-sm font-semibold">In:</p>

			<Tooltip.Provider delayDuration={0}>
				<Tooltip.Root>
					<Tooltip.Trigger
						><Badge
							variant="secondary"
							class={cn(
								'whitespace-nowrap border border-black/10 bg-gray-400/20 hover:bg-gray-400/20 dark:border-white/10 dark:bg-white/10',
								late_time_in_duration && 'bg-[#F5E8CB]  text-yellow-500 dark:bg-yellow-500/20'
							)}
						>
							{time_in}
							{#if late_time_in_duration}
								<InfoIcon class="ml-1 size-3" />
							{/if}
						</Badge></Tooltip.Trigger
					>
					{#if late_time_in_duration}
						<Tooltip.Content class="bg-yellow-500 dark:bg-yellow-600">
							<p>{late_time_in_duration} late</p>
						</Tooltip.Content>
					{/if}
				</Tooltip.Root>
			</Tooltip.Provider>
		</div>
		<div class="flex items-center gap-1">
			<p class="text-sm font-semibold">Out:</p>
			<Badge
				variant="secondary"
				class="whitespace-nowrap border border-black/10 bg-gray-400/20 hover:bg-gray-400/20 dark:border-white/10 dark:bg-white/10"
				>{time_out}</Badge
			>
		</div>
	</div>
</div>
