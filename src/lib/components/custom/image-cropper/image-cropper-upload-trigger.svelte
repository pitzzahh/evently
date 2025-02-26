<!--
	jsrepo 1.40.1
	Installed from github/ieedan/shadcn-svelte-extras
	2-25-2025
-->

<script lang="ts">
	import { type WithChildren } from 'bits-ui';
	import { useImageCropperTrigger } from './image-cropper.svelte.js';

	let { children }: WithChildren = $props();

	const triggerState = useImageCropperTrigger();
</script>

<label for={triggerState.rootState.id} class="hover:cursor-pointer">
	{@render children?.()}
</label>
