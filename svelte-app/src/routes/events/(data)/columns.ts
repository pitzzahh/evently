import type { ColumnDef } from "@tanstack/table-core";
import { renderComponent } from "@/components/ui/data-table/index.js";
import type { EventRecord } from "@/types/pb-types";
import { DataTableCheckbox, DataTableColumnHeader, DataTableBadge } from "@/components/custom/data-table";
import { ArchiveDataTableRowActions, ArchiveDataTableDialog } from "@routes/archives/(components)";

export function archivesTableColumns(): ColumnDef<EventRecord>[] {
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
      accessorKey: "type",
      header: ({ column }) => {
        return renderComponent(DataTableColumnHeader<EventRecord, unknown>, {
          column,
          title: "Type",
        });
      },
      cell: ({ row }) => renderComponent(DataTableBadge, { variant: "outline", value: row.original.type }),
      filterFn: (row, id, value) => {
        return String(row.getValue(id)).toLowerCase().includes(String(value ?? "").toLowerCase());
      }
    }, {
      accessorKey: "reason",
      header: ({ column }) =>
        renderComponent(DataTableColumnHeader<EventRecord, unknown>, { column, title: "Reason" }),
      cell: ({ row }) => row.original.reason,
      filterFn: (row, id, value) => {
        return String(row.getValue(id)).toLowerCase().includes(String(value ?? "").toLowerCase());
      }
    }, {
      accessorKey: "more_info",
      header: ({ column }) =>
        renderComponent(DataTableColumnHeader<EventRecord, unknown>, { column, title: "More Info" }),
      cell: ({ row }) => {
        return renderComponent(ArchiveDataTableDialog, {
          more_info: row.original.more_info,
        });
      },
      filterFn: (row, id, value) => {
        const { grade } = row.getValue(id) as PositionSalaryInfo;
        return grade === value || grade.toLowerCase().includes(value);
      }
    },
    {
      accessorKey: "created_at",
      header: ({ column }) =>
        renderComponent(DataTableColumnHeader<EventRecord, unknown>, { column, title: "Created At" }),
      cell: ({ row }) => renderComponent(DataTableBadge, { variant: "outline", value: row.original.created_at! }),
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
      cell: ({ row }) => renderComponent(ArchiveDataTableRowActions, { row }),
    },
  ]
}