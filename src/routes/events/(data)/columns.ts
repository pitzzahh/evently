import type { ColumnDef } from "@tanstack/table-core";
import { renderComponent } from "@/components/ui/data-table/index.js";
import { DataTableCheckbox, DataTableColumnHeader, DataTableBadge } from "@/components/custom/data-table";
import { ParticipantDataTableRowActions } from "@routes/events/(components)";
import type { Participant } from "@/db/models/types";
import { formatDateTime } from "@/utils/format";

export function participantTableColumns(): ColumnDef<Participant>[] {
  return [
    {
      id: "select",
      header: ({ table }) =>
        renderComponent(DataTableCheckbox, {
          checked: table.getIsAllPageRowsSelected(),
          onCheckedChange: (value) => table.toggleAllPageRowsSelected(!!value),
          "aria-label": "Select all",
          class: "translate-y-[2px]",
        }),
      cell: ({ row }) =>
        renderComponent(DataTableCheckbox, {
          checked: row.getIsSelected(),
          onCheckedChange: (value) => row.toggleSelected(!!value),
          "aria-label": "Select row",
          class: "translate-y-[2px]",
        }),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "first_name",
      header: ({ column }) => {
        return renderComponent(DataTableColumnHeader<Participant, unknown>, {
          column,
          title: "First Name",
        });
      },
      cell: ({ row }) => renderComponent(DataTableBadge, { variant: "outline", value: row.original.first_name }),
      filterFn: (row, id, value) => {
        return String(row.getValue(id)).toLowerCase().includes(String(value ?? "").toLowerCase());
      }
    }, {
      accessorKey: "middle_initial",
      header: ({ column }) =>
        renderComponent(DataTableColumnHeader<Participant, unknown>, { column, title: "Middle Name" }),
      cell: ({ row }) => row.original.middle_initial,
      filterFn: (row, id, value) => {
        return String(row.getValue(id)).toLowerCase().includes(String(value ?? "").toLowerCase());
      }
    },
    {
      accessorKey: "last_name",
      header: ({ column }) =>
        renderComponent(DataTableColumnHeader<Participant, unknown>, { column, title: "Last Name" }),
      cell: ({ row }) => row.original.last_name,
      filterFn: (row, id, value) => {
        return String(row.getValue(id)).toLowerCase().includes(String(value ?? "").toLowerCase());
      }
    },
    {
      accessorKey: "created",
      header: ({ column }) =>
        renderComponent(DataTableColumnHeader<Participant, unknown>, { column, title: "Created At" }),
      cell: ({ row }) => renderComponent(DataTableBadge, { variant: "outline", value: formatDateTime(row.original.created) }),
      filterFn: (row, id, value) => {
        const date = new Date(row.getValue(id));
        const searchValue = value.toLowerCase();
        const dateStr = date.toLocaleDateString();
        const timeStr = date.toLocaleTimeString();
        const fullStr = date.toString().toLowerCase();
        return dateStr.includes(searchValue) ||
          timeStr.includes(searchValue) ||
          fullStr.includes(searchValue);
      }
    },
    {
      id: "actions",
      cell: ({ row }) => renderComponent(ParticipantDataTableRowActions, { row }),
    },
  ]
}