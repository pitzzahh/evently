<script module lang="ts">
	import { cn } from '@/utils';

	export { StatusPill };
</script>

{#snippet StatusPill(status: 'upcoming' | 'finished' | 'ongoing')}
	<p
		class={cn('rounded-lg border px-4 py-3 text-sm', {
			'border-blue-500 bg-blue-500/20': status === 'upcoming',
			'border-green-600 bg-green-600/30': status === 'ongoing'
		})}
	>
		{status.charAt(0)?.toUpperCase().concat(status.slice(1))}
	</p>
{/snippet}
