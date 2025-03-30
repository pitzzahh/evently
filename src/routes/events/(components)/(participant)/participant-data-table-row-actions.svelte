<script lang="ts">
	import { Ellipsis, Pencil, View } from '@/assets/icons';
	import { Trash } from 'lucide-svelte';
	import type { Row } from '@tanstack/table-core';
	import * as DropdownMenu from '@/components/ui/dropdown-menu/index.js';
	import Button from '@/components/ui/button/button.svelte';
	import type { EventDetails, Participant } from '@/db/models/types';
	import * as Dialog from '@/components/ui/dialog';
	import EditParticipantForm from './edit-participant-form.svelte';
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { ParticipantSchema } from '@/schema/participant';
	import { COLLECTIONS } from '@/db';
	import ParticipantInfo from './participant-info.svelte';

	let {
		row,
		participant_form,
		event_details
	}: {
		row: Row<Participant>;
		participant_form: SuperValidated<ParticipantSchema>;
		event_details: EventDetails;
	} = $props();

	let comp_state = $state<{
		active_dialog_content: 'view' | 'edit' | 'remove';
		open_dialog: boolean;
	}>({
		active_dialog_content: 'view',
		open_dialog: false
	});

	function handleDeleteParticipant() {
		COLLECTIONS.PARTICIPANT_COLLECTION.removeOne({
			id: row.original.id
		});
		COLLECTIONS.ATTENDANCE_RECORDS_COLLECTION.removeMany({
			participant_id: row.original.id,
			event_id: row.original.event_id
		});
		comp_state.open_dialog = false;
	}
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="ghost" class="data-[state=open]:bg-muted flex h-8 w-8 p-0">
				<Ellipsis />
				<span class="sr-only">Open Menu</span>
			</Button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content class="w-auto" align="end">
		<DropdownMenu.Item
			onclick={() => {
				comp_state.open_dialog = true;
				comp_state.active_dialog_content = 'view';
			}}
		>
			<View />
			View
		</DropdownMenu.Item>
		<DropdownMenu.Item
			onclick={() => {
				comp_state.open_dialog = true;
				comp_state.active_dialog_content = 'edit';
			}}
		>
			<Pencil />
			Edit
		</DropdownMenu.Item>
		<DropdownMenu.Item
			onclick={() => {
				comp_state.open_dialog = true;
				comp_state.active_dialog_content = 'remove';
			}}
			class="text-red-600 hover:!bg-red-600/20 hover:!text-red-600"
		>
			<Trash />
			Remove
		</DropdownMenu.Item>

		<div></div>
	</DropdownMenu.Content>
</DropdownMenu.Root>

<Dialog.Root bind:open={comp_state.open_dialog}>
	{#if comp_state.active_dialog_content === 'view'}
		<Dialog.Content class="max-w-[950px]">
			<Dialog.Header>
				<Dialog.Title>Participant's Information</Dialog.Title>
			</Dialog.Header>
			<ParticipantInfo participant={row.original} {event_details} />
		</Dialog.Content>
	{/if}

	{#if comp_state.active_dialog_content === 'edit'}
		<Dialog.Content class="max-w-[650px]">
			<Dialog.Header>
				<Dialog.Title>Edit Participant's Information</Dialog.Title>
			</Dialog.Header>
			<EditParticipantForm
				{participant_form}
				participant_to_edit={row.original}
				success_callback={() => {
					comp_state.open_dialog = false;
				}}
			/>
		</Dialog.Content>
	{/if}

	{#if comp_state.active_dialog_content === 'remove'}
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Remove Participant</Dialog.Title>
				<Dialog.Description>
					This action cannot be undone. Are you sure you want to permanently delete this
					participant?
				</Dialog.Description>
			</Dialog.Header>
			<Dialog.Footer>
				<Button variant="outline" onclick={() => (comp_state.open_dialog = false)}>Cancel</Button>
				<Button class="bg-red-600 hover:!bg-red-600/80" onclick={handleDeleteParticipant}
					>Delete</Button
				>
			</Dialog.Footer>
		</Dialog.Content>
	{/if}
</Dialog.Root>
