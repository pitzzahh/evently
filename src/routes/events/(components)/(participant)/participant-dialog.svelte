<script lang="ts">
	import { buttonVariants } from '@/components/ui/button';
	import * as Dialog from '@/components/ui/dialog';
	import { View } from '@/assets/icons';
	import { ParticipantDataTable, AddParticipantsDialog } from '..';
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { AddParticipantsSchema } from '@/schema/participant';
	import type { EventDetails, Participant } from '@/db/models/types';
	import { watch } from 'runed';
	import { COLLECTIONS } from '@/db';
	import { TableSkeleton } from '@/components/custom/skeleton';

	interface ParticipantDialogProps {
		add_participants_form: SuperValidated<AddParticipantsSchema>;
		event_details: EventDetails | undefined;
		disable_add_participants?: boolean;
	}

	interface ComponentState {
		participants: Participant[];
	}

	let {
		add_participants_form,
		event_details,
		disable_add_participants = false
	}: ParticipantDialogProps = $props();

	let comp_state = $state<ComponentState>({
		participants: []
	});

	watch(
		[() => COLLECTIONS.PARTICIPANT_COLLECTION.isLoading()],
		() => {
			const participants_cursor = COLLECTIONS.PARTICIPANT_COLLECTION.find(
				{
					event_id: event_details?.id
				},
				{ fieldTracking: true }
			);

			comp_state.participants = participants_cursor.fetch();

			$inspect(comp_state.participants);

			return () => {
				participants_cursor.cleanup();
			};
		},
		{ lazy: true }
	);
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
					<Dialog.Description
						>These are the participants of {event_details?.event_name ?? 'N/A'}</Dialog.Description
					>
				</div>
				<AddParticipantsDialog
					disabled={disable_add_participants}
					{add_participants_form}
					event_id={event_details?.id ?? 'N/A'}
				/>
			</div>
		</Dialog.Header>
		<div class="max-h-[500px] overflow-y-auto">
			{#if COLLECTIONS.PARTICIPANT_COLLECTION.isPulling()}
				<TableSkeleton />
			{:else}
				<ParticipantDataTable participants={comp_state.participants} />
			{/if}
		</div>
	</Dialog.Content>
</Dialog.Root>
