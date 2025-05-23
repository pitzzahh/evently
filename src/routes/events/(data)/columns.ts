import type { ColumnDef } from '@tanstack/table-core';
import { renderComponent } from '@/components/ui/data-table/index.js';
import {
	DataTableCheckbox,
	DataTableColumnHeader,
	DataTableBadge
} from '@/components/custom/data-table';
import { ParticipantDataTableRowActions } from '@routes/events/(components)';
import type { EventDetails, Participant, ParticipantAttendance } from '@/db/models/types';
import type { SuperValidated } from 'sveltekit-superforms';
import type { ParticipantSchema } from '@/schema/participant';
import { formatDateToTimeOption } from '@/utils/format';
import TimeInOutCell from '../(components)/(participant)/time-in-out-cell.svelte';
import ParticipantAttendanceDataTableRowActions from '../(components)/(participant)/participant-attendance-data-table-row-actions.svelte';
import { cn } from '@/utils';

export function participantTableColumns(
	participant_form: SuperValidated<ParticipantSchema>,
	event_status: 'upcoming' | 'ongoing' | 'finished',
	event_details: EventDetails
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
			accessorKey: 'attendance_status',
			header: ({ column }) =>
				renderComponent(DataTableColumnHeader<Participant, unknown>, {
					column,
					title: 'Overall Attendance Status'
				}),
			cell: ({ row }) => {
				const attendance_status = row.original.attendance_status;

				if (event_status === 'ongoing')
					return renderComponent(DataTableBadge, {
						variant: 'outline',
						value: 'Event is currently ongoing'
					});
				if (event_status === 'upcoming') {
					return renderComponent(DataTableBadge, {
						variant: 'outline',
						value: `Event hasn't started yet`
					});
				}

				if (attendance_status)
					return renderComponent(DataTableBadge, {
						variant: 'outline',
						className: cn('text-white bg-green-600 hover:bg-green-600/90', {
							'bg-yellow-600 hover:bg-yellow-600/90': attendance_status === 'incomplete',
							'bg-red-600 hover:bg-red-600/90': attendance_status === 'absent'
						}),
						value:
							attendance_status === 'absent'
								? 'Absent'
								: attendance_status === 'complete'
									? 'Complete Attendance'
									: 'Incomplete Attendance'
					});
			},
			filterFn: (row, id, value) => {
				const rowValue = row.getValue(id);
				const searchValues = Array.isArray(value)
					? value.map((v) => String(v).toLowerCase())
					: [String(value ?? '').toLowerCase()];
				if (Array.isArray(rowValue)) {
					return searchValues.some((searchValue) =>
						rowValue.some((dateStr) => dateStr.toLowerCase().includes(searchValue))
					);
				} else {
					const dateStr = String(rowValue).toLowerCase();
					return searchValues.some((searchValue) => dateStr.includes(searchValue));
				}
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
			cell: ({ row }) =>
				renderComponent(ParticipantDataTableRowActions, { participant_form, row, event_details })
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
					time_out: attendance.am_time_out ? formatDateToTimeOption(attendance.am_time_out) : '-:-',
					late_time_in_duration: attendance.late_am_time_in_duration
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
					time_out: attendance.pm_time_out ? formatDateToTimeOption(attendance.pm_time_out) : '-:-',
					late_time_in_duration: attendance.late_pm_time_in_duration
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

			cell: ({ row }) => formatDateToTimeOption(row.original.latest_time_scanned)
		},
		{
			accessorKey: 'day',
			header: ({ column }) =>
				renderComponent(DataTableColumnHeader<ParticipantAttendance, unknown>, {
					column,
					title: 'Event Day',
					class: 'text-xs'
				}),
			cell: ({ row }) => {
				const attendance = row.original;
				return renderComponent(DataTableBadge, {
					value: 'Day ' + attendance.day,
					variant: 'default'
				});
			},
			filterFn: (row, id, value) => {
				const rowValue = row.getValue(id);
				const searchValues = Array.isArray(value)
					? value.map((v) => String(v).toLowerCase())
					: [String(value ?? '').toLowerCase()];
				if (Array.isArray(rowValue)) {
					return searchValues.some((searchValue) =>
						rowValue.some((dateStr) => dateStr.toLowerCase().includes(searchValue))
					);
				} else {
					const dateStr = String(rowValue).toLowerCase();
					return searchValues.some((searchValue) => dateStr.includes(searchValue));
				}
			}
		},
		{
			id: 'actions',
			header: ({ column }) =>
				renderComponent(DataTableColumnHeader<ParticipantAttendance, unknown>, {
					column,
					title: 'Actions',
					class: 'text-xs'
				}),
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
