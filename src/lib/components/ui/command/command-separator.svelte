<script lang="ts">
	import { Command as CommandPrimitive } from 'bits-ui';
	import { cn } from '@/utils/styles';

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: CommandPrimitive.SeparatorProps = $props();
</script>

<CommandPrimitive.Separator
	bind:ref
	class={cn('-mx-1 h-px bg-border', className)}
	{...restProps}
/>
