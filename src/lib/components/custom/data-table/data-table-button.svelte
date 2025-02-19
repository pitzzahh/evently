<!-- <script lang="ts">
	import { Button, type ButtonVariant } from "@/components/ui/button";
	import * as Tooltip from "@/components/ui/tooltip";
	import { goto } from "$app/navigation";
	import { getState } from "@/stores/index.svelte";
	import { ROUTE_STATE_CTX } from "@/stores/constants";
	import type { RouteState } from "@/stores/types";
	import { ArrowUpRight } from "@/assets/icons";
	import { extractMainRoute } from "@/utils/text";

	interface DataTableButtonProps {
		content: string;
		href: string | undefined;
		variant: ButtonVariant;
		[key: string]: any;
	}

	let {
		content,
		href,
		variant = "default",
		...rest
	}: DataTableButtonProps = $props();
	const route_state = getState<RouteState>(ROUTE_STATE_CTX);
</script>

{#key content}
	<Tooltip.Provider>
		<Tooltip.Root delayDuration={200}>
			<Tooltip.Trigger>
				{#if href}
					<div class="group relative inline-flex items-center">
						<Button
							{variant}
							class="flex items-center px-0"
							onclick={async () => {
								route_state.currentRoute = extractMainRoute(href);
								await goto(href);
							}}
							{...rest}
						>
							{content}
							<ArrowUpRight
								size="1rem"
								class="ml-1 transform opacity-0 transition-all duration-300 ease-in-out group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:opacity-100"
							/>
						</Button>
					</div>
				{:else}
					<Button {variant} {...rest} value={content} />
				{/if}
			</Tooltip.Trigger>
			<Tooltip.Content>
				{#if href}
					Go to {content}
				{:else}
					{content}
				{/if}
			</Tooltip.Content>
		</Tooltip.Root>
	</Tooltip.Provider>
{/key} -->
