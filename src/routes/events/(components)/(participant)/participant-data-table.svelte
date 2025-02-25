<script lang="ts">
  import { DataTable } from "@/components/custom/data-table";
  import type { ArchiveDTO } from "@/types/archive";
  import { archivesTableColumns } from "@routes/archives/(data)/columns";
  import { ArchiveDataTableToolbar } from ".";
  import { generateOptions } from "@/utils/filter";

  export interface ArchiveDataTableProps {
    archives: ArchiveDTO[];
  }

  let { archives }: ArchiveDataTableProps = $props();
</script>

<DataTable data={archives} columns={archivesTableColumns()}>
  {#snippet data_table_toolbar({ table })}
    <ArchiveDataTableToolbar
      {table}
      types={generateOptions<ArchiveDTO>(archives, "type")}
      reasons={generateOptions<ArchiveDTO>(archives, "reason")}
    />
  {/snippet}
</DataTable>