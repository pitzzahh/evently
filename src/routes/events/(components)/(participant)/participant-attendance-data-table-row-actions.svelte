<script lang="ts">
	import {
		DateFormatter,
		type DateValue,
		getLocalTimeZone,
		Time,
		now
	} from '@internationalized/date';
	import * as Dialog from '$lib/components/ui/dialog';
	import { buttonVariants } from '$lib/components/ui/button';
	import TimePicker_12h from '@/components/ui/time-picker/time-picker-12h.svelte';
	import { Ellipsis } from 'lucide-svelte';
	import Button from '@/components/ui/button/button.svelte';

	let {
		am_time_out,
		am_time_in,
		pm_time_out,
		pm_time_in
	}: {
		am_time_out?: Date;
		am_time_in?: Date;
		pm_time_out?: Date;
		pm_time_in?: Date;
	} = $props();

	let comp_state: {
		am_out: Time;
		am_in: Time;
		pm_out: Time;
		pm_in: Time;
	} = $state({
		am_out: am_time_out
			? new Time(am_time_out.getHours(), am_time_out.getMinutes())
			: new Time(0, 0),
		am_in: am_time_in ? new Time(am_time_in.getHours(), am_time_in.getMinutes()) : new Time(0, 0),
		pm_out: pm_time_out
			? new Time(pm_time_out.getHours(), pm_time_out.getMinutes())
			: new Time(0, 0),
		pm_in: pm_time_in ? new Time(pm_time_in.getHours(), pm_time_in.getMinutes()) : new Time(0, 0)
	});
</script>

<Dialog.Root>
	<Dialog.Trigger class={buttonVariants({ variant: 'outline' })}>
		<Ellipsis class="size-4" />
	</Dialog.Trigger>
	<Dialog.Content class="sm:max-w-[500px]">
		<Dialog.Header>
			<Dialog.Title>Override Time</Dialog.Title>
			<Dialog.Description>Make changes to the time of this participant</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-4">
			<div class="grid gap-2">
				<p class="font-semibold">AM Time</p>
				<div class="flex items-center justify-between gap-4">
					<div class="rounded-lg border-2 border-dashed p-4">
						<p class="text-sm font-medium">In</p>
						<TimePicker_12h time={comp_state.am_in} period="AM" />
					</div>
					<div class="rounded-lg border-2 border-dashed p-4">
						<p class="text-sm font-medium">Out</p>
						<TimePicker_12h time={comp_state.am_out} period="AM" />
					</div>
				</div>
			</div>

			<div class="grid gap-2">
				<p class="font-semibold">PM Time</p>
				<div class="flex items-center justify-between gap-4">
					<div class="rounded-lg border-2 border-dashed p-4">
						<p class="text-sm font-medium">In</p>
						<TimePicker_12h time={comp_state.pm_in} period="PM" />
					</div>
					<div class="rounded-lg border-2 border-dashed p-4">
						<p class="text-sm font-medium">Out</p>
						<TimePicker_12h time={comp_state.pm_out} period="PM" />
					</div>
				</div>
			</div>
		</div>
		<Dialog.Footer>
			<Button>Save changes</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
