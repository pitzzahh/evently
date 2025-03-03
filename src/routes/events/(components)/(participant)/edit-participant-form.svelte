<script lang="ts">
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { participant_schema, type ParticipantSchema } from '@/schema/participant';
	import { type SuperValidated, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { toast } from 'svelte-sonner';
	import type { Participant } from '@/db/models/types';
	import { COLLECTIONS } from '@/db';

	interface ParticipantFormProps {
		participant_to_edit?: Participant;
		participant_form: SuperValidated<ParticipantSchema>;
		success_callback: () => void;
	}

	let { participant_form, participant_to_edit, success_callback }: ParticipantFormProps = $props();
	const form = superForm(participant_form, {
		SPA: true,
		validators: zodClient(participant_schema),
		onUpdate: async ({ form }) => {
			if (!form.valid) {
				toast.error('Form is invalid');
				return;
			}

			if (!participant_to_edit) {
				return;
			}

			COLLECTIONS.PARTICIPANT_COLLECTION.updateOne(
				{ id: participant_to_edit.id },
				{ $set: form.data }
			);

			success_callback();
		}
	});
	const { form: formData, enhance, capture, restore } = form;

	$effect(() => {
		if (participant_to_edit) {
			$formData.email = participant_to_edit.email as string;
			$formData.first_name = participant_to_edit.first_name;
			$formData.middle_name = participant_to_edit.middle_name;
			$formData.last_name = participant_to_edit.last_name;
			$formData.event_id = participant_to_edit.event_id;
		}
	});

	export const snapshot = { capture, restore };
</script>

<form method="POST" use:enhance class="grid gap-4">
	<div class="grid gap-2 md:grid-cols-2">
		<Form.Field {form} name="first_name">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>First Name</Form.Label>
					<Input {...props} placeholder="Enter first name" bind:value={$formData.first_name} />
				{/snippet}
			</Form.Control>

			<Form.FieldErrors />
		</Form.Field>
		<Form.Field {form} name="middle_name">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Middle Name</Form.Label>
					<Input {...props} placeholder="Enter middle name" bind:value={$formData.middle_name} />
				{/snippet}
			</Form.Control>

			<Form.FieldErrors />
		</Form.Field>
		<Form.Field {form} name="last_name">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Last Name</Form.Label>
					<Input {...props} placeholder="Enter last name" bind:value={$formData.last_name} />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<Form.Field {form} name="email">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Email</Form.Label>
					<Input
						{...props}
						type="email"
						placeholder="email@example.com"
						bind:value={$formData.email}
					/>
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
	</div>

	<Form.Button>Update Participant</Form.Button>
</form>
