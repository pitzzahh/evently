<script lang="ts">
	import { DataTable } from '@/components/custom/data-table';
	import { participantAttendanceColumns } from '@routes/events/(data)/columns';
	import type { ParticipantAttendance } from '@/db/models/types';

	import ParticipantAttendanceDataTableToolbar from './participant-attendance-data-table-toolbar.svelte';

	export interface TimeInTimeOutDataTableProps {
		participants_attendance: ParticipantAttendance[];
		event_days?: number;
	}

	let { participants_attendance, event_days }: TimeInTimeOutDataTableProps = $props();
</script>

<DataTable data={participants_attendance} columns={participantAttendanceColumns()}>
	{#snippet data_table_toolbar({ table })}
		<ParticipantAttendanceDataTableToolbar
			{table}
			days_opt={event_days
				? Array.from({ length: event_days }, (_, i) => ({
						label: 'Day ' + (i + 1),
						value: (i + 1).toString()
					}))
				: []}
		/>
	{/snippet}
</DataTable>
