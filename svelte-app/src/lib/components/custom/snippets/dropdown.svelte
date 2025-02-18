<script module lang="ts">
	import * as DropdownMenu from "@/components/ui/dropdown-menu/index.js";
	import { isObject } from "@/utils/validation";
	import { toast } from "svelte-sonner";
	import { Copy } from "@/assets/icons";

	interface DropDownSnippetProps {
		value: any;
		key: string;
		options?: {
			excludedTypes?: any[];
		};
	}

	async function handleCopy({ value, key }: DropDownSnippetProps) {
		try {
			await navigator.clipboard.writeText(value);
			toast.success(`Copied ${key} to clipboard.`);
		} catch (error) {
			toast.error(`Failed to copy ${key} to clipboard. Please try again.`);
		}
	}

	export { recursiveDropdown };
</script>

{#snippet recursiveDropdown({ value, key, options }: DropDownSnippetProps)}
	{#if isObject(value, options?.excludedTypes)}
		<DropdownMenu.Sub>
			<DropdownMenu.SubTrigger><Copy /> {key}</DropdownMenu.SubTrigger>
			<DropdownMenu.SubContent class="w-auto max-w-sm">
				{#each Object.entries(value) as [subkey, subvalue]}
					{#if isObject(subvalue, options?.excludedTypes)}
						{@render recursiveDropdown({ value: subvalue, key: subkey })}
					{:else}
						<DropdownMenu.Item
							class="truncate max-w-xs"
							onclick={() => handleCopy({ value: subvalue, key: subkey })}
						>
							<Copy />
							{String(subkey)}
						</DropdownMenu.Item>
					{/if}
				{/each}
			</DropdownMenu.SubContent>
		</DropdownMenu.Sub>
	{:else}
		<DropdownMenu.Item
			class="truncate max-w-sm"
			onclick={() => handleCopy({ value, key })}
		>
			<Copy />
			{String(key)}
		</DropdownMenu.Item>
	{/if}
{/snippet}
