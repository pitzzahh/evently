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
	import { onMount, tick } from 'svelte';
	import { Button } from '@/components/ui/button';
	import { PlusCircle, Trash, AlertCircle } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { COLLECTIONS } from '@/db';
	import { scale } from 'svelte/transition';
	import { quartInOut } from 'svelte/easing';
	import { generateFullName } from '@/utils/text';
	import { cn } from '@/utils';

	interface ParticipantFormProps {
		add_participants_form: SuperValidated<AddParticipantsSchema>;
		event_id: string;
		success_callback?: () => void;
	}

	let { add_participants_form, event_id, success_callback }: ParticipantFormProps = $props();
	let has_attempted_submit = $state(false);
	let duplicate_indexes = $state<number[]>([]);

	const form = superForm(add_participants_form, {
		SPA: true,
		validators: zodClient(add_participants_schema),
		onUpdate: async ({ form, cancel }) => {
			if (!form.valid) {
				toast.error('Form is invalid');
				return;
			}

			has_attempted_submit = true;
			const internal_duplicates = findDuplicates();
			console.log('Internal Duplicates', internal_duplicates);

			if (internal_duplicates.length > 0) {
				toast.error('There are duplicate participants in the form');
				cancel();
				return;
			}

			for (const [index, participant] of $formData.participants.entries()) {
				const existing_participant = COLLECTIONS.PARTICIPANT_COLLECTION.findOne({
					first_name: participant.first_name,
					middle_name: participant.middle_name,
					last_name: participant.last_name,
					event_id: event_id
				});

				if (existing_participant) {
					const { first_name, middle_name, last_name } = existing_participant;
					toast.error(
						`${generateFullName({ first_name, last_name, middle_name }, { include_last_name: true })} is already existing in the list of event's participants`
					);
			
					duplicate_indexes = [...duplicate_indexes, index];
					cancel();
					return;
				}
			}

			COLLECTIONS.PARTICIPANT_COLLECTION.insertMany(
				$formData.participants.map((p) => ({
					...p,
					event_id: event_id
				}))
			);
			success_callback?.();
			toast.success('Participants added successfully');
			has_attempted_submit = false;
			duplicate_indexes = [];
		}
	});
	const { form: formData, enhance, capture, restore } = form;

	export const snapshot = { capture, restore };

	function findDuplicates(): number[] {
		const duplicates: number[] = [];
		const participant_map = new Map();

		$formData.participants.forEach((participant, index) => {
			// key for comparison
			const key = `${participant.first_name.toLowerCase()}_${participant.middle_name?.toLowerCase() || ''}_${participant.last_name.toLowerCase()}`;

			if (participant_map.has(key)) {
				duplicates.push(index); //current participant
				duplicates.push(participant_map.get(key)); //previous participant that  was used to match to its duplicate
			} else {
				if (participant.first_name && participant.last_name) {
					participant_map.set(key, index);
				}
			}
		});

		duplicate_indexes = [...new Set(duplicates)];
		return duplicate_indexes;
	}

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
		// Wait for DOM update then scroll
		tick().then(() => {
			const lastForm = document.getElementById(($formData.participants.length - 1).toString());
			lastForm?.scrollIntoView({ behavior: 'smooth' });
		});
	}

	function removeParticipant(index: number) {
		if ($formData.participants.length <= 1) {
			return;
		}

		const filteredArray = $formData.participants.filter((_, i) => i !== index);
		$formData.participants = [...filteredArray] as [ParticipantSchema, ...ParticipantSchema[]];
		findDuplicates(); // recheck if there are still duplicates
	}

	onMount(() => {
		addParticipant();
	});

	function checkIsDuplicate(index: number): boolean {
		return duplicate_indexes.includes(index);
	}
</script>

<form method="POST" use:enhance class="grid gap-4">
	<div class="h-auto max-h-[340px] space-y-2 overflow-y-auto">
		{#each $formData.participants, index}
			{@const is_duplicate_item = has_attempted_submit && checkIsDuplicate(index)}

			<div
				id={index.toString()}
				class={cn('rounded-lg border p-4', {
					'border-red-600 ': is_duplicate_item
				})}
				transition:scale={{ duration: 200, easing: quartInOut }}
			>
				<div class="mb-4 flex items-center justify-between">
					<div class="flex items-center gap-2">
						<p class="font-medium">Participant {index + 1}</p>
						{#if is_duplicate_item}
							<div class="flex items-center gap-1 text-xs text-red-600">
								<AlertCircle class="h-4 w-4" />
								<span>Duplicate participant</span>
							</div>
						{/if}
					</div>

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
	</div>
	<Button onclick={addParticipant} variant="outline" class="mt-2 w-full" type="button">
		Add Participant <PlusCircle class="ml-2 h-4 w-4" />
	</Button>
	<Form.Button>Register Participants</Form.Button>
</form>
