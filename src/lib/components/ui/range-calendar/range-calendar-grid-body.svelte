<script lang="ts">
	import { RangeCalendar as RangeCalendarPrimitive } from 'bits-ui';
	import { cn } from '@/utils/styles';

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: RangeCalendarPrimitive.GridBodyProps = $props();
</script>

<RangeCalendarPrimitive.GridBody bind:ref class={cn(className)} {...restProps} />
