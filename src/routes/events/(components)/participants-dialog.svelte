<script lang="ts">
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { View } from 'lucide-svelte';
	import AttendeesDataTable from './attendees-data-table.svelte';
</script>

<Dialog.Root>
	<Dialog.Trigger
		class={buttonVariants({ size: 'lg', class: 'rounded-lg border px-4 py-3 text-sm' })}
	>
		View Participants <View class="size-5" />
	</Dialog.Trigger>
	<Dialog.Content class="max-w-[90vw]">
		<Dialog.Header>
			<Dialog.Title>Participants</Dialog.Title>
			<Dialog.Description>These are the participants of Teacher's Seminar</Dialog.Description>
		</Dialog.Header>
		<AttendeesDataTable />
		<!-- <Dialog.Footer>
			<Button type="submit">Save changes</Button>
		</Dialog.Footer> -->
	</Dialog.Content>
</Dialog.Root>
