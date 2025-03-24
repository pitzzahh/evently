<script lang="ts">
	import { browser } from "$app/environment";
	import { page } from "$app/stores";
	import { Button } from "@/components/ui/button";
	import { cn } from "@/utils";

	interface Props {
		title?: string;
		description?: string;
		return_to?: string;
		with_return_button?: boolean;
		title_size?: string;
		description_size?: string;
		icon_size?: string;
		centered?: boolean;
	}

	let {
		title = `${$page.status}: ${$page.error?.message}`,
		description = "Oops! Something went wrong. Please try again later.",
		return_to = browser ? document.referrer : "/dashboard",
		with_return_button = true,
		title_size = "text-4xl",
		description_size = "text-lg",
		icon_size = "w-64",
		centered = true,
	}: Props = $props();
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

<div
	class={cn("flex flex-col items-center justify-center space-y-6", {
		"h-[calc(100vh-8rem)]": centered,
	})}
>
	<div class="text-center">
		<h1 class="text-red-900 mb-4 font-bold {title_size}">{title}</h1>
		<p class="{description_size} text-gray-700">{description}</p>
		logo
	</div>
	{#if with_return_button}
		<Button
			class="text-white"
			href={return_to}>Go Back</Button
		>
	{/if}
</div>