<script lang="ts">
	import { DataTable } from '@/components/custom/data-table';
	import { participantTableColumns } from '@routes/events/(data)/columns';
	import { ParticipantDataTableToolbar } from '..';
	import { generateOptions } from '@/utils/filter';
	import type { Participant } from '@/db/models/types';

	export interface ParticipantDataTableProps {
		participants: Participant[];
	}

	let { participants }: ParticipantDataTableProps = $props();
</script>

<DataTable data={participants} columns={participantTableColumns()}>
	{#snippet data_table_toolbar({ table })}
		<ParticipantDataTableToolbar
			{table}
			first_names={generateOptions<Participant>(participants, 'first_name')}
			middle_initials={generateOptions<Participant>(
				participants.filter((p) => p.middle_initial),
				'middle_initial'
			)}
			emails={generateOptions<Participant>(
				participants.filter((p) => p.email),
				'email'
			)}
			last_names={generateOptions<Participant>(participants, 'last_name')}
		/>
	{/snippet}
</DataTable>
