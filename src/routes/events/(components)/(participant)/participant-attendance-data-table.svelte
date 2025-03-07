<script lang="ts">
	import { DataTable } from '@/components/custom/data-table';
	import { participantAttendanceColumns } from '@routes/events/(data)/columns';
	import { ParticipantDataTableToolbar } from '..';
	import { generateOptions } from '@/utils/filter';
	import type { ParticipantAttendance } from '@/db/models/types';
	import type { ParticipantSchema } from '@/schema/participant';
	import type { SuperValidated } from 'sveltekit-superforms';

	export interface TimeInTimeOutDataTableProps {
		participants_attendance: ParticipantAttendance[];
	}

	let { participants_attendance }: TimeInTimeOutDataTableProps = $props();
</script>

<DataTable data={participants_attendance} columns={participantAttendanceColumns()}>
	<!-- {#snippet data_table_toolbar({ table })}
        <ParticipantDataTableToolbar
            {table} 
            first_names={generateOptions<ParticipantAttendance>(participants, 'first_name')}
            middle_names={generateOptions<ParticipantAttendance>(
                participants.filter((p) => p.middle_name),
                'middle_name'
            )}
            emails={generateOptions<ParticipantAttendance>(
                participants.filter((p) => p.email),
                'email'
            )}
            last_names={generateOptions<ParticipantAttendance>(participants, 'last_name')}
        />
    {/snippet} -->
</DataTable>
