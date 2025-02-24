<script lang="ts">
  import { X } from "@/assets/icons";
  import type { Table } from "@tanstack/table-core";
  import { Button } from "@/components/ui/button";
  import { ScrollArea } from "@/components//ui/scroll-area";
  import { Input } from "@/components/ui/input/index.js";
  import type { ArchiveDTO } from "@/types/archive";
  import {
    DataTableFacetedFilter,
    DataTableViewOptions,
    DataTableSearchFilter,
  } from "@/components/custom/data-table";
  import type { FilterOption } from "@/types/filter";
  import { onDestroy } from "svelte";
  import { convertToNormalText } from "@/utils/text";

  export interface ArchiveDataTableToolbarProps {
    table: Table<ArchiveDTO>;
    reasons: FilterOption<string>[];
    types: FilterOption<string>[];
  }
  type ComponentState = {
    search: string;
    where_to_search: keyof ArchiveDTO;
    timeout?: Timer;
  };

  let { table, reasons, types }: ArchiveDataTableToolbarProps = $props();

  let comp_state = $state<ComponentState>({
    search: "",
    where_to_search: "reason",
  });
  const is_filtered = $derived(table.getState().columnFilters.length > 0);
  const reason_col = $derived(table.getColumn("reason"));
  const type_col = $derived(table.getColumn("type"));

  onDestroy(() => {
    clearTimeout(comp_state.timeout);
  });
</script>

<ScrollArea orientation="horizontal" class="scrollbar-hide rounded-none">
  <div class="flex items-center justify-between space-x-2 m-1">
    <div class="flex flex-1 items-center space-x-2">
      <Input
        placeholder="Filter position by {convertToNormalText(
          comp_state.where_to_search
        )}..."
        bind:value={() => comp_state.search,
        (v) => {
          clearTimeout(comp_state.timeout);
          comp_state.search = v;
          comp_state.timeout = setTimeout(() => {
            table.getColumn(comp_state.where_to_search)?.setFilterValue(v);
          }, 500);
        }}
        type="search"
        class="h-8 w-[150px] min-w-[300px] lg:w-min"
      />
      <DataTableSearchFilter
        {table}
        bind:where_to_search={comp_state.where_to_search}
      />
      {#if reason_col}
        <DataTableFacetedFilter
          column={reason_col}
          title="Reason"
          options={reasons}
        />
      {/if}
      {#if type_col}
        <DataTableFacetedFilter
          column={type_col}
          title="Type"
          options={types}
        />
      {/if}
      {#if is_filtered}
        <Button
          variant="ghost"
          onclick={() => {
            comp_state.search = "";
            table.resetColumnFilters();
          }}
          class="h-8 px-2 lg:px-3"
        >
          Reset
          <X />
        </Button>
      {/if}
    </div>
    <DataTableViewOptions {table} />
  </div>
</ScrollArea>
