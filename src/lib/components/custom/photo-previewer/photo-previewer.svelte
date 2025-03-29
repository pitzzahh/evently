<script module lang="ts">
	export type PhotoPreviewerType = {
		image_src?: string;
		class?: string;
	};
</script>

<script lang="ts">
	import { scale } from 'svelte/transition';
	import * as Avatar from '@/components/ui/avatar';
	import { Image, X } from 'lucide-svelte';
	import { cn } from '@/utils';

	let { image_src, class: className }: PhotoPreviewerType = $props();
	let isPreviewOpen = $state(false);

	function openPreview() {
		isPreviewOpen = true;
	}

	function closePreview() {
		isPreviewOpen = false;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') closePreview();
	}

	function handleModalClick(event: MouseEvent) {
		// Close the modal only if the click is outside the image
		if ((event.target as HTMLElement).classList.contains('modal')) {
			closePreview();
		}
	}
</script>

<svelte:document onkeydown={handleKeydown} />

<!-- Clickable Image -->
<Avatar.Root
	class={cn(
		'ring-accent ring-offset-background aspect-square size-[200px] rounded-md ring-2 ring-offset-2 lg:size-[240px]',
		className
	)}
>
	<Avatar.Image
		src={image_src}
		onclick={openPreview}
		class="cursor-pointer transition-all duration-500 ease-in-out hover:scale-110"
	/>
	<Avatar.Fallback class="aspect-square size-[200px] rounded-md lg:size-[240px]">
		<Image class="text-muted-foreground size-16 opacity-50" />
	</Avatar.Fallback>
</Avatar.Root>

<!-- Modal Preview -->
{#if isPreviewOpen}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div class="modal" onclick={handleModalClick}>
		<div class="modal-content">
			<img src={image_src} alt="Enlarged" transition:scale={{ duration: 100 }} />
			<button class="close-button absolute -top-10 -right-10" onclick={closePreview}>
				<X class="size-6" />
			</button>
		</div>
	</div>
{/if}

<style>
	.modal {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.7);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 50;
	}

	.modal-content {
		position: relative;
	}

	.modal img {
		max-width: 600px;
		max-height: 90%;
		border-radius: 12px;
	}

	.close-button {
		background: rgba(0, 0, 0, 0.5);
		border: none;
		color: white;
		padding: 8px;
		border-radius: 50%;
		cursor: pointer;
		transition: background-color 0.3s ease;
	}

	.close-button:hover {
		background: rgba(0, 0, 0, 0.8);
	}
</style>
