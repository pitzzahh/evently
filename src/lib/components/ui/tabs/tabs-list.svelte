<script lang="ts">
	import { Tabs as TabsPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils.js';

	let { ref = $bindable(null), class: className, ...restProps }: TabsPrimitive.ListProps = $props();
</script>

<TabsPrimitive.List
	bind:ref
	class={cn(
		'inline-flex h-9 items-center justify-center rounded-lg bg-gray-700/10 p-1 text-muted-foreground dark:bg-white/10',
		className
	)}
	{...restProps}
/>
