<script lang="ts">
	import { DataTable } from '@/components/custom/data-table';
	// import type { ArchiveDTO } from '@/types/archive';
	// import { archivesTableColumns } from '@routes/archives/(data)/columns';
	// import { ArchiveDataTableToolbar } from '.';
	// import { generateOptions } from '@/utils/filter';

	// export interface ArchiveDataTableProps {
	// 	archives: ArchiveDTO[];
	// }

	// let { archives }: ArchiveDataTableProps = $props();
	import { type ColumnDef } from '@tanstack/table-core';

	interface Attendee {
		id: string;
		name: string;
		email: string;
		registeredAt: Date;
		status: 'confirmed' | 'pending' | 'cancelled';
	}

	export const attendeesTableColumns: ColumnDef<Attendee>[] = [
		{
			accessorKey: 'name',
			header: 'Name'
		},
		{
			accessorKey: 'email',
			header: 'Email'
		},
		
		{
			accessorKey: 'registeredAt',
			header: 'Registered At'
		},
		{
			accessorKey: 'status',
			header: 'Status'
		}
	];
</script>

<DataTable data={[]} columns={attendeesTableColumns}>
	<!-- {#snippet data_table_toolbar({ table })}
		<ArchiveDataTableToolbar
			{table}
			types={generateOptions<ArchiveDTO>(archives, 'type')}
			reasons={generateOptions<ArchiveDTO>(archives, 'reason')}
		/>
	{/snippet} -->
</DataTable>
