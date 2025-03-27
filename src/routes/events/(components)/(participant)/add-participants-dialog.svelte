<script lang="ts">
	import { Button, buttonVariants } from '@/components/ui/button';
	import * as Dialog from '@/components/ui/dialog';
	import type { AddParticipantsSchema } from '@/schema/participant';
	import { Import, Plus } from '@/assets/icons';
	import { type SuperValidated } from 'sveltekit-superforms';
	import ParticipantsForm from './participants-form.svelte';
	import ImportParticipantDialog from './import-participant-dialog.svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { cn } from '@/utils';
	import { ChevronDown } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	interface AddParticipantsDialogProps {
		add_participants_form: SuperValidated<AddParticipantsSchema>;
		event_id: string;
		open_add_participants_dialog?: boolean;
		is_event_finished: boolean;
	}

	let {
		add_participants_form,
		event_id,
		open_add_participants_dialog = $bindable(false),
		is_event_finished
	}: AddParticipantsDialogProps = $props();

	let open_add_excel_participants_dialog = $state(false);
</script>

<Dialog.Root bind:open={open_add_participants_dialog}>
	<div class="flex">
		<Button
			class="rounded-r-none active:scale-100"
			onclick={() => {
				if (is_event_finished) {
					toast.info('Adding participant/s is disabled since the event has concluded');
					return;
				}
				open_add_participants_dialog = true;
			}}
		>
			<Plus class="size-4" />
			Add Participants
		</Button>

		<DropdownMenu.Root>
			<DropdownMenu.Trigger
				class={cn(buttonVariants({ variant: 'default' }), 'rounded-l-none border-l-[1px]')}
				><ChevronDown className="h-4 w-4" />
				<span class="sr-only">Open menu</span>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="end">
				<DropdownMenu.Item
					onclick={() => {
						if (is_event_finished) {
							toast.info('Importing participant/s is disabled since the event has concluded');
							return;
						}
						open_add_excel_participants_dialog = true;
					}}><Import class="size-4" />Import Excel Participants</DropdownMenu.Item
				>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
		<ImportParticipantDialog {event_id} bind:open_add_excel_participants_dialog />
	</div>

	<Dialog.Content class="max-w-[750px]">
		<Dialog.Header>
			<Dialog.Title>Add Participants</Dialog.Title>
			<Dialog.Description>Fill up the form to add participants</Dialog.Description>
		</Dialog.Header>

		<ParticipantsForm
			success_callback={() => (open_add_participants_dialog = false)}
			{add_participants_form}
			{event_id}
		/>
	</Dialog.Content>
</Dialog.Root>
