<script module lang="ts">
	import { cn } from '@/utils';
	import { Button, type ButtonSize } from '@/components/ui/button';

	export { StatusPill };
</script>

{#snippet StatusPill(status: 'upcoming' | 'finished' | 'ongoing', size: ButtonSize = 'lg')}
	<Button
		{size}
		class={cn('rounded-lg border text-sm', {
			'border-blue-500 bg-blue-500/20': status === 'upcoming',
			'border-green-600 bg-green-600/30': status === 'ongoing'
		})}
	>
		{status.charAt(0)?.toUpperCase().concat(status.slice(1))}
	</Button>
{/snippet}
