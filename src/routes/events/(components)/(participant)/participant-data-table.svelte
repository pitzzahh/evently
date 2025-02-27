<script lang="ts">
	import { DataTable } from '@/components/custom/data-table';
	import { participantTableColumns } from '@routes/events/(data)/columns';
	import { ParticipantDataTableToolbar } from '..';
	import { generateOptions } from '@/utils/filter';
	import type { Participant } from '@/db/models/types';
	import type { ParticipantSchema } from '@/schema/participant';
	import type { SuperValidated } from 'sveltekit-superforms';

	export interface ParticipantDataTableProps {
		participants: Participant[];
		participant_form: SuperValidated<ParticipantSchema>;
	}

	let { participants, participant_form }: ParticipantDataTableProps = $props();
</script>

<DataTable data={participants} columns={participantTableColumns(participant_form)}>
	{#snippet data_table_toolbar({ table })}
		<ParticipantDataTableToolbar
			{table}
			first_names={generateOptions<Participant>(participants, 'first_name')}
			middle_names={generateOptions<Participant>(
				participants.filter((p) => p.middle_name),
				'middle_name'
			)}
			emails={generateOptions<Participant>(
				participants.filter((p) => p.email),
				'email'
			)}
			last_names={generateOptions<Participant>(participants, 'last_name')}
		/>
	{/snippet}
</DataTable>
