<script lang="ts">
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { participant_schema, type ParticipantSchema } from '@/schema/participant';
	import { type SuperValidated, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { page } from '$app/state';
	import { onMount } from 'svelte';

	let { participant_form, event_id }: { participant_form: SuperValidated<ParticipantSchema>, event_id: string } = $props();
	const form = superForm(participant_form, {
		validators: zodClient(participant_schema)
	});

	const { form: formData, enhance } = form;

    onMount(() => {
        $formData.event_id = event_id
    })

</script>

<form method="POST" use:enhance>
	<Form.Field {form} name="first_name">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>First Name</Form.Label>
				<Input {...props} bind:value={$formData.first_name} />
			{/snippet}
		</Form.Control>

		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="middle_initial">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Middle Initial</Form.Label>
				<Input {...props} bind:value={$formData.middle_initial} />
			{/snippet}
		</Form.Control>

		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="last_name">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Last Name</Form.Label>
				<Input {...props} bind:value={$formData.last_name} />
			{/snippet}
		</Form.Control>

		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="email">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Email</Form.Label>
				<Input {...props} bind:value={$formData.email} />
			{/snippet}
		</Form.Control>

		<Form.FieldErrors />
	</Form.Field>
	<Form.Button>Submit</Form.Button>
</form>
