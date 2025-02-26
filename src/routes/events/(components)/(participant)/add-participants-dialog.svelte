<script lang="ts">
	import { buttonVariants } from '@/components/ui/button';
	import * as Dialog from '@/components/ui/dialog';
	import type { AddParticipantsSchema } from '@/schema/participant';
	import { Plus } from '@/assets/icons';
	import type { SuperValidated } from 'sveltekit-superforms';
	import { ParticipantForm } from '..';

	interface AddParticipantsDialogProps {
		add_participants_form: SuperValidated<AddParticipantsSchema>;
		event_id: string;
		open_add_participants_dialog?: boolean;
	}

	let {
		add_participants_form,
		event_id,
		open_add_participants_dialog = $bindable(false)
	}: AddParticipantsDialogProps = $props();
</script>

<Dialog.Root bind:open={open_add_participants_dialog}>
	<Dialog.Trigger class={buttonVariants({ class: 'rounded-lg border px-4 py-3 text-sm' })}>
		Add Participants <Plus class="size-4" />
	</Dialog.Trigger>
	<Dialog.Content class="max-w-[750px]">
		<Dialog.Header>
			<Dialog.Title>Add Participants</Dialog.Title>
			<Dialog.Description>Fill up the form to add participants</Dialog.Description>
		</Dialog.Header>

		<ParticipantForm
			success_callback={() => (open_add_participants_dialog = false)}
			{add_participants_form}
			{event_id}
		/>
	</Dialog.Content>
</Dialog.Root>
