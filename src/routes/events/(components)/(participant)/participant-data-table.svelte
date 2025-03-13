<script lang="ts">
	import { DataTable } from '@/components/custom/data-table';
	import { participantTableColumns } from '@routes/events/(data)/columns';
	import { ParticipantDataTableToolbar } from '..';
	import { generateOptions } from '@/utils/filter';
	import type { Participant } from '@/db/models/types';
	import type { ParticipantSchema } from '@/schema/participant';
	import type { SuperValidated } from 'sveltekit-superforms';
	import ParticipantFloatingBar from './participant-floating-bar.svelte';

	export interface ParticipantDataTableProps {
		participants: Participant[];
		participant_form: SuperValidated<ParticipantSchema>;
		event_status: 'finished' | 'ongoing' | 'upcoming';
	}

	let { participants, participant_form, event_status }: ParticipantDataTableProps = $props();
</script>

<DataTable data={participants} columns={participantTableColumns(participant_form, event_status)}>
	{#snippet data_table_toolbar({ table })}
		<ParticipantDataTableToolbar {table} />
	{/snippet}

	{#snippet floating_bar({ table })}
		<ParticipantFloatingBar {table} />
	{/snippet}
</DataTable>
