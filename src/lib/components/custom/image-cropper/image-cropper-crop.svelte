<!--
	jsrepo 1.40.1
	Installed from github/ieedan/shadcn-svelte-extras
	2-25-2025
-->

<script lang="ts">
	import { type ButtonProps, Button } from '@/components/ui/button';
	import type { WithoutChildren } from 'bits-ui';
	import { useImageCropperCrop } from './image-cropper.svelte.js';
	import { Crop } from 'lucide-svelte';

	let {
		variant = 'default',
		size = 'sm',
		...rest
	}: Omit<WithoutChildren<ButtonProps>, 'onclick'> = $props();

	const cropState = useImageCropperCrop();
</script>

<Button {...rest} {size} {variant} onclick={cropState.onclick}>
	<Crop />
	<span>Crop</span>
</Button>
