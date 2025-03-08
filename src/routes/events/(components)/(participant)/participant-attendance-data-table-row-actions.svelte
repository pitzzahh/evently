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
	import { COLLECTIONS } from '@/db';
	import { toast } from 'svelte-sonner';

	let {
		am_time_out,
		am_time_in,
		pm_time_out,
		pm_time_in,
		attendance_id,
		current_event_date
	}: {
		attendance_id: string;
		am_time_out?: Date;
		am_time_in?: Date;
		pm_time_out?: Date;
		pm_time_in?: Date;
		current_event_date: Date;
	} = $props();

	let comp_state: {
		am_out: { time: Time; period: 'AM' | 'PM' };
		am_in: { time: Time; period: 'AM' | 'PM' };
		pm_out: { time: Time; period: 'AM' | 'PM' };
		pm_in: { time: Time; period: 'AM' | 'PM' };
	} = $state({
		am_out: {
			time: am_time_out
				? new Time(am_time_out.getHours(), am_time_out.getMinutes())
				: new Time(0, 0),
			period: 'AM'
		},
		am_in: {
			time: am_time_in ? new Time(am_time_in.getHours(), am_time_in.getMinutes()) : new Time(0, 0),
			period: 'AM'
		},
		pm_out: {
			time: pm_time_out
				? new Time(pm_time_out.getHours(), pm_time_out.getMinutes())
				: new Time(0, 0),
			period: 'PM'
		},
		pm_in: {
			time: pm_time_in ? new Time(pm_time_in.getHours(), pm_time_in.getMinutes()) : new Time(0, 0),
			period: 'PM'
		}
	});

	function validateTimes(): boolean {
		if (comp_state.am_in.time && comp_state.am_out.time) {
			if (comp_state.am_in.time.compare(comp_state.am_out.time) >= 0) {
				toast.error('AM In time must be before AM Out time');
				return false;
			}
		}

		if (comp_state.pm_in.time && comp_state.pm_out.time) {
			if (comp_state.pm_in.time.compare(comp_state.pm_out.time) >= 0) {
				toast.error('PM In time must be before PM Out time');
				return false;
			}
		}

		if (comp_state.am_out.time && comp_state.pm_in.time) {
			if (comp_state.am_out.time.compare(comp_state.pm_in.time) >= 0) {
				toast.error('AM Out time must be before PM In time');
				return false;
			}
		}

		return true;
	}

	function handleSaveChanges() {
		if (!validateTimes()) return;

		const am_time_in = new Date(current_event_date);
		am_time_in.setHours(comp_state.am_in.time.hour);
		am_time_in.setMinutes(comp_state.am_in.time.minute);

		const am_time_out = new Date(current_event_date);
		am_time_out.setHours(comp_state.am_out.time.hour);
		am_time_out.setMinutes(comp_state.am_out.time.minute);

		const pm_time_in = new Date(current_event_date);
		pm_time_in.setHours(comp_state.pm_in.time.hour);
		pm_time_in.setMinutes(comp_state.pm_in.time.minute);

		const pm_time_out = new Date(current_event_date);
		pm_time_out.setHours(comp_state.pm_out.time.hour);
		pm_time_out.setMinutes(comp_state.pm_out.time.minute);

		COLLECTIONS.ATTENDANCE_RECORDS_COLLECTION.updateOne(
			{ id: attendance_id },
			{
				$set: {
					am_time_in,
					am_time_out,
					pm_time_in,
					pm_time_out
				}
			}
		);
	}
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
						<TimePicker_12h
							bind:time={comp_state.am_in.time}
							bind:period={comp_state.am_in.period}
						/>
					</div>
					<div class="rounded-lg border-2 border-dashed p-4">
						<p class="text-sm font-medium">Out</p>
						<TimePicker_12h
							bind:time={comp_state.am_out.time}
							bind:period={comp_state.am_out.period}
						/>
					</div>
				</div>
			</div>

			<div class="grid gap-2">
				<p class="font-semibold">PM Time</p>
				<div class="flex items-center justify-between gap-4">
					<div class="rounded-lg border-2 border-dashed p-4">
						<p class="text-sm font-medium">In</p>
						<TimePicker_12h
							bind:time={comp_state.pm_in.time}
							bind:period={comp_state.pm_in.period}
						/>
					</div>
					<div class="rounded-lg border-2 border-dashed p-4">
						<p class="text-sm font-medium">Out</p>
						<TimePicker_12h
							bind:time={comp_state.pm_out.time}
							bind:period={comp_state.pm_out.period}
						/>
					</div>
				</div>
			</div>
		</div>
		<Dialog.Footer>
			<Button onclick={handleSaveChanges}>Save changes</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
