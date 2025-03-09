import type { ColumnDef } from '@tanstack/table-core';
import { renderComponent } from '@/components/ui/data-table/index.js';
import {
	DataTableCheckbox,
	DataTableColumnHeader,
	DataTableBadge
} from '@/components/custom/data-table';
import { ParticipantDataTableRowActions } from '@routes/events/(components)';
import type { Participant, ParticipantAttendance } from '@/db/models/types';
import type { SuperValidated } from 'sveltekit-superforms';
import type { ParticipantSchema } from '@/schema/participant';
import { formatDateToTimeOption } from '@/utils/format';
import TimeInOutCell from '../(components)/(participant)/time-in-out-cell.svelte';
import ParticipantAttendanceDataTableRowActions from '../(components)/(participant)/participant-attendance-data-table-row-actions.svelte';

export function participantTableColumns(
	participant_form: SuperValidated<ParticipantSchema>
): ColumnDef<Participant>[] {
	return [
		{
			id: 'select',
			header: ({ table }) =>
				renderComponent(DataTableCheckbox, {
					checked: table.getIsAllPageRowsSelected(),
					onCheckedChange: (value) => table.toggleAllPageRowsSelected(!!value),
					'aria-label': 'Select all',
					class: 'translate-y-[2px]'
				}),
			cell: ({ row }) =>
				renderComponent(DataTableCheckbox, {
					checked: row.getIsSelected(),
					onCheckedChange: (value) => row.toggleSelected(!!value),
					'aria-label': 'Select row',
					class: 'translate-y-[2px]'
				}),
			enableSorting: false,
			enableHiding: false
		},
		{
			accessorKey: 'first_name',
			header: ({ column }) => {
				return renderComponent(DataTableColumnHeader<Participant, unknown>, {
					column,
					title: 'First Name'
				});
			},
			cell: ({ row }) => row.original.first_name,
			filterFn: (row, id, value) => {
				return String(row.getValue(id))
					.toLowerCase()
					.includes(String(value ?? '').toLowerCase());
			}
		},
		{
			accessorKey: 'middle_name',
			header: ({ column }) =>
				renderComponent(DataTableColumnHeader<Participant, unknown>, {
					column,
					title: 'Middle Name'
				}),
			cell: ({ row }) => {
				return (
					row.original.middle_name ||
					renderComponent(DataTableBadge, {
						variant: 'outline',
						value: 'None'
					})
				);
			},
			filterFn: (row, id, value) => {
				return String(row.getValue(id))
					.toLowerCase()
					.includes(String(value ?? '').toLowerCase());
			}
		},
		{
			accessorKey: 'last_name',
			header: ({ column }) =>
				renderComponent(DataTableColumnHeader<Participant, unknown>, {
					column,
					title: 'Last Name'
				}),
			cell: ({ row }) => row.original.last_name,
			filterFn: (row, id, value) => {
				return String(row.getValue(id))
					.toLowerCase()
					.includes(String(value ?? '').toLowerCase());
			}
		},
		{
			accessorKey: 'email',
			header: ({ column }) =>
				renderComponent(DataTableColumnHeader<Participant, unknown>, { column, title: 'Email' }),
			cell: ({ row }) => row.original.email,
			filterFn: (row, id, value) => {
				return String(row.getValue(id))
					.toLowerCase()
					.includes(String(value ?? '').toLowerCase());
			}
		},
		{
			id: 'actions',
			header: () => 'Actions',
			cell: ({ row }) => renderComponent(ParticipantDataTableRowActions, { participant_form, row })
		}
	];
}

export function participantAttendanceColumns(): ColumnDef<ParticipantAttendance>[] {
	return [
		{
			accessorKey: 'first_name',
			header: ({ column }) => {
				return renderComponent(DataTableColumnHeader<ParticipantAttendance, unknown>, {
					column,
					title: 'First Name'
				});
			},
			cell: ({ row }) => row.original.first_name,
			filterFn: (row, id, value) => {
				return String(row.getValue(id))
					.toLowerCase()
					.includes(String(value ?? '').toLowerCase());
			}
		},
		{
			accessorKey: 'middle_name',
			header: ({ column }) =>
				renderComponent(DataTableColumnHeader<ParticipantAttendance, unknown>, {
					column,
					title: 'Middle Name'
				}),
			cell: ({ row }) => {
				return (
					row.original.middle_name ||
					renderComponent(DataTableBadge, {
						variant: 'outline',
						value: 'None'
					})
				);
			},
			filterFn: (row, id, value) => {
				return String(row.getValue(id))
					.toLowerCase()
					.includes(String(value ?? '').toLowerCase());
			}
		},
		{
			accessorKey: 'last_name',
			header: ({ column }) =>
				renderComponent(DataTableColumnHeader<ParticipantAttendance, unknown>, {
					column,
					title: 'Last Name'
				}),
			cell: ({ row }) => row.original.last_name,
			filterFn: (row, id, value) => {
				return String(row.getValue(id))
					.toLowerCase()
					.includes(String(value ?? '').toLowerCase());
			}
		},
		{
			id: 'am',
			header: ({ column }) =>
				renderComponent(DataTableColumnHeader<ParticipantAttendance, unknown>, {
					column,
					title: 'AM Time',
					class: 'text-xs'
				}),
			cell: ({ row }) => {
				const attendance = row.original;

				return renderComponent(TimeInOutCell, {
					time_in: attendance.am_time_in ? formatDateToTimeOption(attendance.am_time_in) : '-:-',
					time_out: attendance.am_time_out ? formatDateToTimeOption(attendance.am_time_out) : '-:-'
				});
			}
		},

		{
			id: 'pm',
			header: ({ column }) =>
				renderComponent(DataTableColumnHeader<ParticipantAttendance, unknown>, {
					column,
					title: 'PM Time',
					class: 'text-xs'
				}),
			cell: ({ row }) => {
				const attendance = row.original;

				return renderComponent(TimeInOutCell, {
					time_in: attendance.pm_time_in ? formatDateToTimeOption(attendance.pm_time_in) : '-:-',
					time_out: attendance.pm_time_out ? formatDateToTimeOption(attendance.pm_time_out) : '-:-'
				});
			}
		},
		{
			accessorKey: 'latest_time_scanned',
			header: ({ column }) =>
				renderComponent(DataTableColumnHeader<ParticipantAttendance, unknown>, {
					column,
					title: 'Latest Time Scanned'
				}),

			cell: ({ row }) => formatDateToTimeOption(row.original.latest_time_scanned),
			filterFn: (row, id, value) => {
				return String(row.getValue(id))
					.toLowerCase()
					.includes(String(value ?? '').toLowerCase());
			}
		},
		{
			id: 'actions',
			header: () => 'Actions',
			cell: ({ row }) => {
				const original = row.original;
				return renderComponent(ParticipantAttendanceDataTableRowActions, {
					am_time_in: original.am_time_in,
					am_time_out: original.am_time_out,
					pm_time_in: original.pm_time_in,
					pm_time_out: original.pm_time_out,
					current_event_date: original.created as Date,
					attendance_id: original.id
				});
			}
		}
	];
}
