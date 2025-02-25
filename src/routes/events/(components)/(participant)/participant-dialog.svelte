<script lang="ts">
	import { buttonVariants } from '@/components/ui/button';
	import * as Dialog from '@/components/ui/dialog';
	import { View } from '@/assets/icons';
	import { ParticipantDataTable, AddParticipantsDialog } from '..';
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { AddParticipantsSchema } from '@/schema/participant';
	import type { Participant } from '@/db/models/types';
	import { watch } from 'runed';
	import { COLLECTIONS } from '@/db';
	import { TableSkeleton } from '@/components/custom/skeleton';

	interface ComponentState {
		participants: Participant[];
	}

	let {
		add_participants_form
	}: {
		add_participants_form: SuperValidated<AddParticipantsSchema>;
	} = $props();

	let comp_state = $state<ComponentState>({
		participants: []
	});

	watch([() => COLLECTIONS.PARTICIPANT_COLLECTION.isLoading()], () => {
		const participants_cursor = COLLECTIONS.PARTICIPANT_COLLECTION.find(
			{},
			{ fieldTracking: true }
		);

		comp_state.participants = participants_cursor.fetch();

		$inspect(comp_state.participants);

		return () => {
			participants_cursor.cleanup();
		};
	});
</script>

<Dialog.Root>
	<Dialog.Trigger
		class={buttonVariants({ size: 'lg', class: 'rounded-lg border px-4 py-3 text-sm' })}
	>
		View Participants <View class="size-5" />
	</Dialog.Trigger>
	<Dialog.Content class="max-w-[90vw]">
		<Dialog.Header>
			<div class="flex items-center justify-between pr-4">
				<div class="grid gap-2">
					<Dialog.Title>Participants</Dialog.Title>
					<Dialog.Description>These are the participants of Teacher's Seminar</Dialog.Description>
				</div>
				<AddParticipantsDialog {add_participants_form} />
			</div>
		</Dialog.Header>
		{#if COLLECTIONS.PARTICIPANT_COLLECTION.isPulling()}
			<TableSkeleton />
		{:else}
			<ParticipantDataTable participants={comp_state.participants} />
		{/if}
	</Dialog.Content>
</Dialog.Root>
