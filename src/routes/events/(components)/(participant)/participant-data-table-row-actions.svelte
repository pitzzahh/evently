<script lang="ts">
  import { Copy, Ellipsis, Pencil, View } from "@/assets/icons";
  import type { Row } from "@tanstack/table-core";
  import * as DropdownMenu from "@/components/ui/dropdown-menu/index.js";
  import Button from "@/components/ui/button/button.svelte";
  import type { ArchiveDTO } from "@/types/archive";
  import { goto } from "$app/navigation";
  import { recursiveDropdown } from "@/components/custom/snippets";

  let { row }: { row: Row<ArchiveDTO> } = $props();
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger>
    {#snippet child({ props })}
      <Button
        {...props}
        variant="ghost"
        class="data-[state=open]:bg-muted flex h-8 w-8 p-0"
      >
        <Ellipsis />
        <span class="sr-only">Open Menu</span>
      </Button>
    {/snippet}
  </DropdownMenu.Trigger>
  <DropdownMenu.Content class="w-auto" align="end">
    {@const current_archive = row.original}
    <DropdownMenu.Separator />
    <DropdownMenu.Sub>
      <DropdownMenu.SubTrigger>
        <Copy />
        Copy</DropdownMenu.SubTrigger
      >
      <DropdownMenu.SubContent class="w-auto">
        {#each Object.entries(current_archive) as [key, value]}
          {@render recursiveDropdown({ value, key })}
        {/each}
      </DropdownMenu.SubContent>
    </DropdownMenu.Sub>
    <DropdownMenu.Item
      onclick={() => goto(`/archives/${current_archive.id}?edit=true`)}
      ><Pencil /> Edit {current_archive.type}</DropdownMenu.Item
    >
    <DropdownMenu.Item onclick={() => goto(`/archives/${current_archive.id}`)}
      ><View /> View {current_archive.reason}</DropdownMenu.Item
    >
    <DropdownMenu.Separator />
    <DropdownMenu.Separator />
  </DropdownMenu.Content>
</DropdownMenu.Root>
