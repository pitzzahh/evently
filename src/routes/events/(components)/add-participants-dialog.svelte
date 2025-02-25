<script lang="ts">
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import type { AddParticipantsSchema, ParticipantSchema } from '@/schema/participant';
	import { Plus } from 'lucide-svelte';
	import type { SuperValidated } from 'sveltekit-superforms';
	import ParticipantForm from './participant-form.svelte';

	let {
		add_participants_form
	}: {
		add_participants_form: SuperValidated<AddParticipantsSchema>;
	} = $props();
</script>

<Dialog.Root>
	<Dialog.Trigger class={buttonVariants({ class: 'rounded-lg border px-4 py-3 text-sm' })}>
		Add Participants <Plus class="size-4" />
	</Dialog.Trigger>
	<Dialog.Content class="max-w-[750px]">
		<Dialog.Header>
			<Dialog.Title>Add Participants</Dialog.Title>
			<Dialog.Description>Fill up the form to add participants</Dialog.Description>
		</Dialog.Header>

		<ParticipantForm {add_participants_form} />
	</Dialog.Content>
</Dialog.Root>
