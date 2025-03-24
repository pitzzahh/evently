<script lang="ts">
	import { buttonVariants } from '@/components/ui/button';
	import * as Dialog from '@/components/ui/dialog';
	import { Camera } from 'lucide-svelte';
	import QrCodeScanner from '@/components/custom/qr-code-scanner/qr-code-scanner.svelte';

	let { handleScan }: { handleScan: (data: string) => void } = $props();
	let dialog_open = $state(false);
</script>

<Dialog.Root open={dialog_open} onOpenChange={(value) => (dialog_open = value)}>
	<Dialog.Trigger
		class={buttonVariants({
			variant: 'outline',
			size: 'sm'
		})}
	>
		<Camera class="size-4" />
		Scan with Camera
	</Dialog.Trigger>
	<Dialog.Content class="min-h-[500px] max-w-[900px]">
		<Dialog.Header>
			<Dialog.Title>Scan Participant</Dialog.Title>
		</Dialog.Header>
		{#if dialog_open}
			<QrCodeScanner onDetect={(data) => handleScan(data)} />
		{/if}
	</Dialog.Content>
</Dialog.Root>
