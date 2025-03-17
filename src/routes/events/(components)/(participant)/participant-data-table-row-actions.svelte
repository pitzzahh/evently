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
	let comp_state = $state({
		edit_open: false,
		remove_open: false,
		view_open: false
	});

	function handleOnOpenChange(value: boolean) {
		if (comp_state.edit_open) {
			comp_state.edit_open = value;
		} else if (comp_state.remove_open) {
			comp_state.remove_open = value;
		} else {
			comp_state.view_open = value;
		}
	}

	function handleDeleteParticipant() {
		COLLECTIONS.PARTICIPANT_COLLECTION.removeOne({
			id: row.original.id
		});
		COLLECTIONS.ATTENDANCE_RECORDS_COLLECTION.removeMany({
			participant_id: row.original.id,
			event_id: row.original.event_id
		});
		comp_state.remove_open = false;
	}
</script>

<Dialog.Dialog
	open={comp_state.edit_open || comp_state.remove_open || comp_state.view_open}
	onOpenChange={handleOnOpenChange}
>
	<DropdownMenu.Root>
		<DropdownMenu.Trigger>
			{#snippet child({ props })}
				<Button {...props} variant="ghost" class="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
					<Ellipsis />
					<span class="sr-only">Open Menu</span>
				</Button>
			{/snippet}
		</DropdownMenu.Trigger>
		<DropdownMenu.Content class="w-auto" align="end">
			<DropdownMenu.Item onclick={() => (comp_state.view_open = true)}>
				<View />
				View
			</DropdownMenu.Item>

			<DropdownMenu.Item onclick={() => (comp_state.edit_open = true)}>
				<Pencil />
				Edit
			</DropdownMenu.Item>

			<DropdownMenu.Item
				onclick={() => (comp_state.remove_open = true)}
				class="text-red-600 hover:!bg-red-600/20 hover:!text-red-600"
			>
				<Trash />
				Remove
			</DropdownMenu.Item>

			<div></div>
		</DropdownMenu.Content>
	</DropdownMenu.Root>

	{#if comp_state.view_open}
		<Dialog.Content class="max-w-[950px]">
			<Dialog.Header>
				<Dialog.Title>Participant's Information</Dialog.Title>
			</Dialog.Header>
			<ParticipantInfo participant={row.original} {event_details} />
		</Dialog.Content>
	{/if}

	{#if comp_state.edit_open}
		<Dialog.Content class="max-w-[650px]">
			<Dialog.Header>
				<Dialog.Title>Edit Participant's Information</Dialog.Title>
			</Dialog.Header>
			<EditParticipantForm
				{participant_form}
				participant_to_edit={row.original}
				success_callback={() => {
					handleOnOpenChange(false);
				}}
			/>
		</Dialog.Content>
	{/if}

	{#if comp_state.remove_open}
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Remove Participant</Dialog.Title>
				<Dialog.Description>
					This action cannot be undone. Are you sure you want to permanently delete this
					participant?
				</Dialog.Description>
			</Dialog.Header>
			<Dialog.Footer>
				<Button class="bg-red-600 hover:!bg-red-600/80" onclick={handleDeleteParticipant}
					>Delete</Button
				>
				<Button variant="outline" onclick={() => (comp_state.remove_open = false)}>Cancel</Button>
			</Dialog.Footer>
		</Dialog.Content>
	{/if}
</Dialog.Dialog>
