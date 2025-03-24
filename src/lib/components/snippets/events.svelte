<script module lang="ts">
	import { cn } from '@/utils/styles';
	import { Button, type ButtonSize } from '@/components/ui/button';

	export { StatusPill };
</script>

{#snippet StatusPill(status: 'upcoming' | 'finished' | 'ongoing', size: ButtonSize = 'lg')}
	<Button
		{size}
		variant="outline"
		class={cn(
			'rounded-lg border border-yellow-500 bg-yellow-500/20 text-sm font-semibold text-yellow-500 hover:!bg-yellow-500/20 hover:text-yellow-500',
			{
				'border-blue-500 bg-blue-500/20 text-blue-500 hover:!bg-blue-500/20 hover:!text-blue-500':
					status === 'upcoming',
				'hover:!bg-[#00E200]30 border-[#00E200] bg-[#00E200]/20 text-[#009900] hover:!bg-[#00E200]/20 hover:!text-[#009900] dark:border-green-600 dark:bg-green-600/40 dark:text-[#0bb90b] dark:hover:!bg-green-600/40':
					status === 'ongoing'
			}
		)}
	>
		{status.charAt(0)?.toUpperCase().concat(status.slice(1))}
	</Button>
{/snippet}
