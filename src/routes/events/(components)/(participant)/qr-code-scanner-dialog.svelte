<script lang="ts">
	import { buttonVariants } from '@/components/ui/button';
	import * as Dialog from '@/components/ui/dialog';
	import { Camera } from 'lucide-svelte';
	import QrCodeScanner from '@/components/custom/qr-code-scanner/qr-code-scanner.svelte';

	let { handleScan }: { handleScan: (data: string) => void } = $props();
</script>

<Dialog.Root>
	<Dialog.Trigger
		class={buttonVariants({ class: 'rounded-lg border px-4 py-3 text-sm', variant: 'outline' })}
	>
		<Camera class="size-4" />
		Scan with Camera
	</Dialog.Trigger>
	<Dialog.Content class="">
		<Dialog.Header>
			<Dialog.Title>Scan Participant</Dialog.Title>
		</Dialog.Header>
		<QrCodeScanner onDetect={(data) => handleScan(data)} />
	</Dialog.Content>
</Dialog.Root>
