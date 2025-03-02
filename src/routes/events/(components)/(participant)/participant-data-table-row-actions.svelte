<script lang="ts">
	import { Copy, Ellipsis, Pencil, View } from '@/assets/icons';
	import { Trash } from 'lucide-svelte';
	import type { Row } from '@tanstack/table-core';
	import * as DropdownMenu from '@/components/ui/dropdown-menu/index.js';
	import Button from '@/components/ui/button/button.svelte';
	import type { Participant } from '@/db/models/types';
	import * as Dialog from '@/components/ui/dialog';
	import EditParticipantForm from './edit-participant-form.svelte';
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { ParticipantSchema } from '@/schema/participant';
	import QR from '@svelte-put/qr/img/QR.svelte';
	import ImgQR from '@svelte-put/qr/img/QR.svelte';
	import { COLLECTIONS } from '@/db';

	let {
		row,
		participant_form
	}: { row: Row<Participant>; participant_form: SuperValidated<ParticipantSchema> } = $props();
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

	let barcode = $state('');
	let timeout = $state(0);

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			event.preventDefault();
			event.stopPropagation();
			barcode = '';
			return;
		}

		if (timeout) clearTimeout(timeout);

		barcode = event.key;

		timeout = setTimeout(() => {
			barcode = '';
		}, 500);
	}

	$effect(() => {
		window.addEventListener('keydown', handleKeydown);

		return () => {
			window.removeEventListener('keydown', handleKeydown);
		};
	});

	function handleDeleteParticipant() {
		COLLECTIONS.PARTICIPANT_COLLECTION.removeOne({
			id: row.original.id
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
		<Dialog.Content class="max-w-[650px]">
			<Dialog.Header>
				<Dialog.Title>Participant's Information</Dialog.Title>
				<QR
					data={row.original.id}
					logoRatio={107 / 128}
					shape="circle"
					backgroundFill="white"
					margin={4}
					width="600"
					height="600"
				>
					{#snippet img({ src })}
						<img {src} alt="qr" class="size-[200px]" />
					{/snippet}
				</QR>
				<p>{barcode}</p>
			</Dialog.Header>
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
