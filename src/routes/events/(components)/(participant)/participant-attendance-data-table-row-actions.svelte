<script lang="ts">
	import { Time } from '@internationalized/date';
	import * as Dialog from '$lib/components/ui/dialog';
	import { buttonVariants } from '$lib/components/ui/button';
	import { Ellipsis } from 'lucide-svelte';
	import Button from '@/components/ui/button/button.svelte';
	import { COLLECTIONS } from '@/db';
	import { toast } from 'svelte-sonner';
	import PeriodTimePicker from './period-time-picker.svelte';
	import { watch } from 'runed';

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
		am_out: { time?: Time; period: 'AM' | 'PM' };
		am_in: { time?: Time; period: 'AM' | 'PM' };
		pm_out: { time?: Time; period: 'AM' | 'PM' };
		pm_in: { time?: Time; period: 'AM' | 'PM' };
		override_open: boolean;
	} = $state({
		am_out: {
			time: undefined,
			period: 'PM'
		},
		am_in: {
			time: undefined,
			period: 'AM'
		},
		pm_out: {
			time: undefined,
			period: 'PM'
		},
		pm_in: {
			time: undefined,
			period: 'PM'
		},
		override_open: false
	});

	watch([() => am_time_out, () => am_time_in, () => pm_time_in, () => pm_time_out], () => {
		comp_state.am_out.time = am_time_out
			? new Time(am_time_out.getHours(), am_time_out.getMinutes())
			: undefined;
		comp_state.am_in.time = am_time_in
			? new Time(am_time_in.getHours(), am_time_in.getMinutes())
			: undefined;
		comp_state.pm_in.time = pm_time_in
			? new Time(pm_time_in.getHours(), pm_time_in.getMinutes())
			: undefined;
		comp_state.pm_out.time = pm_time_out
			? new Time(pm_time_out.getHours(), pm_time_out.getMinutes())
			: undefined;

		comp_state.am_out.period = am_time_out && am_time_out.getHours() >= 12 ? 'PM' : 'AM';
		comp_state.am_in.period = am_time_in && am_time_in.getHours() >= 12 ? 'PM' : 'AM';
		comp_state.pm_in.period = pm_time_in && pm_time_in.getHours() >= 12 ? 'PM' : 'AM';
		comp_state.pm_out.period = pm_time_out && pm_time_out.getHours() >= 12 ? 'PM' : 'AM';
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

		const updates: Record<string, Date | undefined> = {
			updated: new Date()
		};

		const createTimeDate = (time?: Time) => {
			if (!time) return undefined;

			const newDate = new Date(current_event_date);
			newDate.setHours(time.hour);
			newDate.setMinutes(time.minute);
			newDate.setSeconds(0);
			newDate.setMilliseconds(0);
			return newDate;
		};

		updates.am_time_in = createTimeDate(comp_state.am_in.time);
		updates.am_time_out = createTimeDate(comp_state.am_out.time);
		updates.pm_time_in = createTimeDate(comp_state.pm_in.time);
		updates.pm_time_out = createTimeDate(comp_state.pm_out.time);

		COLLECTIONS.ATTENDANCE_RECORDS_COLLECTION.updateOne({ id: attendance_id }, { $set: updates });

		toast.success('Attendance record/s overridden successfully');
		comp_state.override_open = false;
	}

	function handleSetDefaultTimeValue(setTime: (time: Time) => void, hours: number) {
		const default_time = new Date();
		default_time.setHours(hours);
		default_time.setMinutes(0);
		default_time.setSeconds(0);

		const time = new Time(default_time.getHours(), default_time.getMinutes());
		setTime(time);
	}
</script>

<Dialog.Root
	open={comp_state.override_open}
	onOpenChange={(value) => (comp_state.override_open = value)}
>
	<Dialog.Trigger class={buttonVariants({ variant: 'ghost', size: 'icon' })}>
		<Ellipsis class="size-4" />
	</Dialog.Trigger>
	<Dialog.Content class="sm:max-w-[500px]">
		<Dialog.Header>
			<Dialog.Title>Override Time</Dialog.Title>
			<Dialog.Description>Make changes to the time of this participant</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-4">
			<PeriodTimePicker
				period="AM"
				handleSetDefaultTime={(type) =>
					type === 'in'
						? handleSetDefaultTimeValue((time) => (comp_state.am_in.time = time), 8)
						: handleSetDefaultTimeValue((time) => (comp_state.am_out.time = time), 12)}
				bind:time_in={comp_state.am_in.time}
				bind:time_in_period={comp_state.am_in.period}
				bind:time_out={comp_state.am_out.time}
				bind:time_out_period={comp_state.am_out.period}
				handleRemoveTime={(type) =>
					type === 'in'
						? (comp_state.am_in.time = undefined)
						: (comp_state.am_out.time = undefined)}
			/>
			<PeriodTimePicker
				period="PM"
				handleSetDefaultTime={(type) =>
					type === 'in'
						? handleSetDefaultTimeValue((time) => (comp_state.pm_in.time = time), 13)
						: handleSetDefaultTimeValue((time) => (comp_state.pm_out.time = time), 16)}
				bind:time_in={comp_state.pm_in.time}
				bind:time_in_period={comp_state.pm_in.period}
				bind:time_out={comp_state.pm_out.time}
				bind:time_out_period={comp_state.pm_out.period}
				handleRemoveTime={(type) =>
					type === 'in'
						? (comp_state.pm_in.time = undefined)
						: (comp_state.pm_out.time = undefined)}
			/>
		</div>
		<Dialog.Footer>
			<Button onclick={handleSaveChanges}>Save changes</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
