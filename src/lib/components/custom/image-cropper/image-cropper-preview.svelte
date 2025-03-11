<!--
	jsrepo 1.40.1
	Installed from github/ieedan/shadcn-svelte-extras
	2-25-2025
-->

<script lang="ts">
	import * as Avatar from '@/components/ui/avatar';
	import type { ImageCropperPreviewProps } from './types';
	import { useImageCropperPreview } from './image-cropper.svelte.js';
	import { Upload } from 'lucide-svelte';
	import { cn } from '@/utils/styles';

	let { child, class: className }: ImageCropperPreviewProps = $props();

	const previewState = useImageCropperPreview();

	const uploadIconSize = $derived(() => {
		const classStr = typeof className === 'string' ? className : '';
		const match = classStr.match(/size-(\d+)/);
		return classStr.includes('size-') && match ? match[1] : 4;
	});
</script>

{#if child}
	{@render child({ src: previewState.rootState.src })}
{:else}
	<Avatar.Root
		class={cn('size-20 ring-2 ring-accent ring-offset-2 ring-offset-background', className)}
	>
		<Avatar.Fallback class={className}>
			<Upload class={`size-${uploadIconSize}`} />
			<span class="sr-only">Upload image</span>
		</Avatar.Fallback>
	</Avatar.Root>
{/if}
