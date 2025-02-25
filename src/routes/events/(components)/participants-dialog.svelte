<script lang="ts">
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { View } from 'lucide-svelte';
	import AttendeesDataTable from './attendees-data-table.svelte';
	import AddParticipantsDialog from './add-participants-dialog.svelte';
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { AddParticipantsSchema, ParticipantSchema } from '@/schema/participant';

	let {
		add_participants_form
	}: {
		add_participants_form: SuperValidated<AddParticipantsSchema>;
	} = $props();
</script>

<Dialog.Root>
	<Dialog.Trigger
		class={buttonVariants({ size: 'lg', class: 'rounded-lg border px-4 py-3 text-sm' })}
	>
		View Participants <View class="size-5" />
	</Dialog.Trigger>
	<Dialog.Content class="max-w-[90vw]">
		<Dialog.Header>
			<div class="flex items-center justify-between">
				<div class="grid gap-2">
					<Dialog.Title>Participants</Dialog.Title>
					<Dialog.Description>These are the participants of Teacher's Seminar</Dialog.Description>
				</div>
				<AddParticipantsDialog {add_participants_form} />
			</div>
		</Dialog.Header>
		<AttendeesDataTable />
	</Dialog.Content>
</Dialog.Root>
