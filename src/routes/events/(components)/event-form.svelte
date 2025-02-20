<script module lang="ts">
	interface Props {
		event_form: SuperValidated<EventSchema>;
	}
</script>

<script lang="ts">
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Switch } from '@/components/ui/switch';
	import Textarea from '@/components/ui/textarea/textarea.svelte';
	import { eventSchema, type EventSchema } from '@/schema/event';
	import { Circle, Dot, MapPin, Ticket } from 'lucide-svelte';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';

	let { event_form }: Props = $props();

	const form = superForm(event_form, {
		SPA: true,
		validators: zodClient(eventSchema)
	});

	const { form: formData, enhance } = form;
</script>

<form method="POST" use:enhance class="flex flex-col gap-1">
	<Form.Field {form} name="title">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label class="flex items-center gap-1"><Ticket class="size-4" /> Event Name</Form.Label
				>
				<Input
					{...props}
					class="bg-gray-700/10 dark:bg-white/10"
					bind:value={$formData.title}
					placeholder="Enter a clear, descriptive name (e.g., '2024 Annual Teachers Conference')"
					aria-label="Event name"
				/>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="description" class="w-full">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label class="flex items-center gap-1"><MapPin class="size-4" />Location</Form.Label>
				<Input
					{...props}
					class="w-full bg-gray-700/10 dark:bg-white/10"
					bind:value={$formData.location}
					placeholder="Physical address"
					aria-label="Event location"
				/>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="description">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Description</Form.Label>
				<Textarea
					{...props}
					bind:value={$formData.description}
					rows={5}
					class="bg-gray-700/10 dark:bg-white/10"
					placeholder="Provide details about the event, including agenda, speakers, or any special requirements"
					aria-label="Event description"
				/>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="description">
		<Form.Control>
			{#snippet children({ props })}
				<div class="flex justify-between">
					<Form.Label>Time</Form.Label>
					<Form.Field {form} name="is_multi_day_event" >
						<Form.Control>
							{#snippet children({ props })}
								<div class="flex items-center gap-2">
									<Form.Label class="flex items-center gap-1">Multi-day Event</Form.Label>
									<Switch {...props} bind:checked={$formData.is_multi_day_event} />
								</div>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
				</div>
				<div class="flex w-full gap-4">
					<div
						class="flex w-full items-center gap-2 rounded-lg bg-gray-700/10 p-4 dark:bg-white/10"
					>
						<div class="flex flex-col items-center gap-1">
							<div class="size-3 rounded-full border bg-gray-400"></div>
							<div class="h-6 border-s-2 border-dashed border-gray-400"></div>
							<div class="size-3 rounded-full border border-gray-400"></div>
						</div>

						<div class="flex w-full flex-col gap-1">
							<!-- START -->
							<div class="flex items-center justify-between">
								<p class="text-sm text-muted-foreground">Start</p>
								<div class="flex items-center gap-1">
									<p class="rounded-bl-sm rounded-tl-sm bg-background p-2 text-sm">Thu, Feb 20</p>
									<p class="rounded-br-sm rounded-tr-sm bg-background p-2 text-sm">12:30 PM</p>
								</div>
							</div>

							<!-- END -->
							<div class="flex items-center justify-between">
								<p class="text-sm text-muted-foreground">End</p>
								<div class="flex items-center gap-1">
									<p class="rounded-bl-sm rounded-tl-sm bg-background p-2 text-sm">Thu, Feb 20</p>
									<p class="rounded-br-sm rounded-tr-sm bg-background p-2 text-sm">12:30 PM</p>
								</div>
							</div>
						</div>
					</div>
					<div
						class="flex w-full items-center gap-2 rounded-lg bg-gray-700/10 p-4 dark:bg-white/10"
					>
						<div class="flex flex-col items-center gap-1">
							<div class="size-3 rounded-full border bg-gray-400"></div>
							<div class="h-6 border-s-2 border-dashed border-gray-400"></div>
							<div class="size-3 rounded-full border border-gray-400"></div>
						</div>

						<div class="flex w-full flex-col gap-1">
							<!-- START -->
							<div class="flex items-center justify-between">
								<p class="text-sm text-muted-foreground">Start</p>
								<div class="flex items-center gap-1">
									<p class="rounded-bl-sm rounded-tl-sm bg-background p-2 text-sm">Thu, Feb 20</p>
									<p class="rounded-br-sm rounded-tr-sm bg-background p-2 text-sm">12:30 PM</p>
								</div>
							</div>

							<!-- END -->
							<div class="flex items-center justify-between">
								<p class="text-sm text-muted-foreground">End</p>
								<div class="flex items-center gap-1">
									<p class="rounded-bl-sm rounded-tl-sm bg-background p-2 text-sm">Thu, Feb 20</p>
									<p class="rounded-br-sm rounded-tr-sm bg-background p-2 text-sm">12:30 PM</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Button>Submit</Form.Button>
</form>
