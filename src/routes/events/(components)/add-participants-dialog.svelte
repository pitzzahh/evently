<script lang="ts">
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Plus } from 'lucide-svelte';
</script>

<Dialog.Root>
	<Dialog.Trigger class={buttonVariants({ class: 'rounded-lg border px-4 py-3 text-sm' })}>
		Add Participants <Plus class="size-4" />
	</Dialog.Trigger>
	<Dialog.Content class="max-w-[70vw]">
		<Dialog.Header>
			<Dialog.Title>Add Participants</Dialog.Title>
			<Dialog.Description>Fill up the form to add participants</Dialog.Description>
		</Dialog.Header>
	</Dialog.Content>
</Dialog.Root>
