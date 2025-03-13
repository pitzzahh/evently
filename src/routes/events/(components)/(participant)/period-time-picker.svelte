<script lang="ts">
	import Button from '@/components/ui/button/button.svelte';
	import TimePicker_12h from '@/components/ui/time-picker/time-picker-12h.svelte';
	import { Time } from '@internationalized/date';
	import { Clock, X } from 'lucide-svelte';

	type Period = 'AM' | 'PM';
	interface Props {
		period: Period;
		time_in?: Time;
		time_out?: Time;
		time_in_period?: Period;
		time_out_period?: Period;
		handleSetDefaultTime: (type: 'out' | 'in') => void;
		handleRemoveTime: (type: 'out' | 'in') => void;
	}

	let {
		period,
		time_in = $bindable(undefined),
		time_out = $bindable(undefined),
		time_in_period = $bindable('AM'),
		time_out_period = $bindable('PM'),
		handleRemoveTime,
		handleSetDefaultTime
	}: Props = $props();
</script>

<div class="grid gap-2">
	<p class="font-semibold">{period} Time</p>
	<div class=" flex items-center justify-between gap-4">
		<div class="relative flex-1 rounded-lg border-2 border-dashed p-4">
			{#if time_in}
				<Button
					variant="ghost"
					onclick={() => handleRemoveTime('in')}
					class="absolute right-2 top-2 size-6"
					size="icon"
				>
					<X class="size-4" />
				</Button>
			{/if}

			<p class="text-sm font-medium">In</p>
			{#if time_in}
				<TimePicker_12h bind:time={time_in} bind:period={time_in_period} />
			{:else}
				<div class="flex flex-col items-center gap-3">
					<p class="text-xs text-muted-foreground">No time in</p>
					<Button
						variant="outline"
						class="w-full"
						size="sm"
						onclick={() => handleSetDefaultTime('in')}
					>
						<Clock class="size-3" /> Set time
					</Button>
				</div>
			{/if}
		</div>
		<div class="relative flex-1 rounded-lg border-2 border-dashed p-4">
			{#if time_out}
				<Button
					variant="ghost"
					class="absolute right-2 top-2 size-6"
					size="icon"
					onclick={() => handleRemoveTime('out')}
				>
					<X class="size-4" />
				</Button>
			{/if}

			<p class="text-sm font-medium">Out</p>
			{#if time_out}
				<TimePicker_12h bind:time={time_out} bind:period={time_out_period} />
			{:else}
				<div class="flex flex-col items-center gap-3">
					<p class="text-xs text-muted-foreground">No time out</p>
					<Button
						variant="outline"
						class="w-full"
						size="sm"
						onclick={() => handleSetDefaultTime('out')}
					>
						<Clock class="size-3" /> Set time
					</Button>
				</div>
			{/if}
		</div>
	</div>
</div>
