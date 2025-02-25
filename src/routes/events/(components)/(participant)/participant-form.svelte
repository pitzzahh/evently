<script lang="ts">
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import {
		add_participants_schema,
		type AddParticipantsSchema,
		type ParticipantSchema
	} from '@/schema/participant';
	import { type SuperValidated, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { onMount } from 'svelte';
	import { Button } from '@/components/ui/button';
	import { PlusCircle, Trash } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { COLLECTIONS } from '@/db';
	import { scale } from 'svelte/transition';
	import { quartInOut } from 'svelte/easing';

	interface ParticipantFormProps {
		add_participants_form: SuperValidated<AddParticipantsSchema>;
		event_id: string;
		success_callback?: () => void;
	}

	let {
		add_participants_form,
		event_id,
		success_callback
	}: ParticipantFormProps = $props();
	const form = superForm(add_participants_form, {
		SPA: true,
		validators: zodClient(add_participants_schema),
		onUpdate: async ({ form, cancel }) => {
			// toast the values
			if (!form.valid) {
				toast.error('Form is invalid');
				cancel();
				return;
			}

			COLLECTIONS.PARTICIPANT_COLLECTION.insertMany(
				$formData.participants.map((p) => ({
					...p,
					event_id: event_id
				}))
			);
			success_callback?.();
			toast.success('Participants added successfully');
		}
	});
	const { form: formData, enhance, capture, restore } = form;

	export const snapshot = { capture, restore };

	function addParticipant() {
		$formData.participants = [
			...$formData.participants,
			{
				first_name: '',
				last_name: '',
				middle_name: '',
				email: '',
				event_id: event_id || ''
			}
		];
	}

	function removeParticipant(index: number) {
		// Early return if trying to remove when only one entry exists
		if ($formData.participants.length <= 1) {
			return;
		}

		// Create new array with filtered elements
		const filteredArray = $formData.participants.filter((_, i) => i !== index);

		// Type assertion to ensure the array meets the tuple constraint
		$formData.participants = [...filteredArray] as [ParticipantSchema, ...ParticipantSchema[]];
	}

	onMount(() => {
		addParticipant();
	});
</script>

<div class="max-h-[500px] overflow-y-auto">
	<form method="POST" use:enhance class="grid gap-4">
		{#each $formData.participants, index}
			<div class="rounded-lg border p-4" transition:scale={{ duration: 200, easing: quartInOut }}>
				<div class="mb-4 flex items-center justify-between">
					<p class="font-medium">Participant {index + 1}</p>
					{#if $formData.participants.length > 1}
						<Button
							variant="outline"
							onclick={() => removeParticipant(index)}
							class="self-end"
							size="icon"
							type="button"
							aria-label="Remove participant"
						>
							<Trash class="h-4 w-4" />
						</Button>
					{/if}
				</div>

				<div class="grid gap-2 md:grid-cols-2">
					<Form.Field {form} name={`participants[${index}].first_name`}>
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>First Name</Form.Label>
								<Input
									{...props}
									placeholder="Enter first name"
									bind:value={$formData.participants[index].first_name}
								/>
							{/snippet}
						</Form.Control>

						<Form.FieldErrors />
					</Form.Field>
					<Form.Field {form} name={`participants[${index}].middle_name`}>
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Middle Name</Form.Label>
								<Input
									{...props}
									placeholder="Enter middle name"
									bind:value={$formData.participants[index].middle_name}
								/>
							{/snippet}
						</Form.Control>

						<Form.FieldErrors />
					</Form.Field>
					<Form.Field {form} name={`participants[${index}].last_name`}>
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Last Name</Form.Label>
								<Input
									{...props}
									placeholder="Enter last name"
									bind:value={$formData.participants[index].last_name}
								/>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>

					<Form.Field {form} name={`participants[${index}].email`}>
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Email</Form.Label>
								<Input
									{...props}
									type="email"
									placeholder="email@example.com"
									bind:value={$formData.participants[index].email}
								/>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
				</div>
			</div>
		{/each}

		<Button onclick={addParticipant} variant="outline" class="self-end" type="button">
			Add Participant <PlusCircle class="ml-2 h-4 w-4" />
		</Button>
		<Form.Button class="self-end">Register Participants</Form.Button>
	</form>
</div>
