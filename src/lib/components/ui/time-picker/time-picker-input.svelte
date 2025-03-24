<script lang="ts" module>
	import type { HTMLInputAttributes } from 'svelte/elements';
	import type { WithElementRef } from 'bits-ui';
	import type { Time as TimeType } from '@internationalized/date';

	export type TimePickerInputProps = WithElementRef<HTMLInputAttributes> & {
		type?: string;
		value?: string;
		name?: string;

		picker: TimePickerType;
		time: TimeType | undefined;
		setTime?: (time: TimeType) => void;
		period?: Period;
		onRightFocus?: () => void;
		onLeftFocus?: () => void;
	};
</script>

<script lang="ts">
	import { Time } from '@internationalized/date';
	import { Input } from '$lib/components/ui/input';
	import { cn } from '$lib/utils';

	import {
		type Period,
		type TimePickerType,
		getArrowByType,
		getDateByType,
		setDateByType
	} from './time-picker-utils';

	let {
		class: className,
		type = 'tel',
		value,
		id,
		name,
		time = $bindable(new Time(0, 0)),
		setTime,
		picker,
		period,
		onLeftFocus,
		onRightFocus,

		onkeydown,
		onchange,

		ref = $bindable(null),

		...restProps
	}: TimePickerInputProps = $props();

	let flag = $state<boolean>(false);
	let intKey = $state<string>('0');

	let calculatedValue = $derived(getDateByType(time, picker));

	$effect(() => {
		if (flag) {
			const timer = setTimeout(() => {
				flag = false;
			}, 2000);

			return () => clearTimeout(timer);
		}
	});

	function calculateNewValue(key: string) {
		// If this is the first digit (flag is false), replace the current value
		if (!flag) {
			return '0' + key;
		}

		// For the second digit, combine with the first one
		return calculatedValue.slice(1, 2) + key;
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Tab') return;

		e.preventDefault();

		if (e.key === 'ArrowRight') onRightFocus?.();
		if (e.key === 'ArrowLeft') onLeftFocus?.();

		if (['ArrowUp', 'ArrowDown'].includes(e.key)) {
			const step = e.key === 'ArrowUp' ? 1 : -1;
			const newValue = getArrowByType(calculatedValue, step, picker);

			if (flag) flag = false;

			const tempTime = time.copy();
			time = setDateByType(tempTime, newValue, picker, period);
			setTime?.(time);
		}

		if (e.key >= '0' && e.key <= '9') {
			if (picker === '12hours') intKey = e.key;

			const newValue = calculateNewValue(e.key);

			// Only move focus to the next field if:
			// 1. Flag is true (second digit entered)
			// 2. AND the resulting value is valid for this input type
			const moveFocus = flag && isValidTimeValue(newValue, picker);

			const tempTime = time.copy();
			time = setDateByType(tempTime, newValue, picker, period);
			setTime?.(time);

			// Update flag before potentially moving focus
			flag = !flag;

			// Only move focus after processing the new value
			if (moveFocus) {
				setTimeout(() => onRightFocus?.(), 0);
			}
		}
	}

	// New helper function to validate time values
	function isValidTimeValue(value: string, picker: TimePickerType): boolean {
		const num = parseInt(value, 10);

		if (picker === 'hours' || picker === '12hours') {
			// For 24-hour format
			if (picker === 'hours') {
				return num >= 0 && num <= 23;
			}
			// For 12-hour format
			return num >= 1 && num <= 12;
		} else if (picker === 'minutes' || picker === 'seconds') {
			return num >= 0 && num <= 59;
		}

		return true;
	}
</script>

<Input
	bind:ref
	id={id || picker}
	name={name || picker}
	class={cn(
		'w-[48px] text-center font-mono text-base tabular-nums caret-transparent focus:bg-accent focus:text-accent-foreground [&::-webkit-inner-spin-button]:appearance-none',
		className
	)}
	value={value || calculatedValue}
	onchange={(e) => {
		e.preventDefault();
		onchange?.(e);
	}}
	{type}
	inputmode="decimal"
	onkeydown={(e) => {
		onkeydown?.(e);
		handleKeyDown(e);
	}}
	{...restProps}
/>
